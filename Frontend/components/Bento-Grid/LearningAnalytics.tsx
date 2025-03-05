import { ArrowUpRight, LineChart } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

const LearningAnalytics = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Reset animation when hover state changes
  useEffect(() => {
    if (isHovered) {
      setAnimationKey(prev => prev + 1);
    }
  }, [isHovered]);
  
  // Define the chart data
  const barData = [
    { week: 0, value: 40, color: "#DFE2FE" },
    { week: 1, value: 70, color: "#B1CBFA" },
    { week: 2, value: 85, color: "#8E98F5" },
    { week: 3, value: 50, color: "#7874F2" },
    { week: 4, value: 85, color: "#8E98F5" },
    { week: 5, value: 100, color: "#B1CBFA" },
  ];

  const lineData = [
    { x: 52, y: 120 },
    { x: 100, y: 90 },
    { x: 148, y: 60 },
    { x: 196, y: 100 },
    { x: 244, y: 70 },
    { x: 292, y: 50 },
  ];

  const linePath = "M52 120 L100 90 L148 60 L196 100 L244 70 L292 50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative overflow-hidden rounded-3xl bg-black/20 border border-white/10 p-6 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
          <LineChart className="w-3.5 h-3.5 mr-1" />
          Analytics
        </div>
        <h3 className="text-lg font-bold text-white">Learning Insights</h3>
      </div>

      <div className="mt-4 h-[180px] w-full relative">
        {/* SVG Analytics Animation */}
        <motion.svg
          className="w-full h-full"
          viewBox="0 0 300 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            scale: isHovered ? 1.03 : 1
          }}
          transition={{
            scale: { duration: 0.4, ease: "easeOut" }
          }}
        >
          {/* Background Grid with Animation */}
          <motion.rect 
            width="300" 
            height="180" 
            fill={isHovered ? "#10101F" : "#00000020"} 
            rx="4" 
            transition={{ duration: 0.3 }}
          />

          {/* Grid Lines with Animation */}
          {[30, 60, 90, 120, 150].map((y, i) => (
            <motion.line
              key={`gridline-${i}`}
              x1="40"
              y1={y}
              x2="280"
              y2={y}
              stroke="#B1CBFA"
              strokeOpacity={isHovered ? "0.2" : "0.1"}
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          ))}

          {[40, 88, 136, 184, 232, 280].map((x, i) => (
            <motion.line
              key={`gridline-v-${i}`}
              x1={x}
              y1="30"
              x2={x}
              y2="150"
              stroke="#B1CBFA"
              strokeOpacity={isHovered ? "0.2" : "0.1"}
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          ))}

          {/* Axes */}
          <motion.line
            x1="40"
            y1="30"
            x2="40"
            y2="150"
            stroke="#B1CBFA"
            strokeOpacity={isHovered ? "0.7" : "0.5"}
            strokeWidth={isHovered ? "1.5" : "1"}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.line
            x1="40"
            y1="150"
            x2="280"
            y2="150"
            stroke="#B1CBFA"
            strokeOpacity={isHovered ? "0.7" : "0.5"}
            strokeWidth={isHovered ? "1.5" : "1"}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {/* Y-axis Labels with Animation */}
          {[
            { y: 40, text: "100%" },
            { y: 80, text: "75%" },
            { y: 120, text: "50%" },
            { y: 150, text: "25%" }
          ].map((item, i) => (
            <motion.text 
              key={`y-label-${i}`}
              x="30" 
              y={item.y} 
              fill="#B1CBFA" 
              fontSize={isHovered ? "9" : "8"} 
              textAnchor="end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
            >
              {item.text}
            </motion.text>
          ))}

          {/* X-axis Ticks and Labels */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <React.Fragment key={`tick-${i}`}>
              <motion.line
                x1={40 + i * 48}
                y1="150"
                x2={40 + i * 48}
                y2="153"
                stroke="#B1CBFA"
                strokeOpacity={isHovered ? "0.7" : "0.5"}
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              />
              <motion.text
                x={40 + i * 48}
                y="165"
                fill={isHovered && barData[i].value === Math.max(...barData.map(item => item.value)) ? "#FFFFFF" : "#B1CBFA"}
                fontSize={isHovered ? "9" : "8"}
                fontWeight={isHovered ? "bold" : "normal"}
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
              >
                Week {i + 1}
              </motion.text>
            </React.Fragment>
          ))}

          {/* Bar Chart with Hover Animation */}
          {barData.map((item, i) => (
            <motion.rect
              key={`bar-${i}`}
              x={48 + item.week * 48}
              y={0}
              width={isHovered ? "26" : "24"}
              rx="3"
              fill={item.color}
              fillOpacity={isHovered && item.value === Math.max(...barData.map(d => d.value)) ? "0.9" : "0.6"}
              initial={{ height: 0, y: 150 }}
              animate={{ 
                height: isHovered ? item.value * 1.05 : item.value, 
                y: isHovered ? 150 - (item.value * 1.05) : 150 - item.value,
                filter: isHovered ? "drop-shadow(0 0 3px rgba(120, 116, 242, 0.5))" : "none"
              }}
              transition={{ 
                height: { duration: 0.8, delay: 0.3 + i * 0.1 },
                y: { duration: 0.8, delay: 0.3 + i * 0.1 },
                filter: { duration: 0.3 }
              }}
              whileHover={{ 
                y: 150 - (item.value * 1.1),
                height: item.value * 1.1,
                fillOpacity: 0.9
              }}
            />
          ))}

          {/* Line Chart with Animation */}
          <motion.path
            d={linePath}
            stroke={isHovered ? "#A7A4FF" : "#7874F2"}
            strokeWidth={isHovered ? "2.5" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter={isHovered ? "drop-shadow(0 0 4px rgba(120, 116, 242, 0.7))" : "none"}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
          />

          {/* Animated Path Tracer (only on hover) */}
          {isHovered && (
            <motion.path
              key={`tracer-${animationKey}`}
              d={linePath}
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#glowLine)"
              initial={{ pathLength: 0, pathOffset: 0 }}
              animate={{ pathLength: 0.3, pathOffset: [0, 0.7] }}
              transition={{ 
                duration: 1.5, 
                pathOffset: { delay: 0.2, ease: "easeInOut" }
              }}
            />
          )}

          {/* Data points with Animation */}
          {lineData.map((point, i) => (
            <motion.circle
              key={`point-${i}`}
              cx={point.x}
              cy={point.y}
              r={isHovered ? "5" : "4"}
              fill={isHovered ? "#D6E5FF" : "#B1CBFA"}
              stroke={isHovered ? "#9490FF" : "#7874F2"}
              strokeWidth={isHovered ? "1.5" : "1"}
              filter={isHovered ? "url(#glowPoint)" : "none"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 1 + i * 0.1 }}
              whileHover={{ scale: 1.5 }}
            />
          ))}

          {/* Animated tooltip with enhanced visibility on hover */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              y: isHovered ? -5 : 0
            }}
            transition={{ delay: 2, y: { duration: 0.3 } }}
          >
            <rect
              x="230"
              y="40"
              width="60"
              height="25"
              fill={isHovered ? "#2A2B4D" : "#00000060"}
              rx="4"
              filter={isHovered ? "drop-shadow(0 0 5px rgba(120, 116, 242, 0.3))" : "none"}
            />
            <text 
              x="240" 
              y="55" 
              fill={isHovered ? "#FFFFFF" : "#DFE2FE"} 
              fontSize={isHovered ? "9" : "8"}
              fontWeight={isHovered ? "bold" : "normal"}
            >
              +25% growth
            </text>
            <line
              x1="244"
              y1="70"
              x2="244"
              y2="40"
              stroke={isHovered ? "#9490FF" : "#B1CBFA"}
              strokeDasharray={isHovered ? "3 2" : "2 2"}
              strokeWidth={isHovered ? "1.5" : "1"}
            />
          </motion.g>

          {/* Additional callout on hover */}
          {isHovered && (
            <motion.g
              key={`callout-${animationKey}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <rect
                x="100"
                y="75"
                width="70"
                height="25"
                fill="#2A2B4D"
                rx="4"
                filter="drop-shadow(0 0 5px rgba(120, 116, 242, 0.3))"
              />
              <text
                x="110"
                y="90"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="bold"
              >
                Peak progress
              </text>
              <line
                x1="148"
                y1="75"
                x2="148"
                y2="60"
                stroke="#9490FF"
                strokeDasharray="3 2"
                strokeWidth="1.5"
              />
            </motion.g>
          )}

          {/* Graphical elements filter definitions */}
          <defs>
            <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowPoint" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="blur" />
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

export default LearningAnalytics;