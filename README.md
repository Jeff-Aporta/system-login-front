# system-login-front

Panel web centralizado de **login**, **permisos**, **penalización** y **catálogo de servicios** Jeff-Aporta / PatyIA.

Usa el mismo backend de autenticación que **LangLab** (Azure Functions); el front habla con el **Cloudflare Worker** `system-login` (CORS + sesión enriquecida).

**Demo (GH Pages):** https://jeff-aporta.github.io/system-login-front/

## Integración en otros frontends

```javascript
// Login (comparte sessionStorage key opcional o usa SLG.Session)
await SLG.Session.login(user, password);
const headers = SLG.Session.authHeader(); // { Authorization: "Bearer ..." }

// Validar sesión + permisos
const session = await fetch(SLG.Config.apiUrl("/api/session"), { headers }).then(r => r.json());
```

## Desarrollo local

Sirve la carpeta con cualquier static server y apunta el switch **worker local** (`wrangler dev` en `../backend`).

## Stack

React 18 + MUI 5 (UMD) + Babel standalone — sin build step.

## Licencia

MIT · [Jeff-Aporta](https://github.com/Jeff-Aporta)
