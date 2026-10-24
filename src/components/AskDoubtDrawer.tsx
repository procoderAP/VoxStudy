import React, { useState } from 'react';
import { SentenceItem, AskDoubtResponse } from '../types';
import { askDoubt } from '../services/apiService';
import { Sparkles, X, Send, Lightbulb, Wrench, BookmarkCheck, CheckCircle2, XCircle } from 'lucide-react';

interface AskDoubtDrawerProps {
  isOpen: boolean;
  sentence: SentenceItem | null;
  courseTitle: string;
  branchName: string;
  year: string;
  onClose: () => void;
}

export const AskDoubtDrawer: React.FC<AskDoubtDrawerProps> = ({
  isOpen,
  sentence,
  courseTitle,
  branchName,
  year,
  onClose,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskDoubtResponse | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState(false);

  // Trigger query when opened with sentence
  React.useEffect(() => {
    if (isOpen && sentence) {
      handleFetchDoubt(sentence.text);
    } else if (!isOpen) {
      setResult(null);
      setCustomQuestion('');
      setSelectedQuizAnswer(null);
      setHasSubmittedQuiz(false);
    }
  }, [isOpen, sentence?.id]);

  const handleFetchDoubt = async (textSnippet: string, userQ?: string) => {
    setLoading(true);
    setSelectedQuizAnswer(null);
    setHasSubmittedQuiz(false);
    try {
      const res = await askDoubt(textSnippet, userQ, courseTitle, branchName, year);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() && !sentence) return;
    handleFetchDoubt(sentence?.text || '', customQuestion.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg h-full shadow-2xl border-l flex flex-col transition-colors"
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
            borderColor: 'var(--theme-card-border)',
            backgroundColor: 'var(--theme-surface-subtle)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-md text-white shadow-sm"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Ask a Doubt · Concept Simplifier
              </h2>
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                {branchName} · {courseTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-opacity hover:opacity-75 cursor-pointer"
            style={{ color: 'var(--theme-text-muted)' }}
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Highlighted Statement from Notes */}
          {sentence && (
            <div
              className="p-4 rounded-md border"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-1"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Statement from your course notes
              </div>
              <blockquote className="text-sm font-serif italic" style={{ color: 'var(--theme-text-primary)' }}>
                "{sentence.text}"
              </blockquote>
            </div>
          )}

          {/* Ask Specific Doubt Input Form */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask a specific question on this passage..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-md border focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
                color: 'var(--theme-text-primary)',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 rounded-md" style={{ backgroundColor: 'var(--theme-surface-subtle)' }} />
              <div className="h-20 rounded-md" style={{ backgroundColor: 'var(--theme-surface-subtle)' }} />
              <div className="h-16 rounded-md" style={{ backgroundColor: 'var(--theme-surface-subtle)' }} />
            </div>
          )}

          {/* AI Explanation Result */}
          {!loading && result && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* 1. Simple Everyday Analogy */}
              <div
                className="p-4 rounded-md border"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: 'var(--theme-accent)' }}>
                  <Lightbulb className="w-4 h-4" />
                  <span>In Plain English (The Analogy)</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>
                  {result.simpleExplanation}
                </p>
              </div>

              {/* 2. Real World / Practical Context */}
              <div
                className="p-4 rounded-md border"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: 'var(--theme-accent)' }}>
                  <Wrench className="w-4 h-4" />
                  <span>Real World &amp; Practical Application</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>
                  {result.engineeringContext}
                </p>
              </div>

              {/* 3. Key Takeaway & Memory Hook */}
              <div
                className="p-4 rounded-md border space-y-2"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--theme-accent)' }}>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Key Exam Takeaway</span>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                  {result.keyTakeaway}
                </p>
                {result.memoryHook && (
                  <div className="text-xs pt-1 font-mono opacity-85" style={{ color: 'var(--theme-accent)' }}>
                    💡 {result.memoryHook}
                  </div>
                )}
              </div>

              {/* 4. Quick Comprehension Check */}
              {result.quickCheckQuestion && (
                <div
                  className="p-4 rounded-md border"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                  }}
                >
                  <div className="text-xs font-bold mb-2" style={{ color: 'var(--theme-text-muted)' }}>
                    Quick Sanity Check: Test Your Intuition
                  </div>
                  <p className="text-xs font-medium mb-3" style={{ color: 'var(--theme-text-primary)' }}>
                    {result.quickCheckQuestion.question}
                  </p>

                  <div className="space-y-2">
                    {result.quickCheckQuestion.options.map((opt, i) => {
                      const isSelected = selectedQuizAnswer === i;
                      const isCorrect = i === result.quickCheckQuestion!.correctIndex;

                      let btnBg = 'var(--theme-card-bg)';
                      let btnBorder = 'var(--theme-card-border)';
                      let btnColor = 'var(--theme-text-primary)';

                      if (hasSubmittedQuiz) {
                        if (isCorrect) {
                          btnBg = 'rgba(16, 185, 129, 0.15)';
                          btnBorder = 'rgb(16, 185, 129)';
                          btnColor = 'rgb(16, 185, 129)';
                        } else if (isSelected) {
                          btnBg = 'rgba(244, 63, 94, 0.15)';
                          btnBorder = 'rgb(244, 63, 94)';
                          btnColor = 'rgb(244, 63, 94)';
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={hasSubmittedQuiz}
                          onClick={() => {
                            setSelectedQuizAnswer(i);
                            setHasSubmittedQuiz(true);
                          }}
                          className="w-full text-left p-2.5 rounded-md text-xs font-medium border transition-all cursor-pointer"
                          style={{
                            backgroundColor: btnBg,
                            borderColor: btnBorder,
                            color: btnColor,
                            opacity: hasSubmittedQuiz && !isCorrect && !isSelected ? 0.5 : 1,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {hasSubmittedQuiz && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                            )}
                            {hasSubmittedQuiz && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {hasSubmittedQuiz && (
                    <div
                      className="mt-3 p-2.5 rounded-md border text-[11px]"
                      style={{
                        backgroundColor: 'var(--theme-card-bg)',
                        borderColor: 'var(--theme-card-border)',
                        color: 'var(--theme-text-muted)',
                      }}
                    >
                      <span className="font-semibold" style={{ color: 'var(--theme-accent)' }}>Explanation: </span>
                      {result.quickCheckQuestion.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
