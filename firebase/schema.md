# Firestore Production Schema (Cloud Intelligence Platform)

## Collections

- `organizations`
  - `id`, `name`, `slug`, `plan`, `created_at`, `updated_at`

- `users` (doc id = lowercase email)
  - `email`, `name`, `password_hash`, `role` (`admin|developer|viewer`), `organization_id`, `status`, timestamps

- `projects`
  - `id`, `organization_id`, `name`, `environment`, `region`, timestamps

- `servers`
  - `id`, `organization_id`, `project_id`, `name`, `ip_address`, `agent_key`, `status`, `discovered_services`, timestamps

- `metric_queue`
  - ingestion queue before metric persistence

- `metrics`
  - `id`, `organization_id`, `project_id`, `server_id`, `cpu`, `memory`, `disk`, `network`, `timestamp`, `created_at`

- `alerts`
  - `id`, `organization_id`, `project_id`, `server_id`, `type`, `severity`, `message`, `status`, `triggered_at`, `created_at`

- `incidents`
  - `id`, `organization_id`, `project_id`, `alert_id`, `title`, `severity`, `assigned_to`, `status`, `timeline[]`, timestamps

- `logs`
  - `id`, `organization_id`, `project_id`, `server_id`, `level`, `message`, `source`, `timestamp`, `created_at`

- `deployments`
  - `id`, `organization_id`, `project_id`, `version`, `environment`, `deployed_by`, `notes`, `deployed_at`, `created_at`

- `audit_logs`
  - `id`, `organization_id`, `actor_email`, `action`, `entity_type`, `entity_id`, `metadata`, `created_at`

## Indexes to configure

- `metrics`: composite indexes by `project_id+timestamp desc`, `server_id+timestamp desc`
- `alerts`: `project_id+triggered_at desc`, `server_id+status+triggered_at desc`
- `logs`: `project_id+timestamp desc`, optional `project_id+level+timestamp desc`
- `incidents`: `project_id+updated_at desc`
- `deployments`: `project_id+deployed_at desc`
- `audit_logs`: `organization_id+created_at desc`
