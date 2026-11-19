const RSQUO = "’";

// Shared by the case-study page and the homepage gallery (via
// workCategories), so a project's media lives in one place.
export const cafeTohSections = [
  {
    number: "01",
    name: "Art vs Artist",
    marquee: true,
    copy: `The room and the people who make it - work on the walls set against the hands that plate, pour and serve.`,
    media: [
      "https://ik.imagekit.io/platedstories/svdhbj.jpeg",
      "https://ik.imagekit.io/platedstories/gyufhkj.jpeg",
      "https://ik.imagekit.io/platedstories/svagbhk.jpeg",
      "https://ik.imagekit.io/platedstories/hwef.jpeg",
    ],
  },
  {
    number: "02",
    name: "Dishes That Keep Calling Back",
    marquee: true,
    copy: `The orders regulars don${RSQUO}t need the menu for, shot to earn the second visit.`,
    media: [
      "https://ik.imagekit.io/platedstories/poghj.jpeg",
      "https://ik.imagekit.io/platedstories/xcfvbmn.jpeg",
      "https://ik.imagekit.io/platedstories/rsdgfh.jpeg",
      "https://ik.imagekit.io/platedstories/fdxgcvg.jpeg",
      "https://ik.imagekit.io/platedstories/dte.jpeg",
    ],
  },
  {
    number: "03",
    name: "Textures",
    copy: `Close enough to feel it - crumb, foam, grain and glaze at a distance no diner gets.`,
    // Wider frames than the other chapters - texture footage reads
    // landscape, so fewer of them run on the line.
    frame: "landscape",
    marquee: true,
    media: [
      "https://ik.imagekit.io/platedstories/fvs%20dsd.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/vvfsdva.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/dfdvsd.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/tydfgd.mp4?tr=orig-true",
    ],
  },
  {
    number: "04",
    name: "Vinyls",
    copy: `The other half of the room, and the reason people stay for a second cup.`,
    // Same wider ratio as Textures - this footage reads landscape too.
    frame: "landscape",
    marquee: true,
    media: [
      "https://ik.imagekit.io/platedstories/whec.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/bhefw.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/vejk.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/wefnw.mp4?tr=orig-true",
    ],
  },
  {
    number: "05",
    name: "Specials",
    copy: `Off-menu today, gone tomorrow - the board shot as fast as it turns over.`,
    marquee: true,
    media: [
      "https://ik.imagekit.io/platedstories/3.%20Matcha-compressed.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/8.%20Mushroom%20Waffle-compressed.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/14.%20Chole%20Kulcha%20Waffle-compressed.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/9.%20Picantes-compressed.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/5.%20Monsoon%20Feels%20Like-compressed.mp4?tr=orig-true",
      "https://ik.imagekit.io/platedstories/11.%20Mango%20Matcha-compressed.mp4?tr=orig-true",
    ],
  },
];
