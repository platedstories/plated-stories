"use client";
import "./work.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useViewTransition } from "@/hooks/useViewTransition";
import { optimizeImageUrl } from "@/lib/media-delivery";
import { workCategories } from "./workCategories.js";
import WorkStage, { Arrow } from "./WorkStage";

gsap.registerPlugin(useGSAP);

const pad = (n) => String(n).padStart(2, "0");

const CARD_COUNT = 2;

// The deck. The card behind sits a step smaller and its right edge peeks
// PEEK_REM out past the front card. Cards transform from their left edge
// (the hinge they turn on), so a smaller card is pushed right by the width
// it lost (xPercent) plus the peek (x).
const PEEK_REM = 1.5;
const SCALE_STEP = 0.06;
// Shared by every card so the page turns read with the same depth.
const PERSPECTIVE = 1800;
// How dark a card gets, edge-on, as it turns away from the light, and how
// much darker each card behind sits than the one in front.
const TURN_SHADE = 0.35;
const DEPTH_SHADE = 0.06;

// The homepage's surfaces (see the client review cards): paper with an ink
// rule, and solid ink.
const THEMES = ["paper", "ink"];

// Splits the running list of projects into `count` near-equal runs, larger
// runs first: 14 projects -> 7 / 7.
const splitEvenly = (items, count) => {
  const base = Math.floor(items.length / count);
  const extra = items.length % count;
  let start = 0;
  return Array.from({ length: count }, (_, i) => {
    const size = base + (i < extra ? 1 : 0);
    const run = items.slice(start, start + size);
    start += size;
    return run;
  });
};

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

const remPx = () =>
  parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// One card of the deck: a ruled, numbered list of a run of projects, with the
// deck's own controls in its footer. Only the front card is interactive; the
// ones behind are inert, and clicking a peeking edge brings that card round.
const DeckCard = ({
  card,
  number,
  total,
  isFront,
  slot,
  active,
  setActive,
  onNavigate,
  onPrefetch,
  onStep,
  cardRef,
}) => {
  const onPointerMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const first = card.projects[0].index;
  const last = card.projects[card.projects.length - 1].index;

  return (
    <section
      ref={cardRef}
      className={`wi-card wi-card--${card.theme}${isFront ? " is-front" : ""}`}
      aria-labelledby={`${card.key}-title`}
      aria-hidden={isFront ? undefined : true}
      onPointerMove={isFront ? onPointerMove : undefined}
      onClick={
        isFront ? undefined : () => onStep(slot === 1 ? 1 : -1)
      }
    >
      <div className="wi-card-inner" inert={!isFront}>
        <header className="wi-card-head">
          <div className="wi-card-meta">
            <p className="wi-mono">
              <span className="wi-card-no">{pad(number)}</span>
              Index
            </p>
            <h2 className="wi-card-title" id={`${card.key}-title`}>
              <span className="wi-sr">Projects </span>
              {first}
              <span className="wi-card-dash" aria-hidden="true">
                —
              </span>
              <span className="wi-sr"> to </span>
              {last}
            </h2>
          </div>
          <span className="wi-rule" aria-hidden="true" />
        </header>

        <ul className="wi-list" onMouseLeave={() => setActive(null)}>
          {card.projects.map((project) => (
            <li key={project.slug} id={project.anchor}>
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
                <span className="wi-mono wi-row-tag">
                  {project.categoryShort}
                </span>
                <Arrow className="wi-row-arrow" />
              </a>
              <span className="wi-rule" aria-hidden="true" />
            </li>
          ))}
        </ul>

        <footer className="wi-card-foot">
          <p className="wi-mono wi-card-count" aria-live="polite">
            <span className="wi-card-no">{pad(number)}</span> / {pad(total)}
          </p>
          <div className="wi-pips" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={i === number - 1 ? "is-on" : ""} />
            ))}
          </div>
          <div className="wi-nav">
            <button
              type="button"
              className="wi-nav-btn wi-nav-btn--prev"
              aria-label="Previous projects"
              onClick={() => onStep(-1)}
            >
              <span className="wi-nav-icon">
                <Arrow />
              </span>
            </button>
            <button
              type="button"
              className="wi-nav-btn wi-nav-btn--next"
              aria-label="Next projects"
              onClick={() => onStep(1)}
            >
              <span className="wi-nav-icon">
                <Arrow />
              </span>
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
};

const SHORT_TITLES = {
  "food-beverages": "F&B",
  "luxury-fashion": "Luxury",
  "real-estate-architecture": "Spaces",
};

const Page = () => {
  const { navigateWithTransition, router } = useViewTransition();
  const rootRef = useRef(null);
  const cardEls = useRef([]);
  const frontRef = useRef(0);
  const busy = useRef(false);

  const [front, setFront] = useState(0);
  const [active, setActive] = useState(null);

  // Projects carry a running number across the whole page (01 -> 14) and are
  // dealt out evenly over the three cards, so the deck reads as one index.
  const projects = useMemo(() => {
    let count = 0;
    return workCategories.flatMap((category) =>
      category.projects.map((project, i) => ({
        ...project,
        index: pad(++count),
        categoryTitle: category.title,
        categoryShort: SHORT_TITLES[category.key] ?? category.title,
        // Category links (/work#food-beverages, from the Menu and Hero) land
        // on the first row of that category.
        anchor: i === 0 ? category.key : undefined,
      }))
    );
  }, []);

  const cards = useMemo(
    () =>
      splitEvenly(projects, CARD_COUNT).map((run, i) => ({
        key: `work-${i + 1}`,
        theme: THEMES[i % THEMES.length],
        projects: run,
      })),
    [projects]
  );

  const n = cards.length;
  const slotOf = useCallback((i, f) => (i - f + n) % n, [n]);

  // Where a card sits for a given slot (0 = front).
  const slotVars = useCallback(
    (slot) => ({
      x: slot * PEEK_REM * remPx(),
      xPercent: slot * SCALE_STEP * 100,
      rotationY: 0,
      scale: 1 - slot * SCALE_STEP,
      transformPerspective: PERSPECTIVE,
      "--shade": slot * DEPTH_SHADE,
      zIndex: 10 - slot,
    }),
    []
  );

  const onPrefetch = (project) => {
    router.prefetch(project.href);
    preloadProject(project);
  };

  const { contextSafe } = useGSAP(
    () => {
      // A category link (/work#luxury-fashion) starts the deck on the card
      // holding that category's first project.
      const hash = window.location.hash.slice(1);
      const start = Math.max(
        0,
        cards.findIndex((c) => c.projects.some((p) => p.anchor === hash))
      );
      if (start !== 0) {
        frontRef.current = start;
        setFront(start);
      }

      cardEls.current.forEach((el, i) => {
        if (el) gsap.set(el, slotVars(slotOf(i, start)));
      });

      if (prefersReducedMotion()) return;

      const frontEl = cardEls.current[start];

      // Entrance: the deck rises, the front card writes its rules and rows
      // in, and the stage wipes up beside it.
      const q = gsap.utils.selector(rootRef);
      const tl = gsap.timeline({ delay: 0.25 });

      tl.from(
        q(".wi-deck"),
        {
          y: 60,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power4.out",
          clearProps: "transform,opacity,visibility",
        },
        0.1
      )
        .from(
          cardEls.current.filter((el, i) => el && i !== start),
          {
            x: 0,
            xPercent: 0,
            scale: 1,
            duration: 1,
            ease: "expo.out",
            stagger: 0.08,
          },
          0.45
        )
        .from(
          frontEl.querySelectorAll(".wi-rule"),
          {
            scaleX: 0,
            duration: 0.9,
            ease: "power3.inOut",
            stagger: 0.04,
            clearProps: "transform",
          },
          0.35
        )
        .from(
          frontEl.querySelectorAll(".wi-row > *, .wi-card-title"),
          {
            y: 16,
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
            clearProps: "clipPath",
          },
          0.3
        );
    },
    { scope: rootRef }
  );

  // Turning the deck is a page turn. Cards hinge on their left edge.
  //
  //   Forward: the front card swings back into the screen until it's
  //   edge-on, revealing the card behind as that one rises to the front.
  //   Edge-on, the turning card is invisible, so that's where it drops
  //   behind; it then swings shut into the rear slot, its edge peeking out.
  //
  //   Back: the same turn played in reverse. The rear card swings out to
  //   edge-on, comes over the top there, and swings shut onto the front
  //   while the old front card sinks into the rear slot.
  //
  // Changing layers only while the turning card is edge-on is what keeps the
  // swap clean: one card never jumps over or under the other in plain view.
  const step = contextSafe((dir) => {
    if (busy.current || n < 2) return;
    const prevFront = frontRef.current;
    const nextFront = (prevFront + dir + n) % n;
    frontRef.current = nextFront;
    setFront(nextFront);
    setActive(null);

    const els = cardEls.current;

    if (prefersReducedMotion()) {
      els.forEach((el, i) => gsap.set(el, slotVars(slotOf(i, nextFront))));
      return;
    }

    busy.current = true;
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
      },
    });

    // A slot's pose without its stacking order, which only ever changes at
    // the edge-on beat.
    const pose = (slot) => {
      const { zIndex, ...rest } = slotVars(slot);
      return rest;
    };

    const OPEN = 0.5; // swing out to edge-on, gathering speed
    const CLOSE = 0.65; // swing shut, settling
    const SHIFT = 0.85; // the other card moving a slot

    // Edge-on: turned 90° away on its hinge, nudged a touch left, and in
    // shadow because it's facing away from the light.
    const edgeOn = {
      rotationY: 90,
      xPercent: -4,
      x: 0,
      "--shade": TURN_SHADE,
      duration: OPEN,
      ease: "power2.in",
    };

    const turner = dir === 1 ? els[prevFront] : els[nextFront];
    const other = dir === 1 ? els[nextFront] : els[prevFront];
    const turnerEnd = dir === 1 ? n - 1 : 0;
    const otherEnd = dir === 1 ? 0 : 1;

    tl.set(turner, { zIndex: dir === 1 ? 20 : 1 }, 0)
      .to(turner, edgeOn, 0)
      .set(turner, { zIndex: dir === 1 ? 1 : 20 }, OPEN)
      .to(
        turner,
        { ...pose(turnerEnd), duration: CLOSE, ease: "power3.out" },
        OPEN
      )
      .set(turner, { zIndex: slotVars(turnerEnd).zIndex });

    tl.set(other, { zIndex: slotVars(otherEnd).zIndex }, 0).to(
      other,
      { ...pose(otherEnd), duration: SHIFT, ease: "power3.inOut" },
      0.1
    );

    // Any further cards just shift a slot.
    els.forEach((el, i) => {
      if (!el || el === turner || el === other) return;
      const slot = slotOf(i, nextFront);
      tl.set(el, { zIndex: slotVars(slot).zIndex }, 0).to(
        el,
        { ...pose(slot), duration: SHIFT, ease: "power3.inOut" },
        0.1
      );
    });
  });

  // Arrow keys turn the deck too.
  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) {
        return;
      }
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <div className="work-index" ref={rootRef}>
      <div className="wi-layout">
        <div
          className="wi-deck"
          style={{ "--wi-peek": `${PEEK_REM}rem`, "--wi-behind": n - 1 }}
        >
          {cards.map((card, i) => (
            <DeckCard
              key={card.key}
              card={card}
              number={i + 1}
              total={n}
              isFront={i === front}
              slot={slotOf(i, front)}
              active={i === front ? active : null}
              setActive={setActive}
              onNavigate={navigateWithTransition}
              onPrefetch={onPrefetch}
              onStep={step}
              cardRef={(el) => {
                cardEls.current[i] = el;
              }}
            />
          ))}
        </div>

        <WorkStage
          category={cards[front]}
          active={active}
          onNavigate={navigateWithTransition}
        />
      </div>
    </div>
  );
};

export default Page;
