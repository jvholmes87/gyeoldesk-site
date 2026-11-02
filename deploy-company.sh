#!/usr/bin/env bash
# Copy this site into a company repo (e.g. ../gyeoldesk-gnc) without touching its CNAME, then commit and push.
# Normally called by ./deploy-live.sh --live. On its own it only does a dry run unless given --live.
set -euo pipefail
dest="${1:?usage: deploy-company.sh ../gyeoldesk-<slug> [--live]}"
src="$(cd "$(dirname "$0")" && pwd)"
[[ "${2:-}" == "--live" ]] || { echo "Dry run: would publish $(git -C "$src" rev-parse --short HEAD) to $dest. Use ./deploy-live.sh --live after approval."; exit 0; }
"$src/stamp.sh" --check
cd "$dest" && git fetch -q origin main && git rebase -q origin/main
rm -rf assets index.html site.webmanifest sitemap.xml && cp -r "$src/index.html" "$src/assets" "$src/site.webmanifest" .
# Company title, icons, share image and manifest from companies/<slug>.json; robots.txt and sitemap too.
slug="$(basename "$PWD")"; slug="${slug#gyeoldesk-}"
python3 "$src/company-head.py" "$src/companies/$slug.json" .
git add -A && git commit -q -m "Sync from gyeoldesk-site $(git -C "$src" rev-parse --short HEAD)" && git push -q origin main || echo "nothing to sync"
