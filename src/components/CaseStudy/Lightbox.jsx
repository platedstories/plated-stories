"use client";
import { useEffect } from "react";
import { LuArrowLeft, LuArrowRight, LuX } from "react-icons/lu";
import { isVideo } from "./media";
import OptimizedVideo from "@/components/OptimizedVideo/OptimizedVideo";
import { optimizeImageUrl } from "@/lib/media-delivery";

// Full-frame viewer. Reels get real controls and sound here - the tile only
// ever loops muted, because nobody asked it to make noise. Arrows and
// Escape work the way anyone would expect them to.
const Lightbox = ({ open, items, index, name, onClose, onStep }) => {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, onStep]);

  if (!open) return null;

  const src = items[index];
  if (!src) return null;

  return (
    <div className="cs-lightbox" role="dialog" aria-modal="true" aria-label={name}>
      <div className="cs-lightbox-bg" onClick={onClose} />

      <div className="cs-lightbox-stage">
        {isVideo(src) ? (
          <OptimizedVideo
            src={src}
            width={1920}
            autoPlay
            loop
            playsInline
            controls
            eager
          />
        ) : (
          <img
            src={optimizeImageUrl(src, 1920)}
            alt={`${name} ${index + 1}`}
            decoding="async"
          />
        )}
      </div>

      <div className="cs-lightbox-bar container">
        <p className="sm">{`${name} / ${String(index + 1).padStart(2, "0")} of ${String(
          items.length
        ).padStart(2, "0")}`}</p>

        <div className="cs-lightbox-controls">
          <button
            type="button"
            className="cs-round"
            onClick={() => onStep(-1)}
            aria-label="Previous"
          >
            <LuArrowLeft size={16} />
          </button>
          <button
            type="button"
            className="cs-round"
            onClick={() => onStep(1)}
            aria-label="Next"
          >
            <LuArrowRight size={16} />
          </button>
          <button
            type="button"
            className="cs-round"
            onClick={onClose}
            aria-label="Close"
          >
            <LuX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
