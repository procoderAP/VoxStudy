import React, { useState, useEffect } from 'react';
import { CourseDocument, AutonomousStudyNotes, FlashcardItem } from '../types';
import { synthesizeStudyNotes } from '../services/apiService';
import { Sparkles, X, BookOpen, Layers, Check, RotateCw, Copy, CheckCheck, RefreshCw } from 'lucide-react';

interface AiStudyNotesModalProps {
  isOpen: boolean;
  document: CourseDocument | null;
  branchName: string;
  year: string;
  onClose: () => void;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return String(Math.abs(hash));
}

export const AiStudyNotesModal: React.FC<AiStudyNotesModalProps> = ({
  isOpen,
  document,
  branchName,
  year,
  onClose,
}) => {
  const [depth, setDepth] = useState<'short' | 'full'>('short');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<AutonomousStudyNotes | null>(null);
  const [activeTab, setActiveTab] = useState<'cheat-sheet' | 'flashcards'>('cheat-sheet');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Check if notes already exist in cache on modal open or depth change, but DO NOT auto-generate!
  useEffect(() => {
    if (!isOpen || !document) {
      setNotes(null);
      return;
    }

    const cacheKey = `vox_synth_${depth}_${hashString(document.rawText.slice(0, 300))}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setNotes(JSON.parse(cached));
      } catch {
        setNotes(null);
      }
    } else {
      setNotes(null); // Wait for user to click Generate button
    }
  }, [isOpen, document?.id, depth]);

  const handleGenerate = async () => {
    if (!document) return;
    setLoading(true);
    try {
      const res = await synthesizeStudyNotes(
        document.rawText,
        document.title,
        depth,
        branchName,
        year
      );
      setNotes(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = () => {
    if (!notes) return;
    const text = `VoxStudy Notes: ${notes.title}\n\nOverview:\n${notes.overview}\n\nKey Takeaways:\n${notes.keyTakeaways.map((k) => `• ${k}`).join('\n')}\n\nCheat Sheet:\n${notes.cheatSheetItems.map((c) => `${c.concept}: ${c.formulaOrLaw}\n- ${c.plainEnglishExplanation}\n- Exam Tip: ${c.examTip}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const totalCards = notes?.flashcards?.length || 0;
  const masteredCount = Object.values(masteredCards).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl rounded-lg shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{
            borderColor: 'var(--theme-card-border)',
            backgroundColor: 'var(--theme-surface-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-md text-white shadow-sm"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                AI Study Companion Deck
              </h2>
              <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                {document?.title || 'Course Material'} · {branchName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Short vs Full Summary Selector */}
            <div
              className="flex items-center p-0.5 rounded-md border text-xs"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              <button
                onClick={() => setDepth('short')}
                className="px-2.5 py-1 rounded-[5px] text-xs transition-all cursor-pointer font-medium"
                style={{
                  backgroundColor: depth === 'short' ? 'var(--theme-surface-subtle)' : 'transparent',
                  color: depth === 'short' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
                  border: depth === 'short' ? '1px solid var(--theme-card-border)' : '1px solid transparent',
                  fontWeight: depth === 'short' ? 600 : 500,
                }}
              >
                Short Summary
              </button>
              <button
                onClick={() => setDepth('full')}
                className="px-2.5 py-1 rounded-[5px] text-xs transition-all cursor-pointer font-medium"
                style={{
                  backgroundColor: depth === 'full' ? 'var(--theme-surface-subtle)' : 'transparent',
                  color: depth === 'full' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
                  border: depth === 'full' ? '1px solid var(--theme-card-border)' : '1px solid transparent',
                  fontWeight: depth === 'full' ? 600 : 500,
                }}
              >
                Full Cheat Sheet
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md transition-opacity hover:opacity-75 cursor-pointer"
              style={{ color: 'var(--theme-text-muted)' }}
              aria-label="Close notes modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If notes are already loaded/cached: show sub-nav and content */}
        {notes && !loading && (
          <div
            className="flex items-center justify-between px-6 py-2.5 border-b text-xs shrink-0"
            style={{
              borderColor: 'var(--theme-card-border)',
              backgroundColor: 'var(--theme-surface-subtle)',
            }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('cheat-sheet')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: activeTab === 'cheat-sheet' ? 'var(--theme-card-bg)' : 'transparent',
                  color: activeTab === 'cheat-sheet' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
                  border: activeTab === 'cheat-sheet' ? '1px solid var(--theme-card-border)' : '1px solid transparent',
                }}
              >
                <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
                <span>Structured Cheat Sheet</span>
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: activeTab === 'flashcards' ? 'var(--theme-card-bg)' : 'transparent',
                  color: activeTab === 'flashcards' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
                  border: activeTab === 'flashcards' ? '1px solid var(--theme-card-border)' : '1px solid transparent',
                }}
              >
                <Layers className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
                <span>Interactive Flashcards ({masteredCount}/{totalCards})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                title="Regenerate notes"
                className="flex items-center gap-1 transition-opacity hover:opacity-75 p-1 cursor-pointer"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 transition-opacity hover:opacity-75 ml-2 cursor-pointer"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Initial State: Prompt with button to generate notes */}
          {!notes && !loading && (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div
                className="w-14 h-14 rounded-md border flex items-center justify-center mb-5 shadow-sm"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-accent)',
                }}
              >
                <Sparkles className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-extrabold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
                Generate AI Study Companion Deck
              </h3>

              <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--theme-text-muted)' }}>
                VoxStudy's AI will analyze your notes for <strong>{document?.title}</strong>, extracting core formulas, rules, exam tips, and 3D flashcards.
              </p>

              {/* Mode indicator */}
              <div
                className="p-3 rounded-md border w-full text-xs mb-6 text-left"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-muted)',
                }}
              >
                <div className="font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                  Selected Format: {depth === 'short' ? '⚡ Short Summary (5-Min Recap)' : '📚 Full In-Depth Cheat Sheet'}
                </div>
                <div>
                  {depth === 'short'
                    ? 'Condensed key takeaways and essential flashcards for rapid revision.'
                    : 'Comprehensive chapter breakdown, formula tables, exam tips, and detailed card deck.'}
                </div>
              </div>

              {/* Explicit User Button */}
              <button
                onClick={handleGenerate}
                className="w-full py-3.5 px-6 rounded-md text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Generate Cheat Sheet &amp; Flashcards</span>
              </button>

              <div className="text-[11px] mt-3" style={{ color: 'var(--theme-text-muted)' }}>
                Zero background calls · Generates only on demand
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
              <div
                className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4"
                style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }}
              />
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                Synthesizing Notes &amp; Flashcards...
              </div>
              <p className="text-xs max-w-sm" style={{ color: 'var(--theme-text-muted)' }}>
                Extracting formulas, definitions, and high-yield exam takeaways for {document?.title}.
              </p>
            </div>
          )}

          {/* Generated Cheat Sheet View */}
          {!loading && notes && activeTab === 'cheat-sheet' && (
            <div className="space-y-6">
              {/* Reference Book Grounding Badge if generated by Copilot or from textbook */}
              {notes.referenceBook && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  <BookOpen className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-accent)' }} />
                  <span>Grounded in Textbook: {notes.referenceBook}</span>
                </div>
              )}

              {/* Executive Summary */}
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  Executive Summary ({depth === 'short' ? '5-Min High-Yield Recap' : 'Comprehensive Breakdown'})
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>
                  {notes.overview}
                </p>
              </div>

              {/* Key Takeaways */}
              <div>
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-2.5"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  Core Key Takeaways
                </h3>
                <div className="space-y-2">
                  {notes.keyTakeaways.map((takeaway, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-md border text-xs sm:text-sm"
                      style={{
                        backgroundColor: 'var(--theme-surface-subtle)',
                        borderColor: 'var(--theme-card-border)',
                        color: 'var(--theme-text-primary)',
                      }}
                    >
                      <span className="font-bold mt-0.5" style={{ color: 'var(--theme-accent)' }}>
                        0{idx + 1}.
                      </span>
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structured Cheat Sheet Table */}
              <div>
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-2.5"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  Formulas &amp; Rules Cheat Sheet
                </h3>
                <div className="space-y-3">
                  {notes.cheatSheetItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-md border space-y-2"
                      style={{
                        backgroundColor: 'var(--theme-card-bg)',
                        borderColor: 'var(--theme-card-border)',
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                          {item.concept}
                        </span>
                        <code
                          className="text-xs font-mono px-2 py-0.5 rounded font-semibold border"
                          style={{
                            backgroundColor: 'var(--theme-surface-subtle)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-accent)',
                          }}
                        >
                          {item.formulaOrLaw}
                        </code>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                        {item.plainEnglishExplanation}
                      </p>
                      <div
                        className="text-[11px] px-2.5 py-1.5 rounded-md border"
                        style={{
                          backgroundColor: 'var(--theme-surface-subtle)',
                          borderColor: 'var(--theme-card-border)',
                          color: 'var(--theme-text-primary)',
                        }}
                      >
                        <span className="font-semibold" style={{ color: 'var(--theme-accent)' }}>
                          Exam Tip:{' '}
                        </span>
                        {item.examTip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mnemonics */}
              {notes.mnemonicAids && notes.mnemonicAids.length > 0 && (
                <div>
                  <h3
                    className="text-xs font-bold uppercase tracking-wider mb-2.5"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    Memory Aids &amp; Mnemonics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {notes.mnemonicAids.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-md border"
                        style={{
                          backgroundColor: 'var(--theme-surface-subtle)',
                          borderColor: 'var(--theme-card-border)',
                        }}
                      >
                        <div className="font-mono text-sm font-bold mb-1" style={{ color: 'var(--theme-accent)' }}>
                          {m.mnemonic}
                        </div>
                        <div className="text-xs font-medium mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                          {m.meaning}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                          {m.application}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generated Flashcards View */}
          {!loading && notes && activeTab === 'flashcards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                <span>Click any card to flip and reveal the answer.</span>
                <span className="font-mono tabular-nums font-semibold" style={{ color: 'var(--theme-accent)' }}>
                  {masteredCount} of {totalCards} mastered
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notes.flashcards.map((card: FlashcardItem) => {
                  const isFlipped = !!flippedCards[card.id];
                  const isMastered = !!masteredCards[card.id];

                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleFlip(card.id)}
                      className="min-h-[180px] p-5 rounded-md border cursor-pointer transition-all flex flex-col justify-between select-none shadow-sm"
                      style={{
                        backgroundColor: isMastered
                          ? 'var(--theme-surface-subtle)'
                          : isFlipped
                          ? 'var(--theme-surface-subtle)'
                          : 'var(--theme-card-bg)',
                        borderColor: isMastered
                          ? 'rgb(16, 185, 129)'
                          : isFlipped
                          ? 'var(--theme-accent)'
                          : 'var(--theme-card-border)',
                      }}
                    >
                      <div>
                        <div
                          className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-wider font-semibold"
                          style={{ color: 'var(--theme-text-muted)' }}
                        >
                          <span>{card.tag}</span>
                          <span className="flex items-center gap-1" style={{ color: 'var(--theme-accent)' }}>
                            <RotateCw className="w-2.5 h-2.5" />
                            {isFlipped ? 'Answer' : 'Question'}
                          </span>
                        </div>

                        <div className="text-sm font-medium leading-snug" style={{ color: 'var(--theme-text-primary)' }}>
                          {isFlipped ? card.back : card.front}
                        </div>

                        {!isFlipped && card.hint && (
                          <div className="mt-3 text-[11px] italic" style={{ color: 'var(--theme-text-muted)' }}>
                            Hint: {card.hint}
                          </div>
                        )}
                      </div>

                      <div
                        className="flex items-center justify-between pt-3 border-t mt-3"
                        style={{ borderColor: 'var(--theme-card-border)' }}
                      >
                        <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
                          {isFlipped ? 'Tap to flip back' : 'Tap to reveal answer'}
                        </span>
                        <button
                          onClick={(e) => toggleMastered(card.id, e)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                          style={{
                            backgroundColor: isMastered ? 'rgb(16, 185, 129)' : 'var(--theme-surface-subtle)',
                            color: isMastered ? '#ffffff' : 'var(--theme-text-primary)',
                            border: isMastered ? 'none' : '1px solid var(--theme-card-border)',
                          }}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
