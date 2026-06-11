/* core/config — API system-login (Worker) o Azure directo en local. */
(function () {
  "use strict";
  const LOCAL = "http://localhost:8787";
  const ONLINE = "https://system-login.jeffaporta.workers.dev";
  const LS = "system-login:local";
  const EVT = "system-login:target";

  function isLocal(): boolean {
    try { return localStorage.getItem(LS) === "1"; } catch (e) { return false; }
  }
  function setLocal(on: boolean): void {
    try { localStorage.setItem(LS, on ? "1" : "0"); } catch (e) {}
    window.dispatchEvent(new Event(EVT));
  }
  function base(): string { return (isLocal() ? LOCAL : ONLINE).replace(/\/$/, ""); }
  function apiUrl(path: string): string { return base() + (path.charAt(0) === "/" ? path : "/" + path); }
  function label(): string { return isLocal() ? "worker local" : "worker online"; }

  const w = window as any;
  w.SLG = w.SLG || {};
  w.SLG.Config = { isLocal, setLocal, base, apiUrl, label, EVENT: EVT, ONLINE, LOCAL };
})();
