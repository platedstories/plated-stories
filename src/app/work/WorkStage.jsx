"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { optimizeImageUrl } from "@/lib/media-delivery";

// How long each shot holds. Idle, the stage drifts slowly through the whole
// category; once a row is hovered it flicks through that one project faster,
// so the hover reads as "show me this" rather than "wait for it".
const IDLE_HOLD_MS = 2800;
const ACTIVE_HOLD_MS = 1400;
// Layers kept mounted under the incoming one. The wipe reveals the new shot
// over the old, so the old must still be there; three covers fast row-to-row
// hovering without an older layer vanishing mid-wipe.
const MAX_LAYERS = 3;
const STAGE_WIDTH = 960;

let layerSeq = 0;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// The live preview panel at the foot of each category card.
//
// `active` is the hovered project (or null). With nothing hovered the
// playlist is the category itself: one shot per project when there are
// plenty of projects, every shot when there are only a few, so a one-project
// category still has something to cycle through.
const WorkStage = ({ category, active, onNavigate }) => {
  const playlist = useMemo(() => {
    if (active) {
      return active.images.map((src) => ({ src, project: active }));
    }
    const perProject = category.projects.length >= 4 ? 1 : 3;
    return category.projects.flatMap((project) =>
      project.images
        .slice(0, perProject)
        .map((src) => ({ src, project }))
    );
  }, [category, active]);

  const playlistKey = active ? active.slug : "__idle";
  const hold = active ? ACTIVE_HOLD_MS : IDLE_HOLD_MS;

  // The position is stored against the playlist it belongs to, so a new
  // hover (or leaving the card) starts that playlist from its first shot on
  // the very same render, never flashing a stale index from the old one.
  const [pos, setPos] = useState({ key: playlistKey, i: 0 });
  const index = pos.key === playlistKey ? pos.i : 0;

  const [layers, setLayers] = useState(() => [
    { id: layerSeq++, src: playlist[0]?.src, instant: true },
  ]);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
  }, []);

  const current = playlist[index % playlist.length];

  // Every change of shot mounts a fresh layer on top; its CSS animation
  // does the wipe. Older layers are trimmed once they can no longer show.
  useEffect(() => {
    if (!current) return;
    setLayers((prev) => {
      if (prev[prev.length - 1]?.src === current.src) return prev;
      return [
        ...prev.slice(-(MAX_LAYERS - 1)),
        { id: layerSeq++, src: current.src, instant: reduced.current },
      ];
    });
  }, [current]);

  useEffect(() => {
    if (playlist.length < 2 || reduced.current) return;
    const id = setTimeout(
      () => setPos({ key: playlistKey, i: (index + 1) % playlist.length }),
      hold
    );
    return () => clearTimeout(id);
  }, [index, playlist.length, hold, playlistKey]);

  // Warm the next shot so the wipe never reveals a half-loaded image.
  useEffect(() => {
    const next = playlist[(index + 1) % playlist.length];
    if (!next) return;
    const img = new Image();
    img.src = optimizeImageUrl(next.src, STAGE_WIDTH);
  }, [index, playlist]);

  if (!current) return null;

  const project = current.project;
  const shot = (index % playlist.length) + 1;

  return (
    <a
      className={`wi-stage${active ? " is-active" : ""}`}
      href={project.href}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(project.href);
      }}
      aria-label={`Open ${project.name}`}
    >
      <div className="wi-stage-layers" aria-hidden="true">
        {layers.map((layer, i) => (
          <div
            className={`wi-stage-layer${layer.instant ? " is-instant" : ""}`}
            key={layer.id}
            style={{ zIndex: i + 1 }}
          >
            <img
              src={optimizeImageUrl(layer.src, STAGE_WIDTH)}
              alt=""
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
          </div>
        ))}
      </div>

      {playlist.length > 1 && (
        <div className="wi-stage-progress" aria-hidden="true">
          {playlist.map((item, i) => (
            <span
              key={`${playlistKey}-${i}`}
              className={
                i < index % playlist.length
                  ? "is-done"
                  : i === index % playlist.length
                    ? "is-current"
                    : ""
              }
            >
              <i
                key={`${playlistKey}-${index}`}
                style={{ animationDuration: `${hold}ms` }}
              />
            </span>
          ))}
        </div>
      )}

      <div className="wi-stage-caption">
        <div className="wi-stage-title">
          <span className="wi-mono">{active ? "Now viewing" : "Showreel"}</span>
          <span className="wi-stage-name" key={project.slug}>
            {project.name}
          </span>
        </div>
        <span className="wi-mono wi-stage-count">
          {String(shot).padStart(2, "0")} / {String(playlist.length).padStart(2, "0")}
        </span>
      </div>

      <span className="wi-stage-cta wi-mono" aria-hidden="true">
        Open case <Arrow />
      </span>
    </a>
  );
};

export const Arrow = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="square"
    aria-hidden="true"
  >
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export default WorkStage;
