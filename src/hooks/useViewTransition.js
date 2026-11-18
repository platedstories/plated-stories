"use client";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import {
  READY_EVENT,
  PROGRESS_EVENT,
  READY_STATE_KEY,
  normalizePath,
} from "@/lib/page-ready";

// The page transition is driven entirely by the GSAP overlay below - we do NOT
// use the browser's View Transition API here. Layering the two (this timeline
// plus next-view-transitions' `document.startViewTransition`) meant every
// navigation raced a transition the router could not finish in time, which
// surfaced as "Transition was aborted because of timeout in DOM update" /
// InvalidStateError unhandled rejections and, worse, a swallowed `router.push`
// so the overlay played but the route never changed.

// Guards against a second click while a transition is mid-flight (covering,
// waiting on the destination page, or revealing) - otherwise two timelines
// fight over the same overlay node and one of them removes it out from under
// the other. This can't be `activeTimeline.isActive()` alone because the
// overlay sits fully covering the screen, with no tween running, while we
// wait for the destination page to report itself ready.
let activeTimeline = null;
let transitionInProgress = false;

// The overlay's hold is driven by the destination route's real readiness (the
// "page-transition:ready" dispatch in client-layout.js), so a transition lasts
// as long as the page actually takes. These only bound that wait.
//
// Base deadline for a route that never reports in at all. Every progress tick
// pushes it out - a page that is still pulling assets is making progress and
// shouldn't be abandoned - up to the hard ceiling.
const READY_TIMEOUT_MS = 6000;
const PROGRESS_GRACE_MS = 3000;
const MAX_READY_WAIT_MS = 15000;
// Floor so the cover-to-reveal handoff doesn't read as a flash/stutter on
// routes that resolve almost instantly (e.g. already-cached pages).
const MIN_COVER_HOLD_MS = 250;

// Holds until the destination route says it's presentable. Resolves early if
// that route already reported ready (a cached page can beat this listener),
// and extends its own deadline while asset progress is still coming in.
function waitForPageReady(href) {
  const target = normalizePath((href || "").split("#")[0].split("?")[0]);

  const readyPromise = new Promise((resolve) => {
    let settled = false;
    let deadline = null;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener(READY_EVENT, onReady);
      window.removeEventListener(PROGRESS_EVENT, onProgress);
      clearTimeout(deadline);
      resolve();
    };

    const startedAt = Date.now();
    const armDeadline = (ms) => {
      clearTimeout(deadline);
      const remaining = Math.max(
        0,
        Math.min(ms, startedAt + MAX_READY_WAIT_MS - Date.now())
      );
      deadline = setTimeout(finish, remaining);
    };

    // A ready/progress event from the route we left (or from a route we
    // didn't ask for) says nothing about where we're going.
    const isTarget = (event) =>
      !event?.detail?.pathname || event.detail.pathname === target;

    const onReady = (event) => {
      if (isTarget(event)) finish();
    };
    const onProgress = (event) => {
      if (isTarget(event)) armDeadline(PROGRESS_GRACE_MS);
    };

    window.addEventListener(READY_EVENT, onReady);
    window.addEventListener(PROGRESS_EVENT, onProgress);
    armDeadline(READY_TIMEOUT_MS);

    // Already ready before we started listening.
    const recorded = window[READY_STATE_KEY];
    if (recorded && recorded.pathname === target) finish();
  });

  const minHold = new Promise((resolve) => setTimeout(resolve, MIN_COVER_HOLD_MS));
  return Promise.all([readyPromise, minHold]);
}

export const useViewTransition = () => {
  const router = useRouter();

  function createSVGOverlay() {
    let overlay = document.querySelector(".page-transition-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "page-transition-overlay";
      overlay.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path class="overlay__path" vector-effect="non-scaling-stroke" d="M 0 100 V 100 C 18 100 32 100 50 100 C 68 100 82 100 100 100 V 100 H 0 Z" />
        </svg>
      `;
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function removeOverlay() {
    const overlay = document.querySelector(".page-transition-overlay");
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  async function slideInOut(href, onRouteChange) {
    const overlay = createSVGOverlay();
    const overlayPath = overlay.querySelector(".overlay__path");

    // No overlay to animate - still navigate rather than dropping the click.
    if (!overlayPath) {
      router.push(href);
      if (onRouteChange) onRouteChange();
      return;
    }

    transitionInProgress = true;

    // Start pulling the destination route immediately, while the cover is
    // still drawing. Prefetch (rather than pushing early) warms the payload
    // without swapping the DOM out from under the half-drawn overlay, so the
    // ~0.85s of cover animation is spent loading instead of idling.
    try {
      router.prefetch(href);
    } catch {
      // Prefetch is an optimisation only; a failure here just means the push
      // below does all the fetching.
    }

    // Any readiness recorded for an earlier navigation is stale now.
    delete window[READY_STATE_KEY];

    const paths = {
      step1: {
        unfilled: "M 0 100 V 100 C 18 100 32 100 50 100 C 68 100 82 100 100 100 V 100 H 0 Z",
        inBetween: "M 0 100 V 66 C 16 66 34 16 54 16 C 74 16 88 60 100 60 V 100 H 0 Z",
        filled: "M 0 100 V 0 C 18 0 32 0 50 0 C 68 0 82 0 100 0 V 100 H 0 Z",
      },
      step2: {
        filled: "M 0 0 V 100 C 18 100 32 100 50 100 C 68 100 82 100 100 100 V 0 H 0 Z",
        inBetween: "M 0 0 V 58 C 16 58 30 14 46 14 C 66 14 86 50 100 50 V 0 H 0 Z",
        unfilled: "M 0 0 V 0 C 18 0 32 0 50 0 C 68 0 82 0 100 0 V 0 H 0 Z",
      },
    };

    try {
      // Cover: accelerate away from rest, then decelerate into the flat top.
      // power2.in -> power2.out hands off at a matched velocity, so the two
      // tweens read as one continuous ease rather than two with a kink.
      await new Promise((resolve) => {
        const coverTimeline = gsap.timeline({ onComplete: resolve });
        activeTimeline = coverTimeline;
        coverTimeline
          .set(overlayPath, { attr: { d: paths.step1.unfilled } })
          .to(overlayPath, {
            duration: 0.5,
            ease: "power2.in",
            attr: { d: paths.step1.inBetween },
          })
          .to(overlayPath, {
            duration: 0.35,
            ease: "power2.out",
            attr: { d: paths.step1.filled },
          });
      });

      // Screen is fully covered - safe to swap the route.
      router.push(href);
      if (onRouteChange) onRouteChange();

      // Hold here for real: driven by the destination page actually being
      // mounted with its images/video loaded (see client-layout.js), not a
      // fixed guess - so the reveal never uncovers a still-loading page.
      await waitForPageReady(href);

      // Reveal: short pickup, then a long power3 settle off the top edge.
      await new Promise((resolve) => {
        const revealTimeline = gsap.timeline({ onComplete: resolve });
        activeTimeline = revealTimeline;
        revealTimeline
          .set(overlayPath, { attr: { d: paths.step2.filled } })
          .to(overlayPath, {
            duration: 0.3,
            ease: "power2.in",
            attr: { d: paths.step2.inBetween },
          })
          .to(overlayPath, {
            duration: 0.85,
            ease: "power3.out",
            attr: { d: paths.step2.unfilled },
          });
      });
    } finally {
      activeTimeline = null;
      transitionInProgress = false;
      removeOverlay();
    }
  }

  // `href` is authored decoded (see workCategories.js) while
  // `window.location.pathname` comes back percent-encoded, so both sides are
  // decoded before the same-page check - otherwise "/a b" never matches
  // "/a%20b" and we'd replay the whole transition onto the current page.
  const samePath = (a, b) => {
    const decode = (value) => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    };
    return decode(a).replace(/\/$/, "") === decode(b).replace(/\/$/, "");
  };

  const navigateWithTransition = (href, onRouteChange, options = {}) => {
    if (!href) return;

    const [path] = href.split("#");
    if (samePath(window.location.pathname, path)) {
      if (onRouteChange) onRouteChange();
      return;
    }

    // A transition is already running; ignore the extra click instead of
    // stacking a second overlay on top of it.
    if (transitionInProgress) return;

    slideInOut(href, onRouteChange);
  };

  return { navigateWithTransition, router };
};
