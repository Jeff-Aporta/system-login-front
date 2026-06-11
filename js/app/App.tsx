/* app/App — panel centralizado: login, usuario, permisos, penalización y servicios. */
(function () {
  "use strict";
  const MUI = MaterialUI;

  function LoginForm(props: { onSuccess: () => void }) {
    const [user, setUser] = React.useState("");
    const [pass, setPass] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);
    const [retry, setRetry] = React.useState<number | null>(null);

    async function submit(ev: Event) {
      ev.preventDefault();
      setBusy(true); setErr(null); setRetry(null);
      try {
        await window.SLG.Session.login(user, pass);
        props.onSuccess();
      } catch (e) {
        const ex = e as Error & { retryAfterSeconds?: number };
        setErr(ex.message || String(e));
        if (ex.retryAfterSeconds) setRetry(ex.retryAfterSeconds);
      } finally { setBusy(false); }
    }

    return React.createElement(MUI.Paper, { sx: { p: 3, maxWidth: 420, mx: "auto" }, component: "form", onSubmit: submit },
      React.createElement(MUI.Typography, { variant: "h5", gutterBottom: true }, "Iniciar sesión"),
      React.createElement(MUI.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } },
        "Use su usuario y contraseña de la organización. La misma sesión sirve en todas las aplicaciones."),
      err && React.createElement(MUI.Alert, { severity: "error", sx: { mb: 2 } },
        retry ? err + " — reintenta en " + retry + " s" : err),
      React.createElement(MUI.TextField, { label: "Usuario", fullWidth: true, required: true, margin: "normal", value: user, onChange: (e: Event) => setUser((e.target as HTMLInputElement).value) }),
      React.createElement(MUI.TextField, { label: "Contraseña", type: "password", fullWidth: true, required: true, margin: "normal", value: pass, onChange: (e: Event) => setPass((e.target as HTMLInputElement).value) }),
      React.createElement(MUI.Button, { type: "submit", variant: "contained", fullWidth: true, sx: { mt: 2 }, disabled: busy },
        busy ? "Entrando…" : "Entrar"));
  }

  function InfoRow(props: { label: string; value: string | null | undefined }) {
    return React.createElement(MUI.Stack, { direction: "row", spacing: 1, sx: { py: 0.5 } },
      React.createElement(MUI.Typography, { variant: "body2", color: "text.secondary", sx: { minWidth: 120 } }, props.label),
      React.createElement(MUI.Typography, { variant: "body2" }, props.value || "—"));
  }

  function Dashboard(props: { data: Record<string, unknown>; onRefresh: () => void }) {
    const d = props.data;
    const u = (d.user || {}) as Record<string, unknown>;
    const p = (d.permissions || {}) as { allow?: string[]; exceptions?: Record<string, unknown>[] };
    const pen = d.penalty as Record<string, unknown> | undefined;

    return React.createElement(MUI.Stack, { spacing: 2 },
      React.createElement(MUI.Paper, { className: "panel", sx: { p: 2 } },
        React.createElement(MUI.Stack, { direction: "row", justifyContent: "space-between", alignItems: "center" },
          React.createElement(MUI.Typography, { variant: "h6" }, "Usuario"),
          React.createElement(MUI.Stack, { direction: "row", spacing: 1 },
            React.createElement(MUI.Button, { size: "small", onClick: props.onRefresh }, "Actualizar"),
            React.createElement(MUI.Button, { size: "small", color: "warning", onClick: () => { window.SLG.Session.logout(); window.location.reload(); } }, "Salir"))),
        React.createElement(InfoRow, { label: "Usuario", value: String(u.username ?? "") }),
        React.createElement(InfoRow, { label: "Rol", value: String(u.role ?? "") }),
        React.createElement(InfoRow, { label: "Descripción rol", value: String(u.roleDescription ?? "") }),
        React.createElement(InfoRow, { label: "Sesión expira", value: u.exp ? new Date(Number(u.exp) * 1000).toLocaleString() : null })),

      pen && React.createElement(MUI.Paper, { className: "panel", sx: { p: 2 } },
        React.createElement(MUI.Typography, { variant: "h6", gutterBottom: true }, "Penalización de login"),
        React.createElement(InfoRow, { label: "Intentos fallidos", value: String(pen.failCount ?? 0) }),
        pen.blocked && React.createElement(MUI.Alert, { severity: "warning", sx: { mt: 1 } },
          "Bloqueado — espera " + (pen.retryAfterSeconds || 0) + " s antes de reintentar")),

      React.createElement(MUI.Paper, { className: "panel", sx: { p: 2 } },
        React.createElement(MUI.Typography, { variant: "h6", gutterBottom: true }, "Permisos"),
        !(p.allow || []).length && React.createElement(MUI.Typography, { variant: "body2", color: "text.secondary" }, "Sin permisos asignados para este rol."),
        (p.allow || []).map((rule, i) =>
          React.createElement(MUI.Chip, { key: i, label: rule, size: "small", sx: { mr: 0.5, mb: 0.5, fontFamily: "monospace" } })),
        (p.exceptions || []).length > 0 && React.createElement(MUI.Box, { sx: { mt: 2 } },
          React.createElement(MUI.Typography, { variant: "subtitle2", gutterBottom: true }, "Excepciones de usuario"),
          React.createElement(MUI.Table, { size: "small" },
            React.createElement(MUI.TableHead, null,
              React.createElement(MUI.TableRow, null,
                React.createElement(MUI.TableCell, null, "Regla"),
                React.createElement(MUI.TableCell, null, "Ámbito"),
                React.createElement(MUI.TableCell, null, "Nota"))),
            React.createElement(MUI.TableBody, null,
              (p.exceptions || []).map((ex, i) =>
                React.createElement(MUI.TableRow, { key: i },
                  React.createElement(MUI.TableCell, { className: "rule-mono" }, String(ex.allowrule)),
                  React.createElement(MUI.TableCell, { className: "rule-mono" }, String(ex.sqlscope || "—")),
                  React.createElement(MUI.TableCell, null, String(ex.description || "—"))))))),

      React.createElement(MUI.Paper, { className: "panel", sx: { p: 2 } },
        React.createElement(MUI.Typography, { variant: "h6", gutterBottom: true }, "Servicios"),
        React.createElement(MUI.List, { dense: true },
          ((d.services || []) as Record<string, unknown>[]).map((s) =>
            React.createElement(MUI.ListItem, {
              key: String(s.id),
              secondaryAction: React.createElement(MUI.Button, {
                href: String(s.url), target: "_blank", rel: "noreferrer", size: "small",
              }, "Abrir"),
            }, React.createElement(MUI.ListItemText, { primary: String(s.name), secondary: String(s.description) }))
          ))
      ))
    );
  }

  function App() {
    const Shell = window.ISAFront.Layout.AppShell;
    const [logged, setLogged] = React.useState(window.SLG.Session.isLoggedIn());
    const [data, setData] = React.useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);

    const refresh = React.useCallback(async () => {
      if (!window.SLG.Session.isLoggedIn()) {
        setLogged(false);
        setData(null);
        return;
      }
      setLogged(true);
      setLoading(true);
      setErr(null);
      try {
        setData(await window.SLG.Api.fetchSession());
      } catch (e) {
        const ex = e as Error & { status?: number };
        const msg = ex.message || String(e);
        if (ex.status === 401 || /inválid|expirad/i.test(msg)) {
          window.SLG.Session.logout();
          setLogged(false);
          setData(null);
          setErr(msg);
        } else {
          setErr(msg);
        }
      } finally { setLoading(false); }
    }, []);

    React.useEffect(() => {
      if (window.SLG.Session.isLoggedIn()) {
        setLogged(true);
        refresh();
      }
    }, [refresh]);
    React.useEffect(() => {
      const f = () => setLogged(window.SLG.Session.isLoggedIn());
      window.addEventListener(window.SLG.Session.EVENT, f);
      return () => window.removeEventListener(window.SLG.Session.EVENT, f);
    }, []);

    const body = React.createElement(MUI.Container, { maxWidth: "md", sx: { py: 3 } },
      !logged && React.createElement(LoginForm, { onSuccess: () => refresh() }),
      logged && loading && React.createElement(MUI.Box, { sx: { textAlign: "center", py: 4 } }, React.createElement(MUI.CircularProgress, null)),
      logged && err && React.createElement(MUI.Alert, {
        severity: "error", sx: { mb: 2 },
        action: React.createElement(MUI.Button, { size: "small", onClick: refresh }, "Reintentar"),
      }, err),
      logged && !loading && data && React.createElement(Dashboard, { data, onRefresh: refresh }),
      logged && !loading && !data && React.createElement(MUI.Stack, { spacing: 2, alignItems: "center", sx: { py: 4 } },
        React.createElement(MUI.Typography, null, "Sesión activa como ", window.SLG.Session.username()),
        React.createElement(MUI.Button, { variant: "contained", onClick: refresh }, "Cargar panel")));

    return React.createElement(Shell, {
      ns: "SLG",
      title: "Acceso",
      icon: "mdi:shield-account-outline",
      loginGate: false,
      showLogout: logged,
    }, body);
  }

  window.SLG.mount = function () {
    const root = document.getElementById("root");
    if (!root) throw new Error("No se encontró #root");
    ReactDOM.createRoot(root).render(React.createElement(App));
  };
  window.SLG.mount();
})();
