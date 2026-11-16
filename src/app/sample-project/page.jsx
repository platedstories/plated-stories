"use client";
import "./sample-project.css";
import Footer from "@/components/Footer/Footer";
import Copy from "@/components/Copy/Copy";
import { optimizeImageUrl } from "@/lib/media-delivery";

const Page = () => {
  return (
    <div className="sample-project-page">
      <section className="project-header">
        <Copy delay={0.75}>
          <p className="lg">Featured Case Study</p>
          <h1>Cafe Srinivasa</h1>
        </Copy>
      </section>

      <section className="project-banner-img">
        <div className="project-banner-img-wrapper">
          <img src={optimizeImageUrl("/project/sample-project-1.jpg", 1920)} alt="" decoding="async" fetchPriority="high" />
        </div>
      </section>

      <section className="project-details">
        <Copy animateOnScroll={true}>
          <div className="details">
            <p>The Problem</p>
            <h3>
              When Cafe Srinivasa partnered with Plated Stories, the brand had
              around 3,000 Instagram followers but lacked a strong digital
              identity. While the food experience was exceptional, its social
              media failed to reflect the quality, story and authenticity behind
              the brand &mdash; making it hard to reach new audiences or build a
              loyal community.
            </h3>
          </div>

          <div className="details">
            <p>The Approach</p>
            <h3>
              We built a content ecosystem balancing storytelling, entertainment
              and food appeal. By introducing founder-led storytelling with Mr.
              Naman, we highlighted the stories behind the dishes and the
              philosophy of the cafe. Combined with consistent posting and
              creative experimentation, this shaped a distinctive online
              presence.
            </h3>
          </div>

          <div className="details">
            <p>Duration</p>
            <h3>9 Months</h3>
          </div>

          <div className="details">
            <p>Studio</p>
            <h3>Plated Stories</h3>
          </div>
        </Copy>
      </section>

      <section className="project-images">
        <div className="project-images-container">
          <div className="project-img">
            <div className="project-img-wrapper">
              <img src={optimizeImageUrl("/project/sample-project-2.jpg", 1200)} alt="" loading="lazy" decoding="async" />
            </div>
          </div>

          <div className="project-img">
            <div className="project-img-wrapper">
              <img src={optimizeImageUrl("/project/sample-project-3.jpg", 1200)} alt="" loading="lazy" decoding="async" />
            </div>
          </div>

          <div className="project-img">
            <div className="project-img-wrapper">
              <img src={optimizeImageUrl("/project/sample-project-4.jpg", 1200)} alt="" loading="lazy" decoding="async" />
            </div>
          </div>

          <div className="project-img">
            <div className="project-img-wrapper">
              <img src={optimizeImageUrl("/project/sample-project-5.jpg", 1200)} alt="" loading="lazy" decoding="async" />
            </div>
          </div>

          <div className="project-img">
            <div className="project-img-wrapper">
              <img src={optimizeImageUrl("/project/sample-project-6.jpg", 1200)} alt="" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      <section className="project-details">
        <Copy animateOnScroll={true}>
          <div className="details">
            <p>The Solution</p>
            <h3>
              Over nine months, Plated Stories managed the entire creative
              process &mdash; from ideation and scripting to production, editing
              and strategy. Our content focused on high-quality food and
              lifestyle visuals, founder-led storytelling, relatable
              trend-adapted reels, creative carousel concepts and consistent
              brand messaging, transforming the page into a thriving
              content-driven community.
            </h3>
          </div>

          <div className="details">
            <p>Followers</p>
            <h3>3,000 &rarr; 10,000+</h3>
          </div>

          <div className="details">
            <p>Signature Win</p>
            <h3>Mulbagal Dosa &mdash; a best-seller</h3>
          </div>
        </Copy>
      </section>

      <section className="next-project">
        <Copy animateOnScroll={true}>
          <p style={{ marginBottom: "1rem" }}>The Standout Campaign</p>
          <h2>Mulbagal Dosa</h2>
        </Copy>

        <div className="next-project-img">
          <div className="next-project-img-wrapper">
            <img src={optimizeImageUrl("/project/next-project.jpg", 1200)} alt="" loading="lazy" decoding="async" />
          </div>
        </div>

        <Copy animateOnScroll={true}>
          <h3>
            One standout campaign featured the launch of the Mulbagal Dosa, with
            Mr. Naman sharing its story while visually appealing footage
            showcased the preparation process. The reel gained exceptional
            traction and played a key role in making the dish one of the
            cafe&rsquo;s best-selling offerings.
          </h3>

          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              marginTop: "2rem",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://www.instagram.com/cafesrinivasa"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Cafe Srinivasa
            </a>
            <a
              href="https://www.instagram.com/reel/DRzQ5YJjI10/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch the Mulbagal Reel
            </a>
          </div>
        </Copy>
      </section>

      <Footer />
    </div>
  );
};

export default Page;
