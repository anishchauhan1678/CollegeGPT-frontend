import React from "react";
import { motion } from "motion/react";
import { 
  Award, 
  BookOpen, 
  User, 
  Building2, 
  ShieldCheck, 
  Dna, 
  Compass, 
  Terminal, 
  Fingerprint,
  Heart,
  Download,
  FileText
} from "lucide-react";
import { UserProfile } from "../types";
import { generatePDF } from "../utils/pdfGenerator";

interface ProfileProps {
  currentUser: UserProfile;
}

export default function Profile({ currentUser }: ProfileProps) {
  const courses = [
    { code: "CS-601", name: "Artificial Intelligence & Neural Nets", grade: "A+", credits: 4 },
    { code: "CS-602", name: "Distributed Systems & Cloud Architecture", grade: "A", credits: 4 },
    { code: "CS-603", name: "Compiler Design & Automata Theory", grade: "A-", credits: 3 },
    { code: "CS-604", name: "Cybersecurity & Blockchain Cryptography", grade: "O (Outstanding)", credits: 4 },
    { code: "CS-608", name: "Autonomous Vehicle Path Planning Lab", grade: "A+", credits: 2 }
  ];

  const aiBadges = [
    { title: "Transformer Pioneer", desc: "Successfully implemented custom multi-head self attention logic.", icon: <Terminal className="w-4 h-4 text-cyan-400" />, level: "L3" },
    { title: "Consensus Architect", desc: "Mastered distributed Raft leader election state machines.", icon: <Compass className="w-4 h-4 text-purple-400" />, level: "L2" },
    { title: "Cryptographic Guard", desc: "Achieved zero-knowledge proof experiment certification.", icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, level: "L1" }
  ];

  const semGPAs = [
    { sem: "Sem 1", gpa: 8.8 },
    { sem: "Sem 2", gpa: 9.1 },
    { sem: "Sem 3", gpa: 8.9 },
    { sem: "Sem 4", gpa: 9.3 },
    { sem: "Sem 5", gpa: 9.24 }
  ];

  const handleDownloadReport = () => {
    const timestamp = new Date().toLocaleString();
    const divider = "------------------------------------------------------------------------";

    const reportContent = `SECURITY TAG : RFID_SECURE_VERIFIED
CREDENTIALS  : CollegeGPT Student Identity Node
${divider}

STUDENT IDENTIFICATION
----------------------
Name        : ${currentUser.name || "N/A"}
Roll No     : ${currentUser.rollNo || "N/A"}
Role        : ${currentUser.role ? currentUser.role.toUpperCase() : "STUDENT"}
Department  : ${currentUser.department || "Computer Science & Engineering"}
Semester    : Semester ${currentUser.semester || "6"}
Current CGPA: ${currentUser.gpa || "N/A"}

CUMULATIVE SEMESTER GPA PERFORMANCE
-----------------------------------
${semGPAs.map(pt => `${pt.sem.padEnd(12)}: ${pt.gpa}`).join("\n")}

REGISTERED COURSE LEDGER
------------------------
${courses.map(course => `[${course.code}] ${course.name}
         Credits: ${course.credits} | Grade: ${course.grade}`).join("\n")}

BADGES & ACADEMIC ACHIEVEMENTS
------------------------------
${aiBadges.map(badge => `- ${badge.title} [${badge.level} CERTIFIED]
  Desc: ${badge.desc}`).join("\n\n")}`;

    const filename = `${(currentUser.name || "student").toLowerCase().replace(/\s+/g, "_")}_academic_report.pdf`;
    generatePDF(
      filename,
      "OFFICIAL ACADEMIC STATUS REPORT",
      `Generated On: ${timestamp} | Secure RFID Node`,
      reportContent
    );
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight">Student Identity Node</h1>
          <p className="text-sm text-slate-400">Manage your RFID credentials, certifications, and academic GPAs</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 border border-cyan-400/30 hover:border-cyan-400/50 text-cyan-400 text-xs font-mono font-bold tracking-wider transition flex items-center gap-2 shadow-lg shadow-cyan-500/5"
          >
            <Download className="w-4 h-4 animate-bounce-slow" />
            Download Academic Report (PDF)
          </button>
          <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-xs font-mono font-bold tracking-wider">
            RFID_SECURE_VERIFIED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Holographic ID Card (5 columns) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          <motion.div 
            whileHover={{ rotateY: 10, rotateX: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full max-w-sm aspect-[1.58/1] rounded-3xl bg-gradient-to-tr from-cyan-900/40 via-purple-950/40 to-slate-900/40 border border-white/10 backdrop-blur-2xl p-6 relative overflow-hidden shadow-2xl shadow-cyan-500/10 group cursor-grab"
            style={{ perspective: 1000 }}
          >
            {/* Holographic light effect */}
            <div className="absolute inset-0 bg-radial-gradient from-cyan-400/10 via-transparent to-transparent pointer-events-none group-hover:translate-x-12 group-hover:translate-y-12 transition duration-700" />
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

            <div className="flex justify-between items-start z-10 relative">
              <div className="flex items-center gap-1.5">
                <Dna className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="font-display font-bold text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  PANDA AI
                </span>
              </div>
              <div className="p-1 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Fingerprint className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
            </div>

            <div className="flex gap-4 mt-6 z-10 relative">
              <img 
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border border-cyan-400/30"
              />
              <div className="space-y-1">
                <div className="text-md font-bold text-slate-100">{currentUser.name}</div>
                <div className="text-xs text-cyan-400 font-mono font-semibold uppercase">{currentUser.role} ID</div>
                <div className="text-[10px] text-slate-400 font-mono mt-2">Roll: {currentUser.rollNo}</div>
                <div className="text-[10px] text-slate-400 font-mono">Dept: {currentUser.department}</div>
                {currentUser.semester !== undefined && (
                  <div className="text-[10px] text-cyan-400 font-mono font-bold">Sem: {currentUser.semester}</div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-end mt-6 pt-4 border-t border-white/5 z-10 relative">
              <div>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block">RFID Index</span>
                <span className="text-xs font-mono text-slate-300">RFID_NODE_248A9</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block">System State</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> SECURE
                </span>
              </div>
            </div>
          </motion.div>

          {/* Barcode representation */}
          <div className="w-full max-w-sm mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center gap-2">
            <div className="flex gap-[2px] h-8 w-full justify-center">
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-slate-400" 
                  style={{ width: `${Math.max(1, (i % 3) * 1.5)}px`, opacity: i % 4 === 0 ? 0.3 : 0.8 }} 
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">RFID Code 82194017</span>
          </div>

        </div>

        {/* Right: Academic details & Achievements (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* GPA Semester History tracker */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <h2 className="font-display font-bold text-lg text-slate-100">Cumulative GPA Score Tracker</h2>
              </div>
              <span className="text-xs font-mono text-purple-400 font-semibold">Active: {currentUser.gpa}</span>
            </div>

            {/* Custom SVG line Chart */}
            <div className="relative h-44 w-full bg-black/10 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
              <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-t border-white/5 w-full" />
                ))}
              </div>

              {/* Glowing SVG spline */}
              <svg className="w-full h-full absolute inset-0 pt-4 pb-8 px-6">
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#9d4edd" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area under the path */}
                <path 
                  d="M 10 90 Q 75 70 140 85 T 270 50 T 400 60 L 400 120 L 10 120 Z" 
                  fill="url(#chart-glow)" 
                  className="transition duration-500"
                />
                <path 
                  d="M 10 90 Q 75 70 140 85 T 270 50 T 400 60" 
                  fill="transparent" 
                  stroke="url(#gradient-line)" 
                  strokeWidth="3.5" 
                  className="transition duration-500"
                />
                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="50%" stopColor="#4facfe" />
                  <stop offset="100%" stopColor="#9d4edd" />
                </linearGradient>
              </svg>

              {/* Data Node Indicators */}
              <div className="relative flex justify-between px-6 h-full items-end pb-1 z-10 font-mono text-[9px] text-slate-400">
                {semGPAs.map((pt, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="px-1.5 py-0.5 rounded bg-white/5 text-cyan-400 font-bold border border-white/10">{pt.gpa}</div>
                    <span className="text-slate-500 uppercase tracking-widest">{pt.sem}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Course Ledger */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h2 className="font-display font-bold text-lg text-slate-100">Registered Course Ledger</h2>
            </div>
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.code} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-cyan-400 font-bold pr-2">{course.code}</span>
                    <span className="font-medium text-slate-200">{course.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono shrink-0">
                    <span className="text-slate-500">{course.credits} Credits</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 font-bold">{course.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Verified holograms */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="font-display font-bold text-lg text-slate-100">Holographic Badges & Achievements</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiBadges.map((badge, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center relative flex flex-col items-center justify-between gap-2.5">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 w-fit shrink-0">
                    {badge.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{badge.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{badge.desc}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold tracking-wider">
                    {badge.level} CERTIFIED
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
