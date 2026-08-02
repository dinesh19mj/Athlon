'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Search, Plus, Filter, TrendingUp, ChevronDown, Award, Activity, Target, Zap, Clock, User, Download, Edit } from 'lucide-react';

const MOCK_STUDENTS = [
  { id: '1', name: 'Aarav Patel', level: 'Intermediate', batch: 'Morning Advanced' },
  { id: '2', name: 'Riya Sharma', level: 'Advanced', batch: 'Elite Sparing' },
  { id: '3', name: 'Kabir Singh', level: 'Beginner', batch: 'Kids Evening' },
];

const SKILL_METRICS = [
  { name: 'Technical Skills', score: 85, color: 'bg-blue-500' },
  { name: 'Physical Fitness', score: 92, color: 'bg-green-500' },
  { name: 'Tactical Awareness', score: 78, color: 'bg-purple-500' },
  { name: 'Mental Toughness', score: 88, color: 'bg-orange-500' },
];

const RECENT_EVALUATIONS = [
  { id: '1', date: 'Aug 10, 2026', coach: 'Coach Vikram', title: 'Monthly Assessment', notes: 'Significant improvement in footwork. Needs to work on backhand defense under pressure.' },
  { id: '2', date: 'Jul 25, 2026', coach: 'Coach Priya', title: 'Match Simulation', notes: 'Great stamina during long rallies. Tactical decision making is getting sharper.' },
];

export default function PerformancePage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0]);

  if (!org) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Performance Tracking</h1>
          <p className="text-foreground/50 font-medium mt-1">Monitor athlete progress, skill metrics, and coach evaluations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B9C56] text-black text-sm font-black tracking-wide hover:bg-[#158045] transition-colors shadow-lg shadow-[#1B9C56]/20">
            <Plus className="w-4 h-4" /> Add Evaluation
          </button>
        </div>
      </div>

      {/* Student Selector */}
      <div className="bg-surface border border-foreground/5 p-5 rounded-[24px] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center text-xl font-bold text-foreground shrink-0">
            {selectedStudent.name.charAt(0)}
          </div>
          <div>
            <div className="text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-0.5">Selected Athlete</div>
            <div className="text-xl font-bold text-foreground">{selectedStudent.name}</div>
          </div>
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <select 
            className="w-full appearance-none bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] cursor-pointer"
            onChange={(e) => setSelectedStudent(MOCK_STUDENTS.find(s => s.id === e.target.value) || MOCK_STUDENTS[0])}
          >
            {MOCK_STUDENTS.map(student => (
              <option key={student.id} value={student.id}>{student.name} - {student.batch}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Key Stats & Radar (Simulated) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Overall Rating */}
          <div className="bg-gradient-to-br from-[#1B9C56] to-[#158045] p-6 rounded-[24px] text-black shadow-lg shadow-[#1B9C56]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-widest opacity-80">Overall Rating</span>
              <Award className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-5xl font-black mb-2 relative z-10">8.5<span className="text-2xl text-black/60">/10</span></div>
            <div className="text-sm font-bold text-black/80 flex items-center gap-1 relative z-10">
              <TrendingUp className="w-4 h-4" /> Top 15% in Academy
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
              <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Target className="w-3 h-3 text-blue-500" /> Current Level
              </div>
              <div className="text-lg font-black text-foreground">{selectedStudent.level}</div>
            </div>
            <div className="bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
              <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-red-500" /> Attendance
              </div>
              <div className="text-lg font-black text-foreground">94%</div>
            </div>
          </div>

        </div>

        {/* Right Column: Detailed Breakdown & History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Skill Breakdown */}
          <div className="bg-surface border border-foreground/5 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-foreground">Skill Breakdown</h3>
              <button className="text-xs font-bold text-[#1B9C56] hover:underline">View Historical Chart</button>
            </div>
            
            <div className="space-y-5">
              {SKILL_METRICS.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-foreground/80">{skill.name}</span>
                    <span className="text-sm font-black text-foreground">{skill.score}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${skill.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Evaluations */}
          <div className="bg-surface border border-foreground/5 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-foreground">Recent Evaluations</h3>
            </div>
            
            <div className="space-y-4">
              {RECENT_EVALUATIONS.map((evaluation) => (
                <div key={evaluation.id} className="p-4 bg-background border border-foreground/5 rounded-2xl relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-surface hover:bg-foreground/5 rounded-lg border border-foreground/10 transition-colors">
                      <Edit className="w-3.5 h-3.5 text-foreground/60" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="text-sm font-black text-foreground">{evaluation.title}</div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-foreground/5 rounded-md text-[10px] font-bold text-foreground/60 uppercase tracking-widest">
                      <Clock className="w-3 h-3" /> {evaluation.date}
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1B9C56]/10 text-[#1B9C56] rounded-md text-[10px] font-bold uppercase tracking-widest">
                      <User className="w-3 h-3" /> {evaluation.coach}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground/70 leading-relaxed">
                    "{evaluation.notes}"
                  </p>
                </div>
              ))}
            </div>
            
          </div>

        </div>
      </div>
      
    </div>
  );
}
