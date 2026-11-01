# gyeoldesk-site

Static web app for Gyeoldesk. One codebase for every company:

- `gyeoldesk.com` shows the company cards.
- `<company>.gyeoldesk.com` opens that company's workspace (sign-in, WAR, team access).
- Local test: `python3 -m http.server` then open `http://localhost:8000/?org=gnc`.

The Supabase publishable key in `assets/app.js` is meant for browsers; data is protected by row-level security.
`assets/vendor/supabase.mjs` is supabase-js 2.118.0 bundled with esbuild.
