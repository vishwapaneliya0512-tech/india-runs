"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Job, Ranking } from "@/lib/types";
import { 
  Play, Download, Search, ChevronLeft, ChevronRight, 
  Loader2, Sparkles, Filter, Check, X, ArrowLeftRight, Eye, User, BrainCircuit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CandidateRanking() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | "">("");
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingRanks, setLoadingRanks] = useState(false);
  const [calculatingRanks, setCalculatingRanks] = useState(false);

  // Expanded card state
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [minScore, setMinScore] = useState<number>(0);
  const [experienceFilter, setExperienceFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Card view looks best with 6 items per page

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(res.data);
        if (res.data.length > 0) {
          setSelectedJobId(res.data[0].id);
        }
      } catch (error) {
        console.error("Error loading jobs", error);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadJobs();
  }, []);

  const loadRankings = async (jobId: number) => {
    setLoadingRanks(true);
    try {
      const res = await api.get(`/ranking/job/${jobId}`);
      setRankings(res.data);
    } catch (error) {
      console.error("Error loading rankings", error);
    } finally {
      setLoadingRanks(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      loadRankings(selectedJobId);
      setCurrentPage(1);
    }
  }, [selectedJobId]);

  const handleCalculateRanks = async () => {
    if (!selectedJobId) return;
    setCalculatingRanks(true);
    try {
      const res = await api.post("/ranking", { job_id: selectedJobId });
      setRankings(res.data);
      alert("AI multi-signal ranking successfully completed!");
    } catch (error) {
      alert("Failed to calculate candidate rankings.");
    } finally {
      setCalculatingRanks(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedJobId) return;
    const token = localStorage.getItem("token");
    window.open(`http://localhost:8000/api/ranking/job/${selectedJobId}/export/csv?token=${token}`, "_blank");
  };

  const handleShortlist = async (candId: number) => {
    try {
      await api.post(`/candidates/${candId}/shortlist?job_id=${selectedJobId}`);
      alert("Candidate successfully added to Shortlist!");
    } catch (error) {
      alert("Failed to shortlist candidate");
    }
  };

  const handleReject = async (candId: number) => {
    try {
      await api.post(`/candidates/${candId}/reject`);
      alert("Candidate status updated to Rejected.");
    } catch (error) {
      alert("Failed to reject candidate");
    }
  };

  const handleAddToCompare = (candId: number) => {
    const queueJson = localStorage.getItem("compare_queue") || "[]";
    const queue = JSON.parse(queueJson);
    if (!queue.includes(candId)) {
      if (queue.length >= 3) {
        alert("You can compare up to 3 candidates at a time. Please clear old selections first.");
        return;
      }
      queue.push(candId);
      localStorage.setItem("compare_queue", JSON.stringify(queue));
      alert("Candidate added to comparison queue!");
    } else {
      alert("Candidate already in comparison queue.");
    }
  };

  const parseJsonList = (jsonStr?: string): string[] => {
    if (!jsonStr) return [];
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return jsonStr.split("\n").filter(Boolean);
    }
  };

  // Filter rankings locally
  const filteredRankings = rankings.filter((r) => {
    const cand = r.candidate;
    const fullName = `${cand.first_name} ${cand.last_name}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      (cand.current_title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cand.summary || "").toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesScore = r.final_score >= minScore;
    
    let matchesExp = true;
    if (experienceFilter === "Junior (0-2 yrs)") {
      matchesExp = cand.experience_years <= 2.0;
    } else if (experienceFilter === "Mid (3-5 yrs)") {
      matchesExp = cand.experience_years > 2.0 && cand.experience_years <= 5.0;
    } else if (experienceFilter === "Senior (6+ yrs)") {
      matchesExp = cand.experience_years > 5.0;
    }
    
    return matchesSearch && matchesScore && matchesExp;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredRankings.length / itemsPerPage) || 1;
  const paginatedRankings = filteredRankings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">AI Candidate Rankings</h1>
          <p className="text-xs text-zinc-400 mt-1">Multi-signal vector analysis comparing applicant pool parameters</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          {loadingJobs ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
              className="bg-white/5 border border-white/10 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-bold"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id} className="bg-[#09090f]">
                  {j.title} (ID: {j.id})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleCalculateRanks}
            disabled={!selectedJobId || calculatingRanks}
            className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-xl shadow-premium transition-all disabled:opacity-50"
          >
            {calculatingRanks ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Ranking...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Calculate Ranks</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={rankings.length === 0}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-all disabled:opacity-50"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-[#0a0a0f] border border-white/5 p-4 rounded-2xl shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3 flex-1">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search candidates by name, skills, company..."
            className="w-full bg-transparent border-0 focus:outline-none p-1 text-white placeholder-zinc-600 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => {
                setMinScore(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 text-white p-1.5 rounded-lg focus:outline-none text-[11px]"
            >
              <option value={0} className="bg-[#09090f]">0%</option>
              <option value={50} className="bg-[#09090f]">50%</option>
              <option value={70} className="bg-[#09090f]">70%</option>
              <option value={80} className="bg-[#09090f]">80%</option>
              <option value={90} className="bg-[#09090f]">90%</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Experience:</span>
            <select
              value={experienceFilter}
              onChange={(e) => {
                setExperienceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 text-white p-1.5 rounded-lg focus:outline-none text-[11px]"
            >
              <option className="bg-[#09090f]">All</option>
              <option className="bg-[#09090f]">Junior (0-2 yrs)</option>
              <option className="bg-[#09090f]">Mid (3-5 yrs)</option>
              <option className="bg-[#09090f]">Senior (6+ yrs)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rankings List / Grid */}
      {loadingRanks ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 skeleton w-full rounded-2xl" />
          ))}
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-20 bg-[#0a0a0f] border border-white/5 rounded-2xl">
          <Sparkles className="w-12 h-12 text-zinc-500 mx-auto mb-4 animate-pulse" />
          <h3 className="font-bold text-white text-sm">Calculate Ranks</h3>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Run the multi-signal AI ranking engine to generate scoreboards for this job listing.
          </p>
        </div>
      ) : filteredRankings.length === 0 ? (
        <div className="text-center py-20 bg-[#0a0a0f] border border-white/5 rounded-2xl text-xs text-zinc-500">
          No candidates matching the current filters.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedRankings.map((rank) => {
              const cand = rank.candidate;
              const isExpanded = expandedId === rank.id;
              const skillBadges = parseJsonList(cand.strengths).slice(0, 3);
              if (skillBadges.length === 0) skillBadges.push("Engineering", "Software");

              return (
                <motion.div 
                  key={rank.id}
                  layout
                  className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-5 shadow-subtle hover:border-white/10 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3.5">
                      {/* Avatar Placeholder */}
                      <div className="w-11 h-11 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold rounded-full relative shrink-0">
                        <span>{cand.first_name[0]}{cand.last_name[0]}</span>
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 flex items-center justify-center bg-primary text-white text-[9px] font-extrabold rounded-full border border-zinc-950">
                          {rank.rank}
                        </span>
                      </div>

                      {/* Identity */}
                      <div className="min-w-0">
                        <Link href={`/recruiter/candidate/${cand.id}`} className="hover:text-primary text-sm font-bold text-white transition-colors block truncate">
                          {cand.first_name} {cand.last_name}
                        </Link>
                        <span className="text-[10px] text-zinc-500 block truncate mt-0.5 max-w-[200px]">
                          {cand.current_title || "Engineer"} at {cand.current_company || "Tech Inc"}
                        </span>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-primary">{rank.final_score}%</div>
                      <p className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold mt-0.5">Match Score</p>
                    </div>
                  </div>

                  {/* Badges / Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 my-4 py-3 border-y border-white/5 text-[11px] text-zinc-400">
                    <div>
                      <span className="text-zinc-600 block text-[9px] font-bold uppercase tracking-wider">Experience</span>
                      <strong className="text-zinc-200">{cand.experience_years} Years</strong>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[9px] font-bold uppercase tracking-wider">Education</span>
                      <strong className="text-zinc-200 truncate block" title={cand.education_summary}>
                        {cand.education_summary || "B.S. Computer Science"}
                      </strong>
                    </div>
                  </div>

                  {/* Expandable details panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pb-4 overflow-hidden text-[11px]"
                      >
                        {/* Recommendation summary */}
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1.5">
                          <span className="font-bold text-primary flex items-center space-x-1 uppercase tracking-wider text-[8px]">
                            <BrainCircuit className="w-3.5 h-3.5" />
                            <span>AI Evaluation Reason</span>
                          </span>
                          <p className="text-zinc-400 leading-relaxed">
                            {rank.ranking_reason || "Analyzed via semantic pipeline matching core criteria."}
                          </p>
                        </div>

                        {/* Strengths & Missing skills */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2.5 bg-green-500/5 border border-green-500/10 rounded-lg">
                            <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Strengths</span>
                            <ul className="mt-1 space-y-0.5 text-zinc-400">
                              {parseJsonList(cand.strengths).slice(0, 2).map((str, idx) => (
                                <li key={idx} className="truncate">• {str}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg">
                            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Gaps</span>
                            <ul className="mt-1 space-y-0.5 text-zinc-400">
                              {parseJsonList(cand.missing_skills).slice(0, 2).map((ms, idx) => (
                                <li key={idx} className="truncate">• {ms}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    {/* Expand Details Trigger */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : rank.id)}
                      className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider pl-1"
                    >
                      {isExpanded ? "Collapse Details" : "Expand Analysis"}
                    </button>

                    {/* Quick Actions Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddToCompare(cand.id)}
                        title="Add to Compare"
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-400 hover:text-white transition-all inline-flex"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReject(cand.id)}
                        title="Reject"
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-all inline-flex"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleShortlist(cand.id)}
                        title="Shortlist"
                        className="p-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-green-400 transition-all inline-flex"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/recruiter/candidate/${cand.id}`}
                        title="Review Dossier"
                        className="p-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-primary transition-all inline-flex"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center text-xs text-zinc-500 pt-4">
            <span>Showing {(currentPage-1)*itemsPerPage + 1} to {Math.min(currentPage*itemsPerPage, filteredRankings.length)} of {filteredRankings.length} candidates</span>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-white/5 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-all inline-flex"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-white">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-white/5 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-all inline-flex"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
