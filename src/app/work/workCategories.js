import { cafeSrinivasaSeries } from "@/lib/cafe-srinivasa-media";
import { cafeTohSections } from "@/lib/cafe-toh-media";
import { dineAndDiscoverSections } from "@/lib/dine-and-discover-media";
import { hiveCafeSections } from "@/lib/hive-cafe-media";
import { homeBakersSections } from "@/lib/home-bakers-media";
import { mediaFromSections } from "@/components/CaseStudy/media";

// The three niches we shoot for, and the client projects under each.
// Mirrors the "Plated Stories - Portfolio" Drive structure.
//
// MEDIA: a project with a case study gets its `images` / `videos` from that
// case study's chapters via `mediaFromSections` - one source of truth in
// src/lib/<project>-media.js, shared by the case-study page, the homepage
// gallery and every other card. Projects without their own media yet fall
// back to a rotating slice of STUDIO_POOL.
const STUDIO_POOL = [
  "https://ik.imagekit.io/platedstories/compressed_image.jpeg",
  "https://ik.imagekit.io/platedstories/34.heic",
  "https://ik.imagekit.io/platedstories/compressed_image%20(1).jpeg",
  "https://ik.imagekit.io/platedstories/compressed_image%20(2).jpeg",
  "https://ik.imagekit.io/platedstories/2.heic",
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
          "https://ik.imagekit.io/platedstories/1.%20Monsoon%20Vibe-compress-video-to-size.mp4?tr=orig-true",
      },
      { name: "Cafe Srinivasa", ...mediaFromSections(cafeSrinivasaSeries) },
      { name: "Cafe Toh", ...mediaFromSections(cafeTohSections) },
      { name: "Dine & Discover", ...mediaFromSections(dineAndDiscoverSections) },
      { name: "Hive Cafe", ...mediaFromSections(hiveCafeSections) },
      { name: "Home Bakers", ...mediaFromSections(homeBakersSections) },
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
      { name: "Vora", images: previews(40) },
    ],
  },
];

export const workCategories = categoriesData.map((category) => ({
  ...category,
  projects: category.projects.map((project) => {
    const slug = slugify(project.name);
    // Every project exposes `videos`, so every box can use the same playback
    // logic: a case study's reels, else its hero reel, else none (still only).
    const videos =
      project.videos ?? (project.heroVideo ? [project.heroVideo] : []);
    return {
      ...project,
      images: project.images ?? [],
      videos,
      slug,
      href: `/work/${category.key}/${slug}`,
    };
  }),
}));
