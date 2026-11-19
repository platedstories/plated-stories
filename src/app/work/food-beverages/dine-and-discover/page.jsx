import DineAndDiscover from "./DineAndDiscover";
import { workCategories } from "@/app/work/workCategories.js";

// Like Cafe Toh, this project has diverged from the shared ProjectPage
// template and owns its layout (DineAndDiscover.jsx + dine-and-discover.css),
// which is modelled on Cafe Toh's.
const category = workCategories.find((c) => c.key === "food-beverages");
const projectIndex = category.projects.findIndex(
  (p) => p.slug === "dine-and-discover"
);
const project = category.projects[projectIndex];
const next = category.projects[projectIndex + 1] ?? null;

export const metadata = { title: `${project.name} - Plated Stories` };

const Page = () => (
  <DineAndDiscover name={project.name} next={next} />
);

export default Page;
