#!/usr/bin/env bash
# Copy this site into a company repo (e.g. ../gyeoldesk-gnc) without touching its CNAME, then commit and push.
set -euo pipefail
dest="${1:?usage: deploy-company.sh ../gyeoldesk-<slug>}"
src="$(cd "$(dirname "$0")" && pwd)"
"$src/stamp.sh" >/dev/null
cd "$dest" && git fetch -q origin main && git rebase -q origin/main
rm -rf assets index.html site.webmanifest && cp -r "$src/index.html" "$src/assets" "$src/site.webmanifest" .
# Company workspaces are private: keep them out of search engines.
sed -i 's#<meta name="robots" content="index, follow">#<meta name="robots" content="noindex, nofollow">#; s#<link rel="canonical"[^>]*>##' index.html
printf 'User-agent: *\nDisallow: /\n' > robots.txt
git add -A && git commit -q -m "Sync from gyeoldesk-site $(git -C "$src" rev-parse --short HEAD)" && git push -q origin main || echo "nothing to sync"
