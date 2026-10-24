import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Palette,
  Volume2,
  BookOpen,
  FileText,
  Sliders,
  CheckCircle2,
  Play,
  ArrowRight,
  Layers,
  GraduationCap,
  RotateCcw,
  Copy,
  Check,
  RotateCw,
} from 'lucide-react';
import {
  CopilotMessage,
  CopilotAction,
  AutonomousStudyNotes,
  CourseDocument,
  AppTheme,
  PlaybackMode,
} from '../types';
import { sendCopilotMessage, synthesizeStudyNotes } from '../services/apiService';

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return String(Math.abs(hash));
}

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: AppTheme;
  currentDoc: CourseDocument | null;
  currentBranchName: string;
  currentYear: string;
  playbackRate: number;
  narrationMode: PlaybackMode;
  isPlaying: boolean;
  activeVoiceName: string;
  currentView?: 'home' | 'reader';
  onSelectTheme: (theme: AppTheme) => void;
  onSelectVoice: (engine: 'studio' | 'browser', voiceName?: string) => void;
  onSetRate: (rate: number) => void;
  onSetMode: (mode: PlaybackMode) => void;
  onOpenCourseByQuery: (query: string, startPlaying?: boolean) => void;
  onAudioAction: (action: string) => void;
  onNavigateView: (view: 'home' | 'reader' | 'study-notes' | 'commute') => void;
  onSaveGeneratedNotes: (notes: AutonomousStudyNotes) => void;
}

// Helper to parse inline markdown (bold **text**, inline `code`, etc.)
function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-inherit opacity-95">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-mono bg-black/10 dark:bg-white/10 font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Clean Markdown renderer that fixes raw asterisks and formats bold, bullets, numbered lists, and headings
function CopilotMessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <span>{content}</span>;
  }

  const rawLines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    if (listBuffer.type === 'ul') {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-1.5 space-y-1.5 pl-0.5">
          {listBuffer.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
              <span
                className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              />
              <span className="flex-1">{renderInlineFormatting(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-1.5 space-y-1.5 pl-0.5">
          {listBuffer.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
              <span
                className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 text-white"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                {idx + 1}
              </span>
              <span className="flex-1">{renderInlineFormatting(item)}</span>
            </li>
          ))}
        </ol>
      );
    }
    listBuffer = null;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) {
      flushList();
      continue;
    }

    // Markdown headers (### Header) or standalone bold headers (**Executive Concept Overview**)
    const headerMatch = line.match(/^#{1,4}\s+(.+)$/);
    const standaloneBoldHeaderMatch = line.match(/^\*\*([^*]+)\*\*:?$/);

    if (headerMatch || standaloneBoldHeaderMatch) {
      flushList();
      const headerTitle = headerMatch ? headerMatch[1] : standaloneBoldHeaderMatch![1];
      elements.push(
        <div
          key={`h-${i}`}
          className="pt-2 pb-0.5 font-bold text-xs sm:text-sm flex items-center gap-1.5"
          style={{ color: 'var(--theme-accent)' }}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{headerTitle}</span>
        </div>
      );
      continue;
    }

    // Bullet item: * text, - text, • text
    const bulletMatch = line.match(/^[\*\-•]\s+(.+)$/);
    if (bulletMatch) {
      if (listBuffer && listBuffer.type !== 'ul') flushList();
      if (!listBuffer) listBuffer = { type: 'ul', items: [] };
      listBuffer.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered item: 1. text
    const numberedMatch = line.match(/^\d+[\.\)]\s+(.+)$/);
    if (numberedMatch) {
      if (listBuffer && listBuffer.type !== 'ol') flushList();
      if (!listBuffer) listBuffer = { type: 'ol', items: [] };
      listBuffer.items.push(numberedMatch[1]);
      continue;
    }

    // Paragraph line
    flushList();
    elements.push(
      <p key={`p-${i}`} className="my-1 leading-relaxed text-xs sm:text-sm">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

const QUICK_PROMPTS = [
  { label: "📚 Thomas' Calculus 15th Ed", prompt: "Create study notes and flashcards for Mathematics I from Thomas' Calculus 15th Edition" },
  { label: '🤖 Craig Robotics Kinematics', prompt: 'Create study notes for Kinematics from John Craig Introduction to Robotics textbook' },
  { label: 'Set Matrix Theme', prompt: 'Change app theme to Matrix' },
  { label: '🎙️ Free Voice: Jenny', prompt: 'Switch free voice to Jenny (Zero Credits)' },
  { label: '🎙️ Free Voice: Neerja', prompt: 'Switch free voice to Neerja (BITS Dubai Academic)' },
  { label: 'Better Natural Voice', prompt: 'Switch voice to Kore (Better natural voice)' },
  { label: 'Open Kinematics', prompt: 'Open Kinematics lecture notes and start audio' },
];

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  currentDoc,
  currentBranchName,
  currentYear,
  playbackRate,
  narrationMode,
  isPlaying,
  activeVoiceName,
  currentView = 'home',
  onSelectTheme,
  onSelectVoice,
  onSetRate,
  onSetMode,
  onOpenCourseByQuery,
  onAudioAction,
  onNavigateView,
  onSaveGeneratedNotes,
}) => {
  const [modalTab, setModalTab] = useState<'chat' | 'study-deck'>('chat');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingStage, setThinkingStage] = useState<string>('Analyzing academic syllabus...');
  
  // Study Deck Integrated State (Active in PDF reader mode)
  const [deckDepth, setDeckDepth] = useState<'short' | 'full'>('short');
  const [deckLoading, setDeckLoading] = useState(false);
  const [deckNotes, setDeckNotes] = useState<AutonomousStudyNotes | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Check cached deck notes on doc change or when copilot opens
  useEffect(() => {
    if (!currentDoc) {
      setDeckNotes(null);
      return;
    }
    const cacheKey = `vox_synth_${deckDepth}_${hashString(currentDoc.rawText.slice(0, 300))}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setDeckNotes(JSON.parse(cached));
      } catch {
        // use state
      }
    }
  }, [currentDoc?.id, deckDepth, isOpen]);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your study assistant.

Tell me what subject or topic you are studying, ask any question about your notes, or tell me to synthesize exam cheat sheets and flashcards. You can also control your reading desk anytime (change themes like Matrix, switch voices, adjust narration speed, or open courses).`,
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (modalTab === 'chat') {
          inputRef.current?.focus();
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, modalTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleExecuteActions = (actions: CopilotAction[], notes?: AutonomousStudyNotes) => {
    for (const act of actions) {
      const { tool, args } = act;

      if (tool === 'setTheme' && args.theme) {
        onSelectTheme(args.theme as AppTheme);
      } else if (tool === 'switchVoice') {
        onSelectVoice(args.engine || 'studio', args.voiceName);
      } else if (tool === 'setPlaybackSpeed' && typeof args.speed === 'number') {
        onSetRate(args.speed);
      } else if (tool === 'setPlaybackMode' && args.mode) {
        onSetMode(args.mode as PlaybackMode);
      } else if (tool === 'openCourse' && args.query) {
        onOpenCourseByQuery(args.query, args.startPlaying);
      } else if (tool === 'controlAudio' && args.action) {
        onAudioAction(args.action);
      } else if (tool === 'navigateView' && args.view) {
        if (args.view === 'study-notes') {
          setModalTab('study-deck');
        } else {
          onNavigateView(args.view as any);
        }
      } else if (tool === 'createCourseNotes' && notes) {
        setDeckNotes(notes);
        onSaveGeneratedNotes(notes);
      }
    }
  };

  const handleGenerateDocumentDeck = async () => {
    if (!currentDoc) return;
    setDeckLoading(true);
    try {
      const res = await synthesizeStudyNotes(
        currentDoc.rawText,
        currentDoc.title,
        deckDepth,
        currentBranchName,
        currentYear
      );
      setDeckNotes(res);
      onSaveGeneratedNotes(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDeckLoading(false);
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = () => {
    if (!deckNotes) return;
    const text = `VoxStudy Notes: ${deckNotes.title}\n${deckNotes.referenceBook ? `Grounded in: ${deckNotes.referenceBook}\n` : ''}\nOverview:\n${deckNotes.overview}\n\nKey Takeaways:\n${deckNotes.keyTakeaways.map(k => `• ${k}`).join('\n')}\n\nCheat Sheet:\n${deckNotes.cheatSheetItems.map(c => `${c.concept}: ${c.formulaOrLaw}\n- ${c.plainEnglishExplanation}\n- Exam Tip: ${c.examTip}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setThinkingStage('🧠 Analyzing question & course syllabus scope...');

    const stageTimer1 = setTimeout(() => {
      setThinkingStage('Cross-referencing textbook curriculum & standard theorems...');
    }, 600);

    const stageTimer2 = setTimeout(() => {
      setThinkingStage('Synthesizing spoken audio cadence & app controls...');
    }, 1100);

    const startTime = Date.now();

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendCopilotMessage({
        message: query,
        conversationHistory: historyPayload,
        currentContext: {
          currentCourse: currentDoc?.title,
          branch: currentBranchName,
          year: currentYear,
          activeTheme,
          playbackRate,
          playbackMode: narrationMode,
          isPlaying,
          voiceName: activeVoiceName,
        },
      });

      // Intentional deliberate pause (minimum 1.4 seconds) so the AI reasons carefully
      const elapsed = Date.now() - startTime;
      if (elapsed < 1400) {
        await new Promise((r) => setTimeout(r, 1400 - elapsed));
      }

      const assistantMsg: CopilotMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        actionsExecuted: response.actions,
        notesCreated: response.notesCreated,
      };

      if (response.notesCreated) {
        setDeckNotes(response.notesCreated);
      }

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically execute all app control actions returned by the AI
      if (response.actions && response.actions.length > 0) {
        handleExecuteActions(response.actions, response.notesCreated);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the AI model. You can still use quick app controls below!',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl h-[90vh] max-h-[780px] rounded-lg shadow-2xl flex flex-col border overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-primary)',
        }}
      >
        {/* Header Bar */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--theme-card-border)', backgroundColor: 'var(--theme-surface-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center text-white shadow-sm relative group"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">Study Assistant &amp; Notes</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Desk Controls · Syllabus Doubt Solver · Notes Maker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'reset',
                    role: 'assistant',
                    content: 'Conversation history reset. What would you like to study or change next?',
                    timestamp: Date.now(),
                  },
                ]);
              }}
              className="p-2 rounded-md text-xs hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: 'var(--theme-text-muted)' }}
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-xs hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              style={{ color: 'var(--theme-text-muted)' }}
              aria-label="Close copilot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* In PDF reader mode: Merged Switcher between AI Copilot Chat & Study Deck */}
        {currentView === 'reader' && (
          <div
            className="flex items-center gap-1 p-1 mx-4 sm:mx-5 my-2 rounded-md border text-xs font-semibold shrink-0"
            style={{ backgroundColor: 'var(--theme-surface-subtle)', borderColor: 'var(--theme-card-border)' }}
          >
            <button
              onClick={() => setModalTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                modalTab === 'chat' ? 'shadow-sm font-bold' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: modalTab === 'chat' ? 'var(--theme-card-bg)' : 'transparent',
                color: modalTab === 'chat' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
              }}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Copilot &amp; Tutor</span>
            </button>
            <button
              onClick={() => setModalTab('study-deck')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                modalTab === 'study-deck' ? 'shadow-sm font-bold' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: modalTab === 'study-deck' ? 'var(--theme-card-bg)' : 'transparent',
                color: modalTab === 'study-deck' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Study Deck &amp; 3D Flashcards</span>
              {deckNotes && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                  {deckNotes.flashcards?.length || 0}
                </span>
              )}
            </button>
          </div>
        )}

        {/* 1. COPILOT CHAT VIEW */}
        {modalTab === 'chat' ? (
          <>
            {/* Quick Suggestion Pills */}
            <div
              className="px-4 py-2 border-b flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none text-xs"
              style={{ borderColor: 'var(--theme-card-border)' }}
            >
              <span className="text-[11px] font-bold shrink-0 flex items-center gap-1" style={{ color: 'var(--theme-accent)' }}>
                <Sparkles className="w-3 h-3" /> Quick Commands:
              </span>
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.prompt)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-md text-xs font-medium shrink-0 border hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((m) => {
                const isUser = m.role === 'user';

                return (
                  <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-white shadow-sm"
                        style={{ backgroundColor: 'var(--theme-accent)' }}
                      >
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-2`}>
                      <div
                        className={`p-3.5 rounded-md text-xs sm:text-sm leading-relaxed shadow-sm border ${
                          isUser
                            ? 'text-white font-medium ml-auto'
                            : ''
                        }`}
                        style={
                          isUser
                            ? {
                                backgroundColor: 'var(--theme-accent)',
                                borderColor: 'var(--theme-accent)',
                              }
                            : {
                                backgroundColor: 'var(--theme-surface-subtle)',
                                borderColor: 'var(--theme-card-border)',
                                color: 'var(--theme-text-primary)',
                              }
                        }
                      >
                        <CopilotMessageContent content={m.content} isUser={isUser} />
                      </div>

                      {/* Render Executed Actions as Interactive Verified Tags */}
                      {m.actionsExecuted && m.actionsExecuted.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {m.actionsExecuted.map((act, aIdx) => (
                            <div
                              key={aIdx}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-[11px] font-semibold animate-in fade-in"
                              style={{
                                backgroundColor: 'var(--theme-accent-subtle)',
                                borderColor: 'var(--theme-accent)',
                                color: 'var(--theme-accent)',
                              }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>App Control Executed: {act.description}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Render Created Study Notes Card with Save & View Flashcards Button */}
                      {m.notesCreated && (
                        <div
                          className="p-3.5 rounded-md border space-y-2.5 mt-2 shadow-sm"
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-accent)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-accent)' }} />
                              <span className="font-bold text-xs">{m.notesCreated.title}</span>
                            </div>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border"
                              style={{
                                backgroundColor: 'var(--theme-accent-subtle)',
                                borderColor: 'var(--theme-card-border)',
                                color: 'var(--theme-accent)',
                              }}
                            >
                              {m.notesCreated.flashcards.length} Flashcards Created
                            </span>
                          </div>

                          {m.notesCreated.referenceBook && (
                            <div
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold"
                              style={{
                                backgroundColor: 'var(--theme-accent-subtle)',
                                borderColor: 'var(--theme-accent)',
                                color: 'var(--theme-accent)',
                              }}
                            >
                              <BookOpen className="w-3.5 h-3.5 shrink-0" />
                              <span>Grounded in Textbook: {m.notesCreated.referenceBook}</span>
                            </div>
                          )}

                          <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                            {m.notesCreated.overview}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                if (m.notesCreated) {
                                  onSaveGeneratedNotes(m.notesCreated);
                                  setDeckNotes(m.notesCreated);
                                  if (currentView === 'reader') {
                                    setModalTab('study-deck');
                                  } else {
                                    onNavigateView('study-notes');
                                    onClose();
                                  }
                                }
                              }}
                              className="px-3 py-1.5 rounded-md text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                              style={{ backgroundColor: 'var(--theme-accent)' }}
                            >
                              <span>Open Flashcards &amp; Study Deck</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: 'var(--theme-card-bg)',
                          borderColor: 'var(--theme-card-border)',
                          color: 'var(--theme-text-primary)',
                        }}
                      >
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Deliberate Reasoning / Thinking State */}
              {loading && (
                <div className="flex gap-3 items-start animate-in fade-in">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-white relative shadow-sm"
                    style={{ backgroundColor: 'var(--theme-accent)' }}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <div
                    className="p-3.5 rounded-md border space-y-1.5 max-w-[85%] text-xs shadow-sm"
                    style={{
                      backgroundColor: 'var(--theme-surface-subtle)',
                      borderColor: 'var(--theme-card-border)',
                    }}
                  >
                    <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--theme-accent)' }}>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Copilot is analyzing syllabus...</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                      <span className="w-1.5 h-1.5 rounded-xs shrink-0" style={{ backgroundColor: 'var(--theme-accent)' }} />
                      <span>{thinkingStage}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div
              className="p-3 sm:p-4 border-t shrink-0"
              style={{ borderColor: 'var(--theme-card-border)', backgroundColor: 'var(--theme-surface-subtle)' }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  placeholder="Ask anything or command app (e.g. 'Thomas Calculus 15th ed', 'Set theme to Matrix')..."
                  className="flex-1 px-4 py-2.5 rounded-md border text-xs sm:text-sm outline-none transition-all focus:ring-1"
                  style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-md text-white shadow-sm disabled:opacity-40 transition-all active:scale-95 cursor-pointer shrink-0"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* 2. MERGED STUDY DECK & 3D FLASHCARDS VIEW (IN READER MODE) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Study Deck Sub-Header */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-md border"
              style={{ backgroundColor: 'var(--theme-surface-subtle)', borderColor: 'var(--theme-card-border)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>Format:</span>
                <div className="flex items-center p-0.5 rounded-md border text-xs font-medium" style={{ borderColor: 'var(--theme-card-border)' }}>
                  <button
                    onClick={() => setDeckDepth('short')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      deckDepth === 'short' ? 'font-bold shadow-sm' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: deckDepth === 'short' ? 'var(--theme-card-bg)' : 'transparent',
                      color: deckDepth === 'short' ? 'var(--theme-accent)' : 'inherit',
                    }}
                  >
                    Short Summary
                  </button>
                  <button
                    onClick={() => setDeckDepth('full')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      deckDepth === 'full' ? 'font-bold shadow-sm' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: deckDepth === 'full' ? 'var(--theme-card-bg)' : 'transparent',
                      color: deckDepth === 'full' ? 'var(--theme-accent)' : 'inherit',
                    }}
                  >
                    Full Cheat Sheet
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {deckNotes && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Notes'}</span>
                  </button>
                )}
                <button
                  onClick={handleGenerateDocumentDeck}
                  disabled={deckLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${deckLoading ? 'animate-spin' : ''}`} />
                  <span>{deckNotes ? 'Regenerate' : 'Generate Deck'}</span>
                </button>
              </div>
            </div>

            {/* Deck Loading State */}
            {deckLoading && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }} />
                <p className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                  Synthesizing textbook formulas and interactive flashcards...
                </p>
              </div>
            )}

            {/* Deck Loaded Content */}
            {!deckLoading && deckNotes && (
              <div className="space-y-5">
                {deckNotes.referenceBook && (
                  <div
                    className="flex items-center gap-2 p-3 rounded-md border text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--theme-accent-subtle)',
                      borderColor: 'var(--theme-accent)',
                      color: 'var(--theme-accent)',
                    }}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Grounded in Textbook: {deckNotes.referenceBook}</span>
                  </div>
                )}

                {/* Executive Summary */}
                <div
                  className="p-4 rounded-md border space-y-1.5"
                  style={{ backgroundColor: 'var(--theme-surface-subtle)', borderColor: 'var(--theme-card-border)' }}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-accent)' }}>
                    Executive Summary ({deckDepth === 'short' ? '5-Min High-Yield' : 'Comprehensive Breakdown'})
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>
                    {deckNotes.overview}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--theme-text-primary)' }}>
                    Core Key Takeaways
                  </h3>
                  <div className="space-y-2">
                    {deckNotes.keyTakeaways.map((takeaway, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-md border text-xs sm:text-sm leading-relaxed"
                        style={{ backgroundColor: 'var(--theme-surface-subtle)', borderColor: 'var(--theme-card-border)' }}
                      >
                        <span className="font-bold shrink-0 mt-0.5" style={{ color: 'var(--theme-accent)' }}>
                          0{idx + 1}.
                        </span>
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cheat Sheet Table */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--theme-text-primary)' }}>
                    Formula &amp; Law Reference Sheet
                  </h3>
                  <div className="space-y-3">
                    {deckNotes.cheatSheetItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-md border space-y-2 text-xs"
                        style={{ backgroundColor: 'var(--theme-surface-subtle)', borderColor: 'var(--theme-card-border)' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs sm:text-sm" style={{ color: 'var(--theme-accent)' }}>
                            {item.concept}
                          </span>
                        </div>
                        <div
                          className="px-3 py-2 rounded-md font-mono text-[11px] font-semibold border"
                          style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                        >
                          {item.formulaOrLaw}
                        </div>
                        <p className="leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                          {item.plainEnglishExplanation}
                        </p>
                        <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          Exam Tip: {item.examTip}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Flashcards */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>
                      Interactive Flashcards ({Object.values(masteredCards).filter(Boolean).length}/{deckNotes.flashcards?.length || 0} Mastered)
                    </h3>
                    <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                      Click card to flip
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {deckNotes.flashcards?.map((card) => {
                      const isFlipped = !!flippedCards[card.id];
                      const isMastered = !!masteredCards[card.id];

                      return (
                        <div
                          key={card.id}
                          onClick={() => toggleFlip(card.id)}
                          className={`p-4 rounded-md border cursor-pointer transition-all duration-200 min-h-[140px] flex flex-col justify-between shadow-sm ${
                            isMastered ? 'ring-1 ring-emerald-500' : ''
                          }`}
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: isFlipped ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                          }}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span
                              className="px-2 py-0.5 rounded-md border"
                              style={{ backgroundColor: 'var(--theme-accent-subtle)', borderColor: 'var(--theme-card-border)', color: 'var(--theme-accent)' }}
                            >
                              {card.tag || 'Flashcard'}
                            </span>
                            <span style={{ color: 'var(--theme-text-muted)' }}>
                              {isFlipped ? 'Answer' : 'Question'}
                            </span>
                          </div>

                          <div className="py-2 text-xs sm:text-sm font-semibold leading-relaxed">
                            {isFlipped ? card.back : card.front}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t text-[11px]" style={{ borderColor: 'var(--theme-card-border)' }}>
                            <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
                              {isFlipped ? card.hint || 'Flip back' : 'Tap to reveal answer'}
                            </span>
                            <button
                              onClick={(e) => toggleMastered(card.id, e)}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                                isMastered ? 'bg-emerald-500 text-white border-emerald-500' : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              {isMastered ? 'Mastered ✓' : 'Mark Mastered'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State: No deck yet */}
            {!deckLoading && !deckNotes && (
              <div className="py-12 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                <div
                  className="w-12 h-12 rounded-md flex items-center justify-center text-amber-500 border"
                  style={{ backgroundColor: 'var(--theme-accent-subtle)', borderColor: 'var(--theme-accent)' }}
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                    No Study Deck Generated Yet
                  </h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                    Generate flashcards and cheat sheets for <strong style={{ color: 'var(--theme-text-primary)' }}>{currentDoc?.title || 'this course'}</strong>, or ask the Copilot in the chat tab for any textbook!
                  </p>
                </div>
                <button
                  onClick={handleGenerateDocumentDeck}
                  className="w-full py-2.5 px-5 rounded-md text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                >
                  Generate Deck for {currentDoc?.title || 'Current Document'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
