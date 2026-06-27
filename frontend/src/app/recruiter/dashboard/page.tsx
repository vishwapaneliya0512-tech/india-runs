"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Briefcase, Search, Sparkles, UserCheck, Calendar,
  ArrowRight, Plus, Upload, MessageSquare, Play, CheckCircle, Brain, Terminal
} from "lucide-react";
import api from "@/lib/api";
import { DashboardMetrics } from "@/lib/types";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie, FunnelChart, Funnel, LabelList
} from "recharts";
import { motion } from "framer-motion";

export default function RecruiterDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_candidates: 105,
    jobs_posted: 20,
    active_searches: 20,
    ai_ranked_today: 105,
    shortlisted_candidates: 5,
    interviews_scheduled: 2
  });
  
  const [charts, setCharts] = useState<any>({
    skill_distribution: [
      { skill: "Python", count: 48 },
      { skill: "JavaScript", count: 42 },
      { skill: "TypeScript", count: 35 },
      { skill: "React", count: 30 },
      { skill: "AWS", count: 28 },
      { skill: "Docker", count: 25 },
      { skill: "PostgreSQL", count: 22 }
    ],
    experience_distribution: [
      { range: "Entry (0-2 yrs)", count: 22 },
      { range: "Mid-Level (3-5 yrs)", count: 45 },
      { range: "Senior (6-9 yrs)", count: 28 },
      { range: "Principal (10+ yrs)", count: 10 }
    ],
    match_score_distribution: [
      { range: "90-100%", count: 12 },
      { range: "80-89%", count: 25 },
      { range: "70-79%", count: 38 },
      { range: "50-69%", count: 20 },
      { range: "<50%", count: 10 }
    ],
    hining_funnel: [
      { stage: "Applied", candidates: 105, fill: "#6366f1" },
      { stage: "Shortlisted", candidates: 42, fill: "#818cf8" },
      { stage: "Interviewed", candidates: 16, fill: "#a78bfa" },
      { stage: "Hired", candidates: 3, fill: "#34d399" }
    ]
  });

  const [activities, setActivities] = useState<any[]>([
    { id: 1, action: "Create Job", details: "Created Job Description: Senior Full Stack Engineer", time: "2 hours ago" },
    { id: 2, action: "Upload Resumes", details: "Uploaded 10 resumes in pipeline", time: "3 hours ago" },
    { id: 3, action: "AI Rank", details: "Ranked candidates for Python Developer role", time: "5 hours ago" },
    { id: 4, action: "Interview Scheduled", details: "Scheduled tech interview for John Doe", time: "1 day ago" }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const metRes = await api.get("/analytics/dashboard");
        setMetrics(metRes.data);
        
        const chartRes = await api.get("/analytics/details");
        if (chartRes.data) {
          setCharts(chartRes.data);
        }
      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const cardList = [
    { title: "Total Candidates", value: metrics.total_candidates, icon: Users, desc: "Indexed resume pool", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    { title: "Jobs Posted", value: metrics.jobs_posted, icon: Briefcase, desc: "Total open listings", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { title: "Active Searches", value: metrics.active_searches, icon: Search, desc: "Actively index-matched", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { title: "AI Ranked Today", value: metrics.ai_ranked_today, icon: Sparkles, desc: "Multi-signal computations", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { title: "Shortlisted Profiles", value: metrics.shortlisted_candidates, icon: UserCheck, desc: "Added to shortlist pools", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { title: "Interviews Scheduled", value: metrics.interviews_scheduled, icon: Calendar, desc: "Calendar scheduled blocks", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" }
  ];

  // Colors
  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#3b82f6", "#10b981"];

  // Custom tooltips for Recharts dark theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#09090f] border border-white/10 p-3 rounded-xl shadow-premium text-[10px] text-zinc-300">
          <p className="font-bold text-white mb-1">{label}</p>
          <p className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Volume: <strong className="text-white font-bold">{payload[0].value}</strong></span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Banner Skeleton */}
        <div className="h-28 skeleton w-full rounded-2xl" />
        
        {/* KPI Skeleton Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 skeleton w-full rounded-2xl" />
          ))}
        </div>

        {/* Charts Skeleton Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-80 skeleton w-full rounded-2xl" />
          <div className="h-80 skeleton w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title Header / Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-[#0a0a0f] to-[#050508] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary shrink-0 hidden sm:flex">
            <Brain className="w-6 h-6 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>Recruiter Control Center</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Active</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">ChromaDB semantic indexing and multi-signal ranks loaded successfully.</p>
          </div>
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto shrink-0 justify-end">
          <Link href="/recruiter/jobs" className="inline-flex items-center justify-center space-x-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-xl shadow-premium transition-all hover:-translate-y-0.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Job</span>
          </Link>
          <Link href="/recruiter/resumes" className="inline-flex items-center justify-center space-x-2 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Resumes</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {cardList.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:border-white/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-xl border ${card.color} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight">{card.value}</span>
                <p className="text-[9px] text-zinc-500 mt-1 truncate">{card.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Match Score Distribution */}
        <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 shadow-subtle flex flex-col justify-between">
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Match Score Distribution</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Applicant matching percentile across semantic vector searches</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.match_score_distribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMatch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="range" tick={{ fontSize: 9, fill: "#71717a" }} stroke="rgba(255,255,255,0.05)" />
                <YAxis tick={{ fontSize: 9, fill: "#71717a" }} stroke="rgba(255,255,255,0.05)" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMatch)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Density Chart */}
        <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 shadow-subtle flex flex-col justify-between">
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Skill Frequencies</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Most common technical tags found across candidates pool</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.skill_distribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="skill" tick={{ fontSize: 8, fill: "#71717a" }} stroke="rgba(255,255,255,0.05)" />
                <YAxis tick={{ fontSize: 9, fill: "#71717a" }} stroke="rgba(255,255,255,0.05)" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {charts.skill_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hiring Funnel Simulation */}
        <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 shadow-subtle flex flex-col justify-between">
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Candidate Hiring Funnel</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Stages progress summary of processed applicant pools</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip contentStyle={{ background: "#09090f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 10 }} />
                <Funnel dataKey="candidates" data={charts.hining_funnel} isAnimationActive>
                  <LabelList position="right" fill="#a1a1aa" stroke="none" dataKey="stage" style={{ fontSize: 9, fontWeight: "bold" }} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experience Tenures Distribution */}
        <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 shadow-subtle flex flex-col justify-between">
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Experience Range</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Proportion of candidate seniorities in the database</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ background: "#09090f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 10 }} />
                <Pie
                  data={charts.experience_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="range"
                  style={{ fontSize: 9, fill: "#a1a1aa", fontWeight: "bold" }}
                >
                  {charts.experience_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activities */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Quick Actions Card */}
        <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 shadow-subtle md:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">Shortcut Operations</h3>
          <div className="space-y-2.5">
            <Link href="/recruiter/resumes" className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/5 transition-all text-xs font-semibold group">
              <div className="flex items-center space-x-2.5">
                <Upload className="w-4 h-4 text-primary shrink-0" />
                <span className="text-zinc-200">Bulk Upload Resumes</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link href="/recruiter/ranking" className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/5 transition-all text-xs font-semibold group">
              <div className="flex items-center space-x-2.5">
                <Play className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-zinc-200">Review Candidate Ranks</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link href="/recruiter/chat" className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/5 transition-all text-xs font-semibold group">
              <div className="flex items-center space-x-2.5">
                <MessageSquare className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-zinc-200">AI Recruiter Chatbot</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 shadow-subtle md:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-primary shrink-0" />
            <span>Recruiter Operations Log</span>
          </h3>
          <div className="space-y-3.5 max-h-[175px] overflow-y-auto pr-1">
            {activities.map((act) => (
              <div key={act.id} className="flex justify-between items-start text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="flex space-x-3">
                  <div className="mt-0.5 p-1 bg-white/5 text-primary border border-white/5 rounded-full shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-200">{act.action}</h5>
                    <p className="text-zinc-500 mt-1 leading-relaxed">{act.details}</p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 font-semibold shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
