import { ArrowUpRight, Network } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

const KnowledgeGraph = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isHovered) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [isHovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="relative overflow-hidden rounded-3xl bg-black/20 dark:bg-black/90 border border-white/10 p-6 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      
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
        <motion.svg
          className="w-full h-full"
          viewBox="0 0 300 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{
            scale: { duration: 0.4, ease: "easeOut" },
          }}
        >
          {/* Background Grid */}
          {isHovered && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ duration: 0.5 }}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * 20}
                  x2="300"
                  y2={i * 20}
                  stroke="#8E98F5"
                  strokeWidth="0.5"
                />
              ))}
              {Array.from({ length: 16 }, (_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 20}
                  y1="0"
                  x2={i * 20}
                  y2="180"
                  stroke="#8E98F5"
                  strokeWidth="0.5"
                />
              ))}
            </motion.g>
          )}

          {/* Nodes - Main Concepts */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Center Node - Main Concept */}
            <motion.circle
              cx="150"
              cy="90"
              r={isHovered ? "14" : "12"}
              fill="url(#nodeGradientMain)"
              animate={{
                scale: isHovered ? [1, 1.1, 1] : 1,
              }}
              transition={{
                scale: {
                  duration: 1.5,
                  repeat: isHovered ? Infinity : 0,
                  repeatType: "reverse",
                },
              }}
              filter={isHovered ? "url(#glow)" : ""}
            />
            <motion.text
              x="150"
              y="93"
              fontSize={isHovered ? "9" : "8"}
              fill="white"
              textAnchor="middle"
              fontWeight={isHovered ? "bold" : "normal"}
            >
              AI
            </motion.text>
          </motion.g>

          {/* Secondary Nodes */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {[
              { x: 90, y: 50, label: "ML" },
              { x: 85, y: 130, label: "RL" },
              { x: 210, y: 40, label: "NLP" },
              { x: 220, y: 140, label: "LLM" },
            ].map((node, i) => (
              <motion.g key={`secondary-${i}`}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? "11" : "10"}
                  fill="url(#nodeGradient2)"
                  whileHover={{ scale: 1.2 }}
                  filter={isHovered ? "url(#glow)" : ""}
                />
                <motion.text
                  x={node.x}
                  y={node.y + 3}
                  fontSize={isHovered ? "8" : "7"}
                  fill="white"
                  textAnchor="middle"
                  fontWeight={isHovered ? "bold" : "normal"}
                >
                  {node.label}
                </motion.text>
              </motion.g>
            ))}
          </motion.g>

          {/* Tertiary Nodes */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {[
              { x: 40, y: 70, label: "CNN" },
              { x: 50, y: 110, label: "GAN" },
              { x: 140, y: 30, label: "SVM" },
              { x: 140, y: 150, label: "DQN" },
              { x: 260, y: 75, label: "BERT" },
              { x: 250, y: 110, label: "GPT" },
            ].map((node, i) => (
              <motion.g key={`tertiary-${i}`}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? "9" : "8"}
                  fill="url(#nodeGradient3)"
                  whileHover={{ scale: 1.2 }}
                  filter={isHovered ? "url(#smallGlow)" : ""}
                />
                <motion.text
                  x={node.x}
                  y={node.y + 3}
                  fontSize={isHovered ? "7" : "6"}
                  fill="white"
                  textAnchor="middle"
                >
                  {node.label}
                </motion.text>
              </motion.g>
            ))}
          </motion.g>

          {/* Connections - Main to Secondary */}
          {[
            { from: { x: 150, y: 90 }, to: { x: 90, y: 50 } },
            { from: { x: 150, y: 90 }, to: { x: 85, y: 130 } },
            { from: { x: 150, y: 90 }, to: { x: 210, y: 40 } },
            { from: { x: 150, y: 90 }, to: { x: 220, y: 140 } },
          ].map((connection, i) => (
            <motion.g key={`main-conn-${i}`}>
              <motion.path
                d={`M${connection.from.x} ${connection.from.y} L${connection.to.x} ${connection.to.y}`}
                stroke={
                  isHovered
                    ? "url(#connectionGradientActive)"
                    : "url(#connectionGradient)"
                }
                strokeWidth={isHovered ? "2" : "1.5"}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isHovered ? 0.8 : 0.6 }}
                transition={{ duration: 0.8, delay: 0.9 + i * 0.1 }}
              />
              {isHovered && (
                <motion.path
                  key={`flow-main-${animationKey}-${i}`}
                  d={`M${connection.from.x} ${connection.from.y} L${connection.to.x} ${connection.to.y}`}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{ pathLength: 1, pathOffset: [0, 1] }}
                  transition={{
                    pathLength: { duration: 0.1 },
                    pathOffset: { duration: 0.8, delay: 0.1 * i },
                  }}
                />
              )}
            </motion.g>
          ))}

          {/* Connections - Secondary to Tertiary */}
          {[
            { from: { x: 90, y: 50 }, to: { x: 40, y: 70 } },
            { from: { x: 90, y: 50 }, to: { x: 140, y: 30 } },
            { from: { x: 85, y: 130 }, to: { x: 50, y: 110 } },
            { from: { x: 85, y: 130 }, to: { x: 140, y: 150 } },
            { from: { x: 210, y: 40 }, to: { x: 260, y: 75 } },
            { from: { x: 220, y: 140 }, to: { x: 250, y: 110 } },
          ].map((connection, i) => (
            <motion.g key={`secondary-conn-${i}`}>
              <motion.path
                d={`M${connection.from.x} ${connection.from.y} L${connection.to.x} ${connection.to.y}`}
                stroke="#8E98F5"
                strokeWidth={isHovered ? "1.2" : "1"}
                strokeOpacity={isHovered ? "0.8" : "0.6"}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isHovered ? 0.8 : 0.6 }}
                transition={{ duration: 0.8, delay: 1.1 + i * 0.1 }}
              />
              {isHovered && (
                <motion.path
                  key={`flow-sec-${animationKey}-${i}`}
                  d={`M${connection.from.x} ${connection.from.y} L${connection.to.x} ${connection.to.y}`}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  filter="url(#smallGlow)"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{ pathLength: 1, pathOffset: [0, 1] }}
                  transition={{
                    pathLength: { duration: 0.1 },
                    pathOffset: { duration: 0.6, delay: 0.9 + 0.1 * i },
                  }}
                />
              )}
            </motion.g>
          ))}

          {/* Animated knowledge flow pulses */}
          {!isHovered &&
            [
              {
                start: { x: 150, y: 90 },
                mid: { x: 90, y: 50 },
                end: { x: 40, y: 70 },
                delay: 0,
              },
              {
                start: { x: 150, y: 90 },
                mid: { x: 85, y: 130 },
                end: { x: 140, y: 150 },
                delay: 1,
              },
              {
                start: { x: 150, y: 90 },
                mid: { x: 210, y: 40 },
                end: { x: 260, y: 75 },
                delay: 2,
              },
              {
                start: { x: 150, y: 90 },
                mid: { x: 220, y: 140 },
                end: { x: 250, y: 110 },
                delay: 3,
              },
            ].map((path, i) => (
              <motion.circle
                key={`pulse-${i}`}
                cx={path.start.x}
                cy={path.start.y}
                r="3"
                fill="#DFE2FE"
                animate={{
                  cx: [
                    path.start.x.toString(),
                    path.mid.x.toString(),
                    path.end.x.toString(),
                  ],
                  cy: [
                    path.start.y.toString(),
                    path.mid.y.toString(),
                    path.end.y.toString(),
                  ],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: path.delay,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            ))}

          {/* Gradients and Filters */}
          <defs>
            <radialGradient
              id="nodeGradientMain"
              cx="0.5"
              cy="0.5"
              r="0.5"
              fx="0.5"
              fy="0.5"
            >
              <stop offset="0%" stopColor={isHovered ? "#D6E5FF" : "#B1CBFA"} />
              <stop
                offset="100%"
                stopColor={isHovered ? "#9490FF" : "#7874F2"}
              />
            </radialGradient>

            <radialGradient
              id="nodeGradient2"
              cx="0.5"
              cy="0.5"
              r="0.5"
              fx="0.5"
              fy="0.5"
            >
              <stop offset="0%" stopColor={isHovered ? "#B1CBFA" : "#8E98F5"} />
              <stop
                offset="100%"
                stopColor={isHovered ? "#8E98F5" : "#7874F2"}
              />
            </radialGradient>

            <radialGradient
              id="nodeGradient3"
              cx="0.5"
              cy="0.5"
              r="0.5"
              fx="0.5"
              fy="0.5"
            >
              <stop offset="0%" stopColor={isHovered ? "#FFFFFF" : "#DFE2FE"} />
              <stop
                offset="100%"
                stopColor={isHovered ? "#B1CBFA" : "#8E98F5"}
              />
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

            <linearGradient
              id="connectionGradientActive"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#D6E5FF" />
              <stop offset="100%" stopColor="#9490FF" />
            </linearGradient>

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="smallGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Interactive Highlights on Hover */}
          {isHovered && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.circle
                cx="150"
                cy="90"
                r="30"
                fill="url(#nodeGradientMain)"
                opacity="0.1"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />

              {/* Connection highlights - pulsing waves */}
              {[
                { x1: 150, y1: 90, x2: 90, y2: 50 },
                { x1: 150, y1: 90, x2: 85, y2: 130 },
                { x1: 150, y1: 90, x2: 210, y2: 40 },
                { x1: 150, y1: 90, x2: 220, y2: 140 },
              ].map((line, i) => (
                <motion.path
                  key={`highlight-${i}`}
                  d={`M${line.x1} ${line.y1} Q${
                    (line.x1 + line.x2) / 2 + (i % 2 ? 15 : -15)
                  } ${(line.y1 + line.y2) / 2 + (i < 2 ? 10 : -10)} ${
                    line.x2
                  } ${line.y2}`}
                  stroke="#7874F2"
                  strokeOpacity="0.2"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            </motion.g>
          )}

          {/* Interaction Markers */}
          {isHovered && (
            <motion.g
              key={`interaction-markers-${animationKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.circle
                cx="140"
                cy="30"
                r="12"
                fill="transparent"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeDasharray="2 2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: 1,
                  repeatType: "reverse",
                }}
              />

              <motion.circle
                cx="250"
                cy="110"
                r="12"
                fill="transparent"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeDasharray="2 2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.5,
                  delay: 0.5,
                  repeat: 1,
                  repeatType: "reverse",
                }}
              />
            </motion.g>
          )}
        </motion.svg>
      </div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-black/80 px-3 py-1.5 rounded-lg">
          <p className="text-xs text-white">Explore your Knowledge Graph</p>
        </div>
      </motion.div>

      <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
        <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
      </div>
    </motion.div>
  );
};

export default KnowledgeGraph;