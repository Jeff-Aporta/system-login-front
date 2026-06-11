/* app/App — panel centralizado: login, usuario, permisos, penalización y servicios. */
(function () {
  "use strict";
  const React = (window as any).React;
  const ReactDOM = (window as any).ReactDOM;
  const MUI = (window as any).MaterialUI;
  const w = window as any;
  const UI = w.SLG.UI;

  function LoginForm(props: { onSuccess: () => void }) {
    const [user, setUser] = React.useState("");
    const [pass, setPass] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);
    const [retry, setRetry] = React.useState<number | null>(null);

    async function submit(ev: any) {
      ev.preventDefault();
      setBusy(true); setErr(null); setRetry(null);
      try {
        await w.SLG.Session.login(user, pass);
        props.onSuccess();
      } catch (e: any) {
        setErr(e.message || String(e));
        if (e.retryAfterSeconds) setRetry(e.retryAfterSeconds);
      } finally { setBusy(false); }
    }

    return React.createElement(MUI.Paper, { sx: { p: 3, maxWidth: 420, mx: "auto" }, component: "form", onSubmit: submit },
      React.createElement(MUI.Typography, { variant: "h5", gutterBottom: true }, "Iniciar sesión"),
      React.createElement(MUI.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } },
        "Credenciales compartidas con LangLab / PatyIA (Azure)."),
      err && React.createElement(MUI.Alert, { severity: "error", sx: { mb: 2 } },
        retry ? err + " — reintenta en " + retry + " s" : err),
      React.createElement(MUI.TextField, { label: "Usuario", fullWidth: true, required: true, margin: "normal", value: user, onChange: (e: any) => setUser(e.target.value) }),
      React.createElement(MUI.TextField, { label: "Contraseña", type: "password", fullWidth: true, required: true, margin: "normal", value: pass, onChange: (e: any) => setPass(e.target.value) }),
      React.createElement(MUI.Button, { type: "submit", variant: "contained", fullWidth: true, sx: { mt: 2 }, disabled: busy },
        busy ? "Entrando…" : "Entrar"));
  }

  function InfoRow(props: { label: string; value: string | null | undefined }) {
    return React.createElement(MUI.Stack, { direction: "row", spacing: 1, sx: { py: 0.5 } },
      React.createElement(MUI.Typography, { variant: "body2", color: "text.secondary", sx: { minWidth: 120 } }, props.label),
      React.createElement(MUI.Typography, { variant: "body2" }, props.value || "—"));
  }

  function Dashboard(props: { data: any; onRefresh: () => void }) {
    const d = props.data;
    const u = d.user || {};
    const p = d.permissions || {};
    const pen = d.penalty;

    return React.createElement(MUI.Stack, { spacing: 2 },
      React.createElement(MUI.Paper, { className: "panel", sx: { p: 2 } },
        React.createElement(MUI.Stack, { direction: "row", justifyContent: "space-between", alignItems: "center" },
          React.createElement(MUI.Typography, { variant: "h6" }, "Usuario"),
          React.createElement(MUI.Stack, { direction: "row", spacing: 1 },
            React.createElement(MUI.Button, { size: "small", onClick: props.onRefresh }, "Actualizar"),
            React.createElement(MUI.Button, { size: "small", color: "warning", onClick: () => { w.SLG.Session.logout(); window.location.reload(); } }, "Salir"))),
        React.createElement(InfoRow, { label: "Usuario", value: u.username }),
        React.createElement(InfoRow, { label: "Rol", value: u.role }),
        React.createElement(InfoRow, { label: "Descripción rol", value: u.roleDescription }),
        React.createElement(InfoRow, { label: "Expira JWT", value: u.exp ? new Date(u.exp * 1000).toLocaleString() : null })),

      pen && React.createElement(MUI.Paper, { className: "panel", sx: { p: 2 } },
        React.createElement(MUI.Typography, { variant: "h6", gutterBottom: true }, "Penalización de login"),
        React.createElement(InfoRow, { label: "Intentos fallidos", value: String(pen.failCount ?? 0) }),
        pen.blocked && React.createElement(MUI.Alert, { severity: "warning", sx: { mt: 1 } },
          "Bloqueado — espera " + (pen.retryAfterSeconds || 0) + " s antes de reintentar")),

      React.createElement(MUI.Paper, { className: "panel", sx: { p: 2 } },
        React.createElement(MUI.Typography, { variant: "h6", gutterBottom: true }, "Permisos (allow)"),
        !(p.allow || []).length && React.createElement(MUI.Typography, { variant: "body2", color: "text.secondary" }, "Sin reglas allow para este rol."),
        (p.allow || []).map((rule: string, i: number) =>
          React.createElement(MUI.Chip, { key: i, label: rule, size: "small", sx: { mr: 0.5, mb: 0.5, fontFamily: "monospace" } })),
        (p.exceptions || []).length > 0 && React.createElement(MUI.Box, { sx: { mt: 2 } },
          React.createElement(MUI.Typography, { variant: "subtitle2", gutterBottom: true }, "Excepciones de usuario"),
          React.createElement(MUI.Table, { size: "small" },
            React.createElement(MUI.TableHead, null,
              React.createElement(MUI.TableRow, null,
                React.createElement(MUI.TableCell, null, "Regla"),
                React.createElement(MUI.TableCell, null, "SQL scope"),
                React.createElement(MUI.TableCell, null, "Nota"))),
            React.createElement(MUI.TableBody, null,
              (p.exceptions || []).map((ex: any, i: number) =>
                React.createElement(MUI.TableRow, { key: i },
                  React.createElement(MUI.TableCell, { className: "rule-mono" }, ex.allowrule),
                  React.createElement(MUI.TableCell, { className: "rule-mono" }, ex.sqlscope || "—"),
                  React.createElement(MUI.TableCell, null, ex.description || "—"))))))),

      React.createElement(MUI.Paper, { className: "panel", sx: { p: 2 } },
        React.createElement(MUI.Typography, { variant: "h6", gutterBottom: true }, "Servicios"),
        React.createElement(MUI.List, { dense: true },
          (d.services || []).map((s: any) =>
            React.createElement(MUI.ListItem, { key: s.id, secondaryAction:
              React.createElement(MUI.Button, { href: s.url, target: "_blank", rel: "noreferrer", size: "small" }, "Abrir") },
              React.createElement(MUI.ListItemText, { primary: s.name, secondary: s.description })))));
  }

  function App() {
    const tm = w.SLG.Theme.useThemeMode();
    const theme = React.useMemo(() => w.SLG.Theme.makeTheme(tm.mode), [tm.mode]);
    const [logged, setLogged] = React.useState(w.SLG.Session.isLoggedIn());
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);

    const refresh = React.useCallback(async () => {
      if (!w.SLG.Session.isLoggedIn()) { setLogged(false); return; }
      setLoading(true); setErr(null);
      try {
        setData(await w.SLG.Api.fetchSession());
        setLogged(true);
      } catch (e: any) {
        setErr(e.message);
        w.SLG.Session.logout();
        setLogged(false);
      } finally { setLoading(false); }
    }, []);

    React.useEffect(() => { if (logged) refresh(); }, [logged, refresh]);
    React.useEffect(() => {
      const f = () => setLogged(w.SLG.Session.isLoggedIn());
      window.addEventListener(w.SLG.Session.EVENT, f);
      return () => window.removeEventListener(w.SLG.Session.EVENT, f);
    }, []);

    return React.createElement(MUI.ThemeProvider, { theme },
      React.createElement(MUI.CssBaseline, null),
      React.createElement(MUI.Box, { sx: { height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" } },
        React.createElement(MUI.AppBar, { position: "static", color: "transparent", elevation: 0, sx: { borderBottom: 1, borderColor: "divider", flexShrink: 0 } },
          React.createElement(MUI.Toolbar, null,
            React.createElement(UI.Icon, { icon: "mdi:shield-account-outline" }),
            React.createElement(MUI.Typography, { variant: "h6", sx: { flexGrow: 1, ml: 1 } }, "System Login"),
            React.createElement(UI.TargetSwitch, null),
            React.createElement(UI.ThemeSwitch, { mode: tm.mode, onToggle: tm.toggle }))),
        React.createElement(MUI.Box, { sx: { flex: 1, minHeight: 0, overflow: "auto" } },
          React.createElement(MUI.Container, { maxWidth: "md", sx: { py: 3 } },
            !logged && React.createElement(LoginForm, { onSuccess: () => setLogged(true) }),
            logged && loading && React.createElement(MUI.Box, { sx: { textAlign: "center", py: 4 } }, React.createElement(MUI.CircularProgress, null)),
            logged && err && React.createElement(MUI.Alert, { severity: "error" }, err),
            logged && data && !loading && React.createElement(Dashboard, { data, onRefresh: refresh }))))));
  }

  w.SLG.mount = function () {
    ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
  };
})();
