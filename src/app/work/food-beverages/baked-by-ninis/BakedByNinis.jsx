"use client";
import "./baked-by-ninis.css";
import { useEffect, useRef, useState } from "react";
import { LuVolumeX, LuVolume, LuPlay, LuPause } from "react-icons/lu";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Footer from "@/components/Footer/Footer";
import Copy from "@/components/Copy/Copy";
import Button from "@/components/Button/Button";
import OptimizedVideo from "@/components/OptimizedVideo/OptimizedVideo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Body copy lives in plain string constants rather than inline JSX text.
// GSAP's SplitText rebuilds the DOM text nodes it splits and trims the
// leading whitespace of each one, so an inline `When {name} partnered`
// (text node / expression / text node) rendered as "Nini'spartnered". One
// text node, one string, no boundary to lose.
const EM = "—";
const RSQUO = "’";

const CHAPTERS = [
  {
    index: "01",
    kicker: "Context",
    title: "The",
    accent: "Problem",
    copy: `When Baked by Nini${RSQUO}s partnered with Plated Stories, the brand had a strong offering but lacked a digital identity that reflected its quality, story and authenticity ${EM} making it hard to reach new audiences or build a loyal community.`,
  },
  {
    index: "02",
    kicker: "Strategy",
    title: "The",
    accent: "Approach",
    copy: `We built a content ecosystem balancing storytelling, entertainment and visual appeal ${EM} highlighting the story and philosophy behind the brand through consistent posting and creative experimentation.`,
    dark: true,
  },
  {
    index: "03",
    kicker: "Execution",
    title: "The",
    accent: "Solution",
    copy: `Plated Stories managed the entire creative process ${EM} from ideation and scripting to production, editing and strategy. Our content focused on high-quality visuals, founder-led storytelling and consistent brand messaging, transforming the page into a thriving content-driven community.`,
  },
];

const META = [
  { label: "Client", value: "Baked by Nini’s" },
  { label: "Category", value: "Food & Beverages" },
  { label: "Services", value: "Strategy, Production, Editing" },
];

// Mute + play/pause overlay for the reel, matching the Showreel's control
// language (react-icons/lu, same icon family). The cluster only fades in
// while the reel is hovered or focused. Controlled by the page so the
// icons always reflect the element's real muted/paused state.
const VideoControls = ({ isMuted, isPlaying, toggleMute, togglePlay }) => {
  return (
    <div className="bbn-reel-controls">
      <button
        type="button"
        className="bbn-reel-btn"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {isPlaying ? <LuPause size={18} /> : <LuPlay size={18} />}
      </button>
      <button
        type="button"
        className="bbn-reel-btn"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <LuVolumeX size={18} /> : <LuVolume size={18} />}
      </button>
    </div>
  );
};

// Bespoke case-study page for Baked by Nini's. Deliberately not the shared
// ProjectPage template: the chapter labels carry the display headline
// (the `.line1` treatment the homepage "We are Plated Stories" h1 gets) and
// the descriptive sentences sit under them as light supporting copy.
const BakedByNinis = ({ name, heroVideo, next }) => {
  const videoRef = useRef(null);
  const reelRef = useRef(null);
  const disarmRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // The reel is meant to play with sound on. Browsers only permit autoplay
  // while muted, so the element still renders `muted` — dropping it would
  // block playback entirely — and we unmute the moment it starts. If the
  // browser rejects unmuted playback (no prior interaction with the site),
  // we fall back to muted and take the visitor's first gesture anywhere on
  // the page as the permission to turn sound on.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const gestures = ["pointerdown", "keydown", "touchstart", "wheel"];

    const disarm = () => {
      gestures.forEach((g) => window.removeEventListener(g, onGesture));
      disarmRef.current = null;
    };

    const tryUnmute = async () => {
      if (cancelled || !videoRef.current) return false;
      const v = videoRef.current;
      v.muted = false;
      v.volume = 1;
      try {
        await v.play();
        return !cancelled;
      } catch {
        // Blocked — stay muted and keep the reel visibly playing.
        v.muted = true;
        v.play().catch(() => {});
        return false;
      }
    };

    function onGesture() {
      tryUnmute().then((ok) => {
        if (ok) disarm();
      });
    }

    tryUnmute().then((ok) => {
      if (ok || cancelled) return;
      gestures.forEach((g) =>
        window.addEventListener(g, onGesture, { passive: true })
      );
      disarmRef.current = disarm;
    });

    return () => {
      cancelled = true;
      disarm();
    };
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    // A deliberate choice wins over the pending auto-unmute.
    disarmRef.current?.();
    video.muted = !video.muted;
    if (!video.muted) video.volume = 1;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  // Slow parallax drift on the reel while it scrolls through the viewport.
  useGSAP(
    () => {
      if (!videoRef.current || !reelRef.current) return;

      gsap.fromTo(
        videoRef.current,
        { yPercent: -6, scale: 1.16 },
        {
          yPercent: 6,
          scale: 1.02,
          ease: "none",
          scrollTrigger: {
            trigger: reelRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: reelRef }
  );

  const words = name.trim().split(" ");
  const lead = words.slice(0, -1).join(" ");
  const tail = words[words.length - 1];

  return (
    <div className="bbn-case">
      <section className="bbn-hero">
        <div className="container bbn-hero-inner">
          <Copy delay={0.5}>
            <p className="sm bbn-eyebrow">Featured Case Study</p>
          </Copy>

          <Copy delay={0.6}>
            <h1 className="bbn-hero-title">
              {lead ? `${lead} ` : ""}
              <span className="bbn-accent">{tail}</span>
            </h1>
          </Copy>

          <div className="bbn-hero-meta">
            {META.map((item) => (
              <div className="bbn-meta-item" key={item.label}>
                <Copy delay={0.75}>
                  <p className="sm">{item.label}</p>
                </Copy>
                <Copy delay={0.8}>
                  <p className="bbn-meta-value">{item.value}</p>
                </Copy>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bbn-reel" ref={reelRef} tabIndex={0}>
        <div className="bbn-reel-frame">
          <OptimizedVideo
            ref={videoRef}
            src={heroVideo}
            width={1920}
            eager
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
          />
        </div>

        <VideoControls
          isMuted={isMuted}
          isPlaying={isPlaying}
          toggleMute={toggleMute}
          togglePlay={togglePlay}
        />
      </section>

      {CHAPTERS.map((chapter) => (
        <section
          className={`bbn-chapter${chapter.dark ? " bbn-chapter--dark" : ""}`}
          key={chapter.index}
        >
          <div className="container bbn-chapter-inner">
            <Copy animateOnScroll={true}>
              <p className="sm bbn-chapter-index">
                {`${chapter.index} / ${chapter.kicker}`}
              </p>
            </Copy>

            <Copy animateOnScroll={true}>
              <h2 className="bbn-chapter-title">
                {`${chapter.title} `}
                <span className="bbn-accent">{chapter.accent}</span>
              </h2>
            </Copy>

            <Copy animateOnScroll={true}>
              <p className="bbn-chapter-copy">{chapter.copy}</p>
            </Copy>
          </div>
        </section>
      ))}

      <section className="bbn-closing">
        <div className="container bbn-closing-inner">
          <Copy animateOnScroll={true}>
            <p className="sm bbn-chapter-index">Next</p>
          </Copy>

          {next ? (
            <>
              <Copy animateOnScroll={true}>
                <h2 className="bbn-closing-title">{next.name}</h2>
              </Copy>

              <Button animateOnScroll={true} delay={0.25} href={next.href}>
                View the case study
              </Button>
            </>
          ) : (
            <>
              <Copy animateOnScroll={true}>
                <h2 className="bbn-closing-title">Your brand</h2>
              </Copy>

              <Button animateOnScroll={true} delay={0.25} href="/contact">
                Start your story
              </Button>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BakedByNinis;
