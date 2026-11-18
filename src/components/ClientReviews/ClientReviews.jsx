"use client";
import "./ClientReviews.css";
import { clientReviewsData } from "./clientReviewsData.js";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// How far the card underneath sinks as the next one covers it. Small numbers
// on purpose - the stack should read as depth, not as the old card running
// away from the new one.
const SETTLE_SCALE = 0.92;
const SETTLE_LIFT = -3;
const TILT = 2.5;

const ClientReviews = () => {
  const clientReviewsContainerRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // One pinned stage, one scrubbed timeline. The previous version pinned
      // every card separately with `pinSpacing: false` and no tween between
      // them, so an incoming card simply guillotined the one below it
      // mid-sentence, and the pins - created in a delayedCall, after other
      // sections had already registered their own - measured against a stale
      // layout and left a viewport-sized gap before the last card.
      mm.add("(min-width: 1000px)", () => {
        const cards = gsap.utils.toArray(".review-card");
        const containers = gsap.utils.toArray(".review-card-container");
        const quotes = gsap.utils.toArray(".review-card-content-wrapper");
        if (cards.length < 2) return;

        // Card 1 is already in place; the rest wait just below the stage.
        // Tilt lives on the container and vertical travel on the card, so the
        // two transforms never have to share a matrix.
        gsap.set(cards, {
          yPercent: (i) => (i === 0 ? 0 : 100),
          zIndex: (i) => i + 1,
        });
        gsap.set(containers, {
          rotation: (i) => (i % 2 === 0 ? TILT : -TILT),
          scale: 1,
          transformOrigin: "50% 50%",
        });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: clientReviewsContainerRef.current,
            start: "top top",
            // One viewport of scrolling per handover, recalculated on
            // refresh so a resize (or a mobile URL bar) can't strand the
            // timeline against a stale end position.
            end: () => `+=${(cards.length - 1) * window.innerHeight}`,
            pin: true,
            pinSpacing: true,
            // Pins refresh in document order - a pin above this one changes
            // where this one starts, so it has to be measured first.
            refreshPriority: 1,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        cards.forEach((card, i) => {
          if (i === 0) return;
          const step = i - 1;

          timeline
            .to(
              containers[i - 1],
              { scale: SETTLE_SCALE, yPercent: SETTLE_LIFT, duration: 1 },
              step
            )
            // The incoming card covers the one below from the bottom up, so
            // the quote underneath has to be gone before that edge reaches
            // it - otherwise you spend the handover reading a sentence
            // sliced in half. The card body stays solid; only its text goes.
            .to(quotes[i - 1], { opacity: 0, duration: 0.35 }, step + 0.1)
            // Eased rather than linear: the cover crosses the middle of the
            // handover quickly, so the half-covered moment - where the card
            // below is a blank slab with its quote already gone - is over
            // fast, while the arrival still settles gently.
            .to(card, { yPercent: 0, duration: 1, ease: "power2.inOut" }, step);
        });

        return () => {
          timeline.kill();
          gsap.set([...cards, ...containers, ...quotes], { clearProps: "all" });
        };
      });

      // Below the breakpoint the cards are a plain scrolling list - nothing
      // is pinned, so anything the desktop branch set has to come back off.
      mm.add("(max-width: 999px)", () => {
        gsap.set(
          gsap.utils.toArray(
            ".review-card, .review-card-container, .review-card-content-wrapper"
          ),
          { clearProps: "all" }
        );
      });

      return () => {
        mm.revert();
      };
    },
    { scope: clientReviewsContainerRef }
  );

  return (
    <div className="client-reviews" ref={clientReviewsContainerRef}>
      {clientReviewsData.map((item, index) => (
        <div className="review-card" key={item.clientName}>
          <div
            className="review-card-container"
            id={`review-card-${index + 1}`}
          >
            <div className="review-card-content">
              <div className="review-card-content-wrapper">
                <h3 className="review-card-text lg">{item.review}</h3>
                <div className="review-card-client-info">
                  <p className="review-card-client cap">{item.clientName}</p>
                  <p className="review-card-client-company sm">
                    {item.clientCompany}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientReviews;
