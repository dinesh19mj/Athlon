import React from 'react';
import Image from 'next/image';

export function BadmintonIcon({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image 
        src="/shuttle.png" 
        alt="Badminton" 
        fill
        className="object-contain"
      />
    </div>
  );
}
