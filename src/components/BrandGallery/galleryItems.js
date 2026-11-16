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
  if (!project || !project.images.length) return [];

  return [{
    id: slug,
    label: project.name,
    href: project.href,
    src: project.images[0],
    videos: project.videos ?? (project.heroVideo ? [project.heroVideo] : []),
    position: index + 1,
  }];
});
