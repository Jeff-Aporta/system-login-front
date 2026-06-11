/* boot/loader */
declare const Babel: { transform(code: string, opts: unknown): { code: string } };

(function () {
  "use strict";
  const FILES = [
    "js/core/config.ts",
    "js/core/auth-api.ts",
    "js/core/caesar.ts",
    "js/core/session.ts",
    "js/api/client.ts",
    "js/ui/theme.tsx",
    "js/ui/widgets.tsx",
    "js/app/App.tsx",
  ];
  function showError(msg: string) {
    const root = document.getElementById("root");
    if (root) root.innerHTML = '<pre style="color:#ff8a80;padding:24px;font-family:monospace">' + msg + "</pre>";
  }
  async function run() {
    try {
      for (const file of FILES) {
        const res = await fetch(file + "?v=" + Date.now());
        if (!res.ok) throw new Error("No se pudo cargar " + file);
        const presets = file.endsWith(".tsx") ? ["typescript", "react"] : ["typescript"];
        new Function(Babel.transform(await res.text(), { presets, filename: file }).code)();
      }
      (window as any).SLG.mount();
    } catch (e: any) {
      showError("Error de arranque:\n" + (e?.stack || e));
    }
  }
  run();
})();
