import { getSessionContext } from "@/lib/auth/session";
import { listProjectsByOrganization } from "@/lib/database/projects";
import { resolveOrganizationId } from "@/lib/database/organizations";

export type WorkspaceProject = {
  id: string;
  name: string;
  environment: string;
  region: string;
};

export async function getWorkspaceProjects(): Promise<{ projects: WorkspaceProject[]; selectedProject: WorkspaceProject | null }> {
  const session = await getSessionContext();
  if (!session.user) {
    return { projects: [], selectedProject: null };
  }
  try {
    const orgId = await resolveOrganizationId(session.orgId, session.user.email);
    const projects = await listProjectsByOrganization(orgId);
    const mapped = projects.map((project) => ({
      id: project.id,
      name: project.name,
      environment: project.environment,
      region: project.region
    }));

    return {
      projects: mapped,
      selectedProject: mapped[0] ?? null
    };
  } catch {
    return { projects: [], selectedProject: null };
  }
}

export function selectProject(projects: WorkspaceProject[], projectId?: string): WorkspaceProject | null {
  return projects.find((project) => project.id === projectId) ?? projects[0] ?? null;
}
