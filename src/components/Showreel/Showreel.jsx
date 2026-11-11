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

const PROJECT_REELS = [
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788365967/1._Monsoon_Vibe.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788378603/6._Cult_Favourite.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788378600/7._Idli_Making.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788378596/2._Dal_Vada.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788378572/10._Thali.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788378571/8._Benne_Dosa.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788377446/1._Mulbagal_Dosa.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788413984/eyi.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788413980/eiruo.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788413967/xfgfchvgj.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1788413967/rwe.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1789021541/1._Conners_of_hive.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1789021540/2._Serving_Now.mov",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1789021535/3._Food_is_Art.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1789021556/4._Soba_Noodles.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1789114078/1._Hamper.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1789114071/1._DIY.mp4",
  "https://res.cloudinary.com/vaxfpcja/video/upload/v1789114064/2._Cake_Canvas.mp4",
];

const SHOWREEL_IMAGES = [
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  "https://ik.imagekit.io/platedstories/34.heic",
  "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
  "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
  "https://ik.imagekit.io/platedstories/2.heic",
];

// The stills are spread evenly through the reels, opening on one: a still,
// a run of reels, the next still, and so on.
const REELS_PER_STILL = Math.ceil(PROJECT_REELS.length / SHOWREEL_IMAGES.length);
const PROJECT_SHOWREEL_MEDIA = PROJECT_REELS.flatMap((reel, i) => {
  const still =
    i % REELS_PER_STILL === 0 ? SHOWREEL_IMAGES[i / REELS_PER_STILL] : null;
  return still ? [still, reel] : [reel];
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
