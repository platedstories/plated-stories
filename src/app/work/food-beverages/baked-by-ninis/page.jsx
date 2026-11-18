import BakedByNinis from "./BakedByNinis";
import { workCategories } from "@/app/work/workCategories.js";

// This project has diverged from the shared ProjectPage template and owns
// its own layout (BakedByNinis.jsx + baked-by-ninis.css) - nothing here is
// shared, so the other project pages are unaffected by changes to it.
const category = workCategories.find((c) => c.key === "food-beverages");
const projectIndex = category.projects.findIndex(
  (p) => p.slug === "baked-by-ninis"
);
const project = category.projects[projectIndex];
const next = category.projects[projectIndex + 1] ?? null;

export const metadata = { title: `${project.name} - Plated Stories` };

const Page = () => (
  <BakedByNinis
    name={project.name}
    heroVideo={project.heroVideo}
    next={next}
  />
);

export default Page;
