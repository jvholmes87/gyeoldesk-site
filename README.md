# Gyeoldesk — frontend source

Bilingual (Korean/English) project desk for Korean construction contractors working on USFK installations. This repository is the canonical frontend source for the [public site](https://gyeoldesk.com/), the [fictional-data demo](https://gyeoldesk.com/demo/) and every company workspace. Backend, database, document intake and data collectors are maintained separately in a private repository.

## Where it runs

| Address | What it is | Built from |
|---|---|---|
| https://gyeoldesk.com/ | Public product page and company cards | `main` of this repository (GitHub Pages) |
| https://gyeoldesk.com/demo/ | Short link to `?org=demo`, a fictional company that never contacts the database | `main` of this repository |
| `https://<company>.gyeoldesk.com/` (for example `gnc.gyeoldesk.com`) | That company's workspace; sign-in required | A company repository such as `gyeoldesk-gnc`: a copy of this repository made after each release, not a separate product |
| https://preview.gyeoldesk.com/ | Review build, hidden from search engines. **It uses the live database**, so anything saved there is real | `gyeoldesk-preview`, published by `deploy-preview.sh` |

Read [DEPLOY.md](DEPLOY.md): changes go to preview first. Jason reviews them, then merges the release pull request, and the company copies are synchronized after that merge. A company workspace shows the release it was last synchronized to; its repository's latest commit message names the source commit.

## What is built

- **Released on `main`:** the Weekly Action Report (WAR) board, a working draft through the week that locks when finalized, with print/PDF and JPG download; WAR project pages with approved progress photos; a read-only contacts page; and team access, where an admin approves each person. People sign in with their company email. A company workspace gets each release at its next synchronization.
- **Shown as "Coming soon", not built yet:** Projects, Proposals, Warranties and project questions.

## Local test

`python3 -m http.server`, then open `http://localhost:8000/?org=demo` for the demo. `?org=gnc` opens the GNC workspace sign-in against the live database.

The Supabase publishable key in `assets/app.js` is meant for browsers; data is protected by row-level security in the database.

## Third-party code

- `assets/vendor/supabase.mjs`: supabase-js 2.118.0 (MIT License), bundled with esbuild.
- `assets/vendor/modern-screenshot.mjs`: modern-screenshot 4.7.0 (MIT License), loaded only when someone downloads the WAR board as a JPG.

More: [docs/war-photo-integration.md](docs/war-photo-integration.md) describes how WAR progress photos reach the board.

## Demo company (`?org=demo`)

`gyeoldesk.com/?org=demo` (short link `gyeoldesk.com/demo/`) opens **Halyard Works Contractors**, a fictional company from Songtan Labs' game Forkline. It runs the same app code with bundled data and never contacts the database:

- `assets/demo.mjs` answers every Supabase request from `assets/demo/data.json`. Reads work; saves, RPCs, functions and sign-in are refused with "Demo: changes are not saved".
- `demo-src/build_demo.py` writes the data. Dates are written for the week of 2026-11-05 and move forward by whole weeks in the browser, so the demo always shows the current week.
- Photos are labelled illustrations in `assets/demo/photos/`, never site photos.
- `tests/demo.test.mjs` checks that nothing reaches the network and that every write is refused.
