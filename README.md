# Gyeoldesk — frontend source

Bilingual construction project desk for company reporting, team access and project coordination. This repository is the canonical frontend source for the [live site](https://gyeoldesk.com/) and [fictional-data demo](https://gyeoldesk.com/demo/). Backend, intake and database engineering are maintained separately in a private repository.

`gyeoldesk-preview` is the review deployment; `gyeoldesk-gnc` is a company deployment copy, not a separate product. Read [DEPLOY.md](DEPLOY.md): changes go to preview first, then Jason reviews and merges the release before company copies are synchronized.

One frontend codebase serves every company:

- `gyeoldesk.com` shows the company cards.
- `<company>.gyeoldesk.com` opens that company's workspace (sign-in, WAR, team access).
- Local test: `python3 -m http.server` then open `http://localhost:8000/?org=gnc`.

The Supabase publishable key in `assets/app.js` is meant for browsers; data is protected by row-level security.
`assets/vendor/supabase.mjs` is supabase-js 2.118.0 bundled with esbuild.

## Demo company (`?org=demo`)

`gyeoldesk.com/?org=demo` (short link `gyeoldesk.com/demo/`) opens **Halyard Works Contractors**, a fictional company from Songtan Labs' game Forkline. It runs the same app code with bundled data and never contacts the database:

- `assets/demo.mjs` answers every Supabase request from `assets/demo/data.json`. Reads work; saves, RPCs, functions and sign-in are refused with "Demo: changes are not saved".
- `demo-src/build_demo.py` writes the data. Dates are written for the week of 2026-11-05 and move forward by whole weeks in the browser, so the demo always shows the current week.
- Photos are labelled illustrations in `assets/demo/photos/`, never site photos.
- `tests/demo.test.mjs` checks that nothing reaches the network and that every write is refused.
