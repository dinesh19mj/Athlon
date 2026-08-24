'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Search, Plus, Filter, MoreVertical, Phone, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';

const MOCK_STUDENTS = [
  { id: '1', name: 'Aarav Patel', age: 12, level: 'Beginner', batch: 'Kids Evening', parent: 'Suresh Patel', phone: '+91 98765 43210', feeStatus: 'Paid' },
  { id: '2', name: 'Riya Sharma', age: 16, level: 'Advanced', batch: 'Elite Sparing', parent: 'Anita Sharma', phone: '+91 87654 32109', feeStatus: 'Overdue' },
  { id: '3', name: 'Kabir Singh', age: 14, level: 'Intermediate', batch: 'Morning Batch', parent: 'Raj Singh', phone: '+91 76543 21098', feeStatus: 'Paid' },
  { id: '4', name: 'Neha Gupta', age: 10, level: 'Beginner', batch: 'Kids Weekend', parent: 'Priya Gupta', phone: '+91 65432 10987', feeStatus: 'Pending' },
  { id: '5', name: 'Aryan Reddy', age: 18, level: 'Pro', batch: 'Pro Training', parent: 'Self', phone: '+91 54321 09876', feeStatus: 'Paid' },
];

export default function StudentsPage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const [searchTerm, setSearchTerm] = useState('');

  if (!org) return null;

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Student Roster</h1>
          <p className="text-foreground/50 font-medium mt-1">Manage athletes, batches, and fee status for {org.name}.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Enroll Student
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
          <div className="text-foreground/50 text-xs font-bold uppercase tracking-widest mb-1">Total Students</div>
          <div className="text-2xl font-black text-foreground">142</div>
        </div>
        <div className="bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
          <div className="text-foreground/50 text-xs font-bold uppercase tracking-widest mb-1">Active Batches</div>
          <div className="text-2xl font-black text-foreground">8</div>
        </div>
        <div className="bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
          <div className="text-green-500/80 text-xs font-bold uppercase tracking-widest mb-1">Fees Collected</div>
          <div className="text-2xl font-black text-green-500">85%</div>
        </div>
        <div className="bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
          <div className="text-red-500/80 text-xs font-bold uppercase tracking-widest mb-1">Overdue Payments</div>
          <div className="text-2xl font-black text-red-500">12</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search students by name or batch..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-foreground/10 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Level</th>
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Batch</th>
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Guardian Info</th>
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Fee Status</th>
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-foreground/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground font-bold shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{student.name}</div>
                        <div className="text-xs text-foreground/50">Age: {student.age}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-foreground/40" />
                      <span className="text-sm font-semibold text-foreground/70">{student.level}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded bg-foreground/5 text-xs font-bold text-foreground/70 border border-foreground/10">
                      {student.batch}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-foreground/80">{student.parent}</div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-foreground/50">
                      <Phone className="w-3 h-3" /> {student.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {student.feeStatus === 'Paid' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className={`w-4 h-4 ${student.feeStatus === 'Overdue' ? 'text-red-500' : 'text-yellow-500'}`} />
                      )}
                      <span className={`text-sm font-black ${
                        student.feeStatus === 'Paid' ? 'text-green-500' : 
                        student.feeStatus === 'Overdue' ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {student.feeStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-xs font-bold text-foreground transition-colors border border-transparent hover:border-foreground/10">
                        Profile
                      </button>
                      <button className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors" title="Options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-foreground/40 font-medium">No students found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}