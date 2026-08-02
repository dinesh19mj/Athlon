'use client';

import { ArrowLeft, Search, MapPin, Star, ChevronRight, ShieldCheck, Dumbbell, Navigation, Phone } from 'lucide-react';
import Link from 'next/link';

export default function BookingsPage() {
  const venues = [
    {
      id: 1,
      name: 'Smash Arena Pro',
      rating: '4.9',
      reviews: '128',
      distance: '2.5 km',
      location: 'Koramangala, Bangalore',
      price: '₹500/hr',
      courts: 6,
      tags: ['BWF Certified', 'Pro Shop', 'Coaching'],
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop', // Placeholder
      featured: true,
    },
    {
      id: 2,
      name: 'Elite Sports Club',
      rating: '4.7',
      reviews: '84',
      distance: '4.1 km',
      location: 'HSR Layout, Bangalore',
      price: '₹400/hr',
      courts: 4,
      tags: ['Wooden Courts', 'Showers'],
      image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=800&auto=format&fit=crop', // Placeholder
      featured: false,
    }
  ];

  const featured = venues.find(a => a.featured);
  const others = venues.filter(a => !a.featured);

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-[#1B9C56] selection:text-black">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-foreground hover:text-[#1B9C56] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold uppercase tracking-wider">Book Courts</h1>
        </div>
        
        <button className="p-2 -mr-2 text-foreground hover:text-[#1B9C56] transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">

        {/* Filters / Quick Search */}
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
          {['Near Me', 'Available Now', 'Wooden Courts', 'Synthetic Courts'].map((filter, idx) => (
            <button key={idx} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${idx === 0 ? 'bg-[#1B9C56] text-black' : 'bg-surface border border-foreground/10 text-foreground/70 hover:text-foreground'}`}>
              {filter}
            </button>
          ))}
        </div>

        {/* Featured Academy Card */}
        {featured && (
          <section className="relative w-full h-[320px] rounded-[24px] overflow-hidden bg-surface border border-foreground/10 shadow-[0_10px_40px_rgba(0,136,255,0.15)] group cursor-pointer">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img src={featured.image} alt={featured.name} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1A] via-[#0A0F1A]/80 to-transparent" />
            </div>

            {/* Featured Badge */}
            <div className="absolute top-4 left-4 z-10 bg-[#1B9C56] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
              <span className="text-[9px] font-black uppercase tracking-wider text-foreground">Available Now</span>
            </div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col justify-end">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black leading-tight text-foreground drop-shadow-md">
                  {featured.name}
                </h2>
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-foreground/10">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-foreground">{featured.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-foreground/80 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7722]" />
                  <span>{featured.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-[#1B9C56]" />
                  <span>{featured.distance}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#1B9C56] text-[#0A0F1A] text-xs font-black px-4 py-3 rounded-xl hover:opacity-90 transition-opacity">
                  BOOK COURT <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Regular Academies List */}
        <section>
          <h3 className="text-xs font-bold text-foreground/50 tracking-wider uppercase mb-4 mt-2">More Venues</h3>
          <div className="flex flex-col gap-4">
            {others.map((academy) => (
              <div key={academy.id} className="bg-surface border border-foreground/5 hover:border-foreground/20 rounded-[20px] p-3 flex gap-4 transition-colors shadow-lg cursor-pointer group">
                
                {/* Image Thumbnail */}
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative">
                  <img src={academy.image} alt={academy.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" />
                  <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-foreground/10">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-foreground">{academy.rating}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-foreground leading-tight group-hover:text-[#FF7722] transition-colors">{academy.name}</h4>
                    <span className="text-[10px] font-black text-[#1B9C56]">{academy.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[10px] text-foreground/50 mb-2">
                    <MapPin className="w-3 h-3 text-foreground/40" />
                    <span className="truncate">{academy.location} ({academy.distance})</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-background border border-foreground/5 text-[9px] text-foreground/70">
                      <Dumbbell className="w-3 h-3 text-purple-400" /> {academy.courts} Courts
                    </span>
                    {academy.tags.map((tag, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-background border border-foreground/5 text-[9px] text-foreground/70 whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
