"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Job } from "@/lib/types";
import { 
  Briefcase, Plus, Copy, Trash2, Loader2, Info, Check, Eye, MapPin, Layers, Building, Calendar, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Remote");
  const [type, setType] = useState("Full-time");
  const [experienceLevel, setExperienceLevel] = useState("Mid");
  const [customSkills, setCustomSkills] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // AI Preview State
  const [aiPreview, setAiPreview] = useState<any | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (error) {
      console.error("Error loading jobs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDuplicate = async (jobId: number) => {
    try {
      const res = await api.post(`/jobs/${jobId}/duplicate`);
      setJobs([...jobs, res.data]);
    } catch (error) {
      alert("Failed to duplicate job");
    }
  };

  const handleDelete = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job description? All matching candidate ranks will be lost.")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (error) {
      alert("Failed to delete job");
    }
  };

  const handlePreviewAI = () => {
    if (!title || !description) {
      alert("Please fill in Title and Description first.");
      return;
    }
    setLoadingPreview(true);
    setTimeout(() => {
      const skills = [];
      for (const word of ["python", "javascript", "react", "next.js", "node.js", "aws", "docker", "kubernetes", "typescript", "postgresql", "sql", "rust", "golang"]) {
        if (description.toLowerCase().includes(word)) {
          skills.push(word.toUpperCase());
        }
      }
      setAiPreview({
        skills: skills.length > 0 ? skills : ["SOFTWARE ENGINEERING", "SYSTEM DESIGN"],
        experience_level: description.toLowerCase().includes("senior") ? "SENIOR" : "MID",
        responsibilities: [
          "Develop scale features using the selected technologies",
          "Ensure code test coverage and system design patterns"
        ]
      });
      setLoadingPreview(false);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const skillArr = customSkills.split(",").map(s => s.trim()).filter(Boolean);
      const res = await api.post("/jobs", {
        title,
        description,
        department,
        location,
        type,
        experience_level: experienceLevel,
        skills: skillArr
      });
      setJobs([res.data, ...jobs]);
      setOpenModal(false);
      // Reset form
      setTitle("");
      setDescription("");
      setCustomSkills("");
      setAiPreview(null);
    } catch (error) {
      alert("Failed to create job listing.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">Job Profiles & Requirements</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage job descriptions and target skills for vector semantic matching</p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-xl shadow-premium transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-[#0a0a0f] border border-white/5 rounded-2xl p-6">
          <Briefcase className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="font-bold text-white text-sm">No Jobs Posted</h3>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Get started by posting a job requirements file or pasting a job description.
          </p>
        </div>
      ) : (
        <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 font-bold text-zinc-400 uppercase tracking-wider text-[9px]">
                  <th className="p-4">Title</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Experience Level</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white">
                      <div className="flex flex-col">
                        <span>{job.title}</span>
                        <span className="text-[10px] font-normal text-zinc-500 mt-0.5">ID: #{job.id}</span>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300 font-semibold">{job.department || "Engineering"}</td>
                    <td className="p-4 text-zinc-300 font-semibold">{job.location || "Remote"}</td>
                    <td className="p-4">
                      <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-bold text-[9px]">
                        {job.type}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300 font-bold">{job.experience_level || "Mid"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border ${
                        job.status === "Active" 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleDuplicate(job.id)}
                        title="Duplicate"
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-400 hover:text-white transition-all inline-flex"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        title="Delete"
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-all inline-flex"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      <AnimatePresence>
        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenModal(false)}
              className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-premium z-10"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Post New Job Description</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Semantic requirements will be extracted by our LLM parser</p>
                </div>
                <button 
                  onClick={() => setOpenModal(false)}
                  className="text-xs text-zinc-400 hover:text-white font-semibold transition-colors"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-6">
                
                {/* Left Column - Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Senior Backend Engineer (Python)"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-xs p-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Engineering"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-xs p-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="San Francisco, CA"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-xs p-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Job Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white text-xs p-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      >
                        <option className="bg-[#09090f]">Full-time</option>
                        <option className="bg-[#09090f]">Part-time</option>
                        <option className="bg-[#09090f]">Contract</option>
                        <option className="bg-[#09090f]">Internship</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white text-xs p-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      >
                        <option className="bg-[#09090f]">Junior</option>
                        <option className="bg-[#09090f]">Mid</option>
                        <option className="bg-[#09090f]">Senior</option>
                        <option className="bg-[#09090f]">Lead</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">
                      Custom Target Skills (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={customSkills}
                      onChange={(e) => setCustomSkills(e.target.value)}
                      placeholder="Python, FastAPI, Docker, PostgreSQL"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-xs p-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Full Description *</label>
                    <textarea
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the roles, technologies, and required qualifications..."
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-xs p-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Right Column - AI Requirements Preview */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="text-xs font-bold text-white uppercase tracking-wider inline-flex items-center space-x-1.5">
                        <Plus className="w-3.5 h-3.5 text-primary animate-pulse" />
                        <span>AI Extraction Preview</span>
                      </span>
                      <button
                        type="button"
                        onClick={handlePreviewAI}
                        disabled={loadingPreview}
                        className="text-[10px] font-bold text-primary hover:underline inline-flex items-center space-x-1"
                      >
                        {loadingPreview ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Extracting...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Run Analytics Preview</span>
                          </>
                        )}
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {aiPreview ? (
                        <motion.div 
                          key="ai-result"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-4 space-y-4 text-xs"
                        >
                          <div>
                            <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Extracted Skills</span>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {aiPreview.skills.map((s: string) => (
                                <span key={s} className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-bold text-[9px]">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Experience Level Group</span>
                            <p className="mt-1 font-extrabold text-white text-sm">{aiPreview.experience_level}</p>
                          </div>

                          <div>
                            <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Simulated Responsibilities</span>
                            <ul className="list-disc pl-4 mt-2 space-y-1 text-zinc-400">
                              {aiPreview.responsibilities.map((r: string, idx: number) => (
                                <li key={idx} className="leading-relaxed">{r}</li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="ai-empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center text-center py-20 text-zinc-500"
                        >
                          <Info className="w-8 h-8 mb-3 text-zinc-600" />
                          <p className="text-[11px] max-w-xs leading-relaxed">
                            Provide title and description, then run "Preview Extraction" to see extracted keywords and metadata prior to publishing.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-end space-x-3 bg-transparent">
                    <button
                      type="button"
                      onClick={() => setOpenModal(false)}
                      className="bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl transition-all font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-xl shadow-premium transition-all inline-flex items-center space-x-2"
                    >
                      {formSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Publish Requirements</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
