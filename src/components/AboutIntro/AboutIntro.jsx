"use client";
import "./AboutIntro.css";
import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Copy from "@/components/Copy/Copy";
import Button from "@/components/Button/Button";
import { workCategories } from "@/app/work/workCategories.js";

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

// A still from the "Monsoon Vibe" reel shot for Baked by Nini's, served from
// ImageKit (cropped to 3:4, AVIF/WebP picked per browser). Swap `so-22` for
// another second of the reel, or point this at any other photograph.
const MEDIA_SRC =
  "https://ik.imagekit.io/platedstories/1.%20Monsoon%20Vibe-compress-video-to-size.mp4/ik-thumbnail.jpg?tr=so-22,w-810,h-1080,q-80,f-auto";
const MEDIA_CAPTION = "Baked by Nini’s";

const FOUNDED = 2025;

// Counted from the work list, so the figures stay true as projects are added.
const STATS = [
  {
    label: "Brands we’ve told stories for",
    value: workCategories.reduce((sum, c) => sum + c.projects.length, 0),
  },
  { label: "Industries we shoot across", value: workCategories.length },
];

// Words wrapped in <em> in the statement pick up the brand accent.
const STATEMENT = [
  "A story-first content studio turning food, spaces and craft into",
  { accent: "visual stories" },
  "people remember.",
];

const ROWS = [
  {
    tag: "(Pre)",
    copy: "Concept development and shoot planning. We start with the brand — its identity, its audience, its goals — and build every frame around a story worth telling.",
  },
  {
    tag: "(+Post)",
    copy: "Production, editing and delivery, handled end to end. Premium execution meets strategic storytelling, so every piece looks beautiful and says who the brand is.",
  },
];

const pad = (n) => String(n).padStart(2, "0");

// `document.fonts.ready` only waits for faces the browser is already fetching.
// A web font is fetched lazily, the first time something renders with it, so
// `ready` can resolve before the statement's own face has even been requested;
// SplitText then measures fallback metrics and warns. Asking for every face
// the element and its children use (family + weight + style) makes `ready`
// actually cover them.
const loadFontsFor = (root) => {
  const faces = new Set();
  [root, ...root.querySelectorAll("*")].forEach((el) => {
    const s = getComputedStyle(el);
    faces.add(`${s.fontStyle} ${s.fontWeight} 16px ${s.fontFamily}`);
  });
  return Promise.all(
    [...faces].map((face) => document.fonts.load(face).catch(() => {}))
  );
};

export default function AboutIntro() {
  const sectionRef = useRef(null);
  const statementRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();
      let split;
      let cancelled = false;

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1001px)",
        },
        ({ conditions }) => {
          if (!conditions.motion) {
            // Everything simply shows; numbers jump to their final values.
            q(".about-stat-value").forEach((el) => {
              el.textContent = pad(Number(el.dataset.value));
            });
            return;
          }

          // --- Meta row: hairline draws in, labels rise out of focus. -------
          gsap
            .timeline({
              scrollTrigger: { trigger: q(".about-meta")[0], start: "top 88%", once: true },
            })
            .fromTo(
              q(".about-meta .about-rule"),
              { scaleX: 0 },
              { scaleX: 1, duration: 1.4, ease: "expo.inOut" }
            )
            .fromTo(
              q(".about-meta-item > span"),
              { yPercent: 110, filter: "blur(8px)" },
              {
                yPercent: 0,
                filter: "blur(0px)",
                duration: 1,
                stagger: 0.08,
                ease: "power3.out",
              },
              0.35
            );

          // --- Statement: lines rise, then words ink in as you scroll. -----
          const buildStatement = async () => {
            try {
              if (statementRef.current) await loadFontsFor(statementRef.current);
              await document.fonts.ready;
            } catch {}
            if (cancelled || !statementRef.current) return;

            split = SplitText.create(statementRef.current, {
              type: "lines,words",
              mask: "lines",
              linesClass: "about-statement-line",
              wordsClass: "about-statement-word",
            });

            // SplitText drops text-indent into the first line; carry it over.
            const indent = getComputedStyle(statementRef.current).textIndent;
            if (indent && indent !== "0px" && split.lines[0]) {
              split.lines[0].style.paddingLeft = indent;
              statementRef.current.style.textIndent = "0";
            }

            gsap.fromTo(
              split.lines,
              { yPercent: 105 },
              {
                yPercent: 0,
                duration: 1.2,
                stagger: 0.09,
                ease: "power4.out",
                scrollTrigger: {
                  trigger: statementRef.current,
                  start: "top 85%",
                  once: true,
                },
              }
            );

            gsap.fromTo(
              split.words,
              { opacity: 0.16 },
              {
                opacity: 1,
                stagger: 0.1,
                ease: "none",
                scrollTrigger: {
                  trigger: statementRef.current,
                  start: "top 75%",
                  end: "bottom 45%",
                  scrub: 0.6,
                },
              }
            );

            ScrollTrigger.refresh();
          };
          buildStatement();

          // --- Image: unmasks upward, then drifts against the scroll. ------
          const frame = q(".about-media-frame")[0];
          gsap
            .timeline({
              scrollTrigger: { trigger: frame, start: "top 85%", once: true },
            })
            .fromTo(
              frame,
              { clipPath: "inset(100% 0% 0% 0% round 0.75rem)" },
              {
                clipPath: "inset(0% 0% 0% 0% round 0.75rem)",
                duration: 1.5,
                ease: "expo.inOut",
              }
            )
            .fromTo(
              q(".about-media-zoom"),
              { scale: 1.35 },
              { scale: 1, duration: 1.8, ease: "expo.out" },
              0.15
            );

          gsap.fromTo(
            q(".about-media-parallax"),
            { yPercent: -9 },
            {
              yPercent: 9,
              ease: "none",
              scrollTrigger: {
                // The frame is sticky on desktop, so drive the drift off the
                // whole content block rather than the frame's own position.
                trigger: conditions.desktop ? q(".about-body")[0] : frame,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );

          // --- Rows: each rule draws in as its row arrives. ----------------
          q(".about-row").forEach((row) => {
            gsap.fromTo(
              row.querySelectorAll(":scope > .about-rule, .about-stat .about-rule"),
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 1.3,
                stagger: 0.12,
                ease: "expo.inOut",
                scrollTrigger: { trigger: row, start: "top 85%", once: true },
              }
            );
          });

          // --- Stats: count up from zero. ----------------------------------
          q(".about-stat-value").forEach((el) => {
            const counter = { v: 0 };
            el.textContent = pad(0);
            gsap.to(counter, {
              v: Number(el.dataset.value),
              duration: 1.8,
              ease: "power3.out",
              snap: { v: 1 },
              onUpdate: () => {
                el.textContent = pad(counter.v);
              },
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
          });
        }
      );

      return () => {
        cancelled = true;
        split?.revert();
        mm.revert();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section className="about-intro" ref={sectionRef} aria-labelledby="about-intro-title">
      {/* Meta row */}
      <div className="about-meta">
        <span className="about-rule" aria-hidden="true" />
        <div className="about-meta-row">
          <p className="about-meta-item">
            <span>
              <i className="about-icon" aria-hidden="true" />
              About us
            </span>
          </p>
          <p className="about-meta-item about-meta-item--mid">
            <span>(What we do)</span>
          </p>
          <p className="about-meta-item about-meta-item--end">
            <span>(Est. {FOUNDED}&copy;)</span>
          </p>
        </div>
      </div>

      {/* Statement */}
      <h2 className="about-statement" id="about-intro-title" ref={statementRef}>
        {STATEMENT.map((part, i) =>
          typeof part === "string" ? (
            <React.Fragment key={i}>{part} </React.Fragment>
          ) : (
            <React.Fragment key={i}>
              <em>{part.accent}</em>{" "}
            </React.Fragment>
          )
        )}
      </h2>

      {/* Image + rows */}
      <div className="about-body">
        <figure className="about-media">
          <div className="about-media-frame">
            <div className="about-media-parallax">
              <div className="about-media-zoom">
                <img
                  src={MEDIA_SRC}
                  alt="A guest enjoying a jar from Baked by Nini’s at a café table"
                  loading="lazy"
                  decoding="async"
                  width={810}
                  height={1080}
                />
              </div>
            </div>
            <span className="about-media-grain" aria-hidden="true" />
            <span className="about-media-tag" aria-hidden="true">
              <i />
              Shot by Plated Stories
            </span>
          </div>
          <figcaption className="about-media-caption">
            <Copy animateOnScroll={true} delay={0.2}>
              <span>(Fig. 01)</span>
            </Copy>
            <Copy animateOnScroll={true} delay={0.3}>
              <span>{MEDIA_CAPTION}</span>
            </Copy>
          </figcaption>
        </figure>

        <div className="about-rows">
          {ROWS.map((row) => (
            <div className="about-row" key={row.tag}>
              <span className="about-rule" aria-hidden="true" />
              <Copy animateOnScroll={true}>
                <p className="about-row-tag">{row.tag}</p>
              </Copy>
              <Copy animateOnScroll={true} delay={0.1}>
                <p className="about-row-copy">{row.copy}</p>
              </Copy>
            </div>
          ))}

          <div className="about-row about-row--results">
            <span className="about-rule" aria-hidden="true" />
            <Copy animateOnScroll={true}>
              <p className="about-row-tag">(=Results)</p>
            </Copy>
            <div className="about-results">
              <dl className="about-stats">
                {STATS.map((stat) => (
                  <div className="about-stat" key={stat.label}>
                    <dt>
                      <i aria-hidden="true" />
                      {stat.label}
                    </dt>
                    <dd className="about-stat-value" data-value={stat.value}>
                      {pad(stat.value)}
                    </dd>
                    <span className="about-rule" aria-hidden="true" />
                  </div>
                ))}
              </dl>

              <div className="about-cta">
                <Button href="/work" animateOnScroll={true} delay={0.2}>
                  Explore our work
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
