"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  Brain,
  BookOpen,
  BarChart,
  Clock,
  Shield,
  Star,
  ChevronRight,
  Zap,
  Award,
} from "lucide-react";
import { Header } from "@/components/header";
import Footer from "@/components/footer";
import TrustedBy from "@/components/Hero-Section/TrustedBy";
import BentoGrid from "@/components/Hero-Section/Features";
import Hero from "@/components/Hero-Section/Hero";
import Testimonials from "@/components/Hero-Section/Testimonial";

export default function Home() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 min-h-screen w-full">
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
        <TrustedBy />

        <BentoGrid />

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">
                    How It Works
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    AI That Understands How You Learn
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our advanced AI technology creates a learning experience as
                    unique as you are, without the complexity.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-medium">
                        1
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Assessment</h3>
                      <p className="text-muted-foreground">
                        A quick diagnostic test identifies your current
                        knowledge level and learning preferences.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-medium">
                        2
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Personalization</h3>
                      <p className="text-muted-foreground">
                        Our AI creates a custom learning plan tailored to your
                        specific needs and goals.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-medium">
                        3
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Adaptive Learning</h3>
                      <p className="text-muted-foreground">
                        As you progress, the system continuously adjusts to
                        optimize your learning experience.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-medium">
                        4
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Mastery</h3>
                      <p className="text-muted-foreground">
                        Regular assessments ensure you've truly mastered
                        concepts before moving forward.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative lg:ml-auto">
                <div className="relative overflow-hidden rounded-lg border bg-background shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=1170&auto=format&fit=crop"
                    alt="BrainWave AI tutoring platform interface"
                    width={600}
                    height={400}
                    className="object-cover w-full aspect-video"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-lg shadow-lg border">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Learning Efficiency</p>
                      <p className="text-2xl font-bold">3x Faster</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">
                  FAQ
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Get answers to common questions about our AI tutoring system.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl mt-12">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How does the AI tutoring actually work?
                  </AccordionTrigger>
                  <AccordionContent>
                    Our AI tutoring system uses machine learning algorithms to
                    analyze your learning patterns, strengths, and areas for
                    improvement. It creates a personalized learning path and
                    adapts in real-time as you progress. The system identifies
                    knowledge gaps and provides targeted content to address
                    them, ensuring you master concepts before moving forward.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Is BrainWave effective for all subjects?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes! BrainWave is designed to work across all major academic
                    subjects including math, science, language arts, social
                    studies, and more. Our AI is trained on comprehensive
                    educational content and can adapt to the specific
                    requirements of each subject area. We regularly update our
                    content to align with current educational standards.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Can BrainWave replace human tutors?
                  </AccordionTrigger>
                  <AccordionContent>
                    BrainWave is designed to complement human teaching, not
                    replace it. While our AI provides personalized learning
                    experiences and immediate feedback 24/7, we believe in the
                    value of human connection in education. Our Premium plan
                    includes access to live tutors who work alongside the AI
                    system to provide the best of both worlds.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    How does BrainWave protect student privacy?
                  </AccordionTrigger>
                  <AccordionContent>
                    We take privacy extremely seriously. BrainWave is fully
                    FERPA and COPPA compliant, meaning we adhere to federal
                    regulations for protecting student data. We use advanced
                    encryption for all data, never sell personal information,
                    and give users full control over their data. Parents and
                    students can request data deletion at any time.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    What devices can I use BrainWave on?
                  </AccordionTrigger>
                  <AccordionContent>
                    BrainWave is available on any device with an internet
                    connection. We have dedicated apps for iOS and Android
                    devices, and our web platform works on all modern browsers.
                    Premium users can also access certain features offline after
                    initial download.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>
                    How long does it take to see results?
                  </AccordionTrigger>
                  <AccordionContent>
                    Most students begin to see improvements within 2-4 weeks of
                    regular use. The exact timeline depends on individual
                    learning goals, frequency of use, and starting knowledge
                    level. Our analytics dashboard shows progress in real-time
                    so you can track improvements as they happen.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Learning Experience?
                </h2>
                <p className="max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Join thousands of students who are achieving their academic
                  goals with BrainWave.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-[400px]:flex-row">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent">
                  Schedule Demo
                </Button>
              </div>
              <p className="text-sm">
                No credit card required. 14-day free trial.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
