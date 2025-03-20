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
import { ReactLenis } from "lenis/react";
const HomePage = async () => {
  return (
    <ReactLenis root>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="md:py-5 min-h-screen w-full">
            {/* Animated Gradient Blobs */}

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
