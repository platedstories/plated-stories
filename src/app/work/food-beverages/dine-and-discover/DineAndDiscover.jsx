"use client";
import "@/components/CaseStudy/CaseStudy.css";
import "./dine-and-discover.css";
import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Footer from "@/components/Footer/Footer";
import Copy from "@/components/Copy/Copy";
import Button from "@/components/Button/Button";
import ContentsIndex from "@/components/CaseStudy/ContentsIndex";
import SeriesSection from "@/components/CaseStudy/SeriesSection";
import Lightbox from "@/components/CaseStudy/Lightbox";
import { isVideo } from "@/components/CaseStudy/media";
import OptimizedVideo from "@/components/OptimizedVideo/OptimizedVideo";
import { optimizeImageUrl } from "@/lib/media-delivery";
import { dineAndDiscoverSections } from "@/lib/dine-and-discover-media";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Laid out to match Cafe Toh (hero strip + meta, brief beside the contents
// card, chapters, closing) - see cafe-toh/CafeToh.jsx.
//
// Body copy lives in plain string constants rather than inline JSX text:
// GSAP's SplitText rebuilds the text nodes it splits and trims each one's
// leading whitespace, so a sentence broken across `{expr}` boundaries loses
// the spaces around them. One text node, one string.
const META = [
  { label: "Client", value: "Dine & Discover" },
  { label: "Category", value: "Food & Beverages" },
  { label: "Services", value: "Strategy, Production, Editing" },
];

// One shoot, so one chapter. It stays a grid rather than a marquee: the
// media is ordered as rows of three (image, image, reel for the first five),
// and the grid in dine-and-discover.css fills row by row to keep that order.
const SECTIONS = dineAndDiscoverSections;

// The opening frames, borrowed for the hero strip.
const HERO_FRAMES = SECTIONS.flatMap((item) => item.media).slice(0, 5);

const DineAndDiscover = ({ name, next }) => {
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const [viewer, setViewer] = useState({ open: false, section: 0, index: 0 });

  const sections = SECTIONS.filter((item) => item.media.length > 0);

  const openViewer = (section, index) =>
    setViewer({ open: true, section, index });

  const stepViewer = useCallback(
    (direction) => {
      setViewer((current) => {
        const items = sections[current.section]?.media ?? [];
        if (!items.length) return current;
        return {
          ...current,
          index: (current.index + direction + items.length) % items.length,
        };
      });
    },
    [sections]
  );

  const closeViewer = useCallback(
    () => setViewer((current) => ({ ...current, open: false })),
    []
  );

  // The hero strip: tiles rise on load, drift as the hero scrolls away, and
  // lean a little towards the cursor so the row has some give to it.
  useGSAP(
    () => {
      const hero = heroRef.current;
      const tiles = gsap.utils.toArray(".dd-hero-strip .dd-tile");
      if (!hero || !tiles.length) return;

      gsap.from(tiles, {
        y: 60,
        opacity: 0,
        duration: 1.1,
        stagger: 0.07,
        delay: 0.45,
        ease: "power3.out",
      });

      gsap.to(tiles, {
        yPercent: (i) => -6 - i * 2,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      const setters = tiles.map((tile, i) => ({
        x: gsap.quickTo(tile, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(tile, "y", { duration: 0.9, ease: "power3.out" }),
        depth: 6 + (i % 3) * 5,
      }));

      const onMove = (e) => {
        const rect = hero.getBoundingClientRect();
        const dx = (e.clientX - rect.left) / rect.width - 0.5;
        const dy = (e.clientY - rect.top) / rect.height - 0.5;

        setters.forEach((setter) => {
          setter.x(dx * setter.depth);
          setter.y(dy * setter.depth);
        });
      };

      const onLeave = () =>
        setters.forEach((setter) => {
          setter.x(0);
          setter.y(0);
        });

      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);

      return () => {
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: pageRef }
  );

  // Frames in a grid chapter rise as they cross the fold.
  useGSAP(
    () => {
      gsap.utils.toArray(".cs-gallery > .cs-frame").forEach((frame) => {
        gsap.fromTo(
          frame,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: frame, start: "top 88%", once: true },
          }
        );
      });
    },
    { scope: pageRef, dependencies: [sections.length] }
  );

  const words = name.trim().split(" ");
  const lead = words.slice(0, -1).join(" ");
  const tail = words[words.length - 1];

  return (
    <div className="case-study dd-case" ref={pageRef}>
      {/* ---------------------------------------------------------- hero */}
      <section className="dd-hero" ref={heroRef}>
        <div className="container dd-hero-inner">
          <div className="dd-hero-lead">
            <Copy delay={0.5}>
              <p className="sm cs-index">Featured Case Study</p>
            </Copy>

            <Copy delay={0.6}>
              <h1 className="cs-display dd-hero-title">
                {lead ? `${lead} ` : ""}
                <span className="cs-accent">{tail}</span>
              </h1>
            </Copy>
          </div>

          <div className="dd-hero-strip" aria-hidden="true">
            {HERO_FRAMES.map((src, i) => (
              <div className={`dd-tile dd-hero-tile--${i + 1}`} key={`${src}-${i}`}>
                {isVideo(src) ? (
                  <OptimizedVideo src={src} width={720} autoPlay muted loop playsInline eager />
                ) : (
                  <img src={optimizeImageUrl(src, 720)} alt="" decoding="async" />
                )}
              </div>
            ))}
          </div>

          <div className="dd-hero-meta">
            {META.map((item) => (
              <div className="dd-meta-item" key={item.label}>
                <Copy delay={0.75}>
                  <p className="sm cs-index">{item.label}</p>
                </Copy>
                <Copy delay={0.8}>
                  <p className="dd-meta-value">{item.value}</p>
                </Copy>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- brief */}
      <section className="dd-brief">
        <div className="container dd-brief-inner">
          <div className="dd-brief-lead">
            <Copy animateOnScroll={true}>
              <p className="sm cs-index">The Brief</p>
            </Copy>

            <Copy animateOnScroll={true}>
              <h2 className="cs-display dd-brief-title">
                {"A menu worth "}
                <span className="cs-accent">discovering</span>
              </h2>
            </Copy>

            <Copy animateOnScroll={true}>
              <p className="cs-copy">
                {`Dine & Discover needed one shoot that could carry the whole feed - plates, pours and the room itself, framed as a single consistent set rather than a scatter of one-off posts.`}
              </p>
            </Copy>
          </div>

          <ContentsIndex items={SECTIONS} unit="Parts" />
        </div>
      </section>

      {/* ------------------------------------------------------ chapters */}
      <div className="dd-sections">
        {sections.map((item, i) => (
          <SeriesSection
            key={item.name}
            item={item}
            index={i}
            dark={i % 2 === 1}
            label="Part"
            onOpen={(index) => openViewer(i, index)}
          />
        ))}
      </div>

      {/* ------------------------------------------------------- closing */}
      <section className="cs-closing">
        <div className="container cs-closing-inner">
          <Copy animateOnScroll={true}>
            <p className="sm cs-index">Next</p>
          </Copy>

          <Copy animateOnScroll={true}>
            <h2 className="cs-display cs-closing-title">
              {next ? next.name : "Your brand"}
            </h2>
          </Copy>

          <Button
            animateOnScroll={true}
            delay={0.25}
            href={next ? next.href : "/contact"}
          >
            {next ? "View the case study" : "Start your story"}
          </Button>
        </div>
      </section>

      <Footer />

      <Lightbox
        open={viewer.open}
        items={sections[viewer.section]?.media ?? []}
        index={viewer.index}
        name={sections[viewer.section]?.name ?? name}
        onClose={closeViewer}
        onStep={stepViewer}
      />
    </div>
  );
};

export default DineAndDiscover;
