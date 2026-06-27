"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Cell, LineChart, Line, CartesianGrid, Legend
} from "recharts";
import { 
  Users, Award, MapPin, Loader2, Sparkles, TrendingUp,
  Percent, Calendar
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    skill_distribution: [],
    experience_distribution: [],
    match_score_distribution: [],
    hining_funnel: [],
    top_universities: [],
    top_locations: []
  });

  const [monthlyTrends] = useState([
    { month: "Jan", uploads: 25, shortlisted: 10 },
    { month: "Feb", uploads: 38, shortlisted: 15 },
    { month: "Mar", uploads: 45, shortlisted: 18 },
    { month: "Apr", uploads: 60, shortlisted: 25 },
    { month: "May", uploads: 85, shortlisted: 35 },
    { month: "Jun", uploads: 105, shortlisted: 42 }
  ]);

  useEffect(() => {
    api.get("/analytics/details")
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => console.error("Error loading analytics", err))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-xs">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Talent Pool Analytics</h1>
        <p className="text-sm text-muted-foreground">Detailed overview of candidate demography, skills, and conversion rates</p>
      </div>

      {/* Analytics Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-border rounded-xl p-5 shadow-subtle flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-foreground">82.4%</span>
            <h5 className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Average Match Score</h5>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 shadow-subtle flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-600">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-foreground">22.8%</span>
            <h5 className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Funnel Conversion Rate</h5>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 shadow-subtle flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 rounded-lg text-green-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-foreground">94.2%</span>
            <h5 className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Success Sourcing Rate</h5>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 shadow-subtle flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-foreground">32 / Mo</span>
            <h5 className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Average Monthly Uploads</h5>
          </div>
        </div>
      </div>

      {/* Detailed Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Chart 1: Skill Distribution */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground inline-flex items-center space-x-2">
              <Award className="w-4 h-4 text-primary" />
              <span>Core Skills Distribution</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Frequency count of primary technolgies in profile pool</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.skill_distribution} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 9 }} width={60} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {stats.skill_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Uploads Trend */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Monthly Pipeline Volume</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Comparison between total parsed profiles vs shortlisted candidates</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: 10, marginTop: 10 }} />
                <Line type="monotone" dataKey="uploads" name="Total Uploads" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="shortlisted" name="Shortlisted" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Universities */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground inline-flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Academic Representation</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Top institutions represented across applicants list</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.top_universities} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="university" tick={{ fontSize: 8 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {stats.top_universities.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Candidate Locations */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground inline-flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Geographical Locations</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Applicant density mapped by cities and remote hubs</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.top_locations} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="location" type="category" tick={{ fontSize: 8 }} width={70} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]}>
                  {stats.top_locations.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
