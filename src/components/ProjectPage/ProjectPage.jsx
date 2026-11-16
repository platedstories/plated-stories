"use client";
import "./ProjectPage.css";
import { useRef, useState } from "react";
import { LuVolumeX, LuVolume, LuPlay, LuPause } from "react-icons/lu";
import Footer from "@/components/Footer/Footer";
import Copy from "@/components/Copy/Copy";
import OptimizedVideo from "@/components/OptimizedVideo/OptimizedVideo";
import { optimizeImageUrl } from "@/lib/media-delivery";

// Mute + play/pause overlay for the hero video, styled after the
// homepage Showreel's volume toggle (react-icons/lu, same icon family).
// The cluster only fades in while the banner is hovered/focused — see
// .project-video-controls in ProjectPage.css.
const VideoControls = ({ videoRef }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="project-video-controls">
      <button
        type="button"
        className="project-video-control-btn"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {isPlaying ? <LuPause size={18} /> : <LuPlay size={18} />}
      </button>
      <button
        type="button"
        className="project-video-control-btn"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <LuVolumeX size={18} /> : <LuVolume size={18} />}
      </button>
    </div>
  );
};

// Starting-point template a project page can render through. Each project
// now owns its own literal route/file under src/app/work/<category>/<slug>,
// so this only stays shared until a page grows its own bespoke UI — swap it
// out there whenever a project needs to diverge. `heroVideo` is optional and
// plays in the full-bleed banner section directly under the title copy.
const ProjectPage = ({ name, images = [], heroVideo }) => {
  const at = (i) => images[i % images.length];
  const videoRef = useRef(null);

  return (
    <div className="sample-project-page">
      <section className="project-header">
        <Copy delay={0.75}>
          <p className="lg">Featured Case Study</p>
          <h1>{name}</h1>
        </Copy>
      </section>

      <section className="project-banner-img" tabIndex={heroVideo ? 0 : undefined}>
        <div className="project-banner-img-wrapper">
          {heroVideo ? (
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
            />
          ) : (
            <img
              src={optimizeImageUrl(at(0), 1920)}
              alt={name}
              decoding="async"
              fetchPriority="high"
            />
          )}
        </div>

        {heroVideo && <VideoControls videoRef={videoRef} />}
      </section>

      <section className="project-details">
        <Copy animateOnScroll={true}>
          <div className="details">
            <p>The Problem</p>
            <h3>
              When {name} partnered with Plated Stories, the brand had a
              strong offering but lacked a digital identity that reflected
              its quality, story and authenticity &mdash; making it hard to
              reach new audiences or build a loyal community.
            </h3>
          </div>

          <div className="details">
            <p>The Approach</p>
            <h3>
              We built a content ecosystem balancing storytelling,
              entertainment and visual appeal &mdash; highlighting the story
              and philosophy behind the brand through consistent posting and
              creative experimentation.
            </h3>
          </div>

          <div className="details">
            <p>Studio</p>
            <h3>Plated Stories</h3>
          </div>
        </Copy>
      </section>

      <section className="project-images">
        <div className="project-images-container">
          {[1, 2, 3, 4, 5].map((i) => (
            <div className="project-img" key={i}>
              <div className="project-img-wrapper">
                <img
                  src={optimizeImageUrl(at(i), 1400)}
                  alt={`${name} preview ${i}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="project-details">
        <Copy animateOnScroll={true}>
          <div className="details">
            <p>The Solution</p>
            <h3>
              Plated Stories managed the entire creative process &mdash; from
              ideation and scripting to production, editing and strategy.
              Our content focused on high-quality visuals, founder-led
              storytelling and consistent brand messaging, transforming the
              page into a thriving content-driven community.
            </h3>
          </div>

        </Copy>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectPage;
