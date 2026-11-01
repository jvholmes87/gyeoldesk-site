#!/usr/bin/env bash
# Give the CSS/JS links a version tag so browsers load new files right after each update.
set -euo pipefail
cd "$(dirname "$0")"
v=$(cat assets/app.js assets/app.css | md5sum | cut -c1-8)
sed -i -E "s#assets/app\.css(\?v=[a-z0-9]+)?#assets/app.css?v=$v#; s#assets/app\.js(\?v=[a-z0-9]+)?#assets/app.js?v=$v#" index.html
echo "stamped $v"
