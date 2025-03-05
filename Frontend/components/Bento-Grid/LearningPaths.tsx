import {
  ArrowUpRight,
  Sparkles,
  Target,
  Award,
  Clock,
  Brain,
  CheckCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

const LearningPaths = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const currentDate = "2025-03-05";

  useEffect(() => {
    if (isHovered) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [isHovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative col-span-1 md:col-span-2 row-span-2 group overflow-hidden rounded-3xl bg-gradient-to-br from-[#DFE2FE]/10 to-[#7874F2]/30 border border-white/10 p-6 md:p-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI-Driven Learning
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">
            Personalized Learning Paths
          </h3>
          <p className="text-sm md:text-base text-slate-300">
            Our system adapts in real-time to your learning style, pace, and
            knowledge gaps, creating a truly personalized educational journey.
          </p>
        </div>

        <div className="mt-6 relative h-[200px] md:h-[280px] w-full overflow-hidden rounded-xl">
          {/* Interactive SVG learning path visualization */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#DFE2FE]/20 via-[#B1CBFA]/20 to-[#7874F2]/40 rounded-xl overflow-hidden">
            <motion.svg
              className="w-full h-full"
              viewBox="0 0 720 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={{
                scale: isHovered ? 1.03 : 1,
              }}
              transition={{
                scale: { duration: 0.4, ease: "easeOut" },
              }}
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
                  strokeOpacity={isHovered ? "0.15" : "0.1"}
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Main Learning Path for current user */}
              <motion.path
                d="M40,250 C120,250 180,230 260,230 C340,230 400,210 480,210 C560,210 600,190 680,190"
                stroke={isHovered ? "#9490FF" : "#7874F2"}
                strokeWidth={isHovered ? "12" : "10"}
                strokeLinecap="round"
                strokeOpacity={isHovered ? "0.7" : "0.6"}
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
                  d="M40,250 C120,250 180,230 260,230 C340,230 400,210 480,210"
                  stroke="url(#progressGradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              )}
              {/* Alternative paths - less opacity */}
              <motion.path
                d="M40,250 C120,250 180,270 260,270 C340,270 400,250 480,250 C560,250 600,230 680,230"
                stroke={isHovered ? "#B1CBFA" : "#B1CBFA"}
                strokeWidth={isHovered ? "5" : "4"}
                strokeLinecap="round"
                strokeOpacity={isHovered ? "0.5" : "0.4"}
                strokeDasharray={isHovered ? "12 6" : "10 5"}
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.8 }}
              />
              <motion.path
                d="M40,250 C120,250 180,190 260,190 C340,190 400,170 480,170 C560,170 600,150 680,150"
                stroke={isHovered ? "#DFE2FE" : "#DFE2FE"}
                strokeWidth={isHovered ? "5" : "4"}
                strokeLinecap="round"
                strokeOpacity={isHovered ? "0.4" : "0.3"}
                strokeDasharray={isHovered ? "10 6" : "8 8"}
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.1 }}
              />
              {/* Learning Milestone Nodes */}
              {[
                {
                  cx: 40,
                  cy: 250,
                  label: "Start",
                  progress: 100,
                  status: "Completed",
                  date: "2024-12-15",
                  icon: "CheckCircle",
                },
                {
                  cx: 260,
                  cy: 230,
                  label: "Foundations",
                  progress: 100,
                  status: "Completed",
                  date: "2025-01-10",
                  icon: "CheckCircle",
                },
                {
                  cx: 400,
                  cy: 210,
                  label: "Core Concepts",
                  progress: 100,
                  status: "Completed",
                  date: "2025-02-20",
                  icon: "CheckCircle",
                },
                {
                  cx: 480,
                  cy: 210,
                  label: "Advanced",
                  progress: 75,
                  status: "Current",
                  date: currentDate,
                  icon: "Target",
                },
                {
                  cx: 680,
                  cy: 190,
                  label: "Expert",
                  progress: 30,
                  status: "Future",
                  date: "Est. 2025-04-15",
                  icon: "Brain",
                },
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
                    r={isHovered ? "16" : "14"}
                    fill="#0A0A0A"
                    strokeWidth={isHovered ? "2.5" : "2"}
                    stroke={isHovered ? "#A7A4FF" : "#8E98F5"}
                    filter={
                      isHovered && node.status === "Current" ? "url(#glow)" : ""
                    }
                  />

                  <motion.circle
                    cx={node.cx}
                    cy={node.cy}
                    r={isHovered ? "16" : "14"}
                    fill="none"
                    strokeWidth={isHovered ? "4" : "3"}
                    stroke={isHovered ? "#A7A4FF" : "#7874F2"}
                    strokeDasharray={`${
                      (node.progress * (isHovered ? 100 : 88)) / 100
                    } ${isHovered ? 100 : 88}`}
                    strokeDashoffset={isHovered ? "25" : "22"}
                    transform={`rotate(-90 ${node.cx} ${node.cy})`}
                    animate={
                      isHovered && node.status === "Current"
                        ? {
                            strokeDasharray: [
                              `${(node.progress * 100) / 100} 100`,
                              `${((node.progress + 5) * 100) / 100} 100`,
                              `${(node.progress * 100) / 100} 100`,
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

                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={isHovered ? "11" : "10"}
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

                  {/* Node icon - shown on hover */}
                  {isHovered && (
                    <motion.g
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      {node.icon === "CheckCircle" && (
                        <CheckCircle
                          x={node.cx - 6}
                          y={node.cy - 6}
                          width="12"
                          height="12"
                          color="white"
                        />
                      )}
                      {node.icon === "Target" && (
                        <Target
                          x={node.cx - 6}
                          y={node.cy - 6}
                          width="12"
                          height="12"
                          color="white"
                        />
                      )}
                      {node.icon === "Brain" && (
                        <Brain
                          x={node.cx - 6}
                          y={node.cy - 6}
                          width="12"
                          height="12"
                          color="white"
                        />
                      )}
                    </motion.g>
                  )}

                  {/* Node label */}
                  <motion.text
                    x={node.cx}
                    y={node.cy + (isHovered ? 34 : 30)}
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

                  {/* Date label - only shown on hover */}
                  {isHovered && (
                    <motion.text
                      x={node.cx}
                      y={node.cy + 48}
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
              {/* Current position indicator */}
              <motion.circle
                cx="480"
                cy="210"
                r={isHovered ? "14" : "12"}
                fill="url(#pulseGradient)"
                filter="url(#glow)"
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
                  x="450"
                  y="170"
                  width={isHovered ? "120" : "100"}
                  height="28"
                  rx="14"
                  fill={isHovered ? "#00000090" : "#00000080"}
                  filter={isHovered ? "url(#glow)" : ""}
                />
                <text
                  x="400"
                  y="77"
                  fontSize="11"
                  fill="white"
                  textAnchor="middle"
                >
                  User
                </text>
                <circle
                  cx="395"
                  cy="74"
                  r="8"
                  fill={isHovered ? "#A7A4FF" : "#7874F2"}
                />
                <text
                  x="395"
                  y="77"
                  fontSize="8"
                  fill="white"
                  textAnchor="middle"
                >
                  P
                </text>

                {/* Show additional stats on hover */}
                {isHovered && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <text
                      x="450"
                      y="77"
                      fontSize="10"
                      fill="#B1CBFA"
                      textAnchor="middle"
                    >
                      75% Complete
                    </text>
                  </motion.g>
                )}
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
                  x1="480"
                  y1="210"
                  x2="680"
                  y2="190"
                  stroke={isHovered ? "#A7A4FF" : "#7874F2"}
                  strokeWidth={isHovered ? "3" : "2"}
                  strokeDasharray={isHovered ? "8 4" : "5 5"}
                  filter={isHovered ? "url(#glow)" : ""}
                />
                <text
                  x="580"
                  y="180"
                  fontSize={isHovered ? "12" : "11"}
                  fill={isHovered ? "#FFFFFF" : "#DFE2FE"}
                  textAnchor="middle"
                  fontWeight={isHovered ? "bold" : "normal"}
                >
                  Next Goal
                </text>
              </motion.g>
              {/* Time to completion estimate - only appears on hover */}
              {isHovered && (
                <motion.g
                  key={`completion-${animationKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <rect
                    x="450"
                    y="25"
                    width="130"
                    height="22"
                    rx="11"
                    fill="#00000080"
                  />
                  <text
                    x="475"
                    y="39"
                    fontSize="10"
                    fill="#B1CBFA"
                    textAnchor="start"
                  >
                    <tspan>Est. completion:</tspan>
                    <tspan fill="#FFFFFF" fontWeight="bold">
                      {" "}
                      6 weeks
                    </tspan>
                  </text>
                  <Clock
                    x="460"
                    y="31"
                    width="12"
                    height="12"
                    color="#B1CBFA"
                  />
                </motion.g>
              )}
              {/* Recently completed lessons - only appears on hover */}
              // Update recently completed lessons position
              {isHovered && (
                <motion.g
                  key={`completed-${animationKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <rect
                    x="160"
                    y="270"
                    width="160"
                    height="80"
                    rx="6"
                    fill="#00000070"
                  />
                  <text
                    x="300"
                    y="198"
                    fontSize="11"
                    fill="#FFFFFF"
                    textAnchor="start"
                    fontWeight="bold"
                  >
                    Recently Completed
                  </text>
                  {[
                    "Advanced Neural Networks",
                    "Transformer Architecture",
                    "Attention Mechanisms",
                  ].map((lesson, i) => (
                    <motion.g
                      key={`lesson-${i}`}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      <text
                        x="305"
                        y={218 + i * 16}
                        fontSize="10"
                        fill="#B1CBFA"
                        textAnchor="start"
                      >
                        {lesson}
                      </text>
                      <CheckCircle
                        x="290"
                        y={210 + i * 16}
                        width="10"
                        height="10"
                        color="#7874F2"
                      />
                    </motion.g>
                  ))}
                </motion.g>
              )}
              {/* Learning path animation effect - swoosh effect */}
              {isHovered && (
                <>
                  <motion.circle
                    key={`swoosh1-${animationKey}`}
                    r="6"
                    fill="#FFFFFF"
                    filter="url(#glow)"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      cx: [40, 260, 400, 480],
                      cy: [250, 230, 210, 210],
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  <motion.circle
                    key={`swoosh2-${animationKey}`}
                    r="4"
                    fill="#FFFFFF"
                    filter="url(#glow)"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.7, 0],
                      cx: [40, 260, 400, 480],
                      cy: [250, 230, 210, 210],
                    }}
                    transition={{
                      duration: 1.2,
                      delay: 0.1,
                      ease: "easeInOut",
                    }}
                  />
                </>
              )}
              {/* Next recommended topics - only on hover */}
              {isHovered && (
                <motion.g
                  key={`recommendations-${animationKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <rect
                    x="550"
                    y="230"
                    width="150"
                    height="70"
                    rx="6"
                    fill="#00000070"
                  />
                  <text
                    x="440"
                    y="138"
                    fontSize="11"
                    fill="#FFFFFF"
                    textAnchor="start"
                    fontWeight="bold"
                  >
                    RL Recommends Next:
                  </text>
                  {["Self-Attention Mechanisms", "Multi-Head Attention"].map(
                    (topic, i) => (
                      <motion.g key={`topic-${i}`}>
                        <text
                          x="445"
                          y={158 + i * 16}
                          fontSize="10"
                          fill="#B1CBFA"
                          textAnchor="start"
                        >
                          {topic}
                        </text>
                        <Target
                          x="430"
                          y={150 + i * 16}
                          width="10"
                          height="10"
                          color="#A7A4FF"
                        />
                      </motion.g>
                    )
                  )}
                </motion.g>
              )}
              {/* User journey stats */}
              {isHovered && (
                <motion.g
                  key={`stats-${animationKey}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <rect
                    x="100"
                    y="360"
                    width="400"
                    height="30"
                    rx="15"
                    fill="#00000080"
                  />
                  <text
                    x="120"
                    y="379"
                    fontSize="10"
                    fill="#DFE2FE"
                    textAnchor="start"
                  >
                    <tspan>Current Session:</tspan>
                    <tspan fill="#FFFFFF" dx="5">
                      2025-03-05 15:15:44
                    </tspan>
                    <tspan dx="20">•</tspan>
                    <tspan dx="10">Learning Velocity:</tspan>
                    <tspan fill="#A7A4FF" dx="5" fontWeight="bold">
                      Excellent
                    </tspan>
                    <tspan dx="20">•</tspan>
                    <tspan dx="10">Mastery Index:</tspan>
                    <tspan fill="#FFFFFF" dx="5">
                      78/100
                    </tspan>
                  </text>
                </motion.g>
              )}
              {/* Live adaptive indicator - only on hover */}
              {isHovered && (
                <motion.circle
                  cx="30"
                  cy="30"
                  r="10"
                  fill="#7874F2"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
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
                <span className="text-[#B1CBFA]">Optimized for User</span>
              ) : (
                <span>
                  Your journey is{" "}
                  <span className="text-white font-medium">75%</span> complete
                </span>
              )}
            </motion.div>

            {isHovered && (
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
              </motion.div>
            )}
          </div>

          <div className="w-10 h-10 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
            <ArrowUpRight className="h-5 w-5 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningPaths;