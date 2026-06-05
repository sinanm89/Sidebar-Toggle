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
- Privacy policy: https://github.com/sinanm89/Sidebar-Toggle/blob/master/PRIVACY.md
  (Not strictly required since no data is collected, but recommended — host-permission extensions draw extra review scrutiny without one.)

## Detailed description

Reclaim your screen. Sidebar Toggle hides the space-wasting sidebars and top bars on the sites where they get in the way, so the content you actually came for fills the window.

Supported sites:
- Wikipedia — hide the left navigation sidebar
- old.reddit.com — hide the right sidebar and widen the posts
- YouTube — hide the top bar and the left guide sidebar (just the videos)
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

## Privacy tab — ready-to-paste (identical fields on Chrome Web Store & Edge Add-ons)

**Single purpose description**
> Sidebar Toggle hides the sidebars and top navigation bars on four specific sites — Wikipedia, old.reddit.com, YouTube, and GitHub — so the user can reclaim screen space for content. Each site can be toggled from the toolbar popup or a keyboard shortcut, and YouTube has an optional "cinema dim" mode. That is the extension's only function.

**storage justification**
> Used with chrome.storage.sync to remember the user's own settings: which of the four supported sites are enabled, whether each site's bars are currently hidden, and the YouTube cinema-dim on/off state. This makes the choices persist across sessions and sync across the user's signed-in browsers. Nothing is sent to any server and no personal data is stored.

**scripting justification**
> Used to re-apply the hide state on a supported-site tab that was already open when the extension is installed or updated. chrome.scripting.executeScript injects the extension's own bundled content scripts so the toggle works without the user manually reloading the tab. It only ever runs the extension's packaged scripts, only on the four supported domains, and never remote or dynamically generated code.

**activeTab justification**
> Used so the toolbar popup can read the current tab's URL when the user clicks the extension icon, in order to show the correct controls for that site (e.g. the YouTube cinema-dim toggle appears only on YouTube) and apply the toggle to that tab. Access is granted only to the tab the user explicitly invokes the extension on.

**Host permission justification**
> Host access is limited to exactly the four sites the extension modifies: *.wikipedia.org, old.reddit.com, www.youtube.com, and github.com. On those domains the content script injects a small CSS stylesheet to hide the sidebar/top bar (and the YouTube cinema-dim overlay). No other sites are accessed, and the extension does not read, collect, or transmit any page content — it only applies show/hide styling.

**Remote code:** No. (Leave the "Yes" justification blank.)

**Data usage — user data collected:** none — leave every checkbox unchecked.

**Privacy policy URL:** https://github.com/sinanm89/Sidebar-Toggle/blob/master/PRIVACY.md

**Certifications:** check all three (no sale/transfer to third parties · not used for unrelated purposes · not used for creditworthiness/lending).

## Image assets to produce
- **Chrome Web Store:** store icon 128×128 (have it); ≥1 screenshot at 1280×800 or 640×400; optional small promo tile 440×280; optional marquee 1400×560.
- **Edge Add-ons:** store logo 300×300 — **done → `store/logo-300.png`**; ≥1 screenshot at 1280×800 (up to ~10).
- Suggested screenshots: before/after on Wikipedia, YouTube masthead, YouTube cinema dim, GitHub, and the popup hub.
