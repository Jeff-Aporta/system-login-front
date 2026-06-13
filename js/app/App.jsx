/* app/App — panel centralizado: login, usuario, permisos, penalización y servicios. */
(function () {
  "use strict";
  const MUI = MaterialUI;

  function LoginForm({ onSuccess }) {
    const UI = window.SLG.UI;
    const LS = window.ISAFront;
    const [user, setUser] = React.useState("");
    const [pass, setPass] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState(null);
    const [retry, setRetry] = React.useState(null);

    async function submit(ev) {
      ev.preventDefault();
      setBusy(true); setErr(null); setRetry(null);
      try {
        await window.SLG.Session.login(user, pass);
        onSuccess();
      } catch (e) {
        setErr(e.message || String(e));
        if (e.retryAfterSeconds) setRetry(e.retryAfterSeconds);
      } finally { setBusy(false); }
    }

    return (
      <MUI.Box sx={LS.loginPageSx()}>
        <MUI.Paper
          className="isa-login-card isa-glass-card"
          elevation={0}
          sx={LS.loginCardSx()}
          component="form"
          onSubmit={submit}
        >
          {LS.LoginHeaderBand(React, MUI, UI, {
            icon: "mdi:shield-key-outline",
            title: "Acceso al ecosistema",
            accent: "#5e35b1",
          })}
          <MUI.Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <MUI.Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
              Una sola sesión para todas las aplicaciones Jeff-Aporta.
            </MUI.Typography>
            {err && (
              <MUI.Alert severity="error" sx={{ mb: 2 }}>
                {retry ? err + " — reintenta en " + retry + " s" : err}
              </MUI.Alert>
            )}
            <MUI.TextField label="Usuario" fullWidth required size="small" sx={{ mb: 2 }} value={user} onChange={(e) => setUser(e.target.value)} />
            <MUI.TextField label="Contraseña" type="password" fullWidth required size="small" sx={{ mb: 2 }} value={pass} onChange={(e) => setPass(e.target.value)} />
            <MUI.Button type="submit" variant="contained" fullWidth disabled={busy}>
              {busy ? "Entrando…" : "Entrar"}
            </MUI.Button>
          </MUI.Box>
        </MUI.Paper>
      </MUI.Box>
    );
  }

  function InfoRow({ label, value }) {
    return (
      <MUI.Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
        <MUI.Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>{label}</MUI.Typography>
        <MUI.Typography variant="body2">{value || "—"}</MUI.Typography>
      </MUI.Stack>
    );
  }

  function Dashboard({ data, onRefresh }) {
    const d = data;
    const u = d.user || {};
    const p = d.permissions || {};
    const pen = d.penalty;

    return (
      <MUI.Stack spacing={2}>
        <MUI.Paper className="panel" sx={{ p: 2 }}>
          <MUI.Stack direction="row" justifyContent="space-between" alignItems="center">
            <MUI.Typography variant="h6">Usuario</MUI.Typography>
            <MUI.Stack direction="row" spacing={1}>
              <MUI.Button size="small" onClick={onRefresh}>Actualizar</MUI.Button>
              <MUI.Button size="small" color="warning" onClick={() => { window.SLG.Session.logout(); window.location.reload(); }}>Salir</MUI.Button>
            </MUI.Stack>
          </MUI.Stack>
          <InfoRow label="Usuario" value={String(u.username ?? "")} />
          <InfoRow label="Rol" value={String(u.role ?? "")} />
          <InfoRow label="Descripción rol" value={String(u.roleDescription ?? "")} />
          <InfoRow label="Sesión expira" value={u.exp ? new Date(Number(u.exp) * 1000).toLocaleString() : null} />
        </MUI.Paper>

        {pen && (
          <MUI.Paper className="panel" sx={{ p: 2 }}>
            <MUI.Typography variant="h6" gutterBottom>Penalización de login</MUI.Typography>
            <InfoRow label="Intentos fallidos" value={String(pen.failCount ?? 0)} />
            {pen.blocked && (
              <MUI.Alert severity="warning" sx={{ mt: 1 }}>
                {"Bloqueado — espera " + (pen.retryAfterSeconds || 0) + " s antes de reintentar"}
              </MUI.Alert>
            )}
          </MUI.Paper>
        )}

        <MUI.Paper className="panel" sx={{ p: 2 }}>
          <MUI.Typography variant="h6" gutterBottom>Permisos</MUI.Typography>
          {!(p.allow || []).length && (
            <MUI.Typography variant="body2" color="text.secondary">Sin permisos asignados para este rol.</MUI.Typography>
          )}
          {(p.allow || []).map((rule, i) => (
            <MUI.Chip key={i} label={rule} size="small" sx={{ mr: 0.5, mb: 0.5, fontFamily: "monospace" }} />
          ))}
          {(p.exceptions || []).length > 0 && (
            <MUI.Box sx={{ mt: 2 }}>
              <MUI.Typography variant="subtitle2" gutterBottom>Excepciones de usuario</MUI.Typography>
              <MUI.Table size="small">
                <MUI.TableHead>
                  <MUI.TableRow>
                    <MUI.TableCell>Regla</MUI.TableCell>
                    <MUI.TableCell>Ámbito</MUI.TableCell>
                    <MUI.TableCell>Nota</MUI.TableCell>
                  </MUI.TableRow>
                </MUI.TableHead>
                <MUI.TableBody>
                  {(p.exceptions || []).map((ex, i) => (
                    <MUI.TableRow key={i}>
                      <MUI.TableCell className="rule-mono">{String(ex.allowrule)}</MUI.TableCell>
                      <MUI.TableCell className="rule-mono">{String(ex.sqlscope || "—")}</MUI.TableCell>
                      <MUI.TableCell>{String(ex.description || "—")}</MUI.TableCell>
                    </MUI.TableRow>
                  ))}
                </MUI.TableBody>
              </MUI.Table>
            </MUI.Box>
          )}
        </MUI.Paper>

        <MUI.Paper className="panel" sx={{ p: 2 }}>
          <MUI.Typography variant="h6" gutterBottom>Servicios</MUI.Typography>
          <MUI.List dense>
            {(d.services || []).map((s) => (
              <MUI.ListItem
                key={String(s.id)}
                secondaryAction={
                  <MUI.Button href={String(s.url)} target="_blank" rel="noreferrer" size="small">Abrir</MUI.Button>
                }
              >
                <MUI.ListItemText primary={String(s.name)} secondary={String(s.description)} />
              </MUI.ListItem>
            ))}
          </MUI.List>
        </MUI.Paper>
      </MUI.Stack>
    );
  }

  function App() {
    const Shell = window.ISAFront.Layout.AppShell;
    const [logged, setLogged] = React.useState(window.SLG.Session.isLoggedIn());
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [err, setErr] = React.useState(null);

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
        const msg = e.message || String(e);
        if (e.status === 401 || /inválid|expirad/i.test(msg)) {
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

    const body = !logged
      ? <LoginForm onSuccess={() => refresh()} />
      : (
        <MUI.Container maxWidth="md" sx={{ py: 3 }}>
          {loading && (
            <MUI.Box sx={{ textAlign: "center", py: 4 }}><MUI.CircularProgress /></MUI.Box>
          )}
          {err && (
            <MUI.Alert severity="error" sx={{ mb: 2 }} action={<MUI.Button size="small" onClick={refresh}>Reintentar</MUI.Button>}>
              {err}
            </MUI.Alert>
          )}
          {!loading && data && <Dashboard data={data} onRefresh={refresh} />}
          {!loading && !data && (
            <MUI.Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <MUI.Typography>Sesión activa como {window.SLG.Session.username()}</MUI.Typography>
              <MUI.Button variant="contained" onClick={refresh}>Cargar panel</MUI.Button>
            </MUI.Stack>
          )}
        </MUI.Container>
      );

    return (
      <Shell ns="SLG" title="Acceso" icon="mdi:shield-account-outline" loginGate={false} showLogout={logged}>
        {body}
      </Shell>
    );
  }

  window.SLG.mount = function () {
    const root = document.getElementById("root");
    if (!root) throw new Error("No se encontró #root");
    ReactDOM.createRoot(root).render(<App />);
  };
  window.SLG.mount();
})();
