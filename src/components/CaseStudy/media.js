// Helpers shared by every case-study part. The media lists mix stills and
// reels, and the file extension is the only thing that tells them apart.
// The extension may be followed by a query, e.g. an ImageKit `?tr=...`.
export const isVideo = (src) => /\.(mp4|webm|mov)(?:[?#]|$)/i.test(src);

export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const pad = (n) => String(n).padStart(2, "0");

// Splits a media list into `rows` contiguous chunks, each carrying its
// starting index into the original list — a multi-row marquee needs that
// offset so a tile's lightbox index still points at the right item once the
// single strip is broken into several. Rows are near-equal by default;
// `sizes` overrides that with explicit, in-order chunk lengths (e.g. a lone
// closing reel on its own short row rather than folded evenly in).
export const splitRows = (items, rows, sizes) => {
  const chunks = [];
  let offset = 0;
  for (let i = 0; i < rows; i++) {
    const size = sizes?.[i] ?? Math.ceil((items.length - offset) / (rows - i));
    const chunk = items.slice(offset, offset + size);
    if (chunk.length) chunks.push({ items: chunk, offset });
    offset += size;
  }
  return chunks;
};
