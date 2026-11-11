"use client";
import "./Spotlight.css";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
// Deliberately the same specifier every other component uses: "gsap/dist/..."
// resolves to the UMD build, which is a second, separate ScrollTrigger with
// its own trigger registry and its own idea of the scroll position.
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { isVideo } from "@/components/CaseStudy/media";
import OptimizedVideo from "@/components/OptimizedVideo/OptimizedVideo";
import { optimizeImageUrl } from "@/lib/media-delivery";

// Real stills and reels pulled from the shared studio pool and case-study
// media, in place of the generic placeholder art that used to live in
// /public/spotlight — the marquee now previews the actual work.
const SPOTLIGHT_MEDIA = [
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  "https://ik.imagekit.io/platedstories/34.heic",
  "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
  "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
  "https://ik.imagekit.io/platedstories/2.heic",
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  "https://ik.imagekit.io/platedstories/34.heic",
  "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
  "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
  "https://ik.imagekit.io/platedstories/2.heic",
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  "https://ik.imagekit.io/platedstories/34.heic",
  "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
  "https://ik.imagekit.io/platedstories/1.%20Monsoon%20Vibe-compress-video-to-size.mp4?tr=w-1280,q-50",
  "https://ik.imagekit.io/platedstories/6.%20Cost%20more%20than%20car%20(1).mp4?tr=orig-true",
  "https://ik.imagekit.io/platedstories/1.%20Monsoon%20Vibe-compress-video-to-size.mp4?tr=w-1280,q-50",
];

const SpotlightImage = ({ number }) => {
  const src = SPOTLIGHT_MEDIA[(number - 1) % SPOTLIGHT_MEDIA.length];

  return isVideo(src) ? (
    <OptimizedVideo src={src} width={640} autoPlay muted loop playsInline />
  ) : (
    <img
      src={optimizeImageUrl(src, 640)}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
};

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Spotlight = () => {
  const spotlightRef = useRef(null);

  useGSAP(
    () => {
      const scrollTriggerInstances = [];

      const initSpotlight = () => {
        new SplitType(".marquee-text-item h1", { types: "chars" });

        document
          .querySelectorAll(".marquee-container")
          .forEach((container, index) => {
            const marquee = container.querySelector(".marquee");
            const chars = container.querySelectorAll(".char");

            const marqueeTrigger = gsap.to(marquee, {
              x: index % 2 === 0 ? "5%" : "-15%",
              scrollTrigger: {
                trigger: container,
                start: "top bottom",
                end: "150% top",
                scrub: true,
              },
              force3D: true,
            });

            const charsTrigger = gsap.fromTo(
              chars,
              { fontWeight: 100 },
              {
                fontWeight: 900,
                duration: 1,
                ease: "none",
                stagger: {
                  each: 0.35,
                  from: index % 2 === 0 ? "end" : "start",
                  ease: "linear",
                },
                scrollTrigger: {
                  trigger: container,
                  start: "50% bottom",
                  end: "top top",
                  scrub: true,
                },
              }
            );

            if (marqueeTrigger.scrollTrigger) {
              scrollTriggerInstances.push(marqueeTrigger.scrollTrigger);
            }
            if (charsTrigger.scrollTrigger) {
              scrollTriggerInstances.push(charsTrigger.scrollTrigger);
            }
          });

      };

      // Created synchronously with everything else. The old version deferred
      // this behind timers to "wait for" the pinned sections above it, which
      // only guaranteed these triggers were measured against a layout the pins
      // had already changed.
      initSpotlight();

      return () => {
        scrollTriggerInstances.forEach((trigger) => trigger.kill());
      };
    },
    { scope: spotlightRef }
  );

  return (
    <section className="spotlight" ref={spotlightRef}>
      <div className="marquees">
        <div className="marquee-container" id="marquee-1">
          <div className="marquee">
            <div className="marquee-img-item">
              <SpotlightImage number={1} />
            </div>
            <div className="marquee-img-item marquee-text-item">
              <h1>Curation</h1>
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={2} />
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={3} />
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={4} />
            </div>
          </div>
        </div>

        <div className="marquee-container" id="marquee-2">
          <div className="marquee">
            <div className="marquee-img-item">
              <SpotlightImage number={5} />
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={6} />
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={7} />
            </div>
            <div className="marquee-img-item marquee-text-item">
              <h1>Direction</h1>
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={8} />
            </div>
          </div>
        </div>

        <div className="marquee-container" id="marquee-3">
          <div className="marquee">
            <div className="marquee-img-item">
              <SpotlightImage number={9} />
            </div>
            <div className="marquee-img-item marquee-text-item">
              <h1>Shooting</h1>
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={10} />
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={11} />
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={12} />
            </div>
          </div>
        </div>

        <div className="marquee-container" id="marquee-4">
          <div className="marquee">
            <div className="marquee-img-item">
              <SpotlightImage number={13} />
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={14} />
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={15} />
            </div>
            <div className="marquee-img-item marquee-text-item">
              <h1>Editing</h1>
            </div>
            <div className="marquee-img-item">
              <SpotlightImage number={16} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Spotlight;
