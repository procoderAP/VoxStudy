/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AcademicYear, CourseBranch, CourseDocument, SentenceItem, PlaybackMode, EducationTier } from './types';
import { ALL_UNIVERSAL_BRANCHES } from './data/universalCurriculum';
import { ttsService, TTSState } from './services/ttsService';
import { simplifyNarration } from './services/apiService';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { PdfViewer } from './components/PdfViewer';
import { BottomMediaPlayer } from './components/BottomMediaPlayer';
import { WelcomeModal } from './components/WelcomeModal';
import { AcademicProfileModal } from './components/AcademicProfileModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { AskDoubtDrawer } from './components/AskDoubtDrawer';
import { AiStudyNotesModal } from './components/AiStudyNotesModal';
import { UploadModal } from './components/UploadModal';
import { CommuteModal } from './components/CommuteModal';
import { ThemeSelectorModal, AppTheme } from './components/ThemeSelectorModal';
import { HowToUseModal } from './components/HowToUseModal';
import { AICopilotModal } from './components/AICopilotModal';
import { Palette, Bot } from 'lucide-react';
import { AutonomousStudyNotes } from './types';

export default function App() {
  // 1. Navigation View State: 'home' | 'reader'
  const [currentView, setCurrentView] = useState<'home' | 'reader'>('home');

  // 2. Education Tier & Institution
  const [educationTier, setEducationTier] = useState<EducationTier>(() => {
    return (localStorage.getItem('voxstudy_tier') as EducationTier) || 'college';
  });

  const [institutionName, setInstitutionName] = useState<string>(() => {
    const saved = localStorage.getItem('voxstudy_institution');
    return saved !== null ? saved : '';
  });

  // 3. Academic Branch & Year State
  const [currentBranch, setCurrentBranch] = useState<CourseBranch>(() => {
    const saved = localStorage.getItem('voxstudy_branch');
    if (saved) {
      const found = ALL_UNIVERSAL_BRANCHES.find(b => b.id === saved);
      if (found) return found;
    }
    return ALL_UNIVERSAL_BRANCHES[0];
  });

  const [currentYear, setCurrentYear] = useState<AcademicYear>(() => {
    const saved = localStorage.getItem('voxstudy_year');
    if (saved) return saved as AcademicYear;
    return '2nd Year';
  });

  // 3. Persistent Documents Library State: Empty by default (no forced presets)
  const [savedDocuments, setSavedDocuments] = useState<CourseDocument[]>(() => {
    return storageService.getAllDocuments();
  });

  // 4. Active Document & Audio State: Null by default if library is clean
  const [currentDoc, setCurrentDoc] = useState<CourseDocument | null>(() => {
    const lastActiveId = storageService.getLastActiveDocId();
    if (lastActiveId) {
      const doc = storageService.getDocumentById(lastActiveId);
      if (doc) return doc;
    }
    const all = storageService.getAllDocuments();
    return all.length > 0 ? all[0] : null;
  });

  const [originalDoc, setOriginalDoc] = useState<CourseDocument | null>(null);
  const [originalSentences, setOriginalSentences] = useState<SentenceItem[]>([]);
  const [ttsState, setTtsState] = useState<TTSState>(ttsService.getState());
  const [narrationMode, setNarrationMode] = useState<PlaybackMode>('verbatim');

  // 5. Theme State
  const [activeTheme, setActiveTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('voxstudy_theme') as AppTheme;
    return saved || 'paper';
  });

  // 6. Modal Open States
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    return !localStorage.getItem('voxstudy_welcomed');
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isStudyNotesOpen, setIsStudyNotesOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isCommuteOpen, setIsCommuteOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [doubtSentence, setDoubtSentence] = useState<SentenceItem | null>(null);

  // Sync document sentences into TTS service and track last active
  useEffect(() => {
    if (currentDoc && currentDoc.sentences) {
      if (!originalDoc && !currentDoc.id.endsWith('-simplified')) {
        setOriginalDoc(currentDoc);
      }
      setOriginalSentences(currentDoc.sentences);
      ttsService.setDocumentSentences(currentDoc.sentences);
      storageService.setLastActiveDocId(currentDoc.id);
    }
  }, [currentDoc?.id]);

  // Subscribe to TTS changes
  useEffect(() => {
    const unsubscribe = ttsService.subscribe((state) => {
      setTtsState(state);
    });
    return unsubscribe;
  }, []);

  // Theme application to root DOM elements
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', activeTheme);
    document.body.setAttribute('data-theme', activeTheme);

    const darkThemes = ['obsidian', 'cobalt', 'matrix', 'nordic', 'velvet', 'espresso'];
    if (darkThemes.includes(activeTheme)) {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    localStorage.setItem('voxstudy_theme', activeTheme);
  }, [activeTheme]);

  // Keyboard shortcut listeners (Space, Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        ttsService.togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        if (e.shiftKey) {
          ttsService.skipForward15();
        } else {
          ttsService.nextSentence();
        }
      } else if (e.code === 'ArrowLeft') {
        if (e.shiftKey) {
          ttsService.skipBackward15();
        } else {
          ttsService.prevSentence();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open a document and switch to reader view
  const handleOpenDocument = (doc: CourseDocument, autoPlay: boolean = false) => {
    setOriginalDoc(doc);
    setCurrentDoc(doc);
    setNarrationMode('verbatim');
    storageService.saveDocument(doc);
    setSavedDocuments(storageService.getAllDocuments());
    setCurrentView('reader');

    if (autoPlay) {
      setTimeout(() => {
        ttsService.play();
      }, 200);
    }
  };

  // Delete a document from persistent library
  const handleDeleteDocument = (id: string) => {
    storageService.deleteDocument(id);
    const updated = storageService.getAllDocuments();
    setSavedDocuments(updated);

    if (currentDoc?.id === id) {
      setCurrentDoc(updated[0] || null);
    }
  };

  // Document uploaded / created
  const handleDocLoaded = (newDoc: CourseDocument) => {
    setOriginalDoc(newDoc);
    setCurrentDoc(newDoc);
    setNarrationMode('verbatim');
    storageService.saveDocument(newDoc);
    setSavedDocuments(storageService.getAllDocuments());
    setCurrentView('reader');
  };

  // Handle Welcome modal selection
  const handleWelcomeSelect = (
    branch: CourseBranch,
    year: AcademicYear,
    customCourse?: { name: string; code?: string },
    selectedPresets?: CourseDocument[],
    customInstitution?: string,
    tier?: EducationTier
  ) => {
    setCurrentBranch(branch);
    setCurrentYear(year);
    localStorage.setItem('voxstudy_branch', branch.id);
    localStorage.setItem('voxstudy_year', year);
    localStorage.setItem('voxstudy_welcomed', 'true');

    if (tier) {
      setEducationTier(tier);
      localStorage.setItem('voxstudy_tier', tier);
    }
    if (customInstitution !== undefined) {
      setInstitutionName(customInstitution);
      localStorage.setItem('voxstudy_institution', customInstitution);
    }

    if (customCourse && customCourse.name) {
      handleAddCustomCourse(customCourse.name, customCourse.code);
    } else if (selectedPresets && selectedPresets.length > 0) {
      // Save chosen presets to permanent library
      selectedPresets.forEach(doc => storageService.saveDocument(doc));
      const all = storageService.getAllDocuments();
      setSavedDocuments(all);
      setCurrentDoc(selectedPresets[0]);
    } else {
      // Start completely blank slate!
      // App still knows branch and year for AI tutor and copilot
      const all = storageService.getAllDocuments();
      setSavedDocuments(all);
      if (all.length > 0) {
        setCurrentDoc(all[0]);
      } else {
        setCurrentDoc(null);
      }
    }
    // Return to the clean home dashboard
    setCurrentView('home');
    setIsWelcomeOpen(false);
  };

  // Handle Academic Profile changes (does not overwrite existing library)
  const handleProfileChange = (
    branch: CourseBranch,
    year: AcademicYear,
    customInstitution?: string,
    tier?: EducationTier
  ) => {
    setCurrentBranch(branch);
    setCurrentYear(year);
    localStorage.setItem('voxstudy_branch', branch.id);
    localStorage.setItem('voxstudy_year', year);
    if (tier) {
      setEducationTier(tier);
      localStorage.setItem('voxstudy_tier', tier);
    }
    if (customInstitution !== undefined) {
      setInstitutionName(customInstitution);
      localStorage.setItem('voxstudy_institution', customInstitution);
    }
  };

  // Handle custom course write-in
  const handleAddCustomCourse = (customName: string, _customCode?: string) => {
    const customDoc: CourseDocument = {
      id: `custom-course-${Date.now()}`,
      title: customName,
      branchId: currentBranch.id,
      year: currentYear,
      rawText: `Subject: ${customName}. Upload your lecture notes, textbook chapters, or PDF syllabus for this subject. VoxStudy's audio engine will automatically synthesize audio dictation, exam cheat sheets, and doubt clearing specifically for ${customName}.`,
      sentences: [
        {
          id: 's-1',
          text: `Welcome to ${customName}.`,
          startWordIndex: 0,
          endWordIndex: 4,
          chapterTitle: customName,
          blockType: 'heading-1',
          pageNumber: 1,
        },
        {
          id: 's-2',
          text: `Upload your PDF lecture notes or paste syllabus content to begin listening to audio with karaoke tracking.`,
          startWordIndex: 5,
          endWordIndex: 22,
          chapterTitle: customName,
          blockType: 'paragraph',
          pageNumber: 1,
        },
      ],
      chapters: [{ title: customName, startSentenceIndex: 0 }],
      isCustomUpload: true,
    };

    storageService.saveDocument(customDoc);
    setSavedDocuments(storageService.getAllDocuments());
    setCurrentDoc(customDoc);
    setIsUploadOpen(true);
  };

  // Handle switching narration mode (Exact vs Simplified)
  const handleToggleNarrationMode = async (mode: PlaybackMode) => {
    setNarrationMode(mode);
    if (!currentDoc) return;

    if (mode === 'simplified') {
      const sourceDoc = originalDoc || currentDoc;
      try {
        const result = await simplifyNarration(
          sourceDoc.rawText,
          sourceDoc.title,
          currentBranch.name
        );

        if (result && result.conversationalScript && result.conversationalScript.length > 0) {
          const simplifiedSentences: SentenceItem[] = result.conversationalScript.map((text, idx) => ({
            id: `simp-${idx}`,
            text,
            startWordIndex: idx * 15,
            endWordIndex: (idx + 1) * 15,
            chapterTitle: `${sourceDoc.title} · Simplified Digest`,
            blockType: 'paragraph',
            pageNumber: 1,
          }));

          const simplifiedDoc: CourseDocument = {
            ...sourceDoc,
            id: `${sourceDoc.id}-simplified`,
            title: `${sourceDoc.title} (Simplified Digest)`,
            sentences: simplifiedSentences,
            pages: [
              {
                pageNumber: 1,
                title: `${sourceDoc.title} · Simplified Digest`,
                sentences: simplifiedSentences,
              },
            ],
          };

          setCurrentDoc(simplifiedDoc);
          ttsService.setDocumentSentences(simplifiedSentences);
        }
      } catch (err) {
        console.warn('Could not simplify narration:', err);
      }
    } else {
      if (originalDoc) {
        setCurrentDoc(originalDoc);
        ttsService.setDocumentSentences(originalDoc.sentences);
      } else {
        ttsService.setDocumentSentences(originalSentences);
      }
    }
  };

  // Copilot: Open course by search query / topic
  const handleOpenCourseByQuery = (query: string, startPlaying?: boolean) => {
    const q = query.toLowerCase().trim();
    // 1. Search in saved documents
    let found = savedDocuments.find(d => 
      d.title.toLowerCase().includes(q) || 
      (d.courseCode ? d.courseCode.toLowerCase().includes(q) : false) ||
      d.rawText.toLowerCase().includes(q)
    );

    // 2. Search across universal curriculum sample documents
    if (!found) {
      for (const branch of ALL_UNIVERSAL_BRANCHES) {
        for (const yr of Object.keys(branch.years)) {
          const courses = branch.years[yr] || [];
          for (const c of courses) {
            if (c.sampleDocument && (
              c.title.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q) ||
              (c.courseCode ? c.courseCode.toLowerCase().includes(q) : false) ||
              c.sampleDocument.title.toLowerCase().includes(q)
            )) {
              found = c.sampleDocument;
              break;
            }
          }
          if (found) break;
        }
        if (found) break;
      }
    }

    if (found) {
      handleOpenDocument(found, !!startPlaying);
    }
  };

  // Copilot: Audio Action execution
  const handleCopilotAudioAction = (action: string) => {
    if (action === 'play') ttsService.play();
    else if (action === 'pause') ttsService.pause();
    else if (action === 'skipForward') ttsService.skipForward15();
    else if (action === 'skipBackward') ttsService.skipBackward15();
    else if (action === 'next') ttsService.nextSentence();
    else if (action === 'prev') ttsService.prevSentence();
    else if (action === 'stop') ttsService.stop();
  };

  // Copilot: Save synthesized autonomous notes & flashcards
  const handleCopilotSaveNotes = (_notes: AutonomousStudyNotes) => {
    setIsStudyNotesOpen(true);
  };

  return (
    <div
      className="h-screen max-h-screen flex flex-col font-sans overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text-primary)',
      }}
    >
      {/* Top Bar Navigation */}
      <Navbar
        currentBranch={currentBranch}
        currentYear={currentYear}
        currentDoc={currentDoc}
        currentView={currentView}
        educationTier={educationTier}
        institutionName={institutionName}
        onSetView={(view) => setCurrentView(view)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenStudyNotes={() => setIsStudyNotesOpen(true)}
        onOpenCommute={() => setIsCommuteOpen(true)}
        onOpenHowToUse={() => setIsHowToUseOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        isDark={['obsidian', 'cobalt', 'matrix', 'nordic', 'velvet', 'espresso'].includes(activeTheme)}
        onToggleTheme={() => setIsThemeModalOpen(true)}
      />

      {/* Main View: Home Dashboard vs PDF Reader */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {currentView === 'home' ? (
          <HomePage
            currentBranch={currentBranch}
            currentYear={currentYear}
            educationTier={educationTier}
            institutionName={institutionName}
            savedDocuments={savedDocuments}
            currentDoc={currentDoc}
            onOpenDocument={(doc, autoPlay) => handleOpenDocument(doc, autoPlay)}
            onDeleteDocument={(id) => handleDeleteDocument(id)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenStudyDeckForDoc={(doc) => {
              setCurrentDoc(doc);
              setIsStudyNotesOpen(true);
            }}
            onSwitchToReader={() => setCurrentView('reader')}
            onAddCustomCourse={handleAddCustomCourse}
            onOpenThemeSelector={() => setIsThemeModalOpen(true)}
            onOpenHowToUse={() => setIsHowToUseOpen(true)}
            onOpenCopilot={() => setIsCopilotOpen(true)}
          />
        ) : (
          <PdfViewer
            document={currentDoc}
            currentSentenceIndex={ttsState.currentSentenceIndex}
            isPlaying={ttsState.isPlaying}
            isBuffering={ttsState.isBuffering}
            activeTheme={activeTheme}
            onSentenceClick={(idx) => ttsService.jumpToSentence(idx)}
            onAskDoubt={(sent) => setDoubtSentence(sent)}
            onAskCustomDoubt={(text) => {
              setDoubtSentence({
                id: 'custom-sel',
                text,
                startWordIndex: 0,
                endWordIndex: text.split(' ').length,
                blockType: 'paragraph',
              });
            }}
            onOpenThemeSelector={() => setIsThemeModalOpen(true)}
            onOpenHowToUse={() => setIsHowToUseOpen(true)}
          />
        )}

        {/* Floating Quick Action: AI Academic Copilot */}
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-28 sm:bottom-24 right-16 z-30 flex items-center gap-2 px-3.5 py-2 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 border font-semibold text-xs text-white cursor-pointer"
          style={{
            backgroundColor: 'var(--theme-accent)',
            borderColor: 'var(--theme-accent)',
          }}
          title="Open AI Academic Copilot (Full App Control & Syllabus Note Maker)"
          aria-label="Open AI Copilot"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Floating Quick Action: Theme Palette */}
        <button
          onClick={() => setIsThemeModalOpen(true)}
          className="fixed bottom-28 sm:bottom-24 right-4 z-30 p-2 rounded-full shadow-xl transition-all hover:scale-105 border cursor-pointer"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            borderColor: 'var(--theme-card-border)',
            color: 'var(--theme-accent)',
          }}
          title="Change reading theme (Paper, Obsidian, Cobalt, Sage, Amber)"
          aria-label="Change reading theme"
        >
          <Palette className="w-4 h-4" />
        </button>
      </main>

      {/* Persistent Bottom Media Player Bar */}
      <BottomMediaPlayer
        document={currentDoc}
        isPlaying={ttsState.isPlaying}
        isPaused={ttsState.isPaused}
        currentSentenceIndex={ttsState.currentSentenceIndex}
        totalSentences={ttsState.totalSentences}
        playbackRate={ttsState.playbackRate}
        estimatedRemainingSeconds={ttsState.estimatedRemainingSeconds}
        mode={narrationMode}
        isBuffering={ttsState.isBuffering}
        quotaExceeded={ttsState.quotaExceeded}
        engine={ttsState.engine}
        studioVoiceName={ttsState.studioVoiceName}
        freeVoiceName={ttsState.freeVoiceName}
        onTogglePlay={() => ttsService.togglePlayPause()}
        onNextSentence={() => ttsService.nextSentence()}
        onPrevSentence={() => ttsService.prevSentence()}
        onSkipForward15={() => ttsService.skipForward15()}
        onSkipBackward15={() => ttsService.skipBackward15()}
        onSeek={(idx) => ttsService.jumpToSentence(idx)}
        onSetRate={(rate) => ttsService.setRate(rate)}
        onToggleMode={handleToggleNarrationMode}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        onOpenCommute={() => setIsCommuteOpen(true)}
      />

      {/* Modals & Drawers */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        currentTheme={activeTheme}
        onSelectTheme={(theme) => setActiveTheme(theme)}
        onSelectProgram={handleWelcomeSelect}
        onOpenHowToUse={() => setIsHowToUseOpen(true)}
      />

      <AcademicProfileModal
        isOpen={isProfileOpen}
        currentBranch={currentBranch}
        currentYear={currentYear}
        currentTheme={activeTheme}
        educationTier={educationTier}
        institutionName={institutionName}
        onSelectTheme={(theme) => setActiveTheme(theme)}
        onSelectBranchAndYear={handleProfileChange}
        onSelectCourseDoc={(doc) => handleOpenDocument(doc, false)}
        onAddCustomCourse={handleAddCustomCourse}
        onClose={() => setIsProfileOpen(false)}
      />

      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />

      <AskDoubtDrawer
        isOpen={!!doubtSentence}
        sentence={doubtSentence}
        courseTitle={currentDoc?.title || 'Course Notes'}
        branchName={currentBranch.name}
        year={currentYear}
        onClose={() => setDoubtSentence(null)}
      />

      <AiStudyNotesModal
        isOpen={isStudyNotesOpen}
        document={currentDoc}
        branchName={currentBranch.name}
        year={currentYear}
        onClose={() => setIsStudyNotesOpen(false)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        branchId={currentBranch.id}
        year={currentYear}
        onDocLoaded={handleDocLoaded}
        onClose={() => setIsUploadOpen(false)}
      />

      <CommuteModal
        isOpen={isCommuteOpen}
        document={currentDoc}
        isPlaying={ttsState.isPlaying}
        currentSentenceIndex={ttsState.currentSentenceIndex}
        totalSentences={ttsState.totalSentences}
        playbackRate={ttsState.playbackRate}
        estimatedRemainingSeconds={ttsState.estimatedRemainingSeconds}
        onTogglePlay={() => ttsService.togglePlayPause()}
        onNextSentence={() => ttsService.nextSentence()}
        onPrevSentence={() => ttsService.prevSentence()}
        onSkipForward15={() => ttsService.skipForward15()}
        onSkipBackward15={() => ttsService.skipBackward15()}
        onSetRate={(rate) => ttsService.setRate(rate)}
        onClose={() => setIsCommuteOpen(false)}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        currentTheme={activeTheme}
        onSelectTheme={(theme) => setActiveTheme(theme)}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <HowToUseModal
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
        onOpenThemeSelector={() => setIsThemeModalOpen(true)}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
      />

      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        currentView={currentView}
        activeTheme={activeTheme}
        currentDoc={currentDoc}
        currentBranchName={currentBranch.name}
        currentYear={currentYear}
        playbackRate={ttsState.playbackRate}
        narrationMode={narrationMode}
        isPlaying={ttsState.isPlaying}
        activeVoiceName={
          ttsState.engine === 'studio'
            ? `${ttsState.studioVoiceName} (Better natural voice)`
            : `${ttsState.freeVoiceName || 'Jenny'} (Free Natural Voice)`
        }
        onSelectTheme={(theme) => setActiveTheme(theme)}
        onSelectVoice={(engine, voiceName) => {
          if (engine === 'studio') {
            ttsService.setStudioVoice(voiceName || 'Kore');
          } else {
            ttsService.switchToNaturalVoice(voiceName);
          }
        }}
        onSetRate={(rate) => ttsService.setRate(rate)}
        onSetMode={handleToggleNarrationMode}
        onOpenCourseByQuery={handleOpenCourseByQuery}
        onAudioAction={handleCopilotAudioAction}
        onNavigateView={(view) => {
          if (view === 'study-notes') setIsStudyNotesOpen(true);
          else if (view === 'commute') setIsCommuteOpen(true);
          else setCurrentView(view);
        }}
        onSaveGeneratedNotes={handleCopilotSaveNotes}
      />
    </div>
  );
}
