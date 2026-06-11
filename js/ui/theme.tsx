/* ui/theme */
(function () {
  "use strict";
  const React = (window as any).React;
  const MUI = (window as any).MaterialUI;
  const LS = "system-login:theme";
  const DODGER = "#1e90ff";

  function makeTheme(mode: "dark" | "light") {
    const dark = mode === "dark";
    return MUI.createTheme({
      palette: {
        mode,
        primary: { main: DODGER },
        background: dark ? { default: "#0a1929", paper: "#0f2236" } : { default: "#f0f6ff", paper: "#fff" },
      },
      shape: { borderRadius: 10 },
      typography: { fontFamily: '"IBM Plex Sans", system-ui, sans-serif' },
    });
  }
  function initialMode(): "dark" | "light" {
    try { const v = localStorage.getItem(LS); if (v === "light" || v === "dark") return v; } catch (e) {}
    return "dark";
  }
  function useThemeMode() {
    const [mode, setMode] = React.useState(initialMode());
    const toggle = React.useCallback(() => {
      setMode((m: "dark" | "light") => {
        const n = m === "dark" ? "light" : "dark";
        try { localStorage.setItem(LS, n); } catch (e) {}
        return n;
      });
    }, []);
    return { mode, toggle };
  }
  const w = window as any;
  w.SLG = w.SLG || {};
  w.SLG.Theme = { makeTheme, useThemeMode, DODGER };
})();
