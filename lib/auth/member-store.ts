type MemberAccount = {
  email: string;
  password: string;
  role: "member";
};

type MemberRequest = {
  name: string;
  email: string;
  password: string;
  requestedAt: string;
  status: "pending";
};

const approvedMembers: MemberAccount[] = [];
const pendingRequests: MemberRequest[] = [];

export function createMemberAccessRequest(input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name || !email || !email.includes("@") || !password) {
    return { ok: false as const, error: "Valid name, email and password are required" };
  }

  if (approvedMembers.some((member) => member.email === email)) {
    return { ok: false as const, error: "Member already approved. Please login." };
  }

  if (pendingRequests.some((request) => request.email === email)) {
    return { ok: false as const, error: "Request already pending admin approval." };
  }

  pendingRequests.push({
    name,
    email,
    password,
    requestedAt: new Date().toISOString(),
    status: "pending"
  });

  return { ok: true as const };
}

export function getPendingMemberRequests() {
  return [...pendingRequests];
}

export function approveMemberRequest(email: string) {
  const normalized = email.trim().toLowerCase();
  const index = pendingRequests.findIndex((request) => request.email === normalized);
  if (index < 0) {
    return { ok: false as const, error: "Pending request not found" };
  }

  const [request] = pendingRequests.splice(index, 1);
  approvedMembers.push({
    email: request.email,
    password: request.password,
    role: "member"
  });

  return { ok: true as const, approvedEmail: request.email };
}

export function validateApprovedMemberLogin(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return approvedMembers.find((member) => member.email === normalized && member.password === password) ?? null;
}

export function isMemberRequestPending(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return pendingRequests.some((request) => request.email === normalized);
}
