"use client";
import "./BrandGallery.css";
import { useRef } from "react";
import { brandGalleryItems } from "./galleryItems.js";
import Copy from "@/components/Copy/Copy";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import OptimizedVideo from "@/components/OptimizedVideo/OptimizedVideo";
import { optimizeImageUrl } from "@/lib/media-delivery";
import { useViewTransition } from "@/hooks/useViewTransition";

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

export default function BrandGallery() {
  const galleryRef = useRef(null);
  const { navigateWithTransition, router } = useViewTransition();

  useGSAP(
    () => {
      const items = gsap.utils.toArray(".brand-gallery-item");
      if (!items.length) return;

      // Each item is driven by its OWN ScrollTrigger, so it reveals the moment
      // it scrolls into view rather than all firing off the grid at once.
      items.forEach((item) => {
        const imgWrap = item.querySelector(".brand-gallery-item-img");
        const img = item.querySelector("img, video");
        const label = item.querySelector(".brand-gallery-item-label");

        // Hidden start — clipped shut, media pre-zoomed, label down.
        gsap.set(imgWrap, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        });
        gsap.set(img, { scale: 1.28 });
        gsap.set(label, { y: 14, autoAlpha: 0 });

        // Fast reveal, played once as the item enters the viewport.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: item, start: "top 85%", once: true },
        });
        tl.to(imgWrap, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.3,
          ease: "hop",
        })
          .to(img, { scale: 1.12, duration: 0.3, ease: "hop" }, 0)
          .to(
            label,
            { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" },
            0.15
          );

        // Continuous parallax — the media drifts inside its frame on scroll.
        // The 1.12 resting scale leaves headroom so no edge is ever exposed.
        gsap.fromTo(
          img,
          { yPercent: 5 },
          {
            yPercent: -5,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: galleryRef }
  );

  return (
    <div className="brand-gallery" ref={galleryRef}>
      <div className="brand-gallery-grid">
        <div className="brand-gallery-note">
          <Copy animateOnScroll={true}>
            <p className="lg">
              We are a creative content agency specializing
              <br />
              in visual storytelling for F&amp;B and lifestyle brands.
              <br />
              From concept development and shoot planning to
              <br />
              production, editing and content delivery, we manage the
              <br />
              entire creative process end-to-end.
            </p>
          </Copy>
        </div>

        {brandGalleryItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`brand-gallery-item brand-gallery-item--${item.position}`}
            aria-label={`View ${item.label} project`}
            onMouseEnter={() => router.prefetch(item.href)}
            onClick={(event) => {
              event.preventDefault();
              navigateWithTransition(item.href);
            }}
          >
            <div className="brand-gallery-item-img">
              {item.type === "video" ? (
                <OptimizedVideo
                  src={item.src}
                  width={960}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={optimizeImageUrl(item.src, 960)}
                  alt={item.label}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
            <div className="brand-gallery-item-label">
              <p className="sm">{item.label}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
