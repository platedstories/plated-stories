"use client";
import "./Showreel.css";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LuVolumeX, LuVolume } from "react-icons/lu";
import { isVideo } from "@/components/CaseStudy/media";
import { optimizeImageUrl, optimizeVideoUrl } from "@/lib/media-delivery";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Each entry appears once: frames are tracked by URL.
const PROJECT_REELS = [
  "https://ik.imagekit.io/platedstories/1.%20Monsoon%20Vibe-compress-video-to-size.mp4?tr=w-1280,q-50",
  "https://ik.imagekit.io/platedstories/6.%20Cost%20more%20than%20car%20(1).mp4?tr=orig-true",
];

const SHOWREEL_IMAGES = [
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  "https://ik.imagekit.io/platedstories/34.heic",
  "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
  "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
  "https://ik.imagekit.io/platedstories/2.heic",
];

// The reels are spread evenly through the stills, opening on a still:
// a run of stills, a reel, the next run, and so on.
const STILLS_PER_REEL = Math.ceil(SHOWREEL_IMAGES.length / (PROJECT_REELS.length + 1));
const PROJECT_SHOWREEL_MEDIA = SHOWREEL_IMAGES.flatMap((still, i) => {
  const reel =
    (i + 1) % STILLS_PER_REEL === 0 ? PROJECT_REELS[(i + 1) / STILLS_PER_REEL - 1] : null;
  return reel ? [still, reel] : [still];
});

const STILL_MS = 2200;
const VIDEO_MS = 4000;

const Showreel = () => {
  const showreelSecRef = useRef(null);
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const videoRefs = useRef({});
  const [currentMedia, setCurrentMedia] = useState(PROJECT_SHOWREEL_MEDIA[0]);
  // Frames whose file couldn't be loaded; the reel steps over them instead
  // of holding an empty frame for its full duration.
  const [failed, setFailed] = useState(() => new Set());
  const [isMuted, setIsMuted] = useState(true);
  const [inView, setInView] = useState(true);

  const followingMedia = (src) => {
    const list = PROJECT_SHOWREEL_MEDIA;
    const from = list.indexOf(src);
    for (let step = 1; step <= list.length; step++) {
      const candidate = list[(from + step) % list.length];
      if (!failed.has(candidate)) return candidate;
    }
    return src;
  };
  const nextMedia = followingMedia(currentMedia);

  const markFailed = (src) =>
    setFailed((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));

  // The frame on screen failed: move on now.
  useEffect(() => {
    if (failed.has(currentMedia) && nextMedia !== currentMedia) {
      setCurrentMedia(nextMedia);
    }
  }, [failed, currentMedia, nextMedia]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);

      if (!audioRef.current.muted && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  useEffect(() => {
    if (nextMedia === currentMedia || !inView) return;

    const id = setTimeout(
      () => setCurrentMedia(nextMedia),
      isVideo(currentMedia) ? VIDEO_MS : STILL_MS
    );

    return () => clearTimeout(id);
  }, [currentMedia, nextMedia, inView]);

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([src, video]) => {
      if (!video) return;

      video.muted = true;
      video.volume = 0;

      if (src === currentMedia && inView) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    });
  }, [currentMedia, inView]);

  useEffect(() => {
    const section = showreelSecRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const section = showreelSecRef.current;
      const container = containerRef.current;
      if (!section || !container) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1000px)", () => {
        const scrollTriggerInstances = [];

        // The track starts muted, so playing it here would only download
        // 2.3MB nobody hears. toggleMute starts it on the first unmute.
        if (audioRef.current && !audioRef.current.muted) {
          audioRef.current.play().catch(() => {});
        }

        const scrollTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 2}px`,
          pin: true,
          pinSpacing: true,
          // Pins refresh in document order — a pin above this one changes
          // where this one starts, so it has to be measured first.
          refreshPriority: 3,
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

        if (scrollTrigger) {
          scrollTriggerInstances.push(scrollTrigger);
        }

        return () => {
          scrollTriggerInstances.forEach((trigger) => trigger.kill());
        };
      });

      mm.add("(max-width: 999px)", () => {
        const showreelSection = showreelSecRef.current;
        if (showreelSection) {
          gsap.set(showreelSection, { clearProps: "all" });
        }
        gsap.set(container, { clearProps: "all" });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: showreelSecRef }
  );

  return (
    <section className="showreel" ref={showreelSecRef}>
      <div className="showreel-container" ref={containerRef}>
        {PROJECT_SHOWREEL_MEDIA.map((src) => {
          const isCurrent = src === currentMedia;
          const shouldPrime =
            !failed.has(src) && (isCurrent || src === nextMedia);
          const onError = () => markFailed(src);

          return (
            <div
              className={`showreel-layer${
                isCurrent ? " showreel-layer--active" : ""
              }`}
              key={src}
              aria-hidden={!isCurrent}
            >
              {isVideo(src) ? (
                <video
                  ref={(el) => {
                    videoRefs.current[src] = el;
                  }}
                  src={shouldPrime ? optimizeVideoUrl(src, 1920) : undefined}
                  onError={onError}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={shouldPrime ? optimizeImageUrl(src, 1920) : undefined}
                  alt={isCurrent ? "Project showreel" : ""}
                  decoding="async"
                  onError={onError}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="volume-icon" onClick={toggleMute}>
        {isMuted ? (
          <LuVolumeX color="var(--base-400)" size={25} />
        ) : (
          <LuVolume color="var(--base-400)" size={25} />
        )}
      </div>

      <audio
        ref={audioRef}
        src="/showreel/showreel_music.mp3"
        preload="none"
        loop
        muted={isMuted}
      />
    </section>
  );
};

export default Showreel;
