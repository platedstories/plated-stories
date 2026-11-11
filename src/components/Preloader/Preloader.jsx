"use client";
import "./Preloader.css";
import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { optimizeImageUrl } from "@/lib/media-delivery";

gsap.registerPlugin(useGSAP, CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

export let isInitialLoad = true;

// Fired the moment the overlay starts wiping up (phase E below), so the page
// beneath can time its intro to the reveal rather than to a fixed guess: the
// preloader's own timeline only starts once fonts are ready, so its wipe
// lands at a different time on every load. The flag covers a listener that
// attaches after the event has already gone out.
export const PRELOADER_REVEAL_EVENT = "preloader:reveal";
export const PRELOADER_REVEALED_KEY = "__platedStoriesPreloaderRevealed";

// Pool the slot-machine shuffle draws from — the studio's own gallery.
const allImageSources = [
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
  "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
  "https://ik.imagekit.io/platedstories/2.heic",
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  "https://ik.imagekit.io/platedstories/34.heic",
  "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
];

// The tile that survives the shuffle and zooms in to hand off to the hero.
const HERO_IMG = allImageSources[0];
const animationImageSources = allImageSources
  .slice(1)
  .map((src) => optimizeImageUrl(src, 640));
const optimizedHeroImage = optimizeImageUrl(HERO_IMG, 1920);

// The nine tiles the grid starts on before the shuffle takes over (centre = hero).
const initialGrid = [
  allImageSources[1],
  allImageSources[2],
  allImageSources[3],
  allImageSources[4],
  HERO_IMG,
  allImageSources[5],
  allImageSources[6],
  allImageSources[7],
  allImageSources[8],
];

const Preloader = () => {
  const preloaderRef = useRef(null);
  const [showPreloader, setShowPreloader] = useState(isInitialLoad);
  const [loaderAnimating, setLoaderAnimating] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  useEffect(() => {
    if (lenis) {
      if (loaderAnimating) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }, [lenis, loaderAnimating]);

  useGSAP(
    () => {
      if (!showPreloader) return;
      setLoaderAnimating(true);

      const waitForFonts = async () => {
        try {
          await document.fonts.ready;
          await document.fonts.load('700 16px "PP Neue Montreal"');
          await new Promise((resolve) => setTimeout(resolve, 100));
          return true;
        } catch (error) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return true;
        }
      };

      const initializeAnimation = async () => {
        await waitForFonts();

        const scope = preloaderRef.current;
        if (!scope) return;

        const gridImages = gsap.utils.toArray(scope.querySelectorAll(".img"));
        const heroTile = scope.querySelector(".hero-img");
        const otherTiles = gridImages.filter((tile) => tile !== heroTile);

        const getRandomImageSet = () => {
          const shuffled = [...animationImageSources].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, 9);
        };

        // Slot-machine effect: every tile flips to a fresh random photo on a
        // fixed cadence; on the final cycle the centre locks to the hero image.
        const startImageRotation = () => {
          const totalCycles = 12;

          for (let cycle = 0; cycle < totalCycles; cycle++) {
            const randomImages = getRandomImageSet();

            gsap.delayedCall(cycle * 0.12, () => {
              gridImages.forEach((tile, index) => {
                const imgElement = tile.querySelector("img");
                if (!imgElement) return;

                if (cycle === totalCycles - 1 && tile === heroTile) {
                  imgElement.src = optimizedHeroImage;
                  gsap.set(heroTile.querySelector("img"), { scale: 2 });
                } else {
                  imgElement.src = randomImages[index];
                }
              });
            });
          }
        };

        const tl = gsap.timeline();

        // Phase A — the logo fills from muted to bright, line by line.
        tl.to(
          ".logo-line-1",
          { backgroundPosition: "0% 0%", duration: 0.9, ease: "none" },
          0.3
        );
        tl.to(
          ".logo-line-2",
          { backgroundPosition: "0% 0%", duration: 0.9, ease: "none" },
          0.85
        );

        // Phase B — the grid wipes open and starts shuffling.
        tl.to(
          gridImages,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.8,
            stagger: 0.04,
            ease: "hop",
            onStart: startImageRotation,
          },
          1.1
        );

        tl.to(
          ".preloader-loader",
          { opacity: 0, duration: 0.4, ease: "power2.out" },
          2.5
        );

        // Phase C — everything but the centre tile collapses away.
        tl.to(
          otherTiles,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 0.7,
            stagger: 0.04,
            ease: "hop",
          },
          2.8
        );

        tl.to(".hero-img", { y: -30, duration: 0.5, ease: "hop" }, 3.3);

        // Phase D — the hero tile pushes in and settles.
        tl.to(
          ".hero-img",
          {
            scale: 4,
            clipPath: "polygon(20% 8%, 80% 8%, 80% 92%, 20% 92%)",
            duration: 1.1,
            ease: "hop",
            onStart: () => {
              gsap.to(".hero-img img", {
                scale: 1,
                duration: 1.1,
                ease: "hop",
              });
            },
          },
          3.7
        );

        // Phase E — the whole overlay wipes up to reveal the page beneath.
        tl.to(
          scope,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1.0,
            ease: "hop",
            onStart: () => {
              gsap.set(scope, { pointerEvents: "none" });
              window[PRELOADER_REVEALED_KEY] = true;
              window.dispatchEvent(new CustomEvent(PRELOADER_REVEAL_EVENT));
            },
            onComplete: () => {
              setTimeout(() => {
                setLoaderAnimating(false);
                setShowPreloader(false);
              }, 100);
            },
          },
          4.6
        );
      };

      initializeAnimation();
    },
    { scope: preloaderRef, dependencies: [showPreloader] }
  );

  if (!showPreloader) {
    return null;
  }

  return (
    <div className="preloader" ref={preloaderRef}>
      <div className="preloader-grid">
        {[0, 1, 2].map((row) => (
          <div className="grid-row" key={row}>
            {[0, 1, 2].map((col) => {
              const index = row * 3 + col;
              const isHero = index === 4;
              return (
                <div className={`img${isHero ? " hero-img" : ""}`} key={col}>
                  <img
                    src={isHero ? optimizedHeroImage : optimizeImageUrl(initialGrid[index], 640)}
                    alt=""
                    decoding="async"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="preloader-loader">
        <h1 className="logo-line-1">Plated</h1>
        <h1 className="logo-line-2">Stories</h1>
      </div>
    </div>
  );
};

export default Preloader;
