'use client';

import { Users, Plus, Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

const mockStudents = [
  { id: 1, name: 'Arjun Patel', level: 'Intermediate', batch: 'Morning A' },
  { id: 2, name: 'Neha Gupta', level: 'Beginner', batch: 'Evening B' },
  { id: 3, name: 'Karan Singh', level: 'Advanced', batch: 'Elite Squad' },
];

export default function StudentsPage() {
  const [students, setStudents] = useState(mockStudents);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState('Beginner');
  const [newBatch, setNewBatch] = useState('Morning A');

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    const newStudent = {
      id: Date.now(),
      name: newName,
      level: newLevel,
      batch: newBatch,
    };
    
    setStudents([newStudent, ...students]);
    setIsAdding(false);
    
    // Reset
    setNewName(''); setNewLevel('Beginner'); setNewBatch('Morning A');
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col relative">
      <div className="p-6 border-b border-foreground/10 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Students</h1>
            <p className="text-foreground/50 text-xs font-bold mt-1">Total: {students.length} Enrolled</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-10 h-10 rounded-full bg-[#F97316] text-black shadow-[0_4px_20px_rgba(249,115,22,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 bg-surface border border-foreground/10 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:border-[#F97316] transition-colors">
            <Search className="w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search by name or batch..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-foreground/40 font-bold" 
            />
          </div>
          <button className="bg-surface border border-foreground/10 rounded-xl px-3 py-2.5 flex items-center justify-center hover:bg-foreground/5 transition-colors">
            <Filter className="w-4 h-4 text-foreground/70" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar relative">
        
        {/* Add Student Form (Inline) */}
        {isAdding && (
          <div className="bg-surface border border-[#F97316]/50 rounded-2xl p-5 shadow-2xl relative mb-6 animate-in fade-in slide-in-from-top-4">
            <button 
              onClick={() => setIsAdding(false)}
              className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-lg text-[#F97316] mb-4 uppercase tracking-wider">Add New Student</h3>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-1.5">Full Name</label>
                <input required value={newName} onChange={e => setNewName(e.target.value)} type="text" placeholder="e.g. John Doe" className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#F97316]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-1.5">Skill Level</label>
                  <select value={newLevel} onChange={e => setNewLevel(e.target.value)} className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#F97316]">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-1.5">Assign Batch</label>
                  <select value={newBatch} onChange={e => setNewBatch(e.target.value)} className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#F97316]">
                    <option value="Morning A">Morning A (06:00 AM)</option>
                    <option value="Evening B">Evening B (04:00 PM)</option>
                    <option value="Elite Squad">Elite Squad (06:00 PM)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full mt-2 bg-[#F97316] text-black font-black uppercase tracking-widest text-xs py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Enroll Student
              </button>
            </form>
          </div>
        )}

        {/* Student List */}
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center justify-between hover:border-foreground/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[#F97316]" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{student.name}</h3>
                  <p className="text-[10px] text-foreground/50 uppercase tracking-wider">{student.batch}</p>
                </div>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${
                student.level === 'Advanced' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                student.level === 'Intermediate' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                'bg-green-500/10 text-green-500 border border-green-500/20'
              }`}>
                {student.level}
              </span>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-foreground/40 font-bold border border-foreground/5 border-dashed rounded-2xl">
            No students found.
          </div>
        )}
      </div>
    </div>
  );
}
