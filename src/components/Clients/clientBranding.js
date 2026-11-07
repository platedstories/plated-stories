// How each client renders inside its logo tile, keyed by project slug.
//
// Clients without a logo file render as a typographic wordmark in one of a few
// styles (see `.home-clients-logo--*` in Clients.css). When a real logo
// arrives, drop it in /public/company/ and add `logo: "/company/<file>"`: the
// image replaces the wordmark and the animation stays the same.
//
// `logoArea` (optional) crops a logo exported on a padded canvas down to its
// artwork, so every logo fills its tile the same way however it was exported:
//   canvas: [width, height] of the file in px
//   box:    [x, y, width, height] of the artwork inside it, in px
// Measure with sharp: `sharp(file).trim()` reports the size and (negated)
// offsets; add a few px of breathing room. Leave it out for logos already
// trimmed to their edges.
export const clientBranding = {
  "baked-by-ninis": {
    variant: "serif",
    logo: "/company/Baked by Nini’s Logo.png",
    logoArea: { canvas: [627, 627], box: [52, 209, 522, 226] },
  },
  "cafe-srinivasa": { variant: "heavy" },
  "cafe-toh": {
    variant: "rounded",
    logo: "/company/Elegant Cafe-Toh Script Logo.png",
    logoArea: { canvas: [627, 627], box: [60, 206, 514, 214] },
  },
  "dine-and-discover": { variant: "wide" },
  "hive-cafe": { variant: "heavy" },
  "home-bakers": { variant: "serif" },
  "love-and-flour": { variant: "rounded" },
  "maison-faux": { variant: "wide" },
  baftic: { variant: "mono" },
  kyomi: { variant: "rounded" },
  midash: { variant: "heavy" },
  "my-watch-merchant": {
    variant: "mono",
    logo: "/company/My Watch Merchant Logo.png",
    logoArea: { canvas: [1083, 363], box: [13, 0, 1050, 363] },
  },
  "ukiyo-interiors": {
    variant: "serif",
    logo: "/company/Gold Ukiyo Interior Logo.png",
    logoArea: { canvas: [768, 512], box: [125, 78, 532, 339] },
  },
};
