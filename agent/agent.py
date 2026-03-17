#!/usr/bin/env python3
import os
import time
from datetime import datetime, timezone

import psutil
import requests

METRICS_API_URL = os.getenv("METRICS_API_URL", "http://localhost:3000/api/metrics")
LOGS_API_URL = os.getenv("LOGS_API_URL", "http://localhost:3000/api/logs")
PROJECT_ID = os.getenv("PROJECT_ID", "")
SERVER_ID = os.getenv("SERVER_ID", "")
AGENT_KEY = os.getenv("AGENT_KEY", "")
INTERVAL_SECONDS = int(os.getenv("AGENT_INTERVAL_SECONDS", "15"))
NETWORK_SCALE = float(os.getenv("NETWORK_SCALE", "1024"))
_LAST_NETWORK_TOTAL = None


def collect_metrics() -> dict:
    global _LAST_NETWORK_TOTAL
    net = psutil.net_io_counters()
    current_total = float(net.bytes_sent + net.bytes_recv) if net else 0.0
    if _LAST_NETWORK_TOTAL is None:
        network_delta = 0.0
    else:
        network_delta = max(0.0, current_total - _LAST_NETWORK_TOTAL)
    _LAST_NETWORK_TOTAL = current_total
    network = network_delta / NETWORK_SCALE
    return {
        "projectId": PROJECT_ID,
        "serverId": SERVER_ID,
        "cpu": round(psutil.cpu_percent(interval=None), 2),
        "memory": round(float(psutil.virtual_memory().percent), 2),
        "disk": round(float(psutil.disk_usage("/").percent), 2),
        "network": round(network, 2),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


def emit_log(level: str, message: str) -> None:
    payload = {
        "projectId": PROJECT_ID,
        "serverId": SERVER_ID,
        "level": level,
        "message": message,
        "source": "python-agent",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    headers = {"Authorization": f"Bearer {AGENT_KEY}"} if AGENT_KEY else {}
    try:
        requests.post(LOGS_API_URL, json=payload, headers=headers, timeout=5)
    except Exception:
        pass


def main() -> None:
    if not AGENT_KEY and (not PROJECT_ID or not SERVER_ID):
        raise SystemExit("Either AGENT_KEY OR both PROJECT_ID and SERVER_ID must be provided")

    headers = {"Authorization": f"Bearer {AGENT_KEY}"} if AGENT_KEY else {}

    print(f"[agent] sending metrics to {METRICS_API_URL} every {INTERVAL_SECONDS}s")
    emit_log("info", "agent_started")

    while True:
        payload = collect_metrics()
        try:
            response = requests.post(METRICS_API_URL, json=payload, headers=headers, timeout=8)
            print(
                f"[agent] {response.status_code} cpu={payload['cpu']} memory={payload['memory']} disk={payload['disk']}"
            )
            if response.status_code >= 400:
                emit_log("error", f"metric_send_failed status={response.status_code}")
        except Exception as error:  # noqa: BLE001
            print(f"[agent] send failed: {error}")
            emit_log("error", f"metric_send_exception error={error}")
        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
