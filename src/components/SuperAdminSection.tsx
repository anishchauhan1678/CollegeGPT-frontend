import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  Users, 
  Calendar, 
  Activity, 
  Search, 
  Edit3, 
  Save, 
  X, 
  Sparkles, 
  Check, 
  TrendingUp, 
  RefreshCw,
  Mail,
  Phone,
  Layers,
  Hash,
  Award,
  BookOpen,
  KeyRound,
  Plus
} from "lucide-react";
import { UserProfile, UserRole } from "../types";
import { dbService } from "../dbService";

interface SuperAdminSectionProps {
  currentUser: UserProfile;
}

type TimeframeFilter = "7days" | "30days" | "1year" | "all";

export default function SuperAdminSection({ currentUser }: SuperAdminSectionProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("7days");
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [dynamicDepartments, setDynamicDepartments] = useState<string[]>([
    "Computer Science & Engineering",
    "Artificial Intelligence & Data Science",
    "Electronics & Communication Engineering",
    "Robotics & Automation"
  ]);
  
  // Editing State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editError, setEditError] = useState("");

  // Statistics & aggregation variables
  const [stats, setStats] = useState({
    totalVisits: 0,
    studentVisits: 0,
    uniqueActiveToday: 0,
    totalProfiles: 0,
    studentProfilesCount: 0,
  });

  const [chartData, setChartData] = useState<{ label: string; studentCount: number; otherCount: number; dateKey: string }[]>([]);
  const [selectedBar, setSelectedBar] = useState<any | null>(null);

  // Load Firestore data
  const loadData = async () => {
    setLoading(true);
    try {
      const allUsers = await dbService.getAllUserProfiles();
      const allVisits = await dbService.getPortalVisits();
      setUsers(allUsers);
      setVisits(allVisits);
      calculateStatsAndChart(allUsers, allVisits, timeframe);
      
      const depts = await dbService.getAllDepartments();
      if (depts && depts.length > 0) {
        const names = depts.map(d => d.name).filter(Boolean);
        const defaults = [
          "Computer Science & Engineering",
          "Artificial Intelligence & Data Science",
          "Electronics & Communication Engineering",
          "Robotics & Automation"
        ];
        const combined = Array.from(new Set([...defaults, ...names]));
        setDynamicDepartments(combined);
      }
    } catch (err) {
      console.error("Error loading SuperAdmin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const calculateStatsAndChart = (allUsers: UserProfile[], allVisits: any[], filter: TimeframeFilter) => {
    const todayStr = new Date().toISOString().split("T")[0];

    // Total counts
    const totalVisits = allVisits.length;
    const studentVisits = allVisits.filter(v => v.userRole === "student").length;
    
    // Unique daily active student logins/visits today
    const activeTodaySet = new Set(
      allVisits
        .filter(v => v.dateStr === todayStr && v.userRole === "student")
        .map(v => v.userId)
    );
    const uniqueActiveToday = activeTodaySet.size;

    const totalProfiles = allUsers.length;
    const studentProfilesCount = allUsers.filter(u => u.role === "student").length;

    setStats({
      totalVisits,
      studentVisits,
      uniqueActiveToday,
      totalProfiles,
      studentProfilesCount
    });

    // Generate chart bars based on timeframe
    const data: { label: string; studentCount: number; otherCount: number; dateKey: string }[] = [];
    const today = new Date();

    if (filter === "7days") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const label = d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });

        const dayVisits = allVisits.filter(v => v.dateStr === dateStr);
        const stCount = dayVisits.filter(v => v.userRole === "student").length;
        const othCount = dayVisits.length - stCount;

        data.push({ label, studentCount: stCount, otherCount: othCount, dateKey: dateStr });
      }
    } else if (filter === "30days") {
      // Last 30 days aggregated into 6 blocks of 5 days
      for (let i = 5; i >= 0; i--) {
        let blockStudent = 0;
        let blockOther = 0;
        let blockLabel = "";

        const startDate = new Date();
        startDate.setDate(today.getDate() - (i * 5 + 4));
        const endDate = new Date();
        endDate.setDate(today.getDate() - (i * 5));

        blockLabel = `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;

        for (let j = 0; j < 5; j++) {
          const d = new Date();
          d.setDate(endDate.getDate() - j);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;

          const dayVisits = allVisits.filter(v => v.dateStr === dateStr);
          blockStudent += dayVisits.filter(v => v.userRole === "student").length;
          blockOther += (dayVisits.length - dayVisits.filter(v => v.userRole === "student").length);
        }

        data.push({ 
          label: blockLabel, 
          studentCount: blockStudent, 
          otherCount: blockOther, 
          dateKey: `block-${i}` 
        });
      }
    } else if (filter === "1year") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        const checkYear = d.getFullYear();
        const checkMonth = d.getMonth(); // 0-indexed

        // Filter visits that fall within this month & year
        const monthVisits = allVisits.filter(v => {
          if (!v.timestamp) return false;
          const visitDate = new Date(v.timestamp);
          return visitDate.getFullYear() === checkYear && visitDate.getMonth() === checkMonth;
        });

        const stCount = monthVisits.filter(v => v.userRole === "student").length;
        const othCount = monthVisits.length - stCount;

        data.push({ label, studentCount: stCount, otherCount: othCount, dateKey: `${checkYear}-${checkMonth}` });
      }
    } else {
      // "All Time" - Grouped by role
      const stCount = allVisits.filter(v => v.userRole === "student").length;
      const facCount = allVisits.filter(v => v.userRole === "faculty").length;
      const admCount = allVisits.filter(v => v.userRole === "admin").length;
      const saCount = allVisits.filter(v => v.userRole === "superadmin").length;

      data.push({ label: "Students", studentCount: stCount, otherCount: 0, dateKey: "student" });
      data.push({ label: "Faculty", studentCount: 0, otherCount: facCount, dateKey: "faculty" });
      data.push({ label: "Admins", studentCount: 0, otherCount: admCount, dateKey: "admin" });
      data.push({ label: "SuperAdmins", studentCount: 0, otherCount: saCount, dateKey: "superadmin" });
    }

    setChartData(data);
    if (data.length > 0) {
      setSelectedBar(data[data.length - 1]);
    }
  };

  // Profile Edit Submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError("");
    setSaveSuccess(false);

    if (!editingUser.name.trim()) {
      setEditError("Name is required.");
      return;
    }
    if (!editingUser.email.trim()) {
      setEditError("Email is required.");
      return;
    }

    try {
      await dbService.saveUserProfile(editingUser);
      setSaveSuccess(true);
      
      // Update local state list instantly
      if (isCreateMode) {
        setUsers(prev => [editingUser, ...prev]);
      } else {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
      }
      
      setTimeout(() => {
        setSaveSuccess(false);
        setEditingUser(null);
        setIsCreateMode(false);
      }, 1500);
    } catch (err) {
      console.error("Error saving user profile:", err);
      setEditError("Failed to save changes to Firestore database.");
    }
  };

  // Filter & Search users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.rollNo && u.rollNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Calculate high chart value for rendering scale
  const maxVal = Math.max(...chartData.map(d => d.studentCount + d.otherCount), 5);

  return (
    <div className="space-y-8">
      {/* Immersive Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-widest font-bold">
            <ShieldAlert className="w-4 h-4 animate-pulse" /> fully secured command center
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight mt-1 flex items-center gap-2.5">
            Super Admin CommandCenter
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyze daily student logins, trace portal visits, and exercise absolute database control over profiles.
          </p>
        </div>
        
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-mono transition duration-200"
          title="Force refresh database collections"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Registry
        </button>
      </div>

      {/* Analytical KPI Metrics Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Total Portal Visits</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono text-slate-100">{stats.totalVisits}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-cyan-400 font-bold">{stats.studentVisits}</span> student accesses logged
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Active Students Today</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <TrendingUp className="w-4.5 h-4.5 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono text-slate-100">{stats.uniqueActiveToday}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Unique student auth handshakes today</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Total User Profiles</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono text-slate-100">{stats.totalProfiles}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-indigo-400 font-bold">{stats.studentProfilesCount}</span> student profiles saved
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Secured Access Level</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">SuperAdmin Mode</h3>
            <p className="text-[10px] text-purple-400 mt-1 font-bold font-mono">ROOT_BYPASS_AUTHORIZED</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart and Real-time log list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Portal Access Analytics Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl glass-panel border border-white/5 space-y-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-400" /> Visit Frequency & Student Logins
              </h2>
              <p className="text-xs text-slate-400">Aggregate logs on daily basis across timeframe views.</p>
            </div>
            
            {/* Filter controls */}
            <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1 shrink-0">
              {(["7days", "30days", "1year", "all"] as TimeframeFilter[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition ${
                    timeframe === tf 
                      ? "bg-red-500/10 border border-red-500/20 text-red-400" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tf === "7days" ? "7 Days" : tf === "30days" ? "30 Days" : tf === "1year" ? "1 Year" : "All Time"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-60 flex flex-col items-center justify-center space-y-2 font-mono text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin text-red-400" />
              <span>Fetching analytic parameters...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs font-mono text-slate-500 border border-dashed border-white/5 rounded-xl">
              No login logs found. Let student users authorize first!
            </div>
          ) : (
            <div className="space-y-4">
              {/* Responsive SVG Bar Graph */}
              <div className="h-60 w-full relative pt-4">
                <svg className="w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                    const yPos = 20 + ratio * 160;
                    const val = Math.round(maxVal * (1 - ratio));
                    return (
                      <g key={index}>
                        <line x1="40" y1={yPos} x2="480" y2={yPos} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                        <text x="15" y={yPos + 4} fill="rgba(148,163,184,0.4)" fontSize="8" fontFamily="monospace" textAnchor="middle">
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Render Columns */}
                  {chartData.map((d, i) => {
                    const colWidth = 360 / chartData.length;
                    const xPos = 50 + i * (410 / chartData.length);
                    const barWidth = Math.max(8, colWidth - 10);
                    
                    const totalVisits = d.studentCount + d.otherCount;
                    const studentHeight = totalVisits > 0 ? (d.studentCount / maxVal) * 160 : 0;
                    const otherHeight = totalVisits > 0 ? (d.otherCount / maxVal) * 160 : 0;
                    
                    const yStudentStart = 180 - studentHeight;
                    const yOtherStart = yStudentStart - otherHeight;
                    const isSelected = selectedBar?.dateKey === d.dateKey;

                    return (
                      <g 
                        key={d.dateKey} 
                        className="cursor-pointer" 
                        onClick={() => setSelectedBar(d)}
                      >
                        {/* Interactive Highlight overlay */}
                        <rect
                          x={xPos - 4}
                          y="10"
                          width={barWidth + 8}
                          height="185"
                          fill={isSelected ? "rgba(239, 68, 68, 0.03)" : "transparent"}
                          rx="4"
                        />

                        {/* Other logins bar */}
                        {otherHeight > 0 && (
                          <rect
                            x={xPos}
                            y={yOtherStart}
                            width={barWidth}
                            height={otherHeight}
                            fill={isSelected ? "url(#purpleGlow)" : "rgba(168, 85, 247, 0.6)"}
                            rx="2"
                          />
                        )}

                        {/* Student logins bar */}
                        {studentHeight > 0 && (
                          <rect
                            x={xPos}
                            y={yStudentStart}
                            width={barWidth}
                            height={studentHeight}
                            fill={isSelected ? "url(#redGlow)" : "url(#redDefault)"}
                            rx="2"
                          />
                        )}

                        {/* X-Axis labels */}
                        <text
                          x={xPos + barWidth / 2}
                          y="205"
                          fill={isSelected ? "rgba(248, 113, 113, 0.9)" : "rgba(148, 163, 184, 0.5)"}
                          fontSize="7"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {d.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient Blueprints */}
                  <defs>
                    <linearGradient id="redGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                    <linearGradient id="redDefault" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Bar details readout details */}
              {selectedBar && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-wrap justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-400" />
                    <span>Timeframe: <strong className="text-slate-200">{selectedBar.label}</strong></span>
                  </div>
                  <div className="flex gap-4 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" />
                      <span>Students: <strong className="text-red-400 font-bold">{selectedBar.studentCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" />
                      <span>Staff/Other: <strong className="text-purple-400 font-bold">{selectedBar.otherCount}</strong></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time logins list feed */}
        <div className="lg:col-span-4 p-6 rounded-2xl glass-panel border border-white/5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-400 animate-pulse" /> Live Portal Activity Feed
            </h2>
            <p className="text-xs text-slate-400">Trace logins and page visits as they occur.</p>
          </div>

          <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 flex-grow mt-2">
            {loading ? (
              <div className="h-40 flex items-center justify-center font-mono text-xs text-slate-500">
                Reading trace files...
              </div>
            ) : visits.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs font-mono text-slate-500 text-center border border-dashed border-white/5 rounded-xl">
                No activity records logged.
              </div>
            ) : (
              visits.slice(0, 15).map((log) => {
                const isStudent = log.userRole === "student";
                return (
                  <div key={log.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-slate-200 truncate max-w-[130px]">{log.userName}</span>
                      <span className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${
                        isStudent ? "bg-cyan-500/10 text-cyan-400" : "bg-purple-500/10 text-purple-400"
                      }`}>
                        {log.userRole}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono truncate">{log.userEmail}</div>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1">
                      <span>Log: {log.dateStr}</span>
                      <span>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Directory & Registry of All Users with complete detail editing */}
      <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-red-400" /> Authorized User Profiles Directory
            </h2>
            <p className="text-xs text-slate-400">Total accounts saved: {filteredUsers.length} profiles</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, roll, dept..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-400"
              />
            </div>

            {/* Role Filter dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0a0c16] border border-white/10 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admins</option>
              <option value="superadmin">SuperAdmins</option>
            </select>

            <button
              onClick={() => {
                const newUid = `admin-${Math.floor(100 + Math.random() * 900)}`;
                setEditingUser({
                  id: newUid,
                  name: "",
                  email: "",
                  role: "admin",
                  password: "",
                  rollNo: "",
                  department: "Computer Science & Engineering",
                  semester: 6,
                  gpa: 8.75,
                  attendanceRate: 90.0,
                  avatarUrl: "",
                  mobile: "",
                  previousCgpa: 0
                });
                setIsCreateMode(true);
                setSaveSuccess(false);
                setEditError("");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-indigo-600 hover:opacity-95 text-xs text-white font-mono font-bold transition shadow-lg shadow-red-500/10 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Admin / User
            </button>
          </div>
        </div>

        {/* Profiles Grid */}
        {loading ? (
          <div className="h-60 flex items-center justify-center font-mono text-xs text-slate-500">
            Scanning central registries...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-xs font-mono text-slate-500 border border-dashed border-white/5 rounded-xl">
            No matching user profiles found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const isStudent = u.role === "student";
              const isSuper = u.role === "superadmin";
              return (
                <div 
                  key={u.id}
                  className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                        alt={u.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-slate-200 truncate">{u.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 ${
                      isSuper 
                        ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                        : u.role === "admin"
                          ? "bg-pink-500/10 text-pink-400"
                          : u.role === "faculty"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-cyan-500/10 text-cyan-400"
                    }`}>
                      {u.role}
                    </span>
                  </div>

                  {/* Academic Profile metadata readout */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-3 border-t border-white/5">
                    <div>
                      <span className="text-slate-500 uppercase text-[8px] block">MOBILE</span>
                      <span className="text-slate-200 truncate block">{u.mobile || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[8px] block">DEPARTMENT</span>
                      <span className="text-slate-200 truncate block">{u.department || "N/A"}</span>
                    </div>
                    {isStudent && (
                      <>
                        <div>
                          <span className="text-slate-500 uppercase text-[8px] block">ROLL_NUMBER</span>
                          <span className="text-slate-200 truncate block">{u.rollNo || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase text-[8px] block">GPA / ATTD.</span>
                          <span className="text-slate-200 block">
                            <span className="text-red-400 font-bold">{u.gpa || "8.75"}</span> / <span className="text-emerald-400 font-bold">{u.attendanceRate ? `${u.attendanceRate}%` : "90%"}</span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Edit action */}
                  <div className="pt-3 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => {
                        setEditingUser({ ...u });
                        setIsCreateMode(false);
                        setSaveSuccess(false);
                        setEditError("");
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-mono transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-red-400" />
                      Edit Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editing User Profile Overlay Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[90000]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl bg-[#0a0c16] border border-white/10 p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500" />

              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 font-mono uppercase tracking-widest font-bold">
                    {isCreateMode ? "SuperAdmin Provision Permission" : "SuperAdmin Modify Permission"}
                  </span>
                  <h3 className="text-xl font-bold text-slate-100 mt-2 tracking-tight">
                    {isCreateMode ? "Add New User / Admin" : "Edit Core User profile"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isCreateMode 
                      ? `Provisioning database record for UID: ${editingUser.id}` 
                      : `You are changing database parameters for UID: ${editingUser.id}`}
                  </p>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> {editError}
                </div>
              )}

              {saveSuccess ? (
                <div className="h-60 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-emerald-400 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Check className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Database Record Synced Successfully</h4>
                    <p className="text-slate-400 mt-1 text-[10px]">Changes propagated to centralized Firestore nodes.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Full Name</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                        />
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Mobile</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={editingUser.mobile || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, mobile: e.target.value })}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                        />
                      </div>
                    </div>

                    {/* Role selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">User Role</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0a0c16] border border-white/10 text-xs text-slate-200 focus:outline-none cursor-pointer focus:border-red-400"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">SuperAdmin</option>
                      </select>
                    </div>

                    {/* Password input for Admin/Faculty/SuperAdmin or any user */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Profile Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Set account password"
                          value={editingUser.password || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                        />
                      </div>
                    </div>

                    {/* Department */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Department</label>
                      <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <select
                          value={editingUser.department || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0a0c16] border border-white/10 text-xs text-slate-200 focus:outline-none cursor-pointer focus:border-red-400"
                        >
                          <option value="">No Department</option>
                          {dynamicDepartments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Roll Number (If Student) */}
                    {editingUser.role === "student" && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Roll Number</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={editingUser.rollNo || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, rollNo: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Semester (If Student) */}
                    {editingUser.role === "student" && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Semester</label>
                        <select
                          value={editingUser.semester || 6}
                          onChange={(e) => setEditingUser({ ...editingUser, semester: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-[#0a0c16] border border-white/10 text-xs text-slate-200 focus:outline-none cursor-pointer focus:border-red-400"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* GPA / CGPA (If Student) */}
                    {editingUser.role === "student" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase">Current GPA</label>
                          <div className="relative">
                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="number"
                              step="0.01"
                              value={editingUser.gpa || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, gpa: Number(e.target.value) })}
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase">Previous CGPA</label>
                          <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="number"
                              step="0.01"
                              value={editingUser.previousCgpa || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, previousCgpa: Number(e.target.value) })}
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attendance rate */}
                    {editingUser.role === "student" && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Attendance Rate (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editingUser.attendanceRate || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, attendanceRate: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                        />
                      </div>
                    )}

                    {/* Avatar URL */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Avatar Picture URL</label>
                      <input
                        type="text"
                        value={editingUser.avatarUrl || ""}
                        onChange={(e) => setEditingUser({ ...editingUser, avatarUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 transition font-mono font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-indigo-600 hover:opacity-90 text-xs text-white font-mono font-bold transition shadow-lg shadow-red-500/10"
                    >
                      <Save className="w-4 h-4" /> {isCreateMode ? "Create Profile" : "Save Record"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
