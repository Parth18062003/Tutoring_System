import { ArrowUpRight, Zap } from 'lucide-react'
import React from 'react'
import { motion } from 'motion/react'

const AdaptiveQuiz = () => {
  return (
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
      <h3 className="text-lg font-bold text-white">
        Dynamic Assessment
      </h3>
      <p className="text-sm text-slate-300">
        Questions that adapt in real-time to your responses and learning
        progress.
      </p>
    </div>

    <div className="mt-4 relative h-[110px] bg-white/5 rounded-lg p-3 border border-white/10">
      <div className="text-xs text-[#B1CBFA] mb-2">
        Next question difficulty:
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400">Easy</div>
        <div className="text-xs text-slate-400">Hard</div>
      </div>

      <div className="mt-1 h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#B1CBFA] to-[#7874F2]"
          initial={{ width: "20%" }}
          animate={{ width: "65%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
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
  )
}

export default AdaptiveQuiz