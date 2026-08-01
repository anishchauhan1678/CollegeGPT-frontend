import React, { useState } from "react";
import { motion } from "motion/react";
import { UserProfile, CollegeClass, Notice, Assignment, PlacementJob, CollegeEvent, LibraryBook, FacultyMember, DepartmentItem, StudyMaterial, StudentRecord, ExamSchedule, CollegeSubject, Scholarship } from "./types";
import { 
  INITIAL_USER, 
  INITIAL_CLASSES, 
  INITIAL_NOTICES, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_PLACEMENTS, 
  INITIAL_EVENTS, 
  INITIAL_LIBRARY, 
  INITIAL_FACULTY, 
  INITIAL_DEPARTMENTS,
  INITIAL_SUBJECTS,
  INITIAL_SCHOLARSHIPS
} from "./data";

// Subcomponents
import LandingPage from "./components/LandingPage";
import LoginSignup from "./components/LoginSignup";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import AIChat from "./components/AIChat";
import Profile from "./components/Profile";
import AdminPanel from "./components/AdminPanel";
import SettingsComponent from "./components/Settings";
import { DepartmentsView, FacultyView, PlacementsView, NotesView, EventsView } from "./components/AuxiliaryPages";
import { ScholarshipsView } from "./components/ScholarshipsView";
import AttendanceCount from "./components/AttendanceCount";
import IntroScreen from "./components/IntroScreen";
import SuperAdminSection from "./components/SuperAdminSection";
import { dbService } from "./dbService";
import { db, collection, onSnapshot, doc, deleteDoc, query, where } from "./firebase";
import { NoticeToastContainer } from "./components/NoticeToast";
import { Megaphone, User, Clock, X } from "lucide-react";

export default function App() {
  // Navigation / Routing
  const [activeTab, setActiveTab] = useState<string>("landing"); // 'landing', 'login', 'dashboard', 'chatbot', etc.
  const [showIntro, setShowIntro] = useState<boolean>(true);
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [classes, setClasses] = useState<CollegeClass[]>([]);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [placements, setPlacements] = useState<PlacementJob[]>(INITIAL_PLACEMENTS);
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [library, setLibrary] = useState<LibraryBook[]>(INITIAL_LIBRARY);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);

  // 1. Departments Listener
  React.useEffect(() => {
    const deptColRef = collection(db, "departments");
    const unsubscribe = onSnapshot(deptColRef, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No departments in Firestore, seeding default departments...");
        for (const defaultDept of INITIAL_DEPARTMENTS) {
          await dbService.saveDepartment(defaultDept);
        }
        return;
      }
      const list: DepartmentItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as DepartmentItem);
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      setDepartments(list);
    }, (error) => {
      console.error("Error listening to departments:", error);
    });
    return () => unsubscribe();
  }, []);

  // 2. Classes Listener
  React.useEffect(() => {
    const classesColRef = collection(db, "classes");
    const unsubscribe = onSnapshot(classesColRef, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No classes in Firestore, seeding default classes...");
        for (const defaultCls of INITIAL_CLASSES) {
          await dbService.saveClass(defaultCls);
        }
        return;
      }
      const list: CollegeClass[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CollegeClass);
      });
      setClasses(list);
    }, (error) => {
      console.error("Error listening to classes:", error);
    });
    return () => unsubscribe();
  }, []);

  // 3. Events Listener
  React.useEffect(() => {
    const eventsColRef = collection(db, "events");
    const unsubscribe = onSnapshot(eventsColRef, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No events in Firestore, seeding default events...");
        for (const defaultEvt of INITIAL_EVENTS) {
          await dbService.saveEvent(defaultEvt);
        }
        return;
      }
      const list: CollegeEvent[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CollegeEvent);
      });
      setEvents(list);
    }, (error) => {
      console.error("Error listening to events:", error);
    });
    return () => unsubscribe();
  }, []);

  // 4. Faculty Listener
  React.useEffect(() => {
    const facultyColRef = collection(db, "faculty");
    const unsubscribe = onSnapshot(facultyColRef, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No faculty in Firestore, seeding default faculty...");
        for (const defaultFac of INITIAL_FACULTY) {
          await dbService.saveFaculty(defaultFac);
        }
        return;
      }
      const list: FacultyMember[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as FacultyMember);
      });
      setFaculty(list);
    }, (error) => {
      console.error("Error listening to faculty:", error);
    });
    return () => unsubscribe();
  }, []);

  // 5. Exams Listener
  React.useEffect(() => {
    const examsColRef = collection(db, "exams");
    const unsubscribe = onSnapshot(examsColRef, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No exams in Firestore, seeding default exams...");
        const INITIAL_EXAMS = [
          { id: "ex-1", subject: "Artificial Intelligence & Neural Networks", code: "CS-601", date: "July 20, 2026", session: "Forenoon (10:00 AM)" },
          { id: "ex-2", subject: "Distributed Systems & Cloud Architecture", code: "CS-602", date: "July 22, 2026", session: "Forenoon (10:00 AM)" },
          { id: "ex-3", subject: "Compiler Design & Automata Theory", code: "CS-603", date: "July 24, 2026", session: "Afternoon (02:00 PM)" },
          { id: "ex-4", subject: "Cybersecurity & Blockchain Cryptography", code: "CS-604", date: "July 27, 2026", session: "Forenoon (10:00 AM)" }
        ];
        for (const exam of INITIAL_EXAMS) {
          await dbService.saveExam(exam);
        }
        return;
      }
      const list: ExamSchedule[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ExamSchedule);
      });
      setExams(list);
    }, (error) => {
      console.error("Error listening to exams:", error);
    });
    return () => unsubscribe();
  }, []);

  // 6. Study Materials Listener
  React.useEffect(() => {
    const materialsColRef = collection(db, "study_materials");
    const unsubscribe = onSnapshot(materialsColRef, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No study materials in Firestore, seeding default...");
        const INITIAL_MATERIALS = [
          { 
            id: "mat-1", 
            title: "Transformer Self-Attention Cheat Sheet", 
            type: "PDF", 
            size: "1.4 MB", 
            date: "Jul 08, 2026", 
            subject: "Artificial Intelligence & Neural Networks", 
            content: `Transformer Self-Attention Blueprint\n\nSelf-attention is calculated as Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V.\nQueries (Q), Keys (K), and Values (V) are linear projections of input embeddings.\nThe scaling factor sqrt(d_k) prevents softmax from saturating at higher dimensions.\nMulti-Head Attention projects Q, K, V several times to compute attention weights in parallel, capturing diverse contextual features.` 
          },
          { 
            id: "mat-2", 
            title: "Raft Consensus State Machine Simulator Guide", 
            type: "Markdown", 
            size: "380 KB", 
            date: "Jul 10, 2026", 
            subject: "Distributed Systems & Cloud Architecture", 
            content: `Raft Distributed Consensus Protocol\n\nObjective: Ensure fault tolerance across a replica cluster state machine.\nRoles: Leader, Follower, Candidate.\nLeader Election: Triggered on randomized heartbeat timeouts. Heartbeats occur every 150-300ms.\nLog Replication: Leader accepts logs, broadcasts AppendEntries RPCs, and commits only when replicated on a majority (floor(N/2)+1) of nodes.` 
          },
          { 
            id: "mat-3", 
            title: "Mid-Sem Automata Past Year Solved Papers", 
            type: "PDF", 
            size: "4.2 MB", 
            date: "Jul 05, 2026", 
            subject: "Compiler Design & Automata Theory", 
            content: `Mid-Sem Exam solved keys on Compiler design and Automata theory.\nContains solved questions for converting Non-Deterministic Finite Automata (NFA) to Deterministic Finite Automata (DFA).\nIncludes Context-Free Grammar (CFG) simplification and LL(1) parse table derivation for arithmetic expression evaluations.` 
          },
          { 
            id: "mat-4", 
            title: "Zero Knowledge Range Proofs Implementation Guidelines", 
            type: "PDF", 
            size: "2.1 MB", 
            date: "Jun 28, 2026", 
            subject: "Cybersecurity & Blockchain Cryptography", 
            content: `Zero-Knowledge Range Proof (ZKRP) Guidelines\n\nProvides implementation patterns for bulletproofs in decentralized ledgers.\nAllows a prover to convince a verifier that a secret value lies in an interval [0, 2^n - 1] without revealing any bits of the secret.\nLeverages Pedersen commitment structures and inner-product arguments to guarantee log-scale space complexity.` 
          }
        ];
        for (const mat of INITIAL_MATERIALS) {
          await dbService.saveStudyMaterial(mat);
        }
        return;
      }
      const list: StudyMaterial[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as StudyMaterial);
      });
      setStudyMaterials(list);
    }, (error) => {
      console.error("Error listening to study materials:", error);
    });
    return () => unsubscribe();
  }, []);

  // 7. Students Listener (Subscribes to users collection for students)
  React.useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: StudentRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: d.id,
          name: d.name,
          roll: d.rollNo || "N/A",
          gpa: d.gpa || 8.75,
          attendance: d.attendanceRate || 90.0,
          status: (d.attendanceRate || 90.0) < 75 ? "Attendance Warning" : "Good Standing",
          email: d.email,
          department: d.department || "Computer Science & Engineering",
          mobile: d.mobile || "",
          semester: d.semester || 6,
          previousCgpa: d.previousCgpa || undefined
        });
      });
      setStudents(list);
    }, (error) => {
      console.error("Error listening to student updates:", error);
    });
    return () => unsubscribe();
  }, []);

  // Keep currentUser in sync in real-time with Firestore for dynamic updates
  React.useEffect(() => {
    if (!currentUser?.id) return;
    const docRef = doc(db, "users", currentUser.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setCurrentUser((prev) => {
          if (!prev) return data;
          if (
            prev.name !== data.name ||
            prev.email !== data.email ||
            prev.rollNo !== data.rollNo ||
            prev.department !== data.department ||
            prev.mobile !== data.mobile ||
            prev.semester !== data.semester ||
            prev.gpa !== data.gpa ||
            prev.attendanceRate !== data.attendanceRate ||
            prev.avatarUrl !== data.avatarUrl
          ) {
            return { ...prev, ...data };
          }
          return prev;
        });
      }
    }, (error) => {
      console.error("Error listening to logged-in user profile:", error);
    });
    return () => unsubscribe();
  }, [currentUser?.id]);

  // Real-time notices & Toast notifications states
  const [toasts, setToasts] = useState<{ id: string; notice: Notice }[]>([]);
  const [globalViewingNotice, setGlobalViewingNotice] = useState<Notice | null>(null);
  const isInitialLoadRef = React.useRef(true);
  const lastLoggedInUserIdRef = React.useRef<string | null>(null);

  // Trigger urgent notice toasts for EACH successful login
  React.useEffect(() => {
    if (currentUser) {
      if (lastLoggedInUserIdRef.current !== currentUser.id) {
        lastLoggedInUserIdRef.current = currentUser.id;
        
        // Find all urgent notices in current notices state
        const urgentNotices = notices.filter(n => n.isUrgent);
        if (urgentNotices.length > 0) {
          setToasts((prev) => {
            const newToasts = [...prev];
            urgentNotices.forEach((notice) => {
              if (!newToasts.some(t => t.notice.id === notice.id)) {
                newToasts.push({
                  id: `toast-login-${Date.now()}-${notice.id}`,
                  notice
                });
              }
            });
            return newToasts;
          });
        }
      }
    } else {
      lastLoggedInUserIdRef.current = null;
    }
  }, [currentUser, notices]);

  // Subscribe to real-time notices in Firestore
  React.useEffect(() => {
    const noticesColRef = collection(db, "notices");
    
    const unsubscribe = onSnapshot(noticesColRef, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No notices in Firestore, seeding default notices...");
        for (const defaultNotice of INITIAL_NOTICES) {
          await dbService.saveNotice(defaultNotice);
        }
        return;
      }
      
      const list: Notice[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Notice);
      });
      
      // Sort newly created (higher id or date) first
      list.sort((a, b) => b.id.localeCompare(a.id));
      
      if (isInitialLoadRef.current) {
        setNotices(list);
        isInitialLoadRef.current = false;
      } else {
        setNotices((prevNotices) => {
          // Identify newly urgent notices
          const newlyUrgent = list.filter(
            (notice) => notice.isUrgent && !prevNotices.some((prev) => prev.id === notice.id && prev.isUrgent)
          );
          
          if (newlyUrgent.length > 0) {
            newlyUrgent.forEach((notice) => {
              setToasts((prevToasts) => {
                if (prevToasts.some(t => t.notice.id === notice.id)) return prevToasts;
                return [
                  ...prevToasts,
                  { id: `toast-${Date.now()}-${notice.id}`, notice }
                ];
              });
            });
          }
          return list;
        });
      }
    }, (error) => {
      console.error("Error listening to notices:", error);
    });
    
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time scholarships in Firestore
  React.useEffect(() => {
    const scholarshipsColRef = collection(db, "scholarships");
    
    const unsubscribe = onSnapshot(scholarshipsColRef, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No scholarships in Firestore, seeding default scholarships...");
        for (const defaultSch of INITIAL_SCHOLARSHIPS) {
          await dbService.saveScholarship(defaultSch);
        }
        return;
      }
      
      const list: Scholarship[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Scholarship);
      });
      
      // Sort by id descending
      list.sort((a, b) => b.id.localeCompare(a.id));
      setScholarships(list);
    }, (error) => {
      console.error("Error listening to scholarships:", error);
    });
    
    return () => unsubscribe();
  }, []);

  const handleUpdateNotices = async (updatedNotices: Notice[]) => {
    // Identify added, deleted, or changed notices and update Firestore
    const added = updatedNotices.filter(n => !notices.some(prev => prev.id === n.id));
    const deleted = notices.filter(prev => !updatedNotices.some(n => n.id === prev.id));

    for (const notice of added) {
      await dbService.saveNotice(notice);
    }
    for (const notice of deleted) {
      await dbService.deleteNotice(notice.id);
    }
    
    setNotices(updatedNotices);
  };

  // Dynamic Subjects Database (Managed by Admins, filtered by Department/Semester!)
  const [subjects, setSubjects] = useState<CollegeSubject[]>(() => {
    const local = localStorage.getItem("college_subjects");
    return local ? JSON.parse(local) : INITIAL_SUBJECTS;
  });

  const handleUpdateSubjects = (updated: CollegeSubject[]) => {
    setSubjects(updated);
    localStorage.setItem("college_subjects", JSON.stringify(updated));
  };

  // Bridges triggers from dashboard cards into the chatbot
  const [aiTriggerPrompt, setAiTriggerPrompt] = useState<string | undefined>(undefined);
  const [aiTriggerCategory, setAiTriggerCategory] = useState<string | undefined>(undefined);

  const handleLoginSuccess = async (user: { 
    id?: string;
    name: string; 
    email: string; 
    role: any;
    rollNo?: string;
    department?: string;
    mobile?: string;
    semester?: number;
    avatarUrl?: string;
  }) => {
    const userId = user.id || (user.role === "student" ? `student-${user.rollNo || "421"}` : user.role === "faculty" ? "faculty-502" : "admin-001");
    
    // Attempt to load existing user profile from Firestore
    let dbProfile = await dbService.getUserProfile(userId);
    
    let studentGpa = dbProfile?.gpa || 8.75;
    let studentAttendance = dbProfile?.attendanceRate || 90.0;
    let studentSemester = dbProfile?.semester || user.semester || 6;
    let studentDepartment = dbProfile?.department || user.department || "Computer Science & Engineering";
    let studentName = dbProfile?.name || user.name || "Anish Chauhan";
    let studentEmail = dbProfile?.email || user.email || "";
    let studentMobile = dbProfile?.mobile || user.mobile || "";

    // If student, check if they exist in the synced student records
    if (user.role === "student" && user.rollNo) {
      const existing = students.find(s => s.roll === user.rollNo);
      if (existing) {
        studentGpa = existing.gpa;
        studentAttendance = existing.attendance;
        studentSemester = existing.semester || studentSemester;
        studentDepartment = existing.department || studentDepartment;
        studentName = existing.name || studentName;
        studentEmail = existing.email || studentEmail;
        studentMobile = existing.mobile || studentMobile;
      }
    }

    // Populate user profile based on role selected
    const profile: UserProfile = {
      id: userId,
      name: studentName,
      email: studentEmail,
      role: user.role,
      rollNo: user.rollNo || dbProfile?.rollNo || "",
      department: user.role === "student" ? studentDepartment : (user.department || dbProfile?.department),
      mobile: user.role === "student" ? studentMobile : (user.mobile || dbProfile?.mobile || ""),
      semester: user.role === "student" ? studentSemester : undefined,
      gpa: user.role === "student" ? studentGpa : undefined,
      attendanceRate: user.role === "student" ? studentAttendance : undefined,
      avatarUrl: user.avatarUrl || dbProfile?.avatarUrl || (user.role === "admin" 
        ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"
        : user.role === "faculty"
          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200")
    };

    // Save/sync profile directly in Firestore
    await dbService.saveUserProfile(profile);

    // Log login/portal visit for SuperAdmin metrics
    await dbService.logPortalVisit(profile);

    // Sync user assignments
    let loadedAssignments = await dbService.getUserAssignments(userId);
    if (loadedAssignments.length > 0) {
      setAssignments(loadedAssignments);
    } else {
      for (const ass of INITIAL_ASSIGNMENTS) {
        await dbService.saveUserAssignment(userId, ass);
      }
    }

    // Sync user placements
    let loadedPlacements = await dbService.getUserPlacements(userId);
    if (loadedPlacements.length > 0) {
      setPlacements(loadedPlacements);
    } else {
      for (const p of INITIAL_PLACEMENTS) {
        await dbService.saveUserPlacement(userId, p);
      }
    }

    setCurrentUser(profile);
    setActiveTab("dashboard");
  };

  const handleUpdateUser = async (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
    await dbService.saveUserProfile(updatedProfile);
  };

  const handleUpdateEvents = async (updated: CollegeEvent[]) => {
    const added = updated.filter(e => !events.some(prev => prev.id === e.id));
    const deleted = events.filter(prev => !updated.some(e => e.id === prev.id));
    const changed = updated.filter(e => {
      const prev = events.find(p => p.id === e.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(e);
    });

    for (const e of [...added, ...changed]) {
      await dbService.saveEvent(e);
    }
    for (const e of deleted) {
      await dbService.deleteEvent(e.id);
    }
  };

  const handleUpdateFaculty = async (updated: FacultyMember[]) => {
    const added = updated.filter(f => !faculty.some(prev => prev.id === f.id));
    const deleted = faculty.filter(prev => !updated.some(f => f.id === prev.id));
    const changed = updated.filter(f => {
      const prev = faculty.find(p => p.id === f.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(f);
    });

    for (const f of [...added, ...changed]) {
      await dbService.saveFaculty(f);
    }
    for (const f of deleted) {
      await dbService.deleteFaculty(f.id);
    }
  };

  const handleUpdateDepartments = async (updated: DepartmentItem[]) => {
    const added = updated.filter(d => !departments.some(prev => prev.id === d.id));
    const deleted = departments.filter(prev => !updated.some(d => d.id === prev.id));
    const changed = updated.filter(d => {
      const prev = departments.find(p => p.id === d.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(d);
    });

    for (const d of [...added, ...changed]) {
      await dbService.saveDepartment(d);
    }
    for (const d of deleted) {
      await dbService.deleteDepartment(d.id);
    }
  };

  const handleUpdateStudyMaterials = async (updated: StudyMaterial[]) => {
    const added = updated.filter(m => !studyMaterials.some(prev => prev.id === m.id));
    const deleted = studyMaterials.filter(prev => !updated.some(m => m.id === prev.id));
    const changed = updated.filter(m => {
      const prev = studyMaterials.find(p => p.id === m.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(m);
    });

    for (const m of [...added, ...changed]) {
      await dbService.saveStudyMaterial(m);
    }
    for (const m of deleted) {
      await dbService.deleteStudyMaterial(m.id);
    }
  };

  const handleUpdateStudents = async (updated: StudentRecord[]) => {
    const added = updated.filter(s => !students.some(prev => prev.id === s.id));
    const deleted = students.filter(prev => !updated.some(s => s.id === prev.id));
    const changed = updated.filter(s => {
      const prev = students.find(p => p.id === s.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(s);
    });

    for (const s of [...added, ...changed]) {
      const prof: UserProfile = {
        id: s.id || `student-${s.roll}`,
        name: s.name,
        email: s.email || `${s.roll.toLowerCase()}@cyber-tech.edu`,
        role: "student",
        rollNo: s.roll,
        department: s.department,
        mobile: s.mobile,
        semester: s.semester || 6,
        gpa: s.gpa,
        attendanceRate: s.attendance,
        previousCgpa: s.previousCgpa
      };
      await dbService.saveUserProfile(prof);
    }

    for (const s of deleted) {
      const targetId = s.id || `student-${s.roll}`;
      const ref = doc(db, "users", targetId);
      await deleteDoc(ref);
    }
  };

  const handleUpdateExams = async (updated: ExamSchedule[]) => {
    const added = updated.filter(e => !exams.some(prev => prev.id === e.id));
    const deleted = exams.filter(prev => !updated.some(e => e.id === prev.id));
    const changed = updated.filter(e => {
      const prev = exams.find(p => p.id === e.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(e);
    });

    for (const e of [...added, ...changed]) {
      await dbService.saveExam(e);
    }
    for (const e of deleted) {
      await dbService.deleteExam(e.id);
    }
  };

  const handleUpdateClasses = async (updated: CollegeClass[]) => {
    const added = updated.filter(c => !classes.some(prev => prev.id === c.id));
    const deleted = classes.filter(prev => !updated.some(c => c.id === prev.id));
    const changed = updated.filter(c => {
      const prev = classes.find(p => p.id === c.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(c);
    });

    for (const c of [...added, ...changed]) {
      await dbService.saveClass(c);
    }
    for (const c of deleted) {
      await dbService.deleteClass(c.id);
    }
  };

  const handleUpdateScholarships = async (updated: Scholarship[]) => {
    const added = updated.filter(s => !scholarships.some(prev => prev.id === s.id));
    const deleted = scholarships.filter(prev => !updated.some(s => s.id === prev.id));
    const changed = updated.filter(s => {
      const prev = scholarships.find(p => p.id === s.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(s);
    });

    for (const s of [...added, ...changed]) {
      await dbService.saveScholarship(s);
    }
    for (const s of deleted) {
      await dbService.deleteScholarship(s.id);
    }
  };


  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("landing");
  };

  const handleTriggerAIPrompt = (prompt: string, category: string) => {
    setAiTriggerPrompt(prompt);
    setAiTriggerCategory(category);
    setActiveTab("chatbot");
  };

  const handleClearAITrigger = () => {
    setAiTriggerPrompt(undefined);
    setAiTriggerCategory(undefined);
  };

  const renderActiveTabContent = () => {
    // Create a synchronized, real-time reactive user profile that links directly to the student register
    const synchronizedUser = currentUser ? {
      ...currentUser,
      attendanceRate: currentUser.role === "student"
        ? (students.find(s => s.roll === (currentUser.rollNo || ""))?.attendance ?? currentUser.attendanceRate)
        : currentUser.attendanceRate,
      gpa: currentUser.role === "student"
        ? (students.find(s => s.roll === (currentUser.rollNo || ""))?.gpa ?? currentUser.gpa)
        : currentUser.gpa,
      name: currentUser.role === "student"
        ? (students.find(s => s.roll === (currentUser.rollNo || ""))?.name ?? currentUser.name)
        : currentUser.name,
      department: currentUser.role === "student"
        ? (students.find(s => s.roll === (currentUser.rollNo || ""))?.department ?? currentUser.department)
        : currentUser.department,
      mobile: currentUser.role === "student"
        ? (students.find(s => s.roll === (currentUser.rollNo || ""))?.mobile ?? currentUser.mobile)
        : currentUser.mobile,
      semester: currentUser.role === "student"
        ? (students.find(s => s.roll === (currentUser.rollNo || ""))?.semester ?? currentUser.semester)
        : currentUser.semester,
      previousCgpa: currentUser.role === "student"
        ? (students.find(s => s.roll === (currentUser.rollNo || ""))?.previousCgpa ?? currentUser.previousCgpa)
        : currentUser.previousCgpa
    } : null;

    if (!synchronizedUser) {
      if (activeTab === "login") {
        return (
          <LoginSignup 
            onLoginSuccess={handleLoginSuccess} 
            onNavigateHome={() => setActiveTab("landing")}
            departments={departments}
          />
        );
      }
      return (
        <LandingPage 
          onGetStarted={() => setActiveTab("login")} 
          onNavigate={(page) => setActiveTab(page)}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            currentUser={synchronizedUser}
            classes={classes}
            notices={notices}
            assignments={assignments}
            placements={placements}
            events={events}
            library={library}
            onTriggerAIPrompt={handleTriggerAIPrompt}
            onUpdateClasses={setClasses}
            onUpdateAssignments={setAssignments}
            onUpdatePlacements={setPlacements}
          />
        );
      case "chatbot":
        return (
          <AIChat
            onTriggerPrompt={aiTriggerPrompt}
            onTriggerCategory={aiTriggerCategory}
            onClearTrigger={handleClearAITrigger}
            studyMaterials={studyMaterials}
          />
        );
      case "departments":
        return <DepartmentsView departments={departments} onUpdateDepartments={setDepartments} currentUser={synchronizedUser} />;
      case "faculty":
        return <FacultyView faculty={faculty} />;
      case "placements":
        return (
          <PlacementsView
            placements={placements}
            onApply={async (id) => {
              const updated = placements.map(p => p.id === id ? { ...p, status: "applied" as const } : p);
              setPlacements(updated);
              if (synchronizedUser) {
                const targetJob = updated.find(p => p.id === id);
                if (targetJob) {
                  await dbService.saveUserPlacement(synchronizedUser.id, targetJob);
                }
              }
            }}
          />
        );

      case "notes":
        return (
          <NotesView 
            currentUser={synchronizedUser}
            studyMaterials={studyMaterials}
            exams={exams}
            onTriggerAISummary={(doc) => {
              handleTriggerAIPrompt(`Summarize the document: ${doc.title}`, "pdf");
            }}
          />
        );
      case "events":
        return <EventsView events={events} />;
      case "scholarships":
        return (
          <ScholarshipsView
            currentUser={synchronizedUser}
            scholarships={scholarships}
            onTriggerAISummary={(text) => {
              handleTriggerAIPrompt(text, "text");
            }}
          />
        );
      case "attendance":
        return <AttendanceCount students={students} currentUser={synchronizedUser} subjects={subjects} departments={departments} />;
      case "profile":
        return <Profile currentUser={synchronizedUser} />;
      case "admin":
        return (
          <AdminPanel
            currentUser={synchronizedUser}
            notices={notices}
            onUpdateNotices={handleUpdateNotices}
            events={events}
            onUpdateEvents={handleUpdateEvents}
            faculty={faculty}
            onUpdateFaculty={handleUpdateFaculty}
            departments={departments}
            onUpdateDepartments={handleUpdateDepartments}
            studyMaterials={studyMaterials}
            onUpdateStudyMaterials={handleUpdateStudyMaterials}
            students={students}
            onUpdateStudents={handleUpdateStudents}
            exams={exams}
            onUpdateExams={handleUpdateExams}
            classes={classes}
            onUpdateClasses={handleUpdateClasses}
            subjects={subjects}
            onUpdateSubjects={handleUpdateSubjects}
            scholarships={scholarships}
            onUpdateScholarships={handleUpdateScholarships}
          />
        );
      case "settings":
        return (
          <SettingsComponent
            currentUser={synchronizedUser}
            onUpdateUser={handleUpdateUser}
          />
        );
      case "superadmin":
        return <SuperAdminSection currentUser={synchronizedUser} />;
      default:
        return <Dashboard currentUser={synchronizedUser} classes={classes} notices={notices} assignments={assignments} placements={placements} events={events} library={library} onTriggerAIPrompt={handleTriggerAIPrompt} onUpdateClasses={setClasses} onUpdateAssignments={setAssignments} onUpdatePlacements={setPlacements} />;
    }
  };

  const isGuestMode = activeTab === "landing" || activeTab === "login";
  
  // Create a synchronized, real-time reactive user profile for layout elements
  const synchronizedUser = currentUser ? {
    ...currentUser,
    attendanceRate: currentUser.role === "student"
      ? (students.find(s => s.roll === (currentUser.rollNo || "2024CSB1098"))?.attendance ?? currentUser.attendanceRate)
      : currentUser.attendanceRate
  } : null;

  if (showIntro) {
    return <IntroScreen onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#05060f] text-slate-100 font-sans flex flex-col overflow-x-hidden">
      {/* Immersive UI radial glowing ambient background overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_#1e1b4b_0%,_transparent_50%),radial-gradient(circle_at_80%_80%,_#312e81_0%,_transparent_50%)] opacity-50 pointer-events-none z-0" />
      
      <div className="relative z-10 flex-grow flex flex-col">
        {isGuestMode ? (
          renderActiveTabContent()
        ) : (
          <div className="flex flex-col lg:flex-row min-h-screen relative z-10">
          {/* Central navigation sidebar panel */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            currentUser={synchronizedUser}
            onLogout={handleLogout}
            onTriggerIntro={() => setShowIntro(true)}
          />

          {/* Main workspace viewport area */}
          <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-7xl mx-auto w-full"
            >
              {renderActiveTabContent()}
            </motion.div>
          </main>
        </div>
      )}
      </div>

      {/* Global Notice Details Modal */}
      {globalViewingNotice && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-[10000]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl rounded-2xl bg-[#0b0d19]/95 backdrop-blur-xl p-6 border border-pink-500/30 relative shadow-[0_0_50px_rgba(244,63,94,0.1)] overflow-hidden"
          >
            {/* Blinking pink accent top boundary highlight bar */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-pink-500 to-purple-500" />
            
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono uppercase tracking-widest font-bold">
                  {globalViewingNotice.category} Notice
                </span>
                {globalViewingNotice.isUrgent && (
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-red-500/15 border border-red-500/30 text-rose-400 font-mono uppercase tracking-widest font-bold animate-pulse">
                    URGENT
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-100 mt-2 tracking-tight">{globalViewingNotice.title}</h3>
              </div>
              <button 
                onClick={() => setGlobalViewingNotice(null)}
                className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-mono transition cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 border-y border-white/5 py-2.5 my-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-pink-400" />
                <span>Published by: <strong className="text-slate-200">{globalViewingNotice.author}</strong></span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-pink-400" />
                <span>Date: <strong className="text-slate-200">{globalViewingNotice.date}</strong></span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-wrap max-h-[250px] overflow-y-auto">
              {globalViewingNotice.content}
            </p>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setGlobalViewingNotice(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-mono text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition shadow-lg cursor-pointer animate-pulse"
              >
                Acknowledge Receipt
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification Layer */}
      <NoticeToastContainer 
        toasts={toasts} 
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} 
        onViewNotice={(notice) => setGlobalViewingNotice(notice)} 
      />
    </div>
  );
}
