"use client";
import Copy from "@/components/Copy/Copy";
import MediaFrame from "./MediaFrame";
import { pad, slugify, splitRows } from "./media";

// One row of an endless marquee strip. Pulled out of SeriesSection so a
// section can run either one row or several — see `marqueeRows` there.
const MarqueeRow = ({
  items,
  offset,
  reverse,
  landscape,
  isItemLandscape,
  name,
  onOpen,
}) => (
  <div
    className={`cs-marquee${landscape ? " cs-marquee--landscape" : ""}${
      reverse ? " cs-marquee--reverse" : ""
    }`}
    style={{ "--marquee-duration": `${items.length * 7}s` }}
  >
    <div className="cs-marquee-track">
      {[...items, ...items].map((src, j) => {
        const source = offset + (j % items.length);
        return (
          <MediaFrame
            key={`${src}-${j}`}
            src={src}
            label={`${name} ${source + 1}`}
            className="cs-marquee-item"
            hidden={j >= items.length}
            onOpen={onOpen ? () => onOpen(source) : undefined}
            landscape={isItemLandscape(src)}
          />
        );
      })}
    </div>
  </div>
);

// One chapter of a case study: the label, the title and the copy first, then
// the media underneath — read the section, then look at it. Alternating
// grounds (`dark`) break the page into chapters rather than one long scroll
// of galleries.
//
// Two layouts, chosen per series:
//   marquee  — an endless strip, for sets big enough to run. `marqueeRows`
//              (default 1) splits the set across several stacked strips,
//              each running the opposite direction from the one above it.
//   grid     — a column layout at the series' own `columns` count
const SeriesSection = ({ item, index, dark, label = "Series", onOpen }) => {
  const landscape = item.frame === "landscape";
  // A section can also mark specific items as landscape rather than the
  // whole set — one wide reel mixed among otherwise vertical ones.
  const isItemLandscape = (src) => Boolean(item.landscapeMedia?.includes(src));
  const marqueeRows = item.marqueeRows ?? 1;

  return (
    <section
      className={`cs-series${dark ? " cs-series--dark" : ""}`}
      id={slugify(item.name)}
    >
      <div className="container cs-series-inner">
        <div className="cs-series-head">
          <Copy animateOnScroll={true}>
            <p className="sm cs-index">{`${pad(index + 1)} / ${label}`}</p>
          </Copy>

          <Copy animateOnScroll={true}>
            <h2 className="cs-display cs-series-title">{item.name}</h2>
          </Copy>

          {item.copy ? (
            <Copy animateOnScroll={true}>
              <p className="cs-copy">{item.copy}</p>
            </Copy>
          ) : null}
        </div>

        {item.marquee ? (
          // The track holds each row's set twice over and slides exactly
          // one set's width before looping, so the seam never shows. CSS
          // owns the motion — see .cs-marquee in the stylesheet — which
          // keeps pause-on-hover a single declaration rather than a scroll
          // listener.
          <div className="cs-marquee-rows">
            {splitRows(item.media, marqueeRows, item.marqueeSplit).map((row, rowIndex) => (
              <MarqueeRow
                key={rowIndex}
                items={row.items}
                offset={row.offset}
                reverse={rowIndex % 2 === 1}
                landscape={landscape}
                isItemLandscape={isItemLandscape}
                name={item.name}
                onOpen={onOpen}
              />
            ))}
          </div>
        ) : (
          <div
            className={`cs-gallery${landscape ? " cs-gallery--landscape" : ""}`}
            style={{ "--cols": item.columns ?? 3 }}
          >
            {item.media.map((src, j) => (
              <MediaFrame
                key={`${src}-${j}`}
                src={src}
                label={`${item.name} ${j + 1}`}
                onOpen={onOpen ? () => onOpen(j) : undefined}
                landscape={isItemLandscape(src)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SeriesSection;
