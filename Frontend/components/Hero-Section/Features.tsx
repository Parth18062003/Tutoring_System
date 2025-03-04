"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Brain, BrainCircuit, ChartLine, Code2, Fingerprint, LineChart, MessagesSquare, Sparkles, Trophy, Users2, Zap } from "lucide-react";

// Current user and date information
const CURRENT_USER = "Parth18062003";
const CURRENT_DATE = "2025-03-04 17:55:31";

export default function BentoGrid() {
  // Ref for the lottie animation
  const learningAnalyticsRef = useRef<HTMLDivElement>(null);
  const rlModelRef = useRef<HTMLDivElement>(null);
  
/*   useEffect(() => {
    // Add Lottie animations once component is mounted
    import("lottie-web").then((lottie) => {
      if (learningAnalyticsRef.current) {
        const anim = lottie.default.loadAnimation({
          container: learningAnalyticsRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: '/animations/data-analysis.json', // You'll need to add these files
        });
        
        return () => anim.destroy();
      }
    });
    
    import("lottie-web").then((lottie) => {
      if (rlModelRef.current) {
        const anim = lottie.default.loadAnimation({
          container: rlModelRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: '/animations/brain-network.json', // You'll need to add these files
        });
        
        return () => anim.destroy();
      }
    });
  }, []); */
  
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container px-4 md:px-6">
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
              Personalized learning experiences optimized with reinforcement learning and large language models.
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
                <h3 className="text-xl md:text-2xl font-bold text-white">Personalized Learning Paths</h3>
                <p className="text-sm md:text-base text-slate-300">
                  Our system adapts in real-time to your learning style, pace, and knowledge gaps, creating a truly personalized educational journey.
                </p>
              </div>
              
              <div className="mt-6 relative h-[200px] md:h-[280px] w-full overflow-hidden rounded-xl">
                {/* Abstract animated mesh gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#DFE2FE]/20 via-[#B1CBFA]/20 to-[#7874F2]/40 rounded-xl overflow-hidden">
                  <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8E98F5]/40 via-transparent to-transparent blur-xl opacity-70 animate-pulse-slow"></div>
                  
                  {/* Animated particles */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute rounded-full bg-white"
                        style={{
                          width: `${Math.random() * 4 + 2}px`,
                          height: `${Math.random() * 4 + 2}px`,
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          opacity: Math.random() * 0.5 + 0.3,
                          animation: `floatParticle ${Math.random() * 10 + 15}s linear infinite`,
                          animationDelay: `${Math.random() * 5}s`
                        }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#B1CBFA" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#7874F2" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    <g className="animate-pulse-slow" style={{ animationDelay: "1s" }}>
                      <path d="M50,50 Q150,20 250,150" stroke="url(#lineGradient)" strokeWidth="1" fill="none" />
                      <path d="M100,200 Q200,100 300,250" stroke="url(#lineGradient)" strokeWidth="1" fill="none" />
                      <path d="M200,50 Q100,150 300,180" stroke="url(#lineGradient)" strokeWidth="1" fill="none" />
                    </g>
                  </svg>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="max-w-[80%] max-h-[80%] relative z-10">
                    <Image
                      src="/images/adaptive-paths.png" // You'll need to add this image
                      alt="Personalized Learning Paths"
                      width={500}
                      height={400}
                      className="object-contain rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <div className="text-xs text-slate-400">Updated: {CURRENT_DATE}</div>
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
              <h3 className="text-lg font-bold text-white">Neural RL Architecture</h3>
            </div>
            
            <div ref={rlModelRef} className="mt-4 h-[180px] w-full"></div>
            
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
              <h3 className="text-lg font-bold text-white">Learning Insights</h3>
            </div>
            
            <div ref={learningAnalyticsRef} className="mt-4 h-[180px] w-full"></div>
            
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
                <h3 className="text-lg font-bold text-white">Language Understanding</h3>
                <p className="text-sm text-slate-300">
                  Advanced NLP algorithms analyze student responses for conceptual understanding beyond keywords.
                </p>
              </div>
              
              <div className="mt-4 relative">
                {/* Animated typing indicator */}
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-[#B1CBFA] animate-pulse-fast"></div>
                  <div className="w-2 h-2 rounded-full bg-[#8E98F5] animate-pulse-fast" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#7874F2] animate-pulse-fast" style={{ animationDelay: "0.4s" }}></div>
                </div>
                
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
                  <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
            </div>
            
            {/* Abstract code animation */}
            <div className="absolute -right-2 bottom-16 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <pre className="text-[8px] text-[#DFE2FE] font-mono overflow-hidden">
                <code className="animate-scrollText">
                  {`function analyzeResponse(text) {\n  const embedding = encoder.encode(text);\n  const concepts = model.extractConcepts(embedding);\n  return {\n    understanding: concepts.map(c => c.confidence),\n    misconceptions: concepts.filter(c => c.contradicts)\n  };\n}`}
                </code>
              </pre>
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
                <h3 className="text-lg font-bold text-white">Skill Mastery Tracking</h3>
              </div>
              
              <div className="mt-4 grid grid-cols-4 gap-3">
                {['Algebra', 'Calculus', 'Statistics', 'Probability'].map((subject, i) => (
                  <div key={subject} className="relative">
                    <div className="text-xs text-slate-300 mb-1">{subject}</div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#B1CBFA] to-[#7874F2] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(i + 1) * 20}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
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
                            initial={{ opacity: 0, points: "0,0 0,0 0,0 0,0 0,0 0,0" }}
                            animate={{ 
                              opacity: 0.7, 
                              points: "0,-60 40.6,-25 50.6,30 0,50 -45.6,25 -30.6,-45"
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
                              x2={70 * Math.sin(angle * Math.PI / 180)} 
                              y2={-70 * Math.cos(angle * Math.PI / 180)}
                              stroke="#B1CBFA" 
                              strokeWidth="0.5" 
                            />
                          ))}
                          
                          {/* Data points - pulsing */}
                          {[
                            [0, -60], [40.6, -25], [50.6, 30],
                            [0, 50], [-45.6, 25], [-30.6, -45]
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
                          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#B1CBFA" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#7874F2" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium text-white mt-2">Concept Mastery Map</div>
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
                          animate={{ height: `${20 + Math.sin(i * 0.9) * 15 + Math.random() * 70}px` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.05, ease: "easeOut" }}
                        />
                      ))}
                    </div>
                    
                    {/* Line overlay */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 160">
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
                          cy: [100, 90, 85, 70, 60, 50]
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
                  
                  <div className="text-sm font-medium text-white mt-2">Learning Progress Trend</div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-xs text-slate-400">Updated: 2025-03-04 17:58:24</div>
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
              <h3 className="text-lg font-bold text-white">Dynamic Assessment</h3>
              <p className="text-sm text-slate-300">
                Questions that adapt in real-time to your responses and learning progress.
              </p>
            </div>
            
            <div className="mt-4 relative h-[110px] bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-[#B1CBFA] mb-2">Next question difficulty:</div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">Easy</div>
                <div className="text-xs text-slate-400">Hard</div>
              </div>
              
              <div className="mt-1 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#B1CBFA] to-[#7874F2]"
                  initial={{ width: "20%" }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
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
              <h3 className="text-lg font-bold text-white">Cognitive Profile</h3>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#DFE2FE]/20 flex items-center justify-center mr-3">
                  <Users2 className="h-4 w-4 text-[#DFE2FE]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Parth18062003</div>
                  <div className="text-xs text-slate-400">Advanced Learner</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/20 rounded-lg p-2">
                  <div className="text-xs text-slate-400 mb-1">Learning Style</div>
                  <div className="text-sm font-medium text-white">Visual-Spatial</div>
                  
                  <motion.div 
                    className="mt-1 h-1 bg-[#B1CBFA]/50 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  />
                </div>
                <div className="bg-black/20 rounded-lg p-2">
                  <div className="text-xs text-slate-400 mb-1">Pacing</div>
                  <div className="text-sm font-medium text-white">Accelerated</div>
                  <motion.div 
                    className="mt-1 h-1 bg-[#7874F2]/50 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  />
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-2 relative overflow-hidden">
                <div className="text-xs text-slate-400 mb-1">AI Tutor Match</div>
                <div className="text-sm font-medium text-white">Professor Quantum</div>
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
                          x: Math.sin(i * 45 * Math.PI/180) * 15,
                          y: Math.cos(i * 45 * Math.PI/180) * 15,
                          opacity: [0.2, 0.8, 0.2],
                          scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.2
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
              <h3 className="text-lg font-bold text-white">Achievement System</h3>
              <p className="text-sm text-slate-300 max-w-2xl">
                Earn rewards and track your learning journey with AI-powered achievement recommendations.
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  name: "Quick Learner", 
                  icon: "🚀", 
                  desc: "Complete 5 lessons in one day",
                  progress: 100,
                  earned: true 
                },
                { 
                  name: "Deep Thinker", 
                  icon: "🧠", 
                  desc: "Solve 10 complex problems",
                  progress: 70,
                  earned: false 
                },
                { 
                  name: "Consistent Scholar", 
                  icon: "📚", 
                  desc: "Study for 7 consecutive days",
                  progress: 85,
                  earned: false 
                },
                { 
                  name: "Math Wizard", 
                  icon: "✨", 
                  desc: "Master all calculus concepts",
                  progress: 40,
                  earned: false 
                }
              ].map((achievement, i) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                  className={`bg-black/30 rounded-xl p-4 border ${achievement.earned ? 'border-[#8E98F5]/50' : 'border-white/10'} relative overflow-hidden group/card`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`text-2xl mb-2 ${achievement.earned ? 'animate-bounce-subtle' : ''}`} style={{ animationDelay: `${i * 0.2}s` }}>
                      {achievement.icon}
                    </div>
                    <div className="text-sm font-medium text-white mb-1">{achievement.name}</div>
                    <div className="text-xs text-slate-400 mb-3">{achievement.desc}</div>
                    
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${achievement.earned ? 'bg-gradient-to-r from-[#B1CBFA] to-[#7874F2]' : 'bg-[#8E98F5]/50'}`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${achievement.progress}%` }}
                        transition={{ duration: 1, delay: 1.2 + i * 0.1 }}
                      />
                    </div>
                    
                    {achievement.earned && (
                      <>
                        <div className="mt-2 text-xs text-[#B1CBFA]">Achieved!</div>
                        {/* Celebration particles */}
                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 rounded-full bg-[#DFE2FE]"
                              initial={{ 
                                x: "50%", 
                                y: "50%",
                                opacity: 0 
                              }}
                              animate={{ 
                                x: `${50 + (Math.random() * 100 - 50)}%`,
                                y: `${50 + (Math.random() * 100 - 50)}%`,
                                opacity: [0, 1, 0]
                              }}
                              transition={{
                                duration: 1.5,
                                delay: Math.random() * 0.5,
                                repeat: Infinity,
                                repeatDelay: Math.random() + 1
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
              <div className="text-xs text-slate-400">Updated: 2025-03-04 18:01:20</div>
              <div className="w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
                <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}