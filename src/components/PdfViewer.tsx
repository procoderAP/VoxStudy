import React, { useEffect, useRef, useMemo } from 'react';
import { CourseDocument, SentenceItem } from '../types';
import { HelpCircle, Play, FileText, Clock, AlignLeft, ChevronRight, BookOpen, Palette } from 'lucide-react';

interface PdfViewerProps {
  document: CourseDocument | null;
  currentSentenceIndex: number;
  isPlaying: boolean;
  isBuffering?: boolean;
  activeTheme?: string;
  onSentenceClick: (index: number) => void;
  onAskDoubt: (sentence: SentenceItem) => void;
  onAskCustomDoubt: (selectedText: string) => void;
  onOpenThemeSelector?: () => void;
  onOpenHowToUse?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  document,
  currentSentenceIndex,
  isPlaying,
  isBuffering = false,
  activeTheme,
  onSentenceClick,
  onAskDoubt,
  onOpenThemeSelector,
  onOpenHowToUse,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeSentenceRef = useRef<HTMLSpanElement | null>(null);

  // Map each sentence ID and text to its exact global index in document.sentences
  const sentenceIndexMap = useMemo(() => {
    const idMap = new Map<string, number>();
    const textMap = new Map<string, number>();
    if (document?.sentences) {
      document.sentences.forEach((s, idx) => {
        idMap.set(s.id, idx);
        if (!textMap.has(s.text.trim())) {
          textMap.set(s.text.trim(), idx);
        }
      });
    }
    return { idMap, textMap };
  }, [document?.sentences]);

  // Smoothly move the page downwards when the karaoke highlight box is about to reach the bottom of the page
  useEffect(() => {
    const container = containerRef.current;

    // CRITICAL: When paused, stopped, or buffering/loading, NEVER scroll the page!
    if (!isPlaying || isBuffering) {
      if (container) {
        // Instantly halt any running smooth scroll when user hits pause
        container.scrollTo({ top: container.scrollTop, behavior: 'instant' });
      }
      return;
    }

    if (!container) return;

    // Use requestAnimationFrame to ensure layout has been painted
    const rafId = requestAnimationFrame(() => {
      // Re-verify still actively playing and not paused or buffering
      if (!isPlaying || isBuffering) return;

      // Find active element via ref or direct data attribute query
      const activeEl =
        activeSentenceRef.current ||
        (container.querySelector(`[data-sentence-index="${currentSentenceIndex}"]`) as HTMLElement | null);

      if (!activeEl) return;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      // The bottom media player floats at the bottom (height ~80px).
      // When the karaoke highlighting box gets within 240px of the container's bottom edge,
      // it is approaching the bottom of the visible page.
      const bottomThreshold = 240;
      const topThreshold = 80;

      if (activeRect.bottom > containerRect.bottom - bottomThreshold) {
        // Karaoke box is about to reach the bottom!
        // Smoothly roll the page downwards so the active sentence moves back up to the top third (~140px from container top).
        // This keeps upcoming sentences clearly visible ahead without continuous jerky micro-scrolling.
        const scrollDelta = activeRect.top - (containerRect.top + 140);
        const targetScroll = Math.max(scrollDelta, 180);

        if (container.scrollHeight > container.clientHeight) {
          container.scrollBy({
            top: targetScroll,
            behavior: 'smooth',
          });
        }
      } else if (activeRect.top < containerRect.top + topThreshold) {
        // If karaoke box is scrolled above the visible top area (e.g. user clicked back or rewound)
        const scrollDelta = activeRect.top - (containerRect.top + 100);

        if (container.scrollHeight > container.clientHeight) {
          container.scrollBy({
            top: scrollDelta,
            behavior: 'smooth',
          });
        }
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [currentSentenceIndex, isPlaying, isBuffering]);

  if (!document || !document.sentences || document.sentences.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center p-8 text-center transition-colors"
        style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-primary)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            borderColor: 'var(--theme-card-border)',
            color: 'var(--theme-accent)',
          }}
        >
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">
          No Course Notes Loaded
        </h2>
        <p
          className="text-sm max-w-md mb-6"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          Select a course from your curriculum or upload your own PDF notes to begin reading and listening.
        </p>
      </div>
    );
  }

  // Calculate metadata stats
  const totalWords = document.sentences.reduce((sum, s) => sum + s.text.split(/\s+/).length, 0);
  const estimatedMins = Math.ceil(totalWords / 135);

  // Group sentences by page
  const pagesData: { pageNumber: number; sentences: SentenceItem[] }[] = [];

  if (document.pages && document.pages.length > 0) {
    document.pages.forEach(p => {
      pagesData.push({ pageNumber: p.pageNumber, sentences: p.sentences });
    });
  } else {
    const pageMap = new Map<number, SentenceItem[]>();
    document.sentences.forEach(s => {
      const pNum = s.pageNumber || 1;
      if (!pageMap.has(pNum)) pageMap.set(pNum, []);
      pageMap.get(pNum)!.push(s);
    });

    pageMap.forEach((sList, pNum) => {
      pagesData.push({ pageNumber: pNum, sentences: sList });
    });
  }

  // Render sentence with theme-driven karaoke highlight
  const renderSentenceSpan = (sentence: SentenceItem, globalIdx: number) => {
    const isActive = globalIdx === currentSentenceIndex;

    return (
      <span
        key={sentence.id}
        ref={isActive ? activeSentenceRef : null}
        data-sentence-id={sentence.id}
        data-sentence-index={globalIdx}
        onClick={(e) => {
          e.stopPropagation();
          onSentenceClick(globalIdx);
        }}
        style={isActive ? {
          backgroundColor: 'var(--theme-highlight-bg)',
          color: 'var(--theme-highlight-text)',
          boxShadow: '0 0 0 2.5px var(--theme-highlight-ring)',
        } : undefined}
        className={`group relative inline cursor-pointer transition-all duration-200 rounded px-1.5 py-0.5 ${
          isActive
            ? 'font-medium shadow-sm'
            : 'hover:bg-black/5 dark:hover:bg-white/10'
        }`}
      >
        {sentence.text}{' '}

        {/* Live reading indicator beacon */}
        {isActive && isPlaying && (
          <span className="inline-flex items-center mx-1 align-middle" title="Speaking this sentence">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: 'var(--theme-highlight-ring)' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: 'var(--theme-highlight-ring)' }}
              />
            </span>
          </span>
        )}

        {/* Hover affordances */}
        <span className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 align-middle ml-1 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSentenceClick(globalIdx);
            }}
            title="Play from this sentence"
            className="p-1 rounded bg-black/10 dark:bg-white/15 hover:bg-blue-600 hover:text-white transition-colors"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAskDoubt(sentence);
            }}
            title="Ask a doubt on this concept"
            className="p-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white transition-colors"
          >
            <HelpCircle className="w-2.5 h-2.5" />
          </button>
        </span>
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-10 py-8 transition-colors pb-44"
      style={{ backgroundColor: 'var(--theme-bg)' }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Document Global Header Strip */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-lg border shadow-sm text-xs transition-colors"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            borderColor: 'var(--theme-card-border)',
            color: 'var(--theme-text-primary)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold truncate max-w-[280px] sm:max-w-lg text-sm" style={{ color: 'var(--theme-text-primary)' }}>
              {document.title}
            </span>
            <span style={{ color: 'var(--theme-text-muted)' }}>·</span>
            <span className="flex items-center gap-1" style={{ color: 'var(--theme-text-muted)' }}>
              <Clock className="w-3.5 h-3.5" />
              {estimatedMins} min listen
            </span>
            <span style={{ color: 'var(--theme-text-muted)' }}>·</span>
            <span className="flex items-center gap-1" style={{ color: 'var(--theme-text-muted)' }}>
              <AlignLeft className="w-3.5 h-3.5" />
              {pagesData.length} {pagesData.length === 1 ? 'page' : 'pages'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenThemeSelector && (
              <button
                onClick={onOpenThemeSelector}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
                title="Change reading theme for this course"
              >
                <Palette className="w-3 h-3 text-emerald-500" />
                <span>Theme: <strong className="capitalize">{activeTheme === 'matrix' ? 'Matrix ★' : activeTheme || 'Paper'}</strong></span>
              </button>
            )}

            {onOpenHowToUse && (
              <button
                onClick={onOpenHowToUse}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-muted)',
                }}
                title="How to use VoxStudy: Full user guide"
              >
                <HelpCircle className="w-3 h-3 text-amber-500" />
                <span className="hidden sm:inline">Guide</span>
              </button>
            )}

            <span className="text-[11px] font-medium hidden md:inline ml-1" style={{ color: 'var(--theme-text-muted)' }}>
              Click sentence to play
            </span>
          </div>
        </div>

        {/* Render Each Page as an Authentic Pristine PDF Sheet (Squared-off Paper Card Folio Edge) */}
        {pagesData.map((page) => {
          return (
            <article
              key={`page-${page.pageNumber}`}
              className="rounded-lg shadow-sm border p-6 sm:p-12 md:p-16 transition-colors relative"
              style={{
                backgroundColor: 'var(--theme-paper-bg)',
                borderColor: 'var(--theme-paper-border)',
                color: 'var(--theme-paper-text)',
              }}
            >
              {/* PDF Sheet Header Bar */}
              <div
                className="flex items-center justify-between border-b pb-4 mb-8 text-[11px] font-mono uppercase tracking-wider"
                style={{
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-muted)',
                }}
              >
                <div className="flex items-center gap-2 truncate max-w-[280px] sm:max-w-md">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--theme-accent)' }} />
                  <span className="truncate">{document.title}</span>
                </div>
                <span
                  className="shrink-0 px-2.5 py-1 rounded-md font-semibold text-xs border"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  Page {page.pageNumber} of {pagesData.length}
                </span>
              </div>

              {/* Exact Authentic PDF Page Text Layout */}
              <div className="space-y-4">
                {page.sentences.map((sentence) => {
                  let resolvedIdx = sentenceIndexMap.idMap.get(sentence.id);
                  if (resolvedIdx === undefined) {
                    resolvedIdx = sentenceIndexMap.textMap.get(sentence.text.trim());
                  }
                  if (resolvedIdx === undefined) {
                    resolvedIdx = 0;
                  }
                  const type = sentence.blockType || 'paragraph';

                  if (type === 'heading-1') {
                    return (
                      <h2
                        key={sentence.id}
                        className="text-xl sm:text-2xl font-extrabold pt-4 pb-2 tracking-tight border-b"
                        style={{
                          borderColor: 'var(--theme-card-border)',
                          color: 'var(--theme-paper-text)',
                        }}
                      >
                        {renderSentenceSpan(sentence, resolvedIdx)}
                      </h2>
                    );
                  }

                  if (type === 'heading-2') {
                    return (
                      <h3
                        key={sentence.id}
                        className="text-base sm:text-lg font-bold pt-3 pb-1 tracking-tight"
                        style={{ color: 'var(--theme-accent)' }}
                      >
                        {renderSentenceSpan(sentence, resolvedIdx)}
                      </h3>
                    );
                  }

                  if (type === 'list-item') {
                    return (
                      <div
                        key={sentence.id}
                        className="flex items-start gap-2.5 my-1.5 pl-2 text-[15px] sm:text-base leading-relaxed"
                      >
                        <ChevronRight
                          className="w-3.5 h-3.5 shrink-0 mt-1"
                          style={{ color: 'var(--theme-accent)' }}
                        />
                        <div className="flex-1">
                          {renderSentenceSpan(sentence, resolvedIdx)}
                        </div>
                      </div>
                    );
                  }

                  if (type === 'table-row') {
                    return (
                      <div
                        key={sentence.id}
                        className="my-2 px-4 py-2.5 rounded-xl border font-mono text-xs sm:text-sm"
                        style={{
                          backgroundColor: 'var(--theme-surface-subtle)',
                          borderColor: 'var(--theme-card-border)',
                        }}
                      >
                        {renderSentenceSpan(sentence, resolvedIdx)}
                      </div>
                    );
                  }

                  // Default: High-fidelity paragraph
                  return (
                    <p
                      key={sentence.id}
                      className="font-serif text-[16px] sm:text-[17px] leading-[1.8] my-3"
                    >
                      {renderSentenceSpan(sentence, resolvedIdx)}
                    </p>
                  );
                })}
              </div>

              {/* PDF Sheet Footer */}
              <div
                className="mt-12 pt-4 border-t flex items-center justify-between text-[11px]"
                style={{
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-muted)',
                }}
              >
                <span>BITS Pilani Dubai Campus · Student Course Notes</span>
                <span>Page {page.pageNumber}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
