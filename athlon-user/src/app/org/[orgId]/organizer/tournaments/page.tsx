'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Calendar, Users, ChevronRight, PlusCircle, Settings, ArrowLeft, X, MapPin, Upload, IndianRupee } from 'lucide-react';

export default function OrganizerTournamentsPage() {
  const [tournaments, setTournaments] = useState([
    { id: 1, name: 'Summer Slam 2026', status: 'ACTIVE', dates: 'Jul 20 - Jul 25', participants: 128 },
    { id: 2, name: 'City Finals', status: 'DRAFT', dates: 'Aug 10 - Aug 12', participants: 0 },
    { id: 3, name: 'Spring Open', status: 'COMPLETED', dates: 'Mar 01 - Mar 05', participants: 256 },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [sport, setSport] = useState('Badminton');
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [category, setCategory] = useState('');
  const [fees, setFees] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [lastEntryDate, setLastEntryDate] = useState('');
  const [poster, setPoster] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPoster(url);
    }
  };

  const handleAddTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate) return;

    const newTournament = {
      id: Date.now(),
      name,
      status: 'DRAFT',
      dates: new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' - TBD',
      participants: 0,
    };

    setTournaments([newTournament, ...tournaments]);
    setIsAdding(false);
    
    // Reset Form
    setSport('Badminton');
    setName('');
    setPlace('');
    setCategory('');
    setFees('');
    setStartDate('');
    setStartTime('');
    setLastEntryDate('');
    setPoster(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 pb-32 relative">
      
      {/* Header */}
      <header className="mb-6 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/organizer" className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-black uppercase tracking-wide">
            My Tournaments
          </h1>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="hidden md:flex bg-[#1B9C56] text-black font-bold py-2 px-4 rounded-xl items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(27,156,86,0.3)]"
        >
          <PlusCircle className="w-5 h-5" /> New Tournament
        </button>
      </header>

      {/* Tournaments List */}
      <div className="space-y-4">
        {tournaments.map((tournament) => (
          <div key={tournament.id} className="bg-surface border border-foreground/5 rounded-2xl p-5 shadow-xl hover:border-foreground/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-foreground/5 group-hover:scale-105 transition-transform">
                  <Trophy className={`w-6 h-6 ${tournament.status === 'ACTIVE' ? 'text-[#1B9C56]' : 'text-foreground/40'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">{tournament.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      tournament.status === 'ACTIVE' ? 'bg-[#1B9C56]/20 text-[#1B9C56] border border-[#1B9C56]/30' : 
                      tournament.status === 'COMPLETED' ? 'bg-foreground/10 text-foreground/60 border border-foreground/10' :
                      'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                    }`}>
                      {tournament.status}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-foreground/60" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 bg-background rounded-xl p-3 border border-foreground/5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-foreground/40" />
                <span className="text-xs font-semibold text-foreground/70">{tournament.dates}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-foreground/40" />
                <span className="text-xs font-semibold text-foreground/70">{tournament.participants} Players</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-foreground/5 flex justify-end">
              <Link href={`/organizer/tournaments/${tournament.id}`} className="flex items-center gap-1 text-[#1B9C56] text-xs font-bold hover:underline">
                MANAGE TOURNAMENT <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-[90px] right-6 z-50">
        <button 
          onClick={() => setIsAdding(true)}
          className="w-14 h-14 bg-[#1B9C56] text-black rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(27,156,86,0.4)] hover:scale-105 active:scale-95 transition-transform"
        >
          <PlusCircle className="w-8 h-8" />
        </button>
      </div>

      {/* Add Tournament Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col justify-end md:justify-center md:items-center">
          <div className="bg-surface w-full md:w-full md:max-w-2xl h-[95vh] md:h-[85vh] rounded-t-[32px] md:rounded-[32px] border border-foreground/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-bottom-8 duration-300">
            
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">New Tournament</h2>
                <p className="text-xs text-foreground/50 font-bold mt-1">Configure tournament details</p>
              </div>
              <button 
                onClick={() => setIsAdding(false)}
                className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleAddTournament} className="space-y-6">
                
                {/* Poster Upload */}
                <div>
                  <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">Tournament Poster</label>
                  <label className={`w-full h-40 border-2 border-dashed ${poster ? 'border-[#1B9C56]' : 'border-foreground/20'} rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#1B9C56] transition-colors relative overflow-hidden bg-background group`}>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    {poster ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src={poster} alt="Poster" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute flex items-center gap-2 text-white font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                          <Upload className="w-4 h-4" /> Change Image
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-foreground/40 mb-2 group-hover:text-[#1B9C56] transition-colors" />
                        <span className="text-sm font-bold text-foreground/60">Upload Poster Image</span>
                        <span className="text-[10px] text-foreground/40 mt-1">JPEG, PNG up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">Tournament Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Trophy className="w-5 h-5 text-foreground/40" />
                      </div>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Summer Smash 2026"
                        className="w-full bg-background border border-foreground/10 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Place */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">Location / Venue</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 text-foreground/40" />
                      </div>
                      <input 
                        type="text" 
                        required
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        placeholder="Stadium / Google Maps Link"
                        className="w-full bg-background border border-foreground/10 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Sport */}
                  <div>
                    <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">Sport</label>
                    <select 
                      required
                      value={sport}
                      onChange={(e) => {
                        setSport(e.target.value);
                        setCategory(''); // reset category on sport change
                      }}
                      className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] transition-colors appearance-none"
                    >
                      <option value="Badminton">Badminton</option>
                      <option value="Football">Football</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Volleyball">Volleyball</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">Category</label>
                    <select 
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] transition-colors appearance-none"
                    >
                      <option value="" disabled>Select Category</option>
                      {sport === 'Badminton' ? (
                        <>
                          <option value="Men's Singles">Men's Singles</option>
                          <option value="Men's Doubles">Men's Doubles</option>
                          <option value="Women's Singles">Women's Singles</option>
                          <option value="Women's Doubles">Women's Doubles</option>
                          <option value="Mixed Doubles">Mixed Doubles</option>
                          <option value="Open">Open</option>
                          <option value="Corporate">Corporate</option>
                        </>
                      ) : (
                        <>
                          <option value="Men's Team">Men's Team</option>
                          <option value="Women's Team">Women's Team</option>
                          <option value="Under-19">Under-19</option>
                          <option value="Under-15">Under-15</option>
                          <option value="Corporate">Corporate</option>
                          <option value="Open">Open</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Registration Fees */}
                  <div>
                    <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">Registration Fee</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IndianRupee className="w-4 h-4 text-foreground/40" />
                      </div>
                      <input 
                        type="number" 
                        required
                        value={fees}
                        onChange={(e) => setFees(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full bg-background border border-foreground/10 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] transition-colors"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">Start Time</label>
                    <input 
                      type="time" 
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] transition-colors"
                    />
                  </div>

                  {/* Last Date of Entry */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-[#1B9C56] uppercase tracking-widest mb-2">Registration Deadline</label>
                    <input 
                      type="date" 
                      required
                      value={lastEntryDate}
                      onChange={(e) => setLastEntryDate(e.target.value)}
                      className="w-full bg-[#1B9C56]/5 border border-[#1B9C56]/20 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] transition-colors"
                    />
                  </div>

                </div>

                <div className="pt-6 pb-8 md:pb-2">
                  <button 
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#1B9C56] text-black font-black tracking-wide shadow-[0_5px_20px_rgba(27,156,86,0.3)] hover:bg-[#158045] transition-colors uppercase"
                  >
                    Create Tournament
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
