"use client";
import "@/components/Showreel/Showreel.css";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LuVolumeX, LuVolume } from "react-icons/lu";
import { isVideo } from "@/components/CaseStudy/media";
import { optimizeImageUrl, optimizeVideoUrl } from "@/lib/media-delivery";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// How long each frame holds. A still is a flipbook beat, matching the
// homepage Showreel's 500ms; a reel needs long enough to read as motion.
const STILL_MS = 500;
const VIDEO_MS = 3000;

// The homepage Showreel, driven by this project's own media instead of the
// /showreel/*.jpg sequence. The pin, the 0.75 -> 1 scale and the 2rem -> 0
// border-radius are lifted from it unchanged, so the frame behaves exactly
// as it does on the homepage; only the source of the frames differs.
//
// Every item is mounted and stacked, with the active one faded in. Swapping
// a single element's `src` would flash on each beat, and stacking means the
// browser has the whole sequence decoded before the frame is pinned.
const CsShowreel = ({ media = [], label }) => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const [index, setIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [inView, setInView] = useState(true);

  // Advance the sequence. A timeout per frame rather than one interval, so
  // stills and reels can hold for different lengths.
  useEffect(() => {
    if (media.length < 2 || !inView) return;

    const id = setTimeout(
      () => setIndex((i) => (i + 1) % media.length),
      isVideo(media[index]) ? VIDEO_MS : STILL_MS
    );

    return () => clearTimeout(id);
  }, [index, media, inView]);

  // Only the frame on screen plays, and only while the section is in view —
  // this page carries enough reels that letting them all run would decode a
  // dozen streams at once.
  useEffect(() => {
    // Keyed by position, not URL: the same file can appear more than once.
    Object.entries(videoRefs.current).forEach(([i, video]) => {
      if (!video) return;

      if (Number(i) === index && inView) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    });
  }, [index, inView]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const toggleMute = () => setIsMuted((muted) => !muted);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const container = containerRef.current;
      if (!section || !container || !media.length) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1000px)", () => {
        const scrollTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 2}px`,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            const progress = self.progress;

            const scaleValue = gsap.utils.mapRange(0, 1, 0.75, 1, progress);
            const borderRadiusValue =
              progress <= 0.5 ? gsap.utils.mapRange(0, 0.5, 2, 0, progress) : 0;

            gsap.set(container, {
              scale: scaleValue,
              borderRadius: `${borderRadiusValue}rem`,
            });
          },
        });

        const refreshHandler = () => ScrollTrigger.refresh();

        window.addEventListener("orientationchange", refreshHandler);
        window.addEventListener("resize", refreshHandler);
        window.addEventListener("load", refreshHandler, { passive: true });

        return () => {
          scrollTrigger.kill();
          window.removeEventListener("orientationchange", refreshHandler);
          window.removeEventListener("resize", refreshHandler);
          window.removeEventListener("load", refreshHandler);
        };
      });

      mm.add("(max-width: 999px)", () => {
        if (sectionRef.current) {
          gsap.set(sectionRef.current, { clearProps: "all" });
        }
        gsap.set(container, { clearProps: "all" });

        ScrollTrigger.refresh();

        const refreshHandler = () => ScrollTrigger.refresh();

        window.addEventListener("orientationchange", refreshHandler);
        window.addEventListener("load", refreshHandler, { passive: true });

        return () => {
          window.removeEventListener("orientationchange", refreshHandler);
          window.removeEventListener("load", refreshHandler);
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [media.length] }
  );

  if (!media.length) return null;

  return (
    <section className="showreel cs-showreel" ref={sectionRef}>
      <div className="showreel-container" ref={containerRef}>
        {media.map((src, i) => {
          const shouldPrime = i === index || i === (index + 1) % media.length;
          return (
          <div
            className={`cs-showreel-layer${
              i === index ? " cs-showreel-layer--active" : ""
            }`}
            key={`${src}-${i}`}
            aria-hidden={i !== index}
          >
            {isVideo(src) ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={shouldPrime ? optimizeVideoUrl(src, 1920) : undefined}
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={shouldPrime ? optimizeImageUrl(src, 1920) : undefined}
                alt={i === index ? label : ""}
                decoding="async"
              />
            )}
          </div>
          );
        })}
      </div>

      <div
        className="volume-icon"
        onClick={toggleMute}
        role="button"
        tabIndex={0}
        aria-label={isMuted ? "Unmute showreel" : "Mute showreel"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMute();
          }
        }}
      >
        {isMuted ? (
          <LuVolumeX color="var(--base-400)" size={25} />
        ) : (
          <LuVolume color="var(--base-400)" size={25} />
        )}
      </div>
    </section>
  );
};

export default CsShowreel;
