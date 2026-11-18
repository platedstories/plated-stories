"use client";

// Shared vocabulary between the page-transition overlay (useViewTransition)
// and the layout that watches each route mount (client-layout).
//
// The overlay holds "covered" for exactly as long as the destination route
// really takes to become presentable, so the transition length is the page's
// own load time rather than a fixed guess. These are the events that carry
// that signal.

export const READY_EVENT = "page-transition:ready";
export const PROGRESS_EVENT = "page-transition:progress";

// Last route that reported itself ready, so a transition that attaches its
// listener a tick late (or navigates to an already-rendered route) can settle
// immediately instead of waiting out a timeout.
export const READY_STATE_KEY = "__platedStoriesPageReady";

export const normalizePath = (value) => {
  if (!value) return "/";
  let path = value;
  try {
    path = decodeURIComponent(path);
  } catch {
    // Already decoded, or malformed escapes - compare what we were given.
  }
  return path.replace(/\/+$/, "") || "/";
};
