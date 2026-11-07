"use client";
import "./work.css";
import { useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useViewTransition } from "@/hooks/useViewTransition";
import { optimizeImageUrl } from "@/lib/media-delivery";
import { workCategories } from "./workCategories.js";
import WorkStage, { Arrow } from "./WorkStage";

gsap.registerPlugin(useGSAP);

const pad = (n) => String(n).padStart(2, "0");

// Each letter carries a copy of itself one line below (a text-shadow), and
// the hover slides the whole letter up by a line: the name "rolls" over to a
// fresh copy, staggered letter by letter. The real name sits in a visually
// hidden span so a screen reader hears a word, not a spelling.
const RollText = ({ text }) => (
  <span className="wi-roll">
    <span className="wi-sr">{text}</span>
    {Array.from(text).map((ch, i) => (
      <span aria-hidden="true" key={i} style={{ "--i": i }}>
        {ch === " " ? " " : ch}
      </span>
    ))}
  </span>
);

const preloadProject = (project) => {
  project.images.forEach((src) => {
    const img = new Image();
    img.src = optimizeImageUrl(src, 960);
  });
};

// One contents card per discipline: a ruled, numbered list of the projects,
// then a live stage that fills whatever height the list leaves. Lists of
// different lengths therefore still give three cards of one height, and the
// shortest list gets the biggest picture.
const CategoryCard = ({ category, number, onNavigate, onPrefetch }) => {
  const [active, setActive] = useState(null);
  const cardRef = useRef(null);

  // Feeds the cursor-following glow on the card border.
  const onPointerMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <section
      className={`wi-card${active ? " has-active" : ""}`}
      id={category.key}
      ref={cardRef}
      onPointerMove={onPointerMove}
      onMouseLeave={() => setActive(null)}
      aria-labelledby={`${category.key}-title`}
    >
      <header className="wi-card-head">
        <p className="wi-mono" id={`${category.key}-title`}>
          <span className="wi-card-no">{pad(number)}</span>
          {category.title}
        </p>
        <p className="wi-mono">
          {pad(category.projects.length)}{" "}
          {category.projects.length === 1 ? "Project" : "Projects"}
        </p>
        <span className="wi-rule" aria-hidden="true" />
      </header>

      <ul className="wi-list">
        {category.projects.map((project) => (
          <li key={project.slug}>
            <a
              className={`wi-row${active?.slug === project.slug ? " is-active" : ""}`}
              href={project.href}
              onMouseEnter={() => {
                setActive(project);
                onPrefetch(project);
              }}
              onFocus={() => {
                setActive(project);
                onPrefetch(project);
              }}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(project.href);
              }}
            >
              <span className="wi-mono wi-row-no">{project.index}</span>
              <span className="wi-row-name">
                <RollText text={project.name} />
              </span>
              <Arrow className="wi-row-arrow" />
            </a>
            <span className="wi-rule" aria-hidden="true" />
          </li>
        ))}
      </ul>

      <WorkStage
        category={category}
        active={active}
        onNavigate={onNavigate}
      />
    </section>
  );
};

const Page = () => {
  const { navigateWithTransition, router } = useViewTransition();
  const rootRef = useRef(null);

  // Projects carry a running number across the whole page, so the three
  // cards read as one index: 01 -> 13.
  const categories = useMemo(() => {
    let count = 0;
    return workCategories.map((category) => ({
      ...category,
      projects: category.projects.map((project) => ({
        ...project,
        index: pad(++count),
      })),
    }));
  }, []);

  const total = categories.reduce((n, c) => n + c.projects.length, 0);

  const onPrefetch = (project) => {
    router.prefetch(project.href);
    preloadProject(project);
  };

  // Entrance: cards rise in turn, then every rule draws left to right and
  // the rows lift in behind it, so each card "writes" its own contents.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      const q = gsap.utils.selector(rootRef);
      const tl = gsap.timeline({ delay: 0.25 });

      tl.from(q(".wi-topbar > *"), {
        yPercent: 100,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.06,
        clearProps: "transform,opacity,visibility",
      })
        .from(
          q(".wi-card"),
          {
            y: 60,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power4.out",
            stagger: 0.12,
            clearProps: "transform,opacity,visibility",
          },
          0.1
        )
        .from(
          q(".wi-rule"),
          {
            scaleX: 0,
            duration: 0.9,
            ease: "power3.inOut",
            stagger: 0.03,
            clearProps: "transform",
          },
          0.35
        )
        .from(
          q(".wi-row > *"),
          {
            y: 14,
            autoAlpha: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.012,
            clearProps: "transform,opacity,visibility",
          },
          0.5
        )
        .from(
          q(".wi-stage"),
          {
            clipPath: "inset(100% 0% 0% 0%)",
            duration: 1.1,
            ease: "expo.inOut",
            stagger: 0.1,
            clearProps: "clipPath",
          },
          0.45
        );
    },
    { scope: rootRef }
  );

  return (
    <div className="work-index" ref={rootRef}>
      <div className="wi-topbar">
        <p className="wi-mono wi-hint">Hover a title to preview, click to open</p>
        <p className="wi-mono">
          {pad(total)} Projects / {pad(categories.length)} Disciplines
        </p>
      </div>

      <div className="wi-grid">
        {categories.map((category, i) => (
          <CategoryCard
            key={category.key}
            category={category}
            number={i + 1}
            onNavigate={navigateWithTransition}
            onPrefetch={onPrefetch}
          />
        ))}
      </div>
    </div>
  );
};

export default Page;
