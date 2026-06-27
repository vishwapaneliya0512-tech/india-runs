"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Job, Candidate } from "@/lib/types";
import { 
  ArrowLeftRight, ArrowLeft, Trash2, Loader2, Sparkles, CheckCircle2,
  ListPlus, Info, Plus
} from "lucide-react";

export default function CandidateComparison() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | "">("");
  const [candidateIds, setCandidateIds] = useState<number[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [comparison, setComparison] = useState<any | null>(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    // Load active jobs
    api.get("/jobs")
      .then((res) => {
        setJobs(res.data);
        if (res.data.length > 0) setSelectedJobId(res.data[0].id);
      })
      .catch((err) => console.error("Error loading jobs", err));

    // Load comparison queue from localStorage
    loadQueue();
  }, []);

  const loadQueue = () => {
    const queueJson = localStorage.getItem("compare_queue") || "[]";
    const queue = JSON.parse(queueJson);
    setCandidateIds(queue);
    
    if (queue.length > 0) {
      setLoadingCandidates(true);
      // Fetch details of queue candidates
      Promise.all(queue.map((id: number) => api.get(`/candidates/${id}`)))
        .then((responses) => {
          setCandidates(responses.map(r => r.data));
        })
        .catch((err) => console.error("Error fetching queue profiles", err))
        .finally(() => setLoadingCandidates(false));
    } else {
      setCandidates([]);
      setComparison(null);
    }
  };

  const handleRemoveFromQueue = (id: number) => {
    const newQueue = candidateIds.filter(cid => cid !== id);
    localStorage.setItem("compare_queue", JSON.stringify(newQueue));
    loadQueue();
  };

  const handleClearQueue = () => {
    localStorage.removeItem("compare_queue");
    loadQueue();
  };

  const handleCompare = async () => {
    if (candidateIds.length < 2) {
      alert("Please select at least 2 candidates for comparison.");
      return;
    }
    if (!selectedJobId) {
      alert("Please select a target Job description.");
      return;
    }
    
    setLoadingCompare(true);
    try {
      const res = await api.post("/comparison", {
        candidate_ids: candidateIds,
        job_id: selectedJobId
      });
      setComparison(res.data);
    } catch (error) {
      alert("Failed to compile candidate comparison matrix.");
    } finally {
      setLoadingCompare(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Side-by-Side Comparison</h1>
          <p className="text-sm text-muted-foreground">Compare selected candidates side-by-side against a job profile</p>
        </div>
        {candidateIds.length > 0 && (
          <button
            onClick={handleClearQueue}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Selections</span>
          </button>
        )}
      </div>

      {candidateIds.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border rounded-xl">
          <ArrowLeftRight className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse-slow" />
          <h3 className="font-bold text-foreground">No Candidates Selected</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            To compare candidates, visit their profiles and click the "Compare Candidate" button.
          </p>
          <Link href="/recruiter/ranking" className="mt-4 inline-flex items-center space-x-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-lg transition-colors shadow-subtle">
            <span>Go to Rankings</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Comparison Setup panel */}
          <div className="bg-white border border-border p-5 rounded-xl shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="font-semibold text-muted-foreground">Comparing ({candidates.length}):</span>
              {loadingCandidates ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                candidates.map((c) => (
                  <span key={c.id} className="bg-secondary text-foreground font-bold px-3 py-1.5 rounded-lg border border-border flex items-center space-x-2">
                    <span>{c.first_name} {c.last_name}</span>
                    <button 
                      onClick={() => handleRemoveFromQueue(c.id)} 
                      className="text-red-500 hover:text-red-700 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                className="bg-white border border-border text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
              >
                <option value="">Select Job Target...</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleCompare}
                disabled={candidateIds.length < 2 || !selectedJobId || loadingCompare}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-lg shadow-subtle transition-all disabled:opacity-50"
              >
                {loadingCompare ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Run Comparison</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          {comparison ? (
            <div className="space-y-6">
              {/* Matrix Layout */}
              <div className="bg-white border border-border rounded-xl overflow-hidden shadow-subtle text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border font-semibold text-muted-foreground">
                      <th className="p-4 w-44">Parameters</th>
                      {Object.keys(comparison.comparison).map((name) => (
                        <th key={name} className="p-4 font-bold text-foreground text-sm">
                          {name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {/* Rows dynamically computed from comparison categories */}
                    {Object.keys(Object.values(comparison.comparison)[0] as any).map((category) => (
                      <tr key={category} className="hover:bg-secondary/5 transition-colors">
                        <td className="p-4 font-bold text-muted-foreground bg-secondary/10">
                          {category}
                        </td>
                        {Object.keys(comparison.comparison).map((name) => (
                          <td key={name} className="p-4 text-muted-foreground leading-relaxed font-medium">
                            {comparison.comparison[name][category]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recommendation Card */}
              <div className="bg-primary/[0.02] border border-primary/15 rounded-xl p-6 shadow-subtle space-y-3 animate-fade-in text-xs">
                <h4 className="text-sm font-bold text-primary inline-flex items-center space-x-1.5">
                  <Sparkles className="w-4.5 h-4.5" />
                  <span>AI Recruiter Final Recommendation</span>
                </h4>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {comparison.final_recommendation}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-border rounded-xl">
              <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Configure your target job requirements and click "Run Comparison" to generate side-by-side evaluations.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
