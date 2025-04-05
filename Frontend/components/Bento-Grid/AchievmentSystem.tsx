import { ArrowUpRight, Trophy } from 'lucide-react'
import React from 'react'
import { motion } from 'motion/react'

const AchievmentSystem = () => {
  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.8 }}
    className="relative col-span-1 md:col-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-[#DFE2FE]/10 to-[#7874F2]/20 dark:from-[#2C2A8D]/90 dark:to-[#2F4782]/90 border border-white/10 p-6 group"
  >
    <div className="space-y-2">
      <div className="inline-flex items-center rounded-full bg-[#7874F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#B1CBFA]">
        <Trophy className="w-3.5 h-3.5 mr-1" />
        Gamification
      </div>
      <h3 className="text-lg font-bold text-white">
        Achievement System
      </h3>
      <p className="text-sm text-slate-300 max-w-2xl">
        Earn rewards and track your learning journey with AI-powered
        achievement recommendations.
      </p>
    </div>

    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        {
          name: "Quick Learner",
          icon: "🚀",
          desc: "Complete 5 lessons in one day",
          progress: 100,
          earned: true,
        },
        {
          name: "Deep Thinker",
          icon: "🧠",
          desc: "Solve 10 complex problems",
          progress: 70,
          earned: false,
        },
        {
          name: "Consistent Scholar",
          icon: "📚",
          desc: "Study for 7 consecutive days",
          progress: 85,
          earned: false,
        },
        {
          name: "Math Wizard",
          icon: "✨",
          desc: "Master all calculus concepts",
          progress: 40,
          earned: false,
        },
      ].map((achievement, i) => (
        <motion.div
          key={achievement.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
          className={`bg-black/30 rounded-xl p-4 border ${
            achievement.earned
              ? "border-[#8E98F5]/50"
              : "border-white/10"
          } relative overflow-hidden group/card`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`text-2xl mb-2 ${
                achievement.earned ? "animate-bounce-subtle" : ""
              }`}
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {achievement.icon}
            </div>
            <div className="text-sm font-medium text-white mb-1">
              {achievement.name}
            </div>
            <div className="text-xs text-slate-400 mb-3">
              {achievement.desc}
            </div>

            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  achievement.earned
                    ? "bg-gradient-to-r from-[#B1CBFA] to-[#7874F2]"
                    : "bg-[#8E98F5]/50"
                }`}
                initial={{ width: "0%" }}
                animate={{ width: `${achievement.progress}%` }}
                transition={{ duration: 1, delay: 1.2 + i * 0.1 }}
              />
            </div>

            {achievement.earned && (
              <>
                <div className="mt-2 text-xs text-[#B1CBFA]">
                  Achieved!
                </div>
                {/* Celebration particles */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-[#DFE2FE]"
                      initial={{
                        x: "50%",
                        y: "50%",
                        opacity: 0,
                      }}
                      animate={{
                        x: `${50 + (Math.random() * 100 - 50)}%`,
                        y: `${50 + (Math.random() * 100 - 50)}%`,
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: Math.random() * 0.5,
                        repeat: Infinity,
                        repeatDelay: Math.random() + 1,
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
      <div className="w-8 h-8 rounded-full bg-[#8E98F5]/20 flex items-center justify-center group-hover:bg-[#8E98F5]/30 transition-colors duration-300">
        <ArrowUpRight className="h-4 w-4 text-[#B1CBFA] group-hover:text-white transition-colors duration-300" />
      </div>
    </div>
  </motion.div>
  )
}

export default AchievmentSystem