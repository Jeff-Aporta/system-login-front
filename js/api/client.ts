/* api/client — sesión enriquecida desde el Worker. */
(function () {
  "use strict";

  async function fetchSession(): Promise<Record<string, unknown>> {
    const cfg = window.SLG.Config;
    const sess = window.SLG.Session;
    const res = await fetch(cfg.apiUrl("/api/session"), { headers: sess.authHeader() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      const err = new Error(data.error || ("Sesión inválida (" + res.status + ")")) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    return data;
  }

  window.SLG = window.SLG || ({} as SlgNs);
  window.SLG.Api = { fetchSession };
})();
