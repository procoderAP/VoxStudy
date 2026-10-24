import React, { useState } from 'react';
import { AcademicYear, CourseBranch, CourseDocument, EducationTier } from '../types';
import {
  BookOpen,
  Upload,
  Play,
  Trash2,
  Clock,
  GraduationCap,
  FileText,
  Plus,
  Palette,
  HelpCircle,
  Bot,
  Check,
  Search,
} from 'lucide-react';
import { getGradeOrYearOptionsForTier, getCoursesForBranchAndLevel } from '../data/universalCurriculum';

interface HomePageProps {
  currentBranch: CourseBranch;
  currentYear: AcademicYear;
  educationTier?: EducationTier;
  institutionName?: string;
  savedDocuments: CourseDocument[];
  currentDoc: CourseDocument | null;
  onOpenDocument: (doc: CourseDocument, autoPlay?: boolean) => void;
  onDeleteDocument: (docId: string) => void;
  onOpenUpload: () => void;
  onOpenProfile: () => void;
  onOpenStudyDeckForDoc: (doc: CourseDocument) => void;
  onSwitchToReader: () => void;
  onAddCustomCourse: (courseName: string, courseCode: string) => void;
  onOpenThemeSelector?: () => void;
  onOpenHowToUse?: () => void;
  onOpenCopilot?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentBranch,
  currentYear,
  educationTier = 'college',
  institutionName,
  savedDocuments,
  currentDoc,
  onOpenDocument,
  onDeleteDocument,
  onOpenUpload,
  onOpenProfile,
  onOpenStudyDeckForDoc,
  onAddCustomCourse,
  onOpenThemeSelector,
  onOpenHowToUse,
  onOpenCopilot,
}) => {
  const [activeLevelTab, setActiveLevelTab] = useState<string>(currentYear);
  const [quickSubjectName, setQuickSubjectName] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Available grade or year options for the current tier
  const levelTabs = getGradeOrYearOptionsForTier(educationTier);
  const currentLevel = levelTabs.includes(activeLevelTab) ? activeLevelTab : (levelTabs[0] || currentYear);

  // Retrieve courses/subjects for current level
  const curriculumCourses = currentBranch.years[currentLevel] || getCoursesForBranchAndLevel(currentBranch.id, currentLevel);

  const filteredCourses = curriculumCourses.filter(c =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSubjectName.trim()) return;
    onAddCustomCourse(quickSubjectName.trim(), '');
    setQuickSubjectName('');
  };

  const getTierLabel = (tier: EducationTier) => {
    switch (tier) {
      case 'primary': return 'Primary School';
      case 'secondary': return 'Secondary School';
      case 'college': return 'College & Graduate';
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 max-w-5xl mx-auto w-full space-y-10 pb-44 transition-colors"
      style={{ backgroundColor: 'var(--theme-bg)' }}
    >
      {/* Editorial Study Desk Header (Human-Crafted, Anti-AI-Slop) */}
      <section
        className="p-6 sm:p-8 rounded-lg border shadow-sm transition-colors relative"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
        }}
      >
        <div className="max-w-2xl">
          {/* Quiet Metadata Line (Zero-Pill Discipline) */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span>{getTierLabel(educationTier)}</span>
            <span aria-hidden="true">·</span>
            <span>{currentYear}</span>
            <span aria-hidden="true">·</span>
            <span>{currentBranch.shortName}</span>
            {institutionName && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-stone-700 dark:text-stone-300">{institutionName}</span>
              </>
            )}
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            Welcome back, Atharva.
          </h1>

          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Your reading desk for course notes and textbooks. Listen with natural neural audio, follow sentence highlights, or ask questions on difficult paragraphs.
          </p>

          {/* Core Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-md text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Notes (PDF)</span>
            </button>

            {currentDoc && (
              <button
                onClick={() => onOpenDocument(currentDoc, true)}
                className="px-4 py-2 rounded-md text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer hover:opacity-80 active:scale-95"
                style={{
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                  backgroundColor: 'var(--theme-surface-subtle)',
                }}
              >
                <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
                <span>Resume Reading</span>
              </button>
            )}

            {onOpenCopilot && (
              <button
                onClick={onOpenCopilot}
                className="px-4 py-2 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80 active:scale-95"
                style={{
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                  backgroundColor: 'var(--theme-surface-subtle)',
                }}
              >
                <Bot className="w-3.5 h-3.5 text-stone-500" />
                <span>Ask Study Assistant</span>
              </button>
            )}

            <button
              onClick={onOpenProfile}
              className="px-3.5 py-2 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80 active:scale-95"
              style={{
                borderColor: 'var(--theme-card-border)',
                color: 'var(--theme-text-muted)',
                backgroundColor: 'var(--theme-surface-subtle)',
              }}
              title="Change grade, school, or subjects"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Change Curriculum</span>
            </button>

            {onOpenThemeSelector && (
              <button
                onClick={onOpenThemeSelector}
                className="px-3 py-2 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80 active:scale-95"
                style={{
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-muted)',
                  backgroundColor: 'var(--theme-surface-subtle)',
                }}
                title="Change desk reading theme"
              >
                <Palette className="w-3.5 h-3.5 text-stone-500" />
                <span>Theme</span>
              </button>
            )}

            {onOpenHowToUse && (
              <button
                onClick={onOpenHowToUse}
                className="px-3 py-2 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80 active:scale-95"
                style={{
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-muted)',
                  backgroundColor: 'var(--theme-surface-subtle)',
                }}
              >
                <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                <span>Guide</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* QUICK SUBJECT / COURSE WRITE-IN FORM */}
      <section
        className="p-5 rounded-lg border shadow-sm transition-colors"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
        }}
      >
        <div className="mb-3">
          <h2
            className="text-sm font-semibold mb-0.5"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {educationTier === 'college' ? 'Add Custom University Course' : 'Add Custom School Subject'}
          </h2>
          <p
            className="text-xs text-stone-500 dark:text-stone-400"
          >
            {educationTier === 'college'
              ? 'Enter any university course from your syllabus to organize documents and audio notes.'
              : 'Enter any subject you study at school to organize chapters and flashcards.'}
          </p>
        </div>

        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder={
              educationTier === 'college'
                ? 'Course title (e.g. Signals & Systems, Organic Chemistry, Microeconomics...)'
                : 'Subject title (e.g. English Literature, General Science, World Geography...)'
            }
            value={quickSubjectName}
            onChange={(e) => setQuickSubjectName(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-md border focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--theme-surface-subtle)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-primary)',
            }}
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-md font-semibold text-xs text-white transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </form>
      </section>

      {/* SECTION 1: My Study Library (Stored Documents) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              My Study Library
            </h2>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              {savedDocuments.length} document{savedDocuments.length === 1 ? '' : 's'} saved on this device
            </div>
          </div>

          <button
            onClick={onOpenUpload}
            className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 border transition-colors cursor-pointer hover:opacity-80 active:scale-95"
            style={{
              borderColor: 'var(--theme-card-border)',
              backgroundColor: 'var(--theme-surface-subtle)',
              color: 'var(--theme-text-primary)',
            }}
          >
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>Upload PDF</span>
          </button>
        </div>

        {savedDocuments.length === 0 ? (
          <div
            className="p-8 sm:p-10 rounded-lg border text-center transition-colors"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-card-border)',
            }}
          >
            <div className="max-w-md mx-auto space-y-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center mx-auto border"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-accent)',
                }}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <h3
                className="text-sm font-semibold"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Your study desk is clear
              </h3>
              <p
                className="text-xs leading-relaxed text-stone-500 dark:text-stone-400"
              >
                Upload your course PDF notes or slides to listen aloud, or explore curated subject notes from your curriculum below.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={onOpenUpload}
                  className="px-4 py-2 rounded-md text-white text-xs font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Notes</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('curriculum-subjects-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer hover:opacity-80 active:scale-95"
                  style={{
                    borderColor: 'var(--theme-card-border)',
                    backgroundColor: 'var(--theme-surface-subtle)',
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  <span>Explore Subjects</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {savedDocuments.map((doc) => {
              const wordCount = doc.sentences?.reduce((acc, s) => acc + s.text.split(/\s+/).length, 0) || 0;
              const estMins = Math.ceil(wordCount / 135);
              const isCurrent = currentDoc?.id === doc.id;

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-lg border shadow-sm transition-all flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: isCurrent ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                  }}
                >
                  <div>
                    {/* Quiet Metadata Header */}
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                      <span className="text-[11px] font-medium" style={{ color: 'var(--theme-accent)' }}>
                        Course Notes
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 opacity-60" />
                        <span>{estMins} min listen</span>
                      </div>
                    </div>

                    <h3
                      className="text-sm font-semibold leading-snug mb-1.5 line-clamp-2"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      {doc.title}
                    </h3>

                    <p
                      className="text-xs line-clamp-2 mb-3 leading-relaxed text-stone-500 dark:text-stone-400"
                    >
                      {doc.sentences?.[0]?.text || 'Course text ready for neural narration.'}
                    </p>
                  </div>

                  <div
                    className="pt-2.5 border-t flex items-center justify-between"
                    style={{ borderColor: 'var(--theme-card-border)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenDocument(doc, true)}
                        className="px-3 py-1.5 rounded-md text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                        style={{ backgroundColor: 'var(--theme-accent)' }}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Listen</span>
                      </button>

                      <button
                        onClick={() => onOpenStudyDeckForDoc(doc)}
                        className="px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer hover:opacity-80 active:scale-95"
                        style={{
                          borderColor: 'var(--theme-card-border)',
                          backgroundColor: 'var(--theme-surface-subtle)',
                          color: 'var(--theme-text-primary)',
                        }}
                      >
                        <span>Notes</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 rounded-md text-stone-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove from library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: Curriculum Subjects & Reference Notes */}
      <section id="curriculum-subjects-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              {currentBranch.shortName} Curriculum
            </h2>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Select your level to explore core subjects or add ready notes to your desk
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" style={{ color: 'var(--theme-text-muted)' }} />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-md border focus:outline-none transition-colors w-36 sm:w-44"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>

            {/* Level Tabs */}
            <div
              className="flex items-center gap-1 p-0.5 rounded-md border text-xs overflow-x-auto scrollbar-none max-w-full"
              style={{
                backgroundColor: 'var(--theme-surface-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              {levelTabs.map((lvl) => {
                const isActive = currentLevel === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setActiveLevelTab(lvl)}
                    className="px-2.5 py-1 rounded-[5px] text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 font-medium"
                    style={{
                      backgroundColor: isActive ? 'var(--theme-card-bg)' : 'transparent',
                      color: isActive ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
                      boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      border: isActive ? '1px solid var(--theme-card-border)' : '1px solid transparent',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onOpenProfile}
              className="text-xs font-medium hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              style={{ color: 'var(--theme-accent)' }}
            >
              <span>Change Stream</span>
            </button>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div
            className="p-6 rounded-lg border text-center text-xs text-stone-500 dark:text-stone-400"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-card-border)',
            }}
          >
            No subjects found for this selection. You can write in your exact subject above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCourses.map((c) => {
              const hasDoc = !!c.sampleDocument;
              const isSaved = savedDocuments.some(
                (d) => d.title === c.title || d.id === c.sampleDocument?.id
              );

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-lg border shadow-sm transition-all flex flex-col justify-between gap-3"
                  style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-card-border)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                      {hasDoc ? (
                        <span className="text-[11px] font-semibold" style={{ color: 'var(--theme-accent)' }}>
                          Ready to listen
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">Curriculum Subject</span>
                      )}
                    </div>
                    <h3
                      className="text-xs sm:text-sm font-semibold mb-1"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      {c.title}
                    </h3>
                    <p
                      className="text-xs leading-relaxed line-clamp-2 text-stone-500 dark:text-stone-400"
                    >
                      {c.description}
                    </p>
                  </div>

                  <div
                    className="pt-2 border-t flex items-center justify-between gap-2"
                    style={{ borderColor: 'var(--theme-card-border)' }}
                  >
                    {hasDoc ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => onOpenDocument(c.sampleDocument!, true)}
                          className="px-3 py-1.5 rounded-md text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                          style={{ backgroundColor: 'var(--theme-accent)' }}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Listen</span>
                        </button>

                        <button
                          onClick={() => onOpenStudyDeckForDoc(c.sampleDocument!)}
                          className="px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer hover:opacity-80 active:scale-95"
                          style={{
                            borderColor: 'var(--theme-card-border)',
                            backgroundColor: 'var(--theme-surface-subtle)',
                            color: 'var(--theme-text-primary)',
                          }}
                        >
                          <span>Deck</span>
                        </button>

                        {!isSaved ? (
                          <button
                            onClick={() => onOpenDocument(c.sampleDocument!, false)}
                            className="px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer hover:opacity-80 active:scale-95"
                            style={{
                              borderColor: 'var(--theme-card-border)',
                              backgroundColor: 'var(--theme-surface-subtle)',
                              color: 'var(--theme-text-muted)',
                            }}
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Save</span>
                          </button>
                        ) : (
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--theme-accent)' }}>
                            <Check className="w-3.5 h-3.5" />
                            <span>In Library</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={onOpenUpload}
                        className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 border transition-colors cursor-pointer hover:opacity-80 active:scale-95"
                        style={{
                          borderColor: 'var(--theme-card-border)',
                          backgroundColor: 'var(--theme-surface-subtle)',
                          color: 'var(--theme-text-primary)',
                        }}
                      >
                        <Upload className="w-3.5 h-3.5 text-stone-500" />
                        <span>Upload Notes</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
