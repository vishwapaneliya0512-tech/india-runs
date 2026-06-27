"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { ChatMessage, Job } from "@/lib/types";
import { 
  MessageSquare, Send, Cpu, Loader2, Sparkles, RefreshCw, User
} from "lucide-react";

export default function AIRecruiterChat() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | "">("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: "assistant", 
      content: "Hello! I am your **TalentMind AI Recruiting Copilot**. How can I help you explore your candidates today? Try selecting a Job target to context-match queries." 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Why is the top candidate ranked first?",
    "Find Python developers with AWS.",
    "Who has leadership experience?",
    "Generate interview questions for the top profile"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load active jobs
    api.get("/jobs")
      .then((res) => {
        setJobs(res.data);
        if (res.data.length > 0) setSelectedJobId(res.data[0].id);
      })
      .catch((err) => console.error("Error loading jobs", err));
  }, []);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    // Add user message
    const userMessage: ChatMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    try {
      const response = await api.post("/chat", {
        message: textToSend,
        job_id: selectedJobId ? Number(selectedJobId) : null,
        history: messages.slice(1) // skip the intro message
      });
      
      const replyMessage: ChatMessage = {
        role: "assistant",
        content: response.data.reply
      };
      setMessages((prev) => [...prev, replyMessage]);
      if (response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "I encountered a connection error while matching your query. Please make sure the backend is active." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col space-y-4 animate-fade-in text-xs">
      {/* Top Selector Controls */}
      <div className="flex justify-between items-center bg-white border border-border p-4 rounded-xl shadow-subtle shrink-0">
        <div>
          <h1 className="text-base font-extrabold tracking-tight">AI Recruiter Assistant</h1>
          <p className="text-[10px] text-muted-foreground">Conversational discovery over candidate profiles</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-muted-foreground">Chat Context (Job):</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : "")}
            className="bg-secondary/40 border border-border p-2 rounded focus:outline-none font-semibold text-xs"
          >
            <option value="">General Candidate Pool</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div className="flex-1 bg-white border border-border rounded-xl p-6 shadow-subtle overflow-y-auto flex flex-col space-y-4 min-h-0">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex space-x-3 max-w-[80%] ${
              m.role === "user" ? "self-end flex-row-reverse space-x-reverse" : "self-start"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              m.role === "user" ? "bg-secondary text-foreground" : "bg-primary text-white"
            }`}>
              {m.role === "user" ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
            </div>
            
            <div className={`p-4 rounded-xl leading-relaxed ${
              m.role === "user" 
                ? "bg-primary text-white font-medium" 
                : "bg-secondary/40 text-muted-foreground border border-border/80 font-medium"
            }`}>
              {/* Basic markdown simulation for bold and headings */}
              {m.content.split("\n").map((para, pIdx) => {
                let formatted = para;
                // Bold replacement
                const boldRegex = /\*\*(.*?)\*\*/g;
                let match;
                const segments = [];
                let lastIndex = 0;
                while ((match = boldRegex.exec(para)) !== null) {
                  segments.push(formatted.substring(lastIndex, match.index));
                  segments.push(<strong key={match.index} className="font-extrabold text-foreground">{match[1]}</strong>);
                  lastIndex = boldRegex.lastIndex;
                }
                segments.push(formatted.substring(lastIndex));
                
                return (
                  <p key={pIdx} className="mb-2 last:mb-0">
                    {segments.length > 1 ? segments : formatted}
                  </p>
                );
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex space-x-3 max-w-[80%] self-start animate-pulse">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-xl bg-secondary/40 border border-border/80 text-muted-foreground font-semibold flex items-center space-x-2">
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Bubbles */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 shrink-0">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSendMessage(s)}
              className="bg-white border border-border hover:border-primary/50 text-muted-foreground hover:text-primary px-3 py-1.5 rounded-full transition-all font-semibold"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="bg-white border border-border p-3 rounded-xl shadow-subtle flex items-center space-x-3 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage(input);
          }}
          placeholder="Ask AI recruiter about candidates, skills, profiles..."
          className="w-full bg-transparent border-0 focus:outline-none p-1.5"
        />
        <button
          onClick={() => handleSendMessage(input)}
          className="p-2.5 bg-primary hover:bg-primary-hover rounded-lg text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
