#!/usr/bin/env bash
# Promote the tested preview build to the live sites. gyeoldesk.com goes live only when Jason merges a pull request.
#   ./deploy-live.sh               dry run: shows what would go live
#   ./deploy-live.sh --live        opens a release pull request to main (run only after Jason approves the preview)
#   ./deploy-live.sh --after-merge after Jason merges: checks main matches the tested build, then syncs every company desk
# Refuses unless the current commit is exactly the one on preview.gyeoldesk.com.
set -euo pipefail
src="$(cd "$(dirname "$0")" && pwd)"; cd "$src"
mode="dry"; case "${1:-}" in --live) mode="pr";; --after-merge) mode="sync";; "") ;; *) echo "Unknown option ${1}. Use --live or --after-merge." >&2; exit 1;; esac
repo="jvholmes87/gyeoldesk-site"
git diff --quiet && git diff --cached --quiet || { echo "Uncommitted changes. Stop." >&2; exit 1; }
! git grep -n -E '^(<<<<<<<|>>>>>>>)( |$)' -- index.html assets || { echo "Merge conflict markers found. Stop." >&2; exit 1; }
./stamp.sh --check
head="$(git rev-parse --short HEAD)"
git -C ../gyeoldesk-preview fetch -q origin main && git -C ../gyeoldesk-preview rebase -q origin/main
tested="$(python3 -c "import json;print(json.load(open('../gyeoldesk-preview/preview.json'))['commit'])")"
[[ "$head" == "$tested" ]] || { echo "This commit ($head) is not the one on preview ($tested). Run ./deploy-preview.sh and test first." >&2; exit 1; }
git fetch -q origin main:refs/remotes/origin/main
companies=(); for f in companies/*.json; do s="$(basename "$f" .json)"; [[ -d "../gyeoldesk-$s" ]] && companies+=("$s"); done

if [[ "$mode" == "sync" ]]; then
  # main must hold exactly the tested files (works for merge, squash or rebase merges).
  [[ "$(git rev-parse 'origin/main^{tree}')" == "$(git rev-parse 'HEAD^{tree}')" ]] || {
    echo "main ($(git rev-parse --short origin/main)) does not match the tested build $head. Has Jason merged the release PR? Stop." >&2; exit 1; }
  for s in "${companies[@]}"; do "$src/deploy-company.sh" "../gyeoldesk-$s" --live; done
  echo "Live: $head on gyeoldesk.com and ${companies[*]/%/.gyeoldesk.com}"
  exit 0
fi

git merge-base --is-ancestor origin/main HEAD || { echo "This build is not based on the current main. Rebase onto origin/main, redo preview, then retry." >&2; exit 1; }
echo "Build $head (tested on preview) → release PR to main, then ${companies[*]/%/.gyeoldesk.com} after merge"
log="$(git log --oneline origin/main..HEAD)"; [[ -n "$log" ]] || { echo "main already has this build. Nothing to release."; exit 0; }
echo "$log" | sed 's/^/  /'
[[ "$mode" == "pr" ]] || { echo "Dry run. Nothing changed. Add --live after Jason approves the preview."; exit 0; }

branch="release/$head"
git push -q origin "HEAD:refs/heads/$branch"
title="Release $head: $(git log -1 --format=%s HEAD)"
body="$(printf 'Tested on preview.gyeoldesk.com as commit %s. Jason approved the preview.\n\nMerging this puts gyeoldesk.com live. Then run ./deploy-live.sh --after-merge to sync the company desks.\n\nCommits:\n%s\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n' "$head" "$(echo "$log" | sed 's/^/- /')")"
url="$(gh api "repos/$repo/pulls" -f title="$title" -f head="$branch" -f base=main -f body="$body" --jq .html_url)"
echo "Release PR: $url"
echo "Jason merges it. Then: ./deploy-live.sh --after-merge"
