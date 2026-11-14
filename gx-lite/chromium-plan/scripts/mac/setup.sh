#!/usr/bin/env bash
# Install Xcode first (see docs/REQUIREMENTS.md). Usage: scripts/mac/setup.sh [ROOT] [TAG]
set -euo pipefail
ROOT="${1:-$HOME/src}"
TAG="${2:-}"
mkdir -p "$ROOT" && cd "$ROOT"

git config --global core.autocrlf false
git config --global core.filemode false

[ -d depot_tools ] || git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH="$ROOT/depot_tools:$PATH"

mkdir -p chromium && cd chromium
if [ ! -d src ]; then
  fetch --git-cache chromium          # big download; run the script again if it is interrupted
fi

if [ -n "$TAG" ]; then
  (cd src && git fetch --tags && git checkout -B "gx-$TAG" "tags/$TAG")
fi
gclient sync -D --with_branch_heads --with_tags

echo
echo "Done. Add this line to ~/.zshrc:  export PATH=\"$ROOT/depot_tools:\$PATH\""
echo "Then run scripts/mac/build.sh"
