"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "@/public/brainwave.png";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  // Handle scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-5 left-0 right-0 z-50 mx-auto w-full max-w-7xl px-4 font-lora"
      )}
    >
      <motion.div
        className={cn(
          "rounded-2xl border h-20 border-[#b3cdff]/10 bg-[#7091E6]/20 shadow-[#b0c7ff] backdrop-blur-xl",
          scrolled && "shadow-lg"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <nav className="flex h-20 items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" aria-label="BrainWave Home">
            <motion.div
              className="flex items-center gap-2 md:ml-4"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                whileHover={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={logo}
                  priority
                  alt="Brain Wave Logo"
                  width={45}
                  height={45}
                  className="rounded-full mr-2"
                />
              </motion.div>
              <span className="hidden md:block text-3xl font-bold bg-gradient-to-t from-[#3D52A0] to-[#7091E6] text-transparent bg-clip-text">
                Brain Wave
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-md font-medium text-[#5d76c4] hover:text-[#3d52a0] transition-colors relative"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Buttons */}
          <div className="flex items-center gap-5">
            <Link
              href="/authentication/sign-in"
              className="hidden md:flex relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-[#3D52A0] after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] hover:after:origin-bottom-left hover:after:scale-x-100 hover:text-[#3D52A0] text-lg"
            >
              Login
            </Link>
            <Link
              href="/authentication/sign-up"
              className="flex h-10 md:h-12 items-center justify-center rounded-lg bg-[#a1c1fd] px-2 md:px-5 text-zinc-950 text-md md:text-lg hover:bg-[#b3cdff] shadow-none hover:shadow-lg hover:shadow-[#7091E6] font-semibold"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </motion.div>
    </header>
  );
}
