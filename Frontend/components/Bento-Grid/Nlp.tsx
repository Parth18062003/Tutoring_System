import { ArrowUpRight, MessagesSquare, Brain, Code2, Zap } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

const Nlp = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Reset animation when hover state changes
  useEffect(() => {
    if (isHovered) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [isHovered]);

  // Sample student responses with analysis
  const responses = [
    "I think photosynthesis converts sunlight to energy",
    "Plants use CO2 and release oxygen during photosynthesis",
    "Photosynthesis happens in the chloroplast of plant cells",
  ];

  const currentResponse = responses[animationKey % responses.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#7874F2]/20 to-[#DFE2FE]/5 dark:from-[#2C2A8D]/90 dark:to-[#2F4782]/90 border border-white/10 p-6 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      
    >
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
            <MessagesSquare className="w-3.5 h-3.5 mr-1" />
            LLM-Powered NLP
          </div>
          <h3 className="text-lg font-bold text-white">
            Adaptive Understanding
          </h3>
          <p className="text-sm text-slate-300">
            Real-time analysis of conceptual understanding with personalized
            feedback guided by reinforcement learning.
          </p>
        </div>

        <div className="mt-2 relative h-[120px]">
          {/* SVG Language Processing Visualization */}
          <motion.svg
            className="w-full h-full"
            viewBox="0 0 300 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{
              scale: isHovered ? 1.03 : 1,
            }}
            transition={{
              scale: { duration: 0.4, ease: "easeOut" },
            }}
          >
            {/* Background grid */}
            {isHovered && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ duration: 0.5 }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="0"
                    y1={i * 10}
                    x2="300"
                    y2={i * 10}
                    stroke="#8E98F5"
                    strokeWidth="0.5"
                  />
                ))}
                {Array.from({ length: 30 }, (_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={i * 10}
                    y1="0"
                    x2={i * 10}
                    y2="120"
                    stroke="#8E98F5"
                    strokeWidth="0.5"
                  />
                ))}
              </motion.g>
            )}

            {/* Student Response */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.rect
                x="10"
                y="10"
                width="180"
                height="36"
                rx="18"
                fill="#DFE2FE"
                fillOpacity={isHovered ? "0.15" : "0.1"}
                filter={isHovered ? "url(#glow)" : ""}
                whileHover={{ scale: 1.02 }}
              />
              <motion.text
                x="20"
                y="30"
                fill="#DFE2FE"
                fontSize="11"
                key={`response-${animationKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                "{currentResponse.substring(0, 30)}
                {currentResponse.length > 30 ? "..." : ""}"
              </motion.text>

              {/* Analysis Results */}
              <motion.rect
                x="10"
                y="80"
                width="180"
                height="36"
                rx="18"
                fill="#7874F2"
                fillOpacity={isHovered ? "0.2" : "0.15"}
                filter={isHovered ? "url(#glow)" : ""}
                whileHover={{ scale: 1.02 }}
              />
              <motion.g
                key={`analysis-${animationKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <text x="20" y="96" fontSize="9" fill="#B1CBFA">
                  Conceptual: 92% | Misconception: 8%
                </text>
                <text x="20" y="106" fontSize="9" fill="#B1CBFA">
                  Knowledge Gap: Chlorophyll Function
                </text>
              </motion.g>
            </motion.g>

            {/* LLM NLP Processing Visualization */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {/* Neural Network Representation */}
              {Array.from({ length: 3 }).map((_, layer) =>
                Array.from({ length: 5 }).map((_, node) => (
                  <motion.circle
                    key={`node-${layer}-${node}`}
                    cx={210 + layer * 30}
                    cy={20 + node * 20}
                    r={isHovered ? "4" : "3"}
                    fill={
                      layer === 0
                        ? "#8E98F5"
                        : layer === 1
                        ? "#7874F2"
                        : "#B1CBFA"
                    }
                    filter={isHovered ? "url(#nodeGlow)" : ""}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + layer * 0.1 + node * 0.05 }}
                  />
                ))
              )}

              {/* NLP-LLM Labels */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <rect
                  x="195"
                  y="3"
                  width="30"
                  height="14"
                  rx="7"
                  fill="#00000040"
                />
                <text
                  x="210"
                  y="12"
                  fontSize="7"
                  fill="#B1CBFA"
                  textAnchor="middle"
                >
                  NLP
                </text>

                <rect
                  x="230"
                  y="3"
                  width="30"
                  height="14"
                  rx="7"
                  fill="#00000040"
                />
                <text
                  x="245"
                  y="12"
                  fontSize="7"
                  fill="#B1CBFA"
                  textAnchor="middle"
                >
                  LLM
                </text>

                <rect
                  x="265"
                  y="3"
                  width="30"
                  height="14"
                  rx="7"
                  fill="#00000040"
                />
                <text
                  x="280"
                  y="12"
                  fontSize="7"
                  fill="#B1CBFA"
                  textAnchor="middle"
                >
                  RL
                </text>
              </motion.g>
            </motion.g>

            {/* Neural Connections */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 0.7 : 0.5 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              {Array.from({ length: 2 }).map((_, layer) =>
                Array.from({ length: 5 }).map((_, nodeFrom) =>
                  Array.from({ length: 5 }).map((_, nodeTo) => (
                    <motion.line
                      key={`connection-${layer}-${nodeFrom}-${nodeTo}`}
                      x1={210 + layer * 30}
                      y1={20 + nodeFrom * 20}
                      x2={210 + (layer + 1) * 30}
                      y2={20 + nodeTo * 20}
                      stroke={isHovered ? "#B1CBFA" : "#8E98F5"}
                      strokeWidth="0.7"
                      strokeOpacity={isHovered ? "0.4" : "0.3"}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        delay:
                          1.3 + layer * 0.1 + Math.min(nodeFrom, nodeTo) * 0.03,
                        duration: 0.5,
                      }}
                    />
                  ))
                )
              )}
            </motion.g>

            {/* Data flow animation */}
            {isHovered && (
              <motion.g key={`data-flow-${animationKey}`}>
                <motion.path
                  d="M190 28 C205 28, 200 28, 210 28"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{ pathLength: 1, pathOffset: [0, 1] }}
                  transition={{ duration: 0.8, repeat: 1, repeatDelay: 0.3 }}
                />
                <motion.path
                  d="M240 28 C255 28, 250 28, 270 28"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{ pathLength: 1, pathOffset: [0, 1] }}
                  transition={{
                    duration: 0.8,
                    delay: 0.8,
                    repeat: 1,
                    repeatDelay: 0.3,
                  }}
                />
                <motion.path
                  d="M270 50 C270 65, 270 80, 190 98"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{ pathLength: 1, pathOffset: [0, 1] }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                />
              </motion.g>
            )}

            {/* Regular data pulse animation */}
            {!isHovered && (
              <motion.circle
                cx="100"
                cy="30"
                r="4"
                fill="#7874F2"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  cx: ["100", "250", "190"],
                  cy: ["30", "60", "98"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
            )}

            {/* RL Feedback Loop */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0.7 }}
              transition={{ delay: 1.8, duration: 0.5 }}
            >
              <motion.path
                d="M270 100 C290 100, 290 70, 270 70"
                stroke={isHovered ? "#A7A4FF" : "#7874F2"}
                strokeWidth="1.5"
                fill="none"
                strokeDasharray={isHovered ? "" : "3 3"}
                filter={isHovered ? "url(#glow)" : ""}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
              />

              {/* Arrow for RL loop */}
              <motion.path
                d="M270 70 L265 67 L265 73 Z"
                fill={isHovered ? "#A7A4FF" : "#7874F2"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.8, duration: 0.3 }}
              />

              {isHovered && (
                <motion.text
                  x="290"
                  y="85"
                  fontSize="8"
                  fill="#A7A4FF"
                  textAnchor="middle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.8, duration: 0.3 }}
                >
                  RL Loop
                </motion.text>
              )}
            </motion.g>

            {/* Adaptive Personalization Indicator */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.3, duration: 0.5 }}
            >
              <rect
                x="240"
                y="90"
                width="60"
                height={isHovered ? "25" : "20"}
                rx="4"
                fill="#7874F2"
                fillOpacity={isHovered ? "0.4" : "0.3"}
                filter={isHovered ? "url(#glow)" : ""}
              />
              <text
                x="270"
                y={isHovered ? "100" : "99"}
                fontSize={isHovered ? "10" : "9"}
                fill="white"
                textAnchor="middle"
              >
                Personalizing
              </text>
            </motion.g>

            {/* Interactive icons on hover */}
            {isHovered && (
              <motion.g
                key={`icons-${animationKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <motion.g transform="translate(200, 40) scale(0.5)">
                  <circle cx="0" cy="0" r="12" fill="#00000060" />
                  <Brain x="-6" y="-6" width="12" height="12" color="#B1CBFA" />
                </motion.g>
                <motion.g transform="translate(230, 40) scale(0.5)">
                  <circle cx="0" cy="0" r="12" fill="#00000060" />
                  <Code2 x="-6" y="-6" width="12" height="12" color="#B1CBFA" />
                </motion.g>
                <motion.g transform="translate(260, 40) scale(0.5)">
                  <circle cx="0" cy="0" r="12" fill="#00000060" />
                  <Zap x="-6" y="-6" width="12" height="12" color="#B1CBFA" />
                </motion.g>
              </motion.g>
            )}

            {/* Concept tagging */}
            {isHovered && (
              <motion.g
                key={`concept-tags-${animationKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <rect
                  x="25"
                  y="50"
                  width="40"
                  height="14"
                  rx="7"
                  fill="#00000040"
                />
                <text
                  x="45"
                  y="59"
                  fontSize="7"
                  fill="#DFE2FE"
                  textAnchor="middle"
                >
                  photosynthesis
                </text>

                <rect
                  x="70"
                  y="50"
                  width="35"
                  height="14"
                  rx="7"
                  fill="#00000040"
                />
                <text
                  x="87.5"
                  y="59"
                  fontSize="7"
                  fill="#DFE2FE"
                  textAnchor="middle"
                >
                  chloroplast
                </text>

                <rect
                  x="110"
                  y="50"
                  width="30"
                  height="14"
                  rx="7"
                  fill="#00000040"
                />
                <text
                  x="125"
                  y="59"
                  fontSize="7"
                  fill="#DFE2FE"
                  textAnchor="middle"
                >
                  energy
                </text>

                <rect
                  x="145"
                  y="50"
                  width="30"
                  height="14"
                  rx="7"
                  fill="#00000040"
                />
                <text
                  x="160"
                  y="59"
                  fontSize="7"
                  fill="#DFE2FE"
                  textAnchor="middle"
                >
                  CO₂
                </text>
              </motion.g>
            )}

            {/* Defs for filters and gradients */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter
                id="nodeGlow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="textFade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0.8" stopColor="white" stopOpacity="1" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>

        <div className="mt-4 flex justify-between items-center">
          {/* Adaptive Learning Indicators */}
          <div className="flex items-center">
            {/* Animated typing indicator */}
            <div className="flex items-center space-x-1 mr-3">
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

            {/* Adaptive Learning Status */}
            <motion.div
              className="text-xs text-[#B1CBFA]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.5 }}
            >
              {isHovered
                ? "Generating next question..."
                : "Analyzing response..."}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
        <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
      </div>
    </motion.div>
  );
};

export default Nlp;
