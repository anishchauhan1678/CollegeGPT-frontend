import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  Calendar, 
  Award, 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Info,
  Clock,
  Filter
} from "lucide-react";
import { Scholarship, UserProfile } from "../types";
import { dbService } from "../dbService";

// ==========================================
// STUDENT VIEW: LIST & DETAIL SCHOLARSHIPS
// ==========================================
interface ScholarshipsViewProps {
  currentUser: UserProfile | null;
  scholarships: Scholarship[];
  onTriggerAISummary?: (text: string) => void;
}

export function ScholarshipsView({ currentUser, scholarships }: ScholarshipsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "eligible" | "open">("all");
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Student metrics
  const studentCgpa = currentUser?.gpa || 0;
  const studentDept = currentUser?.department || "";

  // Check if student is eligible
  const isEligible = (sch: Scholarship) => {
    // Check if the eligibility string contains CGPA threshold
    // Simple heuristic parser for CGPA in string: e.g. "CGPA > 8.5"
    const cgpaRegex = /CGPA\s*>\s*([0-9.]+)/i;
    const match = sch.eligibility.match(cgpaRegex);
    if (match && match[1]) {
      const requiredCgpa = parseFloat(match[1]);
      if (studentCgpa < requiredCgpa) {
        return false;
      }
    }
    
    // Check female limitation
    if (sch.eligibility.toLowerCase().includes("female") && currentUser?.name) {
      // Basic heuristic: check if female flag is matching or if user is male
      // We can let students self-determine or show warning instead of hard locking
    }

    return true;
  };

  const filteredScholarships = scholarships.filter((sch) => {
    const matchesSearch = 
      sch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "open" && sch.status !== "closed") ||
      (statusFilter === "eligible" && isEligible(sch));

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Determine if deadline is near (less than 15 days)
  const isDeadlineNear = (deadlineStr: string) => {
    try {
      const deadline = new Date(deadlineStr);
      const today = new Date();
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 15;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12182d] to-[#0a0c16] border border-white/5 p-8 md:p-10">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 rounded-full bg-pink-500/5 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-xs font-mono">
            <GraduationCap className="w-3.5 h-3.5" /> Portal Scholarships Listing
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-slate-100 tracking-tight leading-tight">
            Finance Your Academic Excellence
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Discover tailored scholarship programs, grants, and fellowships offered by corporate partners, the university senate, and governmental bodies. View key deadlines and required documents instantly.
          </p>
          
          {currentUser?.role === "student" && (
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                <span className="text-slate-400">Current GPA:</span>
                <span className="text-cyan-400 font-bold">{studentCgpa.toFixed(2)}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                <span className="text-slate-400">Branch:</span>
                <span className="text-pink-400 font-bold">{studentDept || "Not Specified"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search scholarships, providers, criteria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0e1220]/80 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider font-mono uppercase transition shrink-0 border ${
              statusFilter === "all"
                ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-400"
                : "bg-white/5 border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            All Schemes
          </button>
          {currentUser?.role === "student" && (
            <button
              onClick={() => setStatusFilter("eligible")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider font-mono uppercase transition shrink-0 border ${
                statusFilter === "eligible"
                  ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-400"
                  : "bg-white/5 border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Eligible For Me
            </button>
          )}
          <button
            onClick={() => setStatusFilter("open")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider font-mono uppercase transition shrink-0 border ${
              statusFilter === "open"
                ? "bg-pink-500/10 border-pink-400/30 text-pink-400"
                : "bg-white/5 border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Currently Open
          </button>
        </div>
      </div>

      {/* Main Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredScholarships.map((sch) => {
            const isStudentEligible = isEligible(sch);
            const isExpanded = expandedCardId === sch.id;
            const deadlineNear = isDeadlineNear(sch.deadline);

            return (
              <motion.div
                layout
                key={sch.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`p-6 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                  isExpanded 
                    ? "bg-[#11162d]/95 border-cyan-500/30 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/20"
                    : "bg-[#0c0e1a]/85 border-white/5 hover:border-white/10 hover:bg-[#101326]/60 shadow-md"
                }`}
              >
                {/* Status and Eligibility badges */}
                <div className="flex justify-between items-start gap-2 mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {sch.provider}
                    </span>
                    {sch.status === "closed" ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                        Closed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Open
                      </span>
                    )}
                  </div>

                  {currentUser?.role === "student" && (
                    <div className="shrink-0">
                      {isStudentEligible ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono font-semibold bg-emerald-500/5 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" /> Eligible
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400 text-xs font-mono font-semibold bg-red-500/5 px-2.5 py-1 rounded-xl border border-red-500/20">
                          <AlertCircle className="w-3.5 h-3.5" /> Ineligible
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Main details */}
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-lg text-slate-100 tracking-tight leading-snug">
                    {sch.title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-200">Amount: {sch.amount}</span>
                  </div>
                  
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {sch.description}
                  </p>
                </div>

                {/* Dates Section */}
                <div className="grid grid-cols-2 gap-4 my-4 p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider mb-0.5">Start Date</span>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{formatDate(sch.startingDate)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider mb-0.5">Deadline</span>
                    <div className={`flex items-center gap-1.5 font-semibold ${deadlineNear ? "text-amber-400 animate-pulse" : "text-slate-300"}`}>
                      <Clock className={`w-3.5 h-3.5 ${deadlineNear ? "text-amber-400" : "text-pink-400"}`} />
                      <span>{formatDate(sch.deadline)}</span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden space-y-4 pt-2 border-t border-white/5 mt-2"
                    >
                      {/* Eligibility Detail */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Eligibility Criteria</span>
                        <div className="p-3 rounded-xl bg-white/5 text-xs text-slate-300 flex items-start gap-2 leading-relaxed border border-white/5">
                          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{sch.eligibility}</span>
                        </div>
                      </div>

                      {/* Required Documents Detail */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Required Documents checklist</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {sch.requiredDocuments.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#0c1020] border border-white/5 text-[11px] text-slate-300">
                              <FileText className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                              <span className="truncate" title={doc}>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expand / Collapse Button */}
                <div className="pt-4 flex justify-between items-center mt-2 border-t border-white/5">
                  <button
                    onClick={() => setExpandedCardId(isExpanded ? null : sch.id)}
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition"
                  >
                    {isExpanded ? (
                      <>
                        Less Details <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        More Details & Docs <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  
                  {sch.status !== "closed" && (
                    <a
                      href={`mailto:${sch.provider.toLowerCase().replace(/\s+/g, "")}@cyber-tech.edu?subject=Application for ${encodeURIComponent(sch.title)}`}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 font-mono text-xs font-bold text-white transition shadow-md shadow-cyan-500/10"
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {filteredScholarships.length === 0 && (
            <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
              <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No Scholarships Found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No funding opportunities currently match your active filters or query. Check back later or adjust the filter parameters.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// ADMIN PANEL VIEW: SCHOLARSHIPS CONTROLLER
// ==========================================
interface ScholarshipsAdminSectionProps {
  scholarships: Scholarship[];
  onUpdateScholarships: (updated: Scholarship[]) => void;
}

export function ScholarshipsAdminSection({ scholarships, onUpdateScholarships }: ScholarshipsAdminSectionProps) {
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [startingDate, setStartingDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [status, setStatus] = useState<'open' | 'closed'>("open");

  // Dynamic required documents list states
  const [docInput, setDocInput] = useState("");
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddDoc = () => {
    if (!docInput.trim()) return;
    if (requiredDocs.includes(docInput.trim())) {
      setDocInput("");
      return;
    }
    setRequiredDocs([...requiredDocs, docInput.trim()]);
    setDocInput("");
  };

  const handleRemoveDoc = (index: number) => {
    setRequiredDocs(requiredDocs.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setTitle("");
    setProvider("");
    setAmount("");
    setStartingDate("");
    setDeadline("");
    setDescription("");
    setEligibility("");
    setStatus("open");
    setRequiredDocs([]);
    setDocInput("");
    setEditingId(null);
    setIsEditing(false);
  };

  const handleStartEdit = (sch: Scholarship) => {
    setEditingId(sch.id);
    setTitle(sch.title);
    setProvider(sch.provider);
    setAmount(sch.amount);
    setStartingDate(sch.startingDate);
    setDeadline(sch.deadline);
    setDescription(sch.description);
    setEligibility(sch.eligibility);
    setStatus(sch.status);
    setRequiredDocs(sch.requiredDocuments || []);
    setIsEditing(true);
    
    // Scroll to form smoothly
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !provider || !amount || !startingDate || !deadline || !description || !eligibility) {
      showToast("All fields are required to register a scholarship.");
      return;
    }

    if (requiredDocs.length === 0) {
      showToast("Please list at least one required document (e.g., Aadhaar Card, Transcript).");
      return;
    }

    const targetId = editingId || `sch-${Date.now()}`;
    const newSch: Scholarship = {
      id: targetId,
      title,
      provider,
      amount,
      startingDate,
      deadline,
      requiredDocuments: requiredDocs,
      description,
      eligibility,
      status
    };

    // Save to Firestore
    await dbService.saveScholarship(newSch);

    let updatedList: Scholarship[];
    if (editingId) {
      updatedList = scholarships.map(s => s.id === editingId ? newSch : s);
      showToast(`Scholarship updated successfully: ${title}`);
    } else {
      updatedList = [newSch, ...scholarships];
      showToast(`New Scholarship registered successfully: ${title}`);
    }

    onUpdateScholarships(updatedList);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this scholarship scheme permanently from Firestore?")) {
      await dbService.deleteScholarship(id);
      const updatedList = scholarships.filter(s => s.id !== id);
      onUpdateScholarships(updatedList);
      showToast("Scholarship removed successfully.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-pink-500/10 border border-pink-400/30 text-pink-400 text-sm flex items-center gap-2"
        >
          <Info className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Add / Edit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c0e1a]/85 border border-white/5 space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-pink-500" />
              {isEditing ? "Edit Scholarship Scheme" : "Register New Scholarship"}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Scholarship Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Merit-cum-Means Scholarship"
                  className="w-full px-3 py-2 rounded-xl bg-[#060810]/95 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Provider & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Provider</label>
                  <input
                    type="text"
                    required
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="e.g. Tata Trusts"
                    className="w-full px-3 py-2 rounded-xl bg-[#060810]/95 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Value / Amount</label>
                  <input
                    type="text"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. ₹60,000 / Sem"
                    className="w-full px-3 py-2 rounded-xl bg-[#060810]/95 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Starting & Ending dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startingDate}
                    onChange={(e) => setStartingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#060810]/95 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#060810]/95 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Status</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="status"
                      value="open"
                      checked={status === "open"}
                      onChange={() => setStatus("open")}
                      className="accent-pink-500 w-4 h-4"
                    />
                    Open
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="status"
                      value="closed"
                      checked={status === "closed"}
                      onChange={() => setStatus("closed")}
                      className="accent-pink-500 w-4 h-4"
                    />
                    Closed / Suspended
                  </label>
                </div>
              </div>

              {/* Eligibility */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Eligibility (Heuristic: "CGPA &gt; 8.5")</label>
                <input
                  type="text"
                  required
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. CGPA > 8.0, Family income < 5 LPA. CSE students."
                  className="w-full px-3 py-2 rounded-xl bg-[#060810]/95 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the scheme objectives and other guidelines..."
                  className="w-full px-3 py-2 rounded-xl bg-[#060810]/95 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Required Documents Section */}
              <div className="space-y-2 border-t border-white/5 pt-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Required Documents List</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={docInput}
                    onChange={(e) => setDocInput(e.target.value)}
                    placeholder="e.g. Income Certificate copy"
                    className="w-full px-3 py-2 rounded-xl bg-[#060810]/95 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDoc}
                    className="px-3 py-2 rounded-xl bg-pink-500/15 border border-pink-500/20 text-pink-400 hover:bg-pink-500/25 transition shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 max-h-[120px] overflow-y-auto">
                  {requiredDocs.map((doc, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-400/20 text-pink-400 text-[10px] font-mono"
                    >
                      <span>{doc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(idx)}
                        className="text-pink-400/60 hover:text-pink-300 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {requiredDocs.length === 0 && (
                    <span className="text-[10px] font-mono text-slate-500 italic">No documents added yet. Must have at least 1 document.</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-white/5">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-1/2 py-2.5 rounded-xl bg-white/5 border border-white/5 font-mono text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className={`py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-mono text-xs font-bold uppercase tracking-wider transition ${
                    isEditing ? "w-1/2" : "w-full"
                  }`}
                >
                  {isEditing ? "Update Scheme" : "Publish Scheme"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right List: Active schemes in administrative board */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c0e1a]/85 border border-white/5 space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-100 flex items-center justify-between pb-2 border-b border-white/5">
              <span>Active Scholarship Schemes ({scholarships.length})</span>
              <span className="text-xs font-mono text-slate-400">Database Live Ledger</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 px-2">Scheme</th>
                    <th className="pb-3 px-2">Provider</th>
                    <th className="pb-3 px-2">Grant Amount</th>
                    <th className="pb-3 px-2 text-center">Docs Required</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {scholarships.map((sch) => (
                    <tr key={sch.id} className="hover:bg-white/2 transition">
                      <td className="py-3 px-2">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs text-slate-200">{sch.title}</div>
                          <div className="text-[9px] font-mono text-slate-500">
                            Until: {sch.deadline}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px] text-pink-400">
                        {sch.provider}
                      </td>
                      <td className="py-3 px-2 text-xs font-bold text-emerald-400 font-mono">
                        {sch.amount}
                      </td>
                      <td className="py-3 px-2 text-center text-xs font-semibold text-slate-300 font-mono">
                        {sch.requiredDocuments?.length || 0}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStartEdit(sch)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sch.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {scholarships.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-slate-500 font-mono italic">
                        No scholarships available in Firestore yet. Use the registration form to create the first one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
