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

// Full-bleed backdrop reel. Muted + playsInline so it autoplays on iOS too.
const BACKDROP_VIDEO =
  "https://ik.imagekit.io/platedstories/1.%20Monsoon%20Vibe-compress-video-to-size.mp4";
const HERO_POSTER = videoPosterUrl(BACKDROP_VIDEO, 1280);

const CONTACT = {
  role: "Co-founder",
  member: teamMembers[0],
};

const WORDMARK = "Plated";
const SUBMARK = "Stories";

export default function Hero() {
  const heroRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const { navigateWithTransition } = useViewTransition();

  // ---- Backdrop playback --------------------------------------------------

  // Only decode the reel while the hero is actually on screen.
  useEffect(() => {
    const node = heroRef.current;
    const video = videoRef.current;
    if (!node || !video) return;

    video.muted = true;
    if (typeof IntersectionObserver === "undefined") {
      video.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.05 }
    );
    observer.observe(node);
    return () => observer.disconnect();
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
          return;
        }

        waitForCue().then(() => {
          if (cancelled) return;
          // Let the wipe (or overlay) clear the bottom edge before the first
          // words move.
          startCall = gsap.delayedCall(isInitialLoad ? 0.2 : 0.35, () =>
            tl.play()
          );
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
            {/* Sized per screen: the 1920px original is 8.7MB, the 1280px
                rendition ~4.5MB and the 720px one ~2.1MB. The first
                <source> whose media query matches wins. */}
            <video
              ref={videoRef}
              className="home-hero-video"
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source
                src={optimizeVideoUrl(BACKDROP_VIDEO, 720)}
                type="video/mp4"
                media="(max-width: 767px)"
              />
              <source src={optimizeVideoUrl(BACKDROP_VIDEO, 1280)} type="video/mp4" />
            </video>
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
