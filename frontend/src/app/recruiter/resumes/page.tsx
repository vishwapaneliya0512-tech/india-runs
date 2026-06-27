"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight,
  ShieldCheck, BrainCircuit, Check, X, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadFileState {
  file: File;
  name: string;
  status: "idle" | "uploading" | "parsing" | "embedding" | "completed" | "error";
  progress: number;
  currentStepIndex: number;
  errorMsg?: string;
}

export default function ResumeUpload() {
  const [files, setFiles] = useState<UploadFileState[]>([]);
  const [history, setHistory] = useState<any[]>([
    { name: "John_Doe_CV.pdf", size: "142 KB", status: "completed", date: "2 hours ago" },
    { name: "Sarah_Smith_Resume.pdf", size: "95 KB", status: "completed", date: "3 hours ago" },
    { name: "Vikram_Patel_CV.pdf", size: "210 KB", status: "completed", date: "1 day ago" }
  ]);
  const [isDragOver, setIsDragOver] = useState(false);

  const PIPELINE_STEPS = [
    "Uploading PDF Resume",
    "Parsing Structural Text",
    "Extracting Skills & Roles",
    "Generating Vector Embeddings",
    "Semantic Database Matching",
    "Computing Weighted Ranks",
    "Generating AI Recommendations"
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(
      (f) => f.name.endsWith(".pdf") || f.name.endsWith(".txt")
    );
    
    if (validFiles.length < selectedFiles.length) {
      alert("Only PDF or TXT files are supported for parsing.");
    }
    
    const newStates: UploadFileState[] = validFiles.map((file) => ({
      file,
      name: file.name,
      status: "idle",
      progress: 0,
      currentStepIndex: 0
    }));
    
    setFiles([...files, ...newStates]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, idx) => idx !== index));
  };

  const startProcessing = async () => {
    for (let idx = 0; idx < files.length; idx++) {
      if (files[idx].status === "completed") continue;
      
      const fileState = files[idx];
      setFiles(prev => {
        const copy = [...prev];
        copy[idx].status = "uploading";
        copy[idx].progress = 10;
        return copy;
      });
      
      try {
        const formData = new FormData();
        formData.append("file", fileState.file);
        
        const pipelineInterval = setInterval(() => {
          setFiles(prev => {
            const copy = [...prev];
            const currentItem = copy[idx];
            if (currentItem.currentStepIndex < PIPELINE_STEPS.length - 2) {
              currentItem.currentStepIndex += 1;
              currentItem.progress = Math.round((currentItem.currentStepIndex / PIPELINE_STEPS.length) * 100);
              if (currentItem.currentStepIndex === 1) currentItem.status = "parsing";
              if (currentItem.currentStepIndex === 3) currentItem.status = "embedding";
            }
            return copy;
          });
        }, 1200);
        
        const response = await api.post("/candidates/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        
        clearInterval(pipelineInterval);
        
        setFiles(prev => {
          const copy = [...prev];
          copy[idx].status = "completed";
          copy[idx].progress = 100;
          copy[idx].currentStepIndex = PIPELINE_STEPS.length - 1;
          return copy;
        });
        
        setHistory(prev => [
          { 
            name: fileState.name, 
            size: `${(fileState.file.size / 1024).toFixed(0)} KB`, 
            status: "completed", 
            date: "Just now" 
          },
          ...prev
        ]);
        
      } catch (err: any) {
        setFiles(prev => {
          const copy = [...prev];
          copy[idx].status = "error";
          copy[idx].errorMsg = err.response?.data?.detail || "Processing failed";
          return copy;
        });
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
      case "idle":
        return <FileText className="w-4 h-4 text-zinc-500 shrink-0" />;
      default:
        return <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-white">Bulk Resume Processor</h1>
        <p className="text-xs text-zinc-400 mt-1">Upload applicant PDFs and construct structural embeddings inside ChromaDB</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Uploader Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Drag & Drop Boundary */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 bg-[#0a0a0f] relative overflow-hidden group ${
              isDragOver 
                ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                : "border-white/10 hover:border-primary/40 hover:bg-white/[0.01]"
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            <input
              type="file"
              multiple
              id="file-upload"
              onChange={handleFileSelect}
              accept=".pdf,.txt"
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-4 flex flex-col items-center">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary transition-transform duration-300 group-hover:scale-105">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-white block">
                  Drag and drop resumes here, or <span className="text-primary hover:underline font-extrabold">browse files</span>
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  Supports PDF and TXT formats (up to 10MB per file)
                </span>
              </div>
            </label>
          </div>

          {/* Files List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 space-y-4 shadow-subtle text-xs"
              >
                <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Queue ({files.length} Files)</h3>
                  <button
                    onClick={startProcessing}
                    disabled={files.every(f => f.status === "completed" || f.status === "uploading")}
                    className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-xl shadow-premium transition-all disabled:opacity-50"
                  >
                    <span>Begin NLP Pipeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {files.map((f, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 mr-4">
                        {getStatusIcon(f.status)}
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-zinc-200 truncate block text-[11px]">{f.name}</span>
                          {f.status !== "idle" && f.status !== "completed" && f.status !== "error" && (
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2 border border-white/[0.02]">
                              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
                            </div>
                          )}
                          {f.errorMsg && (
                            <span className="text-[9px] text-red-400 font-semibold block mt-1">{f.errorMsg}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                          f.status === "completed" 
                            ? "bg-green-500/10 text-green-400 border-green-500/20" 
                            : f.status === "error" 
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : f.status === "idle"
                            ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}>
                          {f.status}
                        </span>
                        {f.status === "idle" && (
                          <button
                            onClick={() => removeFile(idx)}
                            className="p-1.5 bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg border border-white/5 transition-all inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 space-y-4 shadow-subtle text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">Recent Upload History</h3>
            <div className="space-y-3.5">
              {history.map((hist, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    <div>
                      <span className="font-bold text-zinc-200">{hist.name}</span>
                      <span className="text-[10px] text-zinc-500 ml-2">({hist.size})</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-semibold">{hist.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Pipeline Status Indicator */}
        <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 shadow-subtle h-max space-y-6 text-xs">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2.5 inline-flex items-center space-x-2">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <span>AI Pipeline Graph</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">Resumes are run through a multi-dimensional sentence transformer pipeline.</p>
          </div>

          <div className="space-y-5 relative pl-4">
            {/* Visual connecting line */}
            <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-white/5" />
            
            {PIPELINE_STEPS.map((step, idx) => {
              const processingFile = files.find(f => f.status !== "idle" && f.status !== "completed" && f.status !== "error");
              const activeIndex = processingFile ? processingFile.currentStepIndex : -1;
              const isPassed = activeIndex > idx;
              const isActive = activeIndex === idx;
              
              return (
                <div key={idx} className="flex items-start space-x-4 relative z-10">
                  <div className="mt-0.5 shrink-0">
                    {isPassed ? (
                      <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/35 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary flex items-center justify-center relative">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                        <span className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-slow" />
                      </div>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[8px] font-bold text-zinc-500 bg-zinc-950">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className={`font-bold block ${isActive ? "text-primary" : isPassed ? "text-zinc-200" : "text-zinc-500"}`}>
                      {step}
                    </span>
                    {isActive && (
                      <span className="text-[9px] text-primary/80 animate-pulse-slow block mt-0.5 font-medium">
                        Executing parsing node...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
