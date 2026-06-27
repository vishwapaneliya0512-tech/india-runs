"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { CandidateDetail } from "@/lib/types";
import { 
  User, Mail, Phone, MapPin, Linkedin, Github, Globe, Award, 
  CheckCircle2, XCircle, ArrowLeft, Loader2, Sparkles, HelpCircle, 
  TrendingUp, FileText, ChevronRight, Check, X, ArrowLeftRight
} from "lucide-react";

export default function CandidateDossier() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id;
  
  const [cand, setCand] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ai-fit" | "experience" | "education" | "projects" | "resume">("ai-fit");
  const [shortlisted, setShortlisted] = useState(false);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await api.get(`/candidates/${candidateId}`);
        setCand(res.data);
        if (res.data.status === "Shortlisted") setShortlisted(true);
        if (res.data.status === "Rejected") setRejected(true);
      } catch (error) {
        console.error("Error loading candidate profile", error);
      } finally {
        setLoading(false);
      }
    };
    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  const handleShortlist = async () => {
    if (!cand) return;
    try {
      // Find the first job or default to ID 1 for demonstration
      await api.post(`/candidates/${cand.id}/shortlist?job_id=1`);
      setShortlisted(true);
      setRejected(false);
      alert("Candidate successfully added to Shortlist!");
    } catch (error) {
      alert("Failed to shortlist candidate");
    }
  };

  const handleReject = async () => {
    if (!cand) return;
    try {
      await api.post(`/candidates/${cand.id}/reject`);
      setRejected(true);
      setShortlisted(false);
      alert("Candidate status updated to Rejected.");
    } catch (error) {
      alert("Failed to reject candidate");
    }
  };

  const handleAddToCompare = () => {
    if (!cand) return;
    // Add to localStorage compare queue
    const queueJson = localStorage.getItem("compare_queue") || "[]";
    const queue = JSON.parse(queueJson);
    if (!queue.includes(cand.id)) {
      if (queue.length >= 3) {
        alert("You can compare up to 3 candidates at a time. Please clear old selections first.");
        return;
      }
      queue.push(cand.id);
      localStorage.setItem("compare_queue", JSON.stringify(queue));
      alert("Candidate added to comparison queue!");
    } else {
      alert("Candidate already in comparison queue.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!cand) {
    return (
      <div className="text-center py-20 bg-white border border-border rounded-xl">
        <h3 className="font-bold text-foreground">Candidate Profile Not Found</h3>
        <p className="text-xs text-muted-foreground mt-1">Please verify the candidate ID or try searching again.</p>
        <button onClick={() => router.back()} className="mt-4 inline-flex items-center space-x-2 text-xs font-semibold text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  // Parse JSON lists safely
  const parseJsonList = (jsonStr?: string): string[] => {
    if (!jsonStr) return [];
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // If it's a simple text list or comma separated string
      return jsonStr.split("\n").filter(Boolean);
    }
  };

  const strengthsList = parseJsonList(cand.strengths);
  const weaknessesList = parseJsonList(cand.weaknesses);
  const missingSkillsList = parseJsonList(cand.missing_skills);
  const questionsList = parseJsonList(cand.interview_questions);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Breadcrumb */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rankings</span>
        </button>

        {/* Action Triggers */}
        <div className="flex space-x-3">
          <button
            onClick={handleAddToCompare}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold border border-border bg-white hover:bg-secondary px-3.5 py-2 rounded-lg transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Compare Candidate</span>
          </button>
          
          <button
            onClick={handleReject}
            disabled={rejected}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all border ${
              rejected 
                ? "bg-red-50 text-red-700 border-red-200" 
                : "border-border bg-white hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <X className="w-4 h-4" />
            <span>{rejected ? "Rejected" : "Reject"}</span>
          </button>

          <button
            onClick={handleShortlist}
            disabled={shortlisted}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all border ${
              shortlisted 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "text-white bg-primary border-primary hover:bg-primary-hover shadow-subtle"
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{shortlisted ? "Shortlisted" : "Shortlist Candidate"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left sidebar (identity) + Right Body (tabs) */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Identity Info */}
        <div className="space-y-6 md:col-span-1">
          {/* Identity Card */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-subtle flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 text-primary flex items-center justify-center text-xl font-bold rounded-full">
              {cand.first_name[0]}{cand.last_name[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold">{cand.first_name} {cand.last_name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{cand.current_title || "Engineer"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold uppercase tracking-wider">{cand.current_company || "Tech Corp"}</p>
            </div>
            <div className="w-full border-t border-border pt-4 text-xs text-left space-y-2.5">
              <div className="flex items-center space-x-2.5 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{cand.email}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{cand.phone || "+1 (555) 019-2831"}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{cand.location || "Remote / Flexible"}</span>
              </div>
            </div>
            <div className="w-full flex justify-center space-x-3 pt-2">
              <a href={cand.linkedin_url || "#"} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={cand.github_url || "#"} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href={cand.portfolio_url || "#"} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Strengths Card */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-subtle space-y-4">
            <h4 className="text-xs font-bold border-b border-border pb-2 inline-flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>AI Highlighted Strengths</span>
            </h4>
            <div className="space-y-3 text-xs text-muted-foreground">
              {strengthsList.map((str, idx) => (
                <div key={idx} className="flex space-x-2.5">
                  <span className="font-semibold text-green-600 mt-0.5 shrink-0">+</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses Card */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-subtle space-y-4">
            <h4 className="text-xs font-bold border-b border-border pb-2 inline-flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Skill Gaps & Risks</span>
            </h4>
            <div className="space-y-3 text-xs text-muted-foreground">
              {weaknessesList.map((wk, idx) => (
                <div key={idx} className="flex space-x-2.5">
                  <span className="font-semibold text-red-500 mt-0.5 shrink-0">-</span>
                  <span>{wk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tab View */}
        <div className="md:col-span-2 space-y-6 flex flex-col">
          {/* Tab Selector Header */}
          <div className="flex border-b border-border text-xs bg-white rounded-xl p-1.5 border shadow-subtle shrink-0">
            {[
              { id: "ai-fit", label: "AI Fit Summary", icon: Sparkles },
              { id: "experience", label: "Experience Timeline", icon: TrendingUp },
              { id: "projects", label: "Projects & Git", icon: Award },
              { id: "resume", label: "Original Text", icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 bg-white border border-border rounded-xl p-6 shadow-subtle min-h-[500px]">
            {/* TAB: AI FIT SUMMARY */}
            {activeTab === "ai-fit" && (
              <div className="space-y-6 animate-fade-in text-xs">
                {/* Metric Summary Headers */}
                <div className="grid grid-cols-3 gap-6 pb-6 border-b border-border">
                  <div className="bg-secondary/20 p-4 rounded-xl border border-border text-center">
                    <span className="text-2xl font-extrabold text-primary">{cand.confidence_score || 88.0}%</span>
                    <h5 className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Confidence Score</h5>
                  </div>
                  <div className="bg-secondary/20 p-4 rounded-xl border border-border text-center">
                    <span className="text-2xl font-extrabold text-accent">{cand.career_growth_score || 75.0}%</span>
                    <h5 className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Career Growth Index</h5>
                  </div>
                  <div className="bg-secondary/20 p-4 rounded-xl border border-border text-center">
                    <span className="text-2xl font-extrabold text-foreground">{cand.experience_years} Yrs</span>
                    <h5 className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Total Experience</h5>
                  </div>
                </div>

                {/* Match Summary Explanation */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-foreground inline-flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>AI Matching Explanation</span>
                  </h4>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {cand.ranking_reason || "Evaluated by semantic models. Candidate exhibits high profile correlation."}
                  </p>
                </div>

                {/* Skill Gaps Breakdown */}
                {missingSkillsList.length > 0 && (
                  <div className="space-y-3 p-4 bg-primary/[0.02] border border-primary/10 rounded-xl">
                    <h4 className="font-bold text-primary">Identified Skill Deficiencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {missingSkillsList.map((skill, idx) => (
                        <span key={idx} className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold text-[9px] border border-red-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career Growth Analysis */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-foreground">Career Growth Assessment</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {cand.growth_analysis || "The candidate shows steady tenure ranges averaging 2.4 years per title. Regular upgrades to senior designations indicate consistency."}
                  </p>
                </div>

                {/* Custom AI Interview Questions */}
                {questionsList.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-sm font-bold text-foreground inline-flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      <span>AI Suggested Interview Questions</span>
                    </h4>
                    <div className="space-y-3">
                      {questionsList.map((q, idx) => (
                        <div key={idx} className="p-3 bg-secondary/30 rounded-lg border border-border/80">
                          <span className="font-semibold text-primary">Q{idx + 1}: </span>
                          <span className="text-muted-foreground">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: WORK TIMELINE */}
            {activeTab === "experience" && (
              <div className="relative pl-8 space-y-8 animate-fade-in text-xs">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-1.5 bottom-1.5 w-0.5 bg-border" />
                
                {cand.experiences?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-10">No detailed experience list found.</p>
                ) : (
                  cand.experiences.map((exp, idx) => (
                    <div key={exp.id} className="relative space-y-1.5">
                      {/* Timeline Dot */}
                      <span className={`absolute left-[-21px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        idx === 0 ? "bg-primary" : "bg-muted-foreground"
                      }`} />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-foreground text-sm">{exp.title}</h4>
                          <span className="text-primary font-bold text-[10px] uppercase tracking-wider">{exp.company}</span>
                        </div>
                        <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded font-semibold text-[9px]">
                          {exp.start_date} – {exp.end_date}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed mt-2 pt-1 border-t border-border/40">
                        {exp.description || "Project execution and collaboration."}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-6 animate-fade-in text-xs">
                <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">Key Projects & Git Contributions</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {cand.projects?.length === 0 ? (
                    <p className="text-muted-foreground col-span-2 text-center py-10">No projects listed.</p>
                  ) : (
                    cand.projects.map((proj) => (
                      <div key={proj.id} className="p-4 border border-border rounded-xl bg-secondary/15 flex flex-col justify-between space-y-3">
                        <div>
                          <h5 className="font-bold text-foreground text-sm">{proj.title}</h5>
                          <p className="text-muted-foreground mt-1.5 leading-relaxed">{proj.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                          {proj.technologies?.split(",").map((tech) => (
                            <span key={tech} className="bg-white border border-border px-1.5 py-0.5 rounded text-[8px] font-semibold text-muted-foreground">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: ORIGINAL RESUME TEXT */}
            {activeTab === "resume" && (
              <div className="animate-fade-in text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
                  <span className="font-bold text-muted-foreground">Parsed Document Viewer</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">Format: raw-ascii</span>
                </div>
                <pre className="bg-secondary/35 border border-border/80 rounded-xl p-5 text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-[500px]">
                  {cand.resume_text || "Document text body empty."}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
