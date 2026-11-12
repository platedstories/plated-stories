"use client";
import "./Footer.css";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useViewTransition } from "@/hooks/useViewTransition";
import { optimizeImageUrl } from "@/lib/media-delivery";
import Copy from "../Copy/Copy";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const NAV = [
  { label: "Home", route: "/" },
  { label: "About Us", route: "/about" },
  { label: "Projects", route: "/work" },
  { label: "Contact", route: "/contact" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/platedstories" },
  { label: "Email", href: "mailto:hi@platedstories.com" },
];

const WORDMARK = "Plated Stories";

// Hover text-roll shared with the hero: a duplicate waits below the label and
// swaps in on hover.
const Roll = ({ children }) => (
  <span className="footer-roll">
    <span>{children}</span>
    <span aria-hidden="true">{children}</span>
  </span>
);

const Footer = () => {
  const footerRef = useRef(null);
  const wordmarkRef = useRef(null);
  const { navigateWithTransition } = useViewTransition();
  const year = new Date().getFullYear();

  const goTo = (route) => (e) => {
    e.preventDefault();
    if (window.location.pathname === route) return;
    navigateWithTransition(route);
  };

  // The wordmark is set to exactly the footer's inner width, whatever the
  // viewport: measure at a reference size, then scale linearly.
  useGSAP(
    () => {
      const mark = wordmarkRef.current;
      if (!mark) return;
      const text = mark.firstElementChild;

      // Layout widths (offsetWidth/clientWidth) ignore ancestor transforms,
      // so a scaled page mid-transition can't skew the measurement. Measured
      // at 1000px so integer rounding is negligible.
      const fit = () => {
        const available = mark.clientWidth;
        if (!available) return;
        text.style.fontSize = "1000px";
        const natural = text.offsetWidth;
        if (natural) text.style.fontSize = `${(1000 * available) / natural}px`;
      };

      // Refit whenever the box or the text drifts out of true: a resize, or
      // the display font swapping in after a fit made with the fallback
      // (fonts.ready can resolve before the font has even been requested).
      const refit = () => {
        if (Math.abs(text.offsetWidth - mark.clientWidth) > 1) fit();
      };

      fit();
      document.fonts?.ready.then(fit);
      document.fonts?.addEventListener?.("loadingdone", fit);
      const observer = new ResizeObserver(refit);
      observer.observe(mark);
      observer.observe(text);

      // Letters rise out of the mask as the footer scrolls in.
      const chars = mark.querySelectorAll(".footer-wordmark-char");
      // Far enough down to clear the mask's bottom padding before the rise.
      gsap.set(chars, { yPercent: 140 });
      gsap.to(chars, {
        yPercent: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.04,
        scrollTrigger: { trigger: mark, start: "top 95%", once: true },
      });

      return () => {
        observer.disconnect();
        document.fonts?.removeEventListener?.("loadingdone", fit);
      };
    },
    { scope: footerRef }
  );

  return (
    <footer className="site-footer" ref={footerRef}>
      <div className="footer-grain" aria-hidden="true" />
      <div className="footer-inner">
        {/* Column rules run the full height, behind the wordmark. */}
        <div className="footer-rules" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="footer-grid">
          <span className="footer-cross footer-cross--tl" aria-hidden="true" />
          <span className="footer-cross footer-cross--tr" aria-hidden="true" />
          <span className="footer-cross footer-cross--bl" aria-hidden="true" />
          <span className="footer-cross footer-cross--br" aria-hidden="true" />

          {/* 1 — Brand */}
          <div className="footer-col footer-brand">
            <div className="footer-brand-top">
              <a href="/" className="footer-logo" onClick={goTo("/")}>
                <span className="footer-logo-frame">
                  <img
                    src={optimizeImageUrl("/logo.png", 320)}
                    alt="Plated Stories"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              </a>
              <Copy animateOnScroll={true} delay={0.1}>
                <p className="footer-statement">
                  <span className="footer-muted">
                    Visual content for restaurants, caf&eacute;s and lifestyle
                    brands, built on
                  </span>{" "}
                  strategy, craft and storytelling.
                </p>
              </Copy>
            </div>

            <a
              href="/contact"
              className="footer-row footer-row--cta"
              onClick={goTo("/contact")}
            >
              <Roll>Start a project</Roll>
              <span className="footer-arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
          </div>

          {/* 2 — Navigation. A div with role="navigation", not a nav
              element: Menu.css styles every bare `nav` as the fixed site
              header, which would pin this column to the top of the screen. */}
          <div
            className="footer-col footer-nav"
            role="navigation"
            aria-label="Footer"
          >
            {NAV.map((item) => (
              <a
                key={item.route}
                href={item.route}
                className="footer-row"
                onClick={goTo(item.route)}
              >
                <Roll>{item.label}</Roll>
                <span className="footer-arrow" aria-hidden="true">
                  &rarr;
                </span>
              </a>
            ))}
          </div>

          {/* 3 — Follow */}
          <div className="footer-col footer-follow">
            <p className="footer-label">Follow on</p>
            <ul>
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className="footer-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Roll>{social.label}</Roll>
                  </a>
                </li>
              ))}
            </ul>

            <p className="footer-label footer-label--spaced">Base</p>
            <p className="footer-link footer-link--static">Mumbai, India</p>
          </div>

          {/* 4 — Statement + credits */}
          <div className="footer-col footer-meta">
            <Copy animateOnScroll={true} delay={0.2}>
              <p className="footer-tagline">
                We craft stories that people can taste.
              </p>
            </Copy>

            <div className="footer-credits">
              <p className="footer-label">
                Developed by{" "}
                <span className="footer-credits-name">Blue Moon Creatives</span>
              </p>
              <p className="footer-label">
                &copy; {year}{" "}
                <span className="footer-credits-name">Plated Stories</span>
              </p>
            </div>
          </div>
        </div>

        <div className="footer-wordmark" ref={wordmarkRef} aria-hidden="true">
          <span className="footer-wordmark-text">
            {WORDMARK.split("").map((char, i) => (
              <span className="footer-wordmark-mask" key={i}>
                <span className="footer-wordmark-char">
                  {char === " " ? " " : char}
                </span>
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
