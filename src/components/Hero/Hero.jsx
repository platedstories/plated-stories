"use client";
import "./Hero.css";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import {
  isInitialLoad,
  PRELOADER_REVEAL_EVENT,
  PRELOADER_REVEALED_KEY,
} from "@/components/Preloader/Preloader";
import { READY_EVENT, READY_STATE_KEY, normalizePath } from "@/lib/page-ready";
import { useViewTransition } from "@/hooks/useViewTransition";
import { workCategories } from "@/app/work/workCategories.js";
import { teamMembers } from "@/components/TeamCards/teamMembers.js";
import {
  optimizeImageUrl,
  optimizeVideoUrl,
  videoPosterUrl,
} from "@/lib/media-delivery";
import { waitForFonts } from "@/lib/fonts";

gsap.registerPlugin(useGSAP, CustomEase, ScrollTrigger, SplitText);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

// Full-bleed backdrop reel: the clips take turns, each on screen for
// REEL_SLOT seconds, cross-dissolving over REEL_FADE seconds. Muted +
// playsInline so they autoplay on iOS too.
const REEL = [
  {
    url: "https://ik.imagekit.io/platedstories/1.%20Monsoon%20Vibe-compress-video-to-size.mp4",
    resize: true,
  },
  {
    // ImageKit's video-transformation quota is used up, so resized
    // renditions of this clip 403. Serve the untouched original (~7.4MB)
    // until they're available, then flip `resize` on.
    url: "https://ik.imagekit.io/platedstories/6.%20Cost%20more%20than%20car%20(1).mp4",
    resize: false,
  },
];
const REEL_SLOT = 10;
const REEL_FADE = 1.2;
const HERO_POSTER = videoPosterUrl(REEL[0].url, 1280);

const CONTACT = {
  role: "Co-founder",
  member: teamMembers[0],
};

const WORDMARK = "Plated";
const SUBMARK = "Stories";

export default function Hero() {
  const heroRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRefs = useRef([]);
  // Set by the playback effect; called when the hero is revealed so the
  // first clip's 10 seconds aren't spent behind the preloader.
  const startReelRef = useRef(null);
  const { navigateWithTransition } = useViewTransition();

  // ---- Backdrop playback --------------------------------------------------
  //
  // One clip is "active" at a time. Near the end of its slot the next clip
  // is started from 0 on a layer above and faded in over it; only once it
  // is fully opaque is the old clip hidden and paused. Fading in over a
  // solid layer (rather than fading both) keeps the frame from dipping in
  // brightness mid-dissolve. Playback and the slot clock only run while the
  // hero is on screen.
  useEffect(() => {
    const node = heroRef.current;
    const videos = videoRefs.current.slice(0, REEL.length).filter(Boolean);
    if (!node || !videos.length) return;

    let active = 0;
    let clipStart = 0;
    let started = false;
    let fading = false;
    let fadeTween = null;
    let incomingClip = null;
    let visible = false;
    let ticking = false;
    const failed = new Set();
    const detach = [];

    videos.forEach((video, i) => {
      video.muted = true;
      gsap.set(video, { opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0 });

      // A broken <source> reports on the source element; catch it on the
      // way down so the clip drops out of the rotation.
      const onError = () => failed.add(i);
      video.addEventListener("error", onError, true);
      detach.push(() => video.removeEventListener("error", onError, true));
    });

    // The later clips wait (preload="none") until the first is playing, so
    // they don't compete with it for bandwidth on first paint.
    const warmUp = () => {
      videos.forEach((video, i) => {
        if (i === 0 || video.preload !== "none") return;
        video.preload = "auto";
        video.load();
      });
    };
    videos[0].addEventListener("playing", warmUp, { once: true });
    detach.push(() => videos[0].removeEventListener("playing", warmUp));

    const nextIndex = () => {
      for (let step = 1; step < videos.length; step++) {
        const i = (active + step) % videos.length;
        if (!failed.has(i)) return i;
      }
      return -1;
    };

    const crossfade = () => {
      const next = nextIndex();
      if (next < 0) {
        // Nothing to hand over to — just keep the current clip looping.
        videos[active].loop = true;
        return;
      }

      fading = true;
      const outgoing = videos[active];
      const incoming = videos[next];
      incomingClip = incoming;
      incoming.currentTime = 0;

      Promise.resolve(incoming.play())
        .then(() => {
          if (!fading) return;
          gsap.set(outgoing, { zIndex: 1 });
          gsap.set(incoming, { zIndex: 2 });
          fadeTween = gsap.fromTo(
            incoming,
            { opacity: 0 },
            {
              opacity: 1,
              duration: REEL_FADE,
              ease: "sine.inOut",
              onComplete: () => {
                outgoing.pause();
                gsap.set(outgoing, { opacity: 0, zIndex: 0 });
                gsap.set(incoming, { zIndex: 1 });
                active = next;
                clipStart = 0;
                fading = false;
                fadeTween = null;
                incomingClip = null;
              },
            }
          );
        })
        .catch((err) => {
          // AbortError = paused (scrolled away) before it started; try again
          // on the next tick. Anything else means the clip can't play here.
          if (err?.name === "NotSupportedError") failed.add(next);
          fading = false;
          incomingClip = null;
        });
    };

    const tick = () => {
      if (!started || fading) return;
      const video = videos[active];
      const elapsed = video.currentTime - clipStart;
      // Also hand over just before a clip runs out, should it be shorter
      // than the slot.
      const nearEnd =
        Number.isFinite(video.duration) &&
        video.currentTime >= video.duration - REEL_FADE;
      if (elapsed >= REEL_SLOT - REEL_FADE || nearEnd || video.ended) {
        crossfade();
      }
    };

    const setTicking = (on) => {
      if (on === ticking) return;
      ticking = on;
      if (on) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };

    const resume = () => {
      visible = true;
      videos[active].play().catch(() => {});
      // Mid-dissolve: both layers are on screen.
      if (fadeTween) incomingClip?.play().catch(() => {});
      setTicking(started);
    };
    const suspend = () => {
      visible = false;
      setTicking(false);
      videos.forEach((video) => video.pause());
    };

    startReelRef.current = () => {
      if (started) return;
      started = true;
      clipStart = videos[active].currentTime;
      if (visible) setTicking(true);
    };

    let observer = null;
    if (typeof IntersectionObserver === "undefined") {
      resume();
    } else {
      observer = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? resume() : suspend()),
        { threshold: 0.05 }
      );
      observer.observe(node);
    }

    return () => {
      observer?.disconnect();
      setTicking(false);
      fadeTween?.kill();
      detach.forEach((fn) => fn());
      startReelRef.current = null;
    };
  }, []);

  // ---- Intro + scroll ----------------------------------------------------

  useGSAP(
    () => {
      const hero = heroRef.current;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      let cancelled = false;
      let statementSplit = null;
      let startCall = null;
      const detach = [];

      const chars = gsap.utils.toArray(".home-hero-char", hero);
      const subChars = gsap.utils.toArray(".home-hero-sub-char", hero);
      const statement = hero.querySelector(".home-hero-statement p");

      const tl = gsap.timeline({ paused: true });

      // ---- Wordmark ---------------------------------------------------------
      //
      // "Plated": each letter rises out of the mask while the word gathers in
      // from a slight spread, untilting and pulling into focus as it lands.
      // "Stories" then flips up letter by letter, hinged on its baseline.
      const mid = (chars.length - 1) / 2;

      tl.fromTo(
        backdropRef.current,
        { scale: 1.18 },
        { scale: 1, duration: 1.8, ease: "hop" },
        0
      )
        .fromTo(
          chars,
          {
            yPercent: 118,
            xPercent: (i) => (i - mid) * 16,
            rotate: 9,
            filter: "blur(14px)",
          },
          {
            yPercent: 0,
            xPercent: 0,
            rotate: 0,
            filter: "blur(0px)",
            duration: 1.6,
            stagger: 0.07,
            ease: "expo.out",
            // Drop the filter once settled, so the type isn't left on a
            // filtered layer.
            onComplete: () => gsap.set(chars, { clearProps: "filter" }),
          },
          0.12
        )
        .fromTo(
          ".home-hero-reg",
          { scale: 0, rotate: -120 },
          { scale: 1, rotate: 0, duration: 1, ease: "back.out(1.6)" },
          0.85
        )
        .fromTo(
          subChars,
          { yPercent: 100, rotateX: -95, autoAlpha: 0 },
          {
            yPercent: 0,
            rotateX: 0,
            autoAlpha: 1,
            duration: 1.2,
            stagger: 0.045,
            ease: "expo.out",
          },
          0.6
        )
        .fromTo(
          ".home-hero-mark",
          { scale: 0, rotate: -90, autoAlpha: 0 },
          {
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
          },
          0.8
        )
        .fromTo(
          ".home-hero-services-label, .home-hero-service-inner",
          { yPercent: 110 },
          { yPercent: 0, duration: 0.9, stagger: 0.07, ease: "power4.out" },
          0.9
        )
        .fromTo(
          ".home-hero-card > *",
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
          },
          1.05
        )
        .fromTo(
          ".home-hero-copyright",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8, ease: "power2.out" },
          1.2
        );

      // ---- Statement --------------------------------------------------------
      //
      // Split into words inside line masks once the fonts are in (the line
      // breaks depend on them). Each word rises out of a soft blur; the split
      // is undone when the intro ends so the paragraph reflows on resize.
      const buildStatement = () => {
        // Hidden on small screens (display: none) — nothing to measure.
        if (!statement || statement.getClientRects().length === 0) return;

        statementSplit = SplitText.create(statement, {
          type: "lines,words",
          mask: "lines",
          linesClass: "home-hero-statement-line",
          wordsClass: "home-hero-statement-word",
        });

        tl.fromTo(
          statementSplit.words,
          { yPercent: 110, rotate: 4, filter: "blur(6px)" },
          {
            yPercent: 0,
            rotate: 0,
            filter: "blur(0px)",
            duration: 1.3,
            stagger: 0.022,
            ease: "expo.out",
            onComplete: () => {
              statementSplit?.revert();
              statementSplit = null;
            },
          },
          // The wipe uncovers the bottom of the hero first, so the statement
          // leads and the wordmark follows.
          0
        );
      };

      // ---- When to start ----------------------------------------------------
      //
      // Cold load: when the preloader starts wiping up. Client-side
      // navigation: when this route reports ready, which is what lifts the
      // page-transition overlay. Either way a fallback keeps the hero from
      // staying hidden if the signal never comes.
      const waitForCue = () =>
        new Promise((resolve) => {
          const done = () => resolve();
          let fallback;

          if (isInitialLoad) {
            if (window[PRELOADER_REVEALED_KEY]) return done();
            window.addEventListener(PRELOADER_REVEAL_EVENT, done, { once: true });
            fallback = setTimeout(done, 12000);
            detach.push(() => {
              window.removeEventListener(PRELOADER_REVEAL_EVENT, done);
              clearTimeout(fallback);
            });
            return;
          }

          if (window[READY_STATE_KEY]?.pathname === "/") return done();
          const onReady = (e) => {
            if (normalizePath(e.detail?.pathname) === "/") done();
          };
          window.addEventListener(READY_EVENT, onReady);
          fallback = setTimeout(done, 6000);
          detach.push(() => {
            window.removeEventListener(READY_EVENT, onReady);
            clearTimeout(fallback);
          });
        });

      waitForFonts(statement).then(() => {
        if (cancelled) return;
        if (!reduceMotion) buildStatement();
        if (statement) statement.style.visibility = "visible";

        if (reduceMotion) {
          tl.progress(1);
          startReelRef.current?.();
          return;
        }

        waitForCue().then(() => {
          if (cancelled) return;
          // Let the wipe (or overlay) clear the bottom edge before the first
          // words move.
          startCall = gsap.delayedCall(isInitialLoad ? 0.2 : 0.35, () => {
            tl.play();
            startReelRef.current?.();
          });
        });
      });

      // ---- Scroll -----------------------------------------------------------

      // The backdrop drifts slower than the page as the hero scrolls away.
      // It is oversized (see .home-hero-backdrop-track) so the drift never
      // opens a gap at the top edge.
      gsap.to(".home-hero-backdrop-track", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Letters slip back up into their mask at staggered speeds on the way
      // out — the intro in reverse. Pixel `y`, so it composes with the
      // intro's `yPercent` instead of fighting it.
      if (!reduceMotion) {
        gsap.to(chars, {
          y: (i, el) => -el.offsetHeight * (0.1 + i * 0.06),
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        });
      }

      return () => {
        cancelled = true;
        startCall?.kill();
        detach.forEach((fn) => fn());
        statementSplit?.revert();
      };
    },
    { scope: heroRef }
  );

  // ---- Navigation ----------------------------------------------------------

  const scrollToCategory = (key) => {
    const scrollWhenReady = () => {
      const el = document.getElementById(key);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else requestAnimationFrame(scrollWhenReady);
    };
    requestAnimationFrame(scrollWhenReady);
  };

  const goTo = (route, after) => (e) => {
    e.preventDefault();
    navigateWithTransition(route, after);
  };

  const { member } = CONTACT;
  const year = new Date().getFullYear();

  return (
    <section className="home-hero" ref={heroRef}>
      <div className="home-hero-frame">
        {/* Backdrop */}
        <div className="home-hero-backdrop" ref={backdropRef} aria-hidden="true">
          <div className="home-hero-backdrop-track">
            {/* Sized per screen where ImageKit can resize (e.g. Monsoon:
                1280px ~4.5MB, 720px ~2.1MB). The first <source> whose
                media query matches wins. */}
            {REEL.map((clip, i) => (
              <video
                key={clip.url}
                ref={(el) => (videoRefs.current[i] = el)}
                className="home-hero-video"
                poster={i === 0 ? HERO_POSTER : undefined}
                autoPlay={i === 0}
                muted
                playsInline
                preload={i === 0 ? "auto" : "none"}
              >
                {clip.resize ? (
                  <>
                    <source
                      src={optimizeVideoUrl(clip.url, 720)}
                      type="video/mp4"
                      media="(max-width: 767px)"
                    />
                    <source src={optimizeVideoUrl(clip.url, 1280)} type="video/mp4" />
                  </>
                ) : (
                  <source src={`${clip.url}?tr=orig-true`} type="video/mp4" />
                )}
              </video>
            ))}
          </div>
          <div className="home-hero-shade" />
          <div className="home-hero-grain" />
        </div>

        {/* Content */}
        <div className="home-hero-content">
          <h1 className="home-hero-wordmark" aria-label="Plated Stories">
            <span className="home-hero-main" aria-hidden="true">
              <span className="home-hero-mask">
                {WORDMARK.split("").map((char, i) => (
                  <span className="home-hero-char" key={i}>
                    {char}
                  </span>
                ))}
              </span>
              <span className="home-hero-reg">&reg;</span>
            </span>
            <span className="home-hero-sub" aria-hidden="true">
              <span className="home-hero-sub-inner">
                {SUBMARK.split("").map((char, i) => (
                  <span className="home-hero-sub-char" key={i}>
                    {char}
                  </span>
                ))}
              </span>
            </span>
          </h1>

          <div className="home-hero-services" role="navigation" aria-label="Our work">
            <span className="home-hero-line">
              <span className="home-hero-services-label">( Selected work )</span>
            </span>
            <ul>
              {workCategories.map((category) => (
                <li key={category.key}>
                  <a
                    href={`/work#${category.key}`}
                    className="home-hero-service"
                    onClick={goTo("/work", () => scrollToCategory(category.key))}
                  >
                    <span className="home-hero-service-inner">
                      <span className="home-hero-roll">
                        <span>{category.title}</span>
                        <span aria-hidden="true">{category.title}</span>
                      </span>
                      <span className="home-hero-service-arrow" aria-hidden="true">
                        &#8599;
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="home-hero-marks" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span className="home-hero-mark" key={i} />
            ))}
          </div>

          <div className="home-hero-statement">
            <p>
              <span className="home-hero-indent" aria-hidden="true" />
              We craft stories that people can taste.{" "}
              <span className="home-hero-muted">
                Visual content for restaurants, caf&eacute;s and lifestyle
                brands &mdash; strategy, production and storytelling, end to
                end.
              </span>
            </p>
          </div>

          <p className="home-hero-copyright">&copy; {year} Plated Stories</p>

          <div className="home-hero-card">
            <div className="home-hero-card-portrait">
              <img
                src={optimizeImageUrl(member.img, 384)}
                alt={member.alt}
                decoding="async"
              />
            </div>
            <div className="home-hero-card-info">
              <div>
                <p className="home-hero-card-role">{CONTACT.role}</p>
                <p className="home-hero-card-org">at Plated Stories&reg;</p>
              </div>
              <p className="home-hero-card-name">{member.name}</p>
              <a
                href="/contact"
                className="home-hero-card-cta"
                onClick={goTo("/contact")}
              >
                <span>Let&rsquo;s talk</span>
                <span className="home-hero-card-cta-icon" aria-hidden="true">
                  &#8599;
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
