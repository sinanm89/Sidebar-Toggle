// sites.js — per-site registry + helpers.
// Side-effect-free except the explicit globalThis exposure at the bottom, so the
// SAME file loads cleanly into the content script, the service worker
// (importScripts), and the popup page (<script src>).
//
// Each site declares:
//   id        stable key used in storage
//   label     human name shown in the popup
//   test(host) -> true if this site matches the given hostname
//   hideCss   CSS injected to hide the sidebar/top-bar and reclaim the space
//   hasDim    (optional) site supports the YouTube-style cinema dim
//   dimCss    (optional) CSS injected for cinema dim
//
// All visual changes are expressed as CSS (not per-element inline styles) so they
// are idempotent and survive single-page-app re-renders for free.

const SITES = {
  wikipedia: {
    id: "wikipedia",
    label: "Wikipedia",
    test: (h) => /(^|\.)wikipedia\.org$/i.test(h),
    // Vector 2022 is a CSS grid. Hide the pinned main-menu column AND collapse the
    // grid track it occupies so the article reclaims the space. Kept as two
    // independent rules so a partial future break still hides the menu.
    hideCss: `
      #vector-main-menu-pinned-container,
      #vector-main-menu { display: none !important; }
      .mw-page-container,
      .mw-page-container-inner { grid-template-columns: 0 minmax(0, 1fr) 0 !important; }`
  },

  reddit: {
    id: "reddit",
    label: "Old Reddit",
    test: (h) => h === "old.reddit.com",
    // width:100% (not 100vw) avoids a horizontal scrollbar from the scrollbar gutter.
    hideCss: `
      .side { display: none !important; }
      .content[role="main"],
      #siteTable { width: 100% !important; max-width: none !important; }`
  },

  youtube: {
    id: "youtube",
    label: "YouTube",
    hasDim: true,
    test: (h) => h === "www.youtube.com",
    hideCss: `
      #masthead-container { display: none !important; }
      tp-yt-app-drawer#guide,
      ytd-mini-guide-renderer { display: none !important; }
      #page-manager { margin-top: 0 !important; margin-left: 0 !important; }
      ytd-app { --ytd-masthead-height: 0px !important; }
      #chips-wrapper { top: 0 !important; }`,
    // Cinema dim: black page, dim the non-player chrome (restored on hover),
    // keep the player lit. Applied only on /watch (gated in engine.applyState).
    dimCss: `
      html, body, ytd-app { background: #000 !important; }
      #secondary, #below, #comments, #masthead-container, ytd-watch-metadata {
        opacity: 0.12 !important; transition: opacity 0.15s ease-in-out;
      }
      #secondary:hover, #below:hover, #comments:hover { opacity: 1 !important; }
      #movie_player, #player, #player-container {
        opacity: 1 !important; position: relative; z-index: 1;
      }`
  },

  github: {
    id: "github",
    label: "GitHub",
    test: (h) => h === "github.com",
    // Stable role/landmark selector. Do NOT target the build-hashed
    // styles-module__appHeader__* class — it changes between GitHub deploys.
    hideCss: `
      header[role="banner"],
      .AppHeader,
      .js-header-wrapper { display: none !important; }`
  }
};

const SITE_LIST = Object.values(SITES);

function siteForHost(host) {
  return SITE_LIST.find((s) => s.test(host)) || null;
}

function siteForUrl(url) {
  try {
    return siteForHost(new URL(url).host);
  } catch (e) {
    return null;
  }
}

// Expose on the shared global so the other content-script files, the service
// worker, and the popup can all reach these regardless of lexical scoping.
Object.assign(globalThis, { SITES, SITE_LIST, siteForHost, siteForUrl });
