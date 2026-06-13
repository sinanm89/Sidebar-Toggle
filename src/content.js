// content.js — bootstrap + SPA re-apply + messaging. Runs at document_start.
// Uses siteForHost()/applyState() exposed by sites.js / engine.js.

(function () {
  var SITE = siteForHost(location.host);
  if (!SITE) return;

  var STATE = { hidden: false, cinema: false };

  // --- YouTube cinema dim drives YouTube's OWN theater ---------------------
  // Cinema dim spotlights YouTube's native theater (full-bleed) player, so we
  // put YouTube into theater when cinema turns on and restore the user's prior
  // layout when it turns off — remembering whether WE were the one that entered
  // theater. That is why dim never disables a theater setting the user had on,
  // and never needs to reposition the player. /watch only (where the player and
  // its size button exist). The dim CSS lives in sites.js.
  var sbtEnteredTheater = false; // did WE enter theater for cinema? (drives restore)
  var sbtTheaterBusy = false;    // a click / retry-loop is in flight (de-dupes syncs)

  function ytSizeBtn() { return document.querySelector(".ytp-size-button"); }
  function ytIsTheater() {
    var f = document.querySelector("ytd-watch-flexy");
    return !!(f && f.hasAttribute("full-bleed-player"));
  }
  // The player chrome may not be mounted yet right after a load/navigation, so
  // retry until the size button appears. No-op (and sets no flag) if the user is
  // already in theater — that is their setting to keep.
  function ytEnterTheater(triesLeft) {
    if (!STATE.cinema || ytIsTheater()) { sbtTheaterBusy = false; return; }
    var b = ytSizeBtn();
    if (b) {
      b.click();
      sbtEnteredTheater = true;
      setTimeout(function () { sbtTheaterBusy = false; }, 600); // let the attribute settle
      return;
    }
    if (triesLeft > 0) setTimeout(function () { ytEnterTheater(triesLeft - 1); }, 250);
    else sbtTheaterBusy = false;
  }
  function syncCinemaTheater() {
    if (SITE.id !== "youtube" || location.pathname !== "/watch") return;
    if (STATE.cinema) {
      if (sbtTheaterBusy) return; // one loop / click at a time
      sbtTheaterBusy = true;
      ytEnterTheater(16);
    } else {
      sbtTheaterBusy = false;
      if (sbtEnteredTheater && ytIsTheater()) {
        var b = ytSizeBtn();
        if (b) b.click(); // we entered theater for cinema → restore the user's layout
      }
      sbtEnteredTheater = false;
    }
  }

  function readAndApply(sitesObj) {
    var s = (sitesObj && sitesObj[SITE.id]) || {};
    var enabled = s.enabled !== false; // default-on; master switch can disable
    STATE = { hidden: enabled && !!s.hidden, cinema: enabled && !!s.cinema };
    applyState(SITE, STATE);
  }

  // (a) apply saved state on load. Re-establish cinema's theater here (the active
  // page) — NOT inside readAndApply, which also runs for cross-tab storage events.
  chrome.storage.sync.get(["sites"], function (data) {
    readAndApply(data.sites);
    syncCinemaTheater();
  });

  // (b) re-apply on SPA navigation (full page loads need nothing)
  function reapply() {
    applyState(SITE, STATE);
    syncCinemaTheater();
  }
  if (SITE.id === "youtube") {
    window.addEventListener("yt-navigate-finish", reapply, true);
  } else if (SITE.id === "github") {
    document.addEventListener("turbo:load", reapply, true);
    document.addEventListener("pjax:end", reapply, true); // legacy fallback
  }

  // keep state coherent across tabs / popup writes. CSS only here — we never drive
  // YouTube's native theater from a storage event, so a background tab can't click
  // the player controls out from under the user.
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== "sync" || !changes.sites) return;
    readAndApply(changes.sites.newValue);
  });

  // (c) direct toggle / query messages (keyboard command via SW, or popup)
  chrome.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
    if (!msg) return;
    if (msg.type === "TOGGLE") {
      if (msg.key === "hidden") STATE.hidden = !STATE.hidden;
      else if (msg.key === "cinema" && SITE.hasDim) {
        STATE.cinema = !STATE.cinema;
        syncCinemaTheater(); // enter native theater, or restore the user's layout
      }
      applyState(SITE, STATE);
      persist();
      sendResponse({ ok: true, site: SITE.id, state: STATE, hasDim: !!SITE.hasDim });
    } else if (msg.type === "GET_STATE") {
      sendResponse({ ok: true, site: SITE.id, state: STATE, hasDim: !!SITE.hasDim });
    }
    return true;
  });

  // content script owns the write on a direct toggle; storage.onChanged then
  // fans the new state out to other tabs of the same site and the popup.
  function persist() {
    chrome.storage.sync.get(["sites"], function (data) {
      var sites = data.sites || {};
      var prev = sites[SITE.id] || {};
      sites[SITE.id] = Object.assign({}, prev, {
        hidden: STATE.hidden,
        cinema: STATE.cinema
      });
      chrome.storage.sync.set({ sites: sites });
    });
  }
})();
