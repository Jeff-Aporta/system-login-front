/* api/client — sesión y permisos vía gateway (/api → system-login). */
(function () {
  "use strict";

  async function apiFetch(path: string, opts: RequestInit = {}): Promise<Record<string, unknown>> {
    const cfg = window.SLG.Config;
    const sess = window.SLG.Session;
    const res = await fetch(cfg.apiUrl(path), {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        ...sess.authHeader(),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      const err = new Error(data.error || ("Error API (" + res.status + ")")) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async function fetchSession(): Promise<Record<string, unknown>> {
    return apiFetch("/api/session");
  }

  async function fetchPermissionsUsers(): Promise<Record<string, unknown>> {
    return apiFetch("/api/permissions/users");
  }

  async function fetchPermissionsRoles(): Promise<Record<string, unknown>> {
    return apiFetch("/api/permissions/roles");
  }

  async function updatePermissionsUser(
    username: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return apiFetch("/api/permissions/users/" + encodeURIComponent(username), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  window.SLG = window.SLG || ({} as SlgNs);
  window.SLG.Api = {
    fetchSession,
    fetchPermissionsUsers,
    fetchPermissionsRoles,
    updatePermissionsUser,
  };
})();
