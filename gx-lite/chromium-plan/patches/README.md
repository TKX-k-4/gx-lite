# Patches

Our changes to Chromium live here as a series of patch files, so moving to a new Chromium version means re-applying a short list instead of merging a huge fork.

- Make a change inside `chromium/src`, commit it, then export: `git format-patch -1 -o <this folder>`.
- List patch files in `series` in the order they apply.
- Apply them with `git am` from `chromium/src`.

Empty until milestone M2.
