'use client';

import { BookOpen, Plus, Clock, Users, X, ChevronDown, Check, Search } from 'lucide-react';
import { useState } from 'react';

const mockBatches = [
  { id: 1, name: 'Morning A', time: '06:00 AM - 08:00 AM', capacity: 24, enrolled: 20, coach: 'Vikram S.' },
  { id: 2, name: 'Evening B', time: '04:00 PM - 06:00 PM', capacity: 20, enrolled: 18, coach: 'Priya S.' },
  { id: 3, name: 'Elite Squad', time: '06:00 PM - 09:00 PM', capacity: 10, enrolled: 8, coach: 'Vikram S.' },
];

export default function BatchesPage() {
  const [batches, setBatches] = useState(mockBatches);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);

  // New Batch Form State
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [newCoach, setNewCoach] = useState('');

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTime || !newCapacity || !newCoach) return;
    
    const newBatch = {
      id: Date.now(),
      name: newName,
      time: newTime,
      capacity: parseInt(newCapacity),
      enrolled: 0,
      coach: newCoach
    };
    
    setBatches([...batches, newBatch]);
    setIsAdding(false);
    
    // Reset
    setNewName(''); setNewTime(''); setNewCapacity(''); setNewCoach('');
  };

  const deleteBatch = (id: number) => {
    setBatches(batches.filter(b => b.id !== id));
  };

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col relative">
      <div className="p-6 border-b border-foreground/10 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Batches</h1>
          <p className="text-foreground/50 text-xs font-bold mt-1">Manage training schedules</p>
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

      <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar relative">
        
        {/* Add Batch Form (Inline) */}
        {isAdding && (
          <div className="bg-surface border border-[#F97316]/50 rounded-2xl p-5 shadow-2xl relative mb-6 animate-in fade-in slide-in-from-top-4">
            <button 
              onClick={() => setIsAdding(false)}
              className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-lg text-[#F97316] mb-4 uppercase tracking-wider">Create New Batch</h3>
            
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-1.5">Batch Name</label>
                  <input required value={newName} onChange={e => setNewName(e.target.value)} type="text" placeholder="e.g. Morning C" className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-1.5">Timing</label>
                  <input required value={newTime} onChange={e => setNewTime(e.target.value)} type="text" placeholder="e.g. 08:00 AM - 10:00 AM" className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-1.5">Capacity</label>
                  <input required value={newCapacity} onChange={e => setNewCapacity(e.target.value)} type="number" placeholder="e.g. 20" className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-1.5">Assigned Coach</label>
                  <input required value={newCoach} onChange={e => setNewCoach(e.target.value)} type="text" placeholder="e.g. Priya S." className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#F97316]" />
                </div>
              </div>
              <button type="submit" className="w-full mt-2 bg-[#F97316] text-black font-black uppercase tracking-widest text-xs py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Save Batch
              </button>
            </form>
          </div>
        )}

        {/* Batches List */}
        {batches.map((batch) => (
          <div key={batch.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-xl text-foreground mb-3">{batch.name}</h3>
                <div className="flex flex-wrap gap-4 text-foreground/70">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F97316]" />
                    <span className="text-xs font-bold uppercase tracking-wider">{batch.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#F97316]" />
                    <span className="text-xs font-bold uppercase tracking-wider">{batch.enrolled}/{batch.capacity} Students</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 pt-4 md:pt-0 border-t border-foreground/5 md:border-none">
                <div className="flex flex-col md:items-end">
                  <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Coach</span>
                  <span className="text-sm font-bold text-foreground">{batch.coach}</span>
                </div>
                <button 
                  onClick={() => setExpandedBatchId(expandedBatchId === batch.id ? null : batch.id)}
                  className={`bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${expandedBatchId === batch.id ? 'text-[#F97316] border-[#F97316]/30' : 'text-foreground'}`}
                >
                  Manage <ChevronDown className={`w-3 h-3 transition-transform ${expandedBatchId === batch.id ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Expandable Manage Area */}
            {expandedBatchId === batch.id && (
              <div className="mt-6 pt-5 border-t border-foreground/10 relative z-10 animate-in slide-in-from-top-2">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Quick Stats / Actions */}
                  <div className="flex-1 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#F97316]">Batch Actions</h4>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-background border border-foreground/10 rounded-xl p-3 text-xs font-bold text-foreground/80 hover:border-[#F97316] transition-colors">Edit Details</button>
                      <button className="flex-1 bg-background border border-foreground/10 rounded-xl p-3 text-xs font-bold text-foreground/80 hover:border-[#F97316] transition-colors">Message Students</button>
                    </div>
                    <button onClick={() => deleteBatch(batch.id)} className="w-full bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-3 text-xs font-bold hover:bg-red-500/20 transition-colors">
                      Delete Batch
                    </button>
                  </div>

                  {/* Student Roster Sneak Peek */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground/50">Enrolled Students</h4>
                      <span className="text-[10px] font-bold bg-[#F97316]/10 text-[#F97316] px-2 py-0.5 rounded-md">{batch.enrolled} / {batch.capacity}</span>
                    </div>
                    <div className="bg-background rounded-xl border border-foreground/10 p-3 space-y-2 h-32 overflow-y-auto hide-scrollbar">
                      {[...Array(Math.min(batch.enrolled, 4))].map((_, i) => (
                        <div key={i} className="flex items-center justify-between bg-foreground/5 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
                              <span className="text-[10px] font-black">{String.fromCharCode(65 + i)}</span>
                            </div>
                            <span className="text-xs font-bold">Student {i + 1}</span>
                          </div>
                          <button className="text-[10px] font-bold text-[#F97316] hover:underline">View</button>
                        </div>
                      ))}
                      {batch.enrolled > 4 && (
                        <div className="text-center pt-2">
                          <button className="text-[10px] font-bold text-foreground/50 hover:text-foreground uppercase tracking-widest">View All {batch.enrolled}</button>
                        </div>
                      )}
                      {batch.enrolled === 0 && (
                        <div className="text-center text-xs font-bold text-foreground/30 py-4">No students enrolled yet.</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
