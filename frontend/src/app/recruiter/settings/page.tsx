"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  Settings, Key, User, Bell, Check, ShieldAlert, Cpu
} from "lucide-react";

export default function RecruiterSettings() {
  const { user, logout } = useAuth();
  
  // Profile settings state
  const [profileName, setProfileName] = useState(user?.full_name || "");
  const [company, setCompany] = useState("TalentMind Partner");
  const [title, setTitle] = useState("Recruitment Lead");
  const [dept, setDept] = useState("Human Resources");
  
  // Keys Config State
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  
  // Save confirmation states
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedKeys, setSavedKeys] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGeminiKey(localStorage.getItem("gemini_key") || "");
      setOpenaiKey(localStorage.getItem("openai_key") || "");
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 3000);
  };

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("gemini_key", geminiKey);
      localStorage.setItem("openai_key", openaiKey);
    }
    setSavedKeys(true);
    setTimeout(() => setSavedKeys(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Configuration Settings</h1>
        <p className="text-sm text-muted-foreground">Adjust recruiter parameters, integration tokens, and user credentials</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="bg-white border border-border rounded-xl p-5 shadow-subtle h-max md:col-span-1 space-y-2">
          <div className="p-2 font-bold text-foreground border-b border-border mb-3 inline-flex items-center space-x-2 w-full">
            <Settings className="w-4 h-4 text-primary" />
            <span>Options Sections</span>
          </div>
          <a href="#profile" className="flex items-center space-x-2.5 px-3 py-2 hover:bg-secondary rounded-lg font-semibold text-muted-foreground hover:text-foreground">
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </a>
          <a href="#keys" className="flex items-center space-x-2.5 px-3 py-2 hover:bg-secondary rounded-lg font-semibold text-muted-foreground hover:text-foreground">
            <Key className="w-4 h-4" />
            <span>LLM Integration Keys</span>
          </a>
          <a href="#notifications" className="flex items-center space-x-2.5 px-3 py-2 hover:bg-secondary rounded-lg font-semibold text-muted-foreground hover:text-foreground">
            <Bell className="w-4 h-4" />
            <span>Recruitment Alerts</span>
          </a>
        </div>

        {/* Configurations Form body */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Section: Profile */}
          <div id="profile" className="bg-white border border-border rounded-xl p-6 shadow-subtle space-y-5">
            <h3 className="text-sm font-bold pb-2 border-b border-border flex items-center space-x-2">
              <User className="w-4 h-4 text-primary" />
              <span>Profile Details</span>
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-white border border-border text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-white border border-border text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Department</label>
                  <input
                    type="text"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full bg-white border border-border text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Title Role</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-border text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {savedProfile && (
                  <span className="text-green-600 font-bold flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Profile saved.</span>
                  </span>
                )}
                <span className="text-transparent" />
                <button
                  type="submit"
                  className="text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-lg shadow-subtle transition-all"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Section: API Keys */}
          <div id="keys" className="bg-white border border-border rounded-xl p-6 shadow-subtle space-y-5">
            <h3 className="text-sm font-bold pb-2 border-b border-border flex items-center space-x-2">
              <Key className="w-4 h-4 text-primary" />
              <span>LLM Integration API Keys</span>
            </h3>
            
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-lg flex items-start space-x-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">LLM Fallback Mode Active</span>
                <p className="mt-1 leading-relaxed text-[11px] text-amber-700">
                  If no custom API keys are saved, the system automatically uses the Local Fallback Engine. Seeded datasets and resume extraction will run locally using regex/spacy heuristics. Save keys to enable real Gemini/OpenAI API matching.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveKeys} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Gemini API Key (Google AI Studio)
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-white border border-border text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white border border-border text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {savedKeys && (
                  <span className="text-green-600 font-bold flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Keys saved in browser memory.</span>
                  </span>
                )}
                <span className="text-transparent" />
                <button
                  type="submit"
                  className="text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-lg shadow-subtle transition-all"
                >
                  Save Integration Keys
                </button>
              </div>
            </form>
          </div>

          {/* Section: Notifications */}
          <div id="notifications" className="bg-white border border-border rounded-xl p-6 shadow-subtle space-y-5">
            <h3 className="text-sm font-bold pb-2 border-b border-border flex items-center space-x-2">
              <Bell className="w-4 h-4 text-primary" />
              <span>Email & Sourcing Alerts</span>
            </h3>
            
            <div className="space-y-3.5 text-xs text-muted-foreground font-semibold">
              <label className="flex items-center space-x-3 text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary w-4.5 h-4.5" />
                <span>Notify me when a resume finishes vector embedding parsing</span>
              </label>

              <label className="flex items-center space-x-3 text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary w-4.5 h-4.5" />
                <span>Email me candidate match summaries once ranking triggers</span>
              </label>

              <label className="flex items-center space-x-3 text-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary w-4.5 h-4.5" />
                <span>Alert on candidate GitHub/Portfolio update syncs</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
