#!/usr/bin/env bash
# Copy this site into a company repo (e.g. ../gyeoldesk-gnc) without touching its CNAME, then commit and push.
set -euo pipefail
dest="${1:?usage: deploy-company.sh ../gyeoldesk-<slug>}"
src="$(cd "$(dirname "$0")" && pwd)"
"$src/stamp.sh" >/dev/null
cd "$dest" && git fetch -q origin main && git rebase -q origin/main
rm -rf assets index.html site.webmanifest sitemap.xml && cp -r "$src/index.html" "$src/assets" "$src/site.webmanifest" .
# Company title, icons, share image and manifest from companies/<slug>.json; robots.txt and sitemap too.
slug="$(basename "$PWD")"; slug="${slug#gyeoldesk-}"
python3 "$src/company-head.py" "$src/companies/$slug.json" .
git add -A && git commit -q -m "Sync from gyeoldesk-site $(git -C "$src" rev-parse --short HEAD)" && git push -q origin main || echo "nothing to sync"
