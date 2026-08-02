'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'For organizers', href: '#organizers' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isScrolled ? 'bg-(--surface)/90 backdrop-blur-md border-b border-(--border)' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/athlon-logo-3.png" alt="Athlon Logo" width={100} height={28} className="object-contain w-auto h-10" priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-(--text-muted) hover:text-(--primary) transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth/CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-(--text) hover:text-(--primary) px-4 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-bold bg-(--primary) text-[#173404] px-5 py-2.5 rounded-(--radius-pill) hover:opacity-90 active:scale-95 transition-all"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-(--text) p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 bg-(--surface) border-b border-(--border) shadow-xl md:hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-(--text) hover:text-(--primary)"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-(--border) my-4" />
              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center font-semibold text-(--text) py-3 rounded-(--radius-card) border border-(--border)"
                >
                  Log in
                </Link>
                <Link
                  href="#pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center font-bold bg-(--primary) text-[#173404] py-3 rounded-(--radius-card)"
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
