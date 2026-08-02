import React from 'react';

export const FootballIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 12l3-2.5-1.5-4h-3L9 9.5 12 12z" />
    <path d="M15 9.5l4 1.5M12 12l1 4.5M9 9.5L5 11M13 16.5l3.5 1.5M12 22l-1-5.5M5 11l2 5.5M13.5 5.5L16 3M7 7.5L5 4" />
  </svg>
);

export const CricketIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 19.5L9.5 14.5L13.5 18.5L8.5 23.5L4.5 19.5Z" fill="currentColor" stroke="none" fillOpacity="0.3" />
    <path d="M9.5 14.5L17.5 6.5C18.5 5.5 19 4 19 4C19 4 17.5 4.5 16.5 5.5L8.5 13.5" />
    <path d="M18.5 2.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill="currentColor" />
    <circle cx="17.5" cy="15.5" r="2.5" />
    <path d="M7 17L4 20" />
    <path d="M11.5 11.5L14 9" />
  </svg>
);

export const VolleyballIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 5.5 8M12 2a15.3 15.3 0 0 0-5.5 8M17.5 10c-3-1.5-6.5-1.5-9.5 0M21.5 15c-3 1.5-7 1.5-10 0M5 14.5c3 1.5 7 1.5 10 0M12 22a15.3 15.3 0 0 0 5.5-8M12 22a15.3 15.3 0 0 1-5.5-8" />
  </svg>
);
