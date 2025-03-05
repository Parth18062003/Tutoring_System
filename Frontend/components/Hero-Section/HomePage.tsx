"use client";

import React, { Suspense } from "react";
import { Header } from "../header";
import Hero from "./Hero";
import TrustedBy from "./TrustedBy";
import BentoGrid from "./Features";
import LearningJourney from "./LearningJourney";
import Testimonials from "./Testimonial";
import Faq from "./Faq";
import CallToAction from "./Cta";
import Footer from "../footer";
import { ReactLenis, useLenis } from "lenis/react";

const HomePage = () => {
  return (
    <ReactLenis root>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="md:py-5 min-h-screen w-full">
            {/* Animated Gradient Blobs */}
            <div
              className="absolute -right-[0%] top-[10%] h-[300px] w-[400px] rounded-full bg-[#B1CBFA]/40 blur-[80px] animate-blob-slow overflow-x-hidden"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="absolute right-[30%] bottom-[10%] h-[250px] w-[150px] rounded-full bg-[#7874F2]/30 blur-[70px] animate-blob-fast overflow-x-hidden"
              style={{ animationDelay: "4s" }}
            ></div>
            <div
              className="absolute right-[20%] bottom-[20%] h-[180px] w-[100px] rounded-full bg-[#DFE2FE]/50 blur-[60px] animate-blob-medium overflow-x-hidden"
              style={{ animationDelay: "3s" }}
            ></div>

            {/* Improved Grid Pattern */}
            <div
              className="absolute inset-0 h-full w-full"
              style={{
                backgroundImage: `
      linear-gradient(to right, rgba(223, 226, 254, 0.3) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(142, 152, 245, 0.1) 0.5px, transparent 0.5px)
    `,
                backgroundSize: "12rem 10rem",
              }}
            >
              <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            </div>

            {/* Static randomly highlighted grid cells */}
            <div className="absolute inset-0 h-full w-full overflow-hidden">
              <div
                className="absolute w-[12rem] h-[10rem]"
                style={{
                  left: "12rem",
                  top: "30rem",
                  backgroundImage:
                    "linear-gradient(270deg, #8E98F5, rgba(172, 170, 250, 0))",
                  opacity: 0.09,
                }}
              ></div>

              <div
                className="absolute w-[12rem] h-[10rem]"
                style={{
                  left: "36rem",
                  top: "10rem",
                  backgroundImage:
                    "linear-gradient(-45deg, #acaafa, rgba(223, 226, 254, 0))",
                  opacity: 0.1,
                }}
              ></div>
            </div>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#DFE2FE]/5 via-transparent to-[#7874F2]/10 overflow-x-hidden"></div>

            <Hero />
          </section>
          <Suspense fallback={<div>Loading...</div>}>
          <TrustedBy />

          <BentoGrid />

          {/* How It Works Section */}
          <LearningJourney />
          {/*  <AITechnology /> */}

          {/* Testimonials Section */}
          <Testimonials />

          {/* FAQ Section */}
          <Faq />
          {/* CTA Section */}
          <CallToAction />
          </Suspense>
        </main>
        <Footer />
      </div>
    </ReactLenis>
  );
};

export default HomePage;
