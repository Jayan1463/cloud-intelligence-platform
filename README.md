# Cloud Intelligence Platform

Production-grade multi-tenant cloud observability SaaS built on Next.js + Firebase/Firestore.

## Architecture

Frontend (Next.js UI) -> API Routes (Gateway) -> Services (auth/RBAC/alerts/incidents/logs/deployments/audit) -> Metrics Queue/Processor -> Firestore -> Analytics/Cost/Health -> Notifications (Email/Slack/Webhooks)

## Implemented Features

- Multi-tenant organizations with strict org scoping
- Roles: `admin`, `developer`, `viewer`
- Production auth: signup/login, bcrypt password hashing, JWT session cookies
- Projects + servers + agent key provisioning
- Monitoring agent ingestion every 10-15s (`/api/metrics`)
- Metrics queue + processor persistence pipeline
- Real-time dashboards via polling existing metrics APIs
- Alert engine with rule-based checks + incident auto-creation
- Log ingestion + search/filter API (`/api/logs`)
- Dynamic infrastructure topology API (`/api/projects/[projectId]/topology`)
- Cost intelligence (compute/storage/network + trends)
- Deployment tracking (`/api/deployments`)
- Audit logs (`/api/audit`)
- Public status page (`/status/[org]`, `/api/status/[org]`)
- Versioned API access:
  - `GET /api/v1/projects`
  - `GET /api/v1/metrics`
  - `GET /api/v1/logs`
  - `GET/POST /api/v1/alerts`
- Retention policy job utilities (`lib/platform/retention/jobs.ts`)
- Auto-discovery simulation (`/api/discovery`)
- Analytics/anomaly/performance insights (`lib/platform/analytics/*`)
- Unified notification service (`lib/platform/notifications/service.ts`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env.local
```

3. Run app:

```bash
npm run dev
```

## Firebase Requirements

- Create Firestore database in native mode
- Add credentials via env (`FIREBASE_*`) or `GOOGLE_APPLICATION_CREDENTIALS`
- Configure recommended indexes from `firebase/schema.md`

## Agent

Directory: `agent/`

1. Install agent deps:

```bash
cd agent
pip install -r requirements.txt
```

2. Run agent (recommended: with `AGENT_KEY`):

```bash
AGENT_KEY=<server_agent_key> METRICS_API_URL=http://localhost:3000/api/metrics LOGS_API_URL=http://localhost:3000/api/logs AGENT_INTERVAL_SECONDS=15 python agent.py
```

Legacy mode also works with `PROJECT_ID` and `SERVER_ID`.

## Deployment

### Vercel (Frontend + API)

1. Import repo in Vercel.
2. Set all env vars from `.env.example`.
3. Deploy.
4. Set `NEXT_PUBLIC_BASE_URL` to your production URL.

### Backend/Worker jobs

- Current pipeline processes queue inline for simplicity and reliability.
- For scale, schedule these jobs using Cloud Run/Cron:
  - metric queue drain (`processMetricQueue`)
  - retention pruning (`applyRetentionPolicies`)
  - periodic alert/server-down checks

## Production Notes

- Rotate `AUTH_JWT_SECRET`, agent keys, and Firebase service credentials.
- Add rate limiting + WAF in front of API routes.
- Add Firestore security rules and IAM-restricted server credentials.
- Add external queue (Pub/Sub/SQS/Kafka) for very high ingest throughput.
