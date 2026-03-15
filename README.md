# Cloud Intelligence Platform

A modern, Firebase-style SaaS control plane for cloud operations teams.

This project demonstrates how a multi-tenant cloud ops product can combine:
- project-scoped observability
- alerts and incident triage
- cost visibility
- role-based access control
- organization and member management

Built with Next.js App Router, React 19, and TypeScript.

## Live Demo

- App URL: `https://cloud-intelligence-platform-sigma.vercel.app`
- Login page: `https://cloud-intelligence-platform-sigma.vercel.app/auth/login`

Demo credentials:
- Admin: `admin@test.com` / `123456`
- Member: `member@test.com` / `123456`

## What The Product Includes

### 1) Public Experience
- Landing page (`/`) with product narrative and CTAs.
- Public showcase page (`/showcase`) for no-login feature walkthrough.

### 2) Auth & Access
- Login/signup flow with member request approval.
- Role cookies for session context (`admin` / `member`).
- Route-level workspace protection with middleware.
- Admin-only protection for organization settings sections.

### 3) Workspace Modules
- Dashboard: KPI snapshot + action center.
- Projects: project list and context switching.
- Infrastructure: topology map and compute-health view.
- Alerts: project-scoped alert stream.
- Analytics/Cost: chart-based operational and spending insights.
- Security Center: posture-style operational checks.
- Solution Showcase: in-workspace presentation route.

### 4) Organization Administration
- Organization settings pages (profile, plan, security, integrations, danger zone).
- Editable organization profile with saved values reflected in:
  - workspace header
  - organization settings summary
  - profile editor metadata
- Members & permissions panel:
  - invite sending
  - member request approvals
  - role-aware actions

### 5) Notification Integrations
- Email notification API with log-mode fallback.
- Slack webhook notification endpoint.
- Resend webhook endpoint stub for event handling.

## Architecture Overview

### App Structure
- `app/(auth)` -> public auth routes
- `app/(saas)/workspace` -> authenticated SaaS workspace
- `app/api` -> route handlers for auth, org, project, notifications, webhooks
- `components/saas` -> reusable product UI blocks
- `lib/*` -> business logic helpers (auth, org, alerts, metrics)

### Data Model (Current State)
This project is demo-first and currently uses a mix of:
- static demo datasets (`lib/workspace/data.ts`)
- cookie-backed state for auth/member/org profile flows
- API handlers returning simulated or demo data

This makes the app easy to run and evaluate without provisioning cloud backends.

## Auth & Role Behavior

- Unauthenticated users are redirected away from `/workspace/*`.
- Admin-only sections under workspace settings are guarded in middleware.
- Session role/email are read from secure HTTP-only cookies.
- Member onboarding supports pending requests and admin approval flow.

## Key API Routes

Auth:
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/signup`
- `GET /api/auth/profile`
- `GET /api/auth/member-requests`
- `POST /api/auth/member-requests/approve`

Organizations:
- `GET/PATCH /api/organizations/[orgId]`
- `GET/PATCH /api/organizations/[orgId]/members`
- `POST /api/organizations/[orgId]/invites`

Projects:
- `GET /api/projects`
- `GET /api/projects/[projectId]`
- `GET /api/projects/[projectId]/metrics`
- `GET /api/projects/[projectId]/cost`
- `GET /api/projects/[projectId]/topology`
- `GET /api/projects/[projectId]/alerts`
- `POST /api/projects/[projectId]/alerts/evaluate`

Notifications & Webhooks:
- `POST /api/notifications/email`
- `POST /api/notifications/slack`
- `POST /api/webhooks/resend`

## Tech Stack

Core:
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS

Visualization:
- Recharts
- React Flow
- Three.js / React Three Fiber / Drei (available in dependency stack)

Integrations:
- Firebase SDK clients (configured hooks exist)
- Resend (email)
- Slack webhooks

## Local Development

### Prerequisites
- Node.js 20+
- npm

### Install
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```

Open `http://localhost:3000`.

### Build
```bash
npm run build
npm run start
```

## Environment Variables

Create `.env.local` and define what you need for your target flow.

```bash
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase client (optional in current demo flows)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Email delivery
EMAIL_DELIVERY_MODE=log
RESEND_API_KEY=
ALERT_FROM_EMAIL=

# Webhooks / notifications
RESEND_WEBHOOK_SECRET=
SLACK_WEBHOOK_URL=
NEXT_PUBLIC_ALERT_WEBHOOK=
```

Notes:
- `EMAIL_DELIVERY_MODE=log` is recommended for local testing.
- If `RESEND_API_KEY` is missing, email routes can run in simulated mode.

## Scripts

- `npm run dev` -> start development server
- `npm run build` -> production build
- `npm run start` -> run production server
- `npm run lint` -> run eslint checks

## Deployment

Recommended: Vercel.

Basic flow:
1. Push repository to GitHub.
2. Import project in Vercel.
3. Configure environment variables.
4. Deploy.

## Known Limitations (Current Demo Scope)

- Several workspace metrics/alerts are demo-generated.
- State is partially cookie-based rather than fully persisted DB-backed tenancy.
- Some lint issues exist in legacy files unrelated to core demo flows.

## Roadmap

- Persist org/project/member state in Firestore or Postgres
- Real cloud provider ingestion (AWS/GCP/Azure APIs)
- Stronger RBAC + audit log trail
- SSO/SAML integration
- Incident timeline + runbook automation

---

If you use this project in your portfolio, include screenshots of:
- dashboard
- infrastructure topology
- organization profile editor
- member approval workflow
