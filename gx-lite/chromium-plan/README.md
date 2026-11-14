# GX Core: shave Chromium down

Plan: take the full Chromium browser and cut away what we do not need (extensions, Google services, sync, printing, and so on), then add our few extras as patches. Chromium already has tab groups, tab search, bookmarks, a password manager, find in page, and mouse back/forward, so we keep those instead of rebuilding them.

Targets: Windows 10+ and macOS 13+ (Chromium 151 and later dropped macOS 12).

## Start here
1. Read `docs/REQUIREMENTS.md` and install the prerequisites.
2. Windows: run `scripts/windows/setup.ps1` then `scripts/windows/build.ps1`.
   macOS: run `scripts/mac/setup.sh` then `scripts/mac/build.sh`.
3. Run the result:
   - Windows: `C:\src\chromium\src\out\Release\chrome.exe`
   - macOS: `open "$HOME/src/chromium/src/out/Release/Chromium.app"`
4. If something fails, send the last lines of the error.

## Milestones
| | What | Done when |
|---|---|---|
| M0 | Build and run unmodified Chromium (`chrome` target) | It opens a web page |
| M1 | Measure memory: stock Chromium vs GX Lite (Electron) with the same tabs | Numbers in `docs/MEASURING.md` |
| M2 | Shave round 1: build settings only (see `docs/SHAVING.md`) | Smaller build, measured again |
| M3 | Shave round 2: patches that remove features and UI; rebrand | Own name and icon, fewer features |
| M4 | Add our extras as patches: sidebar apps, workspaces, Opera-style tab bar | Matches the GX Lite feel |
| M5 | Installers, signing, update server | Shippable build |
| M6 | Polish and the 4-week upstream rebase routine | Stays current with Chromium security fixes |

Keep shipping GX Lite (Electron) until M4 or later.
