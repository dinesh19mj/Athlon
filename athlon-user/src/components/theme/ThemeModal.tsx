'use client';

import React from 'react';
import { Modal } from 'antd';
import { ThemeSelector } from './ThemeSelector';
import { Palette, X } from 'lucide-react';

interface ThemeModalProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeModal({ open, onClose }: ThemeModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
      className="athlon-theme-modal"
      styles={{
        body: {
          backgroundColor: 'transparent',
          padding: 0,
        },
        header: {
          backgroundColor: 'transparent',
          marginBottom: 20,
        },
      }}
      title={
        <div className="flex items-center gap-2.5 text-lg font-black text-foreground">
          <Palette className="w-5 h-5 text-primary" />
          <span>Appearance & Accent Theme</span>
        </div>
      }
    >
      <div className="pt-2">
        <ThemeSelector />
      </div>
    </Modal>
  );
}
