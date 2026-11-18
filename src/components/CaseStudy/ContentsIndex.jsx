"use client";
import { pad, slugify } from "./media";

// The contents card: a ruled list of every part of the study, numbered on
// the left and frame-counted on the right. Parts that are shot link through
// to their section; parts still to come stay in the list, dimmed, with a
// `--` count - the study reads as a whole even while it is being filled in.
//
// Nothing here is project-specific: `items` is the same array the sections
// are rendered from, so the card can never drift out of sync with them.
const ContentsIndex = ({
  items,
  label = "Contents",
  unit = "Parts",
  className = "",
}) => (
  <div className={`cs-contents ${className}`.trim()}>
    <div className="cs-contents-head">
      <p className="sm cs-index">{label}</p>
      <p className="sm cs-index">{`${pad(items.length)} ${unit}`}</p>
    </div>

    <ul className="cs-contents-list">
      {items.map((item, i) => {
        const live = item.media.length > 0;

        const row = (
          <>
            <span className="sm cs-contents-no">{item.number ?? pad(i + 1)}</span>
            <span className="cs-contents-name">{item.name}</span>
            <span className="sm cs-contents-count">
              {live ? pad(item.media.length) : "--"}
            </span>
          </>
        );

        return (
          <li className={live ? "is-live" : "is-pending"} key={item.name}>
            {live ? (
              <a href={`#${slugify(item.name)}`}>{row}</a>
            ) : (
              <span>{row}</span>
            )}
          </li>
        );
      })}
    </ul>
  </div>
);

export default ContentsIndex;
