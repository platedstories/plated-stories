"use client";
import "./AboutIntro.css";
import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { waitForFonts } from "@/lib/fonts";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { workCategories } from "@/app/work/workCategories.js";
import { clientBranding } from "@/components/Clients/clientBranding.js";
import { optimizeImageUrl } from "@/lib/media-delivery";

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

// Lede beside the still: a short lead in full ink, the rest muted.
const LEDE = {
  lead: "Story first, start to finish.",
  rest: "We start with the brand — its identity, its audience, its goals — and build every frame around a story worth telling.",
};

const DELIVERY_COPY =
  "Production, editing and delivery, handled end to end for every brand.";

// A few of the brands behind the numbers, from the clients' own logo files.
const LOGO_CLIENTS = ["midash", "my-watch-merchant", "cafe-toh"];
const PROJECTS = workCategories.flatMap((category) => category.projects);
const LOGOS = LOGO_CLIENTS.map((slug) => ({
  slug,
  name: PROJECTS.find((project) => project.slug === slug)?.name ?? slug,
  ...clientBranding[slug],
})).filter((client) => client.logo);

// Words wrapped in <em> in the statement pick up the brand accent.
const STATEMENT = [
  "A story-first content studio turning food, spaces and craft into",
  { accent: "visual stories" },
  "people remember.",
];

const pad = (n) => String(n).padStart(2, "0");

// A client logo cropped to its artwork with the same `logoArea` the clients
// grid uses, so every mark sits at the same visual height.
function ClientMark({ client }) {
  const src = optimizeImageUrl(client.logo, 384);
  if (!client.logoArea) {
    return <img className="about-card-logo" src={src} alt={client.name} />;
  }
  const [canvasW] = client.logoArea.canvas;
  const [x, y, w, h] = client.logoArea.box;
  return (
    <span className="about-card-logo is-cropped" style={{ aspectRatio: `${w} / ${h}` }}>
      <img
        src={src}
        alt={client.name}
        loading="lazy"
        decoding="async"
        style={{
          width: `${(canvasW / w) * 100}%`,
          left: `${(-x / w) * 100}%`,
          top: `${(-y / h) * 100}%`,
        }}
      />
    </span>
  );
}

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
            await waitForFonts(statementRef.current);
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
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );

          // --- Lede: rises in whole. Splitting it into lines would re-flow
          // the two-tone, indented paragraph and shift the cards below.
          gsap.fromTo(
            q(".about-lede"),
            { y: 32, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: q(".about-lede")[0], start: "top 90%", once: true },
            }
          );

          // --- Cards: rise in as the grid arrives. --------------------------
          gsap.fromTo(
            q(".about-card"),
            { y: 48, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1.1,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: { trigger: q(".about-cards")[0], start: "top 85%", once: true },
            }
          );

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

      {/* Still on the left; lede and figure cards on the right */}
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
            <span className="about-media-plus" aria-hidden="true" />
            <figcaption className="about-media-caption">
              <span>(Fig. 01)</span>
              <span>{MEDIA_CAPTION}</span>
            </figcaption>
          </div>
        </figure>

        <div className="about-content">
          <div className="about-lede-block">
            <p className="about-lede">
              <span className="about-lede-lead">{LEDE.lead}</span> {LEDE.rest}
            </p>
          </div>

          {/* Figures on top, what they stand for underneath. Screen readers
              get each figure with its label; the figure cards are visual. */}
          <div className="about-cards">
            {STATS.map((stat, i) => (
              <div className="about-card about-card--figure" key={stat.label} aria-hidden="true">
                <span className="about-card-index">{pad(i + 1)}</span>
                <p className="about-card-value about-stat-value" data-value={stat.value}>
                  {pad(stat.value)}
                </p>
              </div>
            ))}

            <div className="about-card about-card--detail">
              <p className="about-card-label">
                <span className="about-sr">{STATS[0].value} </span>
                {STATS[0].label}
              </p>
              <p className="about-card-copy">{DELIVERY_COPY}</p>
            </div>

            <div className="about-card about-card--detail">
              <p className="about-card-label">
                <span className="about-sr">{STATS[1].value} </span>
                {STATS[1].label}
              </p>
              <div className="about-card-logos" role="list" aria-label="Some of our clients">
                {LOGOS.map((client) => (
                  <span role="listitem" key={client.slug}>
                    <ClientMark client={client} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
