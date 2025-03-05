"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, ChevronDown, LineChart, Book, Target } from 'lucide-react';

const Hero = () => {
  return (
    <div className="mt-28 mb-12 md:mt-0 flex flex-col justify-center items-center min-h-screen w-full overflow-hidden">

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Brand badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 hidden md:inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-[#7091e6]/30"
          >
            <BrainCircuit className="h-4 w-4 mr-2 text-[#7091e6]" />
            <span className="text-sm font-medium text-[#7091e6]">
              AI-Powered Learning
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold mb-6"
          >
            <span className="text-[#7091e6]">Brain Wave</span>
          </motion.h1>

          {/* Subtitle with typing animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl md:text-2xl font-medium text-slate-700">
              Adaptive Intelligent Tutoring System that <TypingEffect />
            </h2>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-slate-600 mb-10 max-w-2xl"
          >
            Our AI-powered tutoring platform creates personalized learning experiences
            that adapt in real-time to your unique cognitive patterns, knowledge gaps,
            and preferred learning style.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <button className="px-8 py-3 rounded-lg bg-[#7091e6] text-white font-medium hover:bg-[#5a7dd9] transition-colors shadow-lg shadow-[#7091e6]/20">
              Start Learning
            </button>
            <button className="px-8 py-3 rounded-lg border border-[#7091e6]/30 text-slate-700 font-medium hover:bg-[#7091e6]/10 transition-colors">
              View Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "96%", label: "Student Satisfaction", icon: <Target className="w-5 h-5 text-[#7091e6]" /> },
              { value: "3.2x", label: "Learning Speed", icon: <LineChart className="w-5 h-5 text-[#7091e6]" /> },
              { value: "42%", label: "Test Score Improvement", icon: <Book className="w-5 h-5 text-[#7091e6]" /> },
              { value: "24/7", label: "Learning Support", icon: <BrainCircuit className="w-5 h-5 text-[#7091e6]" /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-[#7091e6]/10">
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-[#7091e6]">{stat.value}</p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Typing effect component
const TypingEffect = () => {
  const phrases = [
    "evolves with you.",
    "understands your pace.",
    "identifies knowledge gaps.",
    "adapts to your style.",
    "learns how you learn.",
  ];

  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [currentCharacter, setCurrentCharacter] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting && currentCharacter === phrases[currentPhrase].length) {
        // Pause at the end of typing
        setTimeout(() => setIsDeleting(true), 1200);
        return;
      } else if (isDeleting && currentCharacter === 0) {
        // Move to next phrase
        setIsDeleting(false);
        setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        return;
      }

      setCurrentCharacter((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentCharacter, currentPhrase, isDeleting]);

  return (
    <span className="text-[#7091e6] font-semibold inline-block min-w-[280px] text-left">
      {phrases[currentPhrase].substring(0, currentCharacter)}
      <span className="border-r-2 border-[#7091e6] ml-1 animate-blink">&nbsp;</span>
    </span>
  );
};

export default Hero;