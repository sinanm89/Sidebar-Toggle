// engine.js — CSS-injection toggle engine (content-script world only).
// Declares sbtSetStyle() and applyState() as globals for content.js to call.
//
// Each behavior is a single <style> element toggled by presence. Adding/removing
// one node is idempotent and cheap, and global CSS automatically styles any
// late-mounted SPA nodes that match — so no MutationObserver is needed.

var SBT_HIDE_STYLE_ID = "sbt-hide-style";
var SBT_DIM_STYLE_ID = "sbt-dim-style";

function sbtSetStyle(id, css, on) {
  var el = document.getElementById(id);
  if (on) {
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      el.textContent = css;
      // <head> may not exist yet at document_start — documentElement always does.
      (document.head || document.documentElement).appendChild(el);
    } else if (el.textContent !== css) {
      el.textContent = css;
    }
  } else if (el) {
    el.remove();
  }
}

// state = { hidden, cinema }. Cinema dim is gated to YouTube watch pages so it
// auto-clears when navigating away from a video (state.cinema still persists).
function applyState(site, state) {
  sbtSetStyle(SBT_HIDE_STYLE_ID, site.hideCss, !!state.hidden);
  if (site.hasDim && site.dimCss) {
    var dimOn = !!state.cinema && location.pathname === "/watch";
    sbtSetStyle(SBT_DIM_STYLE_ID, site.dimCss, dimOn);
  }
}
