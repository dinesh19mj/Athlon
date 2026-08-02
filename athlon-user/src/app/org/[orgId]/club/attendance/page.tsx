'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AttendancePage() {
  const [members, setMembers] = useState([
    { id: 1, name: 'Arjun Patel', status: 'present' },
    { id: 2, name: 'Neha Gupta', status: 'absent' },
    { id: 3, name: 'Raj Kumar', status: 'pending' },
    { id: 4, name: 'Vikram Singh', status: 'pending' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const markAttendance = (id: number, newStatus: 'present' | 'absent') => {
    setMembers(prev => prev.map(member => 
      member.id === id ? { ...member, status: newStatus } : member
    ));
    setSubmitted(false); // Reset submitted state if they change something
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col">
      <div className="p-6 border-b border-foreground/10 flex flex-col gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Attendance</h1>
          <p className="text-foreground/50 text-xs font-bold mt-1">Mark daily club attendance</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-1">All Members</h2>
          <span className="text-[10px] font-bold text-[#0A0F1A] bg-[#06B6D4] px-2 py-1 rounded-full">
            {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {members.map((member) => (
          <div key={member.id} className={`bg-surface/80 backdrop-blur-md border rounded-2xl p-3 shadow-xl flex items-center justify-between transition-colors ${
            member.status === 'present' ? 'border-green-500/30 bg-green-500/5' : 
            member.status === 'absent' ? 'border-red-500/30 bg-red-500/5' : 'border-foreground/5'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                member.status === 'present' ? 'bg-green-500/20 text-green-500' :
                member.status === 'absent' ? 'bg-red-500/20 text-red-500' :
                'bg-foreground/5 border border-foreground/10 text-foreground/50'
              }`}>
                <span className="font-bold">{member.name.charAt(0)}</span>
              </div>
              <h3 className="font-bold text-foreground text-sm">{member.name}</h3>
            </div>
            
            <div className="flex items-center gap-2 bg-background p-1 rounded-xl border border-foreground/5">
              <button 
                onClick={() => markAttendance(member.id, 'present')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                member.status === 'present' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-foreground/30 hover:text-green-500 hover:bg-green-500/10'
              }`}>
                <CheckCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => markAttendance(member.id, 'absent')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                member.status === 'absent' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-foreground/30 hover:text-red-500 hover:bg-red-500/10'
              }`}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-foreground/10 bg-background shrink-0 relative">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full font-black uppercase tracking-widest py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
            submitted 
              ? 'bg-green-500 text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]'
              : 'bg-[#06B6D4] text-[#0A0F1A] shadow-[0_4px_20px_rgba(6,182,212,0.4)] active:scale-95 hover:brightness-110'
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-[#0A0F1A]/30 border-t-[#0A0F1A] rounded-full animate-spin" />
          ) : submitted ? (
            <>
              <CheckCircle className="w-5 h-5" /> Saved Successfully
            </>
          ) : (
            'Submit Attendance'
          )}
        </button>
      </div>
    </div>
  );
}
