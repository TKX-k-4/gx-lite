# GX Lite

Small Chromium-based browser (Electron) with a GX-style sidebar, 4 workspaces, tab groups, tab search, find-in-page, bookmarks and a customizable new tab. No extension support.

## Run
```
npm install
npm start
```

## Package
```
npm run dist     # DMG on macOS, NSIS installer on Windows
```
Build each platform on its own OS. Code signing and notarization are needed before sharing builds.

## Shortcuts
| Action | Windows | macOS |
|---|---|---|
| New / close / reopen tab | Ctrl+T / W / Shift+T | Cmd+T / W / Shift+T |
| Find in page | Ctrl+F | Cmd+F |
| Search tabs | Ctrl+Shift+A | Cmd+Shift+A |
| Address bar | Ctrl+L | Cmd+L |
| Workspace 1-4 | Ctrl+Alt+1-4 | Cmd+Opt+1-4 |
| Ask Gemini | type, press Tab, then Enter | same |
| Back / forward | Alt+Left/Right, mouse 4/5 | Cmd+[ / ], mouse 4/5 |

## Layout
- `src/main.js`: window, tabs, workspaces, groups, sidebar panels, memory sweeper, IPC
- `src/ui-preload.js`, `src/tab-preload.js`: bridges (tab preload also handles mouse 4/5 on macOS)
- `renderer/`: browser chrome (`index.html`, `ui.css`, `ui.js`), new tab, settings

## Build installers
**On GitHub (both at once):** push this folder to a GitHub repo, open the Actions tab, choose "Build installers", click Run workflow. When it finishes, download the Windows `.exe` and the Mac `.dmg` files from the run's Artifacts.

**On your own computer:** run `npm install` then `npm run dist`. A Mac produces the `.dmg` and a Windows PC produces the `.exe`. Results appear in the `dist` folder.

Builds are unsigned: Windows shows a SmartScreen warning ("More info" > "Run anyway") and macOS needs right-click > Open the first time.

## Auto-update
1. In `package.json`, under `build.publish`, replace `YOUR-GITHUB-USERNAME` with your GitHub name (and `gx-lite` if your repo is named differently). The repo must be **public**, since the app checks it without a login.
2. To ship a new version: raise `"version"` in `package.json` (for example 0.1.1), commit, then run `git tag v0.1.1` and `git push --tags`. GitHub builds both installers and publishes them as a Release.
3. Installed copies check 10 seconds after launch and every 4 hours, plus File > Check for Updates.
   - Windows: downloads in the background, shows a "Restart to update" button, and installs on the next quit regardless.
   - Mac (unsigned): shows an "Update x.y.z" button that opens the download page. Silent updates need a signed app.
Updates are skipped when running with `npm start`.

## More features
- **Address bar suggestions:** bookmarks, history and Google suggestions appear as you type (turn Google suggestions off in Settings > Privacy).
- **Page summarizer:** sparkle button in the address bar (Ctrl/Cmd+Shift+Y). Needs your own Anthropic API key in Settings.
- **Terminal:** sidebar button (Ctrl+`). Install opencode first with `npm i -g opencode-ai`, then press "Run opencode".

## Performance
- Idle tabs unload after 5 minutes by default (Settings > Performance; tabs playing audio are never unloaded).
- Sidebar Memory button shows how much each tab and app uses, with an Unload button.
- Low-memory mode (experimental, needs a restart) shares processes between tabs and enables Chromium's low-end mode.

## Updates
- Windows: downloads in the background (electron-updater), shows a "Restart now / Later" popup, and installs on quit. If electron-updater cannot read the release, GX Lite falls back to downloading the installer from the GitHub release and running it silently.
- macOS: shows an update popup, downloads the .dmg, and a helper script replaces the app and relaunches it.
- Releases must be named `vX.Y.Z`, match `"version"` in package.json, and have the .exe, .dmg, `latest.yml`, `latest-mac.yml` and `.blockmap` files attached.

## Chromium plan
`chromium-plan/` holds the plan and build scripts for the future "shave Chromium" browser. It is not part of the installer.

## Terminal and opencode
The terminal looks like macOS Terminal.app and starts `opencode` by default (scripts in the `opencode/` folder; turn it off in Settings > Terminal). If opencode is missing it offers to install it first.

## Shaving the Chromium inside GX Lite
- Settings > Performance: idle-tab unloading (default 5 min), freeze background tabs (experimental), low-memory mode (experimental, restart needed), spell check on/off.
- Extra Chromium background features are switched off at start-up; the installer keeps only the English language files.
- Measure with the sidebar Memory panel before and after each change.

## Passwords, autofill and history
- Passwords are encrypted with the OS key store (macOS Keychain, Windows data protection) in `vault.json`; the page never sees them until you click a saved login under a field.
- Sidebar key button: password manager (add, edit, show/copy with confirmation, import/export CSV, never-save list, saved address info). Sidebar clock button (or Cmd+Y / Ctrl+H): history with search and clearing.
- Not included: card numbers (deliberately), sync between devices, a master password.

## Profiles, tab groups in the bookmarks bar, extensions
- **Profiles:** the round button right of the AI summary button. Each profile has its own data folder (Google and site logins, tabs, tab groups, bookmarks, history, passwords, settings). Open one from the button's menu; it starts in its own window. Not synced between computers.
- **Tab groups in the bookmarks bar:** every tab group shows as a chip. Filled = open, outlined = saved and closed. Click to jump to it or reopen it; right-click to close or delete.
- **Extensions:** Chrome Web Store extensions via `electron-chrome-web-store` (MIT). Electron supports only part of Chrome's extension APIs, and there is no toolbar for extension buttons yet. The fuller `electron-chrome-extensions` package is GPL-3.0, so it is not used.

## Extensions button, authenticator, default browser
- **Puzzle button** (right of the AI summary button): opens a menu over the page listing your extensions. Click one to open its popup over the page, or choose Options. Popup support is partial because Electron only implements part of Chrome's extension APIs.
- **Authenticator** (profile menu, View menu, Settings): 2-step verification codes (TOTP), encrypted like passwords, with autofill on code boxes.
- **Default browser** (Settings): macOS asks you to confirm; on Windows the button opens Default apps and you pick GX Lite there.
- Tools: `tools/measure-memory.*` adds up each browser's memory for fair comparisons.
