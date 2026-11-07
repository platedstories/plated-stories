"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";
import Menu from "@/components/Menu/Menu";
import ScrollSync from "@/components/ScrollSync/ScrollSync";
import BottomBlur from "@/components/BottomBlur/BottomBlur";
import {
  READY_EVENT,
  PROGRESS_EVENT,
  READY_STATE_KEY,
  normalizePath,
} from "@/lib/page-ready";

// Media that never settles (a 404'd image, a video the browser refuses to
// buffer) shouldn't hold the overlay hostage — each asset gets its own budget,
// and the whole readiness check gets an outer one.
const PER_ASSET_TIMEOUT_MS = 4000;
const READINESS_TIMEOUT_MS = 12000;
// Assets this far outside the viewport aren't what the visitor lands on, so
// they don't gate the reveal. Roughly a quarter-screen of margin either side.
const VIEWPORT_MARGIN = 0.25;

export default function ClientLayout({ children }) {
  const pageRef = useRef();
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lets the page-transition overlay (useViewTransition) know when the route
  // we just navigated to is genuinely presentable: mounted, fonts resolved,
  // and every above-the-fold image/video loaded AND decoded. The overlay holds
  // until this fires, so a transition lasts as long as the page actually takes
  // — a cached route reveals almost immediately, a heavy case study holds
  // longer — instead of running on a fixed duration.
  //
  // Fires on every pathname change including the first render; that first
  // dispatch is harmless since no transition is listening yet.
  useEffect(() => {
    let cancelled = false;
    const timers = new Set();
    const frames = new Set();
    const detachers = new Set();

    const startedAt =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    const nextFrame = (fn) => {
      const id = requestAnimationFrame((t) => {
        frames.delete(id);
        fn(t);
      });
      frames.add(id);
    };

    const delay = (ms) =>
      new Promise((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    const notifyProgress = (loaded, total) => {
      if (cancelled) return;
      window.dispatchEvent(
        new CustomEvent(PROGRESS_EVENT, {
          detail: { pathname: normalizePath(pathname), loaded, total },
        })
      );
    };

    const notifyReady = () => {
      if (cancelled) return;
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const detail = {
        pathname: normalizePath(pathname),
        duration: now - startedAt,
        at: now,
      };
      // Recorded as well as dispatched, so a listener that attaches after the
      // fact can see it already happened rather than waiting for a repeat.
      window[READY_STATE_KEY] = detail;
      window.dispatchEvent(new CustomEvent(READY_EVENT, { detail }));
    };

    // Two frames so the new route's DOM has actually laid out — element
    // positions are what decide which media counts as above the fold.
    const painted = new Promise((resolve) => {
      nextFrame(() => nextFrame(resolve));
    });

    // An image that has loaded but not decoded still paints as a blank box on
    // the frame the overlay lifts, so decoding is part of being ready.
    const settleImage = (img) =>
      new Promise((resolve) => {
        const done = () => resolve();
        if (img.complete && img.naturalWidth > 0) {
          if (typeof img.decode === "function") {
            img.decode().then(done, done);
          } else {
            done();
          }
          return;
        }
        const onLoad = () => {
          if (typeof img.decode === "function") {
            img.decode().then(done, done);
          } else {
            done();
          }
        };
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", done, { once: true });
        detachers.add(() => {
          img.removeEventListener("load", onLoad);
          img.removeEventListener("error", done);
        });
      });

    const settleVideo = (video) =>
      new Promise((resolve) => {
        // readyState 3 (HAVE_FUTURE_DATA) means there's a frame to show.
        if (video.readyState >= 3) {
          resolve();
          return;
        }
        const done = () => resolve();
        video.addEventListener("loadeddata", done, { once: true });
        video.addEventListener("error", done, { once: true });
        detachers.add(() => {
          video.removeEventListener("loadeddata", done);
          video.removeEventListener("error", done);
        });
      });

    const withBudget = (promise) =>
      Promise.race([promise, delay(PER_ASSET_TIMEOUT_MS)]);

    // Below-the-fold and lazily-loaded media would otherwise stall every
    // navigation until the outer timeout, since the browser deliberately
    // hasn't fetched them yet.
    const isAboveTheFold = (el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
      const viewport = window.innerHeight || 0;
      return (
        rect.top < viewport * (1 + VIEWPORT_MARGIN) &&
        rect.bottom > -viewport * VIEWPORT_MARGIN
      );
    };

    const waitForMedia = async () => {
      await painted;
      if (cancelled) return;

      const container = pageRef.current || document;
      const media = Array.from(
        container.querySelectorAll("img, video")
      ).filter(isAboveTheFold);

      const total = media.length;
      if (total === 0) {
        notifyProgress(0, 0);
        return;
      }

      let loaded = 0;
      notifyProgress(0, total);

      await Promise.all(
        media.map((el) =>
          withBudget(
            el.tagName === "IMG" ? settleImage(el) : settleVideo(el)
          ).then(() => {
            loaded += 1;
            notifyProgress(loaded, total);
          })
        )
      );
    };

    // Fonts count too: revealing mid-swap means the visitor watches the
    // headings reflow right after the overlay lifts.
    const waitForFonts = () => {
      if (typeof document === "undefined" || !document.fonts) {
        return Promise.resolve();
      }
      return document.fonts.ready.catch(() => {});
    };

    Promise.race([
      Promise.all([waitForMedia(), waitForFonts()]),
      delay(READINESS_TIMEOUT_MS),
    ]).then(notifyReady);

    return () => {
      cancelled = true;
      frames.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      detachers.forEach((detach) => detach());
      frames.clear();
      timers.clear();
      detachers.clear();
    };
  }, [pathname]);

  const scrollSettings = isMobile
    ? {
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: true,
        touchMultiplier: 1.5,
        infinite: false,
        lerp: 0.09,
        wheelMultiplier: 1,
        orientation: "vertical",
        smoothWheel: true,
        syncTouch: true,
        // ScrollSync drives lenis.raf from the GSAP ticker instead, so the two
        // never advance on separate frames.
        autoRaf: false,
      }
    : {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        lerp: 0.1,
        wheelMultiplier: 1,
        orientation: "vertical",
        smoothWheel: true,
        syncTouch: true,
        // ScrollSync drives lenis.raf from the GSAP ticker instead, so the two
        // never advance on separate frames.
        autoRaf: false,
      };

  return (
    <ReactLenis root options={scrollSettings}>
      <ScrollSync />

      <Menu />

      <div className="page" ref={pageRef}>
        {children}
      </div>

      <BottomBlur />
    </ReactLenis>
  );
}
