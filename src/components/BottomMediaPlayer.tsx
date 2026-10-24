import React from 'react';
import { CourseDocument, PlaybackMode } from '../types';
import { ttsService } from '../services/ttsService';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  Sparkles,
  BookOpen,
  Car,
} from 'lucide-react';

interface BottomMediaPlayerProps {
  document: CourseDocument | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentSentenceIndex: number;
  totalSentences: number;
  playbackRate: number;
  estimatedRemainingSeconds: number;
  mode: PlaybackMode;
  isBuffering?: boolean;
  quotaExceeded?: boolean;
  engine?: string;
  studioVoiceName?: string;
  freeVoiceName?: string;
  onTogglePlay: () => void;
  onNextSentence: () => void;
  onPrevSentence: () => void;
  onSkipForward15: () => void;
  onSkipBackward15: () => void;
  onSeek: (index: number) => void;
  onSetRate: (rate: number) => void;
  onToggleMode: (mode: PlaybackMode) => void;
  onOpenVoiceSettings: () => void;
  onOpenCommute: () => void;
}

function formatSeconds(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const BottomMediaPlayer: React.FC<BottomMediaPlayerProps> = ({
  document,
  isPlaying,
  currentSentenceIndex,
  totalSentences,
  playbackRate,
  estimatedRemainingSeconds,
  mode,
  isBuffering = false,
  quotaExceeded = false,
  engine = 'studio',
  studioVoiceName = 'Kore',
  freeVoiceName = 'Jenny',
  onTogglePlay,
  onNextSentence,
  onPrevSentence,
  onSkipForward15,
  onSkipBackward15,
  onSeek,
  onSetRate,
  onToggleMode,
  onOpenVoiceSettings,
  onOpenCommute,
}) => {
  const currentSentence = document?.sentences?.[currentSentenceIndex];
  const progressPercent = totalSentences > 0 ? (currentSentenceIndex / (totalSentences - 1 || 1)) * 100 : 0;

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  const shortVoiceName = (freeVoiceName || studioVoiceName || 'Jenny').split('(')[0].trim();
  const voiceTierLabel = 'Natural';

  const handleCycleSpeed = () => {
    const idx = speedOptions.indexOf(playbackRate as any);
    const nextRate = idx !== -1 ? speedOptions[(idx + 1) % speedOptions.length] : 1.0;
    onSetRate(nextRate);
  };

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 border-t shadow-2xl backdrop-blur-md transition-colors select-none"
      style={{
        backgroundColor: 'var(--theme-player-bg)',
        borderColor: 'var(--theme-player-border)',
        color: 'var(--theme-text-primary)',
      }}
    >
      {/* Interactive Progress Scrub Bar */}
      <div
        className="relative w-full h-1.5 cursor-pointer group"
        style={{ backgroundColor: 'var(--theme-surface-subtle)' }}
      >
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: 'var(--theme-accent)',
          }}
        />
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSentences - 1)}
          value={currentSentenceIndex}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          aria-label="Seek through document"
        />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
        {/* DESKTOP & LAPTOP LAYOUT (md and up): 3 Balanced Columns */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Left: Track Info & Timers */}
          <div className="flex items-center gap-3 w-1/4 min-w-0">
            <div
              className="w-10 h-10 rounded-md border flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: 'var(--theme-accent-subtle)',
                borderColor: 'var(--theme-card-border)',
                color: 'var(--theme-accent)',
              }}
            >
              {mode === 'verbatim' ? <BookOpen className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-amber-500" />}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="text-xs font-bold truncate"
                style={{ color: 'var(--theme-text-primary)' }}
                title={document?.title}
              >
                {document ? document.title : 'No Course Selected'}
              </div>
              <div
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                <span className="truncate max-w-[130px]">
                  {currentSentence?.chapterTitle || 'Reading Document'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  -{formatSeconds(estimatedRemainingSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Dual Mode Switch + Playback Controls */}
          <div className="flex flex-col items-center gap-1.5 w-2/4">
            {/* Mode Switcher */}
            <div
              className="flex items-center gap-1 p-0.5 rounded-md border text-[11px]"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              <button
                onClick={() => onToggleMode('verbatim')}
                className="px-3 py-1 rounded-[5px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: mode === 'verbatim' ? 'var(--theme-accent)' : 'transparent',
                  color: mode === 'verbatim' ? '#ffffff' : 'var(--theme-text-muted)',
                  boxShadow: mode === 'verbatim' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                }}
                title="Reads exact PDF sentences at steady human pace"
              >
                Exact PDF Read-Aloud
              </button>
              <button
                onClick={() => onToggleMode('simplified')}
                className="flex items-center gap-1 px-3 py-1 rounded-[5px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: mode === 'simplified' ? 'rgb(217, 119, 6)' : 'transparent',
                  color: mode === 'simplified' ? '#ffffff' : 'var(--theme-text-muted)',
                  boxShadow: mode === 'simplified' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                }}
                title="Conversational lecture digest"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                Simplified Digest
              </button>
            </div>

            {/* Transport Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onSkipBackward15}
                className="p-1.5 rounded-md transition-colors hover:opacity-75 cursor-pointer"
                style={{ color: 'var(--theme-text-muted)' }}
                title="Rewind 15 seconds"
                aria-label="Skip back 15 seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={onPrevSentence}
                disabled={currentSentenceIndex <= 0}
                className="p-1.5 rounded-md disabled:opacity-40 transition-colors hover:opacity-75 cursor-pointer"
                style={{ color: 'var(--theme-text-muted)' }}
                title="Previous sentence"
                aria-label="Previous sentence"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Softer, squared-off paper-card style button edge */}
              <button
                onClick={onTogglePlay}
                className="w-10 h-10 rounded-md text-white flex items-center justify-center shadow-sm border border-black/10 dark:border-white/10 transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--theme-accent)',
                }}
                title={isPlaying ? 'Pause' : 'Play audio'}
                aria-label={isPlaying ? 'Pause' : 'Play audio'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={onNextSentence}
                disabled={currentSentenceIndex >= totalSentences - 1}
                className="p-1.5 rounded-md disabled:opacity-40 transition-colors hover:opacity-75 cursor-pointer"
                style={{ color: 'var(--theme-text-muted)' }}
                title="Next sentence"
                aria-label="Next sentence"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={onSkipForward15}
                className="p-1.5 rounded-md transition-colors hover:opacity-75 cursor-pointer"
                style={{ color: 'var(--theme-text-muted)' }}
                title="Fast-forward 15 seconds"
                aria-label="Skip forward 15 seconds"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Speed pills, Voice pill, Commute button */}
          <div className="flex items-center justify-end gap-2 w-1/4">
            {/* Speed pills */}
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-md border shrink-0"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              {speedOptions.map((rate) => (
                <button
                  key={rate}
                  onClick={() => onSetRate(rate)}
                  className="px-2 py-1 text-[10px] font-mono font-semibold rounded transition-colors cursor-pointer"
                  style={{
                    backgroundColor: playbackRate === rate ? 'var(--theme-accent)' : 'transparent',
                    color: playbackRate === rate ? '#ffffff' : 'var(--theme-text-muted)',
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Voice Pill */}
            <button
              onClick={onOpenVoiceSettings}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all border shadow-sm whitespace-nowrap shrink-0 hover:opacity-85 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
                color: 'var(--theme-text-primary)',
              }}
              title={`Active Narrator: ${shortVoiceName} (${voiceTierLabel} Voice). Click to customize.`}
            >
              {isBuffering ? (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--theme-accent)' }} />
              )}
              <span className="font-semibold text-[11px] whitespace-nowrap">
                {isBuffering ? 'Streaming...' : shortVoiceName}
              </span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0"
                style={{
                  backgroundColor: 'var(--theme-accent-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-accent)',
                }}
              >
                {voiceTierLabel}
              </span>
            </button>

            {/* Commute Button */}
            <button
              onClick={onOpenCommute}
              className="p-1.5 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer shrink-0"
              style={{ color: 'var(--theme-text-muted)' }}
              title="Expand to Commute Mode"
              aria-label="Commute Mode"
            >
              <Car className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MOBILE LAYOUT (< md): 2 Compact Rows Designed for Thumb Ergonomics */}
        <div className="flex md:hidden flex-col gap-2">
          {/* Mobile Row 1: Track Title + Mode Switcher + Commute */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-7 h-7 rounded-md border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'var(--theme-accent-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-accent)',
                }}
              >
                {mode === 'verbatim' ? <BookOpen className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-[11px] font-bold truncate leading-tight"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  {document ? document.title : 'No Course Selected'}
                </div>
                <div
                  className="text-[10px] truncate"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  <span className="font-mono tabular-nums">-{formatSeconds(estimatedRemainingSeconds)}</span>
                  <span className="mx-1">·</span>
                  <span>{currentSentence?.chapterTitle || document?.courseCode || 'Ready'}</span>
                </div>
              </div>
            </div>

            {/* Mobile Mode Selector */}
            <div
              className="flex items-center p-0.5 rounded-md border text-[10px] shrink-0 font-medium"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              <button
                onClick={() => onToggleMode('verbatim')}
                className="px-2.5 py-1 rounded-[5px] transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: mode === 'verbatim' ? 'var(--theme-accent)' : 'transparent',
                  color: mode === 'verbatim' ? '#ffffff' : 'var(--theme-text-muted)',
                  fontWeight: mode === 'verbatim' ? 700 : 500,
                }}
              >
                Exact
              </button>
              <button
                onClick={() => onToggleMode('simplified')}
                className="px-2.5 py-1 rounded-[5px] transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: mode === 'simplified' ? 'rgb(217, 119, 6)' : 'transparent',
                  color: mode === 'simplified' ? '#ffffff' : 'var(--theme-text-muted)',
                  fontWeight: mode === 'simplified' ? 700 : 500,
                }}
              >
                Digest
              </button>
            </div>

            <button
              onClick={onOpenCommute}
              className="p-1.5 rounded-md transition-colors hover:opacity-75 shrink-0"
              style={{ color: 'var(--theme-text-muted)' }}
              title="Commute Mode"
            >
              <Car className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Row 2: Speed Cycle + Transport Buttons + Voice Pill */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            {/* Speed Cycle Button */}
            <button
              onClick={handleCycleSpeed}
              className="px-2 py-1 text-[11px] font-mono font-bold rounded-md border flex items-center justify-center shrink-0 active:scale-95 transition-transform"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
                color: 'var(--theme-accent)',
              }}
              title="Tap to cycle playback speed"
            >
              <span>{playbackRate}x</span>
            </button>

            {/* Centered Transport Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={onSkipBackward15}
                className="p-1 hover:opacity-75 rounded-md"
                style={{ color: 'var(--theme-text-muted)' }}
                title="Rewind 15s"
                aria-label="Skip back 15 seconds"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onPrevSentence}
                disabled={currentSentenceIndex <= 0}
                className="p-1 disabled:opacity-30 rounded-md"
                style={{ color: 'var(--theme-text-muted)' }}
                title="Previous sentence"
                aria-label="Previous sentence"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onTogglePlay}
                className="w-9 h-9 rounded-md text-white flex items-center justify-center shadow-sm border border-black/10 dark:border-white/10 active:scale-90 transition-transform"
                style={{ backgroundColor: 'var(--theme-accent)' }}
                title={isPlaying ? 'Pause' : 'Play audio'}
                aria-label={isPlaying ? 'Pause' : 'Play audio'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={onNextSentence}
                disabled={currentSentenceIndex >= totalSentences - 1}
                className="p-1 disabled:opacity-30 rounded-md"
                style={{ color: 'var(--theme-text-muted)' }}
                title="Next sentence"
                aria-label="Next sentence"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onSkipForward15}
                className="p-1 hover:opacity-75 rounded-md"
                style={{ color: 'var(--theme-text-muted)' }}
                title="Forward 15s"
                aria-label="Skip forward 15 seconds"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Voice Pill */}
            <button
              onClick={onOpenVoiceSettings}
              className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md border font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-transform"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
                color: 'var(--theme-text-primary)',
              }}
              title={`Voice: ${shortVoiceName}`}
            >
              <Volume2 className="w-3 h-3" style={{ color: 'var(--theme-accent)' }} />
              <span className="truncate max-w-[70px]">{shortVoiceName}</span>
              <span
                className="text-[8px] font-bold px-1 rounded uppercase tracking-wider border"
                style={{
                  backgroundColor: 'var(--theme-accent-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-accent)',
                }}
              >
                {voiceTierLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
