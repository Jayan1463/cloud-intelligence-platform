export type Project = {
  id: string;
  orgId: string;
  name: string;
  env: "prod" | "staging" | "dev";
  region: string;
  createdBy: string;
  createdAt: string;
  archived: boolean;
};
