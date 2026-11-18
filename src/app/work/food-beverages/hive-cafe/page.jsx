import HiveCafe from "./HiveCafe";
import { workCategories } from "@/app/work/workCategories.js";

// Like Cafe Toh, this project has diverged from the shared ProjectPage
// template and owns its layout (HiveCafe.jsx + hive-cafe.css).
const category = workCategories.find((c) => c.key === "food-beverages");
const projectIndex = category.projects.findIndex(
  (p) => p.slug === "hive-cafe"
);
const project = category.projects[projectIndex];
const next = category.projects[projectIndex + 1] ?? null;

export const metadata = { title: `${project.name} - Plated Stories` };

const Page = () => <HiveCafe name={project.name} next={next} />;

export default Page;
