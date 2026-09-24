'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthCard } from './AuthCard';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
  redirectUrl,
}: AuthModalProps) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-5 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container with Unified AuthCard */}
          <AuthCard
            defaultMode={defaultMode}
            onClose={onClose}
            onSuccess={onSuccess}
            redirectUrl={redirectUrl}
            isModal={true}
            showCloseButton={true}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
