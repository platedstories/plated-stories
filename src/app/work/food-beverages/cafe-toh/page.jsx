import CafeToh from "./CafeToh";
import { workCategories } from "@/app/work/workCategories.js";

// Like Baked by Nini's and Cafe Srinivasa, this project has diverged from the
// shared ProjectPage template and owns its layout (CafeToh.jsx +
// cafe-toh.css) - nothing here is shared, so the other project pages are
// unaffected by changes to it.
const category = workCategories.find((c) => c.key === "food-beverages");
const projectIndex = category.projects.findIndex((p) => p.slug === "cafe-toh");
const project = category.projects[projectIndex];
const next = category.projects[projectIndex + 1] ?? null;

export const metadata = { title: `${project.name} - Plated Stories` };

const Page = () => <CafeToh name={project.name} next={next} />;

export default Page;
