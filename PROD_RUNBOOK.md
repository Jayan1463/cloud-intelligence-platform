# QuantumOps Production Runbook

## 1. Scope
This runbook covers production operations for the existing observability SaaS platform:
- Next.js App Router + TypeScript frontend/API
- Firebase Admin + Firestore datastore
- Python metrics/logs agent
- Alerting, incidents, tracing, realtime SSE, SLO, synthetic checks

Goals:
- Reliable ingestion and alerting
- Clear on-call procedures
- Safe multi-tenant operation
- Predictable cost/performance

---

## 2. Core Architecture
Data flow:
1. Agent sends metrics/logs with `Bearer AGENT_KEY`.
2. API validates auth + tenant scope.
3. Metrics are persisted and evaluated by alert engine.
4. Alerts are correlated into incidents.
5. Traces/spans are written for API observability.
6. UI consumes APIs + SSE snapshots (`/api/realtime`).

Primary collections:
- `organizations`, `users`, `projects`, `servers`
- `metrics`, `metric_queue`, `metric_rollups`
- `logs`, `alerts`, `incidents`, `deployments`, `audit_logs`
- `traces`, `spans`, `api_keys`, `rate_limits`
- `slo_definitions`, `slo_windows`, `synthetic_checks`, `background_jobs`

---

## 3. Environment Variables
Minimum required:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (with `\n` escaped)

Recommended production:
- `SERVER_HEARTBEAT_TIMEOUT_SECONDS=90`
- `METRIC_RETENTION_DAYS=30`
- `LOG_RETENTION_DAYS=14`
- `ALERT_EMAIL_TO=ops@yourdomain.com`
- `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...`

Security:
- Never commit secrets.
- Rotate service account key immediately if exposed.
- Rotate org API keys quarterly or on incident.

---

## 4. Firestore Index Plan
Create/verify indexes for high-frequency queries:

1. `metrics`
- `project_id ASC, timestamp DESC`
- `server_id ASC, timestamp DESC`
- `project_id ASC, server_id ASC, timestamp DESC`

2. `alerts`
- `project_id ASC, triggered_at DESC`
- `project_id ASC, server_id ASC, type ASC, status ASC, triggered_at DESC`

3. `incidents`
- `project_id ASC, updated_at DESC`
- `project_id ASC, status ASC, updated_at DESC`

4. `logs`
- `project_id ASC, timestamp DESC`
- `project_id ASC, server_id ASC, timestamp DESC`
- `project_id ASC, level ASC, timestamp DESC`

5. `servers`
- `project_id ASC, updated_at DESC`
- `agent_key ASC` (single-field indexed by default; ensure not exempted)

6. `traces`
- `project_id ASC, updated_at DESC`

7. `synthetic_checks`
- `project_id ASC, created_at DESC`

---

## 5. Job Scheduling (Cron)
Use Vercel Cron or external scheduler to hit APIs.

### Every 1 minute
- `POST /api/jobs/run`
Purpose:
- Alert reevaluation
- Heartbeat/server-down checks
- Cost anomaly updates

### Every 15 minutes
- `POST /api/synthetic` for each configured critical endpoint
Payload example:
```json
{ "projectId": "<project-id>", "url": "https://api.yourdomain.com/health" }
```

### Every 6 hours
- `POST /api/data/optimize`
Purpose:
- Retention pruning
- Downsampling old metrics to rollups

### Daily at 00:10 UTC
- Full integrity probe:
1. Query active alerts volume
2. Query unresolved incidents volume
3. Validate synthetic check pass rate
4. Validate storage growth trend

---

## 6. SLO/SLA Thresholds
Suggested initial definitions:

1. API Availability SLO
- Target: 99.9% monthly
- SLI: successful synthetic probes / total probes
- Burn alert:
  - Warning: burn rate > 2 for 1h
  - Critical: burn rate > 4 for 15m

2. Ingestion Latency SLO
- Target: 99% of metric events processed < 30s
- SLI: metric ingest timestamp vs availability in query endpoint

3. Alerting Freshness SLO
- Target: 99% threshold breaches produce alerts < 60s

4. Incident Response SLO
- Target MTTA:
  - Critical < 5m
  - High < 15m

5. Data API SLA (external v1)
- 99.9% monthly availability
- P95 latency < 500ms

---

## 7. Alert Policy Defaults
Current production intent:
- CPU high: >= 90% sustained over 3 samples
- Memory high: >= 95% sustained over 3 samples
- Disk high: >= 92% sustained over 3 samples
- Server down: heartbeat missing > `SERVER_HEARTBEAT_TIMEOUT_SECONDS`
- Dedupe window: 15 minutes
- Auto-resolve when recovery detected

Severity mapping:
- `critical`: server_down, CPU >= 97, memory >= 98
- `high`: sustained CPU/memory breach
- `medium`: disk/network anomalies

---

## 8. Agent Rollout Procedure
For each server:
1. Register server from platform UI/API.
2. Copy `agent_key`.
3. Install agent deps:
```bash
cd agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
4. Run:
```bash
export METRICS_API_URL="https://<your-domain>/api/metrics"
export LOGS_API_URL="https://<your-domain>/api/logs"
export AGENT_KEY="<agent-key>"
export AGENT_INTERVAL_SECONDS=15
python agent.py
```
5. Verify:
- `/api/servers/[serverId]` shows `telemetry.connected=true`
- Dashboard charts update
- Alerts only on sustained thresholds

---

## 9. API Key + Rate Limit Ops
Create key:
- `POST /api/keys` (admin)

Use key:
- Send `x-api-key` header to `/api/v1/*` routes.

Rate limit behavior:
- Minute bucket per key in `rate_limits`.
- If exceeded, requests are rejected.

Operational guidance:
- Start with 120 req/min per org key.
- Increase only for vetted integrations.
- Keep separate keys by service/team.

---

## 10. Incident Response Playbook
### P1 (Critical)
Triggers:
- server_down on production core service
- synthetic check failures across regions

Actions:
1. Acknowledge alert.
2. Assign incident owner.
3. Check traces + recent error logs + deployment timeline.
4. Mitigate (rollback/restart/traffic shift).
5. Mark resolved with root cause note.

### P2 (High)
Triggers:
- sustained CPU/memory saturation
- log error bursts

Actions:
1. Investigate correlated incident.
2. Scale service or remove hot path.
3. Add guardrails (autoscaling/rate limits/cache).

Post-incident:
- Add timeline note.
- Add prevention task.
- Update SLO or alert threshold if needed.

---

## 11. End-to-End Validation Checklist
Run before each production release:

1. Build and type check
```bash
npm run build
```

2. Auth + RBAC
- admin/developer/viewer route protection

3. Metrics path
- agent -> `/api/metrics` -> dashboard

4. Alert path
- induced threshold breach -> alert created -> incident created

5. Recovery path
- normalize metric -> alert auto-resolves

6. Logs path
- ingest logs -> search filters -> error burst correlation

7. Tracing path
- provide `x-trace-id` -> trace + span stored

8. Realtime path
- dashboard/infra updates via `/api/realtime` without page refresh

9. Data optimization
- run `/api/data/optimize` and confirm rollups/pruning

10. Synthetic path
- run `/api/synthetic` success and failure scenarios

---

## 12. Deployment Steps
1. Set production env vars in deployment platform.
2. Deploy Next.js app.
3. Verify Firestore indexes are created and ready.
4. Configure cron jobs (section 5).
5. Create first org API keys.
6. Register servers and run agents.
7. Execute end-to-end checklist (section 11).
8. Announce production readiness.

Rollback strategy:
- Revert to previous deployment.
- Keep Firestore data; no destructive migration required for this release.

---

## 13. Capacity and Scaling Notes
- SSE endpoint fanout: monitor concurrent client count.
- Firestore read pressure: favor rollups for older periods.
- Job fanout: shard large orgs by project in scheduler.
- For heavy load, split workers into:
  - alert worker
  - retention/downsample worker
  - synthetic probe worker

---

## 14. Known Follow-Ups
- Add dedicated worker runtime (queue-driven) instead of API-triggered jobs.
- Add richer trace UI view in workspace.
- Add stronger statistical anomaly models per metric family.
- Add multi-region synthetic probes.

