"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { 
  Cpu, LayoutDashboard, Briefcase, FileUp, BarChart4, 
  MessageSquare, Settings, LogOut, Loader2, Bell, Users2, ArrowLeftRight,
  ChevronLeft, ChevronRight, Search, Terminal, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Collapse sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Command Palette State
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      setNotifications([
        { id: 1, title: "System Ready", message: "Procedural dataset seeded with 105 candidates.", is_read: false },
        { id: 2, title: "Embedding Loaded", message: "SentenceTransformers all-MiniLM-L6-v2 vector indexing successful.", is_read: true }
      ]);
    }
  }, [isAuthenticated]);

  // Command palette hotkey (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050508]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-semibold text-zinc-400">Authenticating session...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
    { name: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
    { name: "Upload Resumes", href: "/recruiter/resumes", icon: FileUp },
    { name: "Candidate Rankings", href: "/recruiter/ranking", icon: BarChart4 },
    { name: "Compare Candidates", href: "/recruiter/compare", icon: ArrowLeftRight },
    { name: "AI Recruiter Chat", href: "/recruiter/chat", icon: MessageSquare },
    { name: "Analytics Dashboard", href: "/recruiter/analytics", icon: Users2 },
    { name: "Settings & API Keys", href: "/recruiter/settings", icon: Settings },
  ];

  const filteredCommands = menuItems.filter((item) =>
    item.name.toLowerCase().includes(commandSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050508] text-zinc-100">
      
      {/* Collapsible Sidebar */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="border-r border-white/5 bg-[#0a0a0f] flex flex-col shrink-0 relative z-20"
      >
        {/* Brand Header */}
        <div className={`p-6 border-b border-white/5 flex items-center justify-between`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0 border border-primary/20">
              <Cpu className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold tracking-tight text-white whitespace-nowrap text-sm bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent"
              >
                TalentMind AI
              </motion.span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 text-xs font-semibold px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-primary text-white shadow-[0_4px_15px_rgba(99,102,241,0.2)] border border-primary/30"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                {!isCollapsed && <span>{item.name}</span>}
                {isCollapsed && (
                  <div className="absolute left-16 bg-zinc-950 border border-white/10 px-2 py-1 rounded-md text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-premium">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle Trigger */}
        <div className="px-4 py-3 border-t border-white/5 flex justify-center">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Recruiter Identity Footer */}
        <div className="p-4 border-t border-white/5 bg-[#09090d]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 flex items-center justify-center bg-primary/20 border border-primary/30 text-primary text-[10px] font-extrabold rounded-full shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                {user?.full_name?.split(" ").map(n => n[0]).join("") || "R"}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <h4 className="text-[11px] font-bold text-white truncate leading-tight">{user?.full_name}</h4>
                  <p className="text-[9px] text-zinc-500 truncate leading-none mt-0.5">{user?.email}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={logout}
                title="Log out"
                className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-zinc-500 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Panel Frame */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#050508]/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 relative z-30">
          {/* Breadcrumbs & Palette shortcut trigger */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-zinc-500 font-medium">Talent Portal</span>
              <span className="text-zinc-700">/</span>
              <span className="text-primary font-bold capitalize bg-primary/10 px-2 py-0.5 rounded-md border border-primary/15">
                {pathname.split("/").pop()?.replace("-", " ") || "Portal"}
              </span>
            </div>

            {/* Quick Palette button */}
            <button 
              onClick={() => setShowCommandPalette(true)}
              className="hidden md:flex items-center space-x-2 text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg transition-colors font-semibold"
            >
              <Search className="w-3 h-3" />
              <span>Search menu...</span>
              <kbd className="bg-zinc-900 border border-white/10 text-[9px] px-1.5 py-0.2 rounded font-sans">Ctrl+K</kbd>
            </button>
          </div>

          <div className="flex items-center space-x-4 relative">
            {/* Notification Bell */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.is_read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary border border-zinc-950 rounded-full" />
              )}
            </button>

            {/* Notification Popover */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-11 w-80 bg-[#09090d] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-50 p-4 space-y-3"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Notifications</h4>
                    <button 
                      onClick={() => {
                        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
                      }}
                      className="text-[9px] text-primary font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-2.5 rounded-xl text-[11px] transition-colors border ${n.is_read ? 'bg-white/[0.01] border-white/5' : 'bg-primary/5 border-primary/20'}`}>
                        <h5 className="font-bold text-zinc-200">{n.title}</h5>
                        <p className="text-zinc-500 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-4 w-[1px] bg-white/10" />
            
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Recruiter Portal</span>
              <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider leading-none mt-0.5">Enterprise License</p>
            </div>
          </div>
        </header>

        {/* Page Content Panel with transitions */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Ctrl + K Command Palette Modal */}
      <AnimatePresence>
        {showCommandPalette && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCommandPalette(false)}
              className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm"
            />
            
            {/* Palette Panel */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden z-10"
            >
              {/* Search Bar */}
              <div className="flex items-center space-x-3 px-4 py-3 border-b border-white/5">
                <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                <input 
                  type="text"
                  placeholder="Type a menu command..."
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  className="w-full bg-transparent border-0 text-white placeholder-zinc-600 text-xs focus:outline-none py-1"
                  autoFocus
                />
              </div>

              {/* Commands List */}
              <div className="p-2 max-h-[300px] overflow-y-auto space-y-0.5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 py-2 block">
                  Quick Navigation
                </span>
                
                {filteredCommands.length === 0 ? (
                  <div className="text-center py-6 text-xs text-zinc-600">
                    No matching menu commands found
                  </div>
                ) : (
                  filteredCommands.map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.name}
                        onClick={() => {
                          router.push(cmd.href);
                          setShowCommandPalette(false);
                          setCommandSearch("");
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors text-xs font-semibold text-left"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{cmd.name}</span>
                        </div>
                        <span className="text-[9px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-zinc-500 font-bold">
                          Navigate
                        </span>
                      </button>
                    );
                  })
                )}

                {/* Quick actions inside palette */}
                <div className="border-t border-white/5 mt-2 pt-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 py-1.5 block">
                    AI Recruiter Actions
                  </span>
                  <button
                    onClick={() => {
                      router.push("/recruiter/chat");
                      setShowCommandPalette(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors text-xs font-semibold text-left"
                  >
                    <Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Run AI Recruiter Chatbot</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowCommandPalette(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors text-xs font-semibold text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Log Out Recruiter Account</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
