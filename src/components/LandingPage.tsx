import React from "react";
import { motion } from "motion/react";
import { Sparkles, Terminal, BookOpen, GraduationCap, ArrowRight, BrainCircuit, ShieldAlert, Cpu } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onGetStarted, onNavigate }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const stats = [
    { label: "Active Cyber Minds", value: "1,690+" },
    { label: "Highest Career Offer", value: "48 LPA" },
    { label: "AI Academic Queries", value: "142K+" },
    { label: "Digital Research Papers", value: "850+" }
  ];

  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6 text-cyan-400" />,
      title: "NVIDIA AI Core",
      desc: "Instant answers to college FAQs, homework explanations, and custom day-by-day study plans powered by advanced reasoning."
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-purple-400" />,
      title: "Academics Bento Cockpit",
      desc: "Live class tracking, visual attendance monitoring, active assignments, and digital library logs inside a seamless dashboard."
    },
    {
      icon: <Terminal className="w-6 h-6 text-pink-400" />,
      title: "Recruitment Accelerators",
      desc: "Real-time updates on high-paying tech internships, AI resume review advice, and mock coding/placement questions."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      title: "Syllabus & PDF Parser",
      desc: "Instantly translate complex curriculum PDFs into 4-unit modular breakdowns, bullet point highlights, and mock exam MCQs."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-slate-100 flex flex-col justify-between">
      {/* Decorative cyber glows in background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      
      {/* Header bar */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse-glow">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            PANDA AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate("login")}
            className="px-5 py-2 rounded-xl text-sm font-medium hover:text-indigo-400 transition"
          >
            Sign In
          </button>
          <button 
            onClick={onGetStarted}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition shadow-[0_0_20px_rgba(168,85,247,0.25)]"
          >
            Launch Core
          </button>
        </div>
      </nav>

      {/* Hero section */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 flex-grow flex flex-col justify-center">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-xs font-mono text-indigo-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Cyber-Tech Intelligence Portal
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-tight">
              The AI-Powered Core of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400">
                Academic Excellence
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-slate-400 text-lg max-w-xl">
              Welcome to PANDA AI, the unified intelligence platform for Cyber-Tech University. 
              Seamlessly monitor schedules, apply for careers, study with automated subject deep-dives, and consult your custom campus copilot.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={onGetStarted}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition group shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              >
                Enter Portal 
                <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
              </button>
              <button 
                onClick={() => onNavigate("chatbot")}
                className="flex items-center gap-2 px-6 py-4 rounded-xl font-medium glass-panel border border-white/10 hover:bg-white/5 transition"
              >
                Talk to AI Agent
              </button>
            </motion.div>

            {/* Quick stats panel */}
            <motion.div 
              variants={itemVariants} 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl glass-panel relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40" />
              {stats.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column Interactive Glass Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div 
              variants={itemVariants} 
              className="w-full max-w-sm aspect-square relative rounded-3xl glass-panel flex flex-col justify-between p-8 border border-white/10 overflow-hidden shadow-2xl shadow-indigo-500/5 group"
            >
              {/* Spinning decorative orbit */}
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-indigo-500/5 to-transparent animate-pulse-glow" />
              
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-mono text-indigo-400 tracking-wider uppercase">Node Status</div>
                  <div className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE_CORE
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                  v3.5 Flash
                </div>
              </div>

              <div className="space-y-4 my-auto z-10">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition">
                  <div className="text-xs font-mono text-slate-400 mb-1">Incoming Alert</div>
                  <div className="text-sm font-semibold text-indigo-400">Google AI Placement Drive is now open!</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition">
                  <div className="text-xs font-mono text-slate-400 mb-1">AI Recommendation</div>
                  <div className="text-sm font-semibold text-purple-400">Generate a study plan for Transformer Models.</div>
                </div>
              </div>

              <div className="flex justify-between items-center z-10 pt-4 border-t border-white/5">
                <span className="text-xs font-mono text-slate-400">Cyber-Tech OS Terminal</span>
                <span className="text-xs font-mono text-purple-400">SYS_SECURED</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Grid Features */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-16 border-t border-white/5 bg-slate-950/20">
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-100">
            Engineered with Futuristic Capabilities
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Experience absolute speed, stunning glassmorphic visual telemetry, and robust tools developed specifically for campus success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8, borderColor: "rgba(99, 102, 241, 0.4)" }}
              className="p-6 rounded-2xl glass-panel border border-white/5 transition flex flex-col gap-4 relative group"
            >
              <div className="p-3 w-fit rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition duration-300">
                {feat.icon}
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-100 group-hover:text-indigo-400 transition">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/10 px-6 bg-transparent">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-slate-500 font-mono">
            © 2026 Cyber-Tech University Core. Powered by NVIDIA AI API.
          </span>
          <div className="flex gap-6">
            <button onClick={() => onNavigate("chatbot")} className="text-xs text-slate-400 hover:text-indigo-400 font-mono transition">AI Chat Help</button>
            <button onClick={() => onNavigate("settings")} className="text-xs text-slate-400 hover:text-indigo-400 font-mono transition">Security & Node Keys</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
