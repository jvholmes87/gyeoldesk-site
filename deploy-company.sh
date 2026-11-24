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
# main is protected (24 NOV 2026): the sync goes to a branch and a pull request Jason merges. A failed push stops the run.
sha="$(git -C "$src" rev-parse --short HEAD)"
git add -A
if git diff --cached --quiet; then echo "Company desk $slug already matches $sha. Nothing to sync."; exit 0; fi
git commit -q -m "Sync from gyeoldesk-site $sha"
git push -q origin "HEAD:refs/heads/sync/$sha"
repo="$(git remote get-url origin | sed -E 's#.*github.com[:/]##; s#\.git$##')"
body="$(printf 'agent_runs row: %s\n\nSyncs %s.gyeoldesk.com to gyeoldesk-site %s (guards passed: main matches the build tested on preview). Merging publishes it.\n' "${AGENT_RUN:-none (Jason)}" "$slug" "$sha")"
url="$(gh api "repos/$repo/pulls" -f title="Sync from gyeoldesk-site $sha" -f head="sync/$sha" -f base=main -f body="$body" --jq .html_url)"
git reset -q --hard origin/main
echo "Sync PR for $slug: $url (Jason merges it to publish)"
