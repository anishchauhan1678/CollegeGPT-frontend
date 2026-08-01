import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ClipboardCheck, 
  User, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  Sliders, 
  RefreshCw,
  BookMarked,
  Layers,
  GraduationCap
} from "lucide-react";
import { StudentRecord, UserProfile, CollegeSubject, DepartmentItem } from "../types";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, query, where } from "firebase/firestore";

interface AttendanceCountProps {
  students: StudentRecord[];
  currentUser: UserProfile | null;
  subjects: CollegeSubject[];
  departments: DepartmentItem[];
}

interface AttendanceCountRecord {
  id: string;
  studentRoll: string;
  studentName: string;
  subject: string;
  teacherClasses: number;
  studentClasses: number;
  requiredPercentage: number;
  year: number;
  month: string;
  createdAt: number;
}

const POPULAR_SUBJECTS = [
  "Python Programming",
  "Artificial Intelligence & Neural Networks",
  "Operating Systems",
  "Database Management Systems (DBMS)",
  "Data Structures & Algorithms (DSA)",
  "Web Technologies",
  "Computer Networks",
  "Machine Learning",
  "Software Engineering"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = [2026, 2025, 2024];

export default function AttendanceCount({ students, currentUser, subjects, departments }: AttendanceCountProps) {
  // Local ledger of saved records
  const [ledger, setLedger] = useState<AttendanceCountRecord[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);

  // Form states
  const [studentRoll, setStudentRoll] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentDept, setStudentDept] = useState("Computer Science & Engineering");
  const [subject, setSubject] = useState("");
  const [teacherClasses, setTeacherClasses] = useState<number>(30);
  const [studentClasses, setStudentClasses] = useState<number>(19);
  const [requiredPercentage, setRequiredPercentage] = useState<number>(75);
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<string>("July");

  // Error/Success state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtered subjects based on selected department
  const filteredSubjects = subjects.filter(sub => sub.department === studentDept);

  // Auto-update subject when studentDept changes or subjects load
  useEffect(() => {
    if (filteredSubjects.length > 0) {
      const exists = filteredSubjects.some(sub => sub.name === subject);
      if (!exists) {
        setSubject(filteredSubjects[0].name);
      }
    } else {
      setSubject("");
    }
  }, [studentDept, subjects]);

  // Initialize form with current student user details if applicable
  useEffect(() => {
    if (currentUser && currentUser.role === "student") {
      setStudentRoll(currentUser.rollNo || "");
      setStudentName(currentUser.name || "");
      if (currentUser.department) {
        setStudentDept(currentUser.department);
      }
    } else if (students.length > 0) {
      setStudentRoll(students[0].roll);
      setStudentName(students[0].name);
      if (students[0].department) {
        setStudentDept(students[0].department);
      }
    }
  }, [currentUser, students]);

  // Handle student roll selection change
  const handleRollChange = (roll: string) => {
    setStudentRoll(roll);
    const found = students.find(s => s.roll === roll);
    if (found) {
      setStudentName(found.name);
      if (found.department) {
        setStudentDept(found.department);
      }
    }
  };

  // Load ledger records from Firestore / LocalStorage on mount
  const loadLedger = async () => {
    setIsLoadingLedger(true);
    try {
      if (currentUser) {
        // Fetch from Firestore
        const q = query(
          collection(db, "users", currentUser.id, "attendance_counts")
        );
        const querySnapshot = await getDocs(q);
        const records: AttendanceCountRecord[] = [];
        querySnapshot.forEach((docSnap) => {
          const d = docSnap.data();
          records.push({
            id: docSnap.id,
            studentRoll: d.studentRoll,
            studentName: d.studentName,
            subject: d.subject,
            teacherClasses: d.teacherClasses,
            studentClasses: d.studentClasses,
            requiredPercentage: d.requiredPercentage,
            year: d.year,
            month: d.month,
            createdAt: d.createdAt || Date.now()
          });
        });
        // Sort newest first
        records.sort((a, b) => b.createdAt - a.createdAt);
        setLedger(records);
      } else {
        // Guest mode / fallback local storage
        const local = localStorage.getItem("attendance_ledger");
        if (local) {
          const parsed = JSON.parse(local);
          setLedger(parsed);
        }
      }
    } catch (err) {
      console.error("Error loading attendance count ledger:", err);
      // Fallback
      const local = localStorage.getItem("attendance_ledger");
      if (local) {
        setLedger(JSON.parse(local));
      }
    } finally {
      setIsLoadingLedger(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [currentUser]);

  // Calculations
  const currentPercentage = teacherClasses > 0 ? (studentClasses / teacherClasses) * 100 : 0;
  const isQualifiedNow = currentPercentage >= requiredPercentage;

  // Scenario 1: Fixed classes held for the month.
  // How many more classes does the student need to attend out of this month's classes to hit the percentage?
  const requiredAttendedCount = Math.ceil(teacherClasses * (requiredPercentage / 100));
  const fixedRemainingToAttend = Math.max(0, requiredAttendedCount - studentClasses);
  const isPossibleInFixed = studentClasses + (teacherClasses - teacherClasses) >= requiredAttendedCount; // if classes are already finished, can they reach it?
  
  // Scenario 2: Teacher has held 'teacherClasses' so far.
  // Assuming the teacher continues to hold classes, how many consecutive subsequent classes must the student attend
  // to pull up their percentage to 'requiredPercentage'?
  // (studentClasses + x) / (teacherClasses + x) >= requiredPercentage / 100
  // studentClasses + x >= (requiredPercentage / 100) * (teacherClasses + x)
  // x * (1 - requiredPercentage / 100) >= (requiredPercentage / 100) * teacherClasses - studentClasses
  // x >= ( (requiredPercentage/100) * teacherClasses - studentClasses ) / (1 - requiredPercentage/100)
  let continuousClassesNeeded = 0;
  if (!isQualifiedNow) {
    const targetRatio = requiredPercentage / 100;
    if (targetRatio < 1) {
      const numerator = targetRatio * teacherClasses - studentClasses;
      const denominator = 1 - targetRatio;
      continuousClassesNeeded = Math.ceil(numerator / denominator);
      if (continuousClassesNeeded < 0) {
        continuousClassesNeeded = 0;
      }
    } else {
      // If target is 100%, and they missed any classes, it is impossible to ever reach 100% unless we count infinity
      continuousClassesNeeded = -1; // Flag for infinity / impossible
    }
  }

  // Maximum allowed missed classes out of teacher's classes held
  const maxAllowedMissed = Math.floor(teacherClasses * (1 - requiredPercentage / 100));
  const currentMissed = teacherClasses - studentClasses;
  const missedCountStatus = maxAllowedMissed - currentMissed;

  // Save the attendance count parameters to the ledger
  const handleSaveToLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!studentRoll.trim()) {
      setErrorMessage("Please select or enter a student Roll Number.");
      return;
    }
    if (!studentName.trim()) {
      setErrorMessage("Please enter a student Name.");
      return;
    }
    if (studentClasses > teacherClasses) {
      setErrorMessage("Student attended classes cannot exceed teacher classes held.");
      return;
    }

    const newRecordId = `att-${Date.now()}`;
    const newRecord: Omit<AttendanceCountRecord, "id"> & { id?: string } = {
      studentRoll,
      studentName,
      subject,
      teacherClasses,
      studentClasses,
      requiredPercentage,
      year,
      month,
      createdAt: Date.now()
    };

    try {
      if (currentUser) {
        // Save to Firestore
        const docRef = doc(db, "users", currentUser.id, "attendance_counts", newRecordId);
        await setDoc(docRef, newRecord);
        showTemporarySuccess("Attendance record successfully saved to Cloud!");
      } else {
        // Local state
        const updated = [{ ...newRecord, id: newRecordId } as AttendanceCountRecord, ...ledger];
        localStorage.setItem("attendance_ledger", JSON.stringify(updated));
        setLedger(updated);
        showTemporarySuccess("Saved locally! Sign in to back up your records online.");
      }
      loadLedger();
    } catch (err) {
      console.error("Error saving attendance count:", err);
      setErrorMessage("Failed to save. Storing locally instead.");
      const updated = [{ ...newRecord, id: newRecordId } as AttendanceCountRecord, ...ledger];
      localStorage.setItem("attendance_ledger", JSON.stringify(updated));
      setLedger(updated);
    }
  };

  const showTemporarySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      if (currentUser) {
        await deleteDoc(doc(db, "users", currentUser.id, "attendance_counts", id));
        showTemporarySuccess("Record deleted from Cloud database.");
      } else {
        const updated = ledger.filter(r => r.id !== id);
        localStorage.setItem("attendance_ledger", JSON.stringify(updated));
        setLedger(updated);
        showTemporarySuccess("Record deleted from local storage.");
      }
      loadLedger();
    } catch (err) {
      console.error("Error deleting attendance count record:", err);
      // Local fallback
      const updated = ledger.filter(r => r.id !== id);
      localStorage.setItem("attendance_ledger", JSON.stringify(updated));
      setLedger(updated);
    }
  };

  const loadExample = () => {
    // July month Python, teacher held 30 classes, student attended 19 classes, required percentage 75%
    setStudentDept("Computer Science & Engineering");
    setSubject("Python Programming");
    setTeacherClasses(30);
    setStudentClasses(19);
    setRequiredPercentage(75);
    setMonth("July");
    setYear(2026);
    
    // Automatically match Anish if he exists
    const anish = students.find(s => s.name.toLowerCase().includes("anish"));
    if (anish) {
      setStudentRoll(anish.roll);
      setStudentName(anish.name);
    } else {
      setStudentRoll("2024CSB1098");
      setStudentName("Anish Chauhan");
    }
    showTemporarySuccess("Loaded custom Anish Python 19/30 Classes Example!");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section with ambient typography */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest font-semibold mb-1">
            <ClipboardCheck className="w-4 h-4" />
            Attendance Intelligence Node
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
            Attendance Count
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Predict and qualify required attendance targets dynamically based on academic months.
          </p>
        </div>

        <button
          onClick={loadExample}
          className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-500/20 transition flex items-center gap-2"
        >
          <Sliders className="w-3.5 h-3.5" />
          Load Python (Anish) Example
        </button>
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* EDIT BOX / FORM CARD (5 cols) */}
        <div className="xl:col-span-5">
          <div className="p-6 rounded-2xl glass-panel border border-white/5 bg-[#0e111f]/95 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500 opacity-80" />
            
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/5">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sliders className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
                Parameter Editor
              </h2>
            </div>

            <form onSubmit={handleSaveToLedger} className="space-y-4">
              {/* Dropdown to select Student Roll No */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                  1. Student Roll Number
                </label>
                {students.length > 0 ? (
                  <select
                    value={studentRoll}
                    onChange={(e) => handleRollChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080911] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.roll}>
                        {st.roll} — {st.name}
                      </option>
                    ))}
                    {currentUser && !students.some(s => s.roll === currentUser.rollNo) && currentUser.rollNo && (
                      <option value={currentUser.rollNo}>{currentUser.rollNo} — {currentUser.name}</option>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. 2024CSB1098"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-mono uppercase text-slate-100"
                    required
                  />
                )}
              </div>

              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                  2. Student Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anish Chauhan"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              {/* Student Department */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                  3. Department
                </label>
                <select
                  value={studentDept}
                  onChange={(e) => setStudentDept(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#080911] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                  4. Select Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#080911] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                >
                  {filteredSubjects.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.code} — {sub.name} (Sem {sub.semester})
                    </option>
                  ))}
                  {filteredSubjects.length === 0 && (
                    <option value="">No subjects found for this department</option>
                  )}
                </select>
              </div>

              {/* Year & Month Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080911] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080911] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Teacher Classes Held */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                    4. Classes Held by Teacher (Days)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Default is 30</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={teacherClasses}
                  onChange={(e) => setTeacherClasses(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-mono text-slate-200"
                  required
                />
              </div>

              {/* Student Attended Classes */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                    5. Student Attended Classes
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    {teacherClasses > 0 ? `${((studentClasses / teacherClasses) * 100).toFixed(1)}% current` : ""}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={teacherClasses}
                  value={studentClasses}
                  onChange={(e) => setStudentClasses(Math.min(teacherClasses, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-mono text-slate-200"
                  required
                />
              </div>

              {/* Required Attendance Percentage */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                    6. Required Attendance Goal
                  </label>
                  <span className="text-xs text-cyan-400 font-mono font-bold">
                    {requiredPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={requiredPercentage}
                  onChange={(e) => setRequiredPercentage(parseInt(e.target.value) || 75)}
                  className="w-full h-1.5 bg-[#080911] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>50% (Minimum)</span>
                  <span>75% (Standard)</span>
                  <span>100% (Perfect)</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-mono text-xs font-bold uppercase text-white hover:opacity-90 transition shadow-lg shadow-cyan-500/15 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Record to Ledger
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {successMessage}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* AUTOMATIC CALCULATIONS & PREDICTIVE ANALYTICS VIEW (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Main Predictor Panel */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 bg-[#0a0c16]/80 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
                  Predictive Calculations
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-slate-400">
                {month} {year}
              </span>
            </div>

            {/* Status Display cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Attendance percentage wheel card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Current Status
                </span>
                
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="stroke-white/5"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className={`transition-all duration-500 ${
                        isQualifiedNow ? "stroke-emerald-500" : "stroke-rose-500"
                      }`}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - Math.min(100, currentPercentage) / 100)}
                    />
                  </svg>
                  <span className="absolute text-sm font-bold font-mono">
                    {currentPercentage.toFixed(0)}%
                  </span>
                </div>

                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold mt-3 uppercase border ${
                  isQualifiedNow 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}>
                  {isQualifiedNow ? "Qualified" : "Shortage"}
                </span>
              </div>

              {/* Class summary card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Month Ledger Matrix
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-200 mt-2">
                    {studentClasses} <span className="text-xs text-slate-500">attended of</span> {teacherClasses}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Python & Teacher held {teacherClasses} classes in {month}.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono mt-2">
                  <span className="text-slate-500">Missed classes:</span>
                  <span className="text-slate-300 font-semibold">{teacherClasses - studentClasses}</span>
                </div>
              </div>

              {/* Target requirements card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Target Criteria
                  </span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-2">
                    {requiredPercentage}% <span className="text-xs text-slate-500">Goal</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Requires attending at least <strong className="text-slate-200 font-semibold">{requiredAttendedCount} classes</strong> out of {teacherClasses}.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono mt-2">
                  <span className="text-slate-500">Allowed misses:</span>
                  <span className="text-slate-300 font-semibold">{maxAllowedMissed} classes</span>
                </div>
              </div>
            </div>

            {/* AUTOMATIC SUMMARY CARD WITH EXACT CALCULATION */}
            <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-4">
              <div className="flex items-start gap-3">
                <span className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                    Automatic Qualification Predictor
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Student <strong className="text-cyan-300 font-medium">{studentName}</strong> ({studentRoll}) is enrolled in <strong className="text-cyan-300 font-medium">{subject}</strong> for {month} {year}.
                  </p>
                </div>
              </div>

              <div className="pl-8 space-y-4">
                {/* Result Block */}
                {isQualifiedNow ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 space-y-2">
                    <p className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Attendance Goal Met!
                    </p>
                    <p className="leading-relaxed">
                      You attend **{studentClasses} classes** out of **{teacherClasses}**. Your attendance is **{currentPercentage.toFixed(1)}%**, which qualifies your required **{requiredPercentage}%** attendance.
                    </p>
                    {missedCountStatus >= 0 && (
                      <p className="text-slate-400 font-mono text-[10px]">
                        ★ You have {missedCountStatus} "buffer" classes. You can miss up to {missedCountStatus} of the remaining classes without falling below your goal.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-slate-300 space-y-2.5">
                    <p className="text-rose-400 font-mono font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Attendance Deficit Shortage
                    </p>
                    <p className="leading-relaxed">
                      You attend **{studentClasses} classes** but need **{requiredAttendedCount} classes** to reach **{requiredPercentage}%** of the currently held {teacherClasses} classes.
                    </p>

                    {/* Step-by-step logic breakdown */}
                    <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Current Deficit:</span>
                        <span className="text-rose-300 font-bold">{fixedRemainingToAttend} classes</span>
                      </div>
                      
                      {continuousClassesNeeded > 0 ? (
                        <div className="space-y-1 pt-1 border-t border-white/5">
                          <p className="text-cyan-300 font-semibold leading-normal">
                            👉 Remaining Classes to Attend for qualification: **{continuousClassesNeeded}** more consecutive classes.
                          </p>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            (This means if you attend the next {continuousClassesNeeded} classes without missing any, your attendance will be {((studentClasses + continuousClassesNeeded) / (teacherClasses + continuousClassesNeeded) * 100).toFixed(1)}% over a total of {teacherClasses + continuousClassesNeeded} classes held, successfully qualifying for {requiredPercentage}%).
                          </p>
                        </div>
                      ) : (
                        <p className="text-rose-400 text-[10px] mt-1">
                          ⚠ It is mathematically impossible to reach {requiredPercentage}% attendance inside a fixed {teacherClasses} classes month because you have already missed {currentMissed} classes.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LEDGER ARCHIVE TABLE */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 bg-[#0a0c16]/80">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <ClipboardCheck className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
                  Attendance Records Ledger
                </h2>
              </div>
              <button
                onClick={loadLedger}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition"
                title="Refresh ledger"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingLedger ? "animate-spin" : ""}`} />
              </button>
            </div>

            {isLoadingLedger ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono text-slate-500">Loading saved calculations...</span>
              </div>
            ) : ledger.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-slate-500 font-mono">No calculations saved yet.</p>
                <button
                  onClick={loadExample}
                  className="mt-3 px-3 py-1.5 text-[11px] font-mono font-bold uppercase rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition"
                >
                  Load Example Parameters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-mono font-bold uppercase text-[10px]">
                      <th className="py-3 px-2">Student</th>
                      <th className="py-3 px-2">Subject</th>
                      <th className="py-3 px-2">Month/Year</th>
                      <th className="py-3 px-2 text-center">Classes</th>
                      <th className="py-3 px-2 text-center">Rate</th>
                      <th className="py-3 px-2 text-center">Goal</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ledger.map((record) => {
                      const rate = record.teacherClasses > 0 ? (record.studentClasses / record.teacherClasses) * 100 : 0;
                      const qualified = rate >= record.requiredPercentage;
                      return (
                        <tr key={record.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-2 font-mono">
                            <div className="font-bold text-slate-200">{record.studentName}</div>
                            <div className="text-[10px] text-slate-500">{record.studentRoll}</div>
                          </td>
                          <td className="py-3 px-2 text-slate-300 font-mono font-medium max-w-[130px] truncate" title={record.subject}>
                            {record.subject}
                          </td>
                          <td className="py-3 px-2 text-slate-400 font-mono">
                            {record.month} {record.year}
                          </td>
                          <td className="py-3 px-2 text-center text-slate-200 font-mono">
                            {record.studentClasses}/{record.teacherClasses}
                          </td>
                          <td className="py-3 px-2 text-center font-bold font-mono">
                            <span className={qualified ? "text-emerald-400" : "text-rose-400"}>
                              {rate.toFixed(0)}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center text-cyan-400 font-mono font-bold">
                            {record.requiredPercentage}%
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                              qualified ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            }`}>
                              {qualified ? "Qualified" : "Deficit"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-1 rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
