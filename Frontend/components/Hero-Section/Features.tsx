"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Brain,
  BrainCircuit,
  ChartLine,
  Code2,
  Fingerprint,
  LineChart,
  MessagesSquare,
  Network,
  Sparkles,
  Trophy,
  Users2,
  Zap,
} from "lucide-react";


export default function BentoGrid() {
  return (
    <>
    <div className="absolute inset-x-0 -mt-11 flex items-end"><div className="mr-[calc(-1*(theme(spacing.8)-theme(spacing[1.5])))] h-11 flex-auto bg-slate-950"></div><div className="flex justify-between mx-auto w-full px-6 sm:max-w-[40rem] md:max-w-[48rem] md:px-8 lg:max-w-[64rem] xl:max-w-[80rem]"><svg viewBox="0 0 56 48" aria-hidden="true" className="-ml-1.5 mb-[calc(-1/16*1rem)] w-14 flex-none overflow-visible fill-slate-950"><path d="M 2.686 3 H -4 V 48 H 56 V 47 H 53.314 A 8 8 0 0 1 47.657 44.657 L 8.343 5.343 A 8 8 0 0 0 2.686 3 Z"></path></svg><svg viewBox="0 0 56 48" aria-hidden="true" className="-mr-1.5 mb-[calc(-1/16*1rem)] w-14 flex-none overflow-visible fill-slate-950"><path d="M 53.314 3 H 60 V 48 H 0 V 47 H 2.686 A 8 8 0 0 0 8.343 44.657 L 47.657 5.343 A 8 8 0 0 1 53.314 3 Z"></path></svg></div><div className="ml-[calc(-1*(theme(spacing.8)-theme(spacing[1.5])))] h-11 flex-auto bg-slate-950"></div></div>
    <section className="w-full py-12 md:p-24 lg:p-32 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container px-4 mx-auto md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-gradient-to-br from-[#7874F2] to-[#8E98F5] px-3 py-1 text-sm">
              <div className="flex items-center gap-x-1 text-white">
                <span>Powered by RL & LLMs</span>
                <BrainCircuit className="h-4 w-4" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
              Adaptive Intelligent Tutoring System
            </h2>
            <p className="max-w-[700px] text-slate-300 md:text-xl/relaxed">
              Personalized learning experiences optimized with reinforcement
              learning and large language models.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12">
          {/* Hero Cell - Spans 2 columns and 2 rows */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative col-span-1 md:col-span-2 row-span-2 group overflow-hidden rounded-3xl bg-gradient-to-br from-[#DFE2FE]/10 to-[#7874F2]/30 border border-white/10 p-6 md:p-8"
          >
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Featured
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Personalized Learning Paths
                </h3>
                <p className="text-sm md:text-base text-slate-300">
                  Our system adapts in real-time to your learning style, pace,
                  and knowledge gaps, creating a truly personalized educational
                  journey.
                </p>
              </div>

              <div className="mt-6 relative h-[200px] md:h-[280px] w-full overflow-hidden rounded-xl">
                {/* Interactive SVG learning path visualization */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#DFE2FE]/20 via-[#B1CBFA]/20 to-[#7874F2]/40 rounded-xl overflow-hidden">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 600 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background Grid */}
                    <pattern
                      id="grid"
                      width="50"
                      height="50"
                      patternUnits="userSpaceOnUse"
                    >
                      <rect width="50" height="50" fill="none" />
                      <path
                        d="M 50 0 L 0 0 0 50"
                        fill="none"
                        stroke="#8E98F5"
                        strokeOpacity="0.1"
                      />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Main Learning Path for current user */}
                    <motion.path
                      d="M50,320 C100,320 120,240 170,240 C220,240 240,150 290,150 C340,150 360,100 410,100 C460,100 480,50 530,50"
                      stroke="#7874F2"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeOpacity="0.6"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />

                    {/* Alternative paths - less opacity */}
                    <motion.path
                      d="M50,320 C100,320 130,290 170,290 C210,290 240,210 280,210 C320,210 350,190 390,190 C430,190 470,150 530,150"
                      stroke="#B1CBFA"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeOpacity="0.4"
                      strokeDasharray="10 5"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                    />

                    <motion.path
                      d="M50,320 C90,320 110,270 150,270 C190,270 210,220 250,190 C290,160 330,120 370,90 C410,60 450,40 530,30"
                      stroke="#DFE2FE"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeOpacity="0.3"
                      strokeDasharray="8 8"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, delay: 1.1 }}
                    />

                    {/* Learning Milestone Nodes */}
                    {[
                      { cx: 50, cy: 320, label: "Start", progress: 100 },
                      { cx: 170, cy: 240, label: "Foundations", progress: 100 },
                      {
                        cx: 290,
                        cy: 150,
                        label: "Core Concepts",
                        progress: 100,
                      },
                      { cx: 410, cy: 100, label: "Advanced", progress: 75 },
                      { cx: 530, cy: 50, label: "Expert", progress: 30 },
                    ].map((node, i) => (
                      <motion.g
                        key={`node-${i}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          delay: 1.5 + i * 0.2,
                          duration: 0.5,
                        }}
                      >
                        {/* Progress circle */}
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="14"
                          fill="#0A0A0A"
                          strokeWidth="2"
                          stroke="#8E98F5"
                        />

                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="14"
                          fill="none"
                          strokeWidth="3"
                          stroke="#7874F2"
                          strokeDasharray={`${(node.progress * 88) / 100} 88`}
                          strokeDashoffset="22"
                          transform={`rotate(-90 ${node.cx} ${node.cy})`}
                        />

                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="10"
                          fill="url(#nodeGradient)"
                        />

                        {/* Node label */}
                        <text
                          x={node.cx}
                          y={node.cy + 30}
                          fontSize="11"
                          fill="#B1CBFA"
                          textAnchor="middle"
                        >
                          {node.label}
                        </text>
                      </motion.g>
                    ))}

                    {/* Current position indicator */}
                    <motion.circle
                      cx="410"
                      cy="100"
                      r="12"
                      fill="url(#pulseGradient)"
                      initial={{ scale: 0 }}
                      animate={{
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />

                    {/* User indicator */}
                    <motion.g
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2, duration: 0.5 }}
                    >
                      <rect
                        x="380"
                        y="60"
                        width="100"
                        height="28"
                        rx="14"
                        fill="#00000080"
                      />
                      <text
                        x="430"
                        y="77"
                        fontSize="11"
                        fill="white"
                        textAnchor="middle"
                      >
                        User
                      </text>
                      <circle cx="395" cy="74" r="8" fill="#7874F2" />
                      <text
                        x="395"
                        y="77"
                        fontSize="8"
                        fill="white"
                        textAnchor="middle"
                      >
                        P
                      </text>
                    </motion.g>

                    {/* Next objective indicator */}
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.6, 1] }}
                      transition={{
                        delay: 2.5,
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 5,
                      }}
                    >
                      <line
                        x1="410"
                        y1="100"
                        x2="530"
                        y2="50"
                        stroke="#7874F2"
                        strokeWidth="2"
                        strokeDasharray="5 5"
                      />
                      <text
                        x="470"
                        y="60"
                        fontSize="11"
                        fill="#DFE2FE"
                        textAnchor="middle"
                      >
                        Next Goal
                      </text>
                    </motion.g>

                    {/* Gradients definitions */}
                    <defs>
                      <radialGradient
                        id="nodeGradient"
                        cx="0.5"
                        cy="0.5"
                        r="0.5"
                        fx="0.5"
                        fy="0.5"
                      >
                        <stop offset="0%" stopColor="#B1CBFA" />
                        <stop offset="100%" stopColor="#7874F2" />
                      </radialGradient>

                      <radialGradient
                        id="pulseGradient"
                        cx="0.5"
                        cy="0.5"
                        r="0.5"
                        fx="0.5"
                        fy="0.5"
                      >
                        <stop offset="0%" stopColor="white" />
                        <stop offset="100%" stopColor="#7874F2" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="w-10 h-10 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
                  <ArrowUpRight className="h-5 w-5 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* RL Model Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl bg-black/20 border border-white/10 p-6 group"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
                <Brain className="w-3.5 h-3.5 mr-1" />
                RL Models
              </div>
              <h3 className="text-lg font-bold text-white">
                Neural RL Architecture
              </h3>
            </div>

            <div className="mt-4 h-[180px] w-full relative">
              {/* SVG Neural Network Animation */}
              <svg
                className="w-full h-full"
                viewBox="0 0 300 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Grid */}
                <pattern
                  id="smallGrid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="#8E98F5"
                    strokeOpacity="0.1"
                    strokeWidth="0.5"
                  />
                </pattern>
                <rect width="100%" height="100%" fill="url(#smallGrid)" />

                {/* Nodes Layer 1 */}
                {[40, 80, 120, 160].map((cy, i) => (
                  <motion.circle
                    key={`l1-${i}`}
                    cx="60"
                    cy={cy}
                    r="8"
                    fill="url(#nodeGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                ))}

                {/* Nodes Layer 2 */}
                {[60, 100, 140].map((cy, i) => (
                  <motion.circle
                    key={`l2-${i}`}
                    cx="150"
                    cy={cy}
                    r="8"
                    fill="url(#nodeGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  />
                ))}

                {/* Nodes Layer 3 */}
                {[80, 120].map((cy, i) => (
                  <motion.circle
                    key={`l3-${i}`}
                    cx="240"
                    cy={cy}
                    r="8"
                    fill="url(#nodeGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                  />
                ))}

                {/* Connections Layer 1 to 2 */}
                {[40, 80, 120, 160].map((fromCy, i) =>
                  [60, 100, 140].map((toCy, j) => (
                    <motion.line
                      key={`c1-${i}-${j}`}
                      x1="60"
                      y1={fromCy}
                      x2="150"
                      y2={toCy}
                      stroke="#7874F2"
                      strokeOpacity="0.3"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.7,
                        delay: 0.9 + (i + j) * 0.05,
                      }}
                    />
                  ))
                )}

                {/* Connections Layer 2 to 3 */}
                {[60, 100, 140].map((fromCy, i) =>
                  [80, 120].map((toCy, j) => (
                    <motion.line
                      key={`c2-${i}-${j}`}
                      x1="150"
                      y1={fromCy}
                      x2="240"
                      y2={toCy}
                      stroke="#7874F2"
                      strokeOpacity="0.3"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.7,
                        delay: 1.2 + (i + j) * 0.05,
                      }}
                    />
                  ))
                )}

                {/* Data Pulses */}
                {[40, 80, 120, 160].map((cy, i) => (
                  <motion.circle
                    key={`pulse-${i}`}
                    cx="60"
                    cy={cy}
                    r="3"
                    fill="#DFE2FE"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      cx: ["60", "150", "240"],
                      cy: [
                        cy.toString(),
                        (i % 2 === 0 ? "80" : "120").toString(),
                        (i % 2 === 0 ? "80" : "120").toString(),
                      ],
                    }}
                    transition={{
                      duration: 2,
                      delay: 2 + i * 0.3,
                      repeat: Infinity,
                      repeatDelay: i * 0.5 + 1,
                    }}
                  />
                ))}

                {/* Gradient Definitions */}
                <defs>
                  <radialGradient
                    id="nodeGradient"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                    fx="0.5"
                    fy="0.5"
                  >
                    <stop offset="0%" stopColor="#B1CBFA" />
                    <stop offset="100%" stopColor="#7874F2" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
              <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
            </div>
          </motion.div>

          {/* Learning Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden rounded-3xl bg-black/20 border border-white/10 p-6 group"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
                <LineChart className="w-3.5 h-3.5 mr-1" />
                Analytics
              </div>
              <h3 className="text-lg font-bold text-white">
                Learning Insights
              </h3>
            </div>

            <div className="mt-4 h-[180px] w-full relative">
              {/* SVG Analytics Animation */}
              <svg
                className="w-full h-full"
                viewBox="0 0 300 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Grid */}
                <rect width="300" height="180" fill="#00000020" rx="4" />

                {/* Axes */}
                <line
                  x1="40"
                  y1="30"
                  x2="40"
                  y2="150"
                  stroke="#B1CBFA"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="150"
                  x2="280"
                  y2="150"
                  stroke="#B1CBFA"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />

                {/* Y-axis Labels */}
                <text
                  x="30"
                  y="40"
                  fill="#B1CBFA"
                  fontSize="8"
                  textAnchor="end"
                >
                  100%
                </text>
                <text
                  x="30"
                  y="80"
                  fill="#B1CBFA"
                  fontSize="8"
                  textAnchor="end"
                >
                  75%
                </text>
                <text
                  x="30"
                  y="120"
                  fill="#B1CBFA"
                  fontSize="8"
                  textAnchor="end"
                >
                  50%
                </text>
                <text
                  x="30"
                  y="150"
                  fill="#B1CBFA"
                  fontSize="8"
                  textAnchor="end"
                >
                  25%
                </text>

                {/* X-axis Ticks */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={`tick-${i}`}>
                    <line
                      x1={40 + i * 48}
                      y1="150"
                      x2={40 + i * 48}
                      y2="153"
                      stroke="#B1CBFA"
                      strokeOpacity="0.5"
                      strokeWidth="1"
                    />
                    <text
                      x={40 + i * 48}
                      y="165"
                      fill="#B1CBFA"
                      fontSize="8"
                      textAnchor="middle"
                    >
                      Week {i + 1}
                    </text>
                  </div>
                ))}

                {/* Bar Chart - Progress */}
                {[
                  { week: 0, value: 40, color: "#DFE2FE" },
                  { week: 1, value: 70, color: "#B1CBFA" },
                  { week: 2, value: 85, color: "#8E98F5" },
                  { week: 3, value: 50, color: "#7874F2" },
                  { week: 4, value: 85, color: "#8E98F5" },
                  { week: 5, value: 100, color: "#B1CBFA" },
                ].map((item, i) => (
                  <motion.rect
                    key={`bar-${i}`}
                    x={48 + item.week * 48}
                    y={0}
                    width="24"
                    height={item.value}
                    fill={item.color}
                    fillOpacity="0.6"
                    rx="2"
                    initial={{ height: 0, y: 150 }}
                    animate={{ height: item.value, y: 150 - item.value }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  />
                ))}

                {/* Line Chart - Trend */}
                <motion.path
                  d="M52 120 L100 90 L148 60 L196 100 L244 70 L292 50"
                  stroke="#7874F2"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 1 }}
                />

                {/* Data points */}
                {[
                  { x: 52, y: 120 },
                  { x: 100, y: 90 },
                  { x: 148, y: 60 },
                  { x: 196, y: 100 },
                  { x: 244, y: 70 },
                  { x: 292, y: 50 },
                ].map((point, i) => (
                  <motion.circle
                    key={`point-${i}`}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#B1CBFA"
                    stroke="#7874F2"
                    strokeWidth="1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 1 + i * 0.1 }}
                  />
                ))}

                {/* Animated tooltip */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  <rect
                    x="230"
                    y="40"
                    width="60"
                    height="25"
                    fill="#00000060"
                    rx="4"
                  />
                  <text x="240" y="55" fill="#DFE2FE" fontSize="8">
                    +25% growth
                  </text>
                  <line
                    x1="244"
                    y1="70"
                    x2="244"
                    y2="40"
                    stroke="#B1CBFA"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />
                </motion.g>
              </svg>
            </div>

            <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
              <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
            </div>
          </motion.div>

          {/* NLP & Content Understanding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#7874F2]/20 to-[#DFE2FE]/5 border border-white/10 p-6 group"
          >
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
                  <MessagesSquare className="w-3.5 h-3.5 mr-1" />
                  NLP
                </div>
                <h3 className="text-lg font-bold text-white">
                  Language Understanding
                </h3>
                <p className="text-sm text-slate-300">
                  Advanced NLP algorithms analyze student responses for
                  conceptual understanding beyond keywords.
                </p>
              </div>

              <div className="mt-2 relative h-[120px]">
                {/* SVG Language Processing Visualization */}
                <svg
                  className="w-full h-full"
                  viewBox="0 0 300 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Student Response */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <rect
                      x="10"
                      y="10"
                      width="180"
                      height="36"
                      rx="18"
                      fill="#DFE2FE"
                      fillOpacity="0.1"
                    />
                    <text x="20" y="30" fill="#DFE2FE" fontSize="11">
                      "Photosynthesis is the process.."
                    </text>

                    <rect
                      x="10"
                      y="80"
                      width="180"
                      height="36"
                      rx="18"
                      fill="#7874F2"
                      fillOpacity="0.15"
                    />
                    <text x="20" y="102" fontSize="11" fill="#B1CBFA">
                      {`Conceptual: Photosynthesis = 92%`}
                    </text>
                  </motion.g>

                  {/* Connected dots animation to represent language processing */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.circle
                        key={`dot-${i}`}
                        cx={210 + (i % 5) * 18}
                        cy={30 + Math.floor(i / 5) * 30}
                        r="3"
                        fill="#8E98F5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.05 }}
                      />
                    ))}
                  </motion.g>

                  {/* Connections between dots */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                  >
                    {Array.from({ length: 20 }).map((_, i) => {
                      const startX = 210 + (i % 5) * 18;
                      const startY = 30 + Math.floor(i / 5) * 30;
                      const endX = 210 + ((i + 3) % 5) * 18;
                      const endY = 30 + Math.floor(((i + 7) % 15) / 5) * 30;

                      return (
                        <motion.line
                          key={`line-${i}`}
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke="#B1CBFA"
                          strokeWidth="1"
                          strokeOpacity="0.3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 1.3 + i * 0.03, duration: 0.5 }}
                        />
                      );
                    })}
                  </motion.g>

                  {/* Data pulse animation */}
                  <motion.circle
                    cx="100"
                    cy="30"
                    r="4"
                    fill="#7874F2"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      cx: ["100", "250", "250"],
                      cy: ["30", "60", "90"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />

                  {/* Concept extraction animation */}
                  <motion.g
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8, duration: 0.5 }}
                  >
                    <rect
                      x="220"
                      y="85"
                      width="50"
                      height="20"
                      rx="4"
                      fill="#7874F2"
                      fillOpacity="0.3"
                    />
                    <text
                      x="245"
                      y="99"
                      fontSize="9"
                      fill="white"
                      textAnchor="middle"
                    >
                      Analyzed
                    </text>
                  </motion.g>

                  {/* User identification */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 0.5 }}
                  >
                    <rect
                      x="200"
                      y="2"
                      width="90"
                      height="18"
                      rx="9"
                      fill="#00000050"
                    />
                    <text x="215" y="13" fontSize="8" fill="#B1CBFA">
                      User
                    </text>
                    <circle cx="280" cy="9" r="5" fill="#8E98F5" />
                    <text
                      x="280"
                      y="12"
                      fontSize="6"
                      fill="white"
                      textAnchor="middle"
                    >
                      ID
                    </text>
                  </motion.g>
                </svg>
              </div>

              <div className="mt-4 flex justify-between items-center">
                {/* Animated typing indicator */}
                <div className="flex items-center space-x-1">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#B1CBFA]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#8E98F5]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#7874F2]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>


            <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
              <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
            </div>
          </motion.div>

          {/* Progress Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative col-span-1 md:col-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-[#DFE2FE]/10 to-[#7874F2]/20 border border-white/10 p-6 group"
          >
            <div className="flex flex-col h-full">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
                  <ChartLine className="w-3.5 h-3.5 mr-1" />
                  Progress
                </div>
                <h3 className="text-lg font-bold text-white">
                  Skill Mastery Tracking
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-3">
                {["Algebra", "Calculus", "Statistics", "Probability"].map(
                  (subject, i) => (
                    <div key={subject} className="relative">
                      <div className="text-xs text-slate-300 mb-1">
                        {subject}
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#B1CBFA] to-[#7874F2] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(i + 1) * 20}%` }}
                          transition={{
                            delay: 0.5 + i * 0.1,
                            duration: 1,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 overflow-hidden relative">
                  {/* Radar Chart Visualization */}
                  <div className="relative h-[160px]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Radar Chart - Animated with SVG */}
                      <svg width="160" height="160" viewBox="0 0 160 160">
                        <g transform="translate(80,80)">
                          {/* Background polygons */}
                          <motion.polygon
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            transition={{ duration: 0.5 }}
                            points="0,-70 60.6,-35 60.6,35 0,70 -60.6,35 -60.6,-35"
                            fill="none"
                            stroke="#B1CBFA"
                            strokeWidth="0.5"
                          />
                          <motion.polygon
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            points="0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25"
                            fill="none"
                            stroke="#B1CBFA"
                            strokeWidth="0.5"
                          />
                          <motion.polygon
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15"
                            fill="none"
                            stroke="#B1CBFA"
                            strokeWidth="0.5"
                          />

                          {/* Data polygon - animated */}
                          <motion.polygon
                            initial={{
                              opacity: 0,
                              points: "0,0 0,0 0,0 0,0 0,0 0,0",
                            }}
                            animate={{
                              opacity: 0.7,
                              points:
                                "0,-60 40.6,-25 50.6,30 0,50 -45.6,25 -30.6,-45",
                            }}
                            transition={{ duration: 1, delay: 0.8 }}
                            fill="url(#radarGradient)"
                            strokeWidth="2"
                            stroke="#7874F2"
                          />

                          {/* Axis lines */}
                          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <motion.line
                              key={angle}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.3 }}
                              transition={{ duration: 0.3, delay: i * 0.05 }}
                              x1="0"
                              y1="0"
                              x2={70 * Math.sin((angle * Math.PI) / 180)}
                              y2={-70 * Math.cos((angle * Math.PI) / 180)}
                              stroke="#B1CBFA"
                              strokeWidth="0.5"
                            />
                          ))}

                          {/* Data points - pulsing */}
                          {[
                            [0, -60],
                            [40.6, -25],
                            [50.6, 30],
                            [0, 50],
                            [-45.6, 25],
                            [-30.6, -45],
                          ].map((point, i) => (
                            <motion.circle
                              key={i}
                              initial={{ r: 0 }}
                              animate={{ r: 3 }}
                              transition={{
                                duration: 0.5,
                                delay: 1 + i * 0.1,
                              }}
                              cx={point[0]}
                              cy={point[1]}
                              fill="#7874F2"
                              className="animate-pulse"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </g>

                        {/* Gradient definition */}
                        <defs>
                          <linearGradient
                            id="radarGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#B1CBFA"
                              stopOpacity="0.7"
                            />
                            <stop
                              offset="100%"
                              stopColor="#7874F2"
                              stopOpacity="0.3"
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-white mt-2">
                    Concept Mastery Map
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 overflow-hidden relative">
                  {/* Time Series Chart */}
                  <div className="relative h-[160px]">
                    <div className="absolute inset-0 flex items-end justify-between px-2">
                      {[...Array(14)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-[5%] bg-gradient-to-t from-[#7874F2] to-[#B1CBFA] rounded-t-sm"
                          initial={{ height: 0 }}
                          animate={{
                            height: `${
                              20 + Math.sin(i * 0.9) * 15 + Math.random() * 70
                            }px`,
                          }}
                          transition={{
                            duration: 1,
                            delay: 0.5 + i * 0.05,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </div>

                    {/* Line overlay */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 300 160"
                    >
                      <motion.path
                        d="M0,100 C20,80 40,120 60,90 C80,60 100,105 120,85 C140,65 160,95 180,70 C200,45 220,75 240,60 C260,45 280,65 300,50"
                        fill="none"
                        stroke="#8E98F5"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, delay: 0.8 }}
                      />

                      {/* Animated dot along the path */}
                      <motion.circle
                        cx="0"
                        cy="100"
                        r="4"
                        fill="#DFE2FE"
                        animate={{
                          cx: [0, 60, 120, 180, 240, 300],
                          cy: [100, 90, 85, 70, 60, 50],
                        }}
                        transition={{
                          duration: 4,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      />
                    </svg>
                  </div>

                  <div className="text-sm font-medium text-white mt-2">
                    Learning Progress Trend
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
                  <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Adaptive Quiz System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-black/20 border border-white/10 p-6 group"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
                <Zap className="w-3.5 h-3.5 mr-1" />
                Adaptive
              </div>
              <h3 className="text-lg font-bold text-white">
                Dynamic Assessment
              </h3>
              <p className="text-sm text-slate-300">
                Questions that adapt in real-time to your responses and learning
                progress.
              </p>
            </div>

            <div className="mt-4 relative h-[110px] bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-[#B1CBFA] mb-2">
                Next question difficulty:
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">Easy</div>
                <div className="text-xs text-slate-400">Hard</div>
              </div>

              <div className="mt-1 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#B1CBFA] to-[#7874F2]"
                  initial={{ width: "20%" }}
                  animate={{ width: "65%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                />
              </div>

              <motion.div
                className="absolute right-3 bottom-3 text-xs text-white/70 bg-[#8E98F5]/30 px-2 py-1 rounded-md"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Recalibrating...
              </motion.div>
            </div>

            <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
              <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
            </div>
          </motion.div>

          {/* User Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#B1CBFA]/10 to-[#7874F2]/20 border border-white/10 p-6 group"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
                <Fingerprint className="w-3.5 h-3.5 mr-1" />
                Profile
              </div>
              <h3 className="text-lg font-bold text-white">
                Cognitive Profile
              </h3>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#DFE2FE]/20 flex items-center justify-center mr-3">
                  <Users2 className="h-4 w-4 text-[#DFE2FE]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    Parth18062003
                  </div>
                  <div className="text-xs text-slate-400">Advanced Learner</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/20 rounded-lg p-2">
                  <div className="text-xs text-slate-400 mb-1">
                    Learning Style
                  </div>
                  <div className="text-sm font-medium text-white">
                    Visual-Spatial
                  </div>

                  <motion.div
                    className="mt-1 h-1 bg-[#B1CBFA]/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  />
                </div>
                <div className="bg-black/20 rounded-lg p-2">
                  <div className="text-xs text-slate-400 mb-1">Pacing</div>
                  <div className="text-sm font-medium text-white">
                    Accelerated
                  </div>
                  <motion.div
                    className="mt-1 h-1 bg-[#7874F2]/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  />
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-2 relative overflow-hidden">
                <div className="text-xs text-slate-400 mb-1">
                  AI Tutor Match
                </div>
                <div className="text-sm font-medium text-white">
                  Professor Quantum
                </div>
                <motion.div
                  className="mt-1 h-1 bg-gradient-to-r from-[#B1CBFA] to-[#7874F2] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                />

                {/* Animated quantum particles */}
                <div className="absolute -right-2 -bottom-2 w-12 h-12 opacity-30">
                  <div className="absolute inset-0">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-[#DFE2FE]"
                        animate={{
                          x: Math.sin((i * 45 * Math.PI) / 180) * 15,
                          y: Math.cos((i * 45 * Math.PI) / 180) * 15,
                          opacity: [0.2, 0.8, 0.2],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
              <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
            </div>
          </motion.div>

          {/* Knowledge Graph - Replacing the Code Integration Cell */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="relative overflow-hidden rounded-3xl bg-black/20 border border-white/10 p-6 group"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
                <Network className="w-3.5 h-3.5 mr-1" />
                Knowledge
              </div>
              <h3 className="text-lg font-bold text-white">Concept Graph</h3>
            </div>

            <div className="mt-4 h-[180px] w-full relative">
              {/* SVG Knowledge Graph Animation */}
              <svg
                className="w-full h-full"
                viewBox="0 0 300 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Nodes - Main Concepts */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Center Node - Main Concept */}
                  <circle
                    cx="150"
                    cy="90"
                    r="12"
                    fill="url(#nodeGradientMain)"
                  />
                  <text
                    x="150"
                    y="93"
                    fontSize="8"
                    fill="white"
                    textAnchor="middle"
                  >
                    AI
                  </text>
                </motion.g>
                {/* Secondary Nodes */} {/* Secondary Nodes */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <circle cx="90" cy="50" r="10" fill="url(#nodeGradient2)" />
                  <text
                    x="90"
                    y="53"
                    fontSize="7"
                    fill="white"
                    textAnchor="middle"
                  >
                    ML
                  </text>

                  <circle cx="85" cy="130" r="10" fill="url(#nodeGradient2)" />
                  <text
                    x="85"
                    y="133"
                    fontSize="7"
                    fill="white"
                    textAnchor="middle"
                  >
                    RL
                  </text>

                  <circle cx="210" cy="40" r="10" fill="url(#nodeGradient2)" />
                  <text
                    x="210"
                    y="43"
                    fontSize="7"
                    fill="white"
                    textAnchor="middle"
                  >
                    NLP
                  </text>

                  <circle cx="220" cy="140" r="10" fill="url(#nodeGradient2)" />
                  <text
                    x="220"
                    y="143"
                    fontSize="7"
                    fill="white"
                    textAnchor="middle"
                  >
                    LLM
                  </text>
                </motion.g>
                {/* Tertiary Nodes */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <circle cx="40" cy="70" r="8" fill="url(#nodeGradient3)" />
                  <text
                    x="40"
                    y="73"
                    fontSize="6"
                    fill="white"
                    textAnchor="middle"
                  >
                    CNN
                  </text>

                  <circle cx="50" cy="110" r="8" fill="url(#nodeGradient3)" />
                  <text
                    x="50"
                    y="113"
                    fontSize="6"
                    fill="white"
                    textAnchor="middle"
                  >
                    GAN
                  </text>

                  <circle cx="140" cy="30" r="8" fill="url(#nodeGradient3)" />
                  <text
                    x="140"
                    y="33"
                    fontSize="6"
                    fill="white"
                    textAnchor="middle"
                  >
                    SVM
                  </text>

                  <circle cx="140" cy="150" r="8" fill="url(#nodeGradient3)" />
                  <text
                    x="140"
                    y="153"
                    fontSize="6"
                    fill="white"
                    textAnchor="middle"
                  >
                    DQN
                  </text>

                  <circle cx="260" cy="75" r="8" fill="url(#nodeGradient3)" />
                  <text
                    x="260"
                    y="78"
                    fontSize="6"
                    fill="white"
                    textAnchor="middle"
                  >
                    BERT
                  </text>

                  <circle cx="250" cy="110" r="8" fill="url(#nodeGradient3)" />
                  <text
                    x="250"
                    y="113"
                    fontSize="6"
                    fill="white"
                    textAnchor="middle"
                  >
                    GPT
                  </text>
                </motion.g>
                {/* Connections */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  {/* Main to Secondary */}
                  <path
                    d="M150 90 L90 50"
                    stroke="url(#connectionGradient)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M150 90 L85 130"
                    stroke="url(#connectionGradient)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M150 90 L210 40"
                    stroke="url(#connectionGradient)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M150 90 L220 140"
                    stroke="url(#connectionGradient)"
                    strokeWidth="1.5"
                  />

                  {/* Secondary to Tertiary */}
                  <path
                    d="M90 50 L40 70"
                    stroke="#8E98F5"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M90 50 L140 30"
                    stroke="#8E98F5"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M85 130 L50 110"
                    stroke="#8E98F5"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M85 130 L140 150"
                    stroke="#8E98F5"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M210 40 L260 75"
                    stroke="#8E98F5"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M220 140 L250 110"
                    stroke="#8E98F5"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />
                </motion.g>
                {/* Animated knowledge flow pulses */}
                <motion.circle
                  cx="150"
                  cy="90"
                  r="3"
                  fill="#DFE2FE"
                  animate={{
                    cx: ["150", "90", "40"],
                    cy: ["90", "50", "70"],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
                <motion.circle
                  cx="150"
                  cy="90"
                  r="3"
                  fill="#DFE2FE"
                  animate={{
                    cx: ["150", "85", "140"],
                    cy: ["90", "130", "150"],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: 1,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
                <motion.circle
                  cx="150"
                  cy="90"
                  r="3"
                  fill="#DFE2FE"
                  animate={{
                    cx: ["150", "210", "260"],
                    cy: ["90", "40", "75"],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
                <motion.circle
                  cx="150"
                  cy="90"
                  r="3"
                  fill="#DFE2FE"
                  animate={{
                    cx: ["150", "220", "250"],
                    cy: ["90", "140", "110"],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: 3,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
                {/* Gradients */}
                <defs>
                  <radialGradient
                    id="nodeGradientMain"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                    fx="0.5"
                    fy="0.5"
                  >
                    <stop offset="0%" stopColor="#B1CBFA" />
                    <stop offset="100%" stopColor="#7874F2" />
                  </radialGradient>

                  <radialGradient
                    id="nodeGradient2"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                    fx="0.5"
                    fy="0.5"
                  >
                    <stop offset="0%" stopColor="#8E98F5" />
                    <stop offset="100%" stopColor="#7874F2" />
                  </radialGradient>

                  <radialGradient
                    id="nodeGradient3"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                    fx="0.5"
                    fy="0.5"
                  >
                    <stop offset="0%" stopColor="#DFE2FE" />
                    <stop offset="100%" stopColor="#8E98F5" />
                  </radialGradient>

                  <linearGradient
                    id="connectionGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#B1CBFA" />
                    <stop offset="100%" stopColor="#7874F2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/80 px-3 py-1.5 rounded-lg">
                <p className="text-xs text-white">
                  Explore your Knowledge Graph
                </p>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
              <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
            </div>
          </motion.div>
          {/* Achievement System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative col-span-1 md:col-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-[#DFE2FE]/10 to-[#7874F2]/20 border border-white/10 p-6 group"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
                <Trophy className="w-3.5 h-3.5 mr-1" />
                Gamification
              </div>
              <h3 className="text-lg font-bold text-white">
                Achievement System
              </h3>
              <p className="text-sm text-slate-300 max-w-2xl">
                Earn rewards and track your learning journey with AI-powered
                achievement recommendations.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  name: "Quick Learner",
                  icon: "🚀",
                  desc: "Complete 5 lessons in one day",
                  progress: 100,
                  earned: true,
                },
                {
                  name: "Deep Thinker",
                  icon: "🧠",
                  desc: "Solve 10 complex problems",
                  progress: 70,
                  earned: false,
                },
                {
                  name: "Consistent Scholar",
                  icon: "📚",
                  desc: "Study for 7 consecutive days",
                  progress: 85,
                  earned: false,
                },
                {
                  name: "Math Wizard",
                  icon: "✨",
                  desc: "Master all calculus concepts",
                  progress: 40,
                  earned: false,
                },
              ].map((achievement, i) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                  className={`bg-black/30 rounded-xl p-4 border ${
                    achievement.earned
                      ? "border-[#8E98F5]/50"
                      : "border-white/10"
                  } relative overflow-hidden group/card`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`text-2xl mb-2 ${
                        achievement.earned ? "animate-bounce-subtle" : ""
                      }`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      {achievement.icon}
                    </div>
                    <div className="text-sm font-medium text-white mb-1">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-slate-400 mb-3">
                      {achievement.desc}
                    </div>

                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          achievement.earned
                            ? "bg-gradient-to-r from-[#B1CBFA] to-[#7874F2]"
                            : "bg-[#8E98F5]/50"
                        }`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${achievement.progress}%` }}
                        transition={{ duration: 1, delay: 1.2 + i * 0.1 }}
                      />
                    </div>

                    {achievement.earned && (
                      <>
                        <div className="mt-2 text-xs text-[#B1CBFA]">
                          Achieved!
                        </div>
                        {/* Celebration particles */}
                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 rounded-full bg-[#DFE2FE]"
                              initial={{
                                x: "50%",
                                y: "50%",
                                opacity: 0,
                              }}
                              animate={{
                                x: `${50 + (Math.random() * 100 - 50)}%`,
                                y: `${50 + (Math.random() * 100 - 50)}%`,
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 1.5,
                                delay: Math.random() * 0.5,
                                repeat: Infinity,
                                repeatDelay: Math.random() + 1,
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
                <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
    <div className="mx-auto w-full px-6 sm:max-w-[40rem] md:max-w-[48rem] md:px-8 lg:max-w-[64rem] xl:max-w-[80rem]"><div className="relative -mx-2.5 flex -bottom-1 -mt-10"><svg viewBox="0 0 64 48" className="w-16 flex-none fill-zinc-100" aria-hidden="true"><path d="M51.657 2.343 12.343 41.657A8 8 0 0 1 6.686 44H0v4h64V0h-6.686a8 8 0 0 0-5.657 2.343Z"></path></svg><div className="-mx-px flex-auto bg-zinc-100"></div><svg viewBox="0 0 64 48" className="w-16 flex-none fill-zinc-100" aria-hidden="true"><path d="m12.343 2.343 39.314 39.314A8 8 0 0 0 57.314 44H64v4H0V0h6.686a8 8 0 0 1 5.657 2.343Z"></path></svg></div></div>
    </>
  );
}
