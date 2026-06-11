/* api/client — sesión enriquecida desde el Worker. */
(function () {
  "use strict";

  async function fetchSession(): Promise<any> {
    const cfg = (window as any).SLG.Config;
    const sess = (window as any).SLG.Session;
    const res = await fetch(cfg.apiUrl("/api/session"), { headers: sess.authHeader() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || ("Sesión inválida (" + res.status + ")"));
    return data;
  }

  const w = window as any;
  w.SLG = w.SLG || {};
  w.SLG.Api = { fetchSession };
})();
