"use client";
import "./home.css";
import Showreel from "@/components/Showreel/Showreel";
import FeaturedWork from "@/components/FeaturedWork/FeaturedWork";
import TeamCards from "@/components/TeamCards/TeamCards";
import ClientReviews from "@/components/ClientReviews/ClientReviews";
import Spotlight from "@/components/Spotlight/Spotlight";
import BrandGallery from "@/components/BrandGallery/BrandGallery";
import CTACard from "@/components/CTACard/CTACard";
import { optimizeImageUrl } from "@/lib/media-delivery";
import Footer from "@/components/Footer/Footer";
import Copy from "@/components/Copy/Copy";
import Hero from "@/components/Hero/Hero";
import Clients from "@/components/Clients/Clients";
import Preloader from "@/components/Preloader/Preloader";
import React from "react";

const Page = () => {
  return (
    <>
      <Preloader />
      <Hero />

      <Clients />

      <Showreel />

      <div className="home-studio-section">
        <section className="studio-header">
          <div className="container">
            <div className="studio-header-row">
              <Copy delay={0.8}>
                <h1>
                  We are{" "}
                  <span className="studio-brand-text">Plated Stories</span>
                </h1>
              </Copy>
            </div>

            <div className="studio-header-tagline">
              <Copy delay={1.05}>
                <p>
                  We craft visual stories for F&amp;B and lifestyle brands.
                  <br />
                  Strategy, production and storytelling, end to end.
                </p>
              </Copy>
            </div>

            <BrandGallery />
          </div>
        </section>

        <section className="studio-copy">
          <div className="container">
            <div className="studio-copy-img">
              <img src={optimizeImageUrl("/studio/studio-header.jpg", 1920)} alt="" loading="lazy" decoding="async" />
            </div>

            <Copy animateOnScroll={true}>
              <p className="lg">
                We are a creative content agency specializing in
                visual storytelling for F&amp;B and lifestyle brands. From
                concept development and shoot planning to production, editing and
                content delivery, we manage the entire creative process
                end-to-end. Our work combines strategy, creativity and
                high-quality execution to create content that not only looks
                beautiful but also communicates a brand&rsquo;s identity, engages
                its audience and supports business growth. Whether it&rsquo;s a
                cafe, restaurant, home baker, jewellery brand or interior design
                studio, we help brands tell stories that people remember.
              </p>

              <p className="lg">
                In a world overflowing with content, numbers alone aren&rsquo;t
                enough. At Plated Stories, we combine premium production with
                strategic storytelling to create content that resonates with
                audiences and aligns with business goals. We don&rsquo;t believe
                in creating content for the sake of posting &mdash; we focus on
                crafting stories that build communities, strengthen brand
                identity and drive meaningful engagement. Every project is
                approached with creativity, attention to detail and a commitment
                to delivering work that reflects the unique essence of the brand.
              </p>
            </Copy>
          </div>
        </section>

        <TeamCards />
      </div>

      <section className="featured-work">
        <div className="container">
          <div className="featured-work-header-content">
            <div className="featured-work-header">
              <Copy animateOnScroll={true} delay={0.25}>
                <h1>Featured Work</h1>
              </Copy>
            </div>

            <div className="arrow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 32 32"
                fill="none"
                className="icon"
              >
                <path
                  d="M16 26.6665L16 5.33317"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M22.6667 19.9999L16 26.6665L9.33337 19.9998"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>

            <div className="featured-work-header-copy">
              <Copy animateOnScroll={true} delay={0.25}>
                <p className="lg">
                  A look at the brands we&rsquo;ve helped grow &mdash; content
                  built on storytelling, strategy and premium production across
                  food, hospitality and lifestyle.
                </p>
              </Copy>
            </div>
          </div>

          <FeaturedWork />
        </div>
      </section>

      <section className="client-reviews-header-container">
        <div className="container">
          <div className="client-reviews-header-content">
            <div className="client-reviews-header">
              <Copy animateOnScroll={true} delay={0.25}>
                <h1>People Approved</h1>
              </Copy>
            </div>

            <div className="arrow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 32 32"
                fill="none"
                className="icon"
              >
                <path
                  d="M16 26.6665L16 5.33317"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M22.6667 19.9999L16 26.6665L9.33337 19.9998"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>

            <div className="client-reviews-header-copy">
              <Copy animateOnScroll={true} delay={0.25}>
                <p className="lg">
                  Honest words from the founders and brands we&rsquo;ve worked
                  closely with to bring their stories to life.
                </p>
              </Copy>
            </div>
          </div>
        </div>
      </section>

      <ClientReviews />

      <Spotlight />

      <CTACard />

      <Footer />
    </>
  );
};

export default Page;
