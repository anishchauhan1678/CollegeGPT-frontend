import React, { useState } from "react";
import { motion } from "motion/react";
import { KeyRound, Mail, User, ShieldAlert, Cpu, Sparkles, Phone, Layers, Hash, UploadCloud, Trash2 } from "lucide-react";
import { UserRole, DepartmentItem } from "../types";
import { dbService } from "../dbService";
import { db, collection, onSnapshot } from "../firebase";
// @ts-expect-error - Static image asset path
import anishPhoto from "../assets/images/anish_profile_photo_1783852329835.jpg";

interface LoginSignupProps {
  onLoginSuccess: (user: { 
    id?: string;
    name: string; 
    email: string; 
    role: UserRole;
    rollNo?: string;
    department?: string;
    mobile?: string;
    semester?: number;
    avatarUrl?: string;
  }) => void;
  onNavigateHome: () => void;
  departments?: DepartmentItem[];
}

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Artificial Intelligence & Data Science",
  "Electronics & Communication Engineering",
  "Robotics & Automation"
];

export default function LoginSignup({ onLoginSuccess, onNavigateHome, departments }: LoginSignupProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>("student");
  
  // General details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Student-specific details
  const [rollNo, setRollNo] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [mobile, setMobile] = useState("");
  const [semester, setSemester] = useState<number>(6);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  
  const [error, setError] = useState("");
  const [dynamicDepartments, setDynamicDepartments] = useState<string[]>(DEPARTMENTS);

  // Dynamic departments synchronized using a unified realtime listener or props
  React.useEffect(() => {
    if (departments && departments.length > 0) {
      const names = departments.map((d) => d.name).filter(Boolean);
      const combined = Array.from(new Set([...DEPARTMENTS, ...names]));
      setDynamicDepartments(combined);
    } else {
      // Setup direct listener for department metadata
      const deptColRef = collection(db, "departments");
      const unsubscribe = onSnapshot(deptColRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: string[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.name) {
              list.push(data.name);
            }
          });
          list.sort((a, b) => a.localeCompare(b));
          const combined = Array.from(new Set([...DEPARTMENTS, ...list]));
          setDynamicDepartments(combined);
        } else {
          setDynamicDepartments(DEPARTMENTS);
        }
      }, (err) => {
        console.error("Error listening to departments in LoginSignup:", err);
      });
      return () => unsubscribe();
    }
  }, [departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please provide an email address.");
      return;
    }

    if (role === "student") {
      if (!name) {
        setError("Please provide a name.");
        return;
      }
      if (!rollNo) {
        setError("Please provide a Roll Number.");
        return;
      }
      if (!department) {
        setError("Please select a Department.");
        return;
      }
      if (!mobile) {
        setError("Please provide a Mobile Number.");
        return;
      }
      if (!semester) {
        setError("Please select a Semester.");
        return;
      }
    } else {
      if (!isLogin && !name) {
        setError("Please provide a name.");
        return;
      }
    }

    let resolvedName = name;
    let resolvedAvatarUrl = (role === "student" && profilePic) ? profilePic : undefined;
    let resolvedId: string | undefined = undefined;

    // Password validation for Admin, Faculty, and SuperAdmin roles
    if (role === "admin" || role === "faculty" || role === "superadmin") {
      try {
        const existingProfile = await dbService.getUserProfileByEmail(email);

        if (existingProfile) {
          if (existingProfile.role !== role) {
            setError(`This email is registered as a ${existingProfile.role}, not an authorized ${role}.`);
            return;
          }

          if (existingProfile.password) {
            if (password !== existingProfile.password) {
              setError("Incorrect password for this authorized user account.");
              return;
            }
          } else {
            const roleKey = role === "admin" ? "admin_pwd" : role === "faculty" ? "faculty_pwd" : "superadmin_pwd";
            const defaultPwd = role === "admin" ? "admin-secure" : role === "faculty" ? "faculty-secure" : "superadmin-secure";
            const savedPwd = localStorage.getItem(roleKey) || defaultPwd;

            if (password !== savedPwd) {
              setError(`Incorrect password for the authorized ${role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "Faculty"} node.`);
              return;
            }
          }

          resolvedName = existingProfile.name;
          resolvedAvatarUrl = existingProfile.avatarUrl;
          resolvedId = existingProfile.id;
        } else {
          // Fallback to role-wide defaults if profile is not created in DB yet
          const roleKey = role === "admin" ? "admin_pwd" : role === "faculty" ? "faculty_pwd" : "superadmin_pwd";
          const defaultPwd = role === "admin" ? "admin-secure" : role === "faculty" ? "faculty-secure" : "superadmin-secure";
          const savedPwd = localStorage.getItem(roleKey) || defaultPwd;

          if (password !== savedPwd) {
            setError(`Incorrect password for the authorized ${role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "Faculty"} node.`);
            return;
          }

          if (isLogin) {
            resolvedName = email.includes("vance") ? "Dr. Evelyn Vance" : email.includes("super") ? "Super Admin Core" : email.includes("admin") ? "Dean Shepherd" : "Alex Mercer";
          }
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        const roleKey = role === "admin" ? "admin_pwd" : role === "faculty" ? "faculty_pwd" : "superadmin_pwd";
        const defaultPwd = role === "admin" ? "admin-secure" : role === "faculty" ? "faculty-secure" : "superadmin-secure";
        const savedPwd = localStorage.getItem(roleKey) || defaultPwd;

        if (password !== savedPwd) {
          setError("Database error or incorrect password.");
          return;
        }
      }
    }

    // Pass role details up
    onLoginSuccess({
      id: resolvedId,
      name: role === "student" ? name : resolvedName,
      email,
      role,
      rollNo: role === "student" ? rollNo : undefined,
      department: role === "student" ? department : undefined,
      mobile: role === "student" ? mobile : undefined,
      semester: role === "student" ? semester : undefined,
      avatarUrl: resolvedAvatarUrl
    });
  };

  const handleQuickSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError("");
    if (selectedRole === "student") {
      setName("PANDA AI");
      setEmail("anishchauhan1678@gmail.com");
      setRollNo("2024CSB1098");
      setDepartment("Computer Science & Engineering");
      setMobile("9876543210");
      setSemester(6);
      setPassword("student-secure");
      setProfilePic(anishPhoto);
    } else if (selectedRole === "faculty") {
      setName("Dr. Evelyn Vance");
      setEmail("e.vance@cyber-tech.edu");
      setPassword("faculty-secure");
      setRollNo("");
      setMobile("");
    } else if (selectedRole === "admin") {
      setName("Dean Shepherd");
      setEmail("admin@cyber-tech.edu");
      setPassword("admin-secure");
      setRollNo("");
      setMobile("");
    } else if (selectedRole === "superadmin") {
      setName("Super Admin Core");
      setEmail("superadmin@cyber-tech.edu");
      setPassword("superadmin-secure");
      setRollNo("");
      setMobile("");
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent flex items-center justify-center p-6 overflow-hidden">
      {/* Decorative cyber glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-[140px] pointer-events-none" />

      <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ type: "spring", stiffness: 100, damping: 15 }}
         className="w-full max-w-lg rounded-3xl glass-panel border border-white/10 relative overflow-hidden p-8 shadow-2xl shadow-indigo-500/5 z-10"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {/* App Logo */}
        <div className="flex flex-col items-center gap-2 mb-8 cursor-pointer" onClick={onNavigateHome}>
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse-glow">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            PANDA AI
          </span>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">Autonomous Core Authorization</p>
        </div>

        {/* Demo Roles Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Instant Demo Access Switcher
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect("student")}
              className={`py-2 px-1 rounded-xl text-[10px] font-medium font-mono border transition ${
                role === "student"
                  ? "bg-cyan-500/10 border-cyan-400/50 text-cyan-400"
                  : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
              }`}
            >
              STUDENT
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect("faculty")}
              className={`py-2 px-1 rounded-xl text-[10px] font-medium font-mono border transition ${
                role === "faculty"
                  ? "bg-purple-500/10 border-purple-400/50 text-purple-400"
                  : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
              }`}
            >
              FACULTY
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect("admin")}
              className={`py-2 px-1 rounded-xl text-[10px] font-medium font-mono border transition ${
                role === "admin"
                  ? "bg-pink-500/10 border-pink-400/50 text-pink-400"
                  : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
              }`}
            >
              ADMIN
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect("superadmin")}
              className={`py-2 px-1 rounded-xl text-[10px] font-medium font-mono border transition ${
                role === "superadmin"
                  ? "bg-red-500/10 border-red-400/50 text-red-400 animate-pulse"
                  : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
              }`}
            >
              SUPER_ADMIN
            </button>
          </div>
        </div>

        {/* Dynamic header label based on student requirements */}
        <div className="text-center mb-6">
          <h2 className="text-sm font-semibold font-mono text-slate-300 uppercase tracking-wider">
            {role === "student" ? "STUDENT INTEGRATED AUTHENTICATION" : isLogin ? "Secure Authorization" : "New Faculty/Admin Registration"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {role === "student" 
              ? "All active fields will automatically synchronize with the central admin ledger." 
              : "Access requires authorization keys issued by the campus administrator."}
          </p>
        </div>

        {/* Auth Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name (Mandatory for students, and for faculty/admin sign up) */}
          {(role === "student" || !isLogin) && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">FULL_NAME</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-100"
                  required
                />
              </div>
            </div>
          )}

          {/* Email ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 font-mono">CREDENTIAL_EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="email"
                placeholder="student@cyber-tech.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-100"
                required
              />
            </div>
          </div>

          {/* Student-specific: Roll Number & Mobile Number & Department */}
          {role === "student" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Roll Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 font-mono">ROLL_NUMBER</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="2024CSB1098"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-100"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 font-mono">MOBILE_NUMBER</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-100"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Department & Semester Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 font-mono">DEPARTMENT</label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-xs text-slate-100 bg-[#0e1220]/90 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500/50"
                      required
                    >
                      {dynamicDepartments.map((dept) => (
                        <option key={dept} value={dept} className="bg-[#0f172a] text-slate-200">
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Semester */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 font-mono">SEMESTER</label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-xs text-slate-100 bg-[#0e1220]/90 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500/50"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem} className="bg-[#0f172a] text-slate-200">
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Profile Picture Upload Optional Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">PROFILE_PICTURE (OPTIONAL)</label>
                {!profilePic ? (
                  <div
                    onClick={() => {
                      const fileInput = document.createElement("input");
                      fileInput.type = "file";
                      fileInput.accept = "image/*";
                      fileInput.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            const rawData = uploadEvent.target?.result as string;
                            const img = new Image();
                            img.src = rawData;
                            img.onload = () => {
                              const canvas = document.createElement("canvas");
                              const max_size = 180;
                              let width = img.width;
                              let height = img.height;
                              if (width > height) {
                                if (width > max_size) {
                                  height *= max_size / width;
                                  width = max_size;
                                }
                              } else {
                                if (height > max_size) {
                                  width *= max_size / height;
                                  height = max_size;
                                }
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext("2d");
                              if (ctx) {
                                ctx.drawImage(img, 0, 0, width, height);
                                const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
                                setProfilePic(compressedDataUrl);
                              } else {
                                setProfilePic(rawData);
                              }
                            };
                            img.onerror = () => {
                              setProfilePic(rawData);
                            };
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      fileInput.click();
                    }}
                    className="h-20 rounded-xl border border-dashed border-white/10 hover:border-cyan-400/50 bg-[#0e1220]/50 flex items-center justify-center gap-3 cursor-pointer text-slate-400 hover:text-slate-300 transition"
                  >
                    <UploadCloud className="w-5 h-5 text-slate-500" />
                    <span className="text-xs font-medium">Click to upload photo (JPG/PNG)</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={profilePic}
                        alt="Profile Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-white/10"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">photo_selected.png</p>
                        <p className="text-[9px] text-cyan-400 font-mono uppercase font-bold">READY_TO_SYNCHRONIZE</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfilePic(null)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-red-500/20 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Password (for non-student registration or simple access verification) */}
          {role !== "student" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">ACCESS_TOKEN_PASSWORD</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-100"
                  required
                />
              </div>
            </div>
          )}

          {/* Toggle for Faculty/Admin Role Selection if not Student */}
          {role !== "student" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">AUTHORIZATION_LEVEL</label>
              <div className="grid grid-cols-3 gap-2">
                {(["faculty", "admin", "superadmin"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 rounded-xl text-xs font-medium capitalize border transition ${
                      role === r
                        ? "bg-purple-500/10 border-purple-400/50 text-purple-400"
                        : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {r === "superadmin" ? "Super Admin" : r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form tab toggle for non-students */}
          {role !== "student" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="text-xs text-indigo-400 hover:underline"
              >
                {isLogin ? "Need to create a Faculty/Admin ID?" : "Already have a Faculty/Admin ID?"}
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-sm tracking-wide text-white transition shadow-[0_0_20px_rgba(168,85,247,0.2)] mt-6"
          >
            {role === "student" ? "Authorize & Connect Student Core" : isLogin ? "Authorize Secure Access" : "Configure New Core Profile"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={onNavigateHome}
            className="text-xs text-slate-500 hover:text-cyan-400 font-mono transition"
          >
            ← Return to Core Landing
          </button>
        </div>
      </motion.div>
    </div>
  );
}
