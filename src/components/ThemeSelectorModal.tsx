import React, { useState } from 'react';
import { Palette, Check, X, Eye, Moon, Sun } from 'lucide-react';
import { AppTheme } from '../types';

export type { AppTheme };

export interface ThemeOption {
  id: AppTheme;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  isDarkBase: boolean;
  isFavorite?: boolean;
  isEyeCare?: boolean;
  tag?: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'eyecare',
    name: 'Eye Care / E-Ink Paper',
    description: 'Scientifically calibrated warm matte oat with zero blue glare and spruce ink. Ideal for multi-hour sessions.',
    previewBg: '#ECE8E1',
    previewAccent: '#285943',
    isDarkBase: false,
    isEyeCare: true,
    tag: '✦ Ultra Eye Friendly',
  },
  {
    id: 'paper',
    name: 'Scholarly Paper (Ivory Light)',
    description: 'Archival parchment ivory with classic Oxford navy ink for daytime desk study and lecture notes.',
    previewBg: '#F7F5F0',
    previewAccent: '#1E3A8A',
    isDarkBase: false,
  },
  {
    id: 'espresso',
    name: 'Vintage Library / Leather',
    description: 'Aged vellum pages with cedar wood and antique Morocco bookbinding leather tones.',
    previewBg: '#F6F1E5',
    previewAccent: '#87481B',
    isDarkBase: false,
    tag: 'Classic Library',
  },
  {
    id: 'sage',
    name: 'Botanical Herbarium / Sage',
    description: 'Calming botanical herbarium tea-leaf greens that soothe tired ocular muscles.',
    previewBg: '#EDF2EC',
    previewAccent: '#2D6A4F',
    isDarkBase: false,
    isEyeCare: true,
  },
  {
    id: 'amber',
    name: 'Warm Sepia / Candlelight',
    description: 'Blue-light filtered candlelight parchment and warm amber ink for relaxed evening study.',
    previewBg: '#F5EEE3',
    previewAccent: '#9A5B0B',
    isDarkBase: false,
    isEyeCare: true,
  },
  {
    id: 'obsidian',
    name: 'Obsidian Scholar (Dark Bound)',
    description: 'Deep bound archival charcoal volume with gilt gold stamped lettering for late-night focus.',
    previewBg: '#101318',
    previewAccent: '#C59B27',
    isDarkBase: true,
    tag: 'Gilt Gold',
  },
  {
    id: 'nordic',
    name: 'Nordic Frost (Polar Archive)',
    description: 'Acclaimed Nord polar night palette with gentle arctic ice slate tones.',
    previewBg: '#242933',
    previewAccent: '#7AAEC0',
    isDarkBase: true,
    isEyeCare: true,
    tag: 'Arctic Comfort',
  },
  {
    id: 'cobalt',
    name: 'BITS Cobalt & Seal Gold',
    description: 'Collegiate academic navy and varsity seal gold inspired by BITS Pilani.',
    previewBg: '#0A1325',
    previewAccent: '#D99008',
    isDarkBase: true,
  },
  {
    id: 'velvet',
    name: 'Twilight Oxford (Indigo Dusk)',
    description: 'Deep dusk archival indigo with muted slate-violet highlights for quiet evening reading.',
    previewBg: '#151622',
    previewAccent: '#767CB5',
    isDarkBase: true,
  },
  {
    id: 'matrix',
    name: 'Matrix Terminal',
    description: "Atharva's personal favourite: Phosphor amber-green on pitch black terminal.",
    previewBg: '#000000',
    previewAccent: '#00FF66',
    isDarkBase: true,
    isFavorite: true,
    tag: "★ Atharva's Pick",
  },
];

interface ThemeSelectorModalProps {
  isOpen: boolean;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  currentTheme,
  onSelectTheme,
  onClose,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'eyecare' | 'light' | 'dark'>('all');

  if (!isOpen) return null;

  const filteredThemes = THEME_OPTIONS.filter((t) => {
    if (filterMode === 'eyecare') return t.isEyeCare;
    if (filterMode === 'light') return !t.isDarkBase;
    if (filterMode === 'dark') return t.isDarkBase;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-lg shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-md"
              style={{
                backgroundColor: 'var(--theme-accent-subtle)',
                color: 'var(--theme-accent)',
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Reading Themes &amp; Library Palettes
              </h2>
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                10 curated palettes calibrated for zero-glare study sessions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Segmented Control */}
        <div
          className="px-6 py-2.5 border-b flex items-center gap-1.5 overflow-x-auto scrollbar-none"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            borderColor: 'var(--theme-card-border)',
          }}
        >
          <button
            onClick={() => setFilterMode('all')}
            className="px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer border"
            style={{
              backgroundColor: filterMode === 'all' ? 'var(--theme-accent)' : 'transparent',
              borderColor: filterMode === 'all' ? 'var(--theme-accent)' : 'var(--theme-card-border)',
              color: filterMode === 'all' ? '#ffffff' : 'var(--theme-text-muted)',
              fontWeight: filterMode === 'all' ? 600 : 500,
            }}
          >
            All (10)
          </button>
          <button
            onClick={() => setFilterMode('eyecare')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer border"
            style={{
              backgroundColor: filterMode === 'eyecare' ? 'var(--theme-accent)' : 'transparent',
              borderColor: filterMode === 'eyecare' ? 'var(--theme-accent)' : 'var(--theme-card-border)',
              color: filterMode === 'eyecare' ? '#ffffff' : 'var(--theme-text-muted)',
              fontWeight: filterMode === 'eyecare' ? 600 : 500,
            }}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Eye Friendly (4)</span>
          </button>
          <button
            onClick={() => setFilterMode('light')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer border"
            style={{
              backgroundColor: filterMode === 'light' ? 'var(--theme-accent)' : 'transparent',
              borderColor: filterMode === 'light' ? 'var(--theme-accent)' : 'var(--theme-card-border)',
              color: filterMode === 'light' ? '#ffffff' : 'var(--theme-text-muted)',
              fontWeight: filterMode === 'light' ? 600 : 500,
            }}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Daylight (5)</span>
          </button>
          <button
            onClick={() => setFilterMode('dark')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer border"
            style={{
              backgroundColor: filterMode === 'dark' ? 'var(--theme-accent)' : 'transparent',
              borderColor: filterMode === 'dark' ? 'var(--theme-accent)' : 'var(--theme-card-border)',
              color: filterMode === 'dark' ? '#ffffff' : 'var(--theme-text-muted)',
              fontWeight: filterMode === 'dark' ? 600 : 500,
            }}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Night (5)</span>
          </button>
        </div>

        {/* Theme Cards List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {filteredThemes.map((theme) => {
            const isSelected = theme.id === currentTheme;

            return (
              <div
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  onClose();
                }}
                className="flex items-center justify-between p-3.5 rounded-md border cursor-pointer transition-all"
                style={{
                  borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                  backgroundColor: isSelected ? 'var(--theme-accent-subtle)' : 'var(--theme-surface-subtle)',
                  boxShadow: isSelected ? '0 0 0 1px var(--theme-accent)' : undefined,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Theme Swatch Preview */}
                  <div
                    className="w-9 h-9 rounded-md border shadow-inner flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: theme.previewBg,
                      borderColor: 'var(--theme-card-border)',
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded"
                      style={{ backgroundColor: theme.previewAccent }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-bold"
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        {theme.name}
                      </span>
                      {theme.tag && (
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: 'var(--theme-accent)' }}
                        >
                          {theme.tag}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-[11px] line-clamp-1"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >
                      {theme.description}
                    </div>
                  </div>
                </div>

                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 ml-2 border"
                  style={{
                    backgroundColor: isSelected ? 'var(--theme-accent)' : 'transparent',
                    borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                    color: '#ffffff',
                  }}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
