"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Cpu, Search, BarChart3, MessageSquare, ArrowRight, CheckCircle2, 
  Sparkles, ShieldCheck, Zap, Layers, Users, Star, Send
} from "lucide-react";

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: "", email: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              TalentMind AI
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-semibold hover:text-primary transition-colors px-4 py-2">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-semibold text-white bg-primary hover:bg-primary-hover px-5 py-2.5 rounded-lg transition-all shadow-subtle hover:shadow-premium">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 bg-gradient-to-b from-background via-sky-50/10 to-background">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full w-max">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Candidate Matching</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Intelligent Candidate Discovery, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Ranked by AI.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Don't just filter resumes by keyword. TalentMind AI contextually understands skills, experience timelines, and career growth metrics to score and rank matches with explainable AI breakdowns.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Link href="/signup" className="inline-flex items-center justify-center space-x-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover px-6 py-3.5 rounded-lg transition-all shadow-premium">
                <span>Start Discovery Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="inline-flex items-center justify-center space-x-2 text-sm font-semibold border border-border bg-white hover:bg-muted/30 px-6 py-3.5 rounded-lg transition-all">
                <span>Explore Features</span>
              </a>
            </div>
          </motion.div>

          {/* Floating UI Demo Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="w-full max-w-lg glass rounded-2xl p-6 shadow-premium relative border border-border">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs font-semibold text-muted-foreground pl-2">AI Recruiter Scorecard</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">Active Match</span>
              </div>
              
              {/* Scorecard Body */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-border/80">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 flex items-center justify-center bg-primary text-white text-xs font-bold rounded-full">#1</span>
                    <div>
                      <h4 className="text-sm font-bold">John Doe</h4>
                      <p className="text-[11px] text-muted-foreground">Senior Full Stack Engineer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-primary">94.8%</span>
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold">Match Score</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Semantic Relevancy</span>
                    <span className="font-semibold text-foreground">92%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Experience Tenure</span>
                    <span className="font-semibold text-foreground">95%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: "95%" }} />
                  </div>
                </div>

                <div className="bg-primary/[0.03] border border-primary/10 rounded-lg p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary block mb-1">AI Match Summary</span>
                  Candidate possesses 8+ years of engineering experience with explicit React, TypeScript, and FastAPI skills. Upward mobility in previous Google and Meta roles indicates high leadership potential.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white border-y border-border/40">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Engineered for Enterprise Talent Operations
            </h2>
            <p className="mt-4 text-muted-foreground">
              Powerful semantic logic combined with weighted candidate metrics results in hires backed by explainable AI.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col space-y-4 p-6 bg-background border border-border rounded-xl">
              <div className="p-3 bg-primary/10 rounded-lg text-primary w-max">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Deep JD Parsing</h3>
              <p className="text-sm text-muted-foreground">
                Paste or upload your Job Description PDF. Our LLM automatically extracts soft skills, seniority, and responsibilities.
              </p>
            </div>
            
            <div className="flex flex-col space-y-4 p-6 bg-background border border-border rounded-xl">
              <div className="p-3 bg-accent/10 rounded-lg text-accent w-max">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Semantic Search</h3>
              <p className="text-sm text-muted-foreground">
                Matches candidate profiles beyond exact keywords using Sentence Transformers (all-MiniLM-L6-v2) for deep context.
              </p>
            </div>

            <div className="flex flex-col space-y-4 p-6 bg-background border border-border rounded-xl">
              <div className="p-3 bg-green-500/10 rounded-lg text-green-600 w-max">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Multi-Weighted Ranking</h3>
              <p className="text-sm text-muted-foreground">
                Evaluates profiles across 8 structured weights: skills, experience, projects, certifications, and Git activities.
              </p>
            </div>

            <div className="flex flex-col space-y-4 p-6 bg-background border border-border rounded-xl">
              <div className="p-3 bg-orange-500/10 rounded-lg text-orange-600 w-max">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">AI Recruiter Chat</h3>
              <p className="text-sm text-muted-foreground">
                Interact with your candidate pool. Search, filter, compare, and draft custom interview questions in plain English.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Seamless Integration Pipeline
            </h2>
            <p className="mt-4 text-muted-foreground">
              From upload to selection, discover candidates in four simple, automated steps.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 flex items-center justify-center bg-primary text-white font-bold rounded-full shadow-premium">
                1
              </div>
              <h4 className="text-base font-bold">Upload Resume PDFs</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Drag-and-drop multiple candidate resumes to start the parallel parsing process.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 flex items-center justify-center bg-primary/80 text-white font-bold rounded-full shadow-premium">
                2
              </div>
              <h4 className="text-base font-bold">Vector Embedding</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                ChromaDB stores high-dimensional dense vectors representational of the applicant's experience history.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 flex items-center justify-center bg-primary/60 text-white font-bold rounded-full shadow-premium">
                3
              </div>
              <h4 className="text-base font-bold">Weighted Scoring</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                The ranking engine combines semantic similarity with custom metrics (projects, education) for a final score.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 flex items-center justify-center bg-primary/40 text-white font-bold rounded-full shadow-premium">
                4
              </div>
              <h4 className="text-base font-bold">AI Decisions</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Recruiters review side-by-side comparisons, read strengths/weaknesses, and generate custom interview questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Metric Section */}
      <section id="about" className="py-24 bg-white border-t border-border/40">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl mb-6">
              Explainable Recruiting Decisions
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We believe AI should collaborate with recruiters, not replace them. TalentMind AI never hides behind opaque decisions. Every matched profile includes structured explanations detailing confidence scores, skill alignment, strengths, weaknesses, and custom technical questions.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-foreground font-semibold">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Dual vector embedding alignment (Resumes + JDs)</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-foreground font-semibold">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Adjustable weighting scales (Custom fit targets)</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-foreground font-semibold">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Contextual conversation search over profile databases</span>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary/40 rounded-2xl p-8 border border-border/80 flex flex-col justify-center space-y-6">
            <h4 className="text-sm uppercase tracking-wider font-bold text-muted-foreground">Platform Performance Stats</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col space-y-1">
                <span className="text-4xl font-extrabold text-primary">10x</span>
                <span className="text-xs text-muted-foreground font-medium">Faster Candidate Screening</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-4xl font-extrabold text-primary">94%</span>
                <span className="text-xs text-muted-foreground font-medium">Sourcing Relevance Match</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-4xl font-extrabold text-primary">3.2s</span>
                <span className="text-xs text-muted-foreground font-medium">Avg parsing speed per resume</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-4xl font-extrabold text-primary">0%</span>
                <span className="text-xs text-muted-foreground font-medium">Keyword manipulation bias</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-background border-t border-border/40">
        <div className="container mx-auto px-6 max-w-xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold md:text-3xl">Get In Touch</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Have questions about deploying TalentMind AI in your organization? Let's connect.
            </p>
          </div>
          
          {submitted ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 text-sm font-semibold rounded-lg text-center">
              Thank you! Your message has been sent. We'll be in touch shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Name</label>
                <input 
                  type="text" 
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  placeholder="Samantha Mercer"
                  className="w-full bg-white border border-border text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email</label>
                <input 
                  type="email" 
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  placeholder="samantha@talentmind.ai"
                  className="w-full bg-white border border-border text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Message</label>
                <textarea 
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full bg-white border border-border text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <button 
                type="submit" 
                className="w-full inline-flex items-center justify-center space-x-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover p-3 rounded-lg transition-all shadow-subtle"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 bg-white py-12 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">TalentMind AI</span>
          </div>
          <span>&copy; {new Date().getFullYear()} TalentMind Inc. All rights reserved.</span>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
