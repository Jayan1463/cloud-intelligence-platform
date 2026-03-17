import { createAlert, hasRecentOpenAlert, resolveOpenAlertsByTypes } from "@/lib/database/alerts";
import { getRecentMetrics } from "@/lib/database/metrics";
import { listServers, updateServerStatus } from "@/lib/database/servers";
import { sendEmailAlert } from "@/lib/alerts/email";
import { sendSlackAlert } from "@/lib/alerts/slack";
import type { AlertItem, AlertThresholds } from "@/types/alerts";
import type { MetricSample } from "@/types/metrics";
import { detectNetworkAnomaly } from "@/lib/metrics/anomaly";
import { createIncidentFromAlert } from "@/lib/platform/services/incidents";

export type AlertEvaluationInput = {
  organizationId: string;
  projectId: string;
  serverId: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: string;
};

const DEFAULT_THRESHOLDS: AlertThresholds = {
  cpuHigh: 90,
  memoryHigh: 95,
  diskHigh: 92,
  networkSpikePct: 60,
  dedupeWindowMinutes: 15
};

function buildAlerts(sample: MetricSample, thresholds: AlertThresholds, networkSpike: boolean): AlertItem[] {
  const alerts: AlertItem[] = [];
  const disk = sample.disk ?? 0;
  const network = sample.network ?? 0;

  if (sample.cpu >= thresholds.cpuHigh) {
    alerts.push({
      type: "cpu",
      severity: sample.cpu >= 97 ? "critical" : "high",
      message: `CPU usage is ${sample.cpu.toFixed(1)}%`
    });
  }

  if (sample.memory >= thresholds.memoryHigh) {
    alerts.push({
      type: "memory",
      severity: sample.memory >= 98 ? "critical" : "high",
      message: `Memory usage is ${sample.memory.toFixed(1)}%`
    });
  }

  if (disk >= thresholds.diskHigh) {
    alerts.push({
      type: "disk",
      severity: disk >= 97 ? "critical" : "medium",
      message: `Disk usage is ${disk.toFixed(1)}%`
    });
  }

  if (networkSpike) {
    alerts.push({
      type: "network",
      severity: "medium",
      message: `Network traffic spike detected (${network.toFixed(1)} units)`
    });
  }

  return alerts;
}

function isConsecutiveBreach(values: number[], threshold: number, needed: number): boolean {
  if (values.length < needed) return false;
  return values.slice(-needed).every((value) => value >= threshold);
}

export async function evaluateAndDispatchAlerts(input: AlertEvaluationInput): Promise<{ triggered: number; alerts: AlertItem[] }> {
  const sample: MetricSample = {
    serverId: input.serverId,
    projectId: input.projectId,
    cpu: input.cpu,
    memory: input.memory,
    disk: input.disk,
    network: input.network,
    timestamp: input.timestamp
  };

  const recent = await getRecentMetrics({ projectId: input.projectId, serverId: input.serverId, limit: 40 });
  const cpuValues = recent.map((m) => Number(m.cpu));
  const memoryValues = recent.map((m) => Number(m.memory));
  const diskValues = recent.map((m) => Number(m.disk));
  const baseline = recent.length ? recent.reduce((sum, m) => sum + m.network, 0) / recent.length : 0;
  const syntheticSample: MetricSample = {
    projectId: input.projectId,
    cpu: input.cpu,
    memory: input.memory,
    networkIn: input.network,
    networkOut: baseline
  };
  const networkSpikeNow = detectNetworkAnomaly(syntheticSample, Math.max(80, baseline * 1.6));
  const prevSample = recent.length >= 2 ? recent[recent.length - 2] : null;
  const prevNetworkHigh = prevSample ? Number(prevSample.network) >= Math.max(60, baseline * 1.25) : false;
  const networkSpike = networkSpikeNow && prevNetworkHigh;

  const pending = buildAlerts(sample, DEFAULT_THRESHOLDS, networkSpike).filter((alert) => {
    if (alert.type === "cpu") return isConsecutiveBreach(cpuValues, DEFAULT_THRESHOLDS.cpuHigh, 3);
    if (alert.type === "memory") return isConsecutiveBreach(memoryValues, DEFAULT_THRESHOLDS.memoryHigh, 3);
    if (alert.type === "disk") return isConsecutiveBreach(diskValues, DEFAULT_THRESHOLDS.diskHigh, 3);
    return true;
  });
  const pendingTypes = new Set(pending.map((alert) => alert.type));
  const recoveredTypes = (["cpu", "memory", "disk", "network"] as const).filter((type) => !pendingTypes.has(type));
  await resolveOpenAlertsByTypes({
    projectId: input.projectId,
    serverId: input.serverId,
    types: recoveredTypes as Array<"cpu" | "memory" | "disk" | "network" | "server_down">
  });

  const dedupeSince = new Date(Date.now() - DEFAULT_THRESHOLDS.dedupeWindowMinutes * 60 * 1000).toISOString();

  const triggered: AlertItem[] = [];

  for (const alert of pending) {
    const exists = await hasRecentOpenAlert({
      projectId: input.projectId,
      serverId: input.serverId,
      type: alert.type,
      sinceIso: dedupeSince
    });

    if (exists) continue;

    const created = await createAlert({
      organizationId: input.organizationId,
      projectId: input.projectId,
      serverId: input.serverId,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      triggeredAt: input.timestamp
    });

    await createIncidentFromAlert({
      orgId: input.organizationId,
      projectId: input.projectId,
      alertId: created.id,
      title: alert.message,
      severity: alert.severity,
      serverId: input.serverId,
      alertType: alert.type
    });

    const text = `Alert (${alert.severity.toUpperCase()}): ${alert.message} | project=${input.projectId} server=${input.serverId}`;

    await Promise.allSettled([
      sendEmailAlert({
        to: process.env.ALERT_EMAIL_TO ?? "ops@example.com",
        subject: `[Cloud Intelligence] ${alert.type.toUpperCase()} alert`,
        text: text
      }),
      sendSlackAlert(process.env.SLACK_WEBHOOK_URL ?? "", text)
    ]);

    triggered.push(alert);
  }

  return { triggered: triggered.length, alerts: triggered };
}

export async function evaluateProjectAlertsFromRecentMetrics(params: {
  organizationId: string;
  projectId: string;
  limit?: number;
}): Promise<{ evaluated: number; triggered: number }> {
  const recent = await getRecentMetrics({
    projectId: params.projectId,
    limit: params.limit ?? 200
  });

  if (!recent.length) {
    return { evaluated: 0, triggered: 0 };
  }

  const latestByServer = new Map<string, (typeof recent)[number]>();
  for (const sample of recent) {
    latestByServer.set(sample.server_id, sample);
  }

  let triggered = 0;
  for (const sample of latestByServer.values()) {
    const result = await evaluateAndDispatchAlerts({
      organizationId: params.organizationId,
      projectId: params.projectId,
      serverId: sample.server_id,
      cpu: Number(sample.cpu),
      memory: Number(sample.memory),
      disk: Number(sample.disk),
      network: Number(sample.network),
      timestamp: sample.timestamp
    });
    triggered += result.triggered;
  }

  return { evaluated: latestByServer.size, triggered };
}

export async function evaluateServerHeartbeatAlerts(params: {
  organizationId: string;
  projectId: string;
  timeoutSeconds?: number;
}): Promise<{ evaluated: number; triggered: number; recovered: number }> {
  const timeoutSeconds = Math.max(30, params.timeoutSeconds ?? Number(process.env.SERVER_HEARTBEAT_TIMEOUT_SECONDS ?? "90"));
  const now = Date.now();
  const servers = await listServers(params.projectId);

  let triggered = 0;
  let recovered = 0;

  for (const server of servers) {
    const lastSeen = Date.parse(server.last_metric_at ?? server.created_at);
    const stale = Number.isFinite(lastSeen) ? (now - lastSeen) / 1000 > timeoutSeconds : true;

    if (stale) {
      await updateServerStatus(server.id, "down");
      const dedupeSince = new Date(now - timeoutSeconds * 1000 * 3).toISOString();
      const exists = await hasRecentOpenAlert({
        projectId: server.project_id,
        serverId: server.id,
        type: "server_down",
        sinceIso: dedupeSince
      });
      if (!exists) {
        const ageSeconds = Number.isFinite(lastSeen) ? Math.floor((now - lastSeen) / 1000) : timeoutSeconds;
        const created = await createAlert({
          organizationId: params.organizationId,
          projectId: server.project_id,
          serverId: server.id,
          type: "server_down",
          severity: "critical",
          message: `Server ${server.name} is down (heartbeat missing for ${ageSeconds}s)`,
          triggeredAt: new Date().toISOString()
        });
        await createIncidentFromAlert({
          orgId: params.organizationId,
          projectId: server.project_id,
          alertId: created.id,
          title: `Server down: ${server.name}`,
          severity: "critical",
          serverId: server.id,
          alertType: "server_down"
        });
        triggered += 1;
      }
      continue;
    }

    const resolved = await resolveOpenAlertsByTypes({
      projectId: server.project_id,
      serverId: server.id,
      types: ["server_down"]
    });
    if (resolved > 0) {
      recovered += resolved;
      if (server.status === "down") {
        await updateServerStatus(server.id, "healthy");
      }
    }
  }

  return { evaluated: servers.length, triggered, recovered };
}
