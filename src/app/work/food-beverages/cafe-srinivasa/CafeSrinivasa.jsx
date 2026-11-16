"use client";
import "@/components/ProjectPage/ProjectPage.css";
import "@/components/CaseStudy/CaseStudy.css";
import "./cafe-srinivasa.css";
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
import { pad } from "@/components/CaseStudy/media";
import CsShowreel from "./CsShowreel";
import { cafeSrinivasaSeries as SERIES } from "@/lib/cafe-srinivasa-media";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Body copy lives in plain string constants rather than inline JSX text:
// GSAP's SplitText rebuilds the text nodes it splits and trims each one's
// leading whitespace, so a sentence broken across `{expr}` boundaries loses
// the spaces around them. One text node, one string.
const EM = "—";
const RSQUO = "’";

const META = [
  { label: "Client", value: "Cafe Srinivasa" },
  { label: "Category", value: "Food & Beverages" },
  { label: "Services", value: "Strategy, Production, Editing" },
];

// Every frame in the case study, in series order — what the showreel cycles.
const ALL_MEDIA = SERIES.flatMap((item) => item.media);

const CafeSrinivasa = ({ name, next }) => {
  const pageRef = useRef(null);
  const [viewer, setViewer] = useState({ open: false, section: 0, index: 0 });

  const series = SERIES.filter((item) => item.media.length > 0);

  const openViewer = (section, index) =>
    setViewer({ open: true, section, index });

  const stepViewer = useCallback(
    (direction) => {
      setViewer((current) => {
        const items = series[current.section]?.media ?? [];
        if (!items.length) return current;
        return {
          ...current,
          index: (current.index + direction + items.length) % items.length,
        };
      });
    },
    [series]
  );

  const closeViewer = useCallback(
    () => setViewer((current) => ({ ...current, open: false })),
    []
  );

  // Frames in a grid chapter rise as they cross the fold. A marquee is
  // already moving, so it is left alone — animating a tile inside an
  // animating track only fights it.
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
    { scope: pageRef, dependencies: [series.length] }
  );

  return (
    <div className="sample-project-page case-study cs-case" ref={pageRef}>
      {/* Kept exactly as the shared template renders it. */}
      <section className="project-header">
        <Copy delay={0.75}>
          <p className="lg">Featured Case Study</p>
          <h1>{name}</h1>
        </Copy>
      </section>

      {/* The homepage showcase, including its animated title and expanding
          frame, running this project's own stills and reels. */}
      <CsShowreel media={ALL_MEDIA} label={name} />

      {/* --------------------------------------------------------- brief */}
      <section className="cs-brief">
        <div className="container cs-brief-inner">
          <div className="cs-brief-lead">
            <Copy animateOnScroll={true}>
              <p className="sm cs-index">The Brief</p>
            </Copy>

            <Copy animateOnScroll={true}>
              <h2 className="cs-display cs-brief-title">
                {"A kitchen worth "}
                <span className="cs-accent">looking at</span>
              </h2>
            </Copy>

            <Copy animateOnScroll={true}>
              <p className="cs-copy">
                {`Cafe Srinivasa had the food and the following, but not the imagery to match ${EM} plates that landed hot on the table and flat on the feed. We rebuilt the visual language series by series, shooting each part of the menu as its own story instead of one catch-all shoot.`}
              </p>
            </Copy>

            <div className="cs-meta">
              {META.map((item) => (
                <div className="cs-meta-item" key={item.label}>
                  <Copy animateOnScroll={true}>
                    <p className="sm cs-index">{item.label}</p>
                  </Copy>
                  <Copy animateOnScroll={true}>
                    <p className="cs-meta-value">{item.value}</p>
                  </Copy>
                </div>
              ))}
            </div>
          </div>

          {/* The same contents card Cafe Toh carries: every series, numbered,
              frame-counted and linked to its chapter. */}
          <ContentsIndex items={SERIES} unit="Series" />
        </div>
      </section>

      {/* ------------------------------------------------------ chapters */}
      <div className="cs-chapters">
        {series.map((item, i) => (
          <SeriesSection
            key={item.name}
            item={item}
            index={i}
            dark={i % 2 === 1}
            label="Series"
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
        items={series[viewer.section]?.media ?? []}
        index={viewer.index}
        name={series[viewer.section]?.name ?? name}
        onClose={closeViewer}
        onStep={stepViewer}
      />
    </div>
  );
};

export default CafeSrinivasa;
