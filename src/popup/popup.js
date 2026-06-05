// popup.js — the hub. Uses siteForUrl()/SITE_LIST from sites.js.

function $(id) { return document.getElementById(id); }

function getActiveTab() {
  return new Promise(function (res) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
      res(tabs && tabs[0]);
    });
  });
}

function getStored() {
  return new Promise(function (res) {
    chrome.storage.sync.get(["sites"], function (d) { res(d.sites || {}); });
  });
}

function sendMsg(tabId, msg) {
  return new Promise(function (res) {
    try {
      chrome.tabs.sendMessage(tabId, msg, function (resp) {
        res(chrome.runtime.lastError ? null : resp);
      });
    } catch (e) { res(null); }
  });
}

function isEnabled(stored, id) {
  return !(stored[id] && stored[id].enabled === false);
}

function setEnabled(id, on) {
  chrome.storage.sync.get(["sites"], function (d) {
    var sites = d.sites || {};
    var prev = sites[id] || {};
    prev.enabled = on;
    sites[id] = prev;
    chrome.storage.sync.set({ sites: sites });
  });
}

async function render() {
  var tab = await getActiveTab();
  var site = tab && tab.url ? siteForUrl(tab.url) : null;
  var stored = await getStored();

  // --- current site ---
  if (site) {
    $("current").hidden = false;
    $("unsupported").hidden = true;
    $("current-label").textContent = site.label;
    try { $("current-host").textContent = new URL(tab.url).host; } catch (e) {}

    var live = await sendMsg(tab.id, { type: "GET_STATE" });
    var st = (live && live.state) || stored[site.id] || {};
    var enabled = isEnabled(stored, site.id);

    var hide = $("hide-toggle");
    hide.checked = !!st.hidden;
    hide.disabled = !enabled;
    $("hide-label").textContent = enabled ? "Hide on this site" : "Disabled below";
    hide.onchange = function () { sendMsg(tab.id, { type: "TOGGLE", key: "hidden" }); };

    var cinemaRow = $("cinema-row");
    if (site.hasDim) {
      cinemaRow.hidden = false;
      var cinema = $("cinema-toggle");
      cinema.checked = !!st.cinema;
      cinema.disabled = !enabled;
      cinema.onchange = function () { sendMsg(tab.id, { type: "TOGGLE", key: "cinema" }); };
    } else {
      cinemaRow.hidden = true;
    }
  } else {
    $("current").hidden = true;
    $("unsupported").hidden = false;
  }

  // --- master switches ---
  var list = $("site-list");
  list.innerHTML = "";
  SITE_LIST.forEach(function (s) {
    var li = document.createElement("li");
    var label = document.createElement("label");
    label.className = "row";

    var span = document.createElement("span");
    span.className = "row-label";
    span.textContent = s.label;

    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "switch";
    cb.checked = isEnabled(stored, s.id);
    cb.onchange = function () { setEnabled(s.id, cb.checked); };

    label.appendChild(span);
    label.appendChild(cb);
    li.appendChild(label);
    list.appendChild(li);
  });
}

// Show each toggle's keyboard shortcut as a hover tooltip, and keep the footer
// in sync. We read the LIVE bindings via chrome.commands.getAll() instead of
// hardcoding, so this reflects user rebinds (chrome://extensions/shortcuts) and
// the correct platform modifier (Ctrl on Win/Linux, Command on Mac).
function applyShortcuts() {
  if (!chrome.commands || !chrome.commands.getAll) return;
  chrome.commands.getAll(function (cmds) {
    var keyFor = {};
    (cmds || []).forEach(function (c) { keyFor[c.name] = c.shortcut || ""; });

    var pairs = [
      { cmd: "toggle-sidebar", row: "hide-row", kbd: "kbd-hide" },
      { cmd: "toggle-theater", row: "cinema-row", kbd: "kbd-cinema" }
    ];
    pairs.forEach(function (p) {
      var key = keyFor[p.cmd];
      var row = $(p.row);
      if (row) {
        row.title = key
          ? "Shortcut: " + key
          : "No keyboard shortcut set — assign one at chrome://extensions/shortcuts";
      }
      var kbd = $(p.kbd);
      if (kbd) kbd.textContent = key || "unset";
    });
  });
}

// Re-render whenever state changes anywhere (toggles, other tabs, commands).
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === "sync" && changes.sites) render();
});

applyShortcuts();
render();
