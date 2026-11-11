"use client";
import "@/components/ProjectPage/ProjectPage.css";
import "@/components/CaseStudy/CaseStudy.css";
import "./dine-and-discover.css";
import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Footer from "@/components/Footer/Footer";
import Copy from "@/components/Copy/Copy";
import Button from "@/components/Button/Button";
import SeriesSection from "@/components/CaseStudy/SeriesSection";
import Lightbox from "@/components/CaseStudy/Lightbox";
import { pad } from "@/components/CaseStudy/media";
import DdShowreel from "./DdShowreel";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Body copy lives in plain string constants rather than inline JSX text:
// GSAP's SplitText rebuilds the text nodes it splits and trims each one's
// leading whitespace, so a sentence broken across `{expr}` boundaries loses
// the spaces around them. One text node, one string.
const EM = "—";

const META = [
  { label: "Client", value: "Dine & Discover" },
  { label: "Category", value: "Food & Beverages" },
  { label: "Services", value: "Strategy, Production, Editing" },
];

// One shoot, not several — unlike Cafe Srinivasa this project was never
// split into named series, so it renders as a single chapter carrying the
// whole set rather than a contents card with multiple parts.
const GALLERY = {
  name: "The Full Spread",
  columns: 3,
  copy: `Every table, plate and pour from one shoot ${EM} a single set rather than a set of chapters.`,
  media: [
    "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
    "https://ik.imagekit.io/platedstories/34.heic",
    "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
    "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
    "https://ik.imagekit.io/platedstories/2.heic",
    "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
    "https://ik.imagekit.io/platedstories/34.heic",
    "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
    "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
    "https://ik.imagekit.io/platedstories/2.heic",
    "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
    "https://ik.imagekit.io/platedstories/34.heic",
    "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
    "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
    "https://ik.imagekit.io/platedstories/2.heic",
    "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
    "https://ik.imagekit.io/platedstories/34.heic",
    "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
    "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
    "https://ik.imagekit.io/platedstories/2.heic",
    "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
    "https://ik.imagekit.io/platedstories/34.heic",
    "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
    "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
  ],
};

const OUTCOMES = [
  { title: "Deliverables", value: "Content Strategy, Reels & Carousels" },
  { title: "Community", value: "Highly Engaged & Loyal" },
  { title: "Brand Impact", value: "Stronger Recognition & Recall" },
];

const DineAndDiscover = ({ name, next }) => {
  const pageRef = useRef(null);
  const [viewer, setViewer] = useState({ open: false, index: 0 });

  const openViewer = (index) => setViewer({ open: true, index });

  const stepViewer = useCallback((direction) => {
    setViewer((current) => ({
      ...current,
      index:
        (current.index + direction + GALLERY.media.length) %
        GALLERY.media.length,
    }));
  }, []);

  const closeViewer = useCallback(
    () => setViewer((current) => ({ ...current, open: false })),
    []
  );

  // Frames rise as they cross the fold.
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
    { scope: pageRef }
  );

  return (
    <div className="sample-project-page case-study dd-case" ref={pageRef}>
      {/* Kept exactly as the shared template renders it. */}
      <section className="project-header">
        <Copy delay={0.75}>
          <p className="lg">Featured Case Study</p>
          <h1>{name}</h1>
        </Copy>
      </section>

      {/* The homepage Showreel frame — same pin, scale and radius — running
          this project's own stills instead of the /showreel sequence. */}
      <DdShowreel media={GALLERY.media} label={name} />

      {/* --------------------------------------------------------- brief */}
      <section className="cs-brief">
        <div className="container cs-brief-inner">
          <Copy animateOnScroll={true}>
            <p className="sm cs-index">The Brief</p>
          </Copy>

          <Copy animateOnScroll={true}>
            <h2 className="cs-display cs-brief-title">
              {"A menu worth "}
              <span className="cs-accent">discovering</span>
            </h2>
          </Copy>

          <Copy animateOnScroll={true}>
            <p className="cs-copy">
              {`Dine & Discover needed one shoot that could carry the whole feed ${EM} plates, pours and the room itself, framed as a single consistent set rather than a scatter of one-off posts.`}
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
      </section>

      {/* ------------------------------------------------------- gallery */}
      <div className="cs-chapters">
        <SeriesSection
          item={GALLERY}
          index={0}
          dark={false}
          label="Series"
          onOpen={(index) => openViewer(index)}
        />
      </div>

      {/* ------------------------------------------------------- outcome */}
      <section className="cs-outcomes">
        <div className="container">
          <Copy animateOnScroll={true}>
            <p className="sm cs-index">The Outcome</p>
          </Copy>

          {OUTCOMES.map((outcome, i) => (
            <div className="cs-outcome" key={outcome.title}>
              <div className="cs-outcome-head">
                <Copy animateOnScroll={true}>
                  <p className="sm cs-index">{pad(i + 1)}</p>
                </Copy>
                <Copy animateOnScroll={true}>
                  <h2 className="cs-display cs-outcome-title">
                    {outcome.title}
                  </h2>
                </Copy>
              </div>

              <div className="cs-outcome-value">
                <Copy animateOnScroll={true}>
                  <p>{outcome.value}</p>
                </Copy>
              </div>
            </div>
          ))}
        </div>
      </section>

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
        items={GALLERY.media}
        index={viewer.index}
        name={name}
        onClose={closeViewer}
        onStep={stepViewer}
      />
    </div>
  );
};

export default DineAndDiscover;
