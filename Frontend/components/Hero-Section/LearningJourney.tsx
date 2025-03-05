"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Award,
  ArrowRight,
  BrainCircuit,
  BookOpen,
  LineChart,
  PieChart,
  Sparkles,
  User,
} from "lucide-react";

export default function LearningJourney() {
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const currentUser = "Parth18062003";
  const [activeStep, setActiveStep] = useState(1);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Reset animation flag when step changes
    setAnimationComplete(false);
    // Set animation complete after a delay
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeStep]);

  const steps = [
    {
      id: 1,
      title: "Neural Assessment",
      description:
        "Our AI analyzes your cognitive patterns and learning preferences through an engaging, adaptive assessment.",
      icon: <BrainCircuit className="w-6 h-6" />,
      stats: "10+ cognitive dimensions analyzed",
      color: "#7091e6",
    },
    {
      id: 2,
      title: "Knowledge Mapping",
      description:
        "We create a detailed 3D knowledge map showing your strengths, gaps, and optimal learning trajectory.",
      icon: <PieChart className="w-6 h-6" />,
      stats: "Real-time knowledge graph visualization",
      color: "#6b87dc",
    },
    {
      id: 3,
      title: "Adaptive Learning",
      description:
        "Experience dynamic content that adjusts to your responses, ensuring optimal challenge and engagement.",
      icon: <Sparkles className="w-6 h-6" />,
      stats: "40+ interaction modalities",
      color: "#607fd3",
    },
    {
      id: 4,
      title: "Growth Analytics",
      description:
        "Track your cognitive development with detailed analytics revealing your evolving learning profile.",
      icon: <LineChart className="w-6 h-6" />,
      stats: "Continuous progress monitoring",
      color: "#5576ca",
    },
  ];

  return (
    <main className="py-20 md:py-28 bg-gradient-to-b from-zinc-100 to-[#DFE2FE]/20 overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto relative">
        {/* Background decorations */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7091e6]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#9eb5ef]/10 rounded-full blur-3xl" />
        </div>

        <header className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16 md:mb-24"
          >
            <div className="inline-flex items-center px-3 py-1 mb-4 space-x-2 border rounded-full border-[#7091e6]/20 bg-white/80 backdrop-blur-sm shadow-sm">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <BrainCircuit className="w-4 h-4 text-[#7091e6]" />
              </motion.div>
              <span className="text-sm font-medium text-[#7091e6]">
                Your Learning Journey
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-[#7091e6] to-[#9eb5ef]">
              How BrainWave Adapts to You
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-slate-600 text-lg">
              Experience a revolutionary approach to learning that evolves with
              your unique cognitive profile
            </p>
          </motion.div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
          {/* Journey navigation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-[#DFE2FE] relative"
          >
            <div className="absolute top-0 left-1/2 h-full w-0.5 bg-gradient-to-b from-transparent via-[#7091e6]/30 to-transparent transform -translate-x-1/2 -z-0" />
            <nav
              className="space-y-6 relative z-10"
              aria-label="Learning journey steps"
            >
              {steps.map((step) => (
                <motion.button
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + step.id * 0.1 }}
                  className={`p-5 rounded-xl cursor-pointer transition-all duration-300 w-full text-left ${
                    activeStep === step.id
                      ? "bg-[#7091e6]/10 border border-[#7091e6]/30 shadow-md"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                  onClick={() => setActiveStep(step.id)}
                  aria-pressed={activeStep === step.id}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      className={`rounded-lg p-3 ${
                        activeStep === step.id
                          ? "bg-[#7091e6] text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={
                        activeStep === step.id
                          ? {
                              boxShadow: [
                                "0px 0px 0px rgba(112,145,230,0)",
                                "0px 0px 20px rgba(112,145,230,0.5)",
                                "0px 0px 0px rgba(112,145,230,0)",
                              ],
                            }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: activeStep === step.id ? Infinity : 0,
                      }}
                    >
                      {step.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold text-lg mb-1 ${
                          activeStep === step.id
                            ? "text-[#7091e6]"
                            : "text-slate-700"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {step.description}
                      </p>
                      {activeStep === step.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-center gap-2"
                        >
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#7091e6]/20 text-[#7091e6]">
                            {step.stats}
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#7091e6]" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </nav>

            {/* Step indicators */}
            <div className="flex justify-center mt-6 gap-2" role="tablist">
              {steps.map((step) => (
                <motion.button
                  key={step.id}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-3 h-3 rounded-full ${
                    activeStep === step.id ? "bg-[#7091e6]" : "bg-slate-200"
                  }`}
                  onClick={() => setActiveStep(step.id)}
                  aria-selected={activeStep === step.id}
                  aria-label={`Step ${step.id}: ${step.title}`}
                  role="tab"
                />
              ))}
            </div>
          </motion.div>

          {/* Visualization */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white perspective-1000"
              >
                <div className="w-full h-full bg-gradient-to-br from-[#7091e6] to-[#9eb5ef] flex items-center justify-center p-8 relative">
                  {/* Dynamic background elements */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
                        backgroundSize: "30px 30px",
                      }}
                    />
                  </div>

                  {/* Dynamic content based on active step */}
                  <div className="text-white z-10 w-full">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        {steps[activeStep - 1]?.title}
                      </h3>
                      <p className="mb-8 text-white/90">
                        {steps[activeStep - 1]?.description}
                      </p>
                    </motion.div>

                    {activeStep === 1 && (
                      <motion.article
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto"
                      >
                        <header className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="font-semibold">Cognitive Profile</h4>
                          </div>
                          <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            {currentUser}
                          </div>
                        </header>

                        <div className="space-y-4">
                          {[
                            {
                              name: "Analytical Thinking",
                              value: 85,
                              color: "rgba(255,255,255,0.9)",
                            },
                            {
                              name: "Visual Processing",
                              value: 65,
                              color: "rgba(255,255,255,0.9)",
                            },
                            {
                              name: "Abstract Reasoning",
                              value: 92,
                              color: "rgba(255,255,255,0.9)",
                            },
                            {
                              name: "Verbal Comprehension",
                              value: 78,
                              color: "rgba(255,255,255,0.9)",
                            },
                            {
                              name: "Memory Capacity",
                              value: 73,
                              color: "rgba(255,255,255,0.9)",
                            },
                          ].map((skill, i) => (
                            <motion.div key={i} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white/90">
                                  {skill.name}
                                </span>
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{
                                    opacity: animationComplete ? 1 : 0,
                                  }}
                                  transition={{ delay: 0.8 + i * 0.1 }}
                                  className="text-sm font-medium text-white"
                                >
                                  {skill.value}%
                                </motion.span>
                              </div>
                              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: skill.color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${skill.value}%` }}
                                  transition={{
                                    duration: 1,
                                    delay: 0.3 + i * 0.1,
                                    ease: "easeOut",
                                  }}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: animationComplete ? 1 : 0,
                            y: animationComplete ? 0 : 10,
                          }}
                          transition={{ delay: 1.5 }}
                          className="mt-6 text-center text-sm"
                        >
                          <span className="bg-white/20 px-3 py-1 rounded-full">
                            Assessment completed on: {currentDate.split(" ")[0]}
                          </span>
                        </motion.div>
                      </motion.article>
                    )}

                    {activeStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col items-center"
                      >
                        <div className="relative w-64 h-64 md:w-72 md:h-72">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 120,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-0"
                          >
                            <svg
                              width="100%"
                              height="100%"
                              viewBox="0 0 200 200"
                            >
                              <defs>
                                <linearGradient
                                  id="knowledge-gradient"
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="100%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="rgba(255,255,255,0.1)"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="rgba(255,255,255,0.4)"
                                  />
                                </linearGradient>
                              </defs>
                              {/* Grid lines */}
                              <path
                                d="M100,10 L100,190 M10,100 L190,100"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="1"
                              />
                              <circle
                                cx="100"
                                cy="100"
                                r="90"
                                fill="none"
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="1"
                              />
                              <circle
                                cx="100"
                                cy="100"
                                r="60"
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="1"
                              />
                              <circle
                                cx="100"
                                cy="100"
                                r="30"
                                fill="none"
                                stroke="rgba(255,255,255,0.25)"
                                strokeWidth="1"
                              />

                              {/* Student knowledge area */}
                              <motion.path
                                d="M100,100 L150,70 L170,120 L120,160 L60,140 L50,80 Z"
                                fill="url(#knowledge-gradient)"
                                stroke="white"
                                strokeWidth="2"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                              />

                              {/* Knowledge points */}
                              {[
                                { cx: 100, cy: 100, label: "Core" },
                                { cx: 150, cy: 70, label: "Math" },
                                { cx: 170, cy: 120, label: "Science" },
                                { cx: 120, cy: 160, label: "History" },
                                { cx: 60, cy: 140, label: "Language" },
                                { cx: 50, cy: 80, label: "Arts" },
                              ].map((point, i) => (
                                <motion.g
                                  key={i}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{
                                    duration: 0.5,
                                    delay: 0.5 + i * 0.1,
                                  }}
                                >
                                  <circle
                                    cx={point.cx}
                                    cy={point.cy}
                                    r={i === 0 ? 5 : 3}
                                    fill="white"
                                  />
                                  <text
                                    x={point.cx}
                                    y={point.cy - 10}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="8"
                                    fontWeight="bold"
                                  >
                                    {point.label}
                                  </text>
                                </motion.g>
                              ))}

                              {/* Learning path animation */}
                              <motion.circle
                                cx={100}
                                cy={100}
                                r={3}
                                fill="#ffffff"
                                initial={{ cx: 100, cy: 100 }}
                                animate={
                                  animationComplete
                                    ? {
                                        cx: [100, 150, 170, 120, 60, 50, 100],
                                        cy: [100, 70, 120, 160, 140, 80, 100],
                                      }
                                    : {}
                                }
                                transition={{
                                  duration: 6,
                                  ease: "easeInOut",
                                  repeat: Infinity,
                                  repeatDelay: 1,
                                }}
                              />
                            </svg>
                          </motion.div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 }}
                          className="mt-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg max-w-xs"
                        >
                          <h4 className="font-semibold mb-2 text-center">
                            Knowledge Connections
                          </h4>
                          <div className="flex justify-between text-sm">
                            <div>
                              <div className="mb-1 text-white/80">
                                Subject Nodes
                              </div>
                              <div className="font-medium">6 Active</div>
                            </div>
                            <div>
                              <div className="mb-1 text-white/80">
                                Connections
                              </div>
                              <div className="font-medium">14 Established</div>
                            </div>
                            <div>
                              <div className="mb-1 text-white/80">Growth</div>
                              <div className="font-medium">+23%</div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {activeStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              name: "Interactive Simulations",
                              icon: (
                                <svg
                                  width="36"
                                  height="36"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <motion.path
                                    d="M12 3v3m-4 5h-3m7 4v3M17 8h3m-6 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.3 }}
                                  />
                                </svg>
                              ),
                            },
                            {
                              name: "Timed Challenges",
                              icon: (
                                <svg
                                  width="36"
                                  height="36"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <motion.circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.4 }}
                                  />
                                  <motion.path
                                    d="M12 8v4l3 3"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1, delay: 1 }}
                                  />
                                </svg>
                              ),
                            },
                            {
                              name: "Visual Learning",
                              icon: (
                                <svg
                                  width="36"
                                  height="36"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <motion.path
                                    d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                  />
                                  <motion.path
                                    d="M4 22v-7"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5, delay: 1.2 }}
                                  />
                                </svg>
                              ),
                            },
                            {
                              name: "Audio Explanations",
                              icon: (
                                <svg
                                  width="36"
                                  height="36"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <motion.path
                                    d="M12 11c0 3.517-1.009 6-3 6s-3-2.483-3-6c0-3.517 1.009-6 3-6s3 2.483 3 6z"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.6 }}
                                  />
                                  <motion.path
                                    d="M18 11c0 3.517-1.009 6-3 6s-3-2.483-3-6c0-3.517 1.009-6 3-6s3 2.483 3 6z"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.7 }}
                                  />
                                </svg>
                              ),
                            },
                            {
                              name: "Social Learning",
                              icon: (
                                <svg
                                  width="36"
                                  height="36"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <motion.path
                                    d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.8 }}
                                  />
                                  <motion.circle
                                    cx="9"
                                    cy="7"
                                    r="4"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.9 }}
                                  />
                                  <motion.path
                                    d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 1.0 }}
                                  />
                                </svg>
                              ),
                            },
                            {
                              name: "Gamified Learning",
                              icon: (
                                <svg
                                  width="36"
                                  height="36"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <motion.path
                                    d="M7 11V7a5 5 0 0 1 10 0v4"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1, delay: 1.1 }}
                                  />
                                  <motion.rect
                                    x="3"
                                    y="11"
                                    width="18"
                                    height="11"
                                    rx="2"
                                    ry="2"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 1.2 }}
                                  />
                                </svg>
                              ),
                            },
                          ].map((mode, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                duration: 0.5,
                                delay: 0.3 + i * 0.1,
                              }}
                              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center"
                            >
                              <motion.div
                                className="flex items-center justify-center h-14 text-white"
                                whileHover={{ scale: 1.1 }}
                                animate={{
                                  opacity: [0.7, 1, 0.7],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              >
                                {mode.icon}
                              </motion.div>
                              <div className="text-center mt-2 text-sm">
                                {mode.name}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.4 }}
                          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            <span>
                              Visual-Interactive with Spaced Repetition
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {activeStep === 4 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mb-5"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <LineChart className="w-5 h-5 text-white/80" />
                              <span>Learning Progress</span>
                            </div>
                            <div className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                              Last 30 days
                            </div>
                          </div>

                          <div className="h-24 w-full relative">
                            {/* SVG Line chart */}
                            <svg className="w-full h-full">
                              {/* Grid lines */}
                              <line
                                x1="0"
                                y1="0"
                                x2="100%"
                                y2="0"
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="4"
                              />
                              <line
                                x1="0"
                                y1="25%"
                                x2="100%"
                                y2="25%"
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="4"
                              />
                              <line
                                x1="0"
                                y1="50%"
                                x2="100%"
                                y2="50%"
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="4"
                              />
                              <line
                                x1="0"
                                y1="75%"
                                x2="100%"
                                y2="75%"
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="4"
                              />
                              <line
                                x1="0"
                                y1="100%"
                                x2="100%"
                                y2="100%"
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="4"
                              />

                              {/* Progress line */}
                              <motion.path
                                d="M0,80 C20,85 40,55 60,50 C80,45 100,30 120,15 C140,20 160,40 180,30 C200,20 220,25 240,20"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2 }}
                              />

                              {/* Area fill gradient */}
                              <motion.path
                                d="M0,80 C20,85 40,55 60,50 C80,45 100,30 120,15 C140,20 160,40 180,30 C200,20 220,25 240,20 V96 H0 Z"
                                fill="url(#chart-gradient)"
                                opacity="0.3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                transition={{ duration: 1, delay: 1 }}
                              />

                              <defs>
                                <linearGradient
                                  id="chart-gradient"
                                  x1="0%"
                                  y1="0%"
                                  x2="0%"
                                  y2="100%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="white"
                                    stopOpacity="0.5"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </linearGradient>
                              </defs>

                              {/* Animated point */}
                              <motion.circle
                                cx="240"
                                cy="20"
                                r="4"
                                fill="white"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.5, 1] }}
                                transition={{ delay: 2, duration: 0.5 }}
                              />
                            </svg>
                          </div>
                        </motion.div>

                        <div className="grid grid-cols-3 gap-3">
                          {[
                            {
                              title: "Time Saved",
                              value: "24hrs",
                              change: "+12%",
                              color: "rgba(255,255,255,0.9)",
                              icon: <Clock className="h-4 w-4" />,
                            },
                            {
                              title: "Knowledge Gain",
                              value: "42%",
                              change: "+8%",
                              color: "rgba(255,255,255,0.9)",
                              icon: <BookOpen className="h-4 w-4" />,
                            },
                            {
                              title: "Mastery Level",
                              value: "Advanced",
                              change: "+2 levels",
                              color: "rgba(255,255,255,0.9)",
                              icon: <Award className="h-4 w-4" />,
                            },
                          ].map((metric, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.4,
                                delay: 0.4 + i * 0.15,
                              }}
                              className="bg-white/10 backdrop-blur-sm p-3 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5 text-xs text-white/80">
                                  {metric.icon}
                                  <span>{metric.title}</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-end">
                                <div className="text-xl font-bold">
                                  {metric.value}
                                </div>
                                <div className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                                  {metric.change}
                                </div>
                              </div>

                              <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: metric.color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{
                                    duration: 1.5,
                                    delay: 0.6 + i * 0.2,
                                    ease: "easeOut",
                                  }}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                          className="grid grid-cols-2 gap-3"
                        >
                          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                            <h5 className="text-xs text-white/80 mb-2">
                              Skills Mastered
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {[
                                "Algebra",
                                "Critical thinking",
                                "Data analysis",
                                "Problem solving",
                                "Python",
                              ].map((skill, i) => (
                                <motion.span
                                  key={i}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 1.3 + i * 0.1 }}
                                  className="text-xs bg-white/20 py-0.5 px-1.5 rounded-full"
                                >
                                  {skill}
                                </motion.span>
                              ))}
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.8 }}
                                className="text-xs py-0.5 px-1.5 text-white/60"
                              >
                                +12 more
                              </motion.span>
                            </div>
                          </div>

                          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                            <h5 className="text-xs text-white/80 mb-2">
                              Next Focus Areas
                            </h5>
                            <motion.div
                              className="space-y-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.4 }}
                            >
                              {["Machine Learning", "Neural Networks"].map(
                                (area, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-1.5"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                    <span className="text-xs">{area}</span>
                                  </div>
                                )
                              )}
                            </motion.div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-4 left-8 p-2 bg-white rounded-xl shadow-lg border border-[#DFE2FE]"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-6 h-6 rounded-full bg-[#7091e6] flex items-center justify-center text-white text-xs font-medium"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {currentUser.substring(0, 1)}
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "auto" }}
                  transition={{ delay: 1, duration: 0.3 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <span className="text-xs font-medium text-slate-700">
                    Your progress:
                  </span>
                  <span className="text-xs font-bold text-[#7091e6]">67%</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
