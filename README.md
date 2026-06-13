# Sidebar Toggle

A tiny browser extension that hides sidebars and top bars on a few sites so you can reclaim screen space — plus a YouTube "cinema dim" mode.

| Site | What it hides |
|------|---------------|
| **Wikipedia** | the left navigation sidebar on article pages (Vector 2022) — the Main Page is left as-is |
| **old.reddit.com** | the right sidebar (widens the post column) |
| **YouTube** | the top bar **and** the left guide sidebar (just the videos) |
| **GitHub** | the global top navigation header |

## Demo

[![Sidebar Toggle — demo video](https://img.youtube.com/vi/fz5KA_R-lxw/hqdefault.jpg)](https://www.youtube.com/watch?v=fz5KA_R-lxw)

## Shortcuts

- **Ctrl+Shift+E** (**⌘+Shift+E** on macOS) — toggle hide on the current supported site
- **Alt+E** — YouTube only: toggle **cinema dim** (blacks out the page around the player on watch pages)

Click the toolbar icon to open the popup, where you can toggle the current site, toggle cinema dim, and choose which sites the extension is active on. Shortcuts are rebindable at `chrome://extensions/shortcuts` (or `edge://extensions/shortcuts`; on Firefox, `about:addons` → ⚙ → **Manage Extension Shortcuts**).

> **Browser-reserved shortcuts:** Some browsers claim these combos for their own features — **Edge** uses `Ctrl+Shift+E` for sidebar search, and **both Chrome and Edge** use `Alt+E` to open the browser menu. When a combo is reserved, the browser shows the command as **Not set** until you assign it yourself on the extension-shortcuts page — once you do, the extension's binding takes priority. Every action is always available from the toolbar popup, so the keyboard shortcuts are purely a convenience.

## Install from source (unpacked)

**Chrome / Edge**

1. Clone this repo.
2. Open `chrome://extensions` (or `edge://extensions`) and enable **Developer mode**.
3. Click **Load unpacked** and select the **`src/`** folder.

**Firefox**

1. Build the Firefox package: `pwsh -NoProfile -File scripts/pack.ps1 -Target firefox`.
2. Open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…**.
3. Select **`dist/firefox/manifest.json`**. (Temporary add-ons last until you restart Firefox.)

Chrome/Edge load `src/` directly, but Firefox needs the built `dist/firefox/` because that
manifest carries the add-on id `storage.sync` requires. On first use Firefox may ask you to grant
access to each supported site (Firefox treats host permissions as opt-in) — allow them so the
toggles work.

## Build store packages

```powershell
pwsh -NoProfile -File scripts/pack.ps1                 # both (default)
pwsh -NoProfile -File scripts/pack.ps1 -Target chrome
pwsh -NoProfile -File scripts/pack.ps1 -Target firefox
```

From the same `src/`, this produces:

- `dist/sidebar-toggle-<version>.zip` — Chrome Web Store **and** Microsoft Edge Add-ons.
- `dist/sidebar-toggle-<version>-firefox.zip` — [addons.mozilla.org](https://addons.mozilla.org) (AMO),
  with a Firefox-flavoured manifest (add-on id + event-page background; only `manifest.json` differs).
  The unpacked build is left at `dist/firefox/` — validate it for AMO with
  `web-ext lint --source-dir dist/firefox`.

## Privacy

No data is collected and nothing is sent anywhere. All state — which sites are active and what is currently hidden — lives in `chrome.storage.sync`. The extension only has access to the four supported domains.

## License

[GPL-3.0](LICENSE). Icon by Gregor Cresnar — see [CREDITS](CREDITS).
