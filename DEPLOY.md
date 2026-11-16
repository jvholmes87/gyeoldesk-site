# Deploying Gyeoldesk (site)

Every change goes **preview first, then live**. The scripts enforce it.

| Step | Command | What it does |
|---|---|---|
| 1 | `./stamp.sh` then commit | Version-tags CSS/JS so phones load the new files |
| 2 | `./deploy-preview.sh` | Publishes the current commit to **preview.gyeoldesk.com** (`?org=gnc` for the GNC desk). Yellow PREVIEW bar on every page. Not indexed by search engines |
| 3 | Jason tests on his phone and approves on the GNC Review Desk | |
| 4 | `./deploy-live.sh` | Dry run: lists what would go live |
| 5 | `./deploy-live.sh --live` | Opens a **release pull request** (`release/<commit>`) to main with the same commit. Nothing is live yet. Refuses if the commit is not the one on preview or is not based on the current main |
| 6 | Jason merges the release PR on GitHub | gyeoldesk.com goes live (GitHub Pages builds from main) |
| 7 | `./deploy-live.sh --after-merge` | Checks main now holds exactly the tested files, then syncs every company desk (gnc.gyeoldesk.com, …) |

Rules built into the scripts:
- The preview must be a commit (no uncommitted changes), and index.html must be stamped.
- `deploy-company.sh` is a dry run unless called with `--live` (normally only by `deploy-live.sh`).
- Live refuses any commit that was not on preview.
- Agents never push to main. Only Jason's merge of a release PR changes gyeoldesk.com. Main is meant to be protected on GitHub so this holds even if a script is wrong (settings below).
- `--after-merge` refuses unless main's files match the tested commit exactly, so a squash or merge commit is fine but anything extra on main stops the company sync.

The preview uses the **live database**. Anything saved there (answers, roster changes, questions) is real. Database changes go through numbered migrations, approved on the desk, before the site code that needs them.

## Which pull requests go to main

- **Site changes** (anything under `assets/`, `index.html`, `demo/`, `site.webmanifest`, `sitemap.xml`): work on a feature branch, publish it with `./deploy-preview.sh`, and open **no** pull request of your own. After Jason approves the preview, `./deploy-live.sh --live` opens the one release PR (`release/<commit>`). Its head is exactly the commit on preview, which is what makes `--after-merge` safe.
- **Repository-only changes** (README, DEPLOY.md, `docs/`, `.github/`, tests) do not change what the sites serve. They may go to main through a normal pull request that Jason merges. Afterwards main no longer matches the commit on preview, so `--after-merge` stops by design. Before the next company sync, run `./deploy-preview.sh` from the merged main, check the preview, then run `./deploy-live.sh --after-merge`.
- Do not merge a feature PR directly into main. If one is open, close it in favor of the release PR.

Reconciled on 16 Nov 2026: PRs #6, #7 and #8 were feature PRs merged straight into main. Each had been tested on preview and main matched the tested files, but the company sync did not follow, so gnc.gyeoldesk.com stayed on 5c3da4a until 16 Nov. The rule above prevents that.

## Checks on every pull request

GitHub Actions (`.github/workflows/ci.yml`) runs `node tests/*.mjs`, `./stamp.sh --check` and a merge-marker check on every pull request and every push to main. It never deploys. A red check means do not merge.

## Branch protection for main (Jason sets this on GitHub)

Settings → Branches → Add branch protection rule, branch name pattern `main`:
- **Require a pull request before merging**: on. Required approvals: **0**, because GitHub does not let an account approve its own pull request.
- **Require status checks to pass before merging**: on, and select **Tests and stamp check** once CI has run at least once.
- **Allow force pushes**: off. **Allow deletions**: off.
- Leave "Do not allow bypassing the above settings" off so the owner can still recover in an emergency.

The company and preview repositories (`gyeoldesk-gnc`, `gyeoldesk-preview`) are written only by the deploy scripts and are not protected this way, because the scripts push to their main branch.

## License and third-party code

Gyeoldesk's own code is Copyright (c) 2026 Jason Von Holmes, all rights reserved. No open-source license is granted. Vendored third-party code keeps its own license. The notices travel with the code in `assets/vendor/THIRD_PARTY_NOTICES.txt`, so every deployed copy carries them. When you add or update a vendored file, update that file in the same commit.
