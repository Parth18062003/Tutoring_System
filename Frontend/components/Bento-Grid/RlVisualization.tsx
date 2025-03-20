import { ArrowUpRight, Brain } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

const RlVisualization = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [animationKey, setAnimationKey] = useState<number>(0);

  const isMounted = useRef<boolean>(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    if (isHovered && isMounted.current) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [isHovered]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl bg-black/20 border border-white/10 p-6 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
          <Brain className="w-3.5 h-3.5 mr-1" />
          RL Models
        </div>
        <h3 className="text-lg font-bold text-white">Neural RL Architecture</h3>
      </div>

      <div className="mt-4 h-[180px] w-full relative">
        {/* SVG Neural Network Animation */}
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
              animate={{
                opacity: 1,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{
                opacity: { duration: 0.5, delay: i * 0.1 },
                scale: { duration: 0.3 },
              }}
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
              animate={{
                opacity: 1,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{
                opacity: { duration: 0.5, delay: 0.4 + i * 0.1 },
                scale: { duration: 0.3 },
              }}
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
              animate={{
                opacity: 1,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{
                opacity: { duration: 0.5, delay: 0.7 + i * 0.1 },
                scale: { duration: 0.3 },
              }}
            />
          ))}

          {/* Static Connections Layer 1 to 2 */}
          {[40, 80, 120, 160].map((fromCy, i) =>
            [60, 100, 140].map((toCy, j) => (
              <path
                key={`base-c1-${i}-${j}`}
                d={`M60,${fromCy} L150,${toCy}`}
                stroke="#7874F2"
                strokeOpacity="0.3"
                strokeWidth="1"
              />
            ))
          )}

          {/* Static Connections Layer 2 to 3 */}
          {[60, 100, 140].map((fromCy, i) =>
            [80, 120].map((toCy, j) => (
              <path
                key={`base-c2-${i}-${j}`}
                d={`M150,${fromCy} L240,${toCy}`}
                stroke="#7874F2"
                strokeOpacity="0.3"
                strokeWidth="1"
              />
            ))
          )}

          {/* Animated Flow Connections Layer 1 to 2 */}
          {isHovered &&
            [40, 80, 120, 160].map((fromCy, i) =>
              [60, 100, 140].map((toCy, j) => (
                <motion.path
                  key={`${animationKey}-flow-c1-${i}-${j}`}
                  d={`M60,${fromCy} L150,${toCy}`}
                  stroke="#A7A4FF"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 + i * 0.05 + j * 0.03,
                    ease: "easeOut",
                  }}
                />
              ))
            )}

          {/* Animated Flow Connections Layer 2 to 3 */}
          {isHovered &&
            [60, 100, 140].map((fromCy, i) =>
              [80, 120].map((toCy, j) => (
                <motion.path
                  key={`${animationKey}-flow-c2-${i}-${j}`}
                  d={`M150,${fromCy} L240,${toCy}`}
                  stroke="#A7A4FF"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + i * 0.05 + j * 0.03, // Delayed to start after first layer connections
                    ease: "easeOut",
                  }}
                />
              ))
            )}

          {/* Bright Flash for Active Neurons */}
          {isHovered &&
            [40, 80, 120, 160].map((cy, i) => (
              <motion.circle
                key={`${animationKey}-flash-l1-${i}`}
                cx="60"
                cy={cy}
                r="12"
                fill="rgba(167, 164, 255, 0)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0.8, 1.3, 1],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.1 + i * 0.05,
                  times: [0, 0.2, 1],
                }}
              />
            ))}

          {/* Layer 2 Neuron Activation */}
          {isHovered &&
            [60, 100, 140].map((cy, i) => (
              <motion.circle
                key={`${animationKey}-flash-l2-${i}`}
                cx="150"
                cy={cy}
                r="12"
                fill="rgba(167, 164, 255, 0)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0.8, 1.3, 1],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.4 + i * 0.05,
                  times: [0, 0.2, 1],
                }}
              />
            ))}

          {/* Layer 3 Neuron Activation */}
          {isHovered &&
            [80, 120].map((cy, i) => (
              <motion.circle
                key={`${animationKey}-flash-l3-${i}`}
                cx="240"
                cy={cy}
                r="12"
                fill="rgba(167, 164, 255, 0)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0.8, 1.3, 1],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.7 + i * 0.05,
                  times: [0, 0.2, 1],
                }}
              />
            ))}

          {/* Data Pulses */}
{/*           {[40, 80, 120, 160].map((cy, i) => (
            <motion.circle
              key={`pulse-${i}`}
              cx="60"
              cy={cy}
              r={isHovered ? "4" : "3"}
              fill={isHovered ? "#FFFFFF" : "#DFE2FE"}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                cx: ["60", "150", "240"],
                cy: [
                  cy.toString(),
                  (i % 2 === 0 ? "80" : "120").toString(),
                  (i % 2 === 0 ? "80" : "120").toString(),
                ],
                filter: isHovered
                  ? "drop-shadow(0 0 5px rgba(177, 203, 250, 0.8))"
                  : "none",
              }}
              transition={{
                duration: isHovered ? 1.5 : 2,
                delay: 2 + i * 0.3,
                repeat: Infinity,
                repeatDelay: isHovered ? i * 0.3 + 0.5 : i * 0.5 + 1,
              }}
            />
          ))} */}

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
              <stop offset="0%" stopColor={isHovered ? "#D6E5FF" : "#B1CBFA"} />
              <stop
                offset="100%"
                stopColor={isHovered ? "#9490FF" : "#7874F2"}
              />
            </radialGradient>

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </motion.svg>
      </div>

      <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
        <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
      </div>
    </motion.div>
  );
};

export default RlVisualization;