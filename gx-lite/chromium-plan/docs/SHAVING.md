# What to shave

Rule: change one thing at a time, rebuild, and record binary size and memory (see `MEASURING.md`). Keep only what helps.

## Finding the real build argument names
Argument names change between Chromium versions, and `gn gen` stops with an error on a name that does not exist. So look each one up in your pinned version first. From `chromium/src`, after the first `gn gen out/Release`:

    gn args out/Release --list --short | grep -i extensions

Use a different word for each area below (`extensions`, `safe_browsing`, `printing`, `pdf`, `spell`, `speech`, `cast`, `media_router`, `translate`, `xr`, `vr`, `background`). Read the description line, then add the argument to `config/args.common.gn`.

## Candidates (check each exists before using it)
| Area | Why it can go | Careful about |
|---|---|---|
| Extensions | We do not want them | Some built-in pieces (PDF viewer) lean on the extension system |
| Safe Browsing | Needs Google keys we do not have | Removes phishing/malware warnings, a real security feature |
| Cast / media router | Rarely used | None for us |
| VR/XR | Rarely used | None for us |
| Printing / print preview | Optional | Users may want to print |
| PDF viewer | Optional | Opening PDFs in a tab is handy |
| Spellcheck | Optional | Users like it |
| Speech / voice features | Optional | None for us |
| Translate, Lens, reading list, side search, Chrome Labs | Google features | Mostly source patches, not build arguments |
| Sync, sign-in, Google services | No API keys anyway | Mostly source patches |
| Background mode / auto-start | Saves idle processes | None for us |

## Keep
WebRTC (Discord voice), media playback, WebGL/WebGPU, DevTools, password manager, DRM hooks.

## Compile-time speed and size (not removal)
`is_official_build = true` and link-time optimization shrink and speed up the binary but make builds much slower and need extra toolchain pieces. Try only after M2.
