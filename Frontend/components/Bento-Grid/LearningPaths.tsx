import {
  ArrowUpRight,
  Sparkles,
  Target,
  Award,
  Clock,
  Brain,
  CheckCircle,
  TrendingUp,
  GitBranch,
  AlertCircle,
  BookOpen,
  Zap,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const LearningPaths = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const currentDate = "2025-03-05";

  useEffect(() => {
    if (isHovered) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [isHovered]);

  // Learning milestones data
  const milestones = [
    {
      id: 1,
      label: "Start",
      progress: 100,
      status: "Completed",
      date: "2024-12-15",
      icon: "CheckCircle",
      x: 80,
      y: 200,
    },
    {
      id: 2,
      label: "Foundations",
      progress: 100,
      status: "Completed",
      date: "2025-01-10",
      icon: "CheckCircle",
      x: 220,
      y: 200,
    },
    {
      id: 3,
      label: "Core Concepts",
      progress: 100,
      status: "Completed",
      date: "2025-02-20",
      icon: "CheckCircle",
      x: 380,
      y: 200,
    },
    {
      id: 4,
      label: "Advanced",
      progress: 75,
      status: "Current",
      date: currentDate,
      icon: "Target",
      x: 540,
      y: 180,
    },
    {
      id: 5,
      label: "Expert",
      progress: 30,
      status: "Future",
      date: "Est. 2025-04-15",
      icon: "Brain",
      x: 680,
      y: 140,
    },
  ];

  // Alternative paths data
  const alternativePaths = [
    {
      id: "alt-1",
      path: `M80,200 C150,200 180,240 220,240 C280,240 320,220 380,220 C440,220 480,240 540,240 C600,240 640,210 680,210`,
      label: "Practice-Focused",
      color: "#B1CBFA",
    },
    {
      id: "alt-2",
      path: `M80,200 C150,200 180,160 220,160 C280,160 320,180 380,180 C440,180 480,160 540,140 C600,140 640,100 680,100`,
      label: "Theory-Focused",
      color: "#DFE2FE",
    },
  ];

  // Recently completed lessons
  const completedLessons = [
    "Neural Network Fundamentals",
    "Transformer Architecture",
    "Attention Mechanisms",
  ];

  // Next recommended topics
  const recommendations = [
    "Self-Attention Mechanisms",
    "Multi-Head Attention",
    "Positional Encoding",
  ];

  // Learning paths main path
  const mainPath =
    "M80,200 C150,200 180,200 220,200 C280,200 320,200 380,200 C440,200 480,180 540,180 C600,180 640,140 680,140";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative col-span-1 md:col-span-2 row-span-2 group overflow-hidden rounded-3xl bg-gradient-to-br from-[#DFE2FE]/10 to-[#7874F2]/30 dark:from-[#2C2A8D]/90 dark:to-[#2F4782]/90
 border border-white/10 p-6 md:p-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      
    >
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 dark:bg-[#7874F2]/90 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA] dark:text-[#B1CBFA]">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI-Driven Learning
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white dark:text-zinc-50">
            Personalized Learning Paths
          </h3>
          <p className="text-sm md:text-base text-slate-300">
            Our intelligent tutoring system adapts in real-time to your learning
            style, pace, and knowledge gaps, creating a truly personalized
            educational journey.
          </p>
        </div>

        <div className="relative h-[230px] md:h-[320px] w-full overflow-hidden rounded-xl">
          {/* Learning path visualization */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#DFE2FE]/20 via-[#B1CBFA]/20 to-[#7874F2]/40 rounded-xl overflow-hidden">
            <motion.svg
              className="w-full h-full"
              viewBox="0 0 860 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={{ scale: isHovered ? 1.03 : 1 }}
              transition={{ scale: { duration: 0.4, ease: "easeOut" } }}
            >
              {/* Background Grid */}
              <pattern
                id="grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <rect width="60" height="60" fill="none" />
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="#8E98F5"
                  strokeOpacity={isHovered ? "0.15" : "0.1"}
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* System adaptation indicator */}
              {isHovered && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <text
                    x="380"
                    y="310"
                    fontSize="14"
                    fill="#FFFFFF"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    System adapts based on your progress
                  </text>
                  <motion.path
                    d="M260,310 C310,310 330,280 380,280 C430,280 450,310 500,310"
                    stroke="#A7A4FF"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  <motion.g
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <Zap
                      x="375"
                      y="270"
                      width="12"
                      height="12"
                      color="#FFFFFF"
                    />
                  </motion.g>
                </motion.g>
              )}

              {/* Main Learning Path */}
              <motion.path
                d={mainPath}
                stroke={isHovered ? "#9490FF" : "#7874F2"}
                strokeWidth={isHovered ? "6" : "5"}
                strokeLinecap="round"
                strokeOpacity={isHovered ? "0.8" : "0.7"}
                fill="none"
                filter={isHovered ? "url(#glow)" : ""}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
              />

              {/* Path Progress Indicator */}
              {isHovered && (
                <motion.path
                  key={`path-progress-${animationKey}`}
                  d="M80,200 C150,200 180,200 220,200 C280,200 320,200 380,200 C440,200 480,180 540,180"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                />
              )}

              {/* Alternative Paths - Practice vs Theory Focus */}
              {alternativePaths.map((path, index) => (
                <motion.g key={path.id}>
                  <motion.path
                    d={path.path}
                    stroke={path.color}
                    strokeWidth={isHovered ? "3" : "2.5"}
                    strokeLinecap="round"
                    strokeOpacity={isHovered ? "0.5" : "0.4"}
                    strokeDasharray={isHovered ? "8 6" : "6 4"}
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.8 + index * 0.3 }}
                  />

                  {isHovered && (
                    <motion.text
                      x={index === 0 ? 160 : 160}
                      y={index === 0 ? 255 : 145}
                      fontSize="11"
                      fill={path.color}
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.8 }}
                      transition={{ delay: 1.2 + index * 0.2 }}
                    >
                      {path.label}
                    </motion.text>
                  )}
                </motion.g>
              ))}

              {/* Learning Milestone Nodes */}
              {milestones.map((node, i) => (
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
                  {/* Node outer circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered ? "18" : "16"}
                    fill="#0A0A0A"
                    strokeWidth={isHovered ? "2.5" : "2"}
                    stroke={isHovered ? "#A7A4FF" : "#8E98F5"}
                    filter={
                      isHovered && node.status === "Current" ? "url(#glow)" : ""
                    }
                  />

                  {/* Progress circle */}
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered ? "18" : "16"}
                    fill="none"
                    strokeWidth={isHovered ? "4" : "3"}
                    stroke={isHovered ? "#A7A4FF" : "#7874F2"}
                    strokeDasharray={`${
                      (node.progress * (isHovered ? 113 : 100)) / 100
                    } ${isHovered ? 113 : 100}`}
                    strokeDashoffset={isHovered ? "28" : "25"}
                    transform={`rotate(-90 ${node.x} ${node.y})`}
                    animate={
                      isHovered && node.status === "Current"
                        ? {
                            strokeDasharray: [
                              `${(node.progress * 113) / 100} 113`,
                              `${((node.progress + 5) * 113) / 100} 113`,
                              `${(node.progress * 113) / 100} 113`,
                            ],
                          }
                        : {}
                    }
                    transition={
                      isHovered && node.status === "Current"
                        ? {
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }
                        : {}
                    }
                  />

                  {/* Inner circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered ? "12" : "10"}
                    fill={
                      node.status === "Current"
                        ? "url(#activeNodeGradient)"
                        : "url(#nodeGradient)"
                    }
                    filter={
                      isHovered && node.status === "Current"
                        ? "url(#innerGlow)"
                        : ""
                    }
                  />

                  {/* Node icon */}
                  {isHovered && (
                    <motion.g
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      {node.icon === "CheckCircle" && (
                        <CheckCircle
                          x={node.x - 6}
                          y={node.y - 6}
                          width="12"
                          height="12"
                          color="white"
                        />
                      )}
                      {node.icon === "Target" && (
                        <Target
                          x={node.x - 6}
                          y={node.y - 6}
                          width="12"
                          height="12"
                          color="white"
                        />
                      )}
                      {node.icon === "Brain" && (
                        <Brain
                          x={node.x - 6}
                          y={node.y - 6}
                          width="12"
                          height="12"
                          color="white"
                        />
                      )}
                    </motion.g>
                  )}

                  {/* Node label and date */}
                  <motion.text
                    x={node.x}
                    y={node.y + (isHovered ? 38 : 32)}
                    fontSize={isHovered ? "12" : "11"}
                    fill={
                      isHovered && node.status === "Current"
                        ? "#FFFFFF"
                        : "#B1CBFA"
                    }
                    textAnchor="middle"
                    fontWeight={
                      isHovered && node.status === "Current" ? "bold" : "normal"
                    }
                  >
                    {node.label}
                  </motion.text>

                  {isHovered && (
                    <motion.text
                      x={node.x}
                      y={node.y + 55}
                      fontSize="9"
                      fill="#8E98F5"
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {node.date}
                    </motion.text>
                  )}
                </motion.g>
              ))}

              {/* Adaptation points - showing system intelligence */}
              {isHovered && (
                <>
                  <motion.circle
                    cx="300"
                    cy="200"
                    r="10"
                    fill="rgba(167, 164, 255, 0.2)"
                    stroke="#A7A4FF"
                    strokeWidth="1.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: [0, 0.8, 0.6] }}
                    transition={{ delay: 1.8, duration: 0.8 }}
                  />
                  <motion.text
                    x="300"
                    y="170"
                    fontSize="10"
                    fill="#FFFFFF"
                    textAnchor="middle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                  >
                    Adaptation Point
                  </motion.text>
                  <motion.circle
                    cx="460"
                    cy="190"
                    r="10"
                    fill="rgba(167, 164, 255, 0.2)"
                    stroke="#A7A4FF"
                    strokeWidth="1.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: [0, 0.8, 0.6] }}
                    transition={{ delay: 2, duration: 0.8 }}
                  />
                </>
              )}

              {/* Current position pulse indicator */}
              <motion.circle
                cx="540"
                cy="180"
                r={isHovered ? "16" : "14"}
                fill="url(#pulseGradient)"
                filter="url(#glow)"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* User indicator */}
              <motion.g
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
              >
                <rect
                  x="370"
                  y="100"
                  width={isHovered ? "120" : "110"}
                  height="28"
                  rx="14"
                  fill={isHovered ? "#00000090" : "#00000080"}
                  filter={isHovered ? "url(#glow)" : ""}
                />
                <text
                  x="377"
                  y="118"
                  fontSize="11"
                  fill="white"
                  textAnchor="start"
                >
                  <tspan>Current User: </tspan>
                  <tspan fill="#A7A4FF" fontWeight="bold">
                    Parth
                  </tspan>
                </text>

                {/* Show additional stats on hover */}
                {isHovered && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <text
                      x="525"
                      y="105"
                      fontSize="10"
                      fill="#B1CBFA"
                      textAnchor="start"
                    >
                      Mastery:{" "}
                      <tspan fill="#FFFFFF" fontWeight="bold">
                        75%
                      </tspan>
                    </text>
                  </motion.g>
                )}
              </motion.g>

              {/* Next objective indicator with improved animation */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.8, 1] }}
                transition={{
                  delay: 2.5,
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
              >
                <line
                  x1="540"
                  y1="180"
                  x2="680"
                  y2="140"
                  stroke={isHovered ? "#A7A4FF" : "#7874F2"}
                  strokeWidth={isHovered ? "3" : "2"}
                  strokeDasharray={isHovered ? "8 5" : "6 4"}
                  filter={isHovered ? "url(#glow)" : ""}
                />
                <text
                  x="610"
                  y="130"
                  fontSize={isHovered ? "12" : "11"}
                  fill={isHovered ? "#FFFFFF" : "#DFE2FE"}
                  textAnchor="middle"
                  fontWeight={isHovered ? "bold" : "normal"}
                >
                  Next Goal
                </text>
              </motion.g>

              {/* Time to completion estimate */}
              {isHovered && (
                <motion.g
                  key={`completion-${animationKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <rect
                    x="600"
                    y="60"
                    width="160"
                    height="26"
                    rx="13"
                    fill="#00000080"
                  />
                  <text
                    x="635"
                    y="77"
                    fontSize="10"
                    fill="#B1CBFA"
                    textAnchor="start"
                  >
                    <tspan>Est. completion: </tspan>
                    <tspan fill="#FFFFFF" fontWeight="bold">
                      {" "}
                      6 weeks
                    </tspan>
                  </text>
                  <Clock
                    x="615"
                    y="68"
                    width="12"
                    height="12"
                    color="#B1CBFA"
                  />
                </motion.g>
              )}

              {/* Recently completed lessons panel */}
              {isHovered && (
                <motion.g
                  key={`completed-${animationKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <rect
                    x="40"
                    y="260"
                    width="190"
                    height="100"
                    rx="8"
                    fill="#00000070"
                  />
                  <text
                    x="80"
                    y="280"
                    fontSize="12"
                    fill="#FFFFFF"
                    textAnchor="start"
                    fontWeight="bold"
                  >
                    Recently Completed
                  </text>
                  {completedLessons.map((lesson, i) => (
                    <motion.g
                      key={`lesson-${i}`}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      <text
                        x="70"
                        y={305 + i * 20}
                        fontSize="10"
                        fill="#B1CBFA"
                        textAnchor="start"
                      >
                        {lesson}
                      </text>
                      <CheckCircle
                        x="55"
                        y={297 + i * 20}
                        width="10"
                        height="10"
                        color="#7874F2"
                      />
                    </motion.g>
                  ))}
                </motion.g>
              )}

              {/* Next recommended topics panel */}
              {isHovered && (
                <motion.g
                  key={`recommendations-${animationKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <rect
                    x="510"
                    y="240"
                    width="200"
                    height="110"
                    rx="8"
                    fill="#00000070"
                  />
                  <text
                    x="520"
                    y="260"
                    fontSize="12"
                    fill="#FFFFFF"
                    textAnchor="start"
                    fontWeight="bold"
                  >
                    AI Recommends Next:
                  </text>
                  {recommendations.map((topic, i) => (
                    <motion.g
                      key={`topic-${i}`}
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      <text
                        x="545"
                        y={285 + i * 20}
                        fontSize="10"
                        fill="#B1CBFA"
                        textAnchor="start"
                      >
                        {topic}
                      </text>
                      <Target
                        x="530"
                        y={277 + i * 20}
                        width="10"
                        height="10"
                        color="#A7A4FF"
                      />
                    </motion.g>
                  ))}

                  {/* AI adaptation indicator */}
                  <motion.g
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <circle cx="500" y="330" r="6" fill="#7874F2" />
                    <text x="530" y="343" fontSize="9" fill="#FFFFFF">
                      AI adapting to your progress
                    </text>
                  </motion.g>
                </motion.g>
              )}

              {/* Learning session stats */}
              {isHovered && (
                <motion.g
                  key={`stats-${animationKey}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <rect
                    x="140"
                    y="360"
                    width="500"
                    height="30"
                    rx="15"
                    fill="#00000080"
                  />
                  <text
                    x="160"
                    y="379"
                    fontSize="10"
                    fill="#DFE2FE"
                    textAnchor="start"
                  >
                    <tspan>Current Session: </tspan>
                    <tspan fill="#FFFFFF" dx="5">
                      2025-03-05 15:15:44
                    </tspan>
                    <tspan dx="20">•</tspan>
                    <tspan dx="10">Learning Velocity: </tspan>
                    <tspan fill="#A7A4FF" dx="5" fontWeight="bold">
                      Excellent
                    </tspan>
                    <tspan dx="20">•</tspan>
                    <tspan dx="10">Mastery Index: </tspan>
                    <tspan fill="#FFFFFF" dx="5">
                      78/100
                    </tspan>
                  </text>
                </motion.g>
              )}

              {/* Live adaptive indicator */}
              {isHovered && (
                <motion.g>
                  <motion.circle
                    cx="30"
                    cy="30"
                    r="10"
                    fill="#7874F2"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <text x="50" y="34" fontSize="10" fill="#FFFFFF">
                    Live Adapting
                  </text>
                </motion.g>
              )}

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
                  <stop
                    offset="0%"
                    stopColor={isHovered ? "#D6E5FF" : "#B1CBFA"}
                  />
                  <stop
                    offset="100%"
                    stopColor={isHovered ? "#9490FF" : "#7874F2"}
                  />
                </radialGradient>

                <radialGradient
                  id="activeNodeGradient"
                  cx="0.5"
                  cy="0.5"
                  r="0.5"
                  fx="0.5"
                  fy="0.5"
                >
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#A7A4FF" />
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
                  <stop
                    offset="100%"
                    stopColor={isHovered ? "#A7A4FF" : "#7874F2"}
                  />
                </radialGradient>

                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#A7A4FF" />
                </linearGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <filter
                  id="innerGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
            </motion.svg>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="text-sm text-slate-300 mr-4"
            >
              {isHovered ? (
                <span className="text-[#B1CBFA]">
                  AI-Optimized for Your Learning Style
                </span>
              ) : (
                <span>
                  Your journey is{" "}
                  <span className="text-white font-medium">75%</span> complete
                </span>
              )}
            </motion.div>

            <motion.div
              className="flex space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-6 h-6 rounded-full bg-[#7874F2]/30 flex items-center justify-center">
                <Award className="h-3.5 w-3.5 text-[#B1CBFA]" />
              </div>
              <div className="w-6 h-6 rounded-full bg-[#7874F2]/30 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-[#B1CBFA]" />
              </div>
              <div className="w-6 h-6 rounded-full bg-[#7874F2]/30 flex items-center justify-center">
                <Target className="h-3.5 w-3.5 text-[#B1CBFA]" />
              </div>
              <div className="w-6 h-6 rounded-full bg-[#7874F2]/30 flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5 text-[#B1CBFA]" />
              </div>
            </motion.div>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
            <ArrowUpRight className="h-5 w-5 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>

      {/* AI learning insights panel - appears on hover */}
      {isHovered && (
        <motion.div
          className="hidden md:block absolute bottom-7 right-7 bg-black/60 border border-white/10 rounded-lg p-3 max-w-[200px]"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <div className="flex items-center mb-2">
            <Brain className="h-4 w-4 text-[#A7A4FF] mr-1.5" />
            <p className="text-xs font-medium text-white">Learning Insights</p>
          </div>

          <p className="text-xs text-slate-300 mb-2">
            Based on your learning patterns, you excel with visual content and
            practical exercises.
          </p>

          <div className="flex items-center">
            <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#7874F2] to-[#A7A4FF]"
                style={{ width: "75%" }}
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ delay: 0.9, duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-white ml-2">75%</span>
          </div>

          <motion.div
            className="mt-2 text-[10px] text-[#B1CBFA] flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            8% improvement this week
          </motion.div>
        </motion.div>
      )}

      {/* Real-time adaptation indicator */}
      {isHovered && (
        <motion.div
          className="absolute top-7 right-7 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-[#7874F2] mr-2"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className=" hidden md:block text-xs text-[#B1CBFA]">
            Last adaptation: {currentDate} 
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LearningPaths;