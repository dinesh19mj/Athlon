import Link from 'next/link';
import { Bell, CalendarClock, Trophy, CheckCircle2, ChevronRight, Info } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    type: 'match_update',
    title: 'Match Rescheduled',
    message: 'Your Quarter-Finals match against Arjun M has been moved to Court 1 at 10:00 AM.',
    time: '2 hours ago',
    read: false,
    icon: CalendarClock,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10'
  },
  {
    id: 2,
    type: 'registration',
    title: 'Registration Confirmed',
    message: 'You have successfully registered for the Summer Smash 2024 (Men\'s Singles).',
    time: 'Yesterday',
    read: true,
    icon: CheckCircle2,
    color: 'text-[#1B9C56]',
    bgColor: 'bg-[#1B9C56]/10'
  },
  {
    id: 3,
    type: 'result',
    title: 'Match Won!',
    message: 'Congratulations! You won your Round of 16 match against Siva K (21-18, 15-21, 21-19).',
    time: '2 days ago',
    read: true,
    icon: Trophy,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10'
  },
  {
    id: 4,
    type: 'system',
    title: 'System Update',
    message: 'Welcome to Athlon! Check out the new rankings page to see your current standing.',
    time: '1 week ago',
    read: true,
    icon: Info,
    color: 'text-[#3B82F6]',
    bgColor: 'bg-[#3B82F6]/10'
  }
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Header */}
      <header className="p-4 md:px-8 md:py-6 border-b border-foreground/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide flex items-center gap-2">
            <Bell className="w-7 h-7 text-[#3B82F6]" /> Notifications
          </h1>
          <p className="text-foreground/50 font-bold mt-1 text-sm">Stay updated on your upcoming matches and results.</p>
        </div>
        
        {/* Mark as read action */}
        <button className="hidden md:flex text-[10px] font-black uppercase tracking-widest text-[#3B82F6] bg-[#3B82F6]/10 px-3 py-1.5 rounded-lg hover:bg-[#3B82F6]/20 transition-colors">
          Mark all as read
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-3xl mx-auto space-y-3">
        {/* Mobile mark as read */}
        <div className="flex justify-end md:hidden mb-2">
          <button className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] hover:underline">
            Mark all as read
          </button>
        </div>

        {mockNotifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`bg-surface border rounded-2xl p-4 md:p-5 flex gap-4 transition-colors group relative overflow-hidden ${
              !notif.read 
                ? 'border-foreground/20 shadow-md' 
                : 'border-foreground/5 opacity-80 hover:opacity-100'
            }`}
          >
            {/* Unread Indicator Bar */}
            {!notif.read && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B82F6]" />
            )}
            
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.bgColor}`}>
              <notif.icon className={`w-5 h-5 ${notif.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm md:text-base font-black tracking-tight truncate pr-2 ${!notif.read ? 'text-foreground' : 'text-foreground/80'}`}>
                  {notif.title}
                </h3>
                <span className="text-[10px] font-bold text-foreground/40 shrink-0 mt-0.5">
                  {notif.time}
                </span>
              </div>
              <p className={`text-xs md:text-sm leading-relaxed ${!notif.read ? 'font-bold text-foreground/70' : 'font-medium text-foreground/50'}`}>
                {notif.message}
              </p>
            </div>

            {/* Action Arrow */}
            <div className="hidden md:flex items-center justify-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-foreground/30" />
            </div>
          </div>
        ))}

        {/* Empty State fallback (if array was empty) */}
        {mockNotifications.length === 0 && (
          <div className="bg-surface/50 border border-foreground/5 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center mt-8">
            <Bell className="w-12 h-12 text-foreground/20 mb-4" />
            <h3 className="text-lg font-black uppercase tracking-widest text-foreground/70 mb-2">You're all caught up!</h3>
            <p className="text-xs font-bold text-foreground/40 max-w-sm">There are no new notifications at this time.</p>
          </div>
        )}
      </main>
    </div>
  );
}
