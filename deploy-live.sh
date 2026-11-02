#!/usr/bin/env bash
# Promote the tested preview build to the live sites: gyeoldesk.com (this repo's main) and every company desk.
#   ./deploy-live.sh          dry run: shows what would go live
#   ./deploy-live.sh --live   goes live (run only after Jason approves the preview)
# Refuses unless the current commit is exactly the one on preview.gyeoldesk.com.
set -euo pipefail
src="$(cd "$(dirname "$0")" && pwd)"; cd "$src"
live=false; [[ "${1:-}" == "--live" ]] && live=true
git diff --quiet && git diff --cached --quiet || { echo "Uncommitted changes. Stop." >&2; exit 1; }
./stamp.sh --check
head="$(git rev-parse --short HEAD)"
git -C ../gyeoldesk-preview fetch -q origin main && git -C ../gyeoldesk-preview rebase -q origin/main
tested="$(python3 -c "import json;print(json.load(open('../gyeoldesk-preview/preview.json'))['commit'])")"
[[ "$head" == "$tested" ]] || { echo "This commit ($head) is not the one on preview ($tested). Run ./deploy-preview.sh and test first." >&2; exit 1; }
companies=(); for f in companies/*.json; do s="$(basename "$f" .json)"; [[ -d "../gyeoldesk-$s" ]] && companies+=("$s"); done
echo "Build $head (tested on preview) → gyeoldesk.com + ${companies[*]/#/}.gyeoldesk.com"
git log --oneline origin/main..HEAD | sed 's/^/  /'
$live || { echo "Dry run. Nothing changed. Add --live after Jason approves."; exit 0; }
git push -q origin HEAD:main
for s in "${companies[@]}"; do "$src/deploy-company.sh" "../gyeoldesk-$s" --live; done
echo "Live: $head"
