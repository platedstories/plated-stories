import { workCategories } from "@/app/work/workCategories.js";

// Placement belongs to the gallery; names, links and media belong to projects.
const GALLERY_SLUGS = [
  "cafe-srinivasa",
  "cafe-toh",
  "hive-cafe",
  "dine-and-discover",
  "baked-by-ninis",
  "home-bakers",
];

const projects = workCategories.flatMap((category) => category.projects);

export const brandGalleryItems = GALLERY_SLUGS.flatMap((slug, index) => {
  const project = projects.find((item) => item.slug === slug);
  // Same rule for every box: play the project's reels, with its first still
  // as the poster (or the only thing shown when it has no reels).
  if (!project || (!project.images.length && !project.videos.length)) return [];

  return [{
    id: slug,
    label: project.name,
    href: project.href,
    src: project.images[0] ?? null,
    videos: project.videos,
    position: index + 1,
  }];
});
