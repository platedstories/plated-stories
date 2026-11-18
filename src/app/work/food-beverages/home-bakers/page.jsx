import HomeBakers from "./HomeBakers";
import { workCategories } from "@/app/work/workCategories.js";

// Like Hive Cafe, this project has diverged from the shared ProjectPage
// template and owns its layout (HomeBakers.jsx + home-bakers.css).
const category = workCategories.find((c) => c.key === "food-beverages");
const projectIndex = category.projects.findIndex(
  (p) => p.slug === "home-bakers"
);
const project = category.projects[projectIndex];
const next = category.projects[projectIndex + 1] ?? null;

export const metadata = { title: `${project.name} - Plated Stories` };

const Page = () => <HomeBakers name={project.name} next={next} />;

export default Page;
