"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const currentDate = "2025-03-04 19:34:49";
  const currentUser = "Parth18062003";

  return (
    <section
      id="testimonials"
      className="py-20 md:py-28 bg-gradient-to-b from-white to-[#DFE2FE]/20"
    >
      <div className="container px-4 md:px-6 relative">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#B1CBFA]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 bottom-0 w-48 h-48 rounded-full bg-[#7874F2]/10 blur-2xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center relative z-10"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 mb-2 space-x-2 border rounded-full border-[#7874F2]/20 bg-white backdrop-blur-sm shadow-sm">
              <span className="text-sm font-medium text-[#7874F2]">
                Student Success Stories
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-[#7874F2] to-[#8E98F5]">
              Transforming Learning Journeys
            </h2>
            <p className="max-w-[700px] text-slate-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
              Discover how our AI-powered tutoring system has helped students
              achieve breakthrough results in their education.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            {
              name: "Sophia Chen",
              role: "Computer Science Major",
              image:
                "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=150&auto=format&fit=crop",
              stars: 5,
              content:
                "The personalized learning algorithms are incredible! The system identified my knowledge gaps in data structures and created targeted exercises that improved my understanding dramatically. My professor even noticed the difference in my project work.",
              badge: "Algorithms • Comprehension: +42%",
              delay: 0,
            },
            {
              name: "Marcus Williams",
              role: "Medical Student",
              image:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
              stars: 5,
              content:
                "Studying for the USMLE was overwhelming until I found this platform. The way the AI adapts to my learning style and creates custom review materials has been game-changing. I'm retaining information better and my practice test scores have jumped significantly.",
              badge: "Medical Education • Retention: +38%",
              delay: 0.1,
            },
            {
              name: "Aisha Patel",
              role: "High School Senior",
              image:
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop",
              stars: 5,
              content:
                "The way this system adapts to my learning pace is remarkable. When I struggled with calculus, it slowed down and provided different approaches until I understood. The visual explanations and interactive problems helped me go from a B- to an A+ in one semester!",
              badge: "Mathematics • Grade Improvement: +15%",
              delay: 0.2,
            },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + testimonial.delay }}
              className="group"
            >
              <div className="h-full bg-white rounded-2xl shadow-md p-6 border border-[#DFE2FE] hover:shadow-lg hover:shadow-[#7874F2]/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-3xl bg-gradient-to-br from-[#DFE2FE]/50 to-transparent -z-0" />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-[#DFE2FE]">
                      <Image
                        src={testimonial.image}
                        alt={`${testimonial.name} portrait`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-3">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[#8E98F5] text-[#8E98F5]"
                      />
                    ))}
                  </div>

                  <div className="relative">
                    <Quote className="absolute -top-2 -left-1 w-6 h-6 text-[#DFE2FE] opacity-50" />
                    <p className="text-slate-600 pl-6 relative z-10">
                      "{testimonial.content}"
                    </p>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#DFE2FE]/50 text-[#7874F2]">
                      {testimonial.badge}
                    </span>

                    <motion.div
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-[#B1CBFA] to-[#7874F2] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Quote className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 relative z-10"
        >
          <div className="p-8 rounded-2xl bg-gradient-to-r from-[#7874F2]/5 to-[#B1CBFA]/10 border border-[#DFE2FE]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                {
                  value: "97%",
                  label: "Learning Satisfaction",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="mx-auto mb-2 w-8 h-8 text-[#7874F2]"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                  ),
                },
                {
                  value: "35%",
                  label: "Grade Improvement",
                  icon: (
                    <svg
                      className="mx-auto mb-2 w-8 h-8 text-[#7874F2]"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                  ),
                },
                {
                  value: "3.2x",
                  label: "Learning Efficiency",
                  icon: (
                    <svg
                      className="mx-auto mb-2 w-8 h-8 text-[#7874F2]"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                },
                {
                  value: "65k+",
                  label: "Active Learners",
                  icon: (
                    <svg
                      className="mx-auto mb-2 w-8 h-8 text-[#7874F2]"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 21C3.95728 17.9237 6.41998 17 12 17C17.58 17 20.0427 17.9237 21 21"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ),
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {stat.icon}
                  <div className="relative">
                    <p className="text-4xl font-bold text-slate-800 mb-1 relative z-10">
                      {stat.value}
                    </p>
                    <div className="absolute -bottom-1 left-0 right-0 h-3 bg-[#DFE2FE]/50 -z-10 rounded-full" />
                  </div>
                  <p className="text-slate-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Personalized testimonial for current user */}
          {/*           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 p-6 rounded-xl bg-white border border-[#7874F2]/20 shadow-sm flex flex-col md:flex-row gap-4 items-center"
          >
            <div className="bg-[#DFE2FE]/30 p-3 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="#7874F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="#7874F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 6.5H17.51" stroke="#7874F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-slate-600">
                <span className="font-medium text-[#7874F2]">Hi {currentUser}!</span> Join our growing community of successful students and share your learning journey with us using #AITutorSuccess
              </p>
            </div>
            <div className="ml-auto">
              <button className="px-4 py-1.5 text-sm font-medium transition-all rounded-lg bg-[#7874F2] text-white hover:shadow-md hover:bg-[#6b67e5] flex items-center gap-2">
                Share Your Story
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  );
}
