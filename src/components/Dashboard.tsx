import React, { useState } from "react";
import { motion } from "motion/react";
import { dbService } from "../dbService";
// @ts-expect-error - Static image asset path
import profilePic from "../assets/images/anish_profile_photo_1783852329835.jpg";
import { 
  Bell, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Award, 
  Library, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  BookmarkCheck,
  Send,
  Download,
  RotateCw
} from "lucide-react";
import { 
  Notice, 
  CollegeEvent, 
  PlacementJob, 
  CollegeClass, 
  Assignment, 
  LibraryBook, 
  UserProfile 
} from "../types";
import { generatePDF } from "../utils/pdfGenerator";

interface DashboardProps {
  currentUser: UserProfile;
  classes: CollegeClass[];
  notices: Notice[];
  assignments: Assignment[];
  placements: PlacementJob[];
  events: CollegeEvent[];
  library: LibraryBook[];
  onTriggerAIPrompt: (prompt: string, category: string) => void;
  onUpdateClasses: (updated: CollegeClass[]) => void;
  onUpdateAssignments: (updated: Assignment[]) => void;
  onUpdatePlacements: (updated: PlacementJob[]) => void;
}

export default function Dashboard({
  currentUser,
  classes,
  notices,
  assignments,
  placements,
  events,
  library,
  onTriggerAIPrompt,
  onUpdateClasses,
  onUpdateAssignments,
  onUpdatePlacements
}: DashboardProps) {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [virtualClass, setVirtualClass] = useState<CollegeClass | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    // Real snapshot is handled reactively by Firestore Snapshots on App.tsx, 
    // so we can trigger a short spin animation, showing "Latest data synchronized!"
    setTimeout(() => {
      setIsRefreshing(false);
      setSubmissionSuccess("Latest dashboard parameters synchronized with administrative databases!");
      setTimeout(() => setSubmissionSuccess(null), 3500);
    }, 1200);
  };

  // Portfolio Typing States
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeletingMsg, setIsDeletingMsg] = useState(false);

  const portfolioMessages = [
    "Built by a solo developer",
    "AI Enthusiast",
    "Full Stack Web Developer",
    "Engineering Student",
    "UI/UX Designer",
    "Building the Future with AI",
    "Problem Solver",
    "Learning Every Day",
    "Turning Ideas into Reality",
    "Welcome to CollegeGPT"
  ];

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentFullText = portfolioMessages[currentMsgIndex];
    
    if (isDeletingMsg) {
      timer = setTimeout(() => {
        setTypedText(prev => prev.slice(0, -1));
      }, 30);
    } else {
      timer = setTimeout(() => {
        setTypedText(currentFullText.slice(0, typedText.length + 1));
      }, 60);
    }

    if (!isDeletingMsg && typedText === currentFullText) {
      timer = setTimeout(() => {
        setIsDeletingMsg(true);
      }, 1800);
    } else if (isDeletingMsg && typedText === "") {
      setIsDeletingMsg(false);
      setCurrentMsgIndex(prev => (prev + 1) % portfolioMessages.length);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeletingMsg, currentMsgIndex]);

  // Stats calculate
  const pendingAssignmentsCount = assignments.filter(a => a.status === "pending").length;
  const openPlacementsCount = placements.filter(p => p.status === "open").length;

  const handleAttendClass = (cls: CollegeClass) => {
    setVirtualClass(cls);
  };

  const handleMockSubmit = async (asgId: string) => {
    const updated = assignments.map(a => {
      if (a.id === asgId) {
        return { ...a, status: "submitted" as const };
      }
      return a;
    });
    onUpdateAssignments(updated);

    // Save to Firestore if user logged in
    const submittedAsg = updated.find(a => a.id === asgId);
    if (submittedAsg && currentUser) {
      await dbService.saveUserAssignment(currentUser.id, submittedAsg);
    }

    setSubmissionSuccess(`Assignment submitted successfully. AI analysis has queued your submission!`);
    setTimeout(() => setSubmissionSuccess(null), 3000);
  };

  const handleMockApply = async (jobId: string) => {
    const updated = placements.map(p => {
      if (p.id === jobId) {
        return { ...p, status: "applied" as const };
      }
      return p;
    });
    onUpdatePlacements(updated);

    // Save to Firestore if user logged in
    const appliedJob = updated.find(p => p.id === jobId);
    if (appliedJob && currentUser) {
      await dbService.saveUserPlacement(currentUser.id, appliedJob);
    }
  };

  const handleDownloadReport = () => {
    const timestamp = new Date().toLocaleString();
    const divider = "------------------------------------------------------------------------";

    // Format lists of items for plain text presentation
    const pendingAssignments = assignments.filter(a => a.status === 'pending');
    const formattedAssignments = pendingAssignments.length > 0 
      ? pendingAssignments.map(a => `- [${a.subject}] ${a.title} (Due: ${a.dueDate})`).join("\n")
      : "No pending assignments. Great job!";

    const formattedNotices = notices.slice(0, 5).length > 0
      ? notices.slice(0, 5).map(n => `- [${n.date}] ${n.title}\n  Category: ${n.category.toUpperCase()}`).join("\n\n")
      : "No new notices posted.";

    const upcomingEvents = events.slice(0, 5).length > 0
      ? events.slice(0, 5).map(e => `- [${e.date}] ${e.title} @ ${e.location}`).join("\n")
      : "No upcoming events scheduled.";

    const activeClasses = classes.length > 0
      ? classes.map(c => `- ${c.time}: ${c.subject} (${c.room}) | Instructor: ${c.faculty}`).join("\n")
      : "No classes scheduled.";

    const libraryStatus = library.length > 0
      ? library.map(b => `- "${b.title}" by ${b.author} (Status: ${b.status} | Return by: ${b.dueDate || "N/A"})`).join("\n")
      : "No books currently borrowed.";

    const reportContent = `CREDENTIALS  : CollegeGPT Student Dashboard
${divider}

STUDENT PROFILE
---------------
Name           : ${currentUser.name || "N/A"}
Roll No        : ${currentUser.rollNo || "N/A"}
Role           : ${currentUser.role ? currentUser.role.toUpperCase() : "STUDENT"}
Department     : ${currentUser.department || "Computer Science & Engineering"}
Semester       : Semester ${currentUser.semester || "6"}
Current CGPA   : ${currentUser.gpa || "N/A"}
Attendance Rate: ${currentUser.attendanceRate || "88.5"}%

TODAY'S CLASS SCHEDULE
----------------------
${activeClasses}

PENDING ASSIGNMENTS (${pendingAssignments.length})
-------------------
${formattedAssignments}

RECENT BOARD NOTICES
--------------------
${formattedNotices}

UPCOMING CAMPUS EVENTS
----------------------
${upcomingEvents}

LIBRARY TRANSACTION STATUS
--------------------------
${libraryStatus}`;

    const filename = `${(currentUser.name || "student").toLowerCase().replace(/\s+/g, "_")}_dashboard_summary.pdf`;
    generatePDF(
      filename,
      "ACADEMIC DASHBOARD & PERFORMANCE SUMMARY",
      `Generated On: ${timestamp} | Student RFID Node`,
      reportContent
    );
  };

  const handleSimulateAttendanceBoost = () => {
    // Boost attendance by 1.2% for demo
    const newRate = Math.min(100, currentUser.attendanceRate ? currentUser.attendanceRate + 1.2 : 88.5);
    currentUser.attendanceRate = parseFloat(newRate.toFixed(1));
    setSubmissionSuccess(`Attendance updated! Marked physically present for today's labs.`);
    setTimeout(() => setSubmissionSuccess(null), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative p-8 rounded-3xl overflow-hidden glass-panel border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-indigo-500/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-[60px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-5 z-10 w-full md:w-auto">
          {/* Glowing Avatar circle */}
          <div className="relative shrink-0 pt-1">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 opacity-75 blur-sm" />
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/20 bg-slate-900 shadow-inner">
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                alt={currentUser.name}
                className="w-full h-full object-cover transform hover:scale-110 transition duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 animate-spin-slow" /> CollegeGPT
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-100 tracking-tight">
              Greetings, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Welcome to your digital cockpit. Your academic performance index is looking robust in <span className="text-indigo-400 font-semibold font-mono bg-indigo-500/10 border border-indigo-400/20 px-2 py-0.5 rounded-md">Semester {currentUser.semester || "6"}</span>. You have **{pendingAssignmentsCount} assignments** requiring attention.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 z-10 w-full md:w-auto justify-center md:justify-end">
          {currentUser.role === "student" && currentUser.previousCgpa !== undefined && (
            <div className="p-3 py-2 rounded-xl bg-gradient-to-tr from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/25 flex items-center gap-3 shadow-lg shadow-amber-500/2">
              <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Award className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-[8px] font-bold font-mono tracking-wider text-amber-400 uppercase block">🏆 PREVIOUS CGPA</span>
                <span className="text-xs font-bold text-slate-100 font-mono">{currentUser.previousCgpa} ACHIEVED</span>
              </div>
            </div>
          )}
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-400 font-medium text-xs font-mono uppercase tracking-wider shadow-lg shadow-emerald-500/5 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Sync & Refresh'}
          </button>
          <button 
            onClick={handleDownloadReport}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 border border-cyan-400/30 hover:border-cyan-400/50 text-cyan-400 font-medium text-xs font-mono uppercase tracking-wider shadow-lg shadow-cyan-500/5 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 animate-bounce-slow" />
            Download Report (PDF)
          </button>
          <button 
            onClick={() => onTriggerAIPrompt("Provide me a list of key career items for this semester.", "placement")}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 font-medium text-xs font-mono uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition"
          >
            Quick Career Scan
          </button>
        </div>
      </div>

      {/* Submission Success Toast Alert */}
      {submissionSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-sm flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{submissionSuccess}</span>
        </motion.div>
      )}

      {/* Grid Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Row 1, Col 1: Today's Classes & Attendance */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Today's Classes (6 cols) */}
          <div className="md:col-span-7 p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h2 className="font-display font-bold text-lg text-slate-100">Today's Classes</h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 font-mono">
                LIVE TIMETABLE
              </span>
            </div>

            <div className="space-y-3 flex-grow">
              {(() => {
                const isStudent = currentUser.role === "student";
                const studentDept = isStudent ? currentUser.department : null;
                const studentSem = isStudent ? currentUser.semester : null;
                const filteredClasses = classes.filter(cls => {
                  if (studentDept && cls.department && cls.department.toLowerCase() !== studentDept.toLowerCase()) {
                    return false;
                  }
                  if (studentSem && cls.semester && cls.semester !== studentSem) {
                    return false;
                  }
                  return true;
                });

                if (filteredClasses.length > 0) {
                  return filteredClasses.map((cls) => (
                    <div 
                      key={cls.id} 
                      className={`p-3.5 rounded-xl border transition ${
                        cls.status === "ongoing" 
                          ? "bg-indigo-500/5 border-indigo-400/30" 
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-200">{cls.subject}</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {cls.faculty} • <span className="font-mono">{cls.room}</span>
                            {cls.department && (
                              <span className="text-[9px] text-pink-400 font-mono ml-2 px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                                {cls.department}
                              </span>
                            )}
                          </p>
                        </div>
                        {cls.status === "ongoing" ? (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-indigo-400 text-slate-950 font-bold font-mono uppercase animate-pulse">
                            ONGOING
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-white/5 border border-white/10 text-slate-400 font-mono uppercase">
                            UPCOMING
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5">
                        <span className="text-xs font-mono text-slate-400">{cls.time}</span>
                        <button 
                          onClick={() => handleAttendClass(cls)}
                          className={`text-xs font-mono font-medium transition flex items-center gap-1 ${
                            cls.status === "ongoing" ? "text-indigo-400 hover:text-indigo-300" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {cls.status === "ongoing" ? "Join Lab Sim" : "Prerequisites"} <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ));
                } else {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/2 my-2">
                      <BookOpen className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
                      <p className="text-xs text-slate-300 font-semibold font-sans">No Classes Scheduled Today</p>
                      <p className="text-[10px] text-slate-500 max-w-xs mt-1">
                        There are no scheduled lecture sessions for the **{studentDept || "selected"}** department, **Semester {studentSem || "any"}** today.
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>

          {/* Attendance Circular Dial (5 cols) */}
          <div className="md:col-span-5 p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between items-center text-center">
            <div className="w-full flex justify-between items-center pb-2 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <h2 className="font-display font-bold text-lg text-slate-100">Attendance</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">SEM_{currentUser.semester || 6}</span>
            </div>

            <div className="relative flex items-center justify-center my-4">
              {/* Circular progress meter */}
              <svg className="w-36 h-36 transform -rotate-90">
                <circle 
                  cx="72" 
                  cy="72" 
                  r="62" 
                  className="stroke-white/5" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="62" 
                  className="stroke-indigo-400" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - (currentUser.attendanceRate || 88.5) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  {currentUser.attendanceRate}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">Eligibility</span>
              </div>
            </div>

            <div className="space-y-3 w-full">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Min Threshold:</span>
                <span className="text-purple-400 font-bold">75.0%</span>
              </div>
              <div className="w-full py-2.5 rounded-xl bg-white/5 border border-white/5 text-center text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Managed by College Admin
              </div>
            </div>
          </div>

        </div>

        {/* Row 1, Col 2: High-Priority Notices (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-pink-400" />
              <h2 className="font-display font-bold text-lg text-slate-100">Notice Bulletin</h2>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-pink-500/10 border border-pink-400/20 text-pink-400 font-mono">
              URGENT_SYS
            </span>
          </div>

          <div className="space-y-4 flex-grow overflow-y-auto max-h-[300px] pr-1">
            {notices.map((not) => (
              <div 
                key={not.id}
                onClick={() => setSelectedNotice(not)}
                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition cursor-pointer group"
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded ${
                    not.category === "placement" 
                      ? "bg-cyan-500/10 text-cyan-400" 
                      : not.category === "exam" 
                        ? "bg-red-500/10 text-red-400" 
                        : "bg-purple-500/10 text-purple-400"
                  }`}>
                    {not.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{not.date}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-pink-400 transition truncate">{not.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{not.content}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2: Placement updates (6 cols) & Assignments list (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Placement Careers */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="font-display font-bold text-lg text-slate-100">Placement Hub</h2>
            </div>
            <span className="text-xs font-mono text-amber-400">{openPlacementsCount} Open Roles</span>
          </div>

          <div className="space-y-3.5 flex-grow">
            {placements.map((job) => (
              <div key={job.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/10 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">{job.company}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-400 font-mono">{job.ctc}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">{job.position}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1.5">Eligibility: {job.eligibility}</div>
                </div>
                <div className="w-full sm:w-auto flex sm:flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono">End: {job.deadline}</span>
                  {job.status === "open" ? (
                    <button 
                      onClick={() => handleMockApply(job.id)}
                      className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-mono text-xs font-semibold transition uppercase tracking-wider"
                    >
                      Quick Apply
                    </button>
                  ) : job.status === "applied" ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> APPLIED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-500 font-mono text-xs">CLOSED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Academic Assignments submission board */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h2 className="font-display font-bold text-lg text-slate-100">Academic Submissions</h2>
            </div>
            <span className="text-xs font-mono text-cyan-400">{pendingAssignmentsCount} Pending</span>
          </div>

          <div className="space-y-3.5 flex-grow">
            {assignments.map((asg) => (
              <div key={asg.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-200 truncate">{asg.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{asg.subject}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <span className="text-[10px] text-slate-400 font-mono">Due: {asg.dueDate}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {asg.status === "pending" ? (
                    <button 
                      onClick={() => handleMockSubmit(asg.id)}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-white font-mono text-xs font-medium transition"
                    >
                      Submit
                    </button>
                  ) : asg.status === "submitted" ? (
                    <span className="px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-400/30 text-yellow-400 font-mono text-xs font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> QUEUED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {asg.score}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3: Library log (6 cols) & Events / AI Shortcuts (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Library Ledger */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Library className="w-5 h-5 text-emerald-400" />
              <h2 className="font-display font-bold text-lg text-slate-100">Library Book Ledger</h2>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 font-mono">
              DIGITAL_PASSPORT
            </span>
          </div>

          <div className="space-y-3.5 flex-grow">
            {library.map((bk) => (
              <div key={bk.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{bk.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{bk.author}</p>
                </div>
                <div className="text-right">
                  {bk.status === "borrowed" ? (
                    <div className="space-y-1">
                      <div className="text-[10px] text-red-400 font-mono">DUE: {bk.dueDate}</div>
                      <span className="px-2 py-0.5 rounded text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 font-mono">
                        BORROWED
                      </span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 font-mono text-xs">
                      AVAILABLE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Assistant Quick Launch shortcuts */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <h2 className="font-display font-bold text-lg text-slate-100">AI Assistant Launcher</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400">NVIDIA_NEMOTRON</span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Click any premium high-frequency prompt key to directly initialize the AI Chat Copilot session:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-grow">
            <button 
              onClick={() => onTriggerAIPrompt("Can you explain the subject of Transformer Model architectures?", "explain_subject")}
              className="p-3.5 rounded-xl bg-gradient-to-tr from-[#00f2fe]/5 to-[#4facfe]/5 border border-[#00f2fe]/10 hover:border-[#00f2fe]/40 transition text-left space-y-1 group"
            >
              <div className="text-xs font-bold text-cyan-400 font-mono">EXPLAIN_SUBJECT</div>
              <p className="text-xs text-slate-300 group-hover:text-white transition">Explain Neural Networks & Attention Mechanisms.</p>
            </button>
            
            <button 
              onClick={() => onTriggerAIPrompt("Create a customized day-by-day study plan for Distributed Systems CAP theorem.", "study_plan")}
              className="p-3.5 rounded-xl bg-gradient-to-tr from-purple-500/5 to-pink-500/5 border border-purple-500/10 hover:border-purple-500/40 transition text-left space-y-1 group"
            >
              <div className="text-xs font-bold text-purple-400 font-mono">GENERATE_STUDY_PLAN</div>
              <p className="text-xs text-slate-300 group-hover:text-white transition">7-day roadmap for Distributed Systems consensus.</p>
            </button>

            <button 
              onClick={() => onTriggerAIPrompt("Generate a set of 4 advanced MCQs with explanations regarding compiler parsers.", "mcq")}
              className="p-3.5 rounded-xl bg-gradient-to-tr from-[#f12711]/5 to-[#f5af19]/5 border border-[#f12711]/10 hover:border-[#f12711]/40 transition text-left space-y-1 group"
            >
              <div className="text-xs font-bold text-red-400 font-mono">MCQ_GENERATOR</div>
              <p className="text-xs text-slate-300 group-hover:text-white transition">Generate Challenging Compiler Design MCQs.</p>
            </button>

            <button 
              onClick={() => onTriggerAIPrompt("Provide me 5 tough interview questions regarding Blockchain consensus and cryptography.", "interview")}
              className="p-3.5 rounded-xl bg-gradient-to-tr from-[#00ff87]/5 to-[#60efff]/5 border border-[#00ff87]/10 hover:border-[#00ff87]/40 transition text-left space-y-1 group"
            >
              <div className="text-xs font-bold text-emerald-400 font-mono">INTERVIEW_PREP</div>
              <p className="text-xs text-slate-300 group-hover:text-white transition">Advanced crypto/consensus recruiter Q&A.</p>
            </button>
          </div>
        </div>

      </div>

      {/* Premium Developer Portfolio Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.01] p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl mt-8"
      >
        {/* Floating background glowing orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-purple-600/5 blur-[80px] pointer-events-none" />

        {/* Minimal Grid overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

        {/* Headline Header */}
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Developer Passport Active
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-100 tracking-tight">
            Meet the Architect
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            This premium college dashboard is engineered and maintained entirely by a single student developer.
          </p>
        </div>

        {/* Profile Avatar and Neon Glow */}
        <div className="relative pt-2 z-10">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 opacity-75 blur-md animate-spin-slow" />
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 bg-slate-900 shadow-inner">
            <img
              src={profilePic}
              alt="Anish Chauhan"
              className="w-full h-full object-cover transform hover:scale-110 transition duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Identity Block */}
        <div className="space-y-1 z-10">
          <h3 className="font-display font-extrabold text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-indigo-100 tracking-tight">
            Anish Chauhan
          </h3>
          <p className="text-xs font-mono tracking-wider text-cyan-400 uppercase font-semibold">
            Creator of PANDA AI
          </p>
        </div>

        {/* Animated Typing Status Box */}
        <div className="w-full max-w-md h-12 flex items-center justify-center bg-black/45 border border-white/5 rounded-xl px-4 py-2 font-mono text-xs md:text-sm text-slate-300 shadow-inner z-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>
              {typedText}
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-cyan-400 animate-pulse" />
            </span>
          </div>
        </div>

        {/* Interactive Stats Badge Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-xl pt-2 z-10">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Role</div>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">Solo Developer</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Focus</div>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">AI Integrations</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Framework</div>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">React + Express</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Status</div>
            <div className="text-xs font-semibold text-emerald-400 mt-0.5">Building Future</div>
          </div>
        </div>

        {/* Dynamic Credits */}
        <div className="pt-4 border-t border-white/5 w-full max-w-xl flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-mono text-slate-500 z-10">
          <div>© 2026 ANISH CHAUHAN. ALL RIGHTS RESERVED</div>
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
            <span>Designed with Dedication</span>
          </div>
        </div>
      </motion.div>

      {/* Notice Bulletin Details Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl rounded-2xl glass-panel p-6 border border-white/10 relative"
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-pink-500 to-purple-500" />
            
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-pink-500/10 border border-pink-400/20 text-pink-400 font-mono uppercase">
                  {selectedNotice.category} Bulletin
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{selectedNotice.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedNotice(null)}
                className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-mono"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-line">
              {selectedNotice.content}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-slate-500 pt-4 border-t border-white/5">
              <div>By: {selectedNotice.author} • {selectedNotice.date}</div>
              <button
                onClick={() => {
                  onTriggerAIPrompt(`Let's analyze and critique the notice: '${selectedNotice.title}' - what actions should I take immediately?`, "faq");
                  setSelectedNotice(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Action Assistant
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Virtual Lab/Class Simulator Modal */}
      {virtualClass && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl rounded-2xl glass-panel-heavy p-6 border border-cyan-500/30 relative"
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse" />
            
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 font-mono uppercase tracking-widest">
                  Active Virtual Lab Simulator
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">{virtualClass.subject}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{virtualClass.faculty} • {virtualClass.room}</p>
              </div>
              <button 
                onClick={() => setVirtualClass(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-mono"
              >
                DISCONNECT
              </button>
            </div>

            {/* Simulated Interactive Terminal screen */}
            <div className="bg-[#05060a] p-4 rounded-xl border border-white/5 font-mono text-xs text-slate-300 space-y-3 mb-6 h-64 overflow-y-auto">
              <div className="text-slate-500">[{new Date().toLocaleTimeString()}] Establishing secure connection to virtual lab proxy node...</div>
              <div className="text-cyan-400 font-semibold">[SUCCESS] Tunnel established on port 3210. Audio & Telemetry initialized.</div>
              <div className="text-slate-300 mt-2">Dr. Vance (Synthesized Voice): "Today we are analyzing Multi-head Attention layers. Please inspect the weight matrices inside cell 4."</div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 mt-4 text-emerald-400 space-y-1">
                <div>$ python train_transformer.py --heads 8 --dim 512</div>
                <div className="text-slate-400">[Epoch 1/5] Loss: 4.821 | Accuracy: 12.8%</div>
                <div className="text-slate-400">[Epoch 2/5] Loss: 2.109 | Accuracy: 54.2%</div>
                <div className="text-slate-400 animate-pulse">[Epoch 3/5] Loss: 0.954 | Accuracy: 89.1% ...</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs font-mono text-slate-400">Time remaining: 42 mins</div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onTriggerAIPrompt(`Help me design a Python function executing Multi-Head Self-Attention from scratch.`, "coding");
                    setVirtualClass(null);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500 hover:text-white font-mono text-xs transition"
                >
                  <Send className="w-3.5 h-3.5" /> Request AI Code Hint
                </button>
                <button
                  onClick={() => {
                    setVirtualClass(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 hover:bg-[#10b981]/25 text-emerald-300 font-semibold text-xs font-mono uppercase tracking-wider transition"
                >
                  Close Session
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
