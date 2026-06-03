# Sidebar Toggle

A tiny browser extension that hides sidebars and top bars on a few sites so you can reclaim screen space — plus a YouTube "cinema dim" mode.

| Site | What it hides |
|------|---------------|
| **Wikipedia** | the left navigation sidebar (Vector 2022) |
| **old.reddit.com** | the right sidebar (widens the post column) |
| **YouTube** | the top masthead bar |
| **GitHub** | the global top navigation header |

## Shortcuts

- **Ctrl+Shift+E** (**⌘+Shift+E** on macOS) — toggle hide on the current supported site
- **Alt+Shift+E** — YouTube only: toggle **cinema dim** (blacks out the page around the player on watch pages)

Click the toolbar icon to open the popup, where you can toggle the current site, toggle cinema dim, and choose which sites the extension is active on. Shortcuts are rebindable at `chrome://extensions/shortcuts`.

> **Microsoft Edge note:** Edge reserves **Ctrl+Shift+E** for its own *sidebar search*, so the sidebar-toggle shortcut shows as **Not set** in Edge by default. The feature still works fully from the toolbar popup. To use a keyboard shortcut in Edge, open `edge://extensions/shortcuts` and assign one — either pick any free combo (e.g. `Alt+Shift+S`), or first turn off Edge's sidebar-search shortcut and then assign `Ctrl+Shift+E`. The cinema-dim shortcut `Alt+Shift+E` works in Edge out of the box.

## Install from source (unpacked)

1. Clone this repo.
2. Open `chrome://extensions` (or `edge://extensions`) and enable **Developer mode**.
3. Click **Load unpacked** and select the **`src/`** folder.

## Build a store zip

```powershell
pwsh -NoProfile -File scripts/pack.ps1
```

Produces `dist/sidebar-toggle-<version>.zip` (the contents of `src/`), ready to upload to the Chrome Web Store or Microsoft Edge Add-ons.

## Privacy

No data is collected and nothing is sent anywhere. All state — which sites are active and what is currently hidden — lives in `chrome.storage.sync`. The extension only has access to the four supported domains.

## License

[GPL-3.0](LICENSE). Icon by Gregor Cresnar — see [CREDITS](CREDITS).
