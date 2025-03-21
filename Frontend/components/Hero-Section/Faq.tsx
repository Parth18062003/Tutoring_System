"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Lightbulb,
  Puzzle,
  Blocks,
  Zap,
  Bot,
} from "lucide-react";

export default function Faq() {

  // FAQ categories
  const categories = [
    {
      id: "general",
      label: "General",
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      id: "technical",
      label: "Technical",
      icon: <BrainCircuit className="w-4 h-4" />,
    },
    {
      id: "curriculum",
      label: "Curriculum",
      icon: <Puzzle className="w-4 h-4" />,
    },
    { id: "ai", label: "AI Features", icon: <Bot className="w-4 h-4" /> },
  ];

  // FAQ data
  const faqData = [
    {
      category: "general",
      items: [
        {
          question:
            "How does the adaptive tutoring system personalize my learning experience?",
          answer:
            "Our Adaptive Intelligent Tutoring System uses machine learning algorithms to analyze your learning patterns, strengths, and areas for improvement. It continuously adjusts content difficulty, pacing, and teaching methods based on your interactions and performance. The system creates a unique learning path tailored specifically to your learning style, knowledge gaps, and educational goals.",
        },
        {
          question: "Is my learning data private and secure?",
          answer:
            "Absolutely. We prioritize data privacy and security. All personal information and learning data are encrypted and stored securely. We adhere to strict privacy policies and never share your data with third parties without consent. You can review and manage your data preferences at any time through your account settings.",
        },
        {
          question: "Can I access the tutoring system on multiple devices?",
          answer:
            "Yes! Our system is designed to be fully responsive and accessible across multiple devices. Your learning progress synchronizes automatically, allowing you to seamlessly switch between your computer, tablet, and smartphone. This flexibility ensures you can continue your learning journey whenever and wherever it's convenient for you.",
        },
      ],
    },
    {
      category: "technical",
      items: [
        {
          question:
            "What are the system requirements for running the tutoring software?",
          answer:
            "Our tutoring system is web-based and works on most modern devices. For optimal performance, we recommend using Chrome, Firefox, Safari, or Edge browsers (updated to the latest version). The system requires a stable internet connection and at least 4GB of RAM. For mobile devices, iOS 14+ or Android 10+ is recommended. No additional software installation is needed.",
        },
        {
          question:
            "How do I troubleshoot connection issues during a learning session?",
          answer:
            "If you experience connection issues, first check your internet connection and refresh the page. Clear your browser cache or try using an incognito/private browsing window. If problems persist, try switching to a different browser or device. Our system also has an offline mode that synchronizes once you're back online. For continued issues, contact our technical support team through the Help Center.",
        },
        {
          question:
            "Can I integrate the tutoring system with my school's learning management system (LMS)?",
          answer:
            "Yes, we offer integration capabilities with major LMS platforms including Canvas, Blackboard, Moodle, and Google Classroom. Our API allows for seamless data exchange between systems. For institutional customers, we provide dedicated integration support to ensure proper setup with your existing educational infrastructure. Contact our integration specialists for assistance with custom implementations.",
        },
      ],
    },
    {
      category: "curriculum",
      items: [
        {
          question:
            "What subjects and academic levels are covered by the tutoring system?",
          answer:
            "Our system covers a comprehensive range of subjects including Mathematics (Algebra, Calculus, Statistics), Sciences (Physics, Chemistry, Biology), Computer Science, Languages, Humanities, and test preparation for standardized exams. We support learning from elementary school through university level, with specialized content for professional certifications. Our curriculum is regularly updated to align with current educational standards.",
        },
        {
          question: "How frequently is the educational content updated?",
          answer:
            "We update our content continuously through our dynamic curriculum management system. Core subject materials are reviewed quarterly by educational experts, while emerging topics and current events are integrated in real-time. Our AI also identifies and flags content that may need revision based on learner interactions. All updates are seamlessly implemented without disrupting your learning progress.",
        },
        {
          question:
            "Can I suggest new topics or content to be added to the system?",
          answer:
            "Absolutely! We encourage learner input to expand our curriculum. You can submit content suggestions through the 'Request Content' feature in your dashboard. Our content team reviews all suggestions, and popular requests are prioritized for development. Many of our specialized modules began as user suggestions. We also have a beta program where you can help test and refine new educational content before its public release.",
        },
      ],
    },
    {
      category: "ai",
      items: [
        {
          question:
            "How does the AI determine when I'm struggling with a concept?",
          answer:
            "Our AI analyzes multiple data points to identify comprehension challenges. These include response time patterns, error frequency, hesitation behaviors, answer changes, and your interaction patterns with learning materials. The system also employs natural language processing to analyze written responses for misconceptions. When struggling patterns are detected, the AI automatically adjusts the teaching approach, provides alternative explanations, or breaks concepts into smaller, more digestible components.",
        },
        {
          question:
            "Can the AI tutor understand and respond to my specific questions?",
          answer:
            "Yes, our AI tutor utilizes advanced natural language processing and domain-specific knowledge models to understand and respond to your questions. It can provide contextual explanations, work through problems step-by-step, and adapt its communication style to match your learning preferences. For complex questions, the system draws on its extensive knowledge base and can generate visual aids, analogies, or interactive demonstrations to support comprehension.",
        },
        {
          question:
            "How does reinforcement learning improve my educational experience over time?",
          answer:
            "Reinforcement learning allows our system to optimize teaching strategies based on what works best for you. As you interact with the platform, the AI experiments with different instructional approaches, explanation styles, and practice formats. It then reinforces methods that lead to better learning outcomes for your specific needs. This creates a continuously improving, personalized education experience that becomes more effective the more you use it.",
        },
      ],
    },
  ];

  const [activeCategory, setActiveCategory] = useState("general");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (questionId: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-[#DFE2FE]/30 dark:from-zinc-950 dark:to-[#DFE2FE]/5">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Decorative elements */}
        <div className="relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#B1CBFA]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 bottom-0 w-64 h-64 bg-[#7091E6]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16 relative z-10"
        >
          <div className="inline-flex items-center px-3 py-1 mb-4 space-x-2 border rounded-full border-[#7091E6]/20 bg-white dark:bg-zinc-800/40 backdrop-blur-sm shadow-sm">
            <span className="text-sm font-medium text-[#7091E6]">
              Frequently Asked Questions
            </span>
            <BrainCircuit className="w-4 h-4 text-[#7091E6]" />
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-t from-[#3D52A0] dark:from-[#b3cdff] to-[#7091E6]">
            Have Questions? We Have Answers
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-zinc-700 dark:text-zinc-300 text-lg">
            Everything you need to know about our Adaptive Intelligent Tutoring
            System
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categories.map((category, i) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
              className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition-all ${
                activeCategory === category.id
                  ? "bg-[#7091E6] dark:bg-[#3D52A0] text-white shadow-md"
                  : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 hover:border-[#7091E6]/50 hover:bg-[#DFE2FE]/20"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.icon}
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-md border border-[#DFE2FE] overflow-hidden relative z-10">
            {faqData
              .find((category) => category.category === activeCategory)
              ?.items.map((item, index) => {
                const questionId = `${activeCategory}-q${index}`;
                const isOpen = openItems[questionId] || false;

                return (
                  <div
                    key={questionId}
                    className={`border-b border-[#DFE2FE] last:border-0 ${
                      isOpen ? "bg-zinc-50 dark:bg-zinc-900/10" : "bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <button
                      className="w-full px-6 py-5 flex justify-between items-center text-left transition-colors hover:bg-zinc-800/5 dark:hover:bg-zinc-800/90"
                      onClick={() => toggleItem(questionId)}
                    >
                      <h3 className="font-medium text-zinc-800 dark:text-zinc-200 pr-10">
                        {item.question}
                      </h3>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#7091E6] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#8E98F5] flex-shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 text-zinc-600 dark:text-zinc-300 bg-gradient-to-r from-[#DFE2FE]/5 to-transparent">
                            <p>{item.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
          </div>
        </motion.div>

        {/* Still have questions section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center relative z-10"
        >
          <div className="p-8 max-w-2xl mx-auto rounded-2xl bg-gradient-to-r from-[#7091E6]/5 to-[#B1CBFA]/10 dark:from-zinc-800/80 dark:to-zinc-800/30 border border-[#fedfdf]">
            <div className="inline-flex justify-center items-center w-12 h-12 mb-4 rounded-full bg-[#DFE2FE] text-[#7091E6]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Still have questions?
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 mb-6">
              Our support team is ready to help with any specific questions you
              might have about our platform.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button className="px-5 py-2.5 font-medium text-white rounded-lg bg-gradient-to-r from-[#7091E6] to-[#3D52A0] hover:shadow-md transition-shadow flex items-center gap-2">
                <Blocks className="w-4 h-4" />
                Schedule Demo
              </button>
              <button className="px-5 py-2.5 font-medium border border-zinc-200 rounded-lg text-zinc-800 dark:text-zinc-200 hover:border-[#7091E6]/50 hover:bg-[#DFE2FE]/20 dark:hover:bg-[#3D52A0]/40 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}