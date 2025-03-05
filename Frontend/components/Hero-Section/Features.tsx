"use client";

import { BrainCircuit } from "lucide-react";
import LearningPaths from "../Bento-Grid/LearningPaths";
import RlVisualization from "../Bento-Grid/RlVisualization";
import LearningAnalytics from "../Bento-Grid/LearningAnalytics";
import ProgressTracking from "../Bento-Grid/ProgressTracking";
import AdaptiveQuiz from "../Bento-Grid/AdaptiveQuiz";
import UserProfile from "../Bento-Grid/UserProfile";
import KnowledgeGraph from "../Bento-Grid/KnowledgeGraph";
import AchievmentSystem from "../Bento-Grid/AchievmentSystem";
import Nlp from "../Bento-Grid/Nlp";

export default function BentoGrid() {
  return (
    <>
      <div className="absolute inset-x-0 -mt-11 flex items-end">
        <div className="mr-[calc(-1*(theme(spacing.8)-theme(spacing[1.5])))] h-11 flex-auto bg-slate-950"></div>
        <div className="flex justify-between mx-auto w-full px-6 sm:max-w-[40rem] md:max-w-[48rem] md:px-8 lg:max-w-[64rem] xl:max-w-[80rem]">
          <svg
            viewBox="0 0 56 48"
            aria-hidden="true"
            className="-ml-1.5 mb-[calc(-1/16*1rem)] w-14 flex-none overflow-visible fill-slate-950"
          >
            <path d="M 2.686 3 H -4 V 48 H 56 V 47 H 53.314 A 8 8 0 0 1 47.657 44.657 L 8.343 5.343 A 8 8 0 0 0 2.686 3 Z"></path>
          </svg>
          <svg
            viewBox="0 0 56 48"
            aria-hidden="true"
            className="-mr-1.5 mb-[calc(-1/16*1rem)] w-14 flex-none overflow-visible fill-slate-950"
          >
            <path d="M 53.314 3 H 60 V 48 H 0 V 47 H 2.686 A 8 8 0 0 0 8.343 44.657 L 47.657 5.343 A 8 8 0 0 1 53.314 3 Z"></path>
          </svg>
        </div>
        <div className="ml-[calc(-1*(theme(spacing.8)-theme(spacing[1.5])))] h-11 flex-auto bg-slate-950"></div>
      </div>
      <section className="w-full py-12 md:p-24 lg:p-32 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container px-4 mx-auto md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="h-14 w-14 p-1 -translate-y-6 md:-translate-y-14 rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-950 mx-auto relative">
                <div className="bg-indigo-500/10 rounded-lg h-full w-full relative z-20 flex justify-center items-center overflow-hidden text-white">
                  <BrainCircuit />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-indigo-500/70 opacity-20 rounded-full blur-lg h-4 w-full mx-auto z-30"></div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent h-px w-3/5 mx-auto"></div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-sm h-2 w-3/5 mx-auto"></div>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                Adaptive Intelligent Tutoring System
              </h2>
              <p className="max-w-[700px] text-slate-300 md:text-xl/relaxed">
                Personalized learning experiences optimized with reinforcement
                learning and large language models.
              </p>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12">
            {/* Hero Cell - Spans 2 columns and 2 rows */}
            <LearningPaths />

            {/* RL Model Visualization */}
            <RlVisualization />
            {/* Learning Analytics */}
            <LearningAnalytics />

            {/* NLP & Content Understanding */}
            <Nlp />

            {/* Progress Tracking */}
            <ProgressTracking />

            {/* Adaptive Quiz System */}
            <AdaptiveQuiz />

            {/* User Profile */}
            <UserProfile />

            {/* Knowledge Graph - Replacing the Code Integration Cell */}
            <KnowledgeGraph />
            {/* Achievement System */}
            <AchievmentSystem />
          </div>
        </div>
      </section>
      <div className="mx-auto w-full px-6 sm:max-w-[40rem] md:max-w-[48rem] md:px-8 lg:max-w-[64rem] xl:max-w-[80rem]">
        <div className="relative -mx-2.5 flex -bottom-1 -mt-10">
          <svg
            viewBox="0 0 64 48"
            className="w-16 flex-none fill-zinc-100"
            aria-hidden="true"
          >
            <path d="M51.657 2.343 12.343 41.657A8 8 0 0 1 6.686 44H0v4h64V0h-6.686a8 8 0 0 0-5.657 2.343Z"></path>
          </svg>
          <div className="-mx-px flex-auto bg-zinc-100"></div>
          <svg
            viewBox="0 0 64 48"
            className="w-16 flex-none fill-zinc-100"
            aria-hidden="true"
          >
            <path d="m12.343 2.343 39.314 39.314A8 8 0 0 0 57.314 44H64v4H0V0h6.686a8 8 0 0 1 5.657 2.343Z"></path>
          </svg>
        </div>
      </div>
    </>
  );
}
