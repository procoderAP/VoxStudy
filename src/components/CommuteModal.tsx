import React from 'react';
import { CourseDocument } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  X,
  Car,
} from 'lucide-react';

interface CommuteModalProps {
  isOpen: boolean;
  document: CourseDocument | null;
  isPlaying: boolean;
  currentSentenceIndex: number;
  totalSentences: number;
  playbackRate: number;
  estimatedRemainingSeconds: number;
  onTogglePlay: () => void;
  onNextSentence: () => void;
  onPrevSentence: () => void;
  onSkipForward15: () => void;
  onSkipBackward15: () => void;
  onSetRate: (rate: number) => void;
  onClose: () => void;
}

function formatSeconds(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const CommuteModal: React.FC<CommuteModalProps> = ({
  isOpen,
  document,
  isPlaying,
  currentSentenceIndex,
  totalSentences,
  playbackRate,
  estimatedRemainingSeconds,
  onTogglePlay,
  onNextSentence,
  onPrevSentence,
  onSkipForward15,
  onSkipBackward15,
  onSetRate,
  onClose,
}) => {
  if (!isOpen) return null;

  const currentSentence = document?.sentences?.[currentSentenceIndex];
  const progressPercent = totalSentences > 0 ? (currentSentenceIndex / (totalSentences - 1 || 1)) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 select-none animate-in fade-in duration-200 transition-colors"
      style={{
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text-primary)',
      }}
    >
      {/* Top Bar: Title & Exit to Desk */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-md text-white shadow-sm"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          >
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div
              className="text-xs uppercase font-bold tracking-widest"
              style={{ color: 'var(--theme-accent)' }}
            >
              Commute Mode · Hands-Free Audio
            </div>
            <div className="text-sm font-bold truncate max-w-[240px] sm:max-w-md">
              {document?.title || 'Course Lecture Audio'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold border transition-colors cursor-pointer hover:opacity-80 active:scale-95"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            borderColor: 'var(--theme-card-border)',
            color: 'var(--theme-text-primary)',
          }}
        >
          <span>Exit to Desk View</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Zone: Big High-Contrast Spoken Sentence & Ambient Wave */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto my-6 text-center px-4">
        {/* Chapter tag */}
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          {currentSentence?.chapterTitle || 'Continuous Playback'} · Sentence {currentSentenceIndex + 1} of {totalSentences}
        </div>

        {/* Large readable sentence text for quick glances */}
        <div
          className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium leading-relaxed sm:leading-snug tracking-normal text-balance mb-8"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          "{currentSentence ? currentSentence.text : 'Ready to start commute playback'}"
        </div>

        {/* Ambient Waveform Indicator */}
        <div className="flex items-center gap-1.5 h-12">
          {[40, 65, 85, 30, 95, 70, 50, 90, 60, 45, 80, 55].map((height, i) => (
            <div
              key={i}
              className="w-1.5 rounded-xs transition-all duration-300"
              style={{
                height: isPlaying ? `${height}%` : '20%',
                opacity: isPlaying ? 0.95 : 0.25,
                backgroundColor: 'var(--theme-accent)',
                animation: isPlaying ? `pulse 1s ease-in-out infinite ${i * 0.1}s` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Zone: Giant Touch Controls */}
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Large Progress Bar & Tabular Time */}
        <div>
          <div
            className="flex items-center justify-between text-xs font-mono tabular-nums mb-2"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <span>Sentence {currentSentenceIndex + 1} / {totalSentences}</span>
            <span>-{formatSeconds(estimatedRemainingSeconds)} remaining</span>
          </div>
          <div
            className="w-full h-2 rounded-sm overflow-hidden border"
            style={{ backgroundColor: 'var(--theme-surface-subtle)', borderColor: 'var(--theme-card-border)' }}
          >
            <div
              className="h-full rounded-xs transition-all duration-200"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: 'var(--theme-accent)',
              }}
            />
          </div>
        </div>

        {/* Massive Touch Buttons */}
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {/* -15s Button */}
          <button
            onClick={onSkipBackward15}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex flex-col items-center justify-center border transition-all shadow-sm active:scale-95 cursor-pointer hover:opacity-85"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-primary)',
            }}
            title="Rewind 15 seconds"
          >
            <RotateCcw className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-0.5">15s</span>
          </button>

          {/* Previous Sentence */}
          <button
            onClick={onPrevSentence}
            disabled={currentSentenceIndex <= 0}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center border transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-30 hover:opacity-85"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-primary)',
            }}
            title="Previous sentence"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {/* Giant Play/Pause Primary */}
          <button
            onClick={onTogglePlay}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer hover:opacity-90 border border-white/20"
            style={{ backgroundColor: 'var(--theme-accent)' }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 fill-current" />
            ) : (
              <Play className="w-10 h-10 fill-current ml-1" />
            )}
          </button>

          {/* Next Sentence */}
          <button
            onClick={onNextSentence}
            disabled={currentSentenceIndex >= totalSentences - 1}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center border transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-30 hover:opacity-85"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-primary)',
            }}
            title="Next sentence"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          {/* +15s Button */}
          <button
            onClick={onSkipForward15}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex flex-col items-center justify-center border transition-all shadow-sm active:scale-95 cursor-pointer hover:opacity-85"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-primary)',
            }}
            title="Forward 15 seconds"
          >
            <RotateCw className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-0.5">15s</span>
          </button>
        </div>

        {/* Speed Quick Selector */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[0.75, 1.0, 1.25, 1.5].map((rate) => {
            const isSelected = playbackRate === rate;
            return (
              <button
                key={rate}
                onClick={() => onSetRate(rate)}
                className="px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-bg)',
                  color: isSelected ? '#ffffff' : 'var(--theme-text-muted)',
                  border: isSelected ? '1px solid var(--theme-accent)' : '1px solid var(--theme-card-border)',
                }}
              >
                {rate}x Speed
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
