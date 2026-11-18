const RSQUO = "’";

// The shoot is organised as named series, mirroring the folders in the
// project's Drive. Each entry renders its own chapter: the title and copy
// first, then the media underneath. `media` takes stills and reels alike -
// anything ending .mp4 renders as a muted autoplaying video with its own
// controls. A series with no media yet is listed in the contents card but
// has no chapter, so filling one in later is a one-line change here.
export const cafeSrinivasaSeries = [
  {
    name: "Classics",
    // The dishes the cafe is known for - stills and reels on a strip.
    marquee: true,
    copy: `The dishes people come back for - bisi bele bath, benne dosa, idli, dal vada and the full thali, each shot at the moment it leaves the kitchen.`,
    media: [
      "https://ik.imagekit.io/platedstories/bissi%20belle.jpeg",
      "https://ik.imagekit.io/platedstories/bissi%20belle%202.jpeg",
      "https://ik.imagekit.io/platedstories/compressed_image_XJOfL1wMP.jpeg",
      "https://ik.imagekit.io/platedstories/7.%20Idli%20Making-compressed.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/10.%20Thali-compressed.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/6.%20Cult%20Favourite-compressed.mp4?tr=orig-true",
    ],
  },
  {
    name: "Icecreams",
    // The five ice cream stills and reel loop on a strip like Classics.
    marquee: true,
    copy: `A cold counterpoint to the kitchen${RSQUO}s heat. Scoops, melt and colour blocking, built as a set that holds together as a series rather than as five single posts.`,
    media: [
      "https://ik.imagekit.io/platedstories/ice.jpeg",
      "https://ik.imagekit.io/platedstories/ice1.jpeg",
      "https://ik.imagekit.io/platedstories/ice2.jpeg",
      "https://ik.imagekit.io/platedstories/ice3.jpeg",
      "https://ik.imagekit.io/platedstories/ice4.jpeg",
      "https://ik.imagekit.io/platedstories/3.%20Tadgola%20Ice%20Cream-compressed.mp4?tr=orig-true",
    ],
  },
  {
    name: "Mulbagal",
    // Runs as an auto-scrolling strip instead of a static grid.
    marquee: true,
    copy: `The dosa the town gave its name to, treated as the hero it is - crisp edge, soft centre and the chutney set staged the way it actually arrives at the table.`,
    media: [
      "https://ik.imagekit.io/platedstories/muldosa.jpeg",
      "https://ik.imagekit.io/platedstories/podi.jpeg",
      "https://ik.imagekit.io/platedstories/1.%20Mulbagal%20Dosa-compressed.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/onidosa.jpeg",
      "https://ik.imagekit.io/platedstories/garlicdosa.jpeg",
      "https://ik.imagekit.io/platedstories/masaladosa.jpeg",
    ],
  },
  {
    name: "Pairings",
    // Five stills, running as a strip like Mulbagal.
    marquee: true,
    copy: `What goes with what - plate and cup framed together so the menu sells the combination, not just the dish.`,
    media: [
      "https://ik.imagekit.io/platedstories/pair1.jpeg",
      "https://ik.imagekit.io/platedstories/pair3.jpeg",
      "https://ik.imagekit.io/platedstories/pair4.jpeg",
      "https://ik.imagekit.io/platedstories/pair5.jpeg",
      "https://ik.imagekit.io/platedstories/pair2.jpeg",
    ],
  },
  {
    name: "Tadgola",
    // Three stills and the reel, all four on one line.
    columns: 4,
    copy: `The season${RSQUO}s ice apple, shot cold and close - translucence, water and the short window the fruit is actually on the menu.`,
    media: [
      "https://ik.imagekit.io/platedstories/tadgola%20(2).jpeg",
      "https://ik.imagekit.io/platedstories/tad.jpeg",
      "https://ik.imagekit.io/platedstories/tadgola.jpeg",
      "https://ik.imagekit.io/platedstories/3.%20Tadgola%20Ice%20Cream-compressed.mp4?tr=orig-true",
    ],
  },
  {
    name: "You & Me",
    // All four on one line.
    columns: 4,
    copy: `Food as an occasion rather than a product - two orders, one table, shot the way the cafe is actually used.`,
    media: [
      "https://ik.imagekit.io/platedstories/pair.jpeg",
      "https://ik.imagekit.io/platedstories/pair2_ajLOFr4Rp.jpeg",
      "https://ik.imagekit.io/platedstories/pair4_kqTG6o_0R.jpeg",
      "https://ik.imagekit.io/platedstories/pair3_xycJmDvM0.jpeg",
    ],
  },
];

