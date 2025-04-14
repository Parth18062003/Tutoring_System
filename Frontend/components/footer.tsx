"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  ArrowUpRight,

} from "lucide-react";
import Image from "next/image";
import logo from "@/public/brainwave.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-[#DFE2FE]/30 dark:from-zinc-950 dark:to-[#DFE2FE]/20 border-t border-[#b3baf9]">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="col-span-2 lg:col-span-2"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Image
                    src={logo}
                    alt="Logo"
                    width={40}
                    height={40}
                    className="w-8 h-8"
                  />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-t from-[#3D52A0] dark:from-[#b3cdff] to-[#7091E6]">
                  Brain Wave
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 max-w-md">
                Our AI-powered tutoring platform adapts to your unique learning
                style, providing personalized education that helps you master
                any subject at your own pace.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-[#DFE2FE] dark:border-[#DFE2FE]/20 flex items-center justify-center text-[#5d76c4] hover:text-[#3D52A0] hover:bg-[#5d76c4]/30 dark:hover:bg-[#5d76c4]/30 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-[#DFE2FE] dark:border-[#DFE2FE]/20 flex items-center justify-center text-[#5d76c4] hover:text-[#3D52A0] hover:bg-[#5d76c4]/30 dark:hover:bg-[#5d76c4]/30 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-[#DFE2FE] dark:border-[#DFE2FE]/20 flex items-center justify-center text-[#5d76c4] hover:text-[#3D52A0] hover:bg-[#5d76c4]/30 dark:hover:bg-[#5d76c4]/30 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-50 mb-4">
                Platform
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#features"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors inline-flex items-center"
                  >
                    Features
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors inline-flex items-center"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#testimonials"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors"
                  >
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link
                    href="#curriculum"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors"
                  >
                    Curriculum
                  </Link>
                </li>
                <li>
                  <Link
                    href="#ai-features"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors inline-flex items-center"
                  >
                    AI Features
                  </Link>
                </li>
              </ul>
            </motion.nav>

            {/* Company Links */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-50 mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors inline-flex items-center"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/research"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors"
                  >
                    Research
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </motion.nav>

            {/* Resources Links */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="col-span-2 md:col-span-1"
            >
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-50 mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/help"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/documentation"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="/status"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors inline-flex items-center"
                  >
                    System Status
                    <div className="ml-2 w-2 h-2 rounded-full bg-green-500"></div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="text-zinc-600 hover:text-[#7091E6] dark:text-zinc-100 dark:hover:text-[#b3cdff] hover:font-semibold transition-colors"
                  >
                    Submit Feedback
                  </Link>
                </li>
              </ul>
            </motion.nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-[#DFE2FE] text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-zinc-500 dark:text-zinc-300">
              <Link
                href="/privacy"
                className="hover:text-[#7091E6] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-[#7091E6] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="hover:text-[#7091E6] transition-colors"
              >
                Cookie Policy
              </Link>
              <Link
                href="/accessibility"
                className="hover:text-[#7091E6] transition-colors"
              >
                Accessibility
              </Link>
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-300">
              © 2025 Brain Wave AI. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
