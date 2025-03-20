import { ArrowUpRight, ChartLine } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from 'motion/react'

const ProgressTracking = () => {
  const [isHovered, setIsHovered] = useState(false);
  return (
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
          <div 
      className="relative h-[160px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Radar Chart - Animated with SVG */}
        <motion.svg 
          width="160" 
          height="160" 
          viewBox="0 0 160 160"
          animate={{
            scale: isHovered ? 1.1 : 1,
            filter: isHovered ? "drop-shadow(0 0 8px rgba(120, 116, 242, 0.6))" : "none"
          }}
          transition={{
            scale: { duration: 0.4, ease: "easeOut" },
            filter: { duration: 0.4 }
          }}
        >
          <g transform="translate(80,80)">
            {/* Background polygons */}
            <motion.polygon
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isHovered ? 0.2 : 0.1,
                stroke: isHovered ? "#9490FF" : "#B1CBFA"
              }}
              transition={{ duration: 0.5 }}
              points="0,-70 60.6,-35 60.6,35 0,70 -60.6,35 -60.6,-35"
              fill="none"
              strokeWidth={isHovered ? "1" : "0.5"}
            />
            <motion.polygon
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isHovered ? 0.2 : 0.1,
                stroke: isHovered ? "#9490FF" : "#B1CBFA"
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              points="0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25"
              fill="none"
              strokeWidth={isHovered ? "1" : "0.5"}
            />
            <motion.polygon
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isHovered ? 0.2 : 0.1,
                stroke: isHovered ? "#9490FF" : "#B1CBFA"
              }}
              transition={{ duration: 0.5, delay: 0.4 }}
              points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15"
              fill="none"
              strokeWidth={isHovered ? "1" : "0.5"}
            />

            {/* Data polygon - animated */}
            <motion.polygon
              initial={{
                opacity: 0,
                points: "0,0 0,0 0,0 0,0 0,0 0,0",
              }}
              animate={{
                opacity: isHovered ? 0.6 : 0.5,
                points: "0,-60 40.6,-25 50.6,30 0,50 -45.6,25 -30.6,-45",
                stroke: isHovered ? "#A7A4FF" : "#7874F2",
                filter: isHovered ? "url(#glowFilter)" : "none"
              }}
              transition={{ duration: 0.4 }}
              fill="url(#radarGradient)"
              strokeWidth={isHovered ? "3" : "2"}
            />

            {/* Axis lines */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.line
                key={angle}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isHovered ? 0.4 : 0.3,
                  stroke: isHovered ? "#9490FF" : "#B1CBFA"
                }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                x1="0"
                y1="0"
                x2={70 * Math.sin((angle * Math.PI) / 180)}
                y2={-70 * Math.cos((angle * Math.PI) / 180)}
                strokeWidth={isHovered ? "1" : "0.5"}
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
                animate={{ 
                  r: isHovered ? 4 : 3,
                  fill: isHovered ? "#A7A4FF" : "#7874F2",
                  filter: isHovered ? "url(#pointGlow)" : "none"
                }}
                transition={{
                  r: { duration: 0.3 },
                  fill: { duration: 0.3 }
                }}
                cx={point[0]}
                cy={point[1]}
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </g>

          {/* Gradient and filter definitions */}
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
                stopColor={isHovered ? "#D6E5FF" : "#B1CBFA"}
                stopOpacity={isHovered ? "0.4" : "0.3"}
              />
              <stop
                offset="100%"
                stopColor={isHovered ? "#9490FF" : "#7874F2"}
                stopOpacity={isHovered ? "0.2" : "0.15"}
              />
            </linearGradient>
            
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <filter id="pointGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Border effect on hover */}
          {isHovered && (
            <motion.circle
              cx="80"
              cy="80"
              r="75"
              fill="none"
              stroke="#9490FF"
              strokeWidth="1.5"
              strokeDasharray="10 5"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                rotate: 360
              }}
              transition={{
                opacity: { duration: 0.3 },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
            />
          )}
        </motion.svg>
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
  )
}

export default ProgressTracking