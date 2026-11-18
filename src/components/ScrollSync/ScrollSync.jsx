"use client";
import { useEffect } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Lenis and ScrollTrigger both want to own the frame. Left unwired they run on
// separate clocks: Lenis writes the scroll position from its own rAF, while
// ScrollTrigger reacts to the native scroll event it fires afterwards. A pinned
// section is a fixed-position swap decided from that position, so a frame of
// lag shows up as the pin engaging late and - going back up - releasing early,
// which is how a pinned card ends up floating over the section above it.
//
// The fix is one clock: GSAP's ticker drives Lenis, and every Lenis scroll
// updates ScrollTrigger synchronously before that frame paints.
const ScrollSync = () => {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // A long frame (a video decoding, a route chunk parsing) makes GSAP assume
    // a tab switch and skip ahead; with a scrubbed pin that reads as a jump.
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", update);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis]);

  // Pin start/end positions are measured once and cached. Anything that changes
  // document height after that measurement - a lazy image arriving, fonts
  // swapping, a section reflowing - leaves every trigger below it pointing at
  // the wrong scroll offset. One observer here replaces the per-component
  // refresh calls that used to fire mid-setup, while other sections had not yet
  // registered their own triggers.
  useEffect(() => {
    let frame = 0;
    let lastHeight = document.documentElement.scrollHeight;

    const refresh = () => {
      frame = 0;
      ScrollTrigger.refresh();
    };

    const scheduleRefresh = () => {
      if (frame) return;
      frame = requestAnimationFrame(refresh);
    };

    const onResize = () => {
      const height = document.documentElement.scrollHeight;
      if (height === lastHeight) return;
      lastHeight = height;
      scheduleRefresh();
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);

    const onLoad = () => scheduleRefresh();
    window.addEventListener("load", onLoad, { passive: true });

    if (document.fonts) {
      document.fonts.ready.then(scheduleRefresh).catch(() => {});
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("load", onLoad);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
};

export default ScrollSync;
