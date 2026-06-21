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
            <MUI.TextField
              label="Usuario"
              autoComplete="username"
              fullWidth
              required
              size="small"
              sx={{ mb: 2 }}
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            <MUI.TextField
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              fullWidth
              required
              size="small"
              sx={{ mb: 2 }}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
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

  function PermissionsPanel() {
    const [users, setUsers] = React.useState([]);
    const [roles, setRoles] = React.useState([]);
    const [knownApps, setKnownApps] = React.useState([]);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState(null);
    const [editUser, setEditUser] = React.useState(null);
    const [editForm, setEditForm] = React.useState(null);
    const [saving, setSaving] = React.useState(false);

    const load = React.useCallback(async () => {
      setLoading(true);
      setErr(null);
      try {
        const [usersRes, rolesRes] = await Promise.all([
          window.SLG.Api.fetchPermissionsUsers(),
          window.SLG.Api.fetchPermissionsRoles(),
        ]);
        setUsers(Array.isArray(usersRes.users) ? usersRes.users : []);
        setIsAdmin(!!usersRes.admin);
        setRoles(Array.isArray(rolesRes.roles) ? rolesRes.roles : []);
        setKnownApps(Array.isArray(rolesRes.knownApps) ? rolesRes.knownApps : []);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }, []);

    React.useEffect(() => { load(); }, [load]);

    function openEdit(u) {
      setEditUser(u);
      setEditForm({
        role: u.role || "visitante",
        apps: Array.isArray(u.apps) ? [...u.apps] : [],
        exceptions: Array.isArray(u.exceptions)
          ? u.exceptions.map((ex) => ({
            allowrule: ex.allowrule || "",
            sqlscope: ex.sqlscope || "",
            description: ex.description || "",
          }))
          : [],
        active: u.active !== false,
      });
    }

    function closeEdit() {
      setEditUser(null);
      setEditForm(null);
    }

    async function saveEdit() {
      if (!editUser || !editForm) return;
      setSaving(true);
      setErr(null);
      try {
        await window.SLG.Api.updatePermissionsUser(editUser.username, {
          role: editForm.role,
          apps: editForm.apps,
          exceptions: editForm.exceptions.filter((ex) => String(ex.allowrule || "").trim()),
          active: editForm.active,
        });
        closeEdit();
        await load();
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setSaving(false);
      }
    }

    function toggleApp(appId) {
      setEditForm((f) => {
        if (!f) return f;
        const apps = f.apps.includes(appId)
          ? f.apps.filter((a) => a !== appId)
          : [...f.apps, appId];
        return { ...f, apps };
      });
    }

    function updateException(i, field, value) {
      setEditForm((f) => {
        if (!f) return f;
        const exceptions = f.exceptions.map((ex, idx) =>
          idx === i ? { ...ex, [field]: value } : ex,
        );
        return { ...f, exceptions };
      });
    }

    function addException() {
      setEditForm((f) => f ? {
        ...f,
        exceptions: [...f.exceptions, { allowrule: "", sqlscope: "", description: "" }],
      } : f);
    }

    function removeException(i) {
      setEditForm((f) => f ? {
        ...f,
        exceptions: f.exceptions.filter((_, idx) => idx !== i),
      } : f);
    }

    return (
      <MUI.Paper className="panel" sx={{ p: 2 }}>
        <MUI.Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <MUI.Typography variant="h6">
            {isAdmin ? "Permisos de usuarios" : "Mis permisos"}
          </MUI.Typography>
          <MUI.Button size="small" onClick={load} disabled={loading}>Actualizar</MUI.Button>
        </MUI.Stack>
        {err && <MUI.Alert severity="error" sx={{ mb: 2 }}>{err}</MUI.Alert>}
        {loading && <MUI.CircularProgress size={24} />}
        {!loading && (
          <MUI.Table size="small">
            <MUI.TableHead>
              <MUI.TableRow>
                <MUI.TableCell>Usuario</MUI.TableCell>
                <MUI.TableCell>Rol</MUI.TableCell>
                <MUI.TableCell>Apps</MUI.TableCell>
                <MUI.TableCell>Estado</MUI.TableCell>
                {isAdmin && <MUI.TableCell align="right">Acciones</MUI.TableCell>}
              </MUI.TableRow>
            </MUI.TableHead>
            <MUI.TableBody>
              {users.map((u) => (
                <MUI.TableRow key={String(u.username)}>
                  <MUI.TableCell>
                    <MUI.Typography variant="body2" fontWeight={600}>{String(u.username)}</MUI.Typography>
                    {u.displayName && (
                      <MUI.Typography variant="caption" color="text.secondary">{String(u.displayName)}</MUI.Typography>
                    )}
                  </MUI.TableCell>
                  <MUI.TableCell>{String(u.role || "—")}</MUI.TableCell>
                  <MUI.TableCell>
                    {(u.apps || []).map((a) => (
                      <MUI.Chip key={String(a)} label={String(a)} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </MUI.TableCell>
                  <MUI.TableCell>
                    <MUI.Chip
                      label={u.active === false ? "Inactivo" : "Activo"}
                      size="small"
                      color={u.active === false ? "default" : "success"}
                    />
                  </MUI.TableCell>
                  {isAdmin && (
                    <MUI.TableCell align="right">
                      <MUI.Button size="small" onClick={() => openEdit(u)}>Editar</MUI.Button>
                    </MUI.TableCell>
                  )}
                </MUI.TableRow>
              ))}
            </MUI.TableBody>
          </MUI.Table>
        )}

        {!loading && users.length === 1 && !isAdmin && (
          <MUI.Box sx={{ mt: 2 }}>
            <MUI.Typography variant="subtitle2" gutterBottom>Reglas del rol</MUI.Typography>
            {(users[0].allow || []).map((rule, i) => (
              <MUI.Chip key={i} label={String(rule)} size="small" sx={{ mr: 0.5, mb: 0.5, fontFamily: "monospace" }} />
            ))}
            {(users[0].exceptions || []).length > 0 && (
              <MUI.Box sx={{ mt: 2 }}>
                <MUI.Typography variant="subtitle2" gutterBottom>Excepciones</MUI.Typography>
                {(users[0].exceptions || []).map((ex, i) => (
                  <MUI.Typography key={i} variant="body2" className="rule-mono" sx={{ mb: 0.5 }}>
                    {String(ex.allowrule)}{ex.sqlscope ? " · " + ex.sqlscope : ""}
                  </MUI.Typography>
                ))}
              </MUI.Box>
            )}
          </MUI.Box>
        )}

        <MUI.Dialog open={!!editUser} onClose={closeEdit} fullWidth maxWidth="sm">
          <MUI.DialogTitle>Permisos — {editUser ? String(editUser.username) : ""}</MUI.DialogTitle>
          <MUI.DialogContent dividers>
            {editForm && (
              <MUI.Stack spacing={2} sx={{ pt: 1 }}>
                <MUI.TextField
                  select
                  label="Rol"
                  size="small"
                  fullWidth
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  {roles.map((r) => (
                    <MUI.MenuItem key={String(r.role)} value={String(r.role)}>
                      {String(r.role)} — {String(r.description || "")}
                    </MUI.MenuItem>
                  ))}
                </MUI.TextField>
                <MUI.Box>
                  <MUI.Typography variant="subtitle2" gutterBottom>Aplicaciones</MUI.Typography>
                  <MUI.Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {knownApps.map((a) => (
                      <MUI.Chip
                        key={String(a)}
                        label={String(a)}
                        size="small"
                        color={editForm.apps.includes(a) ? "primary" : "default"}
                        onClick={() => toggleApp(a)}
                        sx={{ cursor: "pointer" }}
                      />
                    ))}
                  </MUI.Stack>
                </MUI.Box>
                <MUI.Box>
                  <MUI.Stack direction="row" justifyContent="space-between" alignItems="center">
                    <MUI.Typography variant="subtitle2">Excepciones</MUI.Typography>
                    <MUI.Button size="small" onClick={addException}>Añadir</MUI.Button>
                  </MUI.Stack>
                  {editForm.exceptions.map((ex, i) => (
                    <MUI.Stack key={i} direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                      <MUI.TextField
                        label="Regla"
                        size="small"
                        value={ex.allowrule}
                        onChange={(e) => updateException(i, "allowrule", e.target.value)}
                        sx={{ flex: 2 }}
                      />
                      <MUI.TextField
                        label="Ámbito SQL"
                        size="small"
                        value={ex.sqlscope}
                        onChange={(e) => updateException(i, "sqlscope", e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <MUI.IconButton size="small" color="error" onClick={() => removeException(i)}>
                        <span className="mdi mdi-delete-outline" />
                      </MUI.IconButton>
                    </MUI.Stack>
                  ))}
                </MUI.Box>
                <MUI.FormControlLabel
                  control={
                    <MUI.Switch
                      checked={editForm.active}
                      onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                    />
                  }
                  label="Usuario activo"
                />
              </MUI.Stack>
            )}
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={closeEdit}>Cancelar</MUI.Button>
            <MUI.Button variant="contained" onClick={saveEdit} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>
      </MUI.Paper>
    );
  }

  function Dashboard({ data, onRefresh }) {
    const d = data;
    const u = d.user || {};
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

        <PermissionsPanel />

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
      <Shell ns="SLG" loginGate={false} showLogout={logged}>
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
