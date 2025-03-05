"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Code, LineChart, Lightbulb } from 'lucide-react';

export default function AITechnology() {
  const currentDate = "2025-03-05 17:17:39";
  const currentUser = "Parth18062003";
  
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-[#DFE2FE]/20">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-3 py-1 mb-4 space-x-2 border rounded-full border-[#7091e6]/20 bg-white backdrop-blur-sm shadow-sm">
            <BrainCircuit className="w-4 h-4 text-[#7091e6]" />
            <span className="text-sm font-medium text-[#7091e6]">
              AI Technology
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-[#7091e6] to-[#9eb5ef]">
            The Science Behind Brain Wave
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-slate-600 text-lg">
            Discover how our advanced AI technologies work together to create your personalized learning experience
          </p>
        </motion.div>
        
        <div className="relative">
          <div className="max-w-5xl mx-auto">
            {/* Central Brain Visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative mb-16 flex justify-center"
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 rounded-full bg-[#7091e6]/20 blur-3xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="100%" height="100%" viewBox="0 0 200 200">
                    <defs>
                      <radialGradient id="brainGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#7091e6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#9eb5ef" stopOpacity="0.4" />
                      </radialGradient>
                    </defs>
                    <circle cx="100" cy="100" r="80" fill="url(#brainGradient)" />
                    
                                        {/* Neural network connections */}
                                        {[...Array(20)].map((_, i) => {
                      const angle1 = Math.random() * Math.PI * 2;
                      const angle2 = Math.random() * Math.PI * 2;
                      const r1 = 40 + Math.random() * 30;
                      const r2 = 40 + Math.random() * 30;
                      
                      const x1 = 100 + r1 * Math.cos(angle1);
                      const y1 = 100 + r1 * Math.sin(angle1);
                      const x2 = 100 + r2 * Math.cos(angle2);
                      const y2 = 100 + r2 * Math.sin(angle2);
                      
                      return (
                        <g key={i}>
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#7091e6"
                            strokeWidth="0.5"
                            strokeOpacity="0.3"
                          />
                          <circle cx={x1} cy={y1} r="2" fill="#7091e6" />
                          <circle cx={x2} cy={y2} r="2" fill="#7091e6" />
                        </g>
                      );
                    })}
                    
                    {/* Central brain icon */}
                    <circle cx="100" cy="100" r="25" fill="white" />
                    <path
                      d="M110 88c-1.5-1.2-3.2-2-5-2.4V84c0-2.2-1.8-4-4-4h-2c-2.2 0-4 1.8-4 4v1.6c-1.8 0.4-3.5 1.2-5 2.4-1.8 1.5-3 3.7-3 6.2 0 1.2 0.3 2.4 0.8 3.4-0.5 1-0.8 2.1-0.8 3.4 0 1.9 0.7 3.5 1.9 4.8-0.3 0.9-0.5 1.9-0.5 3 0 2.4 0.9 4.5 2.5 6.1 0.2 0.2 0.3 0.3 0.5 0.4V120h16v-4.6c0.2-0.1 0.3-0.3 0.5-0.4 1.5-1.6 2.5-3.7 2.5-6.1 0-1.1-0.2-2.1-0.5-3 1.1-1.3 1.9-3 1.9-4.8 0-1.2-0.3-2.4-0.8-3.4 0.5-1 0.8-2.1 0.8-3.4 0-2.6-1.2-4.8-3-6.2zM100 92c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm-4 20h8v-2h-8v2zm8-8c0 2.2-1.8 4-4 4s-4-1.8-4-4h8z"
                      fill="#7091e6"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
            
            {/* Technology pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Cognitive Mapping",
                  icon: <BrainCircuit className="w-6 h-6 text-white" />,
                  description: "Our system creates a detailed cognitive map of your learning style, strengths, and knowledge gaps through continuous assessment and behavioral analysis.",
                  features: ["Neural pattern recognition", "Knowledge graph modeling", "Multi-dimensional learning profiles"],
                  color: "from-[#7091e6] to-[#9eb5ef]"
                },
                {
                  title: "Adaptive Algorithms",
                  icon: <Code className="w-6 h-6 text-white" />,
                  description: "Proprietary algorithms dynamically adjust content difficulty, pacing, and teaching methods in real-time based on your interactions and performance.",
                  features: ["Reinforcement learning", "Bayesian knowledge tracing", "Multi-armed bandit optimization"],
                  color: "from-[#6a80ce] to-[#8da4dd]"
                },
                {
                  title: "Learning Analytics",
                  icon: <LineChart className="w-6 h-6 text-white" />,
                  description: "Advanced analytics provide deep insights into your learning patterns, helping both you and your instructors understand and optimize your educational journey.",
                  features: ["Predictive performance modeling", "Learning curve analytics", "Intervention effectiveness tracking"],
                  color: "from-[#5570bb] to-[#7c93ca]"
                }
              ].map((pillar, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg border border-[#DFE2FE]"
                >
                  <div className={`bg-gradient-to-r ${pillar.color} p-6`}>
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4">
                      {pillar.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-white/90">
                      {pillar.description}
                    </p>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {pillar.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-[#7091e6]" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Technical specs section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 bg-gradient-to-r from-[#7091e6]/10 to-[#9eb5ef]/10 rounded-2xl p-8 border border-[#DFE2FE]"
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">
                Technical Specifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-[#7091e6] mb-3">MODEL ARCHITECTURE</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Model Type</span>
                      <span className="font-medium text-slate-800">Hybrid transformer-based neural network</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Parameters</span>
                      <span className="font-medium text-slate-800">4.2 billion</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Training Data</span>
                      <span className="font-medium text-slate-800">180M+ learning interactions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Latency</span>
                      <span className="font-medium text-slate-800">&lt;100ms response time</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-[#7091e6] mb-3">SYSTEM CAPABILITIES</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Supported Languages</span>
                      <span className="font-medium text-slate-800">42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Content Formats</span>
                      <span className="font-medium text-slate-800">Text, video, interactive, AR/VR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Integration APIs</span>
                      <span className="font-medium text-slate-800">REST, GraphQL, LTI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Compliance</span>
                      <span className="font-medium text-slate-800">FERPA, GDPR, COPPA</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-slate-600 mb-4">
                  Our AI technology is continuously evolving through ongoing research and development.
                </p>
                <a href="#" className="text-[#7091e6] font-medium hover:text-[#5a7dd9] transition-colors">
                  Download Technical White Paper →
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="mt-10 text-center text-xs text-slate-400">
          Last updated: {currentDate} • Personalized for {currentUser}
        </div>
      </div>
    </section>
  );
}