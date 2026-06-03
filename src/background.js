// background.js — MV3 service worker. Ephemeral: no long-lived state; every
// handler re-reads what it needs. Listeners are registered synchronously at the
// top level so a cold-started worker doesn't miss the event that woke it.

importScripts("sites.js");

// Seed defaults on install/update. Idempotent MERGE — never clobber user state.
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.get(["sites"], function (data) {
    var sites = data.sites || {};
    SITE_LIST.forEach(function (s) {
      var defaults = { enabled: true, hidden: false };
      if (s.hasDim) defaults.cinema = false;
      sites[s.id] = Object.assign(defaults, sites[s.id]);
    });
    chrome.storage.sync.set({ sites: sites, schemaVersion: 1 });
  });
});

// Keyboard commands -> tell the active tab's content script to toggle.
chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    var tab = tabs && tabs[0];
    if (!tab || !tab.id || !tab.url) return;
    var site = siteForUrl(tab.url);
    if (!site) return; // unsupported site -> no-op
    if (command === "toggle-theater" && !site.hasDim) return;

    chrome.storage.sync.get(["sites"], function (data) {
      var s = (data.sites && data.sites[site.id]) || {};
      if (s.enabled === false) return; // respect the master switch

      var key = command === "toggle-theater" ? "cinema" : "hidden";
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE", key: key }, function () {
        if (chrome.runtime.lastError) {
          // Content script absent (tab opened before install/update). Declarative
          // content scripts only auto-inject on navigation, so inject now + retry.
          chrome.scripting.executeScript(
            { target: { tabId: tab.id }, files: ["sites.js", "engine.js", "content.js"] },
            function () {
              if (chrome.runtime.lastError) return;
              chrome.tabs.sendMessage(tab.id, { type: "TOGGLE", key: key });
            }
          );
        }
      });
    });
  });
});
