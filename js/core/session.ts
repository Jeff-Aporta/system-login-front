/* core/session — JWT en sessionStorage (compatible con otros front Jeff-Aporta). */
(function () {
  "use strict";

  type Session = {
    username: string;
    role: string | null;
    token: string;
    expiresAt: string | null;
  };

  const KEY = "system-login:session";
  const EVT = "system-login:auth";

  function load(): Session | null {
    const api = (window as any).SLG.AuthApi;
    if (api?.readSession) return api.readSession() as Session | null;
    try {
      const v = sessionStorage.getItem(KEY);
      return v ? (JSON.parse(v) as Session) : null;
    } catch (e) { return null; }
  }

  function save(sess: Session | null): void {
    const api = (window as any).SLG.AuthApi;
    if (sess && api?.saveSession) { api.saveSession(sess); session = sess; return; }
    try {
      if (sess) sessionStorage.setItem(KEY, JSON.stringify(sess));
      else sessionStorage.removeItem(KEY);
    } catch (e) {}
    window.dispatchEvent(new Event(EVT));
  }

  let session: Session | null = load();

  function current(): Session | null { return session ?? load(); }
  function isLoggedIn(): boolean {
    session = session ?? load();
    if (!session?.token) return false;
    if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) return false;
    return true;
  }
  function authHeader(): Record<string, string> {
    return isLoggedIn() ? { Authorization: "Bearer " + session!.token } : {};
  }

  async function login(user: string, pass: string): Promise<Session> {
    const authApi = (window as any).SLG.AuthApi;
    const url = authApi?.authUrl ? authApi.authUrl("/auth/token") : (window as any).SLG.Config.apiUrl("/auth/token");
    const caesar = (window as any).SLG.Caesar;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.trim(), password: caesar.wrapPassword(pass) }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data.token) {
      const err = new Error(data.error || ("Login falló (" + res.status + ")")) as Error & { retryAfterSeconds?: number };
      if (data.retryAfterSeconds) err.retryAfterSeconds = data.retryAfterSeconds;
      throw err;
    }
    session = {
      username: data.username || user,
      role: data.role || null,
      token: data.token,
      expiresAt: data.expiresAt || null,
    };
    save(session);
    return session;
  }

  function logout(): void { session = null; save(null); }

  const w = window as any;
  w.SLG = w.SLG || {};
  w.SLG.Session = { current, isLoggedIn, authHeader, login, logout, EVENT: EVT };
})();
