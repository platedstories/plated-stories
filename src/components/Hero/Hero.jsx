"use client";
import "./Hero.css";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Copy from "@/components/Copy/Copy";
import { isInitialLoad } from "@/components/Preloader/Preloader";
import { useViewTransition } from "@/hooks/useViewTransition";
import { workCategories } from "@/app/work/workCategories.js";
import { teamMembers } from "@/components/TeamCards/teamMembers.js";
import { optimizeImageUrl } from "@/lib/media-delivery";

gsap.registerPlugin(useGSAP, CustomEase, ScrollTrigger);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

// Full-bleed backdrop reel. Muted + playsInline so it autoplays on iOS too.
const BACKDROP_VIDEO =
  "https://ik.imagekit.io/platedstories/1.%20Monsoon%20Vibe-compress-video-to-size.mp4";

const CONTACT = {
  role: "Co-founder",
  member: teamMembers[0],
};

const WORDMARK = "Plated";

export default function Hero() {
  const heroRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const { navigateWithTransition } = useViewTransition();

  // Timings hang off the preloader: on a cold load the overlay starts wiping
  // up at ~4.6s, on a client-side navigation the page is already visible.
  const base = isInitialLoad ? 4.9 : 0.35;

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
      const tl = gsap.timeline({ delay: base });

      tl.fromTo(
        backdropRef.current,
        { scale: 1.18 },
        { scale: 1, duration: 1.8, ease: "hop" },
        0
      )
        .fromTo(
          ".home-hero-char",
          { yPercent: 110 },
          { yPercent: 0, duration: 1.2, stagger: 0.05, ease: "hop" },
          0.15
        )
        .fromTo(
          ".home-hero-reg",
          { scale: 0, rotate: -120 },
          { scale: 1, rotate: 0, duration: 1, ease: "back.out(1.6)" },
          0.75
        )
        .fromTo(
          ".home-hero-sub-inner",
          { yPercent: 110 },
          { yPercent: 0, duration: 1, ease: "power4.out" },
          0.7
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

      // The backdrop drifts slower than the page as the hero scrolls away.
      // It is oversized (see .home-hero-backdrop-track) so the drift never
      // opens a gap at the top edge.
      gsap.to(".home-hero-backdrop-track", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
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
            <video
              ref={videoRef}
              className="home-hero-video"
              src={BACKDROP_VIDEO}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
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
              <span className="home-hero-sub-inner">Stories</span>
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
            <Copy animateOnScroll={false} delay={base + 0.95}>
              <p>
                <span className="home-hero-indent" aria-hidden="true" />
                We craft stories that people can taste.{" "}
                <span className="home-hero-muted">
                  Visual content for restaurants, caf&eacute;s and lifestyle
                  brands &mdash; strategy, production and storytelling, end to
                  end.
                </span>
              </p>
            </Copy>
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
