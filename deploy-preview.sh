#!/usr/bin/env bash
# Publish the current commit to preview.gyeoldesk.com (repo ../gyeoldesk-preview). Never touches the live sites.
# The preview uses the LIVE database: anything saved there is real. It is kept out of search engines.
set -euo pipefail
src="$(cd "$(dirname "$0")" && pwd)"; dest="${1:-$src/../gyeoldesk-preview}"
cd "$src"
git diff --quiet && git diff --cached --quiet || { echo "Commit your changes first: the preview must be a commit." >&2; exit 1; }
./stamp.sh --check
commit="$(git rev-parse --short HEAD)"; branch="$(git rev-parse --abbrev-ref HEAD)"
cd "$dest" && git fetch -q origin main && git rebase -q origin/main
rm -rf assets index.html site.webmanifest sitemap.xml && cp -r "$src/index.html" "$src/assets" "$src/site.webmanifest" .
python3 - "$commit" <<'PY'
import re, sys
c = sys.argv[1]; p = 'index.html'; s = open(p, encoding='utf-8').read()
s = s.replace('<meta name="robots" content="index, follow">', '<meta name="robots" content="noindex, nofollow">')
s = re.sub(r'\s*<link rel="canonical"[^>]*>', '', s)
s = re.sub(r'<title>[^<]*</title>', '<title>PREVIEW · Gyeoldesk</title>', s, count=1)
s = s.replace('<meta charset="utf-8">', f'<meta charset="utf-8">\n  <meta name="gd-build" content="{c}">', 1)
open(p, 'w', encoding='utf-8').write(s)
PY
printf 'User-agent: *\nDisallow: /\n' > robots.txt
printf '{"commit":"%s","branch":"%s","at":"%s"}\n' "$commit" "$branch" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > preview.json
git add -A && git commit -q -m "Preview $commit ($branch)" && git push -q origin main || echo "nothing new to preview"
echo "Preview: https://preview.gyeoldesk.com/  (company desk: https://preview.gyeoldesk.com/?org=gnc)  build $commit"
