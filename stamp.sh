#!/usr/bin/env bash
# Give the CSS/JS links a version tag so browsers load new files right after each update.
# ./stamp.sh          update index.html
# ./stamp.sh --check  exit 1 if index.html is not stamped for the current CSS/JS (used by the deploy scripts)
set -euo pipefail
cd "$(dirname "$0")"
photo_v=$(md5sum assets/war-photos.mjs | cut -c1-8)
request_v=$(md5sum assets/photo-request.mjs | cut -c1-8)
if [[ "${1:-}" != "--check" ]]; then
  sed -i -E "s#war-photos\.mjs(\?v=[a-z0-9]+)?#war-photos.mjs?v=$photo_v#" assets/app.js
  sed -i -E "s#photo-request\.mjs(\?v=[a-z0-9]+)?#photo-request.mjs?v=$request_v#" assets/app.js
fi
v=$(cat assets/app.js assets/app.css | md5sum | cut -c1-8)
if [[ "${1:-}" == "--check" ]]; then
  grep -q "photo-request.mjs?v=$request_v" assets/app.js && grep -q "war-photos.mjs?v=$photo_v" assets/app.js && grep -q "assets/app.js?v=$v" index.html && grep -q "assets/app.css?v=$v" index.html && exit 0
  echo "index.html is not stamped for the current CSS/JS. Run ./stamp.sh and commit." >&2; exit 1
fi
sed -i -E "s#assets/app\.css(\?v=[a-z0-9]+)?#assets/app.css?v=$v#; s#assets/app\.js(\?v=[a-z0-9]+)?#assets/app.js?v=$v#" index.html
echo "stamped $v"
