import ProjectPage from "@/components/ProjectPage/ProjectPage";
import { workCategories } from "@/app/work/workCategories.js";

const project = workCategories
  .find((c) => c.key === "luxury-fashion")
  .projects.find((p) => p.slug === "kyomi");

export const metadata = { title: `${project.name} - Plated Stories` };

const Page = () => (
  <ProjectPage name={project.name} images={project.images} />
);

export default Page;
