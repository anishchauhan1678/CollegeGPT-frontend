import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  Calendar, 
  Bell, 
  Users, 
  Building2, 
  TrendingUp, 
  BarChart4, 
  CheckCircle,
  FileText,
  Upload,
  FileSpreadsheet,
  GraduationCap,
  Download,
  Filter
} from "lucide-react";
import { 
  Notice, 
  CollegeEvent, 
  FacultyMember, 
  DepartmentItem,
  UserProfile,
  UserRole,
  StudyMaterial,
  StudentRecord,
  ExamSchedule,
  CollegeClass,
  CollegeSubject,
  Scholarship
} from "../types";
import { ScholarshipsAdminSection } from "./ScholarshipsView";
import { generateMonthlyAttendancePDFReport } from "../utils/pdfGenerator";

interface AdminPanelProps {
  currentUser: UserProfile;
  notices: Notice[];
  onUpdateNotices: (updated: Notice[]) => void;
  events: CollegeEvent[];
  onUpdateEvents: (updated: CollegeEvent[]) => void;
  faculty: FacultyMember[];
  onUpdateFaculty: (updated: FacultyMember[]) => void;
  departments: DepartmentItem[];
  onUpdateDepartments: (updated: DepartmentItem[]) => void;
  studyMaterials: StudyMaterial[];
  onUpdateStudyMaterials: (updated: StudyMaterial[]) => void;
  students: StudentRecord[];
  onUpdateStudents: (updated: StudentRecord[]) => void;
  exams: ExamSchedule[];
  onUpdateExams: (updated: ExamSchedule[]) => void;
  classes: CollegeClass[];
  onUpdateClasses: (updated: CollegeClass[]) => void;
  subjects: CollegeSubject[];
  onUpdateSubjects: (updated: CollegeSubject[]) => void;
  scholarships: Scholarship[];
  onUpdateScholarships: (updated: Scholarship[]) => void;
}

export default function AdminPanel({
  currentUser,
  notices,
  onUpdateNotices,
  events,
  onUpdateEvents,
  faculty,
  onUpdateFaculty,
  departments,
  onUpdateDepartments,
  studyMaterials,
  onUpdateStudyMaterials,
  students,
  onUpdateStudents,
  exams,
  onUpdateExams,
  classes,
  onUpdateClasses,
  subjects,
  onUpdateSubjects,
  scholarships,
  onUpdateScholarships
}: AdminPanelProps) {
  // Navigation tabs within Admin Panel
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<"analytics" | "notices" | "events" | "faculty" | "departments" | "students" | "uploads" | "classes" | "security" | "subjects" | "scholarships">("analytics");

  // Attendance System monthly generator states
  const [selectedRollForAttendance, setSelectedRollForAttendance] = useState("");
  const [selectedStudentNameForAttendance, setSelectedStudentNameForAttendance] = useState("");
  const [selectedSubjectForAttendance, setSelectedSubjectForAttendance] = useState("");
  const [totalClassesByTeacher, setTotalClassesByTeacher] = useState<number>(30);
  const [attendedClassesByStudent, setAttendedClassesByStudent] = useState<number>(20);

  // Sequential Step-by-Step Attendance Compiler States
  interface SubjectAttendanceItem {
    name: string;
    code: string;
    totalClasses: number;
    attendedClasses: number;
    isCompleted: boolean;
  }
  const [seqAttendanceProgress, setSeqAttendanceProgress] = useState<SubjectAttendanceItem[]>([]);
  const [seqActiveIndex, setSeqActiveIndex] = useState<number>(0);
  const [seqIsFinished, setSeqIsFinished] = useState<boolean>(false);

  // Dedicated Monthly Attendance PDF Export States
  const [reportMonth, setReportMonth] = useState<string>("July");
  const [reportYear, setReportYear] = useState<number>(2026);
  const [reportDeptFilter, setReportDeptFilter] = useState<string>("ALL");
  const [reportTargetStudent, setReportTargetStudent] = useState<string>("ALL");
  const [isGeneratingAttendancePdf, setIsGeneratingAttendancePdf] = useState<boolean>(false);

  const handleDownloadMonthlyAttendancePdf = (overrideRoll?: string) => {
    setIsGeneratingAttendancePdf(true);
    try {
      const monthYearStr = `${reportMonth} ${reportYear}`;
      const targetRoll = overrideRoll || reportTargetStudent;
      generateMonthlyAttendancePDFReport({
        monthYear: monthYearStr,
        department: reportDeptFilter,
        students: students,
        selectedStudentRoll: targetRoll,
        subjects: subjects,
        generatedBy: currentUser.name || "Admin"
      });
      showStatusToast(`Downloaded Monthly Attendance PDF Report (${monthYearStr})`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      showStatusToast("Failed to generate PDF report.");
    } finally {
      setIsGeneratingAttendancePdf(false);
    }
  };

  // Security Console Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Departments Form States
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptHod, setNewDeptHod] = useState("");
  const [newDeptStudentsCount, setNewDeptStudentsCount] = useState<number>(60);
  const [newDeptLabsCount, setNewDeptLabsCount] = useState<number>(3);

  // Departments inline editing states
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState("");
  const [editingDeptCode, setEditingDeptCode] = useState("");
  const [editingDeptHod, setEditingDeptHod] = useState("");
  const [editingDeptStudentsCount, setEditingDeptStudentsCount] = useState<number>(0);
  const [editingDeptLabsCount, setEditingDeptLabsCount] = useState<number>(0);

  // Examinations Form States
  const [newExamSubject, setNewExamSubject] = useState("");
  const [newExamCode, setNewExamCode] = useState("");
  const [newExamDate, setNewExamDate] = useState("");
  const [newExamSession, setNewExamSession] = useState("Forenoon (10:00 AM)");

  // Class Routine Form States
  const [newClassSubject, setNewClassSubject] = useState("");
  const [newClassFaculty, setNewClassFaculty] = useState("");
  const [newClassTime, setNewClassTime] = useState("");
  const [newClassRoom, setNewClassRoom] = useState("");
  const [newClassDuration, setNewClassDuration] = useState("1.5 hrs");
  const [newClassStatus, setNewClassStatus] = useState<'upcoming' | 'ongoing' | 'completed'>("upcoming");
  const [newClassDept, setNewClassDept] = useState("Computer Science & Engineering");
  const [newClassSemester, setNewClassSemester] = useState<number>(6);

  // Class Routine inline editing states
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassSubject, setEditingClassSubject] = useState("");
  const [editingClassFaculty, setEditingClassFaculty] = useState("");
  const [editingClassTime, setEditingClassTime] = useState("");
  const [editingClassRoom, setEditingClassRoom] = useState("");
  const [editingClassDuration, setEditingClassDuration] = useState("1.5 hrs");
  const [editingClassStatus, setEditingClassStatus] = useState<'upcoming' | 'ongoing' | 'completed'>("upcoming");
  const [editingClassDept, setEditingClassDept] = useState("Computer Science & Engineering");
  const [editingClassSemester, setEditingClassSemester] = useState<number>(6);

  // Students Form States
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentRoll, setNewStudentRoll] = useState("");
  const [newStudentGpa, setNewStudentGpa] = useState<number>(8.5);
  const [newStudentAttendance, setNewStudentAttendance] = useState<number>(75.0);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentDept, setNewStudentDept] = useState("Computer Science & Engineering");
  const [newStudentMobile, setNewStudentMobile] = useState("");
  
  // Student inline editing states
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingAttendanceValue, setEditingAttendanceValue] = useState<number>(0);

  // AI attendance state
  const [aiAttendanceLog, setAiAttendanceLog] = useState("");
  const [isCalculatingAiAttendance, setIsCalculatingAiAttendance] = useState(false);
  const [aiCalculatedResults, setAiCalculatedResults] = useState<{ roll: string; name: string; status: "present" | "absent"; reason: string; calculatedAttendance: number }[]>([]);
  const [isAiAttendanceFeatureEnabled, setIsAiAttendanceFeatureEnabled] = useState(true);

  // Attendance Drag & Drop States
  const [isAttendanceDragging, setIsAttendanceDragging] = useState(false);
  const [parsedAttendanceRows, setParsedAttendanceRows] = useState<{ roll: string; attendance: number; studentName?: string; status: "success" | "warning" }[]>([]);
  const [attendanceFileName, setAttendanceFileName] = useState<string | null>(null);
  const attendanceFileInputRef = useRef<HTMLInputElement>(null);

  // Subjects Management Form States
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectDept, setNewSubjectDept] = useState("Computer Science & Engineering");
  const [newSubjectSemester, setNewSubjectSemester] = useState<number>(1);

  // Subjects Filter states
  const [filterSubjectDept, setFilterSubjectDept] = useState("All");
  const [filterSubjectSemester, setFilterSubjectSemester] = useState<number | "All">("All");

  // Subject inline editing states
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState("");
  const [editingSubjectCode, setEditingSubjectCode] = useState("");
  const [editingSubjectDept, setEditingSubjectDept] = useState("Computer Science & Engineering");
  const [editingSubjectSemester, setEditingSubjectSemester] = useState<number>(1);

  // PDF Drag & Drop States
  const [isPdfDragging, setIsPdfDragging] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfFileSize, setPdfFileSize] = useState<string | null>(null);
  const [pdfUploadTitle, setPdfUploadTitle] = useState("");
  const [pdfUploadSubject, setPdfUploadSubject] = useState("Artificial Intelligence & Neural Networks");
  const [pdfUploadContent, setPdfUploadContent] = useState("");
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const parseAttendanceData = (text: string) => {
    // Expected format: RollNumber, AttendanceRate (e.g. 2024CSB1098, 94.5)
    // Or plain lines: 2024CSB1098: 92%
    const lines = text.split("\n");
    const rows: { roll: string; attendance: number; studentName?: string; status: "success" | "warning" }[] = [];
    
    lines.forEach(line => {
      if (!line.trim()) return;
      // Replace commas, colons, spaces, semicolons, percentages with clean separators
      const cleanLine = line.replace(/[:%;\r]/g, "");
      const parts = cleanLine.split(/[,\t ]+/).map(p => p.trim());
      
      if (parts.length >= 2) {
        const roll = parts[0].toUpperCase();
        const attPercent = parseFloat(parts[1]);
        
        if (roll && !isNaN(attPercent)) {
          const student = students.find(s => s.roll.toUpperCase() === roll);
          rows.push({
            roll,
            attendance: attPercent,
            studentName: student ? student.name : "Not Found in Ledger",
            status: student ? "success" : "warning"
          });
        }
      }
    });
    
    setParsedAttendanceRows(rows);
    if (rows.length > 0) {
      showStatusToast(`Extracted ${rows.length} attendance records. Please review and commit.`);
    } else {
      showStatusToast("Could not parse file. Ensure format is like 'RollNo, Attendance' (e.g., 2024CSB1098, 95)");
    }
  };

  const handleAttendanceFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsAttendanceDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setAttendanceFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseAttendanceData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleAttendanceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttendanceFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseAttendanceData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleCommitAttendance = () => {
    if (parsedAttendanceRows.length === 0) return;
    
    let updatedCount = 0;
    const updatedStudents = students.map(s => {
      const match = parsedAttendanceRows.find(row => row.roll.toUpperCase() === s.roll.toUpperCase());
      if (match) {
        updatedCount++;
        const finalAtt = match.attendance;
        const finalStatus = finalAtt < 75 ? "Attendance Warning" : (finalAtt > 95 ? "Excellent" : "Good Standing");
        return {
          ...s,
          attendance: finalAtt,
          status: finalStatus
        };
      }
      return s;
    });
    
    onUpdateStudents(updatedStudents);
    setParsedAttendanceRows([]);
    setAttendanceFileName(null);
    showStatusToast(`Committed! Successfully synchronized attendance for ${updatedCount} students.`);
  };

  const handlePdfFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPdfDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setPdfFileName(file.name);
      setPdfFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      if (!pdfUploadTitle) {
        setPdfUploadTitle(cleanTitle.replace(/\b\w/g, c => c.toUpperCase()));
      }
    }
  };

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFileName(file.name);
      setPdfFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      if (!pdfUploadTitle) {
        setPdfUploadTitle(cleanTitle.replace(/\b\w/g, c => c.toUpperCase()));
      }
    }
  };

  const handlePublishPdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfUploadTitle) return;
    
    const size = pdfFileSize || "1.2 MB";
    const newMaterial: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title: pdfUploadTitle,
      type: pdfFileName?.endsWith(".md") ? "Markdown" : "PDF",
      size: size,
      date: new Date().toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' }),
      subject: pdfUploadSubject,
      content: pdfUploadContent || `Syllabus review study kit for ${pdfUploadTitle}.\nSubject Focus: ${pdfUploadSubject}.\nThis outlines essential learning outcomes, solved research prompts, mid-sem preparation roadmaps, and cheat-sheets compiled by Cybersecurity & Deep Learning research labs.`
    };

    onUpdateStudyMaterials([newMaterial, ...studyMaterials]);
    setPdfFileName(null);
    setPdfFileSize(null);
    setPdfUploadTitle("");
    setPdfUploadContent("");
    showStatusToast(`Successfully published ${newMaterial.title} to Student Notes Portal.`);
  };

  // Notices Manager form state
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeCategory, setNoticeCategory] = useState<"academic" | "placement" | "exam" | "general">("general");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeUrgent, setNoticeUrgent] = useState(false);

  // Events Manager form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState<"hackathon" | "cultural" | "sports" | "seminar">("hackathon");
  const [eventDesc, setEventDesc] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");

  // Faculty form state
  const [facName, setFacName] = useState("");
  const [facDesignation, setFacDesignation] = useState("");
  const [facDept, setFacDept] = useState("Computer Science & Engineering");
  const [facEmail, setFacEmail] = useState("");
  const [facSpecial, setFacSpecial] = useState("");

  // AI Campus Analytics state
  const [isGeneratingAIReport, setIsGeneratingAIReport] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Status message state
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    const newNotice: Notice = {
      id: `not-${Date.now()}`,
      title: noticeTitle,
      category: noticeCategory,
      content: noticeContent,
      date: new Date().toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' }),
      author: currentUser.name || "Administrator",
      isUrgent: noticeUrgent
    };

    onUpdateNotices([newNotice, ...notices]);
    setNoticeTitle("");
    setNoticeContent("");
    setNoticeUrgent(false);
    showStatusToast("Successfully published notices. Propagated to all student nodes.");
  };

  const handleDeleteNotice = (id: string) => {
    onUpdateNotices(notices.filter(n => n.id !== id));
    showStatusToast("Notice removed successfully.");
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDesc || !eventLocation || !eventDate) return;

    const newEvent: CollegeEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle,
      category: eventCategory,
      description: eventDesc,
      date: eventDate,
      location: eventLocation,
      attendeesCount: 120
    };

    onUpdateEvents([newEvent, ...events]);
    setEventTitle("");
    setEventDesc("");
    setEventLocation("");
    setEventDate("");
    showStatusToast("Successfully scheduled college event.");
  };

  const handleDeleteEvent = (id: string) => {
    onUpdateEvents(events.filter(e => e.id !== id));
    showStatusToast("Event removed successfully.");
  };

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facName || !facEmail || !facSpecial) return;

    const newFac: FacultyMember = {
      id: `fac-${Date.now()}`,
      name: facName,
      designation: facDesignation || "Assistant Professor",
      department: facDept,
      email: facEmail,
      specialization: facSpecial,
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
    };

    onUpdateFaculty([...faculty, newFac]);
    setFacName("");
    setFacEmail("");
    setFacSpecial("");
    showStatusToast("New Faculty record initialized successfully.");
  };

  const handleSynthesizeAIAnalytics = async () => {
    setIsGeneratingAIReport(true);
    setAiReport(null);

    const stats = {
      activeStudentsCount: students.length * 420, // scaled for display
      avgAttendance: "85.2%",
      departmentsCount: departments.length,
      noticesCount: notices.length,
      eventsScheduled: events.length
    };

    try {
      const res = await fetch("/api/ai-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats })
      });
      const data = await res.json();
      setAiReport(data.report);
    } catch (err) {
      console.error(err);
      setAiReport("🚨 **Analytics Service Offline**: Fallback, system could not connect to NVIDIA AI model.");
    } finally {
      setIsGeneratingAIReport(false);
    }
  };

  const showStatusToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode || !newDeptHod) return;

    const newDept: DepartmentItem = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      code: newDeptCode.toUpperCase(),
      hod: newDeptHod,
      studentsCount: Number(newDeptStudentsCount) || 0,
      labsCount: Number(newDeptLabsCount) || 0
    };

    onUpdateDepartments([...departments, newDept]);
    setNewDeptName("");
    setNewDeptCode("");
    setNewDeptHod("");
    setNewDeptStudentsCount(60);
    setNewDeptLabsCount(3);
    showStatusToast(`Successfully registered Department Node: ${newDept.name}`);
  };

  const handleDeleteDepartment = (id: string) => {
    onUpdateDepartments(departments.filter(d => d.id !== id));
    showStatusToast("Department node removed successfully.");
  };

  const handleStartEditDepartment = (dept: DepartmentItem) => {
    setEditingDeptId(dept.id);
    setEditingDeptName(dept.name);
    setEditingDeptCode(dept.code);
    setEditingDeptHod(dept.hod);
    setEditingDeptStudentsCount(dept.studentsCount);
    setEditingDeptLabsCount(dept.labsCount);
  };

  const handleSaveEditDepartment = (id: string) => {
    if (!editingDeptName.trim() || !editingDeptCode.trim() || !editingDeptHod.trim()) return;
    const updated = departments.map(d => d.id === id ? {
      ...d,
      name: editingDeptName.trim(),
      code: editingDeptCode.trim().toUpperCase(),
      hod: editingDeptHod.trim(),
      studentsCount: Number(editingDeptStudentsCount) || 0,
      labsCount: Number(editingDeptLabsCount) || 0
    } : d);
    onUpdateDepartments(updated);
    setEditingDeptId(null);
    showStatusToast("Department node updated successfully.");
  };

  const handleCancelEditDepartment = () => {
    setEditingDeptId(null);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamSubject || !newExamCode || !newExamDate) return;

    const newEx: ExamSchedule = {
      id: `ex-${Date.now()}`,
      subject: newExamSubject,
      code: newExamCode.toUpperCase(),
      date: newExamDate,
      session: newExamSession
    };

    onUpdateExams([...exams, newEx]);
    setNewExamSubject("");
    setNewExamCode("");
    setNewExamDate("");
    setNewExamSession("Forenoon (10:00 AM)");
    showStatusToast(`Successfully published exam schedule: ${newEx.subject}`);
  };

  const handleDeleteExam = (id: string) => {
    onUpdateExams(exams.filter(ex => ex.id !== id));
    showStatusToast("Exam schedule removed successfully.");
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassSubject || !newClassFaculty || !newClassTime || !newClassRoom) return;

    const newCls: CollegeClass = {
      id: `class-${Date.now()}`,
      subject: newClassSubject,
      faculty: newClassFaculty,
      time: newClassTime,
      room: newClassRoom,
      duration: newClassDuration,
      status: newClassStatus,
      department: newClassDept,
      semester: Number(newClassSemester) || 6
    };

    onUpdateClasses([...classes, newCls]);
    setNewClassSubject("");
    setNewClassFaculty("");
    setNewClassTime("");
    setNewClassRoom("");
    setNewClassDuration("1.5 hrs");
    setNewClassStatus("upcoming");
    showStatusToast(`Successfully scheduled class routine: ${newCls.subject}`);
  };

  const handleDeleteClass = (id: string) => {
    onUpdateClasses(classes.filter(cls => cls.id !== id));
    showStatusToast("Class routine node deleted successfully.");
  };

  const handleStartEditClass = (cls: CollegeClass) => {
    setEditingClassId(cls.id);
    setEditingClassSubject(cls.subject);
    setEditingClassFaculty(cls.faculty);
    setEditingClassTime(cls.time);
    setEditingClassRoom(cls.room);
    setEditingClassDuration(cls.duration);
    setEditingClassStatus(cls.status);
    setEditingClassDept(cls.department || "Computer Science & Engineering");
    setEditingClassSemester(cls.semester || 6);
  };

  const handleSaveEditClass = () => {
    if (!editingClassSubject || !editingClassFaculty || !editingClassTime || !editingClassRoom) return;
    const updated = classes.map(cls => {
      if (cls.id === editingClassId) {
        return {
          ...cls,
          subject: editingClassSubject,
          faculty: editingClassFaculty,
          time: editingClassTime,
          room: editingClassRoom,
          duration: editingClassDuration,
          status: editingClassStatus,
          department: editingClassDept,
          semester: Number(editingClassSemester) || 6
        };
      }
      return cls;
    });

    onUpdateClasses(updated);
    setEditingClassId(null);
    showStatusToast("Class routine node updated successfully.");
  };

  const handleCancelEditClass = () => {
    setEditingClassId(null);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentRoll) return;

    const finalAtt = Number(newStudentAttendance) || 75.0;
    const finalStatus = finalAtt < 75 ? "Attendance Warning" : (finalAtt > 95 ? "Excellent" : "Good Standing");

    const newStd: StudentRecord = {
      id: `std-${Date.now()}`,
      name: newStudentName,
      roll: newStudentRoll.toUpperCase(),
      gpa: Number(newStudentGpa) || 8.0,
      attendance: finalAtt,
      status: finalStatus,
      email: newStudentEmail || `${newStudentRoll.toLowerCase()}@cyber-tech.edu`,
      department: newStudentDept,
      mobile: newStudentMobile || "9876543210"
    };

    onUpdateStudents([...students, newStd]);
    setNewStudentName("");
    setNewStudentRoll("");
    setNewStudentGpa(8.5);
    setNewStudentAttendance(75.0);
    setNewStudentEmail("");
    setNewStudentDept("Computer Science & Engineering");
    setNewStudentMobile("");
    showStatusToast(`Successfully enrolled student node: ${newStd.name}`);
  };

  const handleDeleteStudent = (id: string) => {
    onUpdateStudents(students.filter(s => s.id !== id));
    showStatusToast("Student record removed from registry.");
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName || !newSubjectCode) return;

    const newSub: CollegeSubject = {
      id: `sub-${Date.now()}`,
      name: newSubjectName,
      code: newSubjectCode.toUpperCase(),
      department: newSubjectDept,
      semester: Number(newSubjectSemester) || 1
    };

    onUpdateSubjects([...subjects, newSub]);
    setNewSubjectName("");
    setNewSubjectCode("");
    showStatusToast(`Successfully registered subject: ${newSub.name} (${newSub.code})`);
  };

  const handleDeleteSubject = (id: string) => {
    onUpdateSubjects(subjects.filter(s => s.id !== id));
    showStatusToast("Subject removed from college matrix successfully.");
  };

  const handleStartEditSubject = (sub: CollegeSubject) => {
    setEditingSubjectId(sub.id);
    setEditingSubjectName(sub.name);
    setEditingSubjectCode(sub.code);
    setEditingSubjectDept(sub.department);
    setEditingSubjectSemester(sub.semester);
  };

  const handleSaveEditSubject = () => {
    if (!editingSubjectName || !editingSubjectCode) return;
    const updated = subjects.map(s => {
      if (s.id === editingSubjectId) {
        return {
          ...s,
          name: editingSubjectName,
          code: editingSubjectCode.toUpperCase(),
          department: editingSubjectDept,
          semester: Number(editingSubjectSemester) || 1
        };
      }
      return s;
    });

    onUpdateSubjects(updated);
    setEditingSubjectId(null);
    showStatusToast("Subject record updated successfully.");
  };

  const handleCancelEditSubject = () => {
    setEditingSubjectId(null);
  };

  const handleSaveStudentAttendance = (studentId: string) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        const finalAtt = Math.max(0, Math.min(100, editingAttendanceValue));
        const finalStatus = finalAtt < 75 ? "Attendance Warning" : (finalAtt > 95 ? "Excellent" : "Good Standing");
        return {
          ...s,
          attendance: parseFloat(finalAtt.toFixed(1)),
          status: finalStatus
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setEditingStudentId(null);
    showStatusToast("Attendance percentage updated successfully.");
  };

  const handleCalculateAiAttendance = async () => {
    if (!aiAttendanceLog.trim()) return;
    setIsCalculatingAiAttendance(true);
    setAiCalculatedResults([]);

    try {
      const res = await fetch("/api/parse-attendance-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: aiAttendanceLog, students })
      });
      const data = await res.json();
      if (data.results) {
        setAiCalculatedResults(data.results);
        showStatusToast(`AI Bot calculated attendance updates for ${data.results.length} student nodes.`);
      } else {
        showStatusToast("AI Bot finished with no matched student changes.");
      }
    } catch (err) {
      console.error(err);
      showStatusToast("🚨 AI attendance calculation failed. Check internet connection.");
    } finally {
      setIsCalculatingAiAttendance(false);
    }
  };

  const handleCommitAiAttendance = () => {
    if (aiCalculatedResults.length === 0) return;

    let updateCount = 0;
    const updated = students.map(s => {
      const match = aiCalculatedResults.find(r => r.roll.toUpperCase() === s.roll.toUpperCase());
      if (match) {
        updateCount++;
        const finalAtt = match.calculatedAttendance;
        const finalStatus = finalAtt < 75 ? "Attendance Warning" : (finalAtt > 95 ? "Excellent" : "Good Standing");
        return {
          ...s,
          attendance: parseFloat(finalAtt.toFixed(1)),
          status: finalStatus
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setAiCalculatedResults([]);
    setAiAttendanceLog("");
    showStatusToast(`Committed! Central student attendance database updated for ${updateCount} nodes.`);
  };

  const handleGenerateMonthlyAttendance = () => {
    if (!selectedRollForAttendance || totalClassesByTeacher <= 0) {
      showStatusToast("Please select a student and ensure total classes is greater than zero.");
      return;
    }
    const finalPct = Math.min(100, parseFloat(((attendedClassesByStudent / totalClassesByTeacher) * 100).toFixed(2)));
    
    const updatedStudents = students.map(s => {
      if (s.roll === selectedRollForAttendance) {
        return {
          ...s,
          attendance: finalPct,
          status: finalPct < 75 ? "Attendance Warning" : "Good Standing"
        };
      }
      return s;
    });

    onUpdateStudents(updatedStudents);
    showStatusToast(`Attendance for ${selectedStudentNameForAttendance} updated to ${finalPct}% for ${selectedSubjectForAttendance}.`);
    
    // Clear inputs
    setSelectedRollForAttendance("");
    setSelectedStudentNameForAttendance("");
    setSelectedSubjectForAttendance("");
    setTotalClassesByTeacher(30);
    setAttendedClassesByStudent(20);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showStatusToast("Error: All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showStatusToast("Error: New passwords do not match.");
      return;
    }

    // Determine role and standard password keys
    const roleKey = currentUser.role === "admin" ? "admin_pwd" : "faculty_pwd";
    const defaultPwd = currentUser.role === "admin" ? "admin-secure" : "faculty-secure";
    const savedPwd = localStorage.getItem(roleKey) || defaultPwd;

    if (currentPassword !== savedPwd) {
      showStatusToast("Error: Incorrect current password.");
      return;
    }

    localStorage.setItem(roleKey, newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showStatusToast("Success: Security password updated securely!");
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Title bar */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-pink-500 animate-pulse" /> College Admin Central
          </h1>
          <p className="text-sm text-slate-400">Compile academic notices, schedule events, manage registries, and review AI analytics critiques.</p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-pink-500/10 border border-pink-400/20 text-pink-400 text-xs font-mono font-bold tracking-wider uppercase">
          Authorization: Dean_Level
        </span>
      </div>

      {/* Success Toast */}
      {statusMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-sm flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* Inner Tabs navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          { id: "analytics", label: "Executive Analytics", icon: <TrendingUp className="w-4 h-4" /> },
          { id: "classes", label: "Class Routines", icon: <BookOpen className="w-4 h-4" /> },
          { id: "subjects", label: "Subject Matrix", icon: <BookOpen className="w-4 h-4" /> },
          { id: "notices", label: "Notice Bulletin Builder", icon: <Bell className="w-4 h-4" /> },
          { id: "events", label: "Event Coordinator", icon: <Calendar className="w-4 h-4" /> },
          { id: "faculty", label: "Faculty Registrar", icon: <Users className="w-4 h-4" /> },
          { id: "departments", label: "Department Matrix", icon: <Building2 className="w-4 h-4" /> },
          { id: "students", label: "Student Ledger", icon: <BookOpen className="w-4 h-4" /> },
          { id: "scholarships", label: "Scholarship Board", icon: <GraduationCap className="w-4 h-4" /> },
          { id: "uploads", label: "Uploader Center", icon: <Upload className="w-4 h-4" /> },
          { id: "security", label: "Security Console", icon: <ShieldCheck className="w-4 h-4" /> }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminSubTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider shrink-0 transition flex items-center gap-2 border ${
              activeAdminSubTab === tab.id
                ? "bg-pink-500/10 border-pink-400/30 text-pink-400"
                : "bg-white/5 border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/10"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUB_TAB: Executive Analytics */}
      {activeAdminSubTab === "analytics" && (
        <div className="space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl glass-panel border border-white/5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Active Student Nodes</span>
              <div className="text-3xl font-extrabold text-slate-100 mt-2 font-display">1,690</div>
              <p className="text-[10px] text-emerald-400 mt-1 font-mono">↑ 4.2% This Quarter</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-white/5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Average Attendance Rate</span>
              <div className="text-3xl font-extrabold text-slate-100 mt-2 font-display">85.4%</div>
              <p className="text-[10px] text-emerald-400 mt-1 font-mono">Healthy Range</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-white/5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Notices Published</span>
              <div className="text-3xl font-extrabold text-slate-100 mt-2 font-display">{notices.length}</div>
              <p className="text-[10px] text-purple-400 mt-1 font-mono">Digital Broadcasts</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-white/5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Campus Event Load</span>
              <div className="text-3xl font-extrabold text-slate-100 mt-2 font-display">{events.length}</div>
              <p className="text-[10px] text-cyan-400 mt-1 font-mono">{events.filter(e => e.category === "hackathon").length} Active Hackathons</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Custom SVG bar charts for Departments registrations */}
            <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <BarChart4 className="w-5 h-5 text-pink-400" />
                  <h2 className="font-display font-bold text-lg text-slate-100">Department Node Volume</h2>
                </div>
                <span className="text-xs font-mono text-slate-400">CSE/ECE/ROBO</span>
              </div>

              <div className="space-y-4 pt-2">
                {departments.map((dept) => (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">{dept.name} ({dept.code})</span>
                      <span className="text-pink-400 font-semibold">{dept.studentsCount} Students</span>
                    </div>
                    {/* Visual Bar scale */}
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full" 
                        style={{ width: `${(dept.studentsCount / 700) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: AI Executive Analytics Synthesis */}
            <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h2 className="font-display font-bold text-lg text-slate-100">AI Campus Analytics Engine</h2>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                  NVIDIA_REPORT
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Click below to hit the server-side NVIDIA analytical processor. This compiles current notice bulletins, student attendance counts, and fests schedules, then synthesizes a real executive report outlining strategic optimizations.
              </p>

              {aiReport ? (
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-400/20 text-xs text-slate-300 leading-relaxed max-h-[180px] overflow-y-auto whitespace-pre-line font-sans mb-4">
                  {aiReport}
                </div>
              ) : null}

              <button
                onClick={handleSynthesizeAIAnalytics}
                disabled={isGeneratingAIReport}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 transition"
              >
                {isGeneratingAIReport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Analytics critique...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" /> Synthesize Executive Critique
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* SUB_TAB: Manage Notices */}
      {activeAdminSubTab === "notices" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Notice Builder form (5 cols) */}
          <form onSubmit={handleCreateNotice} className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest pb-1 border-b border-white/5">
              Draft New Bulletin Notice
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Notice Title</label>
              <input
                type="text"
                placeholder="Google AI Internship Drive / Holidays schedule"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Broadcast Category</label>
              <select
                value={noticeCategory}
                onChange={(e: any) => setNoticeCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111322] border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-pink-500"
              >
                <option value="general">General Campus Notice</option>
                <option value="academic">Academic / Class Notice</option>
                <option value="exam">Examinations schedule</option>
                <option value="placement">Placement and Career Drive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Notice Details</label>
              <textarea
                rows={4}
                placeholder="Draft the core notice content detailing criteria, deadlines, dates, and instructions clearly..."
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                className="w-full p-3.5 rounded-xl glass-input text-xs text-slate-200 resize-none"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="urgent-box"
                checked={noticeUrgent}
                onChange={(e) => setNoticeUrgent(e.target.checked)}
                className="rounded text-pink-500 border-white/10 w-4 h-4 bg-white/5"
              />
              <label htmlFor="urgent-box" className="text-xs font-mono text-slate-400 uppercase cursor-pointer">
                Flag as URGENT_ALERT (Pushes notification to top card)
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-mono text-xs font-bold uppercase text-white transition shadow-lg shadow-pink-500/15"
            >
              Broadcast Bulletin Notice
            </button>
          </form>

          {/* Published notices ledger (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-white/5">
              Active Published Notice ledger
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {notices.map((not) => (
                <div key={not.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[8px] bg-white/5 text-pink-400 border border-pink-500/20 font-mono uppercase font-bold">
                        {not.category}
                      </span>
                      {not.isUrgent && (
                        <span className="px-2 py-0.5 rounded text-[8px] bg-red-500/10 text-red-400 font-mono uppercase font-extrabold animate-pulse">
                          CRITICAL_URGENT
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">{not.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 truncate">{not.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{not.content}</p>
                    <div className="text-[10px] text-slate-500 font-mono mt-2">Author: {not.author}</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteNotice(not.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 shrink-0 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB_TAB: Event Coordinator */}
      {activeAdminSubTab === "events" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form (5 cols) */}
          <form onSubmit={handleCreateEvent} className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest pb-1 border-b border-white/5">
              Draft Campus Event Schedule
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Event Title</label>
              <input
                type="text"
                placeholder="Nebula Hackathon / Quantum Network Fest"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">Category</label>
                <select
                  value={eventCategory}
                  onChange={(e: any) => setEventCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111322] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-pink-500"
                >
                  <option value="hackathon">Hackathon</option>
                  <option value="cultural">Cultural Festival</option>
                  <option value="seminar">Seminar / Symposium</option>
                  <option value="sports">Sports / Robotics</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">Scheduled Date</label>
                <input
                  type="text"
                  placeholder="e.g. July 15-16, 2026"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Campus Location / Block</label>
              <input
                type="text"
                placeholder="Auditorium Main Hall / Block B Lab"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Description</label>
              <textarea
                rows={4}
                placeholder="Brief guidelines, themes, sponsorships, and entry criteria..."
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                className="w-full p-3.5 rounded-xl glass-input text-xs text-slate-200 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-mono text-xs font-bold uppercase text-white transition shadow-lg shadow-pink-500/15"
            >
              Broadcast Scheduled Event
            </button>
          </form>

          {/* Event ledger (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-white/5">
              Active Scheduled Events Ledger
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {events.map((evt) => (
                <div key={evt.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-start gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded text-[8px] bg-white/5 text-cyan-400 border border-cyan-500/20 font-mono uppercase font-bold">
                        {evt.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{evt.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">{evt.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{evt.description}</p>
                    <div className="text-[10px] text-slate-500 font-mono">Location: {evt.location}</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteEvent(evt.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 shrink-0 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB_TAB: Faculty Registrar */}
      {activeAdminSubTab === "faculty" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Add Form (5 cols) */}
          <form onSubmit={handleAddFaculty} className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest pb-1 border-b border-white/5">
              Add Faculty Registrar Profile
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Full Name & Title</label>
              <input
                type="text"
                placeholder="Dr. Alan Turing Jr."
                value={facName}
                onChange={(e) => setFacName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">Designation</label>
                <input
                  type="text"
                  placeholder="Assistant Professor / Associate"
                  value={facDesignation}
                  onChange={(e) => setFacDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">Official Email</label>
                <input
                  type="email"
                  placeholder="a.turing@cyber-tech.edu"
                  value={facEmail}
                  onChange={(e) => setFacEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Department Matrix</label>
              <select
                value={facDept}
                onChange={(e: any) => setFacDept(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111322] border border-white/10 text-sm text-slate-300 focus:outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Research Specialization</label>
              <input
                type="text"
                placeholder="Generative Transformers / Neural Nets"
                value={facSpecial}
                onChange={(e) => setFacSpecial(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-mono text-xs font-bold uppercase text-white transition"
            >
              Register Faculty Node
            </button>
          </form>

          {/* Registrar list (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-white/5">
              Active Faculty Register Matrix
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
              {faculty.map((fac) => (
                <div key={fac.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3 relative">
                  <img 
                    src={fac.imageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100"} 
                    alt={fac.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-white/5 shrink-0"
                  />
                  <div className="min-w-0 space-y-0.5 text-xs">
                    <div className="font-bold text-slate-200">{fac.name}</div>
                    <div className="text-pink-400 font-mono text-[10px]">{fac.designation}</div>
                    <div className="text-slate-400 truncate">{fac.department}</div>
                    <div className="text-slate-500 truncate font-mono text-[10px] pt-1">{fac.email}</div>
                  </div>
                  <button 
                    onClick={() => onUpdateFaculty(faculty.filter(f => f.id !== fac.id))}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB_TAB: Department Matrix */}
      {activeAdminSubTab === "departments" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Department Builder form */}
          <form onSubmit={handleCreateDepartment} className="lg:col-span-4 p-6 rounded-2xl glass-panel border border-white/5 space-y-4 h-fit">
            <div className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest pb-1 border-b border-white/5">
              Create New Department Node
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Department Name</label>
              <input
                type="text"
                placeholder="Electrical Engineering"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">Dept Code</label>
                <input
                  type="text"
                  placeholder="EE"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 font-mono uppercase"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">HOD Name</label>
                <input
                  type="text"
                  placeholder="Dr. Nikola Tesla"
                  value={newDeptHod}
                  onChange={(e) => setNewDeptHod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">Students Count</label>
                <input
                  type="number"
                  placeholder="60"
                  value={newDeptStudentsCount}
                  onChange={(e) => setNewDeptStudentsCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">Labs Count</label>
                <input
                  type="number"
                  placeholder="3"
                  value={newDeptLabsCount}
                  onChange={(e) => setNewDeptLabsCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-mono text-xs font-bold uppercase text-white transition shadow-lg shadow-pink-500/15 animate-shimmer"
            >
              Add Department Node
            </button>
          </form>

          {/* Department List Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-white/5">
              Active Academic Departments Matrix ({departments.length})
            </div>

            <div className="flex flex-col gap-4 max-h-[460px] overflow-y-auto pr-1">
              {departments.map((dept) => {
                const isEditing = editingDeptId === dept.id;
                return isEditing ? (
                  <div key={dept.id} className="p-5 rounded-2xl glass-panel border border-pink-500/30 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold font-mono text-pink-400 uppercase">Editing Node Mode</span>
                      <button 
                        type="button"
                        onClick={handleCancelEditDepartment}
                        className="p-1 rounded bg-white/5 text-slate-400 hover:text-slate-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-left">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400 uppercase">Department Name</label>
                        <input
                          type="text"
                          value={editingDeptName}
                          onChange={(e) => setEditingDeptName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-slate-400 uppercase">Block Code</label>
                          <input
                            type="text"
                            value={editingDeptCode}
                            onChange={(e) => setEditingDeptCode(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-slate-400 uppercase">HOD Name</label>
                          <input
                            type="text"
                            value={editingDeptHod}
                            onChange={(e) => setEditingDeptHod(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-slate-400 uppercase">Students Count</label>
                          <input
                            type="number"
                            value={editingDeptStudentsCount}
                            onChange={(e) => setEditingDeptStudentsCount(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-slate-400 uppercase">Research Labs</label>
                          <input
                            type="number"
                            value={editingDeptLabsCount}
                            onChange={(e) => setEditingDeptLabsCount(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={handleCancelEditDepartment}
                        className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[9px] uppercase font-bold transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditDepartment(dept.id)}
                        className="px-2.5 py-1 rounded bg-pink-500 hover:bg-pink-400 text-white font-mono text-[9px] uppercase font-bold transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={dept.id} className="p-5 rounded-2xl glass-panel border border-white/5 space-y-4 relative group hover:border-pink-500/20 transition">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-400/20 text-pink-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/5 text-slate-400 font-mono uppercase font-bold">
                          {dept.code}
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleStartEditDepartment(dept)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition opacity-0 group-hover:opacity-100"
                          title="Edit Department"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition opacity-0 group-hover:opacity-100"
                          title="Remove Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-200 leading-tight">{dept.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">HOD: {dept.hod}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-center font-mono">
                      <div className="p-2 rounded-xl bg-white/5 text-xs">
                        <div className="text-slate-500 text-[9px] uppercase tracking-wider">Students</div>
                        <div className="text-slate-200 font-bold mt-1">{dept.studentsCount}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 text-xs">
                        <div className="text-slate-500 text-[9px] uppercase tracking-wider">Labs</div>
                        <div className="text-slate-200 font-bold mt-1">{dept.labsCount}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB_TAB: Student Ledger */}
      {activeAdminSubTab === "students" && (
        <div className="space-y-6">
          {/* Monthly Student Attendance Report Generator Banner */}
          <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-[#0b1329]/90 to-slate-900/90 space-y-4 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-display text-slate-100 tracking-wide">
                      Monthly Student Attendance PDF Report Generator
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Official PDF Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure and download official monthly student attendance reports in PDF format for academic records & HOD approval.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadMonthlyAttendancePdf()}
                disabled={isGeneratingAttendancePdf}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {isGeneratingAttendancePdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Monthly PDF
                  </>
                )}
              </button>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {/* Month Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  Select Month
                </label>
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0f1d] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  Select Year
                </label>
                <select
                  value={reportYear}
                  onChange={(e) => setReportYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0f1d] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  {[2026, 2025, 2024].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-cyan-400" />
                  Department Scope
                </label>
                <select
                  value={reportDeptFilter}
                  onChange={(e) => setReportDeptFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0f1d] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Departments (College Ledger)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Student Scope Target */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" />
                  Student Scope
                </label>
                <select
                  value={reportTargetStudent}
                  onChange={(e) => setReportTargetStudent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0f1d] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Enrolled Students (Batch Ledger)</option>
                  {students.map(s => (
                    <option key={s.id} value={s.roll}>{s.roll} - {s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Summary Badge Row */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-wrap justify-between items-center text-xs font-mono text-slate-400 gap-2">
              <div className="flex items-center gap-4">
                <span>Period: <strong className="text-cyan-400">{reportMonth} {reportYear}</strong></span>
                <span>Scope: <strong className="text-slate-200">
                  {reportTargetStudent !== "ALL" ? "Individual Student" : `${students.length} Enrolled Students`}
                </strong></span>
                <span>Batch Avg: <strong className="text-emerald-400">
                  {students.length > 0 ? `${(students.reduce((a, b) => a + (b.attendance || 0), 0) / students.length).toFixed(1)}%` : "0%"}
                </strong></span>
              </div>
              <div className="text-[10px] text-slate-500">
                *Formatted with official header, signature line & subject breakdown.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Student Builder Form (4 cols) */}
          <form onSubmit={handleCreateStudent} className="lg:col-span-4 p-6 rounded-2xl glass-panel border border-white/5 space-y-4 h-fit">
            <div className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest pb-1 border-b border-white/5">
              Enroll New Student Node
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Full Name</label>
              <input
                type="text"
                placeholder="Clark Kent"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">ID / Roll Number</label>
              <input
                type="text"
                placeholder="2024CSB1205"
                value={newStudentRoll}
                onChange={(e) => setNewStudentRoll(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 font-mono uppercase"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Email Address</label>
              <input
                type="email"
                placeholder="clark.kent@cyber-tech.edu"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Department Matrix</label>
              <select
                value={newStudentDept}
                onChange={(e) => setNewStudentDept(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111322] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-pink-500"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Mobile Number</label>
              <input
                type="text"
                placeholder="9876543210"
                value={newStudentMobile}
                onChange={(e) => setNewStudentMobile(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">CGPA (0 - 10)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="8.50"
                  value={newStudentGpa}
                  onChange={(e) => setNewStudentGpa(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">Attendance %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="75.0"
                  value={newStudentAttendance}
                  onChange={(e) => setNewStudentAttendance(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-mono text-xs font-bold uppercase text-white transition shadow-lg shadow-pink-500/15"
            >
              Enroll Student Node
            </button>
          </form>

          {/* Student List Matrix (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                Student Ledger Database ({students.length})
              </div>
              <span className="text-[10px] font-mono text-pink-400">Double-click or click Edit icon to change attendance</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Student Node</th>
                    <th className="py-3 px-4">ID / Roll</th>
                    <th className="py-3 px-4">CGPA Rank</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                    <th className="py-3 px-4">Ledger Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-4">
                        <div className="font-sans font-bold text-slate-200">{student.name}</div>
                        {student.email && <div className="text-[10px] text-slate-500 font-mono">{student.email}</div>}
                        {student.mobile && <div className="text-[10px] text-slate-500 font-mono">Mob: {student.mobile}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-400 font-mono">{student.roll}</div>
                        {student.department && (
                          <div className="text-[9px] text-pink-400 font-mono max-w-[150px] truncate" title={student.department}>
                            {student.department}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-cyan-400 font-bold">{student.gpa} / 10.0</td>
                      <td className="py-3 px-4">
                        {editingStudentId === student.id ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={editingAttendanceValue}
                              onChange={(e) => setEditingAttendanceValue(parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 rounded bg-black/60 border border-white/20 text-slate-100 text-xs font-mono font-bold"
                            />
                            <button
                              onClick={() => handleSaveStudentAttendance(student.id)}
                              className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold border border-emerald-500/30"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] uppercase font-bold border border-white/5"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <span 
                            onClick={() => {
                              setEditingStudentId(student.id);
                              setEditingAttendanceValue(student.attendance);
                            }}
                            className="text-purple-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            title="Click to edit attendance percentage inline"
                          >
                            {student.attendance}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          student.status.includes("Warning") 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleDownloadMonthlyAttendancePdf(student.roll)}
                            className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-[10px] text-cyan-400 border border-cyan-500/20 transition uppercase font-semibold flex items-center gap-1 cursor-pointer"
                            title="Download Student Monthly Attendance PDF Report"
                          >
                            <Download className="w-3 h-3" />
                            PDF
                          </button>
                          <button 
                            onClick={() => {
                              setEditingStudentId(student.id);
                              setEditingAttendanceValue(student.attendance);
                            }}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-pink-400 border border-white/5 transition uppercase font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                            title="Remove Student Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* SUB_TAB: Upload Center */}
      {activeAdminSubTab === "uploads" && (
        <div className="space-y-8">
          
          {/* Row 1: Attendance compilers (CSV Sync & AI Natural Language Analyzer) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMN 1: CSV Attendance Sheets (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <h2 className="font-display font-bold text-base text-slate-100">Standard Attendance Log Compiler</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold uppercase">
                    CSV / TXT Parser
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Drag and drop a formatted spreadsheet (.csv or .txt) to match student roll numbers and overwrite their percentage records directly.
                </p>

                {/* File Guideline Block */}
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1.5 text-[10px] font-mono">
                  <div className="text-emerald-400 font-bold uppercase text-[8px] tracking-wider">Expected Format Guide</div>
                  <div className="text-slate-400">Lines should contain Roll Number and Attendance Rate:</div>
                  <div className="p-1.5 bg-black/40 rounded border border-white/5 text-slate-300">
                    2024CSB1098, 94.5<br />
                    2024CSB1042, 88.2
                  </div>
                </div>

                {/* Upload Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsAttendanceDragging(true); }}
                  onDragLeave={() => setIsAttendanceDragging(false)}
                  onDrop={handleAttendanceFileDrop}
                  onClick={() => attendanceFileInputRef.current?.click()}
                  className={`border-2 border-dashed p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    isAttendanceDragging 
                      ? "border-emerald-400 bg-emerald-500/5" 
                      : "border-white/10 bg-white/5 hover:border-emerald-400/30 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="file"
                    ref={attendanceFileInputRef}
                    onChange={handleAttendanceFileSelect}
                    accept=".csv,.txt,.json"
                    className="hidden"
                  />
                  <Upload className={`w-8 h-8 mb-1.5 transition-transform duration-300 ${isAttendanceDragging ? "text-emerald-400 scale-110 -translate-y-0.5" : "text-slate-400"}`} />
                  <span className="text-xs font-semibold text-slate-200">
                    {attendanceFileName ? `Selected: ${attendanceFileName}` : "Drag & Drop Attendance Sheet"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">
                    or click to browse local folders
                  </span>
                </div>

                {/* Parsed Rows Preview */}
                {parsedAttendanceRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                      <span>Parsed Records Preview ({parsedAttendanceRows.length})</span>
                      <span className="text-emerald-400">Ready to Commit</span>
                    </div>
                    <div className="max-h-[140px] overflow-y-auto border border-white/5 rounded-xl bg-black/20 text-[10px] font-mono">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white/5 text-slate-500 border-b border-white/5">
                            <th className="p-2">Roll</th>
                            <th className="p-2">Student</th>
                            <th className="p-2 text-right">Att. %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedAttendanceRows.map((row, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-2 text-slate-200 font-bold">{row.roll}</td>
                              <td className={`p-2 truncate max-w-[120px] ${row.status === "warning" ? "text-amber-500" : "text-slate-400"}`}>
                                {row.studentName}
                              </td>
                              <td className="p-2 text-right text-emerald-400 font-bold">{row.attendance}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  disabled={parsedAttendanceRows.length === 0}
                  onClick={handleCommitAttendance}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs font-bold uppercase tracking-wider text-white transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Commit CSV Sheet Ledger
                </button>
              </div>
            </div>

            {/* COLUMN 2: AI Daily attendance log analyzer (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-400 animate-spin-slow" />
                    <h2 className="font-display font-bold text-base text-slate-100">AI Daily Attendance calculation Bot</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-pink-500/10 border border-pink-400/20 text-pink-400 font-mono font-bold uppercase">
                    NVIDIA Live NLP
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Type or paste raw textual notes, roll calls, or class logs from telegram, zoom, or attendance rolls. The AI will parse them, calculate new attendance percentages, and show changes.
                </p>

                {/* Example suggestion template */}
                <div className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/10 space-y-1.5 text-[10px] font-mono">
                  <div className="text-pink-400 font-bold uppercase text-[8px] tracking-wider">Example Raw Logs Input</div>
                  <div className="text-slate-400">"Alex Mercer (2024CSB1098) was Present, Barry Allen (2024CSB1015) is Absent today. Sarah Connor was present but late."</div>
                  <button
                    type="button"
                    onClick={() => setAiAttendanceLog("Class CS-601 daily roll call:\nAlex Mercer (2024CSB1098) is PRESENT.\nSarah Connor is PRESENT and attentive.\nNikola Tesla is PRESENT and showed excellent research lab results.\nBarry Allen (2024CSB1015) is ABSENT today due to sports commitments.")}
                    className="text-[9px] text-pink-400 underline font-semibold hover:text-pink-300 block"
                  >
                    ⚡ Autofill with this sample roll log to test AI
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={aiAttendanceLog}
                  onChange={(e) => setAiAttendanceLog(e.target.value)}
                  placeholder="Paste raw attendance status or roll call descriptions here..."
                  className="w-full p-3 rounded-xl glass-input text-xs text-slate-200 resize-none font-mono"
                />

                {/* AI Calculated Preview Table */}
                {aiCalculatedResults.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider flex justify-between">
                      <span>AI Bot Calculations Preview ({aiCalculatedResults.length})</span>
                      <span className="text-pink-400">Calculated Percentage Updates</span>
                    </div>
                    <div className="max-h-[140px] overflow-y-auto border border-white/5 rounded-xl bg-black/20 text-[10px] font-mono">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white/5 text-slate-500 border-b border-white/5">
                            <th className="p-2">Roll</th>
                            <th className="p-2">Name</th>
                            <th className="p-2">Status</th>
                            <th className="p-2 text-right">New Att. %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aiCalculatedResults.map((row, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-2 text-slate-200 font-bold">{row.roll}</td>
                              <td className="p-2 text-slate-400 truncate max-w-[100px]">{row.name}</td>
                              <td className="p-2">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                  row.status === "present" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                }`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="p-2 text-right text-pink-400 font-bold">{row.calculatedAttendance}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  disabled={!aiAttendanceLog.trim() || isCalculatingAiAttendance}
                  onClick={handleCalculateAiAttendance}
                  className="flex-1 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/15 disabled:opacity-30 disabled:cursor-not-allowed border border-pink-400/30 font-mono text-xs font-bold uppercase tracking-wider text-pink-400 transition flex items-center justify-center gap-2"
                >
                  {isCalculatingAiAttendance ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                      <span>AI Calculating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Calculate via AI Bot</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={aiCalculatedResults.length === 0}
                  onClick={handleCommitAiAttendance}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs font-bold uppercase tracking-wider text-white transition flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Commit AI Calculations</span>
                </button>
              </div>
            </div>

          </div>

          {/* Monthly Attendance Generator Box (ATTENDENCE SYSTEM) */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h2 className="font-display font-bold text-base text-slate-100 uppercase tracking-wider font-mono">
                  ATTENDANCE SYSTEM - 6-Subject Interactive Compiler
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 font-mono font-bold uppercase">
                Sequential Auto-Calculator
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Select student Roll Number. The system filters exactly 6 subjects for their department & semester. Enter attendance step-by-step; the overall rate is auto-calculated and synced in real-time to the Student Dashboard.
            </p>

            {/* Inputs: Roll Number and Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Roll Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Select Student Roll Number</label>
                <select
                  value={selectedRollForAttendance}
                  onChange={(e) => {
                    const roll = e.target.value;
                    setSelectedRollForAttendance(roll);
                    const matchedStudent = students.find(s => s.roll === roll);
                    if (matchedStudent) {
                      setSelectedStudentNameForAttendance(matchedStudent.name);
                      
                      // Filter subjects for this student's department and semester
                      let matchedSubjects = subjects.filter(sub => 
                        sub.department.toLowerCase() === matchedStudent.department.toLowerCase() && 
                        sub.semester === (matchedStudent.semester || 3)
                      );
                      
                      // Fallback list of exactly 6 subjects if none or few are configured
                      if (matchedSubjects.length === 0) {
                        const dept = matchedStudent.department || "Computer Science & Engineering";
                        const sem = matchedStudent.semester || 3;
                        const isThird = sem === 3;
                        
                        const defaultNames = isThird
                          ? [
                              "Data Structures & Algorithms",
                              "Discrete Mathematics",
                              "Object Oriented Programming",
                              "Digital Electronics",
                              "Computer Organization & Architecture",
                              "Environmental Sciences & Ethics"
                            ]
                          : [
                              "Artificial Intelligence & Neural Networks",
                              "Distributed Systems & Cloud Architecture",
                              "Compiler Design & Automata Theory",
                              "Cybersecurity & Blockchain Cryptography",
                              "Machine Learning Foundations",
                              "Software Engineering & Agile"
                            ];
                            
                        matchedSubjects = defaultNames.map((name, i) => ({
                          id: `auto-sub-${i}`,
                          name,
                          code: `CS-${sem}0${i + 1}`,
                          department: dept,
                          semester: sem
                        }));
                      }
                      
                      // Pad to exactly 6 subjects if we have fewer
                      if (matchedSubjects.length < 6) {
                        const padCount = 6 - matchedSubjects.length;
                        const sem = matchedStudent.semester || 3;
                        for (let i = 0; i < padCount; i++) {
                          matchedSubjects.push({
                            id: `pad-sub-${i}`,
                            name: `Elective Subject ${i + 1}`,
                            code: `EL-${sem}9${i + 1}`,
                            department: matchedStudent.department,
                            semester: sem
                          });
                        }
                      }
                      
                      const progressItems = matchedSubjects.slice(0, 6).map(sub => ({
                        name: sub.name,
                        code: sub.code,
                        totalClasses: 30,
                        attendedClasses: 22,
                        isCompleted: false
                      }));
                      
                      setSeqAttendanceProgress(progressItems);
                      setSeqActiveIndex(0);
                      setSeqIsFinished(false);
                    } else {
                      setSelectedStudentNameForAttendance("");
                      setSeqAttendanceProgress([]);
                      setSeqActiveIndex(0);
                      setSeqIsFinished(false);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/90 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Choose Roll Number --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.roll}>{s.roll} - {s.name}</option>
                  ))}
                </select>
              </div>

              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Student Name</label>
                <input
                  type="text"
                  value={selectedStudentNameForAttendance}
                  readOnly
                  placeholder="Select a roll number to resolve student profile"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/40 border border-white/5 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* If Student Selected, show wizard */}
            {selectedRollForAttendance && seqAttendanceProgress.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900/30 border border-white/5 space-y-6">
                
                {/* Horizontal Progress / Step Tracker */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-medium font-mono text-cyan-400 uppercase tracking-wider">
                      Subject Entry Progress ({seqIsFinished ? "Complete" : `Subject ${seqActiveIndex + 1} of 6`})
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {seqAttendanceProgress.filter(p => p.isCompleted).length} / 6 Completed
                    </span>
                  </div>
                  
                  {/* Step pills */}
                  <div className="grid grid-cols-6 gap-2">
                    {seqAttendanceProgress.map((item, idx) => {
                      const isActive = idx === seqActiveIndex && !seqIsFinished;
                      const isCompleted = item.isCompleted;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!seqIsFinished) {
                              setSeqActiveIndex(idx);
                            }
                          }}
                          className={`h-2.5 rounded-full transition-all relative group ${
                            isCompleted 
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                              : isActive 
                                ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)] scale-y-110" 
                                : "bg-slate-700/50 hover:bg-slate-600"
                          }`}
                          title={`${idx + 1}. ${item.name}`}
                        >
                          {/* Tooltip */}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[#0b0f19] text-[9px] font-mono text-slate-200 border border-white/10 opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap z-50">
                            {idx + 1}. {item.name} {isCompleted ? `(${Math.round((item.attendedClasses/item.totalClasses)*100)}%)` : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!seqIsFinished ? (
                  /* Active Subject form panel */
                  <div className="p-4 rounded-xl bg-[#080b14]/70 border border-cyan-500/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono bg-cyan-400/10 text-cyan-400 uppercase border border-cyan-400/20">
                          Active Entry: Sub{seqActiveIndex + 1}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 font-display mt-1">
                          {seqAttendanceProgress[seqActiveIndex].name}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Code: {seqAttendanceProgress[seqActiveIndex].code}
                        </p>
                      </div>

                      {/* Dropdown to allow selecting/switching subjects manually */}
                      <div className="flex flex-col items-end gap-1">
                        <label className="text-[8px] font-bold text-slate-400 font-mono uppercase">Quick Select Sub</label>
                        <select
                          value={seqActiveIndex}
                          onChange={(e) => setSeqActiveIndex(parseInt(e.target.value))}
                          className="px-2 py-1 rounded bg-[#0b0f19] border border-white/10 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                        >
                          {seqAttendanceProgress.map((item, idx) => (
                            <option key={idx} value={idx}>
                              Sub{idx + 1}: {item.name.slice(0, 25)}...
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Conducted Classes */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Total Classes Conducted</label>
                          <span className="text-[10px] font-mono text-cyan-400">by Sir/Madam</span>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="150"
                          value={seqAttendanceProgress[seqActiveIndex].totalClasses}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const updated = [...seqAttendanceProgress];
                            updated[seqActiveIndex].totalClasses = val;
                            if (updated[seqActiveIndex].attendedClasses > val) {
                              updated[seqActiveIndex].attendedClasses = val;
                            }
                            setSeqAttendanceProgress(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/90 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Attended Classes */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Classes Attended</label>
                          <span className="text-[10px] font-mono text-emerald-400">by Student</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={seqAttendanceProgress[seqActiveIndex].totalClasses}
                          value={seqAttendanceProgress[seqActiveIndex].attendedClasses}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const limit = seqAttendanceProgress[seqActiveIndex].totalClasses;
                            const updated = [...seqAttendanceProgress];
                            updated[seqActiveIndex].attendedClasses = Math.min(val, limit);
                            setSeqAttendanceProgress(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/90 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Pre-fill Helpers / Quick Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Quick Actions:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...seqAttendanceProgress];
                          const total = updated[seqActiveIndex].totalClasses;
                          updated[seqActiveIndex].attendedClasses = total; // 100%
                          setSeqAttendanceProgress(updated);
                        }}
                        className="px-2 py-1 rounded bg-[#10b981]/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 hover:bg-[#10b981]/20 transition"
                      >
                        100% Present
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...seqAttendanceProgress];
                          const total = updated[seqActiveIndex].totalClasses;
                          updated[seqActiveIndex].attendedClasses = Math.round(total * 0.85); // 85%
                          setSeqAttendanceProgress(updated);
                        }}
                        className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-400 hover:bg-cyan-500/20 transition"
                      >
                        85% Preset
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...seqAttendanceProgress];
                          const total = updated[seqActiveIndex].totalClasses;
                          updated[seqActiveIndex].attendedClasses = Math.round(total * 0.75); // 75%
                          setSeqAttendanceProgress(updated);
                        }}
                        className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-400 hover:bg-indigo-500/20 transition"
                      >
                        75% (Min Req)
                      </button>
                    </div>

                    {/* Interactive Slider */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400">
                        <span>Drag to adjust student attendance</span>
                        <span className="font-bold text-slate-200">
                          {seqAttendanceProgress[seqActiveIndex].totalClasses > 0
                            ? `${Math.round((seqAttendanceProgress[seqActiveIndex].attendedClasses / seqAttendanceProgress[seqActiveIndex].totalClasses) * 100)}%`
                            : "0%"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={seqAttendanceProgress[seqActiveIndex].totalClasses || 1}
                        value={seqAttendanceProgress[seqActiveIndex].attendedClasses}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const updated = [...seqAttendanceProgress];
                          updated[seqActiveIndex].attendedClasses = val;
                          setSeqAttendanceProgress(updated);
                        }}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    {/* Save & Proceed button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...seqAttendanceProgress];
                          updated[seqActiveIndex].isCompleted = true;
                          setSeqAttendanceProgress(updated);

                          if (seqActiveIndex < 5) {
                            setSeqActiveIndex(prev => prev + 1);
                            showStatusToast(`Saved attendance for Sub${seqActiveIndex + 1}. Proceeding to Sub${seqActiveIndex + 2}.`);
                          } else {
                            // Last subject completed!
                            setSeqIsFinished(true);
                            showStatusToast(`All 6 subjects compiled! Please review summary below to commit update.`);
                            
                            // Auto-Commit to student database right away for instant real-time sync!
                            const totalConducted = updated.reduce((acc, item) => acc + item.totalClasses, 0);
                            const totalAttended = updated.reduce((acc, item) => acc + item.attendedClasses, 0);
                            const overallPct = totalConducted > 0 
                              ? Math.min(100, parseFloat(((totalAttended / totalConducted) * 100).toFixed(2)))
                              : 0;

                            const updatedStudentsList = students.map(s => {
                              if (s.roll === selectedRollForAttendance) {
                                return {
                                  ...s,
                                  attendance: overallPct,
                                  status: overallPct < 75 ? "Attendance Warning" : "Good Standing"
                                };
                              }
                              return s;
                            });
                            onUpdateStudents(updatedStudentsList);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-xs font-bold font-mono uppercase text-white shadow-lg shadow-cyan-500/20"
                      >
                        {seqActiveIndex === 5 ? "Finish & Auto-Calculate Overall" : `Save & Proceed to Sub${seqActiveIndex + 2}`}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Completed / Summary screen */
                  <div className="p-4 rounded-xl bg-[#09101f] border border-emerald-500/20 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <h3 className="font-bold font-display text-sm">
                        Attendance Compiled for {selectedStudentNameForAttendance}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400">
                      All 6 subjects have been processed successfully. The overall student profile is auto-updated and live.
                    </p>

                    {/* Summary list of subjects */}
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {seqAttendanceProgress.map((item, idx) => {
                        const pct = item.totalClasses > 0 ? (item.attendedClasses / item.totalClasses) * 100 : 0;
                        return (
                          <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-slate-900/60 border border-white/5 font-mono">
                            <span className="text-slate-300 truncate max-w-[200px]">Sub{idx + 1}: {item.name}</span>
                            <span className="text-slate-400">
                              {item.attendedClasses}/{item.totalClasses} classes (
                              <span className={pct < 75 ? "text-amber-400" : "text-emerald-400 font-bold"}>
                                {pct.toFixed(1)}%
                              </span>
                              )
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Final cumulative calculations */}
                    <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-900/90 border border-white/5">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-400 uppercase">Overall Attendance</span>
                        <div className="text-lg font-bold font-mono text-emerald-400">
                          {(() => {
                            const totalConducted = seqAttendanceProgress.reduce((acc, item) => acc + item.totalClasses, 0);
                            const totalAttended = seqAttendanceProgress.reduce((acc, item) => acc + item.attendedClasses, 0);
                            const overallPct = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;
                            return `${overallPct.toFixed(2)}%`;
                          })()}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-400 uppercase">Calculated Standing</span>
                        <div className="text-xs font-bold font-mono flex items-center h-7 text-slate-200">
                          {(() => {
                            const totalConducted = seqAttendanceProgress.reduce((acc, item) => acc + item.totalClasses, 0);
                            const totalAttended = seqAttendanceProgress.reduce((acc, item) => acc + item.attendedClasses, 0);
                            const overallPct = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;
                            return overallPct < 75 ? "⚠️ ATTENDANCE WARNING" : "✅ GOOD STANDING";
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Actions on Finish */}
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          handleDownloadMonthlyAttendancePdf(selectedRollForAttendance);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs font-bold font-mono uppercase text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download PDF Report
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Allow editing or restarting
                          setSeqIsFinished(false);
                          setSeqActiveIndex(0);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold font-mono uppercase text-slate-200 cursor-pointer"
                      >
                        Edit Entry
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Clear completely to start fresh for another student
                          setSelectedRollForAttendance("");
                          setSelectedStudentNameForAttendance("");
                          setSeqAttendanceProgress([]);
                          setSeqActiveIndex(0);
                          setSeqIsFinished(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold font-mono uppercase text-white shadow-lg cursor-pointer"
                      >
                        Configure Another Student
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>

          {/* Row 2: Study Resource Broadcaster & Examinations Registry Builder */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMN 1: Study Resource Broadcaster (6 cols) */}
            <form onSubmit={handlePublishPdf} className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <h2 className="font-display font-bold text-base text-slate-100">Study Resource Broadcaster</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-bold uppercase">
                    PDF / Markdown
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload syllabus materials, research papers, or PDF files. Published resources are stored dynamically and matched to student portals.
                </p>

                {/* Drag over PDF Upload */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsPdfDragging(true); }}
                  onDragLeave={() => setIsPdfDragging(false)}
                  onDrop={handlePdfFileDrop}
                  onClick={() => pdfFileInputRef.current?.click()}
                  className={`border-2 border-dashed p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    isPdfDragging 
                      ? "border-indigo-400 bg-indigo-500/5" 
                      : "border-white/10 bg-white/5 hover:border-indigo-400/30 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="file"
                    ref={pdfFileInputRef}
                    onChange={handlePdfFileSelect}
                    accept=".pdf,.txt,.md"
                    className="hidden"
                  />
                  <Upload className={`w-8 h-8 mb-1 transition-transform duration-300 ${isPdfDragging ? "text-indigo-400 scale-110 -translate-y-0.5" : "text-slate-400"}`} />
                  <span className="text-xs font-semibold text-slate-200">
                    {pdfFileName ? `Selected: ${pdfFileName}` : "Drag & Drop Study PDF / MD file"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {pdfFileSize ? `Size: ${pdfFileSize}` : "Dynamic PDF storage pipeline"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Material Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Deep Learning Solved Research Kit"
                      value={pdfUploadTitle}
                      onChange={(e) => setPdfUploadTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Academic Subject</label>
                      <select
                        value={pdfUploadSubject}
                        onChange={(e) => setPdfUploadSubject(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#111322] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Artificial Intelligence & Neural Networks">Artificial Intelligence</option>
                        <option value="Distributed Systems & Cloud Architecture">Distributed Systems</option>
                        <option value="Compiler Design & Automata Theory">Compiler Design</option>
                        <option value="Cybersecurity & Blockchain Cryptography">Cybersecurity</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">PDF File Size</label>
                      <div className="px-3 py-2 rounded-xl bg-[#111322] border border-white/10 text-xs text-slate-400 font-mono text-center">
                        <span className="text-indigo-400 font-bold">{pdfFileSize || "1.4 MB"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Text Content (Summarized by Chatbot)</label>
                    <textarea
                      rows={2}
                      placeholder="Paste textbook synopsis or research references here..."
                      value={pdfUploadContent}
                      onChange={(e) => setPdfUploadContent(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-input text-[11px] text-slate-200 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!pdfUploadTitle}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs font-bold uppercase tracking-wider text-white transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Broadcaster Study Resource
                </button>
              </div>
            </form>

            {/* COLUMN 2: Examinations Registry Builder (6 cols) */}
            <form onSubmit={handleCreateExam} className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-pink-400" />
                    <h2 className="font-display font-bold text-base text-slate-100">Examinations Registry Builder</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-pink-500/10 border border-pink-400/20 text-pink-400 font-mono font-bold uppercase">
                    Schedule Builder
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Schedule new end-semester examination dates, sessions, and courses. Updates are synchronized directly to student portals and exam timetables.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Course / Subject Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Computer Graphics & Virtual Reality"
                      value={newExamSubject}
                      onChange={(e) => setNewExamSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Course Code</label>
                      <input
                        type="text"
                        required
                        placeholder="CS-605"
                        value={newExamCode}
                        onChange={(e) => setNewExamCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-100 uppercase font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Exam Session</label>
                      <select
                        value={newExamSession}
                        onChange={(e) => setNewExamSession(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#111322] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-pink-500"
                      >
                        <option value="Forenoon (10:00 AM)">Forenoon (10:00 AM)</option>
                        <option value="Afternoon (02:00 PM)">Afternoon (02:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Examination Date</label>
                    <input
                      type="text"
                      required
                      placeholder="July 29, 2026"
                      value={newExamDate}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!newExamSubject || !newExamCode || !newExamDate}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs font-bold uppercase tracking-wider text-white transition flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10"
                >
                  <Plus className="w-4 h-4" /> Publish Exam Schedule
                </button>
              </div>
            </form>

          </div>

          {/* Row 3: Active Study Resources Ledger & Active Exams Schedule Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            
            {/* COLUMN 1: Active Study Materials (With Delete/Remove) */}
            <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
              <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest pb-1 border-b border-white/5 flex justify-between">
                <span>Active study materials & notes ({studyMaterials.length})</span>
                <span>Editable Admin Ledger</span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {studyMaterials.map((mat) => (
                  <div key={mat.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:border-indigo-500/20 transition">
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-xs font-bold text-slate-200 truncate">{mat.title}</div>
                      <div className="flex gap-2 text-[10px] font-mono text-slate-500">
                        <span className="text-indigo-400">{mat.subject}</span>
                        <span>•</span>
                        <span>{mat.size} ({mat.type})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onUpdateStudyMaterials(studyMaterials.filter(m => m.id !== mat.id));
                        showStatusToast(`Study resource '${mat.title}' deleted successfully.`);
                      }}
                      className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition opacity-0 group-hover:opacity-100"
                      title="Remove PDF Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: Active Exams Ledger (With Delete/Remove) */}
            <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
              <div className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest pb-1 border-b border-white/5 flex justify-between">
                <span>Active Examinations Schedule ({exams.length})</span>
                <span>Editable Admin Ledger</span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {exams.map((ex) => (
                  <div key={ex.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:border-pink-500/20 transition">
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-xs font-bold text-slate-200 truncate">{ex.subject}</div>
                      <div className="flex gap-2 text-[10px] font-mono text-slate-500">
                        <span className="text-pink-400 font-bold">{ex.code}</span>
                        <span>•</span>
                        <span>{ex.date} ({ex.session})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteExam(ex.id)}
                      className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition opacity-0 group-hover:opacity-100"
                      title="Remove Exam Schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB_TAB: Manage Class Routines */}
      {activeAdminSubTab === "classes" && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMN 1: Schedule Class Routine Form (5 cols) */}
            <form onSubmit={handleCreateClass} className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-white/5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <h2 className="font-display font-bold text-base text-slate-100">Schedule New Routine</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-bold uppercase">
                    Class Routine
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Add a lecture, lab simulation, or seminar session to the schedule. Classes are dynamically matched and filtered on students' dashboards based on their department matrix.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Subject / Course Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Computer Vision & Image Synthesis"
                      value={newClassSubject}
                      onChange={(e) => setNewClassSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Faculty / Instructor</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Dr. Sophia Chen"
                        value={newClassFaculty}
                        onChange={(e) => setNewClassFaculty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Department Matrix</label>
                      <select
                        value={newClassDept}
                        onChange={(e) => setNewClassDept(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl bg-[#111322] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Time Window</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 10:00 AM - 11:30 AM"
                        value={newClassTime}
                        onChange={(e) => setNewClassTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-100 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Duration</label>
                      <select
                        value={newClassDuration}
                        onChange={(e) => setNewClassDuration(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl bg-[#111322] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="1.0 hr">1.0 hr</option>
                        <option value="1.5 hrs">1.5 hrs</option>
                        <option value="2.0 hrs">2.0 hrs</option>
                        <option value="3.0 hrs">3.0 hrs</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Room / Lab Location</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Lab 404 / LHC-102"
                        value={newClassRoom}
                        onChange={(e) => setNewClassRoom(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-100 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Session Status</label>
                      <select
                        value={newClassStatus}
                        onChange={(e) => setNewClassStatus(e.target.value as any)}
                        className="w-full px-2 py-2 rounded-xl bg-[#111322] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-300 font-mono uppercase">Semester Matrix</label>
                      <select
                        value={newClassSemester}
                        onChange={(e) => setNewClassSemester(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-xl bg-[#111322] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!newClassSubject || !newClassFaculty || !newClassTime || !newClassRoom}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs font-bold uppercase tracking-wider text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                >
                  <Plus className="w-4 h-4" /> Publish Class Session
                </button>
              </div>
            </form>

            {/* COLUMN 2: Class Routines Ledger List (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  <h2 className="font-display font-bold text-base text-slate-100">Daily Routines Master Ledger</h2>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
                  {classes.length} Total Schedules
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {classes.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs font-mono">
                    No active class routines currently configured.
                  </div>
                ) : (
                  classes.map((cls) => {
                    const isEditing = editingClassId === cls.id;
                    return (
                      <div 
                        key={cls.id} 
                        className={`p-4 rounded-xl border transition flex flex-col gap-3 ${
                          isEditing 
                            ? "bg-[#111322] border-indigo-500/50" 
                            : cls.status === "ongoing"
                              ? "bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/30"
                              : "bg-white/2 border-white/5 hover:border-white/10"
                        }`}
                      >
                        {isEditing ? (
                          /* EDITING MODE */
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-slate-400">Subject Title</label>
                                <input
                                  type="text"
                                  value={editingClassSubject}
                                  onChange={(e) => setEditingClassSubject(e.target.value)}
                                  className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-slate-100"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-slate-400">Faculty / Instructor</label>
                                <input
                                  type="text"
                                  value={editingClassFaculty}
                                  onChange={(e) => setEditingClassFaculty(e.target.value)}
                                  className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-slate-100"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-slate-400">Time Window</label>
                                <input
                                  type="text"
                                  value={editingClassTime}
                                  onChange={(e) => setEditingClassTime(e.target.value)}
                                  className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-slate-100 font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-slate-400">Room Location</label>
                                <input
                                  type="text"
                                  value={editingClassRoom}
                                  onChange={(e) => setEditingClassRoom(e.target.value)}
                                  className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-slate-100 font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-slate-400">Duration</label>
                                <select
                                  value={editingClassDuration}
                                  onChange={(e) => setEditingClassDuration(e.target.value)}
                                  className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-slate-300"
                                >
                                  <option value="1.0 hr">1.0 hr</option>
                                  <option value="1.5 hrs">1.5 hrs</option>
                                  <option value="2.0 hrs">2.0 hrs</option>
                                  <option value="3.0 hrs">3.0 hrs</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-slate-400">Department</label>
                                <select
                                  value={editingClassDept}
                                  onChange={(e) => setEditingClassDept(e.target.value)}
                                  className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-slate-300"
                                >
                                  {departments.map((dept) => (
                                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-slate-400">Session Status</label>
                                <select
                                  value={editingClassStatus}
                                  onChange={(e) => setEditingClassStatus(e.target.value as any)}
                                  className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-slate-300"
                                >
                                  <option value="upcoming">Upcoming</option>
                                  <option value="ongoing">Ongoing</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-slate-400">Semester</label>
                                <select
                                  value={editingClassSemester}
                                  onChange={(e) => setEditingClassSemester(Number(e.target.value))}
                                  className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-slate-300"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={handleCancelEditClass}
                                className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[10px] font-bold uppercase transition"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEditClass}
                                className="px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold uppercase transition"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* VIEW MODE */
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1.5 flex-grow">
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                  cls.status === "ongoing"
                                    ? "bg-indigo-400 text-slate-950 animate-pulse font-bold"
                                    : cls.status === "upcoming"
                                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                      : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                }`}>
                                  {cls.status}
                                </span>
                                {cls.department && (
                                  <span className="px-2 py-0.5 rounded text-[8px] bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono font-semibold truncate max-w-[180px]">
                                    {cls.department}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-semibold">
                                  Semester {cls.semester || 6}
                                </span>
                              </div>
                              <h3 className="text-xs font-bold text-slate-100">{cls.subject}</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
                                <div>
                                  <span className="text-slate-600">Faculty:</span> <span className="text-slate-200">{cls.faculty}</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Time:</span> <span className="text-slate-200">{cls.time}</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Room:</span> <span className="text-slate-200 font-semibold text-indigo-400">{cls.room}</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Length:</span> <span className="text-slate-200">{cls.duration}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditClass(cls)}
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition"
                                title="Edit Session"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClass(cls.id)}
                                className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                                title="Remove Routine"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeAdminSubTab === "subjects" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: Subject Registration Form */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4 h-fit">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <BookOpen className="w-5 h-5 text-pink-500" />
                <h2 className="font-display font-bold text-lg text-slate-100">Register New Subject</h2>
              </div>
              <p className="text-xs text-slate-400">
                Register a core academic course. It will automatically populate in attendance counts, student profiles, and exam scheduling.
              </p>

              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">SUBJECT NAME</label>
                  <input
                    type="text"
                    required
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g. Theory of Computation"
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/90 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">SUBJECT CODE</label>
                  <input
                    type="text"
                    required
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    placeholder="e.g. CS-301"
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/90 border border-white/10 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">DEPARTMENT</label>
                  <select
                    value={newSubjectDept}
                    onChange={(e) => setNewSubjectDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/90 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-pink-500"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">SEMESTER (1 - 8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={newSubjectSemester}
                    onChange={(e) => setNewSubjectSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/90 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-95 shadow-lg shadow-pink-500/15 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Subject to Matrix
                </button>
              </form>
            </div>

            {/* COLUMN 2 & 3: Filter & Subject Listing */}
            <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-white/5">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-100">Semester & Department Matrix</h2>
                  <p className="text-xs text-slate-400">Filter, edit, or delete existing dynamic curriculum nodes.</p>
                </div>
                
                {/* Filters Row */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={filterSubjectDept}
                    onChange={(e) => setFilterSubjectDept(e.target.value)}
                    className="px-2 py-1.5 rounded-xl bg-[#0e1220]/90 border border-white/10 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-pink-500"
                  >
                    <option value="All">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterSubjectSemester}
                    onChange={(e) => setFilterSubjectSemester(e.target.value === "All" ? "All" : Number(e.target.value))}
                    className="px-2 py-1.5 rounded-xl bg-[#0e1220]/90 border border-white/10 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-pink-500"
                  >
                    <option value="All">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Subject Name</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3 text-center">Sem</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subjects
                      .filter((sub) => {
                        const deptMatch = filterSubjectDept === "All" || sub.department === filterSubjectDept;
                        const semMatch = filterSubjectSemester === "All" || sub.semester === filterSubjectSemester;
                        return deptMatch && semMatch;
                      })
                      .map((sub) => {
                        const isEditing = editingSubjectId === sub.id;
                        return (
                          <tr key={sub.id} className="hover:bg-white/[0.02] transition">
                            {isEditing ? (
                              <>
                                <td className="py-2 px-2">
                                  <input
                                    type="text"
                                    value={editingSubjectCode}
                                    onChange={(e) => setEditingSubjectCode(e.target.value)}
                                    className="w-20 px-2 py-1 rounded bg-[#0e1220] border border-white/15 text-xs text-slate-100 font-mono uppercase"
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="text"
                                    value={editingSubjectName}
                                    onChange={(e) => setEditingSubjectName(e.target.value)}
                                    className="w-full min-w-[120px] px-2 py-1 rounded bg-[#0e1220] border border-white/15 text-xs text-slate-100"
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <select
                                    value={editingSubjectDept}
                                    onChange={(e) => setEditingSubjectDept(e.target.value)}
                                    className="w-full min-w-[120px] px-2 py-1 rounded bg-[#0e1220] border border-white/15 text-xs text-slate-300"
                                  >
                                    {departments.map((dept) => (
                                      <option key={dept.id} value={dept.name}>
                                        {dept.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <input
                                    type="number"
                                    min="1"
                                    max="8"
                                    value={editingSubjectSemester}
                                    onChange={(e) => setEditingSubjectSemester(Number(e.target.value))}
                                    className="w-12 px-1 py-1 rounded bg-[#0e1220] border border-white/15 text-xs text-slate-100 text-center font-mono"
                                  />
                                </td>
                                <td className="py-2 px-2 text-right">
                                  <div className="flex gap-1 justify-end">
                                    <button
                                      type="button"
                                      onClick={handleCancelEditSubject}
                                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[9px] uppercase font-bold"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleSaveEditSubject}
                                      className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 font-mono text-[9px] uppercase font-bold"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 px-3 font-mono text-xs font-bold text-pink-400">{sub.code}</td>
                                <td className="py-3 px-3 text-xs font-medium text-slate-200">{sub.name}</td>
                                <td className="py-3 px-3 text-xs text-slate-400 font-mono">{sub.department}</td>
                                <td className="py-3 px-3 text-xs text-center text-slate-300 font-mono">{sub.semester}</td>
                                <td className="py-3 px-3 text-right">
                                  <div className="flex gap-1.5 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditSubject(sub)}
                                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition"
                                      title="Edit Subject"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSubject(sub.id)}
                                      className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                                      title="Delete Subject"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    {subjects.filter((sub) => {
                      const deptMatch = filterSubjectDept === "All" || sub.department === filterSubjectDept;
                      const semMatch = filterSubjectSemester === "All" || sub.semester === filterSubjectSemester;
                      return deptMatch && semMatch;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 text-xs font-mono">
                          No subjects matched selected department and semester criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeAdminSubTab === "security" && (
        <div className="space-y-6 max-w-xl mx-auto">
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <ShieldCheck className="w-5 h-5 text-pink-500" />
              <h2 className="font-display font-bold text-lg text-slate-100">Secure Password Management</h2>
            </div>
            
            <p className="text-xs text-slate-400">
              Change your portal's password securely. Please memorize your credentials as they protect access to the Executive Admin Panel.
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">CURRENT PASSWORD</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/90 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">NEW PASSWORD</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/90 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1220]/90 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-95 shadow-lg shadow-pink-500/15"
                >
                  Save Password Securely
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeAdminSubTab === "scholarships" && (
        <ScholarshipsAdminSection
          scholarships={scholarships}
          onUpdateScholarships={onUpdateScholarships}
        />
      )}

    </div>
  );
}
