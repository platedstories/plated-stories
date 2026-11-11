// The three niches we shoot for, and the client projects under each.
// Mirrors the "Plated Stories - Portfolio" Drive structure.
//
// NOTE ON IMAGERY: `previews` used to point at /public/loader/loader-N.jpg,
// placeholders that were never actually added to /public — every folder
// preview on /work 404'd. Projects with their own case-study page (Cafe
// Srinivasa, Cafe Toh, Hive Cafe, Home Bakers, Dine & Discover) now get three
// real stills pulled straight from that page's own media. Everything else
// (no case-study media exported yet) falls back to a rotating slice of the
// shared Cloudinary studio pool, so a project only needs `images` swapped
// for its own stills once its Drive folder is exported.
const STUDIO_POOL = [
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  "https://ik.imagekit.io/platedstories/34.heic",
  "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
  "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
  "https://ik.imagekit.io/platedstories/2.heic",
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  "https://ik.imagekit.io/platedstories/34.heic",
  "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
  "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
  "https://ik.imagekit.io/platedstories/2.heic",
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  "https://ik.imagekit.io/platedstories/34.heic",
  "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
];

const previews = (offset) => [
  STUDIO_POOL[offset % STUDIO_POOL.length],
  STUDIO_POOL[(offset + 1) % STUDIO_POOL.length],
  STUDIO_POOL[(offset + 2) % STUDIO_POOL.length],
];

// Turns a project name into its URL slug, e.g. "Dine & Discover" ->
// "dine-and-discover". Apostrophes and every other non-alphanumeric are
// dropped rather than kept: they would have to survive percent-encoding on
// every round trip through the router and the route folder name, so
// "Baked by Nini's" -> "baked-by-ninis". Keep the folder under
// src/app/work/<category>/ named exactly as this produces.
const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const categoriesData = [
  {
    key: "food-beverages",
    title: "Food & Beverages",
    projects: [
      {
        name: "Baked by Nini's",
        images: previews(1),
        heroVideo:
          "https://ik.imagekit.io/platedstories/1.%20Monsoon%20Vibe-compress-video-to-size.mp4?tr=w-1280,q-50",
      },
      {
        name: "Cafe Srinivasa",
        images: [
          "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
          "https://ik.imagekit.io/platedstories/2.heic",
          "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
        ],
      },
      {
        name: "Cafe Toh",
        images: [
          "https://ik.imagekit.io/platedstories/34.heic",
          "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
          "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
        ],
      },
      {
        name: "Dine & Discover",
        images: [
          "https://ik.imagekit.io/platedstories/2.heic",
          "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
          "https://ik.imagekit.io/platedstories/34.heic",
        ],
      },
      {
        name: "Hive Cafe",
        images: [
          "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
          "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
          "https://ik.imagekit.io/platedstories/2.heic",
        ],
      },
      {
        name: "Home Bakers",
        images: [
          "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
          "https://ik.imagekit.io/platedstories/34.heic",
          "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
        ],
      },
      { name: "Love & Flour", images: previews(19) },
      { name: "Maison Faux", images: previews(22) },
    ],
  },
  {
    key: "luxury-fashion",
    title: "Luxury & Fashion",
    projects: [
      { name: "Baftic", images: previews(25) },
      { name: "Kyomi", images: previews(28) },
      { name: "Midash", images: previews(31) },
      { name: "My Watch Merchant", images: previews(34) },
    ],
  },
  {
    key: "real-estate-architecture",
    title: "Real Estate & Architecture",
    projects: [
      { name: "Ukiyo Interiors", images: previews(37) },
    ],
  },
];

export const workCategories = categoriesData.map((category) => ({
  ...category,
  projects: category.projects.map((project) => {
    const slug = slugify(project.name);
    return {
      ...project,
      slug,
      href: `/work/${category.key}/${slug}`,
    };
  }),
}));
