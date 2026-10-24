import React from 'react';
import { AcademicYear, CourseBranch, CourseDocument, EducationTier } from '../types';
import { Home, FileText, GraduationCap, Car, Upload, HelpCircle, Bot } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface NavbarProps {
  currentBranch: CourseBranch;
  currentYear: AcademicYear;
  currentDoc: CourseDocument | null;
  currentView: 'home' | 'reader';
  educationTier?: EducationTier;
  institutionName?: string;
  onSetView: (view: 'home' | 'reader') => void;
  onOpenProfile: () => void;
  onOpenUpload: () => void;
  onOpenStudyNotes: () => void;
  onOpenCommute: () => void;
  onOpenHowToUse: () => void;
  onOpenCopilot: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentBranch,
  currentYear,
  currentDoc,
  currentView,
  educationTier = 'college',
  institutionName,
  onSetView,
  onOpenProfile,
  onOpenUpload,
  onOpenStudyNotes,
  onOpenCommute,
  onOpenHowToUse,
  onOpenCopilot,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-2.5 sm:py-3 border-b transition-colors"
      style={{
        backgroundColor: 'var(--theme-header-bg)',
        borderColor: 'var(--theme-card-border)',
        color: 'var(--theme-text-primary)',
      }}
    >
      {/* Zone 1: Wordmark & Creator Attribution */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Permanent, Static, Unclickable V Logo */}
        <div
          className="flex items-center justify-center w-8 h-8 rounded-md text-white shadow-sm select-none pointer-events-none shrink-0"
          style={{ backgroundColor: 'var(--theme-accent)' }}
          aria-hidden="true"
        >
          <AppLogo size={18} color="#ffffff" accentColor="#ffffff" />
        </div>

        <div>
          <button
            onClick={() => onSetView('home')}
            className="flex items-baseline gap-2 text-left cursor-pointer group"
          >
            <span
              className="text-base font-bold tracking-tight group-hover:opacity-85 transition-opacity"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              VoxStudy
            </span>
          </button>
          <div className="flex flex-col text-[11px] leading-tight select-text">
            <span style={{ color: 'var(--theme-text-muted)' }}>
              Created by <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Atharva Patwardhan</span>
            </span>
            <span className="text-[10px] opacity-75 font-normal" style={{ color: 'var(--theme-text-muted)' }}>
              Student at BITS Pilani, Dubai Campus
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation & Study Desk Controls */}
      <nav className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-0.5 scrollbar-none min-w-0">
        {/* Home vs PDF Reader Segmented Controls */}
        <div
          className="flex items-center p-0.5 rounded-md border text-xs font-medium shrink-0"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
          }}
        >
          <button
            onClick={() => onSetView('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer font-medium"
            style={{
              backgroundColor: currentView === 'home' ? 'var(--theme-card-bg)' : 'transparent',
              color: currentView === 'home' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
              boxShadow: currentView === 'home' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              border: currentView === 'home' ? '1px solid var(--theme-card-border)' : '1px solid transparent',
              fontWeight: currentView === 'home' ? 600 : 500,
            }}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Desk</span>
          </button>
          <button
            onClick={() => onSetView('reader')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer font-medium"
            style={{
              backgroundColor: currentView === 'reader' ? 'var(--theme-card-bg)' : 'transparent',
              color: currentView === 'reader' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
              boxShadow: currentView === 'reader' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              border: currentView === 'reader' ? '1px solid var(--theme-card-border)' : '1px solid transparent',
              fontWeight: currentView === 'reader' ? 600 : 500,
            }}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reader</span>
          </button>
        </div>

        {/* Student Grade / Course Level Button */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 border cursor-pointer hover:opacity-85"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
            color: 'var(--theme-text-primary)',
          }}
          title="Change grade, year, school, or course curriculum"
        >
          <GraduationCap className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
          <span className="font-medium max-w-[120px] truncate">{currentYear}</span>
          <span className="hidden sm:inline opacity-50">·</span>
          <span className="hidden sm:inline max-w-[130px] truncate" style={{ color: 'var(--theme-text-muted)' }}>
            {currentBranch.shortName}
          </span>
        </button>

        {/* Upload Notes Button */}
        <button
          onClick={onOpenUpload}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 border cursor-pointer hover:opacity-85"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
            color: 'var(--theme-text-primary)',
          }}
        >
          <Upload className="w-3.5 h-3.5" style={{ color: 'var(--theme-text-muted)' }} />
          <span>Upload PDF</span>
        </button>

        {/* Study Copilot Button (Clean, Human Design) */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-white shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          style={{ backgroundColor: 'var(--theme-accent)' }}
          title="Open Study Assistant & Doubt Solver"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Study Assistant</span>
        </button>
      </nav>

      {/* Zone 3: Quick Desk Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenHowToUse}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border cursor-pointer hover:opacity-85"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
            color: 'var(--theme-text-primary)',
          }}
          title="How to use VoxStudy guide"
        >
          <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--theme-text-muted)' }} />
          <span className="hidden lg:inline">Guide</span>
        </button>

        <button
          onClick={onOpenCommute}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border cursor-pointer hover:opacity-85"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
            color: 'var(--theme-text-primary)',
          }}
          title="Commute mode: Large controls for listening on the go"
        >
          <Car className="w-3.5 h-3.5" style={{ color: 'var(--theme-text-muted)' }} />
          <span className="hidden sm:inline">Commute</span>
        </button>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-md transition-colors border cursor-pointer hover:opacity-85"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
            color: 'var(--theme-text-primary)',
          }}
          title="Toggle reading theme"
        >
          {isDark ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
