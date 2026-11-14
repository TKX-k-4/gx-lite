# Approach: patch set on top of upstream Chromium

We do not copy Chromium into a long-lived fork. We keep a short list of patch files (`patches/`) plus build settings (`config/`) and apply them to a pinned Chromium release. Moving to a new Chromium means re-applying the patches and fixing the ones that no longer apply. This is how ungoogled-chromium and Brave stay maintainable.

## Two kinds of shaving
1. **Build settings (GN arguments).** Turn features off at compile time. Cheap and safe, but only works for features that have a switch. See `docs/SHAVING.md`.
2. **Patches.** Edit the source to remove menus, settings pages, background services, and branding. More work, and every patch must be re-checked on each Chromium update.

## What we keep from Chromium
Tab groups, tab search, find in page, bookmarks and bookmarks bar, password manager, downloads, mouse back/forward, memory saver (tab discarding), DevTools.

## What we add later (M4)
Sidebar apps with split/overlay panels, 4 workspaces, Opera-style tab bar and search bar, custom new tab page, ad blocking, the Memory/Console/Terminal/AI-summary extras from GX Lite where they make sense.

## Facts to keep in mind
- There are no Google API keys in a self-built Chromium, so no Chrome sync and no Google Safe Browsing.
- H.264/AAC need `proprietary_codecs = true` (set in `config/`).
- Widevine (Spotify, Netflix-style sites) is licensed by Google and cannot simply be bundled. Handle later.
- Every Chromium stable release (about every 4 weeks) includes security fixes. A shaved build that falls behind is unsafe, so budget time for each rebase.
