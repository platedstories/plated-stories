import "./BottomBlur.css";

// Progressive blur pinned to the bottom of the viewport: content scrolling
// beneath it softens gradually instead of being cut off at the edge.
//
// One `backdrop-filter` can only blur uniformly, so the effect is built from
// stacked layers. Each blurs twice as hard as the one before and is masked to
// its own overlapping band, lower bands blurring harder, which reads as one
// smooth fade into blur.
const LAYERS = 6;

export default function BottomBlur() {
  return (
    <div className="bottom-blur" aria-hidden="true">
      {Array.from({ length: LAYERS }, (_, i) => (
        <span key={i} style={{ "--i": i, "--blur": `${0.5 * 2 ** i}px` }} />
      ))}
    </div>
  );
}
