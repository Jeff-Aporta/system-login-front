/* Registro ISAFront — sesión vía main-orchestrator (URL en front-shared). */
(function () {
  "use strict";
  window.ISAFront.registerApp({
    ns: "SLG",
    app: "system-login",
    theme: { lsKey: "system-login:theme" },
    widgets: { targetStyle: "chip" },
    session: true,
  });
})();
