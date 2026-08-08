'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, User, Users, ChevronRight, Trophy, MapPin, ActivityIcon, Phone, ShieldCheck } from 'lucide-react';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { UserService, UserResponse } from '@/lib/api/user';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { api } from '@/lib/api/client';

export default function RegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentUuid = params.id as string;
  const { userId, userUuid } = useAuthStore();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [step, setStep] = useState(1);
  
  const [registrationType, setRegistrationType] = useState<'self' | 'someone_else'>('self');
  
  // Player 1 details (Primary)
  const [player1, setPlayer1] = useState({ name: '', phone: '' });
  // Player 2 details (Partner for Doubles)
  const [player2, setPlayer2] = useState({ name: '', phone: '' });
  
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [tRes, uRes] = await Promise.all([
          TournamentService.getById(tournamentUuid),
          userUuid ? UserService.getUserByUuid(userUuid) : Promise.resolve(null)
        ]);
        
        if (tRes.data) setTournament(tRes.data);
        if (uRes?.data) setUserProfile(uRes.data);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [tournamentUuid, userUuid]);

  // Pre-fill user data if self registration
  useEffect(() => {
    if (registrationType === 'self' && userProfile) {
      setPlayer1({
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
        phone: userProfile.phone || ''
      });
    } else if (registrationType === 'someone_else') {
      setPlayer1({ name: '', phone: '' });
    }
  }, [registrationType, userProfile]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const isTeamEvent = tournament?.tournamentType === 'TEAM_EVENT';
  const matchFormatStr = tournament?.matchFormat?.toLowerCase() || '';
  const isDoubles = matchFormatStr.includes('doubles');

  const handleSubmit = async () => {
    if (!tournament) return;
    setSubmitting(true);
    
    const players = [];
    
    if (isTeamEvent) {
      // Team Event: just use the logged-in user details
      if (userProfile && userId && userUuid) {
        players.push({
          playerId: Number(userId),
          playerUuid: userUuid,
          playerName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
          phoneNumber: userProfile.phone || ''
        });
      }
    } else {
      // Player 1
      if (registrationType === 'self' && userProfile && userId && userUuid) {
        players.push({
          playerId: Number(userId),
          playerUuid: userUuid,
          playerName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
          phoneNumber: userProfile.phone || ''
        });
      } else {
        players.push({
          playerName: player1.name,
          phoneNumber: player1.phone
        });
      }
      
      // Player 2
      if (isDoubles) {
        players.push({
          playerName: player2.name,
          phoneNumber: player2.phone
        });
      }
    }
    
    // Default team name if empty
    let finalTeamName = teamName;
    if (!finalTeamName) {
      finalTeamName = isDoubles ? `${player1.name} & ${player2.name}` : player1.name;
    }
    if (isTeamEvent && userProfile && !finalTeamName) {
      finalTeamName = userProfile.firstName + "'s Team";
    }

    const payload = {
      tournamentId: tournament.tournamentId,
      tournamentUuid: tournament.tournamentUuid,
      primaryContactId: userId ? Number(userId) : null,
      primaryContactUuid: userUuid,
      teamName: finalTeamName,
      place: tournament.location || 'Unknown',
      createdBy: userId ? Number(userId) : null,
      players: players
    };
    
    try {
      await api.post('/api/tournament/registrations/create', payload);
      // Success! show alert card
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit registration. Please try again.");
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-background border border-[#1B9C56]/20 rounded-3xl p-8 md:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1B9C56] to-[#34D399]" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#1B9C56]/10 rounded-full blur-3xl" />
          
          <div className="w-20 h-20 bg-[#1B9C56]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#1B9C56]/20 animate-bounce">
            <Trophy className="w-10 h-10 text-[#1B9C56]" />
          </div>
          
          <div className="space-y-2 relative z-10">
            <h2 className="text-3xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Registration Successful!
            </h2>
            <p className="text-foreground/60 font-medium">
              You are now officially registered, Champion. Good luck!
            </p>
          </div>
          
          <button 
            onClick={() => router.push('/home/tournaments')}
            className="w-full py-4 mt-8 bg-foreground text-background font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-foreground/10"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  if (loading && !tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-[#1B9C56]/30 border-t-[#1B9C56] rounded-full animate-spin" />
        <p className="mt-4 font-bold text-foreground/50 animate-pulse">Loading Arena...</p>
      </div>
    );
  }

  const showPlayerDetailsStep = !isTeamEvent;
  const totalSteps = showPlayerDetailsStep ? 2 : 1;
  const isFinalStep = step === totalSteps;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#1B9C56]/30">
      {/* Dynamic Header Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[30vh] bg-[#1B9C56]/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-foreground/5 transition-all">
        <div className="px-4 h-20 flex items-center justify-between max-w-3xl mx-auto">
          <button 
            onClick={() => step > 1 ? handleBack() : router.push(`/home/tournaments/${tournamentUuid}`)} 
            className="p-3 -ml-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 hover:scale-105 active:scale-95 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-foreground/70 group-hover:text-foreground" />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <h1 className="font-black text-lg tracking-wide uppercase bg-gradient-to-r from-[#1B9C56] to-[#34D399] bg-clip-text text-transparent">
              Tournament Entry
            </h1>
            <p className="text-xs font-medium text-foreground/50 truncate max-w-[200px]">
              {tournament?.name}
            </p>
          </div>
          
          <div className="w-11" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 mt-4">
        


        {/* --- STEP 1: Roster / Player Details --- */}
        {step === 1 && showPlayerDetailsStep && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
            
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-3xl font-black tracking-tight">Who is competing?</h2>
              <p className="text-foreground/50 font-medium">Add the players for this event.</p>
            </div>
            
            {/* iOS-Style Segmented Control */}
            <div className="flex p-1.5 bg-foreground/5 rounded-2xl backdrop-blur-sm border border-foreground/5">
              <button
                onClick={() => setRegistrationType('self')}
                className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
                  registrationType === 'self' 
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-foreground/5 scale-[1.02]' 
                    : 'text-foreground/40 hover:text-foreground/70'
                }`}
              >
                <User className={`w-4 h-4 ${registrationType === 'self' ? 'text-[#1B9C56]' : ''}`} />
                For Myself
              </button>
              <button
                onClick={() => setRegistrationType('someone_else')}
                className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
                  registrationType === 'someone_else' 
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-foreground/5 scale-[1.02]' 
                    : 'text-foreground/40 hover:text-foreground/70'
                }`}
              >
                <Users className={`w-4 h-4 ${registrationType === 'someone_else' ? 'text-[#1B9C56]' : ''}`} />
                For Someone Else
              </button>
            </div>

            {isDoubles && (
              <div className="space-y-2 px-1">
                <label className="text-xs font-black text-foreground/40 uppercase tracking-widest pl-1">
                  Team Name <span className="lowercase font-normal text-foreground/30 tracking-normal">(Optional)</span>
                </label>
                <input 
                  type="text" 
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-5 py-4 bg-background border-2 border-foreground/5 rounded-2xl font-medium placeholder:text-foreground/30 focus:border-[#1B9C56] focus:ring-4 focus:ring-[#1B9C56]/10 outline-none transition-all"
                  placeholder="e.g. The Smashers"
                />
              </div>
            )}

            <div className="space-y-6">
              {/* Primary Player Card */}
              <div className="bg-foreground/[0.02] border border-foreground/5 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1B9C56]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:bg-[#1B9C56]/10" />
                
                <div className="flex items-center gap-3 pb-2 border-b border-foreground/5">
                  <div className="w-8 h-8 rounded-full bg-[#1B9C56]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#1B9C56]" />
                  </div>
                  <h3 className="font-bold text-lg">{isDoubles ? 'Player 1' : 'Player'}</h3>
                </div>

                <div className="space-y-5 relative z-10">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-foreground/40 uppercase tracking-widest pl-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={player1.name}
                      onChange={(e) => setPlayer1({...player1, name: e.target.value})}
                      disabled={registrationType === 'self'}
                      className="w-full px-5 py-4 bg-background border-2 border-foreground/5 rounded-2xl font-medium placeholder:text-foreground/30 focus:border-[#1B9C56] focus:ring-4 focus:ring-[#1B9C56]/10 outline-none transition-all disabled:opacity-50 disabled:bg-foreground/5"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-foreground/40 uppercase tracking-widest pl-1">
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      value={player1.phone}
                      onChange={(e) => setPlayer1({...player1, phone: e.target.value})}
                      disabled={registrationType === 'self'}
                      className="w-full px-5 py-4 bg-background border-2 border-foreground/5 rounded-2xl font-medium placeholder:text-foreground/30 focus:border-[#1B9C56] focus:ring-4 focus:ring-[#1B9C56]/10 outline-none transition-all disabled:opacity-50 disabled:bg-foreground/5"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* Partner Card (If Doubles) */}
              {isDoubles && (
                <div className="bg-foreground/[0.02] border border-foreground/5 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mb-16 transition-opacity group-hover:bg-blue-500/10" />
                  
                  <div className="flex items-center justify-between pb-2 border-b border-foreground/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-500" />
                      </div>
                      <h3 className="font-bold text-lg">Partner</h3>
                    </div>
                    <span className="text-xs font-black px-3 py-1 bg-foreground/5 rounded-full uppercase tracking-widest text-foreground/50">
                      Required
                    </span>
                  </div>

                  <div className="space-y-5 relative z-10">

                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-foreground/40 uppercase tracking-widest pl-1">
                          Partner's Name
                        </label>
                        <input 
                          type="text" 
                          value={player2.name}
                          onChange={(e) => setPlayer2({...player2, name: e.target.value})}
                          className="w-full px-5 py-4 bg-background border-2 border-foreground/5 rounded-2xl font-medium placeholder:text-foreground/30 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                          placeholder="e.g. Jane Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-foreground/40 uppercase tracking-widest pl-1">
                          Partner's Phone
                        </label>
                        <input 
                          type="tel" 
                          value={player2.phone}
                          onChange={(e) => setPlayer2({...player2, phone: e.target.value})}
                          className="w-full px-5 py-4 bg-background border-2 border-foreground/5 rounded-2xl font-medium placeholder:text-foreground/30 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              disabled={!player1.name || !player1.phone || (isDoubles && (!player2.name || !player2.phone))}
              onClick={handleNext}
              className="w-full py-5 bg-gradient-to-r from-[#1B9C56] to-[#127d42] text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-[0_8px_30px_rgba(27,156,86,0.25)] hover:shadow-[0_8px_40px_rgba(27,156,86,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              Continue to Review <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* --- FINAL STEP: Review --- */}
        {step === totalSteps && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
            
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-3xl font-black tracking-tight">Almost there!</h2>
              <p className="text-foreground/50 font-medium">Review your entry before securing your spot.</p>
            </div>
            
            {/* Premium Ticket Card */}
            <div className="bg-gradient-to-b from-foreground/[0.03] to-background border border-foreground/10 rounded-[2rem] p-1 relative overflow-hidden shadow-2xl shadow-foreground/5">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1B9C56]/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
              
              <div className="bg-background/40 backdrop-blur-3xl rounded-[1.85rem] border border-white/5 h-full relative z-10 flex flex-col">
                
                {/* Header section */}
                <div className="p-8 md:p-10 border-b border-foreground/10 border-dashed relative">
                  {/* Ticket cutouts */}
                  <div className="absolute -left-4 -bottom-4 w-8 h-8 rounded-full bg-background border-r border-t border-foreground/10 rotate-45" />
                  <div className="absolute -right-4 -bottom-4 w-8 h-8 rounded-full bg-background border-l border-t border-foreground/10 -rotate-45" />
                  
                  <div className="flex justify-between items-start gap-6">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B9C56]/10 text-[#1B9C56] border border-[#1B9C56]/20">
                        <Trophy className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Entry Pass</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black leading-tight tracking-tight">{tournament?.name}</h3>
                      <div className="flex items-center gap-2 text-foreground/60 font-medium">
                        <MapPin className="w-4 h-4" />
                        <span>{tournament?.location || 'Location TBD'}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Entry Fee</p>
                      {tournament?.registrationFees ? (
                        <p className="text-4xl font-black text-[#1B9C56] tracking-tighter">
                          <span className="text-xl align-top text-[#1B9C56]/70 mr-0.5">₹</span>
                          {tournament.registrationFees}
                        </p>
                      ) : (
                        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 uppercase tracking-tight">Free</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-8 md:p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Format</p>
                      <p className="font-bold text-lg">{tournament?.matchFormat || tournament?.tournamentType}</p>
                    </div>
                    {tournament?.category && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Category</p>
                        <p className="font-bold text-lg">{tournament?.category}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-foreground/5">
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      Roster Details
                    </p>
                    
                    {isDoubles && teamName && (
                      <div className="inline-block px-4 py-2 bg-foreground/5 rounded-xl border border-foreground/5 mb-2">
                        <span className="text-xs text-foreground/50 mr-2 font-medium">Team:</span>
                        <span className="font-bold">{teamName}</span>
                      </div>
                    )}
                    
                    <div className="grid gap-3">
                      {isTeamEvent && userProfile ? (
                        <div className="flex items-center justify-between p-4 bg-background border border-foreground/10 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1B9C56]/10 flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5 text-[#1B9C56]" />
                            </div>
                            <span className="font-bold">{userProfile.firstName} {userProfile.lastName} <span className="text-xs text-[#1B9C56] ml-1 uppercase tracking-widest">(Captain)</span></span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background border border-foreground/10 rounded-2xl shadow-sm gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                                <User className="w-5 h-5 text-foreground/60" />
                              </div>
                              <span className="font-bold">{player1.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground/50 sm:ml-auto font-medium bg-foreground/5 px-3 py-1.5 rounded-lg">
                              <Phone className="w-3.5 h-3.5" />
                              {player1.phone}
                            </div>
                          </div>
                          
                          {isDoubles && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background border border-foreground/10 rounded-2xl shadow-sm gap-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="font-bold">{player2.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-foreground/50 sm:ml-auto font-medium bg-foreground/5 px-3 py-1.5 rounded-lg">
                                <Phone className="w-3.5 h-3.5" />
                                {player2.phone}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-5 bg-foreground text-background font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-foreground/10 hover:shadow-2xl hover:shadow-foreground/20 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Securing Spot...
                </>
              ) : (
                <>
                  Confirm & Secure Spot <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
            
            <p className="text-center text-xs font-medium text-foreground/40">
              By confirming, you agree to the tournament's terms and conditions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
