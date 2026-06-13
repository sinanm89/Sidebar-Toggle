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
    //
    // Skip the Main Page: it now lays out its own full-width featured content, so
    // collapsing the grid there gained nothing and only fought the page's layout.
    // MediaWiki tags the Main Page <body> with `page-Main_Page` (set however you
    // reach it — pretty URL, ?title=, or the bare-domain redirect), so scoping every
    // rule to body:not(.page-Main_Page) makes them inert there with no JS and no
    // timing race. (Title-derived, so this covers the English Main Page; other-
    // language main pages carry their own page- classes.) Credit to Wikipedia — the
    // redesigned Main Page stands on its own and needs no help from us.
    hideCss: `
      body:not(.page-Main_Page) #vector-main-menu-pinned-container,
      body:not(.page-Main_Page) #vector-main-menu { display: none !important; }
      body:not(.page-Main_Page) .mw-page-container,
      body:not(.page-Main_Page) .mw-page-container-inner { grid-template-columns: 0 minmax(0, 1fr) 0 !important; }`
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
    // Hide the top masthead + left guide and fill the width. The real gotcha:
    // #frosted-glass is a position:fixed 112px panel (z-index 2018) with
    // backdrop-filter: blur(48px) sitting behind the masthead+chips. With the
    // masthead hidden it blurred the chips AND the top of the first feed row,
    // so shrink it back to 56px with no blur. (On watch pages YouTube already
    // sets #frosted-glass to display:none, so .with-chipbar scopes it to feeds.)
    hideCss: `
      #masthead-container { display: none !important; }
      tp-yt-app-drawer#guide,
      ytd-mini-guide-renderer { display: none !important; }
      #page-manager { margin-top: 0 !important; margin-left: 0 !important; }
      #chips-wrapper { top: 0 !important; }
      #frosted-glass.with-chipbar { height: 56px !important; backdrop-filter: none !important; }`,
    // Cinema dim: black page; YouTube's OWN theater (full-bleed) player fills the
    // viewport and nothing else — title, metadata, comments, related, masthead —
    // is visible. Applied only on /watch (gated in engine.applyState).
    //
    // The viewer's layout is driven through YouTube's native theater button (see
    // content.js syncCinemaTheater): cinema-on puts YouTube into its own theater
    // and cinema-off restores whatever layout the user started in. So this CSS
    // only ever grows YouTube's existing full-bleed container and overrides the
    // <video> fit — it never repositions the player, and there is deliberately NO
    // ":not([full-bleed-player])" branch that could yank the player out of flow
    // (and drop the user out of theater) if a selector or attribute ever drifts.
    // overflow:hidden kills the scroll gutter so the video reaches full width.
    dimCss: `
      html, body, ytd-app { background: #000 !important; }
      html, body { overflow: hidden !important; }
      #masthead-container { display: none !important; }
      #page-manager { margin-top: 0 !important; }

      ytd-watch-flexy[full-bleed-player] #full-bleed-container {
        height: 100vh !important; max-height: 100vh !important;
      }
      ytd-watch-flexy[full-bleed-player] #columns { display: none !important; }

      #movie_player,
      #movie_player .html5-video-player,
      #movie_player .html5-video-container { width: 100% !important; height: 100% !important; background: #000 !important; }
      #movie_player video.html5-main-video {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
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
