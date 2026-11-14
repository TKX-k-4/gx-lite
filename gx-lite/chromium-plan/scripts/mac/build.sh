#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-$HOME/src}"
export PATH="$ROOT/depot_tools:$PATH"
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/chromium/src"
mkdir -p out/Release
cp "$REPO/config/args.common.gn" out/Release/args.gn
if [ "$(uname -m)" = "arm64" ]; then echo 'target_cpu = "arm64"' >> out/Release/args.gn; else echo 'target_cpu = "x64"' >> out/Release/args.gn; fi
gn gen out/Release
autoninja -C out/Release chrome
echo "Built. Run:  open \"$ROOT/chromium/src/out/Release/Chromium.app\""
