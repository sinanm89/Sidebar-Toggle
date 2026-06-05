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
    // Cinema dim: black page; the WHOLE video fits inside the viewport
    // (object-fit: contain letterboxes it) and nothing else — title, metadata,
    // comments, related, masthead — is visible. Applied only on /watch (gated in
    // engine.applyState).
    //
    // CRUCIAL: this must NOT disturb YouTube's own theater (full-bleed) mode.
    // So we branch on the layout YouTube is already in, and in theater mode we
    // grow YouTube's OWN player container instead of yanking the player out:
    //
    //  • Theater (ytd-watch-flexy[full-bleed-player]): the player already spans
    //    the full width in #full-bleed-container. We just grow that container to
    //    100vh and hide #columns (the metadata/related block that sits below it).
    //    #movie_player stays in normal flow (position unchanged), so YouTube's
    //    theater state is left completely alone — no reposition, no relayout that
    //    would flip it back to default.
    //
    //  • Default / two-column (:not([full-bleed-player])): the player lives in a
    //    narrow column, so there it IS pinned position:fixed to fill the viewport,
    //    and #secondary/#below/#comments are hidden. (No theater state to disturb
    //    here.) z-index can't be relied on across YouTube's nested stacking
    //    contexts, so we hide the neighbours rather than try to out-stack them.
    //
    // In both modes we override the per-frame inline width/height/left/top YouTube
    // sets on the <video> with !important + object-fit:contain, so the fit holds
    // without depending on YouTube's resize handler firing. overflow:hidden kills
    // the scroll gutter so the video reaches the full width.
    dimCss: `
      html, body, ytd-app { background: #000 !important; }
      html, body { overflow: hidden !important; }
      #masthead-container { display: none !important; }
      #page-manager { margin-top: 0 !important; }

      ytd-watch-flexy[full-bleed-player] #full-bleed-container {
        height: 100vh !important; max-height: 100vh !important;
      }
      ytd-watch-flexy[full-bleed-player] #columns { display: none !important; }

      ytd-watch-flexy:not([full-bleed-player]) #movie_player {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 9999 !important;
      }
      ytd-watch-flexy:not([full-bleed-player]) #secondary,
      ytd-watch-flexy:not([full-bleed-player]) #below,
      ytd-watch-flexy:not([full-bleed-player]) #comments { display: none !important; }

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
