import CafeSrinivasa from "./CafeSrinivasa";
import { workCategories } from "@/app/work/workCategories.js";

// Like Baked by Nini's, this project has diverged from the shared
// ProjectPage template and owns its layout (CafeSrinivasa.jsx +
// cafe-srinivasa.css). It still borrows ProjectPage.css for the header and
// hero banner, which are deliberately unchanged.
const category = workCategories.find((c) => c.key === "food-beverages");
const projectIndex = category.projects.findIndex(
  (p) => p.slug === "cafe-srinivasa"
);
const project = category.projects[projectIndex];
const next = category.projects[projectIndex + 1] ?? null;

export const metadata = { title: `${project.name} - Plated Stories` };

const Page = () => (
  <CafeSrinivasa name={project.name} next={next} />
);

export default Page;
