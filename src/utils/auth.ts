export type AuthUser = {
  id: number;
  email: string;
  name?: string | null;
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const LEGACY_USER_KEY = "user";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getToken() {
  if (!canUseStorage()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (!canUseStorage()) return null;
  const raw =
    localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!data || typeof data !== "object") return null;
    if ("username" in data && !("email" in data)) {
      const username = String(data.username || "");
      return { id: 0, email: username, name: username };
    }
    const email = typeof data.email === "string" ? data.email : "";
    const id = typeof data.id === "number" ? data.id : 0;
    const name = typeof data.name === "string" ? data.name : null;
    if (!email) return null;
    return { id, email, name };
  } catch (e) {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  if (!canUseStorage()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function clearSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

async function readError(res: Response) {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `${res.status} ${res.statusText}`.trim();
  } catch (e) {
    return `${res.status} ${res.statusText}`.trim();
  }
}

export async function fetchMe(token?: string) {
  const t = token || getToken();
  if (!t) return null;
  const res = await fetch("/api/me", {
    headers: { Authorization: `Bearer ${t}` },
  });
  if (!res.ok) {
    clearSession();
    return null;
  }
  const user = (await res.json()) as AuthUser;
  setSession(t, user);
  return user;
}

export async function loginUser(email: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const json = (await res.json()) as { token?: string };
  if (!json.token) throw new Error("missing token");
  const user = await fetchMe(json.token);
  if (!user) throw new Error("failed to load user");
  return user;
}

export async function registerUser(params: {
  name?: string;
  email: string;
  password: string;
}) {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await readError(res));
  return loginUser(params.email, params.password);
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
