/* core/auth-api — URL centralizada Cloudflare system-login (compartida entre ISAs). */
(function () {
  "use strict";

  const AUTH_LOCAL = "http://localhost:8787";
  const AUTH_ONLINE = "https://system-login.jeffaporta.workers.dev";
  const SESSION_KEY = "system-login:session";
  const SESSION_EVT = "system-login:auth";
  const LS = "system-login:auth-local";

  function isLocal(): boolean {
    try { return localStorage.getItem(LS) === "1"; } catch (e) { return false; }
  }
  function base(): string { return (isLocal() ? AUTH_LOCAL : AUTH_ONLINE).replace(/\/$/, ""); }
  function authUrl(path: string): string { return base() + (path.charAt(0) === "/" ? path : "/" + path); }

  /** Persiste sesión en sessionStorage (clave unificada). */
  function saveSession(data: { username: string; role?: string | null; token: string; expiresAt?: string | null }) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      username: data.username,
      role: data.role ?? null,
      token: data.token,
      expiresAt: data.expiresAt ?? null,
    }));
    window.dispatchEvent(new Event(SESSION_EVT));
  }

  function readSession(): { username: string; role: string | null; token: string; expiresAt: string | null } | null {
    try {
      const v = sessionStorage.getItem(SESSION_KEY);
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  }

  function isLoggedIn(): boolean {
    const s = readSession();
    if (!s?.token) return false;
    if (s.expiresAt && new Date(s.expiresAt).getTime() < Date.now()) return false;
    return true;
  }

  function authHeader(): Record<string, string> {
    const s = readSession();
    return s?.token ? { Authorization: "Bearer " + s.token } : {};
  }

  const w = window as any;
  w.SLG = w.SLG || {};
  w.SLG.AuthApi = {
    AUTH_LOCAL, AUTH_ONLINE, SESSION_KEY, SESSION_EVT,
    isLocal, base, authUrl, saveSession, readSession, isLoggedIn, authHeader,
  };
})();
