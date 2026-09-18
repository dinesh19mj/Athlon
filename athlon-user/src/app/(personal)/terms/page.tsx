'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Trophy,
  Users,
  CreditCard,
  Scale,
  Lock,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Mail,
  Phone,
  Search,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Award,
} from 'lucide-react';

export default function TermsAndConditionsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('acceptance');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: Scale,
      badge: 'Agreement',
      summary: 'Legally binding terms governing platform access, software usage, and tournament participation.',
      content: [
        'By registering an account, accessing the Athlon platform, or entering a tournament hosted via Athlon, you agree to comply with and be bound by these Terms and Conditions along with our Privacy Policy.',
        'If you are acting on behalf of an Academy, Sports Club, Organization, or School, you represent and warrant that you possess the requisite authority to bind that entity to these Terms.',
        'If you do not agree to all terms stated herein, you must immediately discontinue using Athlon services and portals.',
      ],
      highlights: [
        'Applies to all players, organizers, coaches, umpires, and tournament spectators.',
        'Entity administrators bind their respective sports clubs and registered academies.',
      ],
    },
    {
      id: 'platform-role',
      title: '2. Athlon Platform Role',
      icon: Trophy,
      badge: 'Software Service',
      summary: 'Athlon delivers specialized software infrastructure for modern sports tournament management.',
      content: [
        'Athlon provides tournament bracket draw engines (Single Elimination, Double Elimination, League Pools, Pooled Knockout), real-time umpire digital scoring consoles, court scheduling systems, and OBS/RTMP live broadcast score overlays.',
        'Athlon functions strictly as a technology software service provider. The physical execution, venue management, court conditions, referee decisions, and safety protocols of any tournament remain the sole responsibility of the respective tournament organizer.',
      ],
      highlights: [
        'Platform automates match draws, schedules, umpire scoring, and points tables.',
        'On-ground physical tournament logistics are managed independently by registered organizers.',
      ],
    },
    {
      id: 'accounts',
      title: '3. User Accounts & Verification',
      icon: Users,
      badge: 'Athletes & Orgs',
      summary: 'Rules for authentic account creation, athlete verification, and fair skill seeding.',
      content: [
        'Athletes and organizers register via authenticated mobile phone verification (OTP). You must provide genuine, accurate, and up-to-date identification details.',
        'You are strictly responsible for maintaining the confidentiality of your credentials, OTPs, and access tokens.',
        'Falsifying athlete age, skill tier, ranking points, or identity records to gain unfair seeding or entry into category-restricted tournaments (e.g. Under-19, Beginner, Intermediate) is strictly prohibited and results in immediate disqualification.',
      ],
      highlights: [
        'Authenticated mobile number acts as primary security credential.',
        'Zero tolerance for fraudulent player identity, age spoofing, or manipulated rankings.',
      ],
    },
    {
      id: 'tournaments',
      title: '4. Tournaments & Match Operations',
      icon: ShieldCheck,
      badge: 'Matches & Draws',
      summary: 'Rules governing automated bracket generation, umpire scoring, and match finality.',
      content: [
        'Tournament organizers configure format rules, registration caps, entry fees, and category limits. Once registration is closed, automated bracket draws are generated according to standard federation seeding principles.',
        'Matches scored by designated umpires or tournament officials are updated live. Once a match is confirmed and marked as COMPLETED by the match official, the resulting scores, sets, and winner progressions are final on the platform.',
        'Any on-court score disputes or rule objections must be lodged with the on-ground Chief Referee or Tournament Director prior to the commencement of the subsequent tournament round.',
      ],
      highlights: [
        'Draws generated follow standard knockout or league seeding algorithms.',
        'Completed match official submissions are binding and immutable on the digital draw sheet.',
      ],
    },
    {
      id: 'payments',
      title: '5. Fees, Payments & Refunds',
      icon: CreditCard,
      badge: 'Financial Terms',
      summary: 'Clear guidelines regarding tournament registration fees, subscriptions, and cancellations.',
      content: [
        'Tournament entry fees and organization subscription tiers are displayed in Indian Rupees (INR) or specified local currency, inclusive of applicable taxes.',
        'Athlon facilitates payment gateway collection for organizers. Refund policies for cancelled entries or tournament postponement are determined by the individual organizer’s published tournament guidelines.',
        'In the event an organizer cancels an entire tournament prior to fixture generation, participants are entitled to a refund in accordance with the payment gateway timeline and terms.',
      ],
      highlights: [
        'Transparent fee structures with instant digital receipts.',
        'Refund eligibility is subject to organizer policies prior to bracket generation.',
      ],
    },
    {
      id: 'conduct',
      title: '6. Code of Conduct & Fair Play',
      icon: AlertTriangle,
      badge: 'Integrity',
      summary: 'Preserving sportsmanship, integrity, and safety across all sporting disciplines.',
      content: [
        'Athlon promotes the highest standards of sportsmanship, respect, and fair play across Badminton, Tennis, Cricket, Football, Volleyball, and all supported disciplines.',
        'Users shall not participate in match-fixing, intentional score manipulation, harassment of athletes or officials, abusive comments on public score streams, or unauthorized automated scraping of platform data.',
        'Organizers and players violating fair play standards will be permanently banned from organizing or competing on the Athlon platform.',
      ],
      highlights: [
        'Match-fixing, harassment, and official tampering result in immediate ban.',
        'High standards of sportsmanship mandatory on and off the court.',
      ],
    },
    {
      id: 'intellectual-property',
      title: '7. Intellectual Property',
      icon: Lock,
      badge: 'Proprietary',
      summary: 'Ownership of algorithms, graphics, and tournament software engines.',
      content: [
        'All intellectual property rights in the Athlon software, bracket algorithms, match score overlays, visual themes, branding, and logos are exclusively owned by Athlon Sports.',
        'Users are granted a limited, non-exclusive, revocable license to access the platform for tournament management and sports participation.',
      ],
      highlights: [
        'Athlon branding, draw engines, and software are proprietary assets.',
      ],
    },
    {
      id: 'disclaimers',
      title: '8. Disclaimers & Limitation of Liability',
      icon: ShieldAlert,
      badge: 'Liability',
      summary: 'Service availability disclosures and physical sports liability boundaries.',
      content: [
        'Athlon software is provided on an "as-is" and "as-available" basis without warranties of uninterrupted uptime during third-party internet or power outages at tournament venues.',
        'Athlon is not liable for physical sports injuries, accidents, equipment damages, or travel expenses incurred by participants while attending or traveling to tournaments.',
      ],
      highlights: [
        'Participants engage in physical sports at their own risk.',
        'Athlon is not responsible for venue-level physical occurrences.',
      ],
    },
    {
      id: 'contact',
      title: '9. Contact & Support',
      icon: HelpCircle,
      badge: 'Help Desk',
      summary: 'Direct support channels for legal, organizer, and participant assistance.',
      content: [
        'For inquiries regarding these Terms and Conditions or to report a platform grievance, please reach out to our dedicated operations team.',
      ],
      highlights: [
        'Prompt grievance resolution within standard business hours.',
      ],
    },
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.content.some((c) => c.toLowerCase().includes(q)) ||
        sec.highlights?.some((h) => h.toLowerCase().includes(q))
    );
  }, [sections, searchQuery]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black">
      {/* ── CLEAN TOP HEADER BAR ────────────────────────────────────────── */}
      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-30" style={{ borderColor: 'var(--athlon-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all py-2 px-3 rounded-xl border border-foreground/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Segmented Switcher Pill */}
          <div className="flex items-center p-1 bg-surface border border-foreground/10 rounded-xl">
            <Link
              href="/terms"
              className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground shadow-sm transition-all"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-foreground/60 hover:text-foreground transition-all"
            >
              Privacy
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="border-b bg-card" style={{ borderColor: 'var(--athlon-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              <Scale className="w-3.5 h-3.5" />
              <span>Legal Guidelines &amp; Operational Rules</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Terms &amp; Conditions
            </h1>

            <p className="text-sm sm:text-base text-foreground/65 leading-relaxed">
              These terms govern the use of the Athlon Sports platform, tournament bracket engines, live umpire scoring tools, player registrations, and club management software.
            </p>

            {/* Quick Search */}
            <div className="pt-2 max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clauses (e.g. refunds, scoring, rules)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-primary transition-all bg-surface placeholder:text-foreground/30 shadow-inner"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Table of Contents (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
            <div
              className="p-5 rounded-2xl border shadow-sm space-y-2 bg-card"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  Clauses Overview
                </span>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  {sections.length} Sections
                </span>
              </div>

              <nav className="space-y-1">
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-black shadow-sm'
                          : 'text-foreground/70 hover:text-foreground hover:bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                        <span className="truncate">{sec.title}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 opacity-50 ${isActive ? 'translate-x-0.5' : ''}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Support Card */}
            <div
              className="p-5 rounded-2xl border shadow-sm space-y-3 bg-surface"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                Athlon Grievance Desk
              </span>
              <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                Questions or official inquiries regarding sports rules and terms?
              </p>
              <div className="space-y-2 text-xs font-bold text-foreground/80 pt-1">
                <a href="mailto:admin@athlon.com" className="flex items-center gap-2 text-primary hover:underline">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>admin@athlon.com</span>
                </a>
                <a href="tel:+918891704026" className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>+91 8891704026</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Detailed Content Cards */}
          <main className="lg:col-span-8 space-y-6">
            {filteredSections.length === 0 ? (
              <div
                className="p-12 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center space-y-3 bg-card"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <Search className="w-8 h-8 text-foreground/30" />
                <h4 className="text-sm font-black text-foreground">No matching clauses found</h4>
                <p className="text-xs text-foreground/50">Try searching for keywords like &quot;refund&quot;, &quot;scoring&quot;, or &quot;draws&quot;.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <article
                    key={sec.id}
                    id={sec.id}
                    className="p-6 sm:p-7 rounded-2xl border shadow-sm space-y-4 scroll-mt-24 bg-card transition-all hover:border-foreground/20"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-foreground/5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-black text-foreground">{sec.title}</h2>
                          <p className="text-xs text-foreground/50 font-medium">{sec.summary}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-surface border border-foreground/10 text-foreground/60 shrink-0 hidden sm:inline-block">
                        {sec.badge}
                      </span>
                    </div>

                    {/* Body Paragraphs */}
                    <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed space-y-2.5 font-normal">
                      {sec.content.map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>

                    {/* Key Highlights Pill Box */}
                    {sec.highlights && sec.highlights.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-surface border border-foreground/5 space-y-2 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                          Key Takeaways:
                        </span>
                        <ul className="space-y-1.5 pl-1">
                          {sec.highlights.map((h, hIdx) => (
                            <li key={hIdx} className="flex items-start gap-2 text-foreground/70 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                );
              })
            )}

            {/* Bottom Support Banner */}
            <div className="p-6 rounded-2xl border bg-card space-y-3" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-foreground">Need clarification on tournament rules?</h3>
                  <p className="text-xs text-foreground/60 font-medium">Our support team assists organizers and athletes with rules and dispute compliance.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href="mailto:admin@athlon.com"
                  className="p-3.5 rounded-xl bg-surface border border-foreground/10 flex items-center gap-3 hover:border-primary/40 transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50">Direct Email</div>
                    <div className="text-xs font-bold text-foreground">admin@athlon.com</div>
                  </div>
                </a>

                <a
                  href="tel:+918891704026"
                  className="p-3.5 rounded-xl bg-surface border border-foreground/10 flex items-center gap-3 hover:border-primary/40 transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50">Helpline</div>
                    <div className="text-xs font-bold text-foreground">+91 8891704026</div>
                  </div>
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
