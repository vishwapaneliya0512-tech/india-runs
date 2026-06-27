"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Cpu, AlertCircle, Loader2, User, Mail, KeyRound, CheckCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, name);
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [success, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#030303] px-6 py-12 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md space-y-8 z-10"
      >
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center space-x-3 mb-6 group">
            <div className="p-2.5 bg-primary/15 border border-primary/25 rounded-xl text-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Cpu className="w-6 h-6 animate-pulse-slow" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              TalentMind AI
            </span>
          </Link>
        </div>

        {/* Dynamic Card Area */}
        <div className="glass-panel p-8 rounded-[22px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">
                    Create your account
                  </h2>
                  <p className="mt-1.5 text-xs text-zinc-400">
                    SaaS-ready AI recruiter onboarding dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-start space-x-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Samantha Mercer"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-sm pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="samantha@talentmind.ai"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-sm pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-sm pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center space-x-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.25)] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center text-xs text-zinc-400 mt-4">
                  <span>Already have an account? </span>
                  <Link href="/login" className="font-semibold text-primary hover:underline transition-colors">
                    Log in
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="signup-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center space-y-6 py-4"
              >
                {/* Success Checkmark Circle with ripple animation */}
                <div className="relative">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-20 h-20 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center relative z-10"
                  >
                    <CheckCircle className="w-10 h-10" />
                  </motion.div>
                  <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping opacity-60 z-0" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white">Account Created!</h2>
                  <p className="text-sm font-semibold text-zinc-300 px-2 leading-relaxed">
                    Your recruiter account has been created successfully.
                  </p>
                </div>

                <div className="space-y-4 w-full pt-4">
                  <div className="text-xs text-zinc-400 font-semibold bg-white/5 border border-white/5 py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    <span>Redirecting to login in <span className="text-white font-bold">{countdown}</span> seconds...</span>
                  </div>

                  <button
                    onClick={() => router.push("/login")}
                    className="w-full flex justify-center items-center space-x-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
                  >
                    <span>Continue to Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
