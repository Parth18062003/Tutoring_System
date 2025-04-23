"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, LineChart, Target, ArrowBigUpDash, Headset } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const startLearning = () => {
    router.push('/learning');
  }
  return (
    <div className="mt-28 mb-12 md:mt-0 flex flex-col justify-center items-center min-h-screen w-full overflow-hidden">
            <div
              className="absolute -right-[0%] top-[10%] h-[300px] w-[400px] rounded-full bg-[#B1CBFA]/40 blur-[80px] animate-blob-slow overflow-x-hidden"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="absolute right-[30%] bottom-[10%] h-[250px] w-[150px] rounded-full bg-[#7874F2]/30 blur-[70px] animate-blob-fast overflow-x-hidden"
              style={{ animationDelay: "4s" }}
            ></div>
            <div
              className="absolute right-[20%] bottom-[20%] h-[180px] w-[100px] rounded-full bg-[#DFE2FE]/50 blur-[60px] animate-blob-medium overflow-x-hidden"
              style={{ animationDelay: "3s" }}
            ></div>

            {/* Improved Grid Pattern */}
            <div
              className="absolute inset-0 h-full w-full"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(223, 226, 254, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(142, 152, 245, 0.1) 0.5px, transparent 0.5px)`,
                backgroundSize: "12rem 10rem",
              }}
            >
              <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-zinc-950 bg-zinc-50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            </div>

            {/* Static randomly highlighted grid cells */}
            <div className="absolute inset-0 h-full w-full overflow-hidden">
              <div
                className="absolute w-[12rem] h-[10rem]"
                style={{
                  left: "12rem",
                  top: "30rem",
                  backgroundImage:
                    "linear-gradient(270deg, #8E98F5, rgba(172, 170, 250, 0))",
                  opacity: 0.09,
                }}
              ></div>

              <div
                className="absolute w-[12rem] h-[10rem]"
                style={{
                  left: "36rem",
                  top: "10rem",
                  backgroundImage:
                    "linear-gradient(-45deg, #acaafa, rgba(223, 226, 254, 0))",
                  opacity: 0.1,
                }}
              ></div>
            </div>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#DFE2FE]/5 via-transparent to-[#7874F2]/10 overflow-x-hidden"></div>

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent h-px w-3/5 mx-auto"></div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-sm h-2 w-3/5 mx-auto"></div>            <div
              className="absolute -right-[0%] top-[10%] h-[300px] w-[400px] rounded-full bg-[#B1CBFA]/40 blur-[80px] animate-blob-slow overflow-x-hidden"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="absolute right-[30%] bottom-[10%] h-[250px] w-[150px] rounded-full bg-[#7874F2]/30 blur-[70px] animate-blob-fast overflow-x-hidden"
              style={{ animationDelay: "4s" }}
            ></div>
            <div
              className="absolute right-[20%] bottom-[20%] h-[180px] w-[100px] rounded-full bg-[#DFE2FE]/50 blur-[60px] animate-blob-medium overflow-x-hidden"
              style={{ animationDelay: "3s" }}
            ></div>

            {/* Improved Grid Pattern */}
            <div
              className="absolute inset-0 h-full w-full"
              style={{
                backgroundImage:
                  resolvedTheme === "dark"
                    ? ` 
                linear-gradient(to right, rgba(13, 16, 14, 0.8) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(142, 152, 245, 0.1) 0.5px, transparent 0.5px)`
                    : `linear-gradient(to right, rgba(223, 226, 254, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(142, 152, 245, 0.1) 0.5px, transparent 0.5px)`,
                backgroundSize: "12rem 10rem",
              }}
            >
              <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-zinc-950 bg-zinc-50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            </div>

            {/* Static randomly highlighted grid cells */}
            <div className="absolute inset-0 h-full w-full overflow-hidden">
              <div
                className="absolute w-[12rem] h-[10rem]"
                style={{
                  left: "12rem",
                  top: "30rem",
                  backgroundImage:
                    "linear-gradient(270deg, #8E98F5, rgba(172, 170, 250, 0))",
                  opacity: 0.09,
                }}
              ></div>

              <div
                className="absolute w-[12rem] h-[10rem]"
                style={{
                  left: "36rem",
                  top: "10rem",
                  backgroundImage:
                    "linear-gradient(-45deg, #acaafa, rgba(223, 226, 254, 0))",
                  opacity: 0.1,
                }}
              ></div>
            </div>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#DFE2FE]/5 via-transparent to-[#7874F2]/10 overflow-x-hidden"></div>

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent h-px w-3/5 mx-auto"></div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-sm h-2 w-3/5 mx-auto"></div>
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
            <span className="bg-gradient-to-t from-[#3D52A0] to-[#7091E6] text-transparent bg-clip-text">Brain Wave</span>
          </motion.h1>

          {/* Subtitle with typing animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl md:text-2xl font-medium text-zinc-700 dark:text-zinc-300">
              Adaptive Intelligent Tutoring System that <TypingEffect />
            </h2>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-zinc-600 dark:text-zinc-300 mb-10 max-w-2xl"
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
            <button className="px-8 py-3 rounded-lg bg-[#7091e6] text-white font-medium hover:bg-[#5a7dd9] transition-colors shadow-lg shadow-[#7091e6]/20" onClick={startLearning}>
              Start Learning
            </button>
            <button className="px-8 py-3 rounded-lg border border-[#7091e6]/30 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-[#7091e6]/10 transition-colors" >
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
              { value: "3.2x", label: "Learning Speed", icon: <ArrowBigUpDash className="w-5 h-5 text-[#7091e6]" /> },
              { value: "42%", label: "Test Score Improvement", icon: <LineChart className="w-5 h-5 text-[#7091e6]" /> },
              { value: "24/7", label: "Learning Support", icon: <Headset className="w-5 h-5 text-[#7091e6]" /> },
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
                <p className="text-sm text-zinc-600">{stat.label}</p>
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