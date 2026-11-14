#!/bin/bash
# GX Lite terminal start-up (macOS / Linux): runs opencode, offering to install it first if it is missing.
export PATH="$HOME/.opencode/bin:/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$PATH"

if ! command -v opencode >/dev/null 2>&1; then
  echo "opencode is not installed yet."
  echo "The official installer is:  curl -fsSL https://opencode.ai/install | bash"
  echo
  read -r -p "Install it now? [Y/n] " answer
  case "$answer" in
    n|N) echo "Skipped. Type: curl -fsSL https://opencode.ai/install | bash   when you are ready."; exit 0 ;;
  esac
  if curl -fsSL https://opencode.ai/install | bash; then
    export PATH="$HOME/.opencode/bin:$PATH"
    echo
  else
    echo
    echo "The installer did not finish. Other ways to install are listed at https://opencode.ai/docs"
    exit 1
  fi
fi

exec opencode "$@"
