# Store listing — Sidebar Toggle

Copy for the **Chrome Web Store** and **Microsoft Edge Add-ons** listings.
Repo: https://github.com/sinanm89/Sidebar-Toggle

## Name
Sidebar Toggle

## Summary (short description — keep ≤ 132 chars; works for both stores)
Hide sidebars and top bars on Wikipedia, old Reddit, YouTube and GitHub to reclaim screen space — plus a YouTube cinema-dim mode.

## Category
Productivity

## Language
English (United States)

## URLs (point both stores here)
- Homepage / Website: https://github.com/sinanm89/Sidebar-Toggle
- Support: https://github.com/sinanm89/Sidebar-Toggle/issues

## Detailed description

Reclaim your screen. Sidebar Toggle hides the space-wasting sidebars and top bars on the sites where they get in the way, so the content you actually came for fills the window.

Supported sites:
- Wikipedia — hide the left navigation sidebar
- old.reddit.com — hide the right sidebar and widen the posts
- YouTube — hide the top masthead bar
- GitHub — hide the global top navigation header

Plus, on YouTube: a "cinema dim" mode that blacks out everything around the video so the player is the only thing lit — great for focused watching.

How it works:
- Click the toolbar icon for the popup — toggle the current site, toggle cinema dim, and choose which sites the extension is active on.
- Or use keyboard shortcuts (below).
- Your choices sync across your signed-in browsers.

Keyboard shortcuts:
- Ctrl+Shift+E — toggle hide on the current supported site
- Alt+E — YouTube only: toggle cinema dim
Some browsers reserve these combos (Edge uses Ctrl+Shift+E for sidebar search; both Chrome and Edge use Alt+E for the browser menu). If a shortcut shows as "Not set," assign it on your browser's extension-shortcuts page — your binding then wins. Everything also works from the popup.

Private by design: no accounts, no tracking, nothing leaves your browser. Settings live in your browser's sync storage, and the extension can only touch the four supported sites.

Open source (GPL-3.0): https://github.com/sinanm89/Sidebar-Toggle

## Permission justifications (for store review)
- **storage** — remember which sites are enabled and what is currently hidden, synced across the user's signed-in browsers. No data leaves the browser.
- **scripting** — re-apply the hide on tabs that were already open at the moment the extension is installed or updated.
- **activeTab** — let the popup read the current tab's site so it can show the right toggles.
- **Host access** to `*.wikipedia.org`, `old.reddit.com`, `www.youtube.com`, `github.com` — the only four sites the extension modifies. No other sites are accessed.

## Privacy / data use answers
- Collects or uses personal or sensitive user data? **No.**
- Single purpose: **hide configurable sidebars/top bars on a small set of sites to reclaim screen space.**
- Remote code? **None.** All logic ships inside the package; nothing is fetched or executed from a server (MV3-compliant).

## Image assets to produce
- **Chrome Web Store:** store icon 128×128 (have it); ≥1 screenshot at 1280×800 or 640×400; optional small promo tile 440×280; optional marquee 1400×560.
- **Edge Add-ons:** store logo 300×300 — **done → `store/logo-300.png`**; ≥1 screenshot at 1280×800 (up to ~10).
- Suggested screenshots: before/after on Wikipedia, YouTube masthead, YouTube cinema dim, GitHub, and the popup hub.
