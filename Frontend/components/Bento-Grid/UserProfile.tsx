import { ArrowUpRight, Fingerprint, Users2 } from 'lucide-react'
import React from 'react'
import { motion } from 'motion/react'

const UserProfile = () => {
  return (
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
      <h3 className="text-lg font-bold text-white">
        Cognitive Profile
      </h3>
    </div>

    <div className="mt-4 space-y-4">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-[#DFE2FE]/20 flex items-center justify-center mr-3">
          <Users2 className="h-4 w-4 text-[#DFE2FE]" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">
            Parth18062003
          </div>
          <div className="text-xs text-slate-400">Advanced Learner</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/20 rounded-lg p-2">
          <div className="text-xs text-slate-400 mb-1">
            Learning Style
          </div>
          <div className="text-sm font-medium text-white">
            Visual-Spatial
          </div>

          <motion.div
            className="mt-1 h-1 bg-[#B1CBFA]/50 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "75%" }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
        </div>
        <div className="bg-black/20 rounded-lg p-2">
          <div className="text-xs text-slate-400 mb-1">Pacing</div>
          <div className="text-sm font-medium text-white">
            Accelerated
          </div>
          <motion.div
            className="mt-1 h-1 bg-[#7874F2]/50 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "90%" }}
            transition={{ duration: 0.8, delay: 0.9 }}
          />
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-2 relative overflow-hidden">
        <div className="text-xs text-slate-400 mb-1">
          AI Tutor Match
        </div>
        <div className="text-sm font-medium text-white">
          Professor Quantum
        </div>
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
                  x: Math.sin((i * 45 * Math.PI) / 180) * 15,
                  y: Math.cos((i * 45 * Math.PI) / 180) * 15,
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
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
  )
}

export default UserProfile