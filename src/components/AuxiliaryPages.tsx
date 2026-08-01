import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Users, 
  Briefcase, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Search, 
  FileDown, 
  Award,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Cpu,
  FileText,
  Download
} from "lucide-react";
import { 
  Notice, 
  CollegeEvent, 
  PlacementJob, 
  FacultyMember, 
  DepartmentItem,
  LibraryBook,
  StudyMaterial,
  ExamSchedule,
  UserProfile
} from "../types";
import { generatePDF } from "../utils/pdfGenerator";

// --- DEPARTMENTS COMPONENT ---
interface LabResource {
  id: string;
  deptId: string;
  name: string;
  labName: string;
  status: "Available" | "In Use" | "Reserved";
  reservedBy?: string;
  slot?: string;
  date?: string;
}

interface DepartmentsViewProps {
  departments: DepartmentItem[];
  onUpdateDepartments?: (depts: DepartmentItem[]) => void;
  currentUser?: UserProfile | null;
}

export function DepartmentsView({ departments, onUpdateDepartments, currentUser }: DepartmentsViewProps) {
  // Lab Resource State
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>("dept-01"); // Default to CSE
  const [resources, setResources] = useState<LabResource[]>([
    { id: "res-1", deptId: "dept-01", name: "PANDA H100 AI Supercomputing Cluster", labName: "PANDA Neural Engineering Lab", status: "Available" },
    { id: "res-2", deptId: "dept-01", name: "Anish Quantum Simulation Array v2", labName: "Next-Gen Cryptography Suite", status: "In Use", reservedBy: "Dr. Evelyn Vance" },
    { id: "res-3", deptId: "dept-02", name: "NVIDIA Jetson AGX Drone Fleet", labName: "Cognitive Swarm Robotics Lab", status: "Available" },
    { id: "res-4", deptId: "dept-02", name: "PANDA Deep-Holographic Neural Sandbox", labName: "Computational Neuroscience Center", status: "Available" },
    { id: "res-5", deptId: "dept-03", name: "Keysight 20GHz Real-Time Signal Analyzer", labName: "RF & Microwave Design Suite", status: "Available" },
    { id: "res-6", deptId: "dept-03", name: "Industrial CNC Micro-Controller Prototyping Rig", labName: "Embedded Systems Lab", status: "Available" },
    { id: "res-7", deptId: "dept-04", name: "Boston-Style Pneumatic Bipedal Humanoid Kit", labName: "Advanced Motion & Dynamics Studio", status: "Available" },
    { id: "res-8", deptId: "dept-04", name: "Dual-Arm Collaborative Robotic Welder v2", labName: "Industrial Automation Studio", status: "In Use", reservedBy: "Prof. Charles Richards" }
  ]);

  // Reservation Form State
  const [bookingResourceId, setBookingResourceId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState("2026-07-15");
  const [bookingSlot, setBookingSlot] = useState("10:00 AM - 12:00 PM");
  
  // Custom Device Addition State
  const [showAddDeviceForm, setShowAddDeviceForm] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceLab, setNewDeviceLab] = useState("");

  // Lab Resource Reservation Handlers
  const handleStartBooking = (resourceId: string) => {
    setBookingResourceId(resourceId);
  };

  const handleConfirmBooking = (resourceId: string) => {
    if (!bookingDate) return;
    setResources(prev => prev.map(res => {
      if (res.id === resourceId) {
        return {
          ...res,
          status: "Reserved",
          reservedBy: currentUser?.name || "You",
          date: bookingDate,
          slot: bookingSlot
        };
      }
      return res;
    }));
    setBookingResourceId(null);
  };

  const handleCancelBooking = (resourceId: string) => {
    setResources(prev => prev.map(res => {
      if (res.id === resourceId) {
        return {
          ...res,
          status: "Available",
          reservedBy: undefined,
          date: undefined,
          slot: undefined
        };
      }
      return res;
    }));
  };

  // Custom Resource Creator
  const handleAddDevice = () => {
    if (!newDeviceName.trim() || !newDeviceLab.trim() || !selectedDeptId) return;
    const newRes: LabResource = {
      id: `res-${Date.now()}`,
      deptId: selectedDeptId,
      name: newDeviceName.trim(),
      labName: newDeviceLab.trim(),
      status: "Available"
    };
    setResources(prev => [...prev, newRes]);
    setNewDeviceName("");
    setNewDeviceLab("");
    setShowAddDeviceForm(false);
  };

  const activeDept = departments.find(d => d.id === selectedDeptId);
  const activeResources = resources.filter(res => res.deptId === selectedDeptId);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight">Academic Departments</h1>
          <p className="text-sm text-slate-400">Review departments, add custom blocks, and reserve live high-performance research equipment.</p>
        </div>
      </div>

      {/* Main Responsive Layout: Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Department List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">Select Department Block</h3>
            {selectedDeptId && (
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md uppercase">
                Active Selection
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {departments.map((dept) => {
              const isSelected = selectedDeptId === dept.id;
              return (
                <div 
                  key={dept.id} 
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`p-5 rounded-2xl glass-panel border space-y-4 transition cursor-pointer flex flex-col justify-between ${
                    isSelected ? "border-indigo-500 bg-indigo-500/[0.02] shadow-[0_0_15px_rgba(99,102,241,0.05)]" : "border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                      isSelected ? "bg-indigo-500/10 border-indigo-400/30 text-indigo-400" : "bg-white/5 border-white/10 text-slate-400"
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-400 font-mono font-bold uppercase shrink-0">
                        {dept.code} Block
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-display font-bold text-base text-slate-100 leading-tight">{dept.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">HOD: <span className="font-semibold text-slate-200">{dept.hod}</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-center font-mono text-xs mt-3">
                    <div className="p-2 rounded-xl bg-white/5">
                      <div className="text-slate-500 text-[9px] uppercase tracking-wider">Students</div>
                      <div className="text-slate-100 font-bold mt-0.5">{dept.studentsCount}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5">
                      <div className="text-slate-500 text-[9px] uppercase tracking-wider">Research Labs</div>
                      <div className="text-slate-100 font-bold mt-0.5">{dept.labsCount}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Lab Resources Scheduler */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Cpu className="w-4 h-4 text-indigo-400" /> Lab Scheduler & Reservation
            </h3>
            {selectedDeptId && (
              <button
                onClick={() => setShowAddDeviceForm(!showAddDeviceForm)}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 border border-cyan-400/20 bg-cyan-400/[0.04] px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Add Device
              </button>
            )}
          </div>

          {selectedDeptId ? (
            <motion.div 
              key={selectedDeptId}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-white/10 bg-[#090b14] p-6 space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none" />

              <div>
                <span className="text-[9px] font-mono text-indigo-400 tracking-wider uppercase bg-indigo-500/10 border border-indigo-400/20 px-2.5 py-0.5 rounded-full font-bold">
                  {activeDept?.code || "CTU"} LAB INFRASTRUCTURE
                </span>
                <h3 className="font-display font-bold text-lg text-slate-100 mt-2">
                  {activeDept?.name || "Select a Department"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Active live simulation reservation and allocation panel for research equipment.
                </p>
              </div>

              {/* Add Device Inline Drawer */}
              {showAddDeviceForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                >
                  <h4 className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Add Lab Equipment / Device</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Equipment Name (e.g. H100 Server)"
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                    <input
                      type="text"
                      placeholder="Lab Location (e.g. Room 402, Block A)"
                      value={newDeviceLab}
                      onChange={(e) => setNewDeviceLab(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowAddDeviceForm(false)}
                        className="px-3 py-1 rounded bg-white/5 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddDevice}
                        className="px-3 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold font-mono"
                      >
                        Register Device
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Devices List */}
              <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                {activeResources.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-mono">
                    No active research gear registered under this block. Registered devices will appear here.
                  </div>
                ) : (
                  activeResources.map((res) => {
                    const isBookingThis = bookingResourceId === res.id;
                    return (
                      <div 
                        key={res.id}
                        className={`p-4 rounded-2xl border bg-black/20 transition-all ${
                          res.status === "Reserved" ? "border-indigo-500/20 bg-indigo-500/[0.01]" : isBookingThis ? "border-cyan-400 bg-cyan-500/[0.01]" : "border-white/5"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-100">{res.name}</h4>
                            <p className="text-[10px] font-mono text-slate-500">{res.labName}</p>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="shrink-0 text-[9px] font-mono font-bold uppercase tracking-wider">
                            {res.status === "Available" && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">Available</span>
                            )}
                            {res.status === "In Use" && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">In Use</span>
                            )}
                            {res.status === "Reserved" && (
                              <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">Reserved</span>
                            )}
                          </div>
                        </div>

                        {/* Booking Context or Interactive Flow */}
                        {res.status === "Reserved" ? (
                          <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="font-mono text-[10px] text-slate-400">
                              Reserved by <span className="text-indigo-300 font-semibold">{res.reservedBy}</span>
                              {res.date && <div className="text-[9px] text-slate-500 mt-0.5">Date: {res.date} | {res.slot}</div>}
                            </div>
                            {res.reservedBy === (currentUser?.name || "You") && (
                              <button
                                onClick={() => handleCancelBooking(res.id)}
                                className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider font-bold rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition"
                              >
                                Release Slot
                              </button>
                            )}
                          </div>
                        ) : res.status === "In Use" ? (
                          <div className="mt-3 font-mono text-[9px] text-slate-500">
                            Currently being utilized by department research staff ({res.reservedBy}). Freeing shortly.
                          </div>
                        ) : isBookingThis ? (
                          // Interactive Booking form inline
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3.5 pt-3 border-t border-white/5 space-y-3"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-slate-500 uppercase">Target Date</label>
                                <input
                                  type="date"
                                  value={bookingDate}
                                  onChange={(e) => setBookingDate(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-slate-300 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-slate-500 uppercase">Available Slot</label>
                                <select
                                  value={bookingSlot}
                                  onChange={(e) => setBookingSlot(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-slate-300 focus:outline-none"
                                >
                                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                onClick={() => setBookingResourceId(null)}
                                className="px-2.5 py-1 rounded bg-white/5 text-slate-400 font-mono text-[9px] uppercase font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleConfirmBooking(res.id)}
                                className="px-3 py-1 rounded bg-cyan-400 text-slate-950 font-mono text-[9px] uppercase font-bold hover:bg-cyan-300 transition"
                              >
                                Confirm Allocation
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          // Action trigger
                          <div className="mt-3.5 pt-2.5 border-t border-white/5 flex justify-end">
                            <button
                              onClick={() => handleStartBooking(res.id)}
                              className="px-3 py-1 text-[9px] font-mono uppercase tracking-wider font-bold rounded-lg bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition flex items-center gap-1"
                            >
                              <Calendar className="w-3 h-3" /> Book Device
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] text-center text-xs text-slate-500 font-mono">
              Please click on any department block to view its real-time specialized equipment and schedule resources.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- FACULTY COMPONENT ---
interface FacultyViewProps {
  faculty: FacultyMember[];
}

export function FacultyView({ faculty }: FacultyViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaculty = faculty.filter(fac => 
    fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fac.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight">Faculty Directory</h1>
          <p className="text-sm text-slate-400">Contact leading researchers, advisors, and mentors at Cyber-Tech.</p>
        </div>
        
        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search faculty or research..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-slate-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredFaculty.map((fac) => (
          <div key={fac.id} className="p-4 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between space-y-4 hover:border-purple-400/30 transition">
            <div className="flex flex-col items-center text-center space-y-3">
              <img 
                src={fac.imageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"} 
                alt={fac.name} 
                className="w-24 h-24 rounded-2xl object-cover border border-purple-500/20 shadow-lg shadow-purple-500/5"
              />
              <div>
                <h3 className="font-display font-bold text-md text-slate-100">{fac.name}</h3>
                <span className="text-[11px] font-mono font-bold text-purple-400 uppercase">{fac.designation}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Department</span>
                <span className="text-slate-300 font-sans">{fac.department}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Research Focus</span>
                <span className="text-slate-300 font-sans line-clamp-1">{fac.specialization}</span>
              </div>
              <div className="text-[10px] text-cyan-400 pt-1 text-center border-t border-white/5 break-all">
                {fac.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- PLACEMENTS COMPONENT ---
interface PlacementsViewProps {
  placements: PlacementJob[];
  onApply: (jobId: string) => void;
}

export function PlacementsView({ placements, onApply }: PlacementsViewProps) {
  const [filter, setFilter] = useState<"all" | "tech" | "management">("all");

  const filteredJobs = placements.filter(j => 
    filter === "all" ? true : j.category === filter
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight">Active Careers & Placements</h1>
          <p className="text-sm text-slate-400">Unlock opportunities at top tier tech corporations visiting this semester.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/5">
          <button 
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === "all" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
          >
            All Roles
          </button>
          <button 
            onClick={() => setFilter("tech")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === "tech" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Technology
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="p-5 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between space-y-4 hover:border-amber-400/30 transition relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-display font-bold text-lg text-slate-100">{job.company}</h3>
                <span className="px-2.5 py-1 rounded text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold">
                  {job.ctc}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-300">{job.position}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eligibility: <span className="text-slate-300 font-mono">{job.eligibility}</span>
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-xs font-mono text-slate-500">Deadline: {job.deadline}</span>
              {job.status === "open" ? (
                <button
                  onClick={() => onApply(job.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-mono text-xs font-bold text-white uppercase tracking-wider transition hover:opacity-90 shadow-lg shadow-cyan-500/10"
                >
                  Quick Apply
                </button>
              ) : job.status === "applied" ? (
                <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Applied
                </span>
              ) : (
                <span className="px-4 py-2 rounded-xl bg-white/5 text-slate-500 font-mono text-xs">Closed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- NOTES HUB COMPONENT ---
interface NotesViewProps {
  currentUser?: UserProfile | null;
  studyMaterials: StudyMaterial[];
  exams: ExamSchedule[];
  onTriggerAISummary?: (material: StudyMaterial) => void;
}

interface PYQ {
  id: string;
  title: string;
  subject: string;
  year: string;
  semester: number;
  department: string;
  size: string;
  type: string;
  date: string;
  content: string;
}

const INITIAL_PYQS: PYQ[] = [
  {
    id: "pyq-1",
    title: "End-Sem Exam 2025 - Data Structures & Algorithms",
    subject: "Data Structures & Algorithms (DSA)",
    year: "2025",
    semester: 3,
    department: "Computer Science & Engineering",
    size: "2.8 MB",
    type: "PDF",
    date: "Dec 12, 2025",
    content: "PANDA NOTES HUB - PAST YEAR QUESTION PAPER\n==========================================\nSubject: Data Structures & Algorithms (CS-301)\nTerm: End-Semester Exam 2025\nDepartment: Computer Science & Engineering\n\nSection A [20 Marks] - Short Answers:\n1. Prove that the worst-case running time of insertion sort is O(n^2) while the best-case is O(n).\n2. Explain the difference between internal and external fragmentation with examples.\n3. Show how a binary min-heap is represented as a sequential array list.\n\nSection B [40 Marks] - Algorithm Design & Analysis:\n4. Draw the AVL tree resulting from inserting the keys: 15, 20, 24, 10, 13, 12, 14 in order. Show single and double rotations.\n5. Write pseudo-code for a non-recursive depth-first traversal of a graph. Analyze its space and time complexity.\n\nSection C [40 Marks] - Advanced Data Structures:\n6. Prove that the shortest path computed by Dijkstra's algorithm is correct under non-negative edge weights.\n7. Design a Hash map with quadratic probing. Discuss conflict resolution and load-factor scaling thresholds."
  },
  {
    id: "pyq-2",
    title: "Mid-Sem Exam 2025 - Machine Learning Foundations",
    subject: "Machine Learning Foundations",
    year: "2025",
    semester: 5,
    department: "Artificial Intelligence & Data Science",
    size: "1.1 MB",
    type: "PDF",
    date: "Sep 18, 2025",
    content: "PANDA NOTES HUB - PAST YEAR QUESTION PAPER\n==========================================\nSubject: Machine Learning Foundations (AI-501)\nTerm: Mid-Semester Exam 2025\nDepartment: Artificial Intelligence & Data Science\n\nSection A - Conceptual Questions:\n1. Derive the loss function for logistic regression from the likelihood maximization principle.\n2. Why is L1 regularization (Lasso) preferred over L2 regularization (Ridge) for feature selection?\n\nSection B - Math & Derivations:\n3. Compute the information gain and Gini index for split criteria on a decision tree nodes with counts [35+, 15-].\n4. Write down the hard-margin SVM primal optimization problem. Formulate its dual representation using Lagrange multipliers.\n\nSection C - Algorithms:\n5. Detail the steps of the K-Means clustering algorithm. Under what conditions is it guaranteed to converge to a global minimum?"
  },
  {
    id: "pyq-3",
    title: "End-Sem Exam 2024 - Analog Circuits",
    subject: "Analog Circuits",
    year: "2024",
    semester: 3,
    department: "Electronics & Communication Engineering",
    size: "3.4 MB",
    type: "PDF",
    date: "Nov 30, 2024",
    content: "PANDA NOTES HUB - PAST YEAR QUESTION PAPER\n==========================================\nSubject: Analog Circuits (EC-301)\nTerm: End-Semester Exam 2024\nDepartment: Electronics & Communication Engineering\n\nSection A - Semiconductor Electronics:\n1. Plot the small-signal equivalent model of a common-emitter BJT amplifier. Derive expressions for voltage gain.\n2. Discuss thermal runaway in transistor biasing and how emitter resistance helps in stabilization.\n\nSection B - Amplifiers & Feedback:\n3. State the Barkhausen criterion for self-sustained oscillations. Design a Wein-bridge oscillator for a 1kHz frequency.\n4. Draw the schematic of a two-stage CMOS Operational Amplifier (Op-Amp) and explain the frequency compensation scheme.\n\nSection C - Active Filters:\n5. Design a second-order Butterworth low-pass active filter with a cutoff frequency of 5 kHz."
  },
  {
    id: "pyq-4",
    title: "Mid-Sem Exam 2026 - Control Systems & Sensor Fusion",
    subject: "Control Systems & Sensor Fusion",
    year: "2026",
    semester: 5,
    department: "Robotics & Automation",
    size: "1.9 MB",
    type: "PDF",
    date: "Mar 05, 2026",
    content: "PANDA NOTES HUB - PAST YEAR QUESTION PAPER\n==========================================\nSubject: Control Systems & Sensor Fusion (RB-501)\nTerm: Mid-Semester Exam 2026\nDepartment: Robotics & Automation\n\nSection A - Control Theory:\n1. Determine the stability of a system represented by the characteristic equation: s^4 + 2s^3 + 3s^2 + 4s + 5 = 0 using Routh-Hurwitz.\n2. Define Root Locus. Explain the rules for finding the angles of asymptotes and departure.\n\nSection B - Sensor Fusion Mathematics:\n3. Elaborate on the prediction and measurement update equations of a Discrete-Time Kalman Filter.\n4. Describe how IMU accelerometers and gyroscopes are combined using a complementary filter to obtain a stable pitch and roll angle.\n\nSection C - Robotics Systems:\n5. Write down the DH parameter table for a standard 3-DOF SCARA robotic arm and derive its forward kinematics equations."
  },
  {
    id: "pyq-5",
    title: "End-Sem Exam 2024 - Operating Systems",
    subject: "Operating Systems",
    year: "2024",
    semester: 4,
    department: "Computer Science & Engineering",
    size: "1.7 MB",
    type: "PDF",
    date: "May 22, 2024",
    content: "PANDA NOTES HUB - PAST YEAR QUESTION PAPER\n==========================================\nSubject: Operating Systems (CS-401)\nTerm: End-Semester Exam 2024\nDepartment: Computer Science & Engineering\n\nSection A - Process Management:\n1. Illustrate the process state transition diagram. What are the roles of long-term, medium-term, and short-term schedulers?\n2. Solve the Dining Philosophers synchronization problem using semaphores. Ensure no deadlock or starvation occurs.\n\nSection B - Memory & Storage:\n3. Given memory partitions [100K, 500K, 200K, 300K, 600K], show how First-fit, Best-fit, and Worst-fit place processes of sizes [212K, 417K, 112K].\n4. Discuss virtual memory. Calculate page faults for reference string [1, 2, 3, 4, 1, 2, 5, 1, 2, 3] under LRU and FIFO algorithms with 3 frames.\n\nSection C - File Systems & Security:\n5. Explain Indexed allocation of disk space. How does Unix utilize direct and indirect block pointers in inodes?"
  },
  {
    id: "pyq-6",
    title: "Mid-Sem Exam 2025 - Microprocessors & Embedded Controllers",
    subject: "Microprocessors & Embedded Controllers",
    year: "2025",
    semester: 5,
    department: "Electronics & Communication Engineering",
    size: "2.3 MB",
    type: "PDF",
    date: "Oct 04, 2025",
    content: "PANDA NOTES HUB - PAST YEAR QUESTION PAPER\n==========================================\nSubject: Microprocessors & Embedded Controllers (EC-501)\nTerm: Mid-Semester Exam 2025\nDepartment: Electronics & Communication Engineering\n\nSection A - Assembly Coding:\n1. Write an 8086 assembly program to search for a byte in an array of 100 elements. Use loop and string instructions.\n2. Detail the interrupt vector table of 8086 and describe the sequence of events when an interrupt is triggered.\n\nSection B - Hardware Interfacing:\n3. Interface a 16x2 LCD display to an 8051 microcontroller. Write a C program to display 'WELCOME TO NOTES HUB'.\n4. Contrast microprocessor architectures: RISC vs CISC, Harvard vs Von-Neumann.\n\nSection C - NVIC & Timers:\n5. Explain the Nested Vectored Interrupt Controller (NVIC) in ARM Cortex-M microcontrollers. How does it manage nested interrupt prioritization?"
  }
];

export function NotesView({ currentUser, studyMaterials, exams, onTriggerAISummary }: NotesViewProps) {
  const examSchedules = exams || [];

  // Helper mapping to associate notes/materials with correct departments dynamically
  const getMaterialDept = (materialSubject: string): string => {
    const sub = materialSubject.toLowerCase();
    if (sub.includes("intelligence") || sub.includes("neural") || sub.includes("machine learning") || sub.includes("nlp") || sub.includes("natural language") || sub.includes("deep learning") || sub.includes("vision")) {
      return "Artificial Intelligence & Data Science";
    }
    if (sub.includes("electronics") || sub.includes("analog") || sub.includes("microprocessor") || sub.includes("vlsi") || sub.includes("signal processing") || sub.includes("wireless")) {
      return "Electronics & Communication Engineering";
    }
    if (sub.includes("robot") || sub.includes("actuator") || sub.includes("control system") || sub.includes("sensor") || sub.includes("plc") || sub.includes("automation")) {
      return "Robotics & Automation";
    }
    return "Computer Science & Engineering";
  };

  // State for selected Department. Matches currentUser's department initially if student
  const [selectedDept, setSelectedDept] = useState<string>(() => {
    if (currentUser?.role === "student" && currentUser.department) {
      return currentUser.department;
    }
    return "All Departments";
  });

  const [activeSubTab, setActiveSubTab] = useState<"notes" | "pyqs">("notes");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const deptCards = [
    { name: "All Departments", code: "ALL", desc: "Show all academic resources", color: "from-blue-500/20 to-indigo-600/20 shadow-indigo-500/5 hover:border-indigo-500/30", textBadge: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    { name: "Computer Science & Engineering", code: "CSE", desc: "Algorithms, OS, Cloud & Compiler Theory", color: "from-cyan-500/20 to-blue-600/20 shadow-cyan-500/5 hover:border-cyan-500/30", textBadge: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    { name: "Artificial Intelligence & Data Science", code: "AIDS", desc: "Deep Learning, NLP & Neural Networks", color: "from-purple-500/20 to-pink-600/20 shadow-purple-500/5 hover:border-purple-500/30", textBadge: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { name: "Electronics & Communication Engineering", code: "ECE", desc: "Analog Circuits, VLSI & Microcontrollers", color: "from-amber-500/20 to-orange-600/20 shadow-amber-500/5 hover:border-amber-500/30", textBadge: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { name: "Robotics & Automation", code: "ROBO", desc: "Sensor Fusion, Actuators & PLC Systems", color: "from-rose-500/20 to-red-600/20 shadow-rose-500/5 hover:border-rose-500/30", textBadge: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  ];

  // Filtering study notes & PYQs dynamically
  const filteredNotes = studyMaterials.filter((material) => {
    if (selectedDept === "All Departments") return true;
    const dept = getMaterialDept(material.subject);
    return dept === selectedDept;
  });

  const filteredPYQs = INITIAL_PYQS.filter((pyq) => {
    if (selectedDept === "All Departments") return true;
    return pyq.department === selectedDept;
  });

  // Real download of document using HTML5 PDF Generation
  const handleRealDownload = (title: string, contentText: string, docId: string) => {
    setDownloadingId(docId);
    
    setTimeout(() => {
      const formattedContent = contentText || `Compiled Syllabus notes kit for preparation.\nGenerated securely via PANDA Notes Hub.`;
      const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_notes_hub.pdf`;
      
      generatePDF(
        filename,
        title,
        `Academic Resource | Ref ID: ${docId}`,
        formattedContent
      );
      setDownloadingId(null);
    }, 1200); // realistic spinner delay
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section with branding */}
      <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-400" /> Notes Hub
          </h1>
          <p className="text-sm text-slate-400">Download compiled syllabus notes, access Previous Year Questions (PYQs), and inspect schedules.</p>
        </div>
        {currentUser?.role === "student" && (
          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-xs text-indigo-300 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Profile Match: {currentUser.department}</span>
          </div>
        )}
      </div>

      {/* Step 1: Select Department Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 uppercase tracking-widest font-semibold">
          <ChevronRight className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Step 1: Select Department to Filter Notes & PYQs</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {deptCards.map((dept) => {
            const isSelected = selectedDept === dept.name;
            const isStudentDept = currentUser?.role === "student" && currentUser.department === dept.name;
            
            return (
              <button
                key={dept.code}
                onClick={() => setSelectedDept(dept.name)}
                className={`p-4 rounded-xl text-left border transition relative overflow-hidden flex flex-col justify-between group ${
                  isSelected 
                    ? "bg-white/10 border-white/20 shadow-lg" 
                    : `bg-[#0b0d19]/80 border-white/5 hover:bg-white/5`
                }`}
              >
                {/* Visual Glow */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-tr ${dept.color} rounded-full blur-xl opacity-30 group-hover:opacity-50 transition`} />
                
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${dept.textBadge}`}>
                      {dept.code}
                    </span>
                    {isStudentDept && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Your Department" />
                    )}
                  </div>
                  <h3 className={`text-xs font-bold mt-2 ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                    {dept.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug pt-1">
                    {dept.desc}
                  </p>
                </div>

                {/* Bottom line highlights */}
                {isSelected && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Materials & PYQs lists + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* Left column (7 cols): Document list */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
          {/* Sub tabs: Notes vs PYQs */}
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div className="flex rounded-xl bg-[#090b14] p-1 border border-white/5">
              <button
                onClick={() => setActiveSubTab("notes")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition ${
                  activeSubTab === "notes" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Notes & Cheat Sheets ({filteredNotes.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab("pyqs")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition ${
                  activeSubTab === "pyqs" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Past Year Papers (PYQs) ({filteredPYQs.length})</span>
              </button>
            </div>

            <div className="hidden sm:block text-[10px] font-mono text-slate-500">
              Department: <span className="text-indigo-400 font-bold">{selectedDept === "All Departments" ? "ALL" : selectedDept.split(" ")[0]}</span>
            </div>
          </div>

          {/* List display */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {activeSubTab === "notes" ? (
              filteredNotes.length > 0 ? (
                filteredNotes.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/10 transition group relative overflow-hidden">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition">{doc.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono flex-wrap">
                        <span className="text-slate-300">{doc.subject}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase">{doc.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span>{doc.size}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span>{doc.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0 relative z-10">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition text-[11px] font-mono flex items-center gap-1"
                      >
                        Preview
                      </button>
                      {onTriggerAISummary && (
                        <button 
                          onClick={() => onTriggerAISummary(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 hover:bg-indigo-500 hover:text-slate-950 transition flex items-center gap-1 font-mono text-[11px]"
                          title="Analyze with PANDA AI Summarizer"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> <span>AI Summarize</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleRealDownload(doc.title, doc.content || "", doc.id)}
                        disabled={downloadingId !== null}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition flex items-center gap-1 font-mono text-[11px]"
                      >
                        {downloadingId === doc.id ? (
                          <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{downloadingId === doc.id ? "GET..." : "GET"}</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                  No lecture notes uploaded for this department yet. Try switching to "All Departments".
                </div>
              )
            ) : (
              filteredPYQs.length > 0 ? (
                filteredPYQs.map((pyq) => (
                  <div key={pyq.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/10 transition group relative overflow-hidden">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-200 group-hover:text-purple-400 transition">{pyq.title}</h3>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[8px] font-mono uppercase tracking-wider font-bold">
                          PYQ Paper
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono flex-wrap">
                        <span className="text-slate-300">{pyq.subject}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className="text-slate-400">Year: {pyq.year}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className="text-slate-400">Sem {pyq.semester}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span>{pyq.size}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0 relative z-10">
                      <button
                        onClick={() => setSelectedDoc(pyq)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition text-[11px] font-mono flex items-center gap-1"
                      >
                        Preview
                      </button>
                      {onTriggerAISummary && (
                        <button 
                          onClick={() => {
                            onTriggerAISummary({
                              id: pyq.id,
                              title: pyq.title,
                              type: pyq.type,
                              size: pyq.size,
                              date: pyq.date,
                              subject: pyq.subject,
                              content: pyq.content
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-400/20 text-purple-400 hover:bg-purple-500 hover:text-slate-950 transition flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> <span>AI Summarize</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleRealDownload(pyq.title, pyq.content, pyq.id)}
                        disabled={downloadingId !== null}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition flex items-center gap-1 font-mono text-[11px]"
                      >
                        {downloadingId === pyq.id ? (
                          <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{downloadingId === pyq.id ? "GET..." : "GET"}</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                  No Past Year Question papers uploaded for this department yet. Try switching to "All Departments".
                </div>
              )
            )}
          </div>
        </div>

        {/* Right column (5 cols): Official Exam schedule */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h2 className="font-display font-bold text-lg text-slate-100">Official Exam Calendar</h2>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 font-mono font-bold">
              MID_SEM_6
            </span>
          </div>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {examSchedules.map((exam, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 hover:bg-white/[0.08] transition">
                <div className="flex justify-between text-xs">
                  <span className="font-mono text-indigo-400 font-bold">{exam.code}</span>
                  <span className="font-mono text-slate-400">{exam.date}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 leading-snug">{exam.subject}</h3>
                <div className="text-[10px] text-slate-500 font-mono pt-1.5 border-t border-white/5 flex justify-between">
                  <span>Slot: {exam.session}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Preview Modal for Study Notes & PYQs */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-[10000]">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl rounded-2xl bg-[#0b0d19] border border-white/10 p-6 relative flex flex-col max-h-[85vh] overflow-hidden shadow-2xl"
          >
            {/* Blinking border strip indicator */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500" />

            {/* Header info */}
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-400/20 text-indigo-400">
                    {selectedDoc.type || "PDF"} Document
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Size: {selectedDoc.size}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">{selectedDoc.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedDoc.subject}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document body preview content simulation */}
            <div className="flex-grow overflow-y-auto bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[350px]">
              {selectedDoc.content || `Notes Hub Document Preview\n===========================\nSubject: ${selectedDoc.subject}\n\nKey Concepts, study references, and syllabus curriculum guidelines compiled by the department staff.\nTo access full illustrations, mathematical layouts, and code implementations, click the GET button below to download the complete document package.`}
            </div>

            {/* Modal action buttons footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <span className="text-[10px] font-mono text-slate-500">PANDA Secure Repository</span>
              <div className="flex gap-2">
                {onTriggerAISummary && (
                  <button
                    onClick={() => {
                      onTriggerAISummary({
                        id: selectedDoc.id,
                        title: selectedDoc.title,
                        type: selectedDoc.type || "PDF",
                        size: selectedDoc.size,
                        date: selectedDoc.date || "2026",
                        subject: selectedDoc.subject,
                        content: selectedDoc.content
                      });
                      setSelectedDoc(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 hover:bg-indigo-500 hover:text-slate-950 text-xs font-semibold font-mono transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Summarize</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleRealDownload(selectedDoc.title, selectedDoc.content || "", selectedDoc.id);
                    setSelectedDoc(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold font-mono transition flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download file (PDF)</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// --- EVENTS COMPONENT ---
interface EventsViewProps {
  events: CollegeEvent[];
}

export function EventsView({ events }: EventsViewProps) {
  const [registered, setRegistered] = useState<Record<string, boolean>>({});

  const toggleRegister = (id: string) => {
    setRegistered(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/5">
        <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight">Campus Events Coordinator</h1>
        <p className="text-sm text-slate-400">Unlock tickets to leading hackathons, tech symposiums, and electronic cultural fests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => {
          const isReg = registered[evt.id];
          return (
            <div key={evt.id} className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between space-y-4 hover:border-cyan-400/30 transition relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 font-mono font-bold uppercase tracking-wider">
                    {evt.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{evt.date}</span>
                </div>
                
                <h3 className="font-display font-bold text-lg text-slate-100 leading-tight">{evt.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{evt.description}</p>
                <div className="text-[10px] text-slate-500 font-mono">Location: {evt.location}</div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-[10px] text-slate-400 font-mono">{evt.attendeesCount + (isReg ? 1 : 0)} Registered</span>
                <button
                  onClick={() => toggleRegister(evt.id)}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition ${
                    isReg 
                      ? "bg-emerald-500/10 border border-emerald-400/30 text-emerald-400" 
                      : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {isReg ? "Ticket Secured ✓" : "Secure Free Pass"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
