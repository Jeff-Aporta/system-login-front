# system-login-front

Panel web centralizado de **autenticación** para el ecosistema Jeff-Aporta / PatyIA. Permite iniciar sesión, consultar el perfil del usuario, revisar **permisos** (allow / excepciones SQL), ver el estado de **penalización** por intentos fallidos y acceder al **catálogo de servicios** enlazados.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-2ea44f?logo=githubpages&logoColor=white)](https://jeff-aporta.github.io/system-login-front/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MUI](https://img.shields.io/badge/MUI-5-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![Emotion](https://img.shields.io/badge/Emotion-11-D36AC2)](https://emotion.sh/)
[![Babel Standalone](https://img.shields.io/badge/Babel%20Standalone-7-F9DC3E?logo=babel&logoColor=black)](https://babeljs.io/)
[![Cloudflare Workers](https://img.shields.io/badge/API-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)](https://github.com/Jeff-Aporta/system-login-back)
[![Neon](https://img.shields.io/badge/BD-Neon%20BD__AUTH-00E599?logo=neon&logoColor=black)](https://neon.tech/)
[![Sin build](https://img.shields.io/badge/build-sin%20paso%20de%20build-555)](https://github.com/Jeff-Aporta/system-login-front)

## Demo

**https://jeff-aporta.github.io/system-login-front/**

## Vista previa

![Panel de login en GitHub Pages](./docs/gh-pages.png)

Front estático publicado en GitHub Pages. Consume el Worker [`system-login`](https://github.com/Jeff-Aporta/system-login-back) con sesión JWT enriquecida (rol, permisos, servicios). Es el **proveedor de auth** que usan el resto de micro-frontends del ecosistema.

## Qué hace

- **Login / logout** con las mismas credenciales del laboratorio (LangLab / PatyIA).
- **Dashboard de sesión**: usuario, rol, expiración del token.
- **Permisos**: reglas `allow` del rol y excepciones por usuario con scope SQL.
- **Penalización**: intentos fallidos y bloqueo temporal.
- **Servicios**: listado de apps del ecosistema con enlace directo.
- **Tema** claro/oscuro (dodgerblue) y switch **API local / online** (`localhost:8781` ↔ Worker).

## Integración en otros fronts

Los demás paneles reutilizan la clave `system-login:session` en `sessionStorage`:

```javascript
await SLG.Session.login(user, password);
const headers = SLG.Session.authHeader(); // Authorization: Bearer …
const session = await fetch(SLG.Config.apiUrl("/api/session"), { headers }).then(r => r.json());
```

## Desarrollo local

Sirve la carpeta raíz (`npx serve .`) y, si hace falta, levanta el backend con `wrangler dev` en [`system-login-back`](https://github.com/Jeff-Aporta/system-login-back).

## Repos relacionados

| Repo | Rol |
|------|-----|
| [system-login-back](https://github.com/Jeff-Aporta/system-login-back) | API auth (privado) |
| [system-login-front](https://github.com/Jeff-Aporta/system-login-front) | Este panel (público, GH Pages) |

MIT · [Jeff-Aporta](https://github.com/Jeff-Aporta)
