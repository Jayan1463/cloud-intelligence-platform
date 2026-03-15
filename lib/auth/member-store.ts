export type MemberAccount = {
  email: string;
  password: string;
  role: "member";
};

export type MemberRequest = {
  name: string;
  email: string;
  password: string;
  requestedAt: string;
  status: "pending";
};

type MemberStore = {
  approved: MemberAccount[];
  pending: MemberRequest[];
};

export const MEMBER_STORE_COOKIE = "cip_member_store";

const DEFAULT_MEMBER_STORE: MemberStore = {
  approved: [
    { email: "ops@acme.com", password: "123456", role: "member" },
    { email: "member@test.com", password: "123456", role: "member" }
  ],
  pending: []
};

export function readMemberStore(raw: string | undefined): MemberStore {
  if (!raw) {
    return {
      approved: [...DEFAULT_MEMBER_STORE.approved],
      pending: []
    };
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<MemberStore>;
    const approved = Array.isArray(parsed.approved)
      ? parsed.approved
          .filter((member): member is MemberAccount => Boolean(member?.email && member?.password))
          .map((member) => ({ ...member, email: String(member.email).trim().toLowerCase(), role: "member" as const }))
      : [];
    const pending = Array.isArray(parsed.pending)
      ? parsed.pending
          .filter((request): request is MemberRequest => Boolean(request?.name && request?.email && request?.password))
          .map((request) => ({
            ...request,
            email: String(request.email).trim().toLowerCase(),
            status: "pending" as const
          }))
      : [];
    return {
      approved: [...DEFAULT_MEMBER_STORE.approved, ...approved].filter(
        (member, index, all) => all.findIndex((candidate) => candidate.email === member.email) === index
      ),
      pending
    };
  } catch {
    return {
      approved: [...DEFAULT_MEMBER_STORE.approved],
      pending: []
    };
  }
}

export function serializeMemberStore(store: MemberStore): string {
  return encodeURIComponent(JSON.stringify(store));
}

export function getApprovedMembers(store: MemberStore) {
  return [...store.approved];
}

export function createMemberAccessRequest(store: MemberStore, input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name || !email || !email.includes("@") || !password) {
    return { ok: false as const, error: "Valid name, email and password are required", store };
  }

  if (store.approved.some((member) => member.email === email)) {
    return { ok: false as const, error: "Member already approved. Please login.", store };
  }

  if (store.pending.some((request) => request.email === email)) {
    return { ok: false as const, error: "Request already pending admin approval.", store };
  }

  const nextStore: MemberStore = {
    approved: [...store.approved],
    pending: [
      ...store.pending,
      {
        name,
        email,
        password,
        requestedAt: new Date().toISOString(),
        status: "pending"
      }
    ]
  };

  return { ok: true as const, store: nextStore };
}

export function getPendingMemberRequests(store: MemberStore) {
  return [...store.pending];
}

export function approveMemberRequest(store: MemberStore, email: string) {
  const normalized = email.trim().toLowerCase();
  const index = store.pending.findIndex((request) => request.email === normalized);
  if (index < 0) {
    return { ok: false as const, error: "Pending request not found", store };
  }

  const pending = [...store.pending];
  const [request] = pending.splice(index, 1);
  const nextStore: MemberStore = {
    approved: [
      ...store.approved,
      {
        email: request.email,
        password: request.password,
        role: "member"
      }
    ],
    pending
  };

  return { ok: true as const, approvedEmail: request.email, store: nextStore };
}

export function validateApprovedMemberLogin(store: MemberStore, email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return store.approved.find((member) => member.email === normalized && member.password === password) ?? null;
}

export function isMemberRequestPending(store: MemberStore, email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return store.pending.some((request) => request.email === normalized);
}

export function ensureMemberStoreCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}
