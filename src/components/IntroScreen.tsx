import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, Code, User, Brain, GraduationCap, Paintbrush, Flame, Layers } from "lucide-react";
// @ts-expect-error - Static image asset path
import profilePic from "../assets/images/anish_profile_photo_1783852329835.jpg";

interface IntroScreenProps {
  onComplete: () => void;
}

const TYPING_MESSAGES = [
  "Built by a solo developer",
  "AI Enthusiast",
  "Full Stack Web Developer",
  "Engineering Student",
  "UI/UX Designer",
  "Building the Future with AI",
  "Problem Solver",
  "Learning Every Day",
  "Turning Ideas into Reality",
  "Welcome to PANDA AI"
];

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Background floating particles array
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  // Typing effect logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = TYPING_MESSAGES[currentMessageIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayedText(prev => prev.slice(0, -1));
      }, 30);
    } else {
      timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 60);
    }

    // Handle state transitions
    if (!isDeleting && displayedText === fullText) {
      // Pause at full text
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
    } else if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setCurrentMessageIndex(prev => (prev + 1) % TYPING_MESSAGES.length);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentMessageIndex]);

  return (
    <div id="intro-viewport" className="relative min-h-screen w-screen bg-[#030409] text-slate-100 font-sans flex flex-col items-center justify-center overflow-hidden">
      {/* Absolute dark cyber glow backdrops */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />

      {/* Floating neon particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-30 blur-[1px]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: ["0vh", "-100vh"],
              x: ["0vw", (Math.random() - 0.5) * 10 + "vw"],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Centered Portfolio Panel with Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-lg mx-4 p-8 rounded-3xl glass-panel border border-white/10 flex flex-col items-center justify-center space-y-6 text-center shadow-2xl relative overflow-hidden bg-white/[0.02]"
      >
        {/* Subtle grid pattern background inside card */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

        {/* Top bar indicators */}
        <div className="absolute top-4 left-6 right-6 flex justify-between items-center text-[9px] font-mono tracking-widest text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>PORTFOLIO CORE ACTIVE</span>
          </div>
          <div>v1.0.0</div>
        </div>

        {/* Glowing Profile Frame */}
        <div className="relative pt-4">
          <motion.div 
            className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-75 blur-md animate-spin-slow"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/20 shadow-inner bg-slate-900">
            <img
              src={profilePic}
              alt="Anish Chauhan"
              className="w-full h-full object-cover transform hover:scale-110 transition duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Identity block */}
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-display font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-indigo-100 tracking-tight"
          >
            Anish Chauhan
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xs font-mono tracking-wider text-cyan-400 uppercase font-bold"
          >
            Creator of PANDA AI
          </motion.p>
        </div>

        {/* Typing Area Box */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full max-w-sm h-12 flex items-center justify-center bg-black/40 border border-white/5 rounded-2xl px-4 py-2 font-mono text-sm text-slate-300 shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              {displayedText}
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-cyan-400 animate-pulse" />
            </span>
          </div>
        </motion.div>

        {/* Enter CollegeGPT Button */}
        <motion.button
          onClick={onComplete}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="group relative w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold font-mono uppercase tracking-widest text-white transition hover:opacity-95 shadow-lg shadow-cyan-500/15 flex items-center justify-center gap-2 overflow-hidden border border-cyan-400/20"
        >
          {/* Internal hover shine reflection */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shine" />
          
          <span>Enter Portal</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>

      {/* Modern bottom portfolio status labels */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 text-center text-[10px] font-mono tracking-widest text-slate-500 space-y-1 z-10"
      >
        <p>DEVELOPED BY ANISH CHAUHAN &copy; 2026</p>
        <p className="text-[8px] text-slate-600 uppercase">One Project. Endless Learning.</p>
      </motion.div>
    </div>
  );
}
