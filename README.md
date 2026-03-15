Cloud Intelligence Platform

A demo SaaS Cloud Operations Platform built with Next.js, React, and TypeScript that simulates how modern cloud infrastructure management tools operate.

The platform demonstrates multi-tenant SaaS architecture, role-based authentication, protected workspaces, and cloud operations dashboards used in real-world DevOps and cloud monitoring platforms.

🔗 Live Demo
https://cloud-intelligence-platform-sigma.vercel.app

⸻

Overview

Cloud Intelligence Platform is designed to showcase the architecture of a modern cloud management SaaS application.

It includes:
	•	Authentication system
	•	Role-based access control
	•	Organization and workspace management
	•	Infrastructure visualization
	•	Alerts monitoring
	•	Cost analytics dashboards
	•	Security center modules

The project uses demo datasets and cookie-based persistence to simulate real backend behavior while remaining lightweight and easy to deploy.

⸻

Features

Authentication System
	•	Login / Signup flow
	•	Forgot password / reset password pages
	•	Secure cookie-based authentication
	•	Role-based access (Admin / Member)

Protected Workspace

All routes under /workspace are protected by middleware.

Features include:
	•	Workspace dashboard with KPIs
	•	Project switcher
	•	Project-scoped infrastructure views
	•	Alerts monitoring and triage

Infrastructure Monitoring
	•	Infrastructure topology visualization
	•	Service dependencies overview
	•	Operational insights dashboard

Analytics & Cost Intelligence
	•	Usage analytics dashboards
	•	Cost monitoring views
	•	Chart-based visualizations

Security Center
	•	Security insights
	•	Cloud security solution showcase
	•	Risk visibility

Organization Management

Admins can manage:
	•	Organization profile
	•	Member invitations
	•	Member approval requests
	•	Organization settings

⸻

Architecture

The project follows a modern SaaS architecture pattern.

Public Routes

/
/showcase

Authentication Routes

/auth/login
/auth/signup
/auth/forgot-password
/auth/reset-password

Protected Workspace

/workspace/dashboard
/workspace/projects
/workspace/infrastructure
/workspace/alerts
/workspace/analytics
/workspace/cost
/workspace/security

Organization Admin

/workspace/settings/profile
/workspace/settings/plan
/workspace/settings/security
/workspace/settings/integrations
/workspace/settings/danger

Middleware protects workspace routes and enforces role-based access control.

⸻

Tech Stack

Frontend
	•	Next.js (App Router)
	•	React
	•	TypeScript
	•	Tailwind CSS

Backend
	•	Next.js API Route Handlers
	•	Middleware-based authentication
	•	Cookie-backed data storage

Integrations
	•	Email notifications
	•	Slack webhook support
	•	Resend webhook endpoint

Deployment
	•	Vercel

⸻

Project Structure

app/
 ├─ api/
 │   ├─ auth
 │   ├─ organizations
 │   ├─ projects
 │
 ├─ auth/
 │   ├─ login
 │   ├─ signup
 │   ├─ reset
 │
 ├─ workspace/
 │   ├─ dashboard
 │   ├─ projects
 │   ├─ infrastructure
 │   ├─ alerts
 │   ├─ analytics
 │   ├─ cost
 │   ├─ security
 │   └─ settings
 │
components/
lib/
middleware.ts


⸻

API Endpoints

Authentication

POST /api/auth/login
POST /api/auth/signup

Organizations

PATCH /api/organizations/[orgId]

Updates organization profile information which is reflected across the workspace UI.

Integrations

POST /api/webhooks/slack
POST /api/webhooks/resend


⸻

Data Handling

This project uses demo datasets for metrics and project data.

Persistence is simulated using:
	•	cookie-backed storage
	•	local state management
	•	API route handlers

This makes the platform ideal for demo environments and SaaS architecture learning.

⸻

Running Locally

Clone the repository

git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY.git

Navigate into the project

cd YOUR_REPOSITORY

Install dependencies

npm install

Start development server

npm run dev

Open in browser

http://localhost:3000


⸻

Deployment

This project is optimized for Vercel deployment.

Steps:
	1.	Push repository to GitHub
	2.	Import project into Vercel
	3.	Deploy

Live platform:
https://cloud-intelligence-platform-sigma.vercel.app

⸻

Learning Outcomes

This project demonstrates concepts used in real SaaS platforms such as:
	•	Multi-tenant application architecture
	•	Authentication workflows
	•	Role-based authorization
	•	Middleware-based route protection
	•	API-driven frontend applications
	•	Modular UI architecture

⸻

Author

Mrithyunjayan M

Computer Science Engineering Student
Interested in Cloud Computing, SaaS Architecture, and Full Stack Development

