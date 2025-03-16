"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain, BrainCircuit, Sparkles, Zap } from "lucide-react";
import Image from "next/image";

const images = [
  {
    src: "https://images.unsplash.com/photo-1618355776464-8666794d2520?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29sbGVnZSUyMHN0dWRlbnR8ZW58MHx8MHx8fDA%3D",
    i: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y29sbGVnZSUyMHN0dWRlbnR8ZW58MHx8MHx8fDA%3D",
    i: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1630178836733-3d61d8974258?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3R1ZGVudHxlbnwwfHwwfHx8MA%3D%3D",
    i: 3,
  },
  {
    src: "https://images.unsplash.com/photo-1623945194105-cd36c4433390?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGNvbGxlZ2UlMjBzdHVkZW50fGVufDB8fDB8fHww",
    i: 4,
  },
];
export default function CallToAction() {
  const currentUser = "Parth18062003";

  return (
    <section className="py-20 md:p-24 overflow-hidden bg-gradient-to-b from-white to-[#DFE2FE]/20 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-[#B1CBFA]/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-[#7874F2]/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-[#8E98F5]/30" />
        <div className="absolute top-2/3 right-1/3 w-6 h-6 rounded-full bg-[#7874F2]/20" />

        {/* Floating particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#7874F2]"
            style={{
              top: `${15 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left column - CTA content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center px-3 py-1 space-x-2 border rounded-full border-[#7874F2]/20 bg-white backdrop-blur-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-[#7874F2]" />
              <span className="text-sm font-medium text-[#7874F2]">
                Limited Time Offer
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Start your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7874F2] to-[#8E98F5]">
                intelligent learning
              </span>{" "}
              journey today
            </h2>

            <p className="text-lg md:text-xl text-slate-700 max-w-lg">
              Join thousands of students who've already experienced the power of
              AI-enhanced personalized education. Transform the way you learn
              forever.
            </p>

            <div className="space-y-4 pt-2">
              {/* Feature list */}
              {[
                {
                  icon: <BrainCircuit className="w-5 h-5 text-[#7874F2]" />,
                  text: "Personalized learning paths uniquely tailored to you",
                },
                {
                  icon: <Zap className="w-5 h-5 text-[#7874F2]" />,
                  text: "Learn up to 3x faster with adaptive difficulty scaling",
                },
                {
                  icon: <Brain className="w-5 h-5 text-[#7874F2]" />,
                  text: "Real-time feedback and guidance from AI tutors",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="rounded-full p-1.5 bg-[#DFE2FE]/50 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <p className="text-slate-700">{feature.text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="pt-2"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-[#7874F2] to-[#8E98F5] hover:shadow-xl hover:scale-105 hover:from-[#6b67e5] hover:to-[#807cf0] shadow-[#8E98F5]/25 flex items-center justify-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-6 py-3 font-medium transition-all border rounded-lg text-slate-800 hover:text-[#7874F2] border-slate-200 hover:border-[#7874F2]/50 hover:shadow-md hover:bg-white/80 flex items-center justify-center gap-2">
                  Schedule Demo
                </button>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {images.map((src, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                      style={{ zIndex: 5 - i }}
                    >
                      <Image
                        src={images[i].src}
                        alt="User avatar"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-700">
                  <span className="font-semibold text-[#7874F2]">4,500+</span>{" "}
                  students enrolled this month
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Interactive visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="relative flex items-center justify-center">
              {/* Central sphere with glow */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#7874F2] blur-2xl opacity-20 scale-150" />
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-[#B1CBFA] to-[#7874F2] flex items-center justify-center relative z-10 shadow-xl">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-full border-8 border-white/30 flex items-center justify-center">
                    <BrainCircuit className="w-16 h-16 md:w-24 md:h-24 text-white" />
                  </div>
                </div>
              </div>

              {/* Orbiting elements */}
              {images.map((src, i) => {
                const orbitSize = 320 + i * 10;
                const iconSize = 44 - i * 4;
                const duration = 20 + i * 5;
                const startAngle = i * 90;

                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: orbitSize,
                      height: orbitSize,
                      borderRadius: orbitSize / 2,
                    }}
                    initial={{ rotate: startAngle }}
                    animate={{ rotate: startAngle + 360 }}
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div
                      className="absolute bg-white rounded-lg shadow-lg border border-[#DFE2FE] p-3 flex items-center justify-center"
                      style={{
                        width: iconSize,
                        height: iconSize,
                        top: -iconSize / 2,
                        left: `calc(50% - ${iconSize / 2}px)`,
                      }}
                    >
                      {i === 0 && (
                        <Brain
                          className="text-[#7874F2]"
                          style={{
                            width: iconSize * 0.6,
                            height: iconSize * 0.6,
                          }}
                        />
                      )}
                      {i === 1 && (
                        <Zap
                          className="text-[#8E98F5]"
                          style={{
                            width: iconSize * 0.6,
                            height: iconSize * 0.6,
                          }}
                        />
                      )}
                      {i === 2 && (
                        <Sparkles
                          className="text-[#B1CBFA]"
                          style={{
                            width: iconSize * 0.6,
                            height: iconSize * 0.6,
                          }}
                        />
                      )}
                      {i === 3 && (
                        <ArrowRight
                          className="text-[#DFE2FE]"
                          style={{
                            width: iconSize * 0.6,
                            height: iconSize * 0.6,
                          }}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Personalized card for current user */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="hidden md:block absolute -bottom-10 right-0 lg:right-10 max-w-xs z-10"
            >
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-[#DFE2FE]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B1CBFA] to-[#7874F2] flex items-center justify-center text-white font-semibold">
                    {currentUser.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Hello, {currentUser}!
                    </p>
                    <p className="text-xs text-slate-500">
                      Your personal AI tutor is waiting
                    </p>
                  </div>
                </div>

                <div className="bg-[#DFE2FE]/20 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">
                      Learning Progress
                    </span>
                    <span className="text-xs font-medium text-slate-700">
                      67%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#8E98F5] to-[#7874F2]"
                      initial={{ width: 0 }}
                      whileInView={{ width: "67%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    Continue where you left off →{" "}
                    <span className="text-[#7874F2] font-medium">
                      Advanced Algorithms
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
