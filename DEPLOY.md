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
- Agents never push to main. Only Jason's merge of a release PR changes gyeoldesk.com. Protect main on GitHub (Settings → Rules: require a pull request, block force pushes) so this holds even if a script is wrong.
- `--after-merge` refuses unless main's files match the tested commit exactly, so a squash or merge commit is fine but anything extra on main stops the company sync.

The preview uses the **live database**. Anything saved there (answers, roster changes, questions) is real. Database changes go through numbered migrations, approved on the desk, before the site code that needs them.
