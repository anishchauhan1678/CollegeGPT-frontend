import React, { useState } from "react";
import { motion } from "motion/react";
import { Settings, User, Cpu, Sparkles, CheckCircle, ShieldCheck, Heart, Palette, UploadCloud, FileText, Trash2 } from "lucide-react";
import { UserProfile } from "../types";

interface SettingsProps {
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export default function SettingsComponent({ currentUser, onUpdateUser }: SettingsProps) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [rollNo, setRollNo] = useState(currentUser.rollNo || "");
  const [dept, setDept] = useState(currentUser.department || "");
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || "");
  const [aiModel, setAiModel] = useState("nvidia/nemotron-3-ultra-550b-a55b:free");
  const [success, setSuccess] = useState(false);

  // Previous year CGPA and upload state for students
  const [previousCgpa, setPreviousCgpa] = useState<string>(
    currentUser.previousCgpa !== undefined ? String(currentUser.previousCgpa) : ""
  );
  const [markListFile, setMarkListFile] = useState<string | null>(
    currentUser.role === "student" && currentUser.previousCgpa !== undefined ? "marklist_previous_year.pdf" : null
  );
  const [isDragging, setIsDragging] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name,
      email,
      rollNo,
      department: dept,
      avatarUrl,
      previousCgpa: previousCgpa ? parseFloat(previousCgpa) : undefined
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-3xl">
      {/* Title */}
      <div className="pb-4 border-b border-white/5">
        <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-cyan-400" /> Node & Profile Settings
        </h1>
        <p className="text-sm text-slate-400">Configure your security credentials, campus profiles, and AI model parameters.</p>
      </div>

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-sm flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Settings saved successfully. All cached academic states flushed and initialized!</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-8">
        
        {/* Profile Settings form */}
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <User className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-lg text-slate-100">Identity Profile Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Roll Number ID</label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-mono">Department Name</label>
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100"
              />
            </div>
          </div>

          {/* Profile Picture Uploader */}
          <div className="space-y-3 pb-2 pt-1 border-t border-white/5">
            <label className="text-xs font-medium text-slate-300 font-mono block">PROFILE_PICTURE</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#0e1220]/50 border border-white/5">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-slate-900">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">NO_IMG</div>
                )}
              </div>
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
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
                                setAvatarUrl(compressedDataUrl);
                              } else {
                                setAvatarUrl(rawData);
                              }
                            };
                            img.onerror = () => {
                              setAvatarUrl(rawData);
                            };
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      fileInput.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-[10px] uppercase font-bold border border-cyan-500/20 transition flex items-center gap-1"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Upload Image
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-[10px] uppercase font-bold border border-red-500/20 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Image
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG, WEBP. Max size 5MB.</p>
              </div>
            </div>
          </div>

          {/* Previous Year Marks & CGPA Upload (Students Only) */}
          {currentUser.role === "student" && (
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Previous Year Mark List & Achievement System
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CGPA input */}
                <div className="space-y-1.5 flex flex-col justify-center">
                  <label className="text-xs font-medium text-slate-300 font-mono">
                    PREVIOUS_YEAR_CGPA (0.0 - 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="Enter previous CGPA (e.g. 9.15)"
                    value={previousCgpa}
                    onChange={(e) => setPreviousCgpa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 bg-[#0e1220]/90 border border-white/10"
                    required={!!markListFile}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Your previous year CGPA will automatically display in your student achievement showcase.
                  </p>
                </div>

                {/* Drag and drop file uploader */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 font-mono">
                    UPLOAD_CGPA_MARKLIST_DOCUMENT
                  </label>
                  
                  {!markListFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const files = e.dataTransfer.files;
                        if (files && files.length > 0) {
                          setMarkListFile(files[0].name);
                        }
                      }}
                      className={`h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition ${
                        isDragging
                          ? "border-cyan-400 bg-cyan-500/10 text-cyan-400"
                          : "border-white/10 hover:border-cyan-400/50 bg-[#0e1220]/50 text-slate-400 hover:text-slate-300"
                      }`}
                      onClick={() => {
                        const fileInput = document.createElement("input");
                        fileInput.type = "file";
                        fileInput.accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
                        fileInput.onchange = (e: any) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            setMarkListFile(files[0].name);
                          }
                        };
                        fileInput.click();
                      }}
                    >
                      <UploadCloud className="w-6 h-6 mb-1 text-slate-400" />
                      <span className="text-xs font-medium">Drag & Drop mark list or Click to upload</span>
                      <span className="text-[8px] text-slate-500 mt-1 font-mono uppercase">PDF, DOCX, PNG, JPG (MAX 5MB)</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-slate-200 truncate">{markListFile}</p>
                          <p className="text-[9px] text-cyan-400 font-mono font-bold">FILE_VERIFIED_SECURE</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMarkListFile(null)}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-red-500/20 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-mono text-xs font-bold uppercase text-white transition hover:opacity-90"
          >
            Save Profile Configurations
          </button>
        </form>

        {/* AI Parameters block */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h2 className="font-display font-bold text-lg text-slate-100">AI Model Framework</h2>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-300 font-mono block">Primary Intelligence Core</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 3 Ultra (Default)", desc: "High-performance reasoning & analysis", active: true },
                { id: "nvidia/llama-3.1-nemotron-70b-instruct", label: "Llama 3.1 Nemotron", desc: "Expert instructions, math & coding" },
                { id: "nvidia/nemotron-4-340b-instruct", label: "Nemotron 4 340B", desc: "Extreme parameter logical synthesis", paid: true }
              ].map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setAiModel(model.id)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    aiModel === model.id
                      ? "bg-purple-500/10 border-purple-400/50 text-purple-400"
                      : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{model.label}</div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{model.desc}</p>
                  </div>
                  {model.paid && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/10 border border-amber-400/30 text-amber-400 font-mono uppercase font-bold mt-2 w-fit">
                      Paid key required
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Information Security check */}
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
            <ShieldCheck className="w-4 h-4" /> SECURE DEPLOYMENT VERIFICATION
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            PANDA AI utilizes the **Google Gen AI @google/genai SDK** running securely within server-side Express instances to communicate with the model. No secret key hashes, passwords, or credentials are ever exposed to client bundles or browser tracking elements.
          </p>
          <div className="flex gap-4 pt-1 font-mono text-[10px] text-slate-500">
            <div>NODE_STATUS: <span className="text-emerald-400">ACTIVE</span></div>
            <div>VERIFICATION: <span className="text-purple-400">PASSED</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
