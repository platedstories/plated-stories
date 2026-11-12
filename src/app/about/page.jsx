"use client";

import "./studio.css";
import Spotlight from "@/components/Spotlight/Spotlight";
import CTACard from "@/components/CTACard/CTACard";
import Footer from "@/components/Footer/Footer";
import React from "react";
import { optimizeImageUrl } from "@/lib/media-delivery";
import Copy from "@/components/Copy/Copy";

const Page = () => {
  return (
    <div className="studio-page">
      <section className="studio-header">
        <div className="container">
          <div className="studio-header-row">
            <Copy delay={0.8}>
              <h1>
                We are <span className="studio-brand-text">Plated Stories</span>
              </h1>
            </Copy>
          </div>

          <div className="studio-header-row">
            <Copy delay={0.95}>
              <h1>a creative content agency</h1>
            </Copy>
          </div>
        </div>
      </section>

      <section className="studio-copy">
        <div className="container">
          <div className="studio-copy-img">
            <img src={optimizeImageUrl("/studio/studio-header.jpg", 1920)} alt="" decoding="async" fetchPriority="high" />
          </div>

          <Copy animateOnScroll={true}>
            <p className="sm">Philosophy</p>
            <p className="lg">
              At Plated Stories, quality comes before everything else. In a
              fast-moving digital space where numbers often take priority, we
              believe that meaningful, high-quality content is what truly helps
              brands stand out and stay memorable. Every piece of content we
              create is designed with intention, creativity and attention to
              detail, ensuring that your brand feels authentic, visually
              compelling and unique.
            </p>

            <p className="lg">
              We value collaboration just as much as creativity. From
              understanding your vision to refining the final output, we work
              closely with every client to create content that not only looks
              exceptional but also connects with the right audience and leaves a
              lasting impact.
            </p>

            <p className="sm">Process</p>
            <p className="lg">
              Our process is simple, strategic and seamless. We begin by
              understanding your brand&rsquo;s identity, aesthetics, goals and
              requirements following which we create a customized content deck
              with concepts, references and planned deliverables. Once approved,
              we schedule a dedicated shoot day to efficiently capture all the
              content required for the month.
            </p>

            <p className="lg">
              After production, our team handles the complete editing and
              post-production process, delivering finalized content within 5&ndash;7
              business days. For brands looking for end-to-end support, we also
              assist with content planning, scheduling and social media
              management.
            </p>

            <p className="sm">Expertise</p>
            <p className="lg">
              What sets Plated Stories apart is our ability to combine
              aesthetics, storytelling, strategy and brand growth. We stay
              updated with evolving trends, consumer behavior and
              platform-specific content formats, allowing us to create content
              that feels fresh, relevant and tailored to each brand&rsquo;s
              identity rather than simply following trends for the sake of it.
            </p>

            <p className="lg">
              Beyond creating visually appealing content, we focus on helping
              brands build a stronger digital presence, deeper audience
              connection and long-term growth. Every piece of content is created
              with purpose &mdash; balancing creativity, strategy and impact to
              ensure that it contributes meaningfully to the brand&rsquo;s
              overall image and growth.
            </p>

            <p className="sm">Industries</p>
            <p className="lg">
              We have worked with brands across a wide range of industries,
              creating content tailored to their unique identity and audience.
              Our experience includes food &amp; beverage, restaurants &amp;
              hospitality, fashion, jewellery, watches &amp; accessories,
              interior design, lifestyle and consumer brands.
            </p>
          </Copy>
        </div>
      </section>

      <Spotlight />

      <CTACard />

      <Footer />
    </div>
  );
};

export default Page;
