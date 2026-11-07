"use client";
import "./Clients.css";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useViewTransition } from "@/hooks/useViewTransition";
import { workCategories } from "@/app/work/workCategories.js";
import { clientBranding } from "./clientBranding.js";
import { optimizeImageUrl } from "@/lib/media-delivery";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CLIENTS = workCategories
  .flatMap((category) => category.projects)
  .map((project) => ({
    name: project.name,
    href: project.href,
    variant: "heavy",
    ...clientBranding[project.slug],
  }));

const SLOTS = 6;
const HOLD_S = 2.6;
const GAP_S = 0.35;
const FIRST_YEAR = 2025;

// Consecutive runs of the client list, so a page never repeats a name.
const clientsForPage = (page) =>
  Array.from(
    { length: SLOTS },
    (_, slot) => CLIENTS[(page * SLOTS + slot) % CLIENTS.length]
  );

// Shows a logo file cropped to its artwork (see `logoArea` in
// clientBranding.js): the frame takes the artwork's aspect ratio and the full
// image is scaled and offset inside it, so only the artwork shows.
function ImageLogo({ client }) {
  const area = client.logoArea;
  const src = optimizeImageUrl(client.logo, 640);

  if (!area) {
    return (
      <span className="home-clients-logo home-clients-logo--image">
        <span className="home-clients-logo-frame">
          <img src={src} alt="" decoding="async" />
        </span>
      </span>
    );
  }

  const [canvasW] = area.canvas;
  const [x, y, w, h] = area.box;

  return (
    <span
      className="home-clients-logo home-clients-logo--image"
      style={{ "--logo-ar": w / h }}
    >
      <span
        className="home-clients-logo-frame is-cropped"
        style={{ aspectRatio: `${w} / ${h}` }}
      >
        <img
          src={src}
          alt=""
          decoding="async"
          style={{
            width: `${(canvasW / w) * 100}%`,
            left: `${(-x / w) * 100}%`,
            top: `${(-y / h) * 100}%`,
          }}
        />
      </span>
    </span>
  );
}

export default function Clients() {
  const sectionRef = useRef(null);
  const innerRef = useRef(null);
  const headRef = useRef(null);
  const gridRef = useRef(null);
  const cycleRef = useRef(null);
  const visibleRef = useRef(false);
  const [page, setPage] = useState(0);
  const [started, setStarted] = useState(false);
  const { navigateWithTransition, router } = useViewTransition();

  // ---- Tuck-under + parallax --------------------------------------------
  //
  // The section is pulled up beneath the hero by the height of its header
  // (negative margin in CSS; the hero sits above it on z-index), so at first
  // only the tiles show, butted against the hero's bottom edge. While the hero
  // scrolls away the section lags behind by that same height, which slides the
  // "Our clients" row out from under the hero and leaves everything in its
  // natural position once the hero is mostly gone.
  useGSAP(
    () => {
      const hero = document.querySelector(".home-hero");
      if (!hero || !innerRef.current || !headRef.current) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: hero,
            start: "bottom bottom",
            end: "bottom 15%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          innerRef.current,
          { y: 0 },
          { y: () => headRef.current.offsetHeight, ease: "none", duration: 1 },
          0
        )
        .fromTo(
          gridRef.current,
          { scale: 0.965 },
          { scale: 1, ease: "none", duration: 1 },
          0
        )
        .fromTo(
          ".home-clients-head-inner",
          { yPercent: 60, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, ease: "power1.out", duration: 0.6 },
          0.2
        );
    },
    { scope: sectionRef }
  );

  // ---- Logo cycle ---------------------------------------------------------

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (typeof IntersectionObserver === "undefined") {
      visibleRef.current = true;
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) setStarted(true);
        cycleRef.current?.paused(!entry.isIntersecting);
      },
      { threshold: 0.01 }
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const logos = gsap.utils.toArray(".home-clients-logo", gridRef.current);
      if (!started) {
        gsap.set(logos, { autoAlpha: 0 });
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const hidden = reduceMotion
        ? { autoAlpha: 0 }
        : { yPercent: -70, filter: "blur(14px)", autoAlpha: 0 };
      const gone = reduceMotion
        ? { autoAlpha: 0 }
        : { yPercent: 70, filter: "blur(14px)", autoAlpha: 0 };

      cycleRef.current?.kill();
      // Each logo drops in out of focus, settles, then falls out of focus and
      // leaves the tile empty for a beat before the next page arrives.
      cycleRef.current = gsap
        .timeline({ paused: !visibleRef.current })
        .fromTo(logos, hidden, {
          yPercent: 0,
          filter: "blur(0px)",
          autoAlpha: 1,
          duration: 1,
          stagger: 0.07,
          ease: "power3.out",
        })
        .to(
          logos,
          { ...gone, duration: 0.7, stagger: 0.07, ease: "power2.in" },
          `+=${HOLD_S}`
        )
        .call(() => setPage((p) => p + 1), null, `+=${GAP_S}`);
    },
    { scope: sectionRef, dependencies: [page, started] }
  );

  useEffect(() => () => cycleRef.current?.kill(), []);

  const yearRange = `${FIRST_YEAR}–${String(new Date().getFullYear()).slice(-2)}`;

  return (
    <section className="home-clients" ref={sectionRef} aria-labelledby="home-clients-title">
      <div className="home-clients-inner" ref={innerRef}>
        <div className="home-clients-head" ref={headRef}>
          <div className="home-clients-head-inner">
            <p className="home-clients-title" id="home-clients-title">
              <span className="home-clients-icon" aria-hidden="true" />
              Our clients
            </p>
            <p className="home-clients-years">({yearRange}&copy;)</p>
          </div>
        </div>

        <ul className="home-clients-grid" ref={gridRef}>
          {clientsForPage(page).map((client, slot) => (
            <li className="home-clients-tile" key={slot}>
              <a
                href={client.href}
                aria-label={`View the ${client.name} project`}
                onMouseEnter={() => router.prefetch(client.href)}
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithTransition(client.href);
                }}
              >
                {client.logo ? (
                  <ImageLogo client={client} />
                ) : (
                  <span
                    className={`home-clients-logo home-clients-logo--${client.variant}`}
                  >
                    {client.name}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
