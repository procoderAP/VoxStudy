import React from 'react';
import {
  HelpCircle,
  X,
  Play,
  Volume2,
  Sparkles,
  Palette,
  FileText,
  Keyboard,
  ArrowRight,
  BookOpen,
  ArrowDownCircle,
  MessageSquare,
  Eye,
} from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenThemeSelector?: () => void;
  onOpenVoiceSettings?: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  onOpenThemeSelector,
  onOpenVoiceSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-lg shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b flex items-center justify-between shrink-0"
          style={{
            borderColor: 'var(--theme-card-border)',
            backgroundColor: 'var(--theme-surface-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-md shadow-sm text-white"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                How to Use VoxStudy
              </h2>
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                Audio reading desk, karaoke highlighting, and study deck guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-colors hover:opacity-75 cursor-pointer"
            style={{ color: 'var(--theme-text-muted)' }}
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Overview */}
          <div
            className="p-4 rounded-md border text-xs leading-relaxed"
            style={{
              backgroundColor: 'var(--theme-surface-subtle)',
              borderColor: 'var(--theme-card-border)',
            }}
          >
            <p className="font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
              Created by Atharva Patwardhan · Student at BITS Pilani, Dubai Campus
            </p>
            <p style={{ color: 'var(--theme-text-muted)' }}>
              VoxStudy turns heavy study notes and PDFs into continuous, natural human narration. Built for students across every stage—from Primary & Secondary grades to College, Master's Degree, and PhD research.
            </p>
          </div>

          {/* Core Feature Steps */}
          <div className="space-y-3.5">
            <h3
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Step-by-Step Guide
            </h3>

            {/* Step 1: Courses & PDFs */}
            <div
              className="flex items-start gap-3.5 p-3.5 rounded-md border"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 text-white"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                1
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FileText className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                  <span>Choose Your Level or Upload PDF</span>
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  Select your grade or academic year (Grades 1 to 12, College 1st-4th Year, Master's, or PhD) to view curated subjects, write in your custom courses, or click <strong>"Upload PDF"</strong> to study your own textbooks and lecture slides.
                </p>
              </div>
            </div>

            {/* Step 2: Listening & Voices */}
            <div
              className="flex items-start gap-3.5 p-3.5 rounded-md border"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 text-white"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                2
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Play className="w-4 h-4 fill-current" style={{ color: 'var(--theme-accent)' }} />
                  <span>Start Playback &amp; Voice Selection</span>
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  Press the big Play button or hit the <strong>Spacebar</strong> to start dictation. The app defaults to <strong>Natural voice</strong> (free, smooth continuous reading). You can also switch to <strong>Better natural voices</strong> (Gemini AI TTS models: Kore, Puck, Fenrir, Zephyr, Charon) with 5-line preloading.
                </p>
              </div>
            </div>

            {/* Step 3: Karaoke & Auto-Scrolling */}
            <div
              className="flex items-start gap-3.5 p-3.5 rounded-md border"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 text-white"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                3
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ArrowDownCircle className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                  <span>Live Karaoke Highlighting &amp; Smart Page Movement</span>
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  The highlight box follows every spoken sentence in real time. <strong>When the karaoke box is about to reach the bottom of the page</strong>, the document automatically and smoothly rolls down so upcoming sentences remain in comfortable view. You can also click any sentence to jump straight to it.
                </p>
              </div>
            </div>

            {/* Step 4: Themes including Eye Care & Matrix */}
            <div
              className="flex items-start gap-3.5 p-3.5 rounded-md border"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 text-white"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                4
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Eye className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                  <span>10 Reading Themes with Ultra Eye Care</span>
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  Choose from 10 calibrated reading themes: <strong>Ultra Eye Care</strong> (warm e-ink matte tone designed for late-night strain-free reading), <strong>Matrix Terminal</strong> (phosphor cyberpunk green), Nordic Frost, Royal Velvet, Espresso Roast, Forest Sage, Warm Amber, Obsidian, Cobalt, and Clean Paper. Every menu, popup, and reader adapts to your chosen theme.
                </p>
              </div>
            </div>

            {/* Step 5: Ask Doubts & Study Assistant */}
            <div
              className="flex items-start gap-3.5 p-3.5 rounded-md border"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 text-white"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                5
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <MessageSquare className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                  <span>Instant Doubt Clearing &amp; AI Study Deck</span>
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  Hover over any sentence in the reader and click the question mark <strong>(?)</strong> to ask a question. Or open the <strong>"Study Assistant"</strong> to solve doubts, generate exam cheat sheets, and practice with flashcards.
                </p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Table */}
          <div
            className="p-4 rounded-md border space-y-3"
            style={{
              backgroundColor: 'var(--theme-surface-subtle)',
              borderColor: 'var(--theme-card-border)',
            }}
          >
            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              <Keyboard className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                className="flex items-center justify-between p-2.5 rounded-md border"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                }}
              >
                <span style={{ color: 'var(--theme-text-muted)' }}>Play / Pause Audio</span>
                <kbd
                  className="px-2 py-0.5 rounded font-mono font-bold border text-[11px]"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  Space
                </kbd>
              </div>
              <div
                className="flex items-center justify-between p-2.5 rounded-md border"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                }}
              >
                <span style={{ color: 'var(--theme-text-muted)' }}>Next Sentence</span>
                <kbd
                  className="px-2 py-0.5 rounded font-mono font-bold border text-[11px]"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  → (Right)
                </kbd>
              </div>
              <div
                className="flex items-center justify-between p-2.5 rounded-md border"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                }}
              >
                <span style={{ color: 'var(--theme-text-muted)' }}>Previous Sentence</span>
                <kbd
                  className="px-2 py-0.5 rounded font-mono font-bold border text-[11px]"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  ← (Left)
                </kbd>
              </div>
              <div
                className="flex items-center justify-between p-2.5 rounded-md border"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                }}
              >
                <span style={{ color: 'var(--theme-text-muted)' }}>Skip ±15 Seconds</span>
                <kbd
                  className="px-2 py-0.5 rounded font-mono font-bold border text-[11px]"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  Shift + ← / →
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3 shrink-0"
          style={{
            borderColor: 'var(--theme-card-border)',
            backgroundColor: 'var(--theme-surface-subtle)',
          }}
        >
          <div className="flex items-center gap-2">
            {onOpenThemeSelector && (
              <button
                onClick={() => {
                  onClose();
                  onOpenThemeSelector();
                }}
                className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:opacity-80 transition-opacity flex items-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                <Palette className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
                <span>Choose Theme</span>
              </button>
            )}
            {onOpenVoiceSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenVoiceSettings();
                }}
                className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:opacity-80 transition-opacity flex items-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                <Volume2 className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
                <span>Choose Voice</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 text-white font-bold text-xs rounded-md shadow-sm transition-all flex items-center gap-1.5 ml-auto active:scale-95 cursor-pointer hover:opacity-90"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          >
            <span>Got it, let's study!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
