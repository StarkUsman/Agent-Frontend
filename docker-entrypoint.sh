#!/bin/sh
set -eu

CONFIG_FILE=/usr/share/nginx/html/config.js

cat > "$CONFIG_FILE" <<EOF
window.__ENV__ = {
  VITE_MANAGER_URL: "${VITE_MANAGER_URL:-}",
  VITE_CALLS_URL: "${VITE_CALLS_URL:-}"
};
EOF

exec nginx -g 'daemon off;'
