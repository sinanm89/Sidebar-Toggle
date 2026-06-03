// content.js — bootstrap + SPA re-apply + messaging. Runs at document_start.
// Uses siteForHost()/applyState() exposed by sites.js / engine.js.

(function () {
  var SITE = siteForHost(location.host);
  if (!SITE) return;

  var STATE = { hidden: false, cinema: false };

  function readAndApply(sitesObj) {
    var s = (sitesObj && sitesObj[SITE.id]) || {};
    var enabled = s.enabled !== false; // default-on; master switch can disable
    STATE = { hidden: enabled && !!s.hidden, cinema: enabled && !!s.cinema };
    applyState(SITE, STATE);
  }

  // (a) apply saved state on load
  chrome.storage.sync.get(["sites"], function (data) {
    readAndApply(data.sites);
  });

  // (b) re-apply on SPA navigation (full page loads need nothing)
  function reapply() {
    applyState(SITE, STATE);
  }
  if (SITE.id === "youtube") {
    window.addEventListener("yt-navigate-finish", reapply, true);
  } else if (SITE.id === "github") {
    document.addEventListener("turbo:load", reapply, true);
    document.addEventListener("pjax:end", reapply, true); // legacy fallback
  }

  // keep state coherent across tabs / popup writes
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== "sync" || !changes.sites) return;
    readAndApply(changes.sites.newValue);
  });

  // (c) direct toggle / query messages (keyboard command via SW, or popup)
  chrome.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
    if (!msg) return;
    if (msg.type === "TOGGLE") {
      if (msg.key === "hidden") STATE.hidden = !STATE.hidden;
      else if (msg.key === "cinema" && SITE.hasDim) STATE.cinema = !STATE.cinema;
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
