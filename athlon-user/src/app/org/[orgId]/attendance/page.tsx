'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Search, ChevronDown, Check, X, Clock, Calendar as CalendarIcon, UserCheck, UserX, Users } from 'lucide-react';

const MOCK_BATCHES = [
  'Morning Advanced (06:00 AM)',
  'Kids Evening (04:00 PM)',
  'Elite Sparing (06:00 PM)',
];

const MOCK_STUDENTS = [
  { id: '1', name: 'Aarav Patel', status: 'Present', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Riya Sharma', status: 'Absent', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Kabir Singh', status: 'Present', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Neha Gupta', status: 'Late', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Aryan Reddy', status: 'Present', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: '6', name: 'Ishaan Verma', status: 'None', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: '7', name: 'Sanya Mirza', status: 'None', avatar: 'https://i.pravatar.cc/150?u=7' },
];

export default function AttendancePage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  
  const [selectedBatch, setSelectedBatch] = useState(MOCK_BATCHES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState(MOCK_STUDENTS);

  if (!org) return null;

  const handleMarkAttendance = (id: string, status: string) => {
    setAttendanceData(prev => 
      prev.map(student => student.id === id ? { ...student, status } : student)
    );
  };

  const filteredStudents = attendanceData.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = attendanceData.filter(s => s.status === 'Present' || s.status === 'Late').length;
  const absentCount = attendanceData.filter(s => s.status === 'Absent').length;
  const totalCount = attendanceData.length;

  const isClub = org.type === 'CLUB';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Attendance</h1>
          <p className="text-foreground/50 text-sm font-medium mt-1">
            {isClub ? `Monitor daily check-ins for ${org.name} members.` : `Mark daily attendance for ${org.name} classes.`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-bold tracking-wide hover:bg-foreground/90 transition-colors shadow-lg shadow-foreground/20">
            <Check className="w-4 h-4" /> Save Records
          </button>
        </div>
      </div>

      {/* Compact Top Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* Left: Date & Batch Selection */}
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 bg-surface/50 border border-foreground/5 p-2 rounded-2xl backdrop-blur-sm">
          
          <div className="flex items-center gap-3 px-4 py-2 w-full sm:w-auto">
            <CalendarIcon className="w-4 h-4 text-foreground/40" />
            <div className="text-sm font-bold text-foreground">Today, 12 Aug</div>
          </div>

          {!isClub && (
            <>
              <div className="w-px h-6 bg-foreground/10 hidden sm:block" />
              <div className="relative w-full sm:w-auto flex-1">
                <select 
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full appearance-none bg-background/50 border border-foreground/5 rounded-xl px-4 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-foreground/20 cursor-pointer"
                >
                  {MOCK_BATCHES.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" />
              </div>
            </>
          )}

        </div>

        {/* Right: Compact Metrics */}
        <div className="flex gap-2 w-full lg:w-auto">
          <div className="flex-1 lg:w-32 bg-surface border border-foreground/5 p-3 rounded-2xl flex flex-col justify-center items-center">
            <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">{isClub ? 'Members' : 'Students'}</div>
            <div className="text-xl font-black text-foreground">{totalCount}</div>
          </div>
          <div className="flex-1 lg:w-32 bg-green-500/10 border border-green-500/20 p-3 rounded-2xl flex flex-col justify-center items-center">
            <div className="text-[10px] font-black text-green-600/70 uppercase tracking-widest mb-1">Present</div>
            <div className="text-xl font-black text-green-600">{presentCount}</div>
          </div>
          <div className="flex-1 lg:w-32 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl flex flex-col justify-center items-center">
            <div className="text-[10px] font-black text-red-600/70 uppercase tracking-widest mb-1">Absent</div>
            <div className="text-xl font-black text-red-600">{absentCount}</div>
          </div>
        </div>

      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input 
            type="text" 
            placeholder={isClub ? "Find a member..." : "Find a student..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface/50 border border-foreground/10 rounded-full pl-11 pr-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-foreground/30 transition-all"
          />
        </div>
        <button 
          onClick={() => setAttendanceData(prev => prev.map(s => ({ ...s, status: 'Present' })))}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-green-600 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 rounded-full transition-colors whitespace-nowrap"
        >
          Mark All Present
        </button>
      </div>

      {/* List View (Replaced Datatable) */}
      <div className="grid gap-3 pt-2">
        {filteredStudents.map((person) => (
          <div 
            key={person.id} 
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-surface/50 backdrop-blur-md border border-foreground/5 rounded-2xl hover:border-foreground/10 transition-colors"
          >
            {/* Person Info */}
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-foreground/10 shrink-0">
                <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">{person.name}</h4>
                <div className="text-xs font-medium text-foreground/40">ID: #{person.id.padStart(4, '0')}</div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 bg-background/50 p-1.5 rounded-xl border border-foreground/5 self-end sm:self-auto">
              
              <button 
                onClick={() => handleMarkAttendance(person.id, 'Present')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-auto justify-center ${
                  person.status === 'Present' 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : 'text-foreground/50 hover:bg-foreground/5'
                }`}
              >
                <Check className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Present</span>
              </button>
              
              <button 
                onClick={() => handleMarkAttendance(person.id, 'Late')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-auto justify-center ${
                  person.status === 'Late' 
                    ? 'bg-yellow-500 text-white shadow-sm' 
                    : 'text-foreground/50 hover:bg-foreground/5'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Late</span>
              </button>
              
              <button 
                onClick={() => handleMarkAttendance(person.id, 'Absent')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-auto justify-center ${
                  person.status === 'Absent' 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'text-foreground/50 hover:bg-foreground/5'
                }`}
              >
                <X className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Absent</span>
              </button>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center border border-dashed border-foreground/10 rounded-2xl">
            <div className="text-foreground/40 font-medium text-sm">No {isClub ? 'members' : 'students'} found matching your search.</div>
          </div>
        )}
      </div>
      
    </div>
  );
}