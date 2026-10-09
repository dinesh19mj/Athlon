'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Users,
  User,
  ArrowLeft,
  X,
  AlertCircle,
  Trophy,
  Pencil,
  Star,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { SportMetadataService, SportMetadata } from '@/lib/api/tournaments';

// Default initial sports catalog for graceful fallback & rapid onboarding
const DEFAULT_FALLBACK_SPORTS: SportMetadata[] = [
  {
    sportId: 1,
    sportUuid: 'badminton-default-uuid',
    sportName: 'Badminton',
    sportCode: 'BADMINTON',
    emoji: '🏸',
    isTeamSport: false,
    supportsMultiCategory: true,
    defaultFormat: "Men's Singles",
    defaultCategory: 'Open Men Singles',
    categoryPresets: ["Men's Singles", "Women's Singles", "Men's Doubles", "Mixed Doubles"],
    formats: [
      { formatId: 101, formatUuid: 'f101', sportType: 'Badminton', formatName: "Men's Singles", playersPerSide: 1, isTeamFormat: false, displayOrder: 1 },
      { formatId: 102, formatUuid: 'f102', sportType: 'Badminton', formatName: 'Open Doubles', playersPerSide: 2, isTeamFormat: false, displayOrder: 2 },
      { formatId: 103, formatUuid: 'f103', sportType: 'Badminton', formatName: 'KNOCKOUT', playersPerSide: 1, isTeamFormat: false, displayOrder: 3 },
    ],
    displayOrder: 1,
    isActive: true,
  },
  {
    sportId: 2,
    sportUuid: 'cricket-default-uuid',
    sportName: 'Cricket',
    sportCode: 'CRICKET',
    emoji: '🏏',
    isTeamSport: true,
    supportsMultiCategory: true,
    defaultFormat: 'T20 Match (11-a-side)',
    defaultCategory: 'Open League',
    categoryPresets: ['T20 Open', 'Box Cricket', 'Corporate League', 'U-19 Cup'],
    formats: [
      { formatId: 201, formatUuid: 'f201', sportType: 'Cricket', formatName: 'T20 Match (11-a-side)', playersPerSide: 11, isTeamFormat: true, displayOrder: 1 },
      { formatId: 202, formatUuid: 'f202', sportType: 'Cricket', formatName: 'Box Cricket (6-a-side)', playersPerSide: 6, isTeamFormat: true, displayOrder: 2 },
      { formatId: 203, formatUuid: 'f203', sportType: 'Cricket', formatName: 'LEAGUE', playersPerSide: 11, isTeamFormat: true, displayOrder: 3 },
    ],
    displayOrder: 2,
    isActive: true,
  },
  {
    sportId: 3,
    sportUuid: 'football-default-uuid',
    sportName: 'Football',
    sportCode: 'FOOTBALL',
    emoji: '⚽',
    isTeamSport: true,
    supportsMultiCategory: true,
    defaultFormat: '7v7 Championship',
    defaultCategory: 'Men Open 7v7',
    categoryPresets: ['Open Men', 'Veterans 35+', 'U-17 Juniors', 'Futsal 5v5'],
    formats: [
      { formatId: 301, formatUuid: 'f301', sportType: 'Football', formatName: '7v7 Championship', playersPerSide: 7, isTeamFormat: true, displayOrder: 1 },
      { formatId: 302, formatUuid: 'f302', sportType: 'Football', formatName: '11v11 Full Match', playersPerSide: 11, isTeamFormat: true, displayOrder: 2 },
      { formatId: 303, formatUuid: 'f303', sportType: 'Football', formatName: 'Futsal 5v5', playersPerSide: 5, isTeamFormat: true, displayOrder: 3 },
    ],
    displayOrder: 3,
    isActive: true,
  },
  {
    sportId: 4,
    sportUuid: 'tennis-default-uuid',
    sportName: 'Tennis',
    sportCode: 'TENNIS',
    emoji: '🎾',
    isTeamSport: false,
    supportsMultiCategory: true,
    defaultFormat: "Men's Singles",
    defaultCategory: 'Men Singles Open',
    categoryPresets: ["Men's Singles", "Women's Singles", "Men's Doubles"],
    formats: [
      { formatId: 401, formatUuid: 'f401', sportType: 'Tennis', formatName: "Men's Singles", playersPerSide: 1, isTeamFormat: false, displayOrder: 1 },
      { formatId: 402, formatUuid: 'f402', sportType: 'Tennis', formatName: 'Open Doubles', playersPerSide: 2, isTeamFormat: false, displayOrder: 2 },
      { formatId: 403, formatUuid: 'f403', sportType: 'Tennis', formatName: 'BEST_OF_3_SETS', playersPerSide: 1, isTeamFormat: false, displayOrder: 3 },
    ],
    displayOrder: 4,
    isActive: true,
  },
  {
    sportId: 5,
    sportUuid: 'pickleball-default-uuid',
    sportName: 'Pickleball',
    sportCode: 'PICKLEBALL',
    emoji: '🏓',
    isTeamSport: false,
    supportsMultiCategory: true,
    defaultFormat: 'Open Doubles',
    defaultCategory: 'Open Category',
    categoryPresets: ['Men Doubles', 'Mixed Doubles', 'Singles Open'],
    formats: [
      { formatId: 501, formatUuid: 'f501', sportType: 'Pickleball', formatName: 'Open Doubles', playersPerSide: 2, isTeamFormat: false, displayOrder: 1 },
      { formatId: 502, formatUuid: 'f502', sportType: 'Pickleball', formatName: 'Singles Open', playersPerSide: 1, isTeamFormat: false, displayOrder: 2 },
    ],
    displayOrder: 5,
    isActive: true,
  },
  {
    sportId: 6,
    sportUuid: 'table-tennis-default-uuid',
    sportName: 'Table Tennis',
    sportCode: 'TABLE_TENNIS',
    emoji: '🏓',
    isTeamSport: false,
    supportsMultiCategory: true,
    defaultFormat: "Men's Singles",
    defaultCategory: 'Singles Open',
    categoryPresets: ["Men's Singles", "Women's Singles", 'Doubles Open'],
    formats: [
      { formatId: 601, formatUuid: 'f601', sportType: 'Table Tennis', formatName: "Men's Singles", playersPerSide: 1, isTeamFormat: false, displayOrder: 1 },
      { formatId: 602, formatUuid: 'f602', sportType: 'Table Tennis', formatName: 'Open Doubles', playersPerSide: 2, isTeamFormat: false, displayOrder: 2 },
    ],
    displayOrder: 6,
    isActive: true,
  },
  {
    sportId: 7,
    sportUuid: 'volleyball-default-uuid',
    sportName: 'Volleyball',
    sportCode: 'VOLLEYBALL',
    emoji: '🏐',
    isTeamSport: true,
    supportsMultiCategory: true,
    defaultFormat: '6v6 Traditional',
    defaultCategory: 'Men Open',
    categoryPresets: ['Open League', 'Corporate Cup', 'Beach Volleyball 2v2'],
    formats: [
      { formatId: 701, formatUuid: 'f701', sportType: 'Volleyball', formatName: '6v6 Traditional', playersPerSide: 6, isTeamFormat: true, displayOrder: 1 },
      { formatId: 702, formatUuid: 'f702', sportType: 'Volleyball', formatName: 'Beach 2v2', playersPerSide: 2, isTeamFormat: true, displayOrder: 2 },
    ],
    displayOrder: 7,
    isActive: true,
  },
  {
    sportId: 8,
    sportUuid: 'basketball-default-uuid',
    sportName: 'Basketball',
    sportCode: 'BASKETBALL',
    emoji: '🏀',
    isTeamSport: true,
    supportsMultiCategory: true,
    defaultFormat: '5v5 Full Court',
    defaultCategory: 'Open Men',
    categoryPresets: ['5v5 Championship', '3x3 Streetball', 'College Invitational'],
    formats: [
      { formatId: 801, formatUuid: 'f801', sportType: 'Basketball', formatName: '5v5 Full Court', playersPerSide: 5, isTeamFormat: true, displayOrder: 1 },
      { formatId: 802, formatUuid: 'f802', sportType: 'Basketball', formatName: '3x3 Half Court', playersPerSide: 3, isTeamFormat: true, displayOrder: 2 },
    ],
    displayOrder: 8,
    isActive: false,
  },
];

// Quick templates for rapid onboarding in Create mode
const POPULAR_TEMPLATES = [
  {
    name: 'Pickleball',
    code: 'PICKLEBALL',
    emoji: '🏓',
    isTeam: false,
    multiCat: true,
    defaultFormat: 'Open Doubles',
    defaultCategory: 'Open Doubles',
    categories: ['Open Doubles', 'Men Doubles', 'Mixed Doubles', 'Singles Open', 'Senior 50+'],
    formats: ['Open Doubles', 'Singles Open', 'KNOCKOUT', 'ROUND_ROBIN'],
  },
  {
    name: 'Squash',
    code: 'SQUASH',
    emoji: '🎾',
    isTeam: false,
    multiCat: true,
    defaultFormat: "Men's Singles",
    defaultCategory: 'Open Singles',
    categories: ["Men's Singles", "Women's Singles", 'Veterans 40+', 'Junior U-19'],
    formats: ["Men's Singles", 'KNOCKOUT', 'LEAGUE'],
  },
  {
    name: 'Kabaddi',
    code: 'KABADDI',
    emoji: '🤼',
    isTeam: true,
    multiCat: false,
    defaultFormat: 'Standard 7-a-side (Pro Rules)',
    defaultCategory: 'Open League',
    categories: ['Open Championship', 'Youth U-19', 'Corporate Cup'],
    formats: ['Standard 7-a-side (Pro Rules)', 'LEAGUE', 'KNOCKOUT'],
  },
  {
    name: 'Padel',
    code: 'PADEL',
    emoji: '🎾',
    isTeam: false,
    multiCat: true,
    defaultFormat: 'Doubles Championship',
    defaultCategory: 'Open Doubles',
    categories: ['Open Doubles', 'Men Doubles', 'Women Doubles', 'Mixed Doubles'],
    formats: ['Doubles Championship', 'KNOCKOUT', 'ROUND_ROBIN'],
  },
  {
    name: 'Swimming',
    code: 'SWIMMING',
    emoji: '🏊',
    isTeam: false,
    multiCat: true,
    defaultFormat: '50m Freestyle',
    defaultCategory: '50m Freestyle Open',
    categories: ['50m Freestyle', '100m Freestyle', '50m Breaststroke', '4x50m Relay', 'Masters 30+'],
    formats: ['50m Freestyle', '100m Freestyle', 'TIME_TRIAL'],
  },
  {
    name: 'Table Tennis',
    code: 'TABLE_TENNIS',
    emoji: '🏓',
    isTeam: false,
    multiCat: true,
    defaultFormat: "Men's Singles",
    defaultCategory: 'Men Singles Open',
    categories: ["Men's Singles", "Women's Singles", 'Doubles Open', 'Junior U-17'],
    formats: ["Men's Singles", 'Doubles Open', 'BEST_OF_3_SETS', 'KNOCKOUT'],
  },
];

// Suggested presets for adding dynamic categories
const SUGGESTED_CATEGORIES_SOLO = [
  "Men's Singles",
  "Women's Singles",
  "Men's Doubles",
  "Women's Doubles",
  "Mixed Doubles",
  'Junior U-15',
  'Junior U-19',
  'Veterans 35+',
  'Veterans 45+',
  'Open Category',
];

const SUGGESTED_CATEGORIES_TEAM = [
  'Open Men Championship',
  'Open Women League',
  'Corporate Cup',
  'Inter-College Invitational',
  'Veterans 35+ League',
  'Junior U-17 Trophy',
  'Amateur Division',
];

// Suggested presets for adding dynamic tournament formats
const SUGGESTED_FORMATS = [
  'KNOCKOUT',
  'LEAGUE',
  'ROUND_ROBIN',
  'GROUP_STAGE_KNOCKOUT',
  'DOUBLE_ELIMINATION',
  'BEST_OF_3_SETS',
  'SUPER_OVER',
  'TIME_TRIAL',
  'SWISS_SYSTEM',
];

export default function AdminSportsPage() {
  const [sports, setSports] = useState<SportMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TEAM' | 'INDIVIDUAL'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<SportMetadata | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sportName: '',
    sportCode: '',
    emoji: '🏆',
    isTeamSport: false,
    supportsMultiCategory: true,
    displayOrder: 10,
  });

  // Dynamic Categories State
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('');

  // Dynamic Formats State
  const [formats, setFormats] = useState<string[]>([]);
  const [newFormatInput, setNewFormatInput] = useState('');
  const [defaultFormat, setDefaultFormat] = useState('');

  // Fetch Sports from Tournament Service
  const fetchSports = async () => {
    setLoading(true);
    try {
      let list: SportMetadata[] = [];
      try {
        const res = await SportMetadataService.getAllSportsAdmin();
        const data = (res as any)?.data?.data || (res as any)?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          list = data;
        }
      } catch {
        const fallbackRes = await SportMetadataService.getAllSports();
        const data = (fallbackRes as any)?.data?.data || (fallbackRes as any)?.data || fallbackRes;
        if (Array.isArray(data) && data.length > 0) {
          list = data;
        }
      }

      const normalizeSport = (s: SportMetadata): SportMetadata => {
        const resolvedActive =
          s.isActive !== undefined
            ? Boolean(s.isActive)
            : (s as any).active !== undefined
            ? Boolean((s as any).active)
            : true;
        const resolvedTeam =
          s.isTeamSport !== undefined
            ? Boolean(s.isTeamSport)
            : (s as any).teamSport !== undefined
            ? Boolean((s as any).teamSport)
            : false;
        return {
          ...s,
          isActive: resolvedActive,
          active: resolvedActive,
          isTeamSport: resolvedTeam,
          teamSport: resolvedTeam,
        };
      };

      if (list.length > 0) {
        setSports(list.map(normalizeSport));
      } else {
        setSports(DEFAULT_FALLBACK_SPORTS.map(normalizeSport));
      }
    } catch (err) {
      console.warn('Backend sports service offline, using platform catalog fallback', err);
      setSports(DEFAULT_FALLBACK_SPORTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  // Quick Flash Notification
  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  // Open Modal for Creating a New Sport
  const handleOpenCreateModal = () => {
    setEditingSport(null);
    setFormData({
      sportName: '',
      sportCode: '',
      emoji: '🏆',
      isTeamSport: false,
      supportsMultiCategory: true,
      displayOrder: sports.length + 1,
    });
    setCategories(["Men's Singles", "Women's Singles", "Men's Doubles", "Mixed Doubles"]);
    setDefaultCategory("Men's Singles");
    setFormats(['KNOCKOUT', 'LEAGUE', 'ROUND_ROBIN']);
    setDefaultFormat('KNOCKOUT');
    setNewCategoryInput('');
    setNewFormatInput('');
    setIsModalOpen(true);
  };

  // Open Modal for Editing an Existing Sport
  const handleOpenEditModal = (sport: SportMetadata) => {
    setEditingSport(sport);
    setFormData({
      sportName: sport.sportName,
      sportCode: sport.sportCode,
      emoji: sport.emoji || '🏆',
      isTeamSport: Boolean(sport.isTeamSport),
      supportsMultiCategory: sport.supportsMultiCategory ?? true,
      displayOrder: sport.displayOrder ?? 1,
    });

    // Populate categories dynamically
    const existingCats =
      sport.categoryPresets && sport.categoryPresets.length > 0
        ? [...sport.categoryPresets]
        : sport.defaultCategory
          ? [sport.defaultCategory]
          : ["Men's Singles", "Women's Singles"];
    setCategories(existingCats);
    setDefaultCategory(sport.defaultCategory || existingCats[0] || '');

    // Populate formats dynamically
    const existingFmts =
      sport.formats && sport.formats.length > 0
        ? sport.formats.map((f) => f.formatName)
        : sport.defaultFormat
          ? [sport.defaultFormat]
          : ['KNOCKOUT', 'LEAGUE'];
    setFormats(existingFmts);
    setDefaultFormat(sport.defaultFormat || existingFmts[0] || 'KNOCKOUT');

    setNewCategoryInput('');
    setNewFormatInput('');
    setIsModalOpen(true);
  };

  // Apply Quick Template
  const applyTemplate = (tpl: (typeof POPULAR_TEMPLATES)[0]) => {
    setFormData({
      sportName: tpl.name,
      sportCode: tpl.code,
      emoji: tpl.emoji,
      isTeamSport: tpl.isTeam,
      supportsMultiCategory: tpl.multiCat,
      displayOrder: sports.length + 1,
    });
    setCategories([...tpl.categories]);
    setDefaultCategory(tpl.defaultCategory || tpl.categories[0]);
    setFormats([...tpl.formats]);
    setDefaultFormat(tpl.defaultFormat || tpl.formats[0]);
  };

  // Dynamic Category Handlers
  const handleAddCategory = (catName?: string) => {
    const target = (catName || newCategoryInput).trim();
    if (!target) return;
    if (categories.some((c) => c.toLowerCase() === target.toLowerCase())) {
      setNewCategoryInput('');
      return;
    }
    const updated = [...categories, target];
    setCategories(updated);
    if (!defaultCategory) {
      setDefaultCategory(target);
    }
    setNewCategoryInput('');
  };

  const handleRemoveCategory = (catToRemove: string) => {
    const updated = categories.filter((c) => c !== catToRemove);
    setCategories(updated);
    if (defaultCategory === catToRemove) {
      setDefaultCategory(updated[0] || '');
    }
  };

  // Dynamic Format Handlers
  const handleAddFormat = (fmtName?: string) => {
    const target = (fmtName || newFormatInput).trim();
    if (!target) return;
    if (formats.some((f) => f.toLowerCase() === target.toLowerCase())) {
      setNewFormatInput('');
      return;
    }
    const updated = [...formats, target];
    setFormats(updated);
    if (!defaultFormat) {
      setDefaultFormat(target);
    }
    setNewFormatInput('');
  };

  const handleRemoveFormat = (fmtToRemove: string) => {
    const updated = formats.filter((f) => f !== fmtToRemove);
    setFormats(updated);
    if (defaultFormat === fmtToRemove) {
      setDefaultFormat(updated[0] || '');
    }
  };

  // Toggle Sport Active / Inactive
  const handleToggleStatus = async (sport: SportMetadata) => {
    const currentActive =
      sport.isActive !== undefined
        ? Boolean(sport.isActive)
        : (sport as any).active !== undefined
        ? Boolean((sport as any).active)
        : true;
    const nextState = !currentActive;

    // Optimistic UI update
    setSports((prev) =>
      prev.map((s) =>
        s.sportUuid === sport.sportUuid || s.sportName === sport.sportName
          ? { ...s, isActive: nextState, active: nextState }
          : s
      )
    );

    try {
      if (sport.sportUuid && !sport.sportUuid.includes('default-uuid')) {
        const res = await SportMetadataService.toggleSportStatus(sport.sportUuid);
        const updated = (res as any)?.data?.data || (res as any)?.data || res;
        if (updated) {
          const serverActive =
            updated.isActive !== undefined
              ? Boolean(updated.isActive)
              : updated.active !== undefined
              ? Boolean(updated.active)
              : nextState;
          setSports((prev) =>
            prev.map((s) =>
              s.sportUuid === sport.sportUuid || s.sportName === sport.sportName
                ? { ...s, ...updated, isActive: serverActive, active: serverActive }
                : s
            )
          );
        }
      }
      showNotification(
        'success',
        `${sport.sportName} is now ${nextState ? 'ACTIVATED (Live on platform)' : 'DEACTIVATED (Hidden)'}`
      );
    } catch (err) {
      console.warn('Backend toggle call failed, kept local state', err);
      showNotification(
        'success',
        `${sport.sportName} toggled to ${nextState ? 'ACTIVE' : 'INACTIVE'} (Local State)`
      );
    }
  };

  // Save (Create or Update) Sport
  const handleSaveSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sportName.trim()) {
      showNotification('error', 'Please provide a sport name');
      return;
    }

    setSubmitting(true);
    const code = formData.sportCode.trim() || formData.sportName.toUpperCase().replace(/[\s\-_/]+/g, '_');
    const finalDefaultCat = defaultCategory || categories[0] || 'Open Category';
    const finalDefaultFmt = defaultFormat || formats[0] || 'Standard Match';

    const payload = {
      sportName: formData.sportName.trim(),
      sportCode: code,
      emoji: formData.emoji.trim() || '🏆',
      isTeamSport: formData.isTeamSport ? 1 : 0,
      supportsMultiCategory: formData.supportsMultiCategory ? 1 : 0,
      defaultFormat: finalDefaultFmt,
      defaultCategory: finalDefaultCat,
      categoryPresets: categories,
      formats: formats,
      displayOrder: Number(formData.displayOrder) || sports.length + 1,
    };

    if (editingSport) {
      // ──────────────────────────────────────────
      // EDIT MODE
      // ──────────────────────────────────────────
      try {
        let updatedFromBackend: SportMetadata | null = null;
        if (editingSport.sportUuid && !editingSport.sportUuid.includes('default-uuid')) {
          const res = await SportMetadataService.updateSport(editingSport.sportUuid, payload);
          updatedFromBackend = (res as any)?.data?.data || (res as any)?.data || null;
        }

        setSports((prev) =>
          prev.map((s) => {
            if (s.sportUuid === editingSport.sportUuid || s.sportName === editingSport.sportName) {
              if (updatedFromBackend) {
                return { ...updatedFromBackend, isActive: s.isActive };
              }
              return {
                ...s,
                sportName: payload.sportName,
                sportCode: payload.sportCode,
                emoji: payload.emoji,
                isTeamSport: formData.isTeamSport,
                supportsMultiCategory: formData.supportsMultiCategory,
                defaultFormat: payload.defaultFormat,
                defaultCategory: payload.defaultCategory,
                categoryPresets: categories,
                formats: formats.map((fmtName, idx) => ({
                  formatId: idx + 1,
                  formatUuid: `fmt-${idx + 1}`,
                  sportType: payload.sportName,
                  formatName: fmtName,
                  playersPerSide: formData.isTeamSport ? 11 : 1,
                  isTeamFormat: formData.isTeamSport,
                  displayOrder: idx + 1,
                })),
                displayOrder: payload.displayOrder,
              };
            }
            return s;
          })
        );

        showNotification('success', `Sport "${payload.sportName}" updated successfully!`);
        setIsModalOpen(false);
      } catch (err) {
        console.warn('Backend update failed, updating local state', err);
        setSports((prev) =>
          prev.map((s) => {
            if (s.sportUuid === editingSport.sportUuid || s.sportName === editingSport.sportName) {
              return {
                ...s,
                sportName: payload.sportName,
                sportCode: payload.sportCode,
                emoji: payload.emoji,
                isTeamSport: formData.isTeamSport,
                supportsMultiCategory: formData.supportsMultiCategory,
                defaultFormat: payload.defaultFormat,
                defaultCategory: payload.defaultCategory,
                categoryPresets: categories,
                formats: formats.map((fmtName, idx) => ({
                  formatId: idx + 1,
                  formatUuid: `fmt-${idx + 1}`,
                  sportType: payload.sportName,
                  formatName: fmtName,
                  playersPerSide: formData.isTeamSport ? 11 : 1,
                  isTeamFormat: formData.isTeamSport,
                  displayOrder: idx + 1,
                })),
                displayOrder: payload.displayOrder,
              };
            }
            return s;
          })
        );
        showNotification('success', `Sport "${payload.sportName}" updated!`);
        setIsModalOpen(false);
      } finally {
        setSubmitting(false);
      }
    } else {
      // ──────────────────────────────────────────
      // CREATE MODE
      // ──────────────────────────────────────────
      try {
        const res = await SportMetadataService.createSport({
          ...payload,
          isActive: true,
        });
        const created = (res as any)?.data?.data || (res as any)?.data || {
          ...payload,
          sportId: Date.now(),
          sportUuid: `sport-${Date.now()}`,
          isTeamSport: formData.isTeamSport,
          supportsMultiCategory: formData.supportsMultiCategory,
          isActive: true,
          formats: formats.map((f, i) => ({
            formatId: i + 1,
            formatUuid: `f-${Date.now()}-${i}`,
            sportType: payload.sportName,
            formatName: f,
            playersPerSide: formData.isTeamSport ? 11 : 1,
            isTeamFormat: formData.isTeamSport,
            displayOrder: i + 1,
          })),
        };

        setSports((prev) => [...prev, created]);
        showNotification('success', `Sport "${payload.sportName}" created and activated!`);
        setIsModalOpen(false);
      } catch (err) {
        console.warn('Backend creation failed, appending locally', err);
        const mockCreated: SportMetadata = {
          sportId: Date.now(),
          sportUuid: `sport-${Date.now()}`,
          sportName: payload.sportName,
          sportCode: payload.sportCode,
          emoji: payload.emoji,
          isTeamSport: formData.isTeamSport,
          supportsMultiCategory: formData.supportsMultiCategory,
          defaultFormat: payload.defaultFormat,
          defaultCategory: payload.defaultCategory,
          categoryPresets: categories,
          formats: formats.map((f, i) => ({
            formatId: i + 1,
            formatUuid: `f-${Date.now()}-${i}`,
            sportType: payload.sportName,
            formatName: f,
            playersPerSide: formData.isTeamSport ? 11 : 1,
            isTeamFormat: formData.isTeamSport,
            displayOrder: i + 1,
          })),
          displayOrder: payload.displayOrder,
          isActive: true,
        };
        setSports((prev) => [...prev, mockCreated]);
        showNotification('success', `Sport "${payload.sportName}" added to catalog!`);
        setIsModalOpen(false);
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Filtered List
  const filteredSports = sports.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.sportName.toLowerCase().includes(q) ||
      s.sportCode.toLowerCase().includes(q) ||
      (s.defaultFormat && s.defaultFormat.toLowerCase().includes(q)) ||
      (s.categoryPresets && s.categoryPresets.some((c) => c.toLowerCase().includes(q)));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && s.isActive !== false) ||
      (statusFilter === 'INACTIVE' && s.isActive === false);

    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'TEAM' && s.isTeamSport) ||
      (typeFilter === 'INDIVIDUAL' && !s.isTeamSport);

    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = sports.filter((s) => s.isActive !== false).length;
  const inactiveCount = sports.length - activeCount;
  const teamCount = sports.filter((s) => s.isTeamSport).length;

  return (
    <div>
      {/* Toast Notification Banner */}
      {statusMessage && (
        <div
          className={`mb-4 p-3 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span className="text-xs font-bold leading-tight">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 rounded-lg hover:bg-black/20 text-current opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE VIEW (max-width: md) — WORKSPACE DESIGN LANGUAGE
          Compact, stylish, touch-first with high visual appeal
          ───────────────────────────────────────────────────────────── */}
      <div className="block md:hidden space-y-3.5 pb-24">
        {/* 1. Mobile Compact Header Bar */}
        <div className="flex items-center justify-between px-0.5 pt-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/admin"
              className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-xs shrink-0"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Back to Admin"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <h1
                  className="text-base font-black uppercase tracking-tight truncate leading-none"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Sports Catalog
                </h1>
                <span
                  className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md border shrink-0"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  {sports.length}
                </span>
              </div>
              <p
                className="text-[9.5px] truncate mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={fetchSports}
              disabled={loading}
              className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-xs disabled:opacity-50"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Sync Catalog"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            </button>
          </div>
        </div>

        {/* 2. Micro-KPI Strip (Single Row 4-stat bar) */}
        <div
          className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex flex-col items-center justify-center text-center py-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
              Total
            </span>
            <span className="text-base font-black font-mono leading-tight mt-0.5" style={{ color: 'var(--athlon-text)' }}>
              {sports.length}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center py-0.5 border-l" style={{ borderColor: 'var(--athlon-border)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
              Live
            </span>
            <span className="text-base font-black font-mono leading-tight mt-0.5 text-emerald-400">
              {activeCount}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center py-0.5 border-l" style={{ borderColor: 'var(--athlon-border)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
              Off
            </span>
            <span className="text-base font-black font-mono leading-tight mt-0.5 text-amber-400">
              {inactiveCount}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center py-0.5 border-l" style={{ borderColor: 'var(--athlon-border)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400">
              Team
            </span>
            <span className="text-base font-black font-mono leading-tight mt-0.5 text-blue-400">
              {teamCount}
            </span>
          </div>
        </div>

        {/* 3. Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sports, formats, or categories..."
            className="w-full pl-8 pr-7 py-2 rounded-xl text-xs border transition-all focus:outline-none focus:ring-1 focus:ring-primary"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 4. Horizontal Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
          {[
            { id: 'ALL', label: 'All Sports' },
            { id: 'ACTIVE', label: `Active (${activeCount})` },
            { id: 'INACTIVE', label: `Inactive (${inactiveCount})` },
            { id: 'INDIVIDUAL', label: 'Solo / Doubles' },
            { id: 'TEAM', label: 'Team Sports' },
          ].map((pill) => {
            const isSelected =
              pill.id === 'ALL'
                ? statusFilter === 'ALL' && typeFilter === 'ALL'
                : pill.id === 'ACTIVE'
                  ? statusFilter === 'ACTIVE'
                  : pill.id === 'INACTIVE'
                    ? statusFilter === 'INACTIVE'
                    : pill.id === 'INDIVIDUAL'
                      ? typeFilter === 'INDIVIDUAL'
                      : typeFilter === 'TEAM';

            return (
              <button
                key={pill.id}
                onClick={() => {
                  if (pill.id === 'ALL') {
                    setStatusFilter('ALL');
                    setTypeFilter('ALL');
                  } else if (pill.id === 'ACTIVE' || pill.id === 'INACTIVE') {
                    setStatusFilter(pill.id);
                    setTypeFilter('ALL');
                  } else if (pill.id === 'INDIVIDUAL' || pill.id === 'TEAM') {
                    setTypeFilter(pill.id);
                    setStatusFilter('ALL');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold whitespace-nowrap transition-all border shrink-0 active:scale-95 ${isSelected
                    ? 'bg-primary text-black font-black border-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
                style={{
                  backgroundColor: isSelected ? undefined : 'var(--athlon-surface)',
                  borderColor: isSelected ? undefined : 'var(--athlon-border)',
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* 5. Mobile Cards List */}
        {filteredSports.length === 0 ? (
          <div
            className="p-8 rounded-2xl border text-center space-y-2.5"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--athlon-text)' }}>
              No Sports Match Filters
            </h3>
            <p className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>
              Try adjusting search terms or clear filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="text-[11px] font-bold text-primary hover:underline uppercase"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSports.map((sport) => {
              const isActive = sport.isActive !== false;
              const formatList = sport.formats && sport.formats.length > 0 ? sport.formats.map((f) => f.formatName) : [];

              return (
                <div
                  key={sport.sportUuid || sport.sportName}
                  className="rounded-2xl border p-3 space-y-2.5 transition-all shadow-xs relative overflow-hidden active:scale-[0.99]"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: isActive ? 'var(--athlon-border)' : 'rgba(245, 158, 11, 0.3)',
                    opacity: isActive ? 1 : 0.8,
                  }}
                >
                  {/* Glowing Top Accent Line */}
                  <div
                    className={`absolute top-0 inset-x-0 h-0.5 ${isActive ? 'bg-gradient-to-r from-emerald-500 via-primary to-teal-400' : 'bg-amber-500/50'
                      }`}
                  />

                  {/* Header: Emoji Badge + Title & Code + Edit Button & iOS Toggle Switch */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 shadow-xs"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        {sport.emoji || '🏆'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-sm font-black tracking-tight truncate leading-tight"
                            style={{ color: 'var(--athlon-text)' }}
                          >
                            {sport.sportName}
                          </span>
                          <span
                            className="text-[8.5px] font-mono font-bold uppercase px-1 py-0.2 rounded border shrink-0"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                              color: 'var(--athlon-text-muted)',
                            }}
                          >
                            {sport.sportCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] mt-0.5" style={{ color: 'var(--athlon-text-muted)' }}>
                          {sport.isTeamSport ? (
                            <span className="flex items-center gap-0.5 text-blue-400 font-semibold">
                              <Users className="w-2.5 h-2.5" /> Team
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                              <User className="w-2.5 h-2.5" /> Solo/Doubles
                            </span>
                          )}
                          <span>•</span>
                          <span>#{sport.displayOrder ?? 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(sport)}
                        className="px-2 py-1 rounded-lg border text-[10.5px] font-bold flex items-center gap-1 transition-all active:scale-95 hover:border-primary"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text)',
                        }}
                        title="Edit sport, categories & formats"
                      >
                        <Pencil className="w-3 h-3 text-primary" />
                        <span>Edit</span>
                      </button>

                      {/* iOS Style Interactive Toggle Switch */}
                      <button
                        onClick={() => handleToggleStatus(sport)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner ${isActive ? 'bg-emerald-500' : 'bg-zinc-700/60'
                          }`}
                        title={isActive ? 'Click to Deactivate' : 'Click to Activate'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Formats Strip */}
                  <div
                    className="p-2 rounded-xl border space-y-1.5 text-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1 font-bold text-muted-foreground uppercase tracking-wider">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span>Format:</span>
                        <span className="text-primary font-black ml-0.5">{sport.defaultFormat || 'Standard'}</span>
                      </div>
                      {formatList.length > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white/5 border border-white/10 text-muted-foreground">
                          {formatList.length} formats
                        </span>
                      )}
                    </div>

                    {/* Category Presets Chips */}
                    {sport.categoryPresets && sport.categoryPresets.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 hide-scrollbar">
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 shrink-0">Cats:</span>
                        {sport.categoryPresets.map((preset) => (
                          <span
                            key={preset}
                            className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md border shrink-0"
                            style={{
                              backgroundColor: 'var(--athlon-card)',
                              borderColor: 'var(--athlon-border)',
                              color: 'var(--athlon-text)',
                            }}
                          >
                            {preset}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Floating Action Button (FAB) */}
        <div className="fixed bottom-6 right-5 z-40">
          <button
            onClick={handleOpenCreateModal}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-black shadow-xl shadow-primary/35 active:scale-90 hover:scale-105 transition-all border border-white/20"
            aria-label="Add Sport"
            title="Add Sport"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DESKTOP VIEW (min-width: md) — SPACIOUS CONTROL DASHBOARD
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs shrink-0"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Back to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--athlon-text)' }}>
                  Sports Catalog Engine
                </h1>
                <span
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  Dynamic Module
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--athlon-text-muted)' }}>
                Configure sports, match formats, and category presets across the platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSports}
              disabled={loading}
              className="p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-xs disabled:opacity-50"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Refresh Sports List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-primary/20 hover:opacity-95 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Sport</span>
            </button>
          </div>
        </div>

        {/* Desktop Quick KPI Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div
            className="p-4 rounded-2xl border shadow-xs flex items-center justify-between"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                Total Sports
              </div>
              <div className="text-2xl font-black font-mono leading-tight mt-0.5" style={{ color: 'var(--athlon-text)' }}>
                {sports.length}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>

          <div
            className="p-4 rounded-2xl border shadow-xs flex items-center justify-between"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                Active / Live
              </div>
              <div className="text-2xl font-black font-mono leading-tight mt-0.5 text-emerald-500">
                {activeCount}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div
            className="p-4 rounded-2xl border shadow-xs flex items-center justify-between"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Inactive / Staged
              </div>
              <div className="text-2xl font-black font-mono leading-tight mt-0.5 text-amber-500">
                {inactiveCount}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
          </div>

          <div
            className="p-4 rounded-2xl border shadow-xs flex items-center justify-between"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                Team / Individual
              </div>
              <div className="text-2xl font-black font-mono leading-tight mt-0.5" style={{ color: 'var(--athlon-text)' }}>
                {teamCount} <span className="text-xs font-normal opacity-60">/ {sports.length - teamCount}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Desktop Search & Filters Toolbar */}
        <div
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sports by name, code, format, or category..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-sm border transition-all focus:outline-none focus:ring-1 focus:ring-primary"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border p-0.5" style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}>
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${statusFilter === st
                      ? 'bg-primary text-black shadow-xs font-black'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-xl border p-0.5" style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}>
              {(['ALL', 'INDIVIDUAL', 'TEAM'] as const).map((tp) => (
                <button
                  key={tp}
                  onClick={() => setTypeFilter(tp)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${typeFilter === tp
                      ? 'bg-primary text-black shadow-xs font-black'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {tp === 'ALL' ? 'All Types' : tp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Sports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSports.map((sport) => {
            const isActive = sport.isActive !== false;
            return (
              <div
                key={sport.sportUuid || sport.sportName}
                className="rounded-2xl border p-5 space-y-4 transition-all shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: isActive ? 'var(--athlon-border)' : 'rgba(239, 68, 68, 0.25)',
                  opacity: isActive ? 1 : 0.8,
                }}
              >
                <div
                  className={`absolute top-0 inset-x-0 h-1 ${isActive ? 'bg-gradient-to-r from-emerald-500 via-primary to-teal-400' : 'bg-amber-500/50'
                    }`}
                />

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shrink-0 shadow-sm transition-transform hover:scale-105"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        {sport.emoji || '🏆'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-black tracking-tight truncate leading-tight" style={{ color: 'var(--athlon-text)' }}>
                            {sport.sportName}
                          </h3>
                          <span
                            className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border shrink-0"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                              color: 'var(--athlon-text-muted)',
                            }}
                          >
                            {sport.sportCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] mt-1" style={{ color: 'var(--athlon-text-muted)' }}>
                          <span className="flex items-center gap-1">
                            {sport.isTeamSport ? <Users className="w-3 h-3 text-blue-400" /> : <User className="w-3 h-3 text-emerald-400" />}
                            {sport.isTeamSport ? 'Team Sport' : 'Individual / Doubles'}
                          </span>
                          <span>•</span>
                          <span>Order #{sport.displayOrder ?? 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Desktop Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(sport)}
                        className="p-1.5 rounded-xl border transition-all hover:border-primary active:scale-95 text-muted-foreground hover:text-foreground"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                        title="Edit Sport & Dynamic Formats/Categories"
                      >
                        <Pencil className="w-3.5 h-3.5 text-primary" />
                      </button>

                      {/* Toggle Button */}
                      <button
                        onClick={() => handleToggleStatus(sport)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${isActive
                            ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-amber-500/15 border-amber-500/35 text-amber-400 hover:bg-amber-500/25'
                          }`}
                        title={isActive ? 'Click to Deactivate' : 'Click to Activate'}
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-amber-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div
                    className="p-3 rounded-xl border space-y-2 text-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                      <span>Default Format</span>
                      <span className="text-primary font-black">{sport.defaultFormat || 'Standard Match'}</span>
                    </div>

                    {/* Category Presets list */}
                    {sport.categoryPresets && sport.categoryPresets.length > 0 && (
                      <div className="pt-1.5 border-t space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                        <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                          Category Presets ({sport.categoryPresets.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {sport.categoryPresets.map((preset) => (
                            <span
                              key={preset}
                              className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md border"
                              style={{
                                backgroundColor: 'var(--athlon-card)',
                                borderColor: 'var(--athlon-border)',
                                color: 'var(--athlon-text)',
                              }}
                            >
                              {preset}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t mt-3 text-[11px]" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                      {isActive ? 'Available for Tournaments' : 'Disabled from Public Menu'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenEditModal(sport)}
                    className="text-[10.5px] font-black uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Configure</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CREATE OR EDIT SPORT (RESPONSIVE MOBILE & DESKTOP)
          Handles Sport Details + Dynamic Categories + Dynamic Formats
          ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Modal Mobile Drag Handle */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2.5 sm:hidden" />

            {/* Modal Header */}
            <div
              className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
                  {editingSport ? <Pencil className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider" style={{ color: 'var(--athlon-text)' }}>
                    {editingSport ? `Edit Sport: ${editingSport.sportName}` : 'Register New Sport'}
                  </h2>
                  <p className="text-[10.5px] sm:text-[11px]" style={{ color: 'var(--athlon-text-muted)' }}>
                    {editingSport
                      ? 'Dynamically modify sport rules, match formats, and category presets.'
                      : 'Register a sport dynamically with custom match formats and presets.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveSport} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* If Create Mode: Quick Templates */}
              {!editingSport && (
                <div className="space-y-1.5 p-3 rounded-xl border bg-white/[0.02]" style={{ borderColor: 'var(--athlon-border)' }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Quick Templates (1-Click Fill)
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                    {POPULAR_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all hover:border-primary active:scale-95"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text)',
                        }}
                      >
                        <span>{tpl.emoji}</span>
                        <span>{tpl.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Basic Info: Name & Emoji */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="col-span-3 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                    Sport Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sportName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        sportName: name,
                        sportCode: editingSport ? prev.sportCode : (prev.sportCode || name.toUpperCase().replace(/[\s\-_/]+/g, '_')),
                      }));
                    }}
                    placeholder="e.g. Pickleball, Squash, Kabaddi"
                    className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                </div>

                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emoji: e.target.value }))}
                    placeholder="🏓"
                    maxLength={4}
                    className="w-full px-3 py-2 text-center rounded-xl border focus:outline-none focus:ring-1 focus:ring-primary text-base"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                </div>
              </div>

              {/* Sport Code & Display Order */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                    Sport Code
                  </label>
                  <input
                    type="text"
                    value={formData.sportCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sportCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g. PICKLEBALL"
                    className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono uppercase"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                </div>
              </div>

              {/* Sport Type Options: Team vs Individual */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <div
                  onClick={() => setFormData((prev) => ({ ...prev, isTeamSport: false }))}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${!formData.isTeamSport ? 'border-primary bg-primary/10' : 'opacity-70'
                    }`}
                  style={{
                    backgroundColor: !formData.isTeamSport ? undefined : 'var(--athlon-surface)',
                    borderColor: !formData.isTeamSport ? undefined : 'var(--athlon-border)',
                  }}
                >
                  <User className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs leading-tight">Individual / Solo</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">Badminton, Tennis, Squash...</div>
                  </div>
                </div>

                <div
                  onClick={() => setFormData((prev) => ({ ...prev, isTeamSport: true }))}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${formData.isTeamSport ? 'border-primary bg-primary/10' : 'opacity-70'
                    }`}
                  style={{
                    backgroundColor: formData.isTeamSport ? undefined : 'var(--athlon-surface)',
                    borderColor: formData.isTeamSport ? undefined : 'var(--athlon-border)',
                  }}
                >
                  <Users className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs leading-tight">Team Sport</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">Cricket, Football, Kabaddi...</div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  DYNAMIC TOURNAMENT FORMATS SECTION
                  ───────────────────────────────────────────────────────────── */}
              <div
                className="p-3.5 rounded-2xl border space-y-2.5"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--athlon-text)' }}>
                      Match Formats ({formats.length})
                    </span>
                  </div>
                  <span className="text-[9.5px] text-muted-foreground">
                    Click ⭐ to set as Default
                  </span>
                </div>

                {/* Formats List (Chips with Remove & Star Default) */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl border bg-black/20" style={{ borderColor: 'var(--athlon-border)' }}>
                  {formats.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground italic">No formats added yet. Add below or choose suggestions.</span>
                  ) : (
                    formats.map((fmt) => {
                      const isDefault = defaultFormat.toLowerCase() === fmt.toLowerCase();
                      return (
                        <div
                          key={fmt}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${isDefault
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-xs'
                              : 'bg-white/5 border-white/10 text-foreground'
                            }`}
                        >
                          <button
                            type="button"
                            onClick={() => setDefaultFormat(fmt)}
                            className="flex items-center gap-1 hover:opacity-80"
                            title={isDefault ? 'Current Default Format' : 'Click to make Default'}
                          >
                            <Star className={`w-3 h-3 ${isDefault ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground opacity-50'}`} />
                            <span>{fmt}</span>
                          </button>
                          {isDefault && (
                            <span className="text-[8px] font-black uppercase tracking-wider px-1 rounded bg-amber-500/20 text-amber-300 ml-0.5">
                              Default
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFormat(fmt)}
                            className="p-0.5 hover:text-red-400 transition-colors ml-1"
                            title="Remove Format"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Custom Format Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFormatInput}
                    onChange={(e) => setNewFormatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFormat();
                      }
                    }}
                    placeholder="Type custom format (e.g. 7v7 Tournament, Box Cricket, Knockout)..."
                    className="flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFormat()}
                    className="px-3 py-1.5 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider shrink-0 hover:opacity-90 active:scale-95 transition-all"
                  >
                    + Add Format
                  </button>
                </div>

                {/* Quick Suggested Formats Chips */}
                <div className="space-y-1 pt-1">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Quick Suggest Formats:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_FORMATS.map((sFmt) => {
                      const alreadyAdded = formats.some((f) => f.toLowerCase() === sFmt.toLowerCase());
                      return (
                        <button
                          key={sFmt}
                          type="button"
                          onClick={() => handleAddFormat(sFmt)}
                          disabled={alreadyAdded}
                          className={`text-[9.5px] px-2 py-0.5 rounded-md border transition-all ${alreadyAdded
                              ? 'opacity-35 line-through cursor-not-allowed border-transparent'
                              : 'hover:border-primary hover:text-primary active:scale-95'
                            }`}
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                            color: alreadyAdded ? undefined : 'var(--athlon-text-muted)',
                          }}
                        >
                          + {sFmt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  DYNAMIC CATEGORY PRESETS SECTION
                  ───────────────────────────────────────────────────────────── */}
              <div
                className="p-3.5 rounded-2xl border space-y-2.5"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--athlon-text)' }}>
                      Category Presets ({categories.length})
                    </span>
                  </div>
                  <span className="text-[9.5px] text-muted-foreground">
                    Click ⭐ to set as Default
                  </span>
                </div>

                {/* Categories List (Chips with Remove & Star Default) */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl border bg-black/20" style={{ borderColor: 'var(--athlon-border)' }}>
                  {categories.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground italic">No categories added yet. Add custom categories below.</span>
                  ) : (
                    categories.map((cat) => {
                      const isDefault = defaultCategory.toLowerCase() === cat.toLowerCase();
                      return (
                        <div
                          key={cat}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${isDefault
                              ? 'bg-primary/15 border-primary/40 text-primary shadow-xs'
                              : 'bg-white/5 border-white/10 text-foreground'
                            }`}
                        >
                          <button
                            type="button"
                            onClick={() => setDefaultCategory(cat)}
                            className="flex items-center gap-1 hover:opacity-80"
                            title={isDefault ? 'Current Default Category' : 'Click to make Default'}
                          >
                            <Star className={`w-3 h-3 ${isDefault ? 'fill-primary text-primary' : 'text-muted-foreground opacity-50'}`} />
                            <span>{cat}</span>
                          </button>
                          {isDefault && (
                            <span className="text-[8px] font-black uppercase tracking-wider px-1 rounded bg-primary/20 text-primary ml-0.5">
                              Default
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat)}
                            className="p-0.5 hover:text-red-400 transition-colors ml-1"
                            title="Remove Category"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Custom Category Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    placeholder="Type custom category (e.g. Under-17 Boys, Veterans 40+, Corporate League)..."
                    className="flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCategory()}
                    className="px-3 py-1.5 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider shrink-0 hover:opacity-90 active:scale-95 transition-all"
                  >
                    + Add Cat
                  </button>
                </div>

                {/* Suggested Categories */}
                <div className="space-y-1 pt-1">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Quick Suggest Categories:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(formData.isTeamSport ? SUGGESTED_CATEGORIES_TEAM : SUGGESTED_CATEGORIES_SOLO).map((sCat) => {
                      const alreadyAdded = categories.some((c) => c.toLowerCase() === sCat.toLowerCase());
                      return (
                        <button
                          key={sCat}
                          type="button"
                          onClick={() => handleAddCategory(sCat)}
                          disabled={alreadyAdded}
                          className={`text-[9.5px] px-2 py-0.5 rounded-md border transition-all ${alreadyAdded
                              ? 'opacity-35 line-through cursor-not-allowed border-transparent'
                              : 'hover:border-primary hover:text-primary active:scale-95'
                            }`}
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                            color: alreadyAdded ? undefined : 'var(--athlon-text-muted)',
                          }}
                        >
                          + {sCat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t shrink-0" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-wider hover:opacity-80 transition-all"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text-muted)',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !formData.sportName.trim()}
                  className="px-5 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider transition-all hover:opacity-90 active:scale-95 shadow-md shadow-primary/25 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : editingSport ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                  <span>
                    {submitting
                      ? editingSport
                        ? 'Saving Changes...'
                        : 'Registering...'
                      : editingSport
                        ? 'Save Changes'
                        : 'Register & Activate'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
