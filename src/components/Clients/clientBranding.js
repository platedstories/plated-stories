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
    logoArea: { canvas: [1254, 1254], box: [105, 418, 1042, 452] },
  },
  "cafe-srinivasa": { variant: "heavy" },
  "cafe-toh": {
    variant: "rounded",
    logo: "/company/Elegant Cafe-Toh Script Logo.png",
    logoArea: { canvas: [1254, 1254], box: [120, 412, 1027, 428] },
  },
  "dine-and-discover": { variant: "wide" },
  "hive-cafe": { variant: "heavy" },
  "home-bakers": { variant: "serif" },
  "love-and-flour": { variant: "rounded" },
  "maison-faux": { variant: "wide" },
  baftic: { variant: "mono" },
  kyomi: { variant: "rounded" },
  midash: { variant: "heavy" },
  "my-watch-merchant": { variant: "mono" },
  "ukiyo-interiors": {
    variant: "serif",
    logo: "/company/Gold Ukiyo Interior Logo.png",
    logoArea: { canvas: [1535, 1024], box: [249, 156, 1064, 677] },
  },
};
