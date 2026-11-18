"use client";
import { useEffect, useRef, useState } from "react";
import { LuVolumeX, LuVolume, LuPlay, LuPause } from "react-icons/lu";
import { isVideo } from "./media";
import OptimizedVideo from "@/components/OptimizedVideo/OptimizedVideo";
import { optimizeImageUrl } from "@/lib/media-delivery";

// A single tile in a series strip or grid. Stills are plain images; a reel
// autoplays muted (the only way browsers allow it) and carries a play/mute
// cluster revealed on hover or focus.
//
// The whole tile opens the viewer when `onOpen` is given. The control
// buttons sit inside it, so they stop the click from bubbling - pausing a
// reel in place should not also throw it full-screen.
const MediaFrame = ({
  src,
  label,
  className = "",
  hidden = false,
  onOpen,
  landscape = false,
}) => {
  const videoRef = useRef(null);
  const userPausedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // A case study carries a lot of reels, and a marquee clones its track, so
  // several sections' worth of video would otherwise decode at once. Only
  // what is actually on screen plays; a deliberate pause is remembered so
  // scrolling past and back does not restart it.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userPausedRef.current) video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // A cloned marquee tile still opens the viewer under the cursor - it is
  // indistinguishable from the original on screen - but it is hidden from
  // assistive tech, so it must not also be a second tab stop announcing the
  // same frame twice. Mouse gets the click; only the original gets the role.
  const clickable = Boolean(onOpen);
  const interactive = clickable && !hidden;

  // Marks the tile as something you can open, cloned or not - the cursor and
  // the "View" cue hang off this rather than off the ARIA role, which the
  // clones deliberately do not carry.
  const openClass = clickable ? " cs-frame--open" : "";
  const landscapeClass = landscape ? " cs-frame--landscape" : "";

  const openProps = clickable
    ? {
        onClick: onOpen,
        ...(interactive
          ? {
              role: "button",
              tabIndex: 0,
              "aria-label": `View ${label}`,
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen();
                }
              },
            }
          : {}),
      }
    : {};

  if (!isVideo(src)) {
    return (
      <div
        className={`cs-frame${openClass}${landscapeClass} ${className}`.trim()}
        aria-hidden={hidden}
        {...openProps}
      >
        <img
          src={optimizeImageUrl(src, landscape ? 1280 : 800)}
          alt={hidden ? "" : label}
          loading="lazy"
          decoding="async"
        />
        {clickable ? <span className="sm cs-frame-cue">View</span> : null}
      </div>
    );
  }

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted) video.volume = 1;
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  return (
    <div
      className={`cs-frame cs-frame--video${openClass}${landscapeClass} ${className}`.trim()}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden}
      {...openProps}
    >
      <OptimizedVideo
        ref={videoRef}
        src={src}
        width={landscape ? 1280 : 800}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
      />

      <div className="cs-frame-controls">
        <button
          type="button"
          className="cs-frame-btn"
          onClick={togglePlay}
          tabIndex={hidden ? -1 : 0}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <LuPause size={16} /> : <LuPlay size={16} />}
        </button>
        <button
          type="button"
          className="cs-frame-btn"
          onClick={toggleMute}
          tabIndex={hidden ? -1 : 0}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <LuVolumeX size={16} /> : <LuVolume size={16} />}
        </button>
      </div>
    </div>
  );
};

export default MediaFrame;
