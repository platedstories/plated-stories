// How each client renders inside its logo tile, keyed by project slug.
//
// Clients without a logo file render as a typographic wordmark in one of a few
// styles (see `.home-clients-logo--*` in Clients.css). When a real logo
// arrives, drop it in /public/company/ and add `logo: "/company/<file>"`: the
// image replaces the wordmark and the animation stays the same.
//
// `logoFrame` (optional) is the aspect ratio of the window the logo is shown
// through, cropped from the centre. Use it for files exported on a padded
// square canvas so the artwork fills the tile instead of floating in it.
// Leave it out for logos already trimmed to their edges.
export const clientBranding = {
  "baked-by-ninis": {
    variant: "serif",
    logo: "/company/Baked by Nini’s Logo.png",
    logoFrame: "2.4 / 1",
  },
  "cafe-srinivasa": { variant: "heavy" },
  "cafe-toh": {
    variant: "rounded",
    logo: "/company/Elegant Cafe-Toh Script Logo.png",
    logoFrame: "2.4 / 1",
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
  "ukiyo-interiors": { variant: "serif" },
};
