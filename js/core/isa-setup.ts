/* Registro ISAFront — config, tema, widgets (auth propio en session.ts). */
(function () {
  "use strict";
  window.ISAFront.registerApp({
    ns: "SLG",
    api: {
      local: "http://localhost:8781",
      online: "https://system-login.jeffaporta.workers.dev",
      lsKey: "system-login:local",
      event: "system-login:target",
    },
    theme: { lsKey: "system-login:theme" },
    widgets: { targetStyle: "chip" },
    session: true,
  });
})();
