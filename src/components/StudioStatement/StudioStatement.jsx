"use client";
import "./StudioStatement.css";
import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { optimizeImageUrl } from "@/lib/media-delivery";
import { waitForFonts } from "@/lib/fonts";

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

const MEDIA_SRC = optimizeImageUrl(
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  800
);

// The statement opens beside a small portrait still: the still is an
// inline-block at the start of the heading, so the first line of type sits
// on its bottom edge and the rest wraps the full width underneath. The lead
// is in full ink, the rest steps back to a muted tone.
export default function StudioStatement() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();
      let split;
      let cancelled = false;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Still: unmasks upward, its contents settling from a slight zoom.
        gsap
          .timeline({
            scrollTrigger: { trigger: section, start: "top 80%", once: true },
          })
          .fromTo(
            q(".studio-statement-media"),
            { clipPath: "inset(100% 0% 0% 0% round 0.5rem)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 0.5rem)",
              duration: 1.4,
              ease: "expo.inOut",
            }
          )
          .fromTo(
            q(".studio-statement-media img"),
            { scale: 1.9 },
            { scale: 1.6, duration: 1.8, ease: "expo.out" },
            0.15
          );

        // Words ink in as the statement scrolls through the viewport. The
        // still isn't text, so splitting words leaves it where it is.
        waitForFonts(textRef.current).then(() => {
          if (cancelled || !textRef.current) return;
          split = SplitText.create(textRef.current, {
            type: "words",
            wordsClass: "studio-statement-word",
          });
          gsap.fromTo(
            split.words,
            { opacity: 0.12 },
            {
              opacity: 1,
              stagger: 0.1,
              ease: "none",
              scrollTrigger: {
                trigger: textRef.current,
                start: "top 80%",
                end: "bottom 55%",
                scrub: 0.6,
              },
            }
          );
          ScrollTrigger.refresh();
        });
      });

      return () => {
        cancelled = true;
        split?.revert();
        mm.revert();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section className="studio-statement" ref={sectionRef}>
      <h2 className="studio-statement-text" ref={textRef}>
        <span className="studio-statement-media">
          <img
            src={MEDIA_SRC}
            alt="Flaming Hot crunchy sushi, shot by Plated Stories"
            loading="lazy"
            decoding="async"
          />
        </span>{" "}
        We are Plated Stories, a content studio crafting visual stories for
        F&amp;B and lifestyle brands{" "}
        <span className="studio-statement-muted">
          &mdash; strategy, production and storytelling, handled end to end.
        </span>
      </h2>
    </section>
  );
}
