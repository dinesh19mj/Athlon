'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  Eye,
  ShieldCheck,
  Smartphone,
  Database,
  Globe,
  Bell,
  Trash2,
  HelpCircle,
  CheckCircle2,
  Mail,
  Phone,
  Search,
  ChevronRight,
  Server,
  UserCheck,
  Award,
  Zap,
  Check,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('information-collected');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'information-collected',
      title: '1. Information We Collect',
      icon: Database,
      badge: 'Data Types',
      summary: 'Athlete profile data, mobile authentication numbers, and tournament registration details.',
      content: [
        'Athlon collects personal and athletic information necessary to deliver tournament fixtures, accurate bracket generation, umpire live scoring, and sports club management.',
        'We collect details when you register an account, enroll in tournaments, create athlete pairs for doubles formats, or manage an organization roster.',
      ],
      dataCards: [
        {
          icon: Smartphone,
          title: 'Account & Identity Data',
          desc: 'Mobile phone number (for OTP verification), full name, profile avatar, city, district, and state.',
        },
        {
          icon: Award,
          title: 'Athletic Records',
          desc: 'Sport disciplines (Badminton, Tennis, Cricket, etc.), skill category tier, seeded rankings, match results, and win/loss statistics.',
        },
        {
          icon: Server,
          title: 'Device & Session Info',
          desc: 'IP address, browser type, device identifiers, and token sessions required to prevent unauthorized account access.',
        },
      ],
      highlights: [
        'Authenticated mobile number serves as the primary secure login credential.',
        'Athletic histories are archived to power verified player career statistics.',
      ],
    },
    {
      id: 'how-we-use',
      title: '2. How We Use Information',
      icon: Eye,
      badge: 'Processing',
      summary: 'Automating tournament brackets, umpire scoring consoles, and notifications.',
      content: [
        'We process your data strictly to facilitate athletic competitions, verify athlete eligibility in category-restricted tournaments, and keep sports fixtures operating seamlessly.',
      ],
      highlights: [
        'Generating tournament brackets, pools, and seeding tables.',
        'Verifying player telephone numbers for team and doubles pair authenticity.',
        'Broadcasting real-time match scores to court displays and digital stream overlays.',
        'Delivering court calls, match schedule changes, and opponent alerts.',
      ],
    },
    {
      id: 'data-sharing',
      title: '3. Data Sharing & Public Visibility',
      icon: Globe,
      badge: 'Transparency',
      summary: 'Understanding public match data versus strictly confidential athlete information.',
      content: [
        'Athlon operates open sports tournaments where spectator access and live scoring are integral to the athletic experience.',
        'We clearly differentiate between public tournament records and strictly private personal credentials.',
      ],
      comparison: {
        publicTitle: 'Public on Match Brackets',
        publicItems: [
          'Athlete full name & display nickname',
          'Registered club, academy, or team affiliation',
          'Live match scorelines, set points, & stage outcomes',
          'Public tournament ranking & draw position',
        ],
        privateTitle: 'Strictly Confidential & Never Public',
        privateItems: [
          'Personal mobile phone number',
          'Private email address',
          'Payment gateway transaction records',
          'Internal OTPs and cryptographic auth tokens',
        ],
      },
    },
    {
      id: 'security',
      title: '4. Security & Cryptography',
      icon: Lock,
      badge: 'Security',
      summary: 'Microservice encryption, JWT authentication, and organization data isolation.',
      content: [
        'Athlon employs enterprise-grade security across our microservices architecture, including the Auth Service, Identity Service, and Tournament Service.',
        'All data in transit is encrypted using modern TLS/SSL cryptographic protocols. Passwords and OTP verification sequences are protected against replay attacks.',
      ],
      highlights: [
        'Stateless JWT token authentication with server-side validation.',
        'Role-Based Access Control (RBAC) ensuring organization admins access only their authorized clubs.',
        'Continuous vulnerability scanning and automated API perimeter protections.',
      ],
    },
    {
      id: 'notifications',
      title: '5. Match Alerts & Communications',
      icon: Bell,
      badge: 'Alerts',
      summary: 'Essential tournament court calls, schedule shifts, and communication preferences.',
      content: [
        'Athlon sends transactional communications necessary for tournament execution, such as court call announcements, match schedule updates, and registration confirmations.',
        'We do not send unsolicited marketing spam or share your contact number with third-party telemarketers.',
      ],
      highlights: [
        'Time-critical court assignments delivered via platform notifications and SMS.',
        'Instant confirmation of tournament entries and payment receipts.',
      ],
    },
    {
      id: 'user-rights',
      title: '6. Your Rights & Data Erasure',
      icon: UserCheck,
      badge: 'User Rights',
      summary: 'Self-service profile updates, data portability, and permanent account erasure.',
      content: [
        'You retain full ownership and control over your personal information. You can review, update, or correct your personal profile information at any time directly through the Athlon user dashboard.',
        'To request permanent account erasure or to export your athletic records, submit a formal request to our privacy desk at admin@athlon.com.',
      ],
      highlights: [
        'Instant self-service editing of name, location, and preferred sports in your Profile.',
        'Right to request complete account deletion and anonymization of personal credentials.',
      ],
    },
    {
      id: 'retention',
      title: '7. Data Retention & Cookies',
      icon: Server,
      badge: 'Retention',
      summary: 'Session token persistence, theme configurations, and data lifecycle.',
      content: [
        'Athlon uses lightweight local storage and HTTP cookies strictly to maintain user authentication sessions, active organization switching, and dark/light UI preferences.',
        'We retain match records and tournament draw histories to preserve historical sports statistics and player achievement records.',
      ],
      highlights: [
        'No invasive third-party tracking or behavioral advertising cookies.',
        'Local storage utilized solely for seamless application functionality.',
      ],
    },
    {
      id: 'contact',
      title: '8. Privacy Officer & Inquiries',
      icon: HelpCircle,
      badge: 'Support Desk',
      summary: 'Direct communication channels for privacy concerns, data inquiries, and grievance redressal.',
      content: [
        'If you have questions about our data practices, want to exercise your privacy rights, or need assistance regarding your profile information, contact our Data Protection Team.',
      ],
      highlights: [
        'Direct email assistance for all privacy requests within 24-48 business hours.',
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
        sec.highlights?.some((h) => h.toLowerCase().includes(q)) ||
        sec.dataCards?.some((d) => d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q))
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
      <header className="border-b bg-card/70 backdrop-blur-md sticky top-0 z-30" style={{ borderColor: 'var(--athlon-border)' }}>
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
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-foreground/60 hover:text-foreground transition-all"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground shadow-sm transition-all"
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
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Data Protection &amp; Privacy Policy</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Privacy Policy
            </h1>

            <p className="text-sm sm:text-base text-foreground/65 leading-relaxed">
              At Athlon Sports, we respect your privacy and protect your personal and athletic data. Learn how we handle your information across tournaments, leagues, and profile systems.
            </p>

            {/* Quick Search */}
            <div className="pt-2 max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search privacy topics (e.g. phone number, erasure, security)..."
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
                  Policy Sections
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

            {/* Privacy Commitment Card */}
            <div
              className="p-5 rounded-2xl border shadow-sm space-y-3 bg-surface"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Our Privacy Promise</span>
              </div>
              <p className="text-xs text-foreground/65 leading-relaxed font-medium">
                We never monetize your private phone numbers or athlete records to third-party ad brokers or data sellers.
              </p>
            </div>

            {/* Support Card */}
            <div
              className="p-5 rounded-2xl border shadow-sm space-y-3 bg-card"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50 block">
                Privacy Inquiries
              </span>
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
                <h4 className="text-sm font-black text-foreground">No matching privacy topics found</h4>
                <p className="text-xs text-foreground/50">Try searching for keywords like &quot;phone&quot;, &quot;cookies&quot;, or &quot;erasure&quot;.</p>
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

                    {/* Data Cards Grid if present */}
                    {sec.dataCards && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        {sec.dataCards.map((card, cIdx) => {
                          const CardIcon = card.icon;
                          return (
                            <div key={cIdx} className="p-3.5 rounded-xl bg-surface border border-foreground/5 space-y-1.5">
                              <div className="flex items-center gap-2 text-foreground font-black text-xs">
                                <CardIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{card.title}</span>
                              </div>
                              <p className="text-[11px] text-foreground/60 leading-relaxed">
                                {card.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Public vs Private Comparison Grid if present */}
                    {sec.comparison && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-4 rounded-xl bg-surface border border-foreground/10 space-y-2">
                          <div className="text-xs font-black text-foreground flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-blue-400" />
                            <span>{sec.comparison.publicTitle}</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-foreground/70">
                            {sec.comparison.publicItems.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-xl bg-surface border border-foreground/10 space-y-2">
                          <div className="text-xs font-black text-foreground flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{sec.comparison.privateTitle}</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-foreground/70">
                            {sec.comparison.privateItems.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Key Highlights Pill Box */}
                    {sec.highlights && sec.highlights.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-surface border border-foreground/5 space-y-2 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                          Key Points:
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
                  <h3 className="text-sm sm:text-base font-black text-foreground">Have questions about your data?</h3>
                  <p className="text-xs text-foreground/60 font-medium">Our privacy and data protection team is ready to assist you.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href="mailto:admin@athlon.com"
                  className="p-3.5 rounded-xl bg-surface border border-foreground/10 flex items-center gap-3 hover:border-primary/40 transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50">Privacy Team</div>
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
