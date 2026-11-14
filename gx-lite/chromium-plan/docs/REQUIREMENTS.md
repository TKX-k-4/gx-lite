# Requirements

## Windows
- Windows 10 or newer, 64-bit (x86-64) machine.
- At least 8 GB RAM; more than 16 GB is strongly recommended (64 GB is not excessive). 20+ cores help a lot.
- At least 100 GB free on an NTFS SSD. Put the checkout near the drive root (default `C:\src`), no spaces in the path.
- Visual Studio 2022 with "Desktop development with C++" and the "MFC/ATL" sub-component, plus the Windows 11 SDK and its Debugging Tools. Chromium's docs for your pinned version list the exact SDK number: https://chromium.googlesource.com/chromium/src/+/main/docs/windows_build_instructions.md
- Git for Windows installed directly.
- Exclude the checkout folder from antivirus and Windows Search indexing, or builds are much slower.

## macOS
- macOS 13 or newer to run what we build (Chromium 151+ dropped macOS 12).
- Full Xcode (not just command line tools). The required version is listed in Chromium's mac build instructions for your pinned version: https://chromium.googlesource.com/chromium/src/+/main/docs/mac_build_instructions.md
- Same disk and RAM guidance as Windows.

## Time
- Download: hours depending on your connection.
- First build: hours on a typical laptop, much less on a many-core desktop. Later builds only rebuild what changed.

## Choosing the Chromium version
Pin a stable release tag, not `main`. Find the current stable at https://chromiumdash.appspot.com/releases and pass its full version number to the setup script as the tag. Every new stable release (about every 4 weeks) has security fixes, so plan to move the pin forward regularly.
