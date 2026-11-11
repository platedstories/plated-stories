"use client";
import "./home.css";
import Showreel from "@/components/Showreel/Showreel";
import FeaturedWork from "@/components/FeaturedWork/FeaturedWork";
import TeamCards from "@/components/TeamCards/TeamCards";
import ClientReviews from "@/components/ClientReviews/ClientReviews";
import Spotlight from "@/components/Spotlight/Spotlight";
import BrandGallery from "@/components/BrandGallery/BrandGallery";
import StudioStatement from "@/components/StudioStatement/StudioStatement";
import CTACard from "@/components/CTACard/CTACard";
import Footer from "@/components/Footer/Footer";
import Copy from "@/components/Copy/Copy";
import Hero from "@/components/Hero/Hero";
import Clients from "@/components/Clients/Clients";
import AboutIntro from "@/components/AboutIntro/AboutIntro";
import Preloader from "@/components/Preloader/Preloader";
import React from "react";

const Page = () => {
  return (
    <>
      <Preloader />
      <Hero />

      <Clients />

      <AboutIntro />

      <Showreel />

      <div className="home-studio-section">
        <StudioStatement />

        <div className="container">
          <BrandGallery />
        </div>

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
