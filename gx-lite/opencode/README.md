# opencode folder

GX Lite's terminal starts `opencode` by default. This folder holds the start-up scripts it runs:

- `bootstrap.sh` (macOS): finds opencode, offers to install it with the official installer if missing, then runs it.
- `bootstrap.ps1` (Windows): same, using npm (`npm install -g opencode-ai`). The opencode team recommends WSL for the best experience on Windows; native Windows works through npm, Scoop or Chocolatey.

When you quit opencode you land in a normal shell. Press Restart in the terminal to start opencode again.

Turn the auto-start off in Settings > Terminal.

## Where opencode is looked for
`~/.opencode/bin` (official installer), Homebrew (`/opt/homebrew/bin`, `/usr/local/bin`), `~/.local/bin`, and on Windows the npm, Scoop and Chocolatey folders.

## First run
opencode asks you to connect an AI provider the first time (use its `/connect` command). That needs your own account or API key.

Official docs: https://opencode.ai/docs
