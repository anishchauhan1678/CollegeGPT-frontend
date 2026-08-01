import React from "react";
import { 
  Home, 
  MessageSquareCode, 
  Building2, 
  Users, 
  Briefcase, 
  BookOpen, 
  Calendar, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Cpu, 
  Menu, 
  X,
  UserCheck,
  Sparkles,
  ClipboardCheck,
  GraduationCap
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: { name: string; email: string; role: UserRole; avatarUrl?: string; semester?: number } | null;
  onLogout: () => void;
  onTriggerIntro: () => void;
}

export default function Sidebar({ activeTab, onSelectTab, currentUser, onLogout, onTriggerIntro }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { id: "chatbot", label: "AI Chat Copilot", icon: <MessageSquareCode className="w-5 h-5" />, highlight: true },
    { id: "departments", label: "Departments", icon: <Building2 className="w-5 h-5" /> },
    { id: "faculty", label: "Faculty", icon: <Users className="w-5 h-5" /> },
    { id: "placements", label: "Placements", icon: <Briefcase className="w-5 h-5" /> },
    { id: "notes", label: "Notes Hub", icon: <BookOpen className="w-5 h-5" /> },
    { id: "events", label: "Events", icon: <Calendar className="w-5 h-5" /> },
    { id: "attendance", label: "Attendance Count", icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: "scholarships", label: "Scholarships", icon: <GraduationCap className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const adminItem = { id: "admin", label: "Admin Panel", icon: <ShieldCheck className="w-5 h-5" /> };

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    setIsOpen(false);
  };

  const currentRoleColor = () => {
    if (currentUser?.role === "superadmin") return "text-red-400 border-red-500/30 bg-red-500/10";
    if (currentUser?.role === "admin") return "text-pink-400 border-pink-500/30 bg-pink-500/10";
    if (currentUser?.role === "faculty") return "text-purple-400 border-purple-500/30 bg-purple-500/10";
    return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
  };

  return (
    <>
      {/* Mobile top navigation header */}
      <div className="lg:hidden w-full h-16 bg-[#0a0c16] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-2" onClick={() => handleItemClick("dashboard")}>
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-base text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            PANDA AI
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white/[0.03] border-r border-white/10 backdrop-blur-2xl flex flex-col justify-between p-6 transition-transform duration-300 lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0 pt-20 lg:pt-6" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo and App Brand (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 mb-8 cursor-pointer" onClick={() => handleItemClick("dashboard")}>
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
            <Cpu className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="font-display font-bold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            PANDA AI
          </span>
        </div>

        {/* Navigation Items list */}
        <nav className="flex-grow space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition duration-200 border
                ${activeTab === item.id 
                  ? "bg-white/10 border-white/10 text-white shadow-lg shadow-indigo-500/10" 
                  : item.highlight
                    ? "bg-purple-500/5 border-purple-500/10 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/20"
                    : "bg-transparent border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className={activeTab === item.id ? "text-white" : item.highlight ? "text-purple-400" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.highlight && (
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              )}
            </button>
          ))}

          {/* Admin panel menu link (Visible only to authorized roles) */}
          {(currentUser?.role === "admin" || currentUser?.role === "faculty") && (
            <button
              onClick={() => handleItemClick(adminItem.id)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition duration-200 border mt-4
                ${activeTab === adminItem.id 
                  ? "bg-white/10 border-white/10 text-white shadow-lg" 
                  : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className={activeTab === adminItem.id ? "text-white" : "text-slate-400 group-hover:text-white"}>
                  {adminItem.icon}
                </span>
                <span>{adminItem.label}</span>
              </div>
              {currentUser?.role === "admin" ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-500/10 border border-pink-400/30 text-pink-400 font-mono">
                  SECURE
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono">
                  STAFF
                </span>
              )}
            </button>
          )}

          {currentUser?.role === "superadmin" && (
            <button
              onClick={() => handleItemClick("superadmin")}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition duration-200 border mt-4
                ${activeTab === "superadmin" 
                  ? "bg-red-500/10 border-red-500/20 text-red-400 shadow-lg shadow-red-500/10" 
                  : "bg-transparent border-transparent text-slate-400 hover:text-red-400 hover:bg-red-500/5"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className={activeTab === "superadmin" ? "text-red-400" : "text-slate-400"}>
                  <ShieldCheck className="w-5 h-5 text-red-400" />
                </span>
                <span>Super Admin</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 border border-red-500/30 text-red-400 font-mono animate-pulse">
                ROOT
              </span>
            </button>
          )}
        </nav>

        {/* User Identity widget */}
        {currentUser && (
          <div className="border-t border-white/5 pt-6 mt-6 space-y-4">
            <div 
              onClick={() => handleItemClick("profile")}
              className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition"
            >
              <img 
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"} 
                alt={currentUser.name} 
                className="w-10 h-10 rounded-lg object-cover border border-white/10"
              />
              <div className="flex-grow min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold font-mono uppercase tracking-wider border ${currentRoleColor()}`}>
                    {currentUser.role}
                  </span>
                  {currentUser.semester !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold font-mono uppercase bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                      Sem {currentUser.semester}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onTriggerIntro}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/5 transition font-mono uppercase tracking-wider border border-cyan-500/10"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Replay Intro Screen</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition font-mono uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              <span>Deauthorize Session</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
