"use client";
import "./FeaturedWork.css";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { workCategories } from "@/app/work/workCategories.js";
import { useViewTransition } from "@/hooks/useViewTransition";
import { optimizeImageUrl } from "@/lib/media-delivery";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The studies that have their own shot media rather than a slice of the
// shared studio pool. They're listed by slug and resolved against
// workCategories rather than copied, so a renamed project or a moved route
// can't leave the homepage showing a stale name or linking at a page that
// isn't there any more.
const FEATURED_SLUGS = [
  "cafe-srinivasa",
  "home-bakers",
  "hive-cafe",
  "cafe-toh",
  "dine-and-discover",
  "baked-by-ninis",
];

const ALL_PROJECTS = workCategories.flatMap((category) =>
  category.projects.map((project) => ({ ...project, category: category.title }))
);

const FEATURED = FEATURED_SLUGS.map((slug) =>
  ALL_PROJECTS.find((project) => project.slug === slug)
).filter(Boolean);

const ROWS = FEATURED.reduce((rows, project, i) => {
  if (i % 2 === 0) rows.push([project]);
  else rows[rows.length - 1].push(project);
  return rows;
}, []);

export default function FeaturedWork() {
  const featuredWorkContainerRef = useRef(null);
  const { navigateWithTransition } = useViewTransition();

  useGSAP(
    () => {
      // Each row swings its two cards in as it comes up. The offsets are
      // deliberately modest: the previous version threw them 1000px with a
      // 60deg tilt, which on any quick scroll meant a row was still visibly
      // mid-flight - or, if its trigger measured before layout settled,
      // never arrived at all.
      gsap.utils.toArray(".featured-work-list .row").forEach((row) => {
        const items = row.querySelectorAll(".featured-work-item");

        gsap.set(items, {
          y: 180,
          rotation: (i) => (i === 0 ? -12 : 12),
          opacity: 0,
          transformOrigin: "center center",
        });

        ScrollTrigger.create({
          trigger: row,
          start: "top 85%",
          once: true,
          onEnter: () =>
            gsap.to(items, {
              y: 0,
              rotation: 0,
              opacity: 1,
              duration: 1.1,
              ease: "power3.out",
              stagger: 0.12,
            }),
        });
      });
    },
    { scope: featuredWorkContainerRef }
  );

  const openProject = (href) => (e) => {
    e.preventDefault();
    navigateWithTransition(href);
  };

  return (
    <div className="featured-work-list" ref={featuredWorkContainerRef}>
      {ROWS.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((project) => (
            <div className="featured-work-item" key={project.slug}>
              <a
                href={project.href}
                className="featured-work-item-link"
                onClick={openProject(project.href)}
              >
                <div className="featured-work-item-img">
                  <div className="featured-work-item-copy">
                    <h3>{project.name}</h3>
                    <p className="sm">{project.category}</p>
                  </div>
                  <img
                    src={optimizeImageUrl(project.images[0], 1200)}
                    alt={project.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </a>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
