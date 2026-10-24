import React, { useState } from 'react';
import { AcademicYear, CourseBranch, CourseDocument, EducationTier } from '../types';
import {
  PRIMARY_SCHOOL_BRANCH,
  SECONDARY_SCHOOL_BRANCH,
  ALL_COLLEGE_BRANCHES,
  getGradeOrYearOptionsForTier,
  getCoursesForBranchAndLevel,
} from '../data/universalCurriculum';
import { AppTheme, THEME_OPTIONS } from './ThemeSelectorModal';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  School,
  Building2,
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  onSelectProgram: (
    branch: CourseBranch,
    year: AcademicYear,
    customCourse?: { name: string; code: string },
    selectedPresets?: CourseDocument[],
    institutionName?: string,
    tier?: EducationTier
  ) => void;
  onOpenHowToUse?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  currentTheme,
  onSelectTheme,
  onSelectProgram,
  onOpenHowToUse,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTier, setSelectedTier] = useState<EducationTier>('college');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('computer-science');
  const [selectedYear, setSelectedYear] = useState<string>('2nd Year');
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(currentTheme || 'eyecare');
  const [collegeName, setCollegeName] = useState<string>('');

  // Custom Course write-in state
  const [customCourseName, setCustomCourseName] = useState('');

  // Selected preset document IDs for Step 2
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([]);

  if (!isOpen) return null;

  // Active branch resolution
  let activeBranch: CourseBranch;
  if (selectedTier === 'primary') {
    activeBranch = PRIMARY_SCHOOL_BRANCH;
  } else if (selectedTier === 'secondary') {
    activeBranch = SECONDARY_SCHOOL_BRANCH;
  } else {
    activeBranch = ALL_COLLEGE_BRANCHES.find(b => b.id === selectedBranchId) || ALL_COLLEGE_BRANCHES[0];
  }

  const gradeOrYearOptions = getGradeOrYearOptionsForTier(selectedTier);
  const availablePresetCourses = getCoursesForBranchAndLevel(activeBranch.id, selectedYear);

  // Switch tier handler
  const handleTierChange = (newTier: EducationTier) => {
    setSelectedTier(newTier);
    const newOptions = getGradeOrYearOptionsForTier(newTier);
    setSelectedYear(newOptions[0]);
    if (newTier === 'primary') {
      setSelectedBranchId(PRIMARY_SCHOOL_BRANCH.id);
    } else if (newTier === 'secondary') {
      setSelectedBranchId(SECONDARY_SCHOOL_BRANCH.id);
    } else {
      setSelectedBranchId(ALL_COLLEGE_BRANCHES[0].id);
    }
  };

  // Advance to Step 2 or launch custom course
  const handleProceedToStep2 = () => {
    onSelectTheme(selectedTheme);

    if (customCourseName.trim()) {
      onSelectProgram(
        activeBranch,
        selectedYear,
        {
          name: customCourseName.trim(),
          code: '',
        },
        [],
        selectedTier === 'college' ? (collegeName.trim() || undefined) : undefined,
        selectedTier
      );
      return;
    }

    // Default select all available preset docs for this branch/year
    const presetDocs = availablePresetCourses
      .map(c => c.sampleDocument)
      .filter((d): d is CourseDocument => !!d);

    setSelectedPresetIds(presetDocs.map(d => d.id));
    setStep(2);
  };

  // User chooses: Import Selected Presets
  const handleImportPresets = () => {
    const presetDocs = availablePresetCourses
      .map(c => c.sampleDocument)
      .filter((d): d is CourseDocument => !!d && selectedPresetIds.includes(d.id));

    onSelectProgram(
      activeBranch,
      selectedYear,
      undefined,
      presetDocs,
      selectedTier === 'college' ? collegeName.trim() : undefined,
      selectedTier
    );
  };

  // User chooses: Start Blank Slate (No presets)
  const handleStartBlankSlate = () => {
    onSelectProgram(
      activeBranch,
      selectedYear,
      undefined,
      [],
      selectedTier === 'college' ? collegeName.trim() : undefined,
      selectedTier
    );
  };

  const togglePresetSelection = (docId: string) => {
    setSelectedPresetIds(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
          }}
        >
          <div className="text-xs mb-1" style={{ color: 'var(--theme-text-muted)' }}>
            {step === 1 ? 'Step 1 of 2 · Student Setup' : 'Step 2 of 2 · Course Desk Presets'}
          </div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {step === 1 ? 'Set up your study desk' : 'Choose subjects for your desk'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
            {step === 1
              ? 'Select your level of study. VoxStudy supports elementary, high school, and college/graduate students.'
              : `${activeBranch.shortName} · ${selectedYear}`}
          </p>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 ? (
            <>
              {/* Education Tier Selector */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  1. Education Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTierChange('primary')}
                    className="p-3 rounded-xl border text-left transition-all cursor-pointer"
                    style={{
                      borderColor: selectedTier === 'primary' ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                      backgroundColor: selectedTier === 'primary' ? 'var(--theme-accent-subtle)' : 'var(--theme-card-bg)',
                      boxShadow: selectedTier === 'primary' ? '0 0 0 1px var(--theme-accent)' : undefined,
                    }}
                  >
                    <School className="w-4 h-4 mb-1" style={{ color: 'var(--theme-accent)' }} />
                    <div className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>Primary</div>
                    <div className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>Grades 1–5</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTierChange('secondary')}
                    className="p-3 rounded-xl border text-left transition-all cursor-pointer"
                    style={{
                      borderColor: selectedTier === 'secondary' ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                      backgroundColor: selectedTier === 'secondary' ? 'var(--theme-accent-subtle)' : 'var(--theme-card-bg)',
                      boxShadow: selectedTier === 'secondary' ? '0 0 0 1px var(--theme-accent)' : undefined,
                    }}
                  >
                    <BookOpen className="w-4 h-4 mb-1" style={{ color: 'var(--theme-accent)' }} />
                    <div className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>Secondary</div>
                    <div className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>Grades 6–12</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTierChange('college')}
                    className="p-3 rounded-xl border text-left transition-all cursor-pointer"
                    style={{
                      borderColor: selectedTier === 'college' ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                      backgroundColor: selectedTier === 'college' ? 'var(--theme-accent-subtle)' : 'var(--theme-card-bg)',
                      boxShadow: selectedTier === 'college' ? '0 0 0 1px var(--theme-accent)' : undefined,
                    }}
                  >
                    <GraduationCap className="w-4 h-4 mb-1" style={{ color: 'var(--theme-accent)' }} />
                    <div className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>College &amp; Graduate</div>
                    <div className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>Undergrad, MS, PhD</div>
                  </button>
                </div>
              </div>

              {/* College Name Input (if College selected) */}
              {selectedTier === 'college' && (
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    College / University Name
                  </label>
                  <div className="relative">
                    <Building2
                      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--theme-text-muted)' }}
                    />
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. Harvard / Oxford / IIT / Stanford / University of Toronto"
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--theme-surface-subtle)',
                        borderColor: 'var(--theme-card-border)',
                        color: 'var(--theme-text-primary)',
                      }}
                    />
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                    Enter your campus name to customize your syllabus notes.
                  </p>
                </div>
              )}

              {/* Grade or Academic Year Selector */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  2. Select {selectedTier === 'college' ? 'Academic Level' : 'Grade'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {gradeOrYearOptions.map((opt) => {
                    const isSelected = selectedYear === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedYear(opt)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer"
                        style={{
                          borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                          backgroundColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-surface-subtle)',
                          color: isSelected ? '#ffffff' : 'var(--theme-text-primary)',
                          fontWeight: isSelected ? 600 : 500,
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* College Major / Stream Selector (if College selected) */}
              {selectedTier === 'college' && (
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    3. Academic Branch / Major
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {ALL_COLLEGE_BRANCHES.map((b) => {
                      const isSelected = selectedBranchId === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBranchId(b.id)}
                          className="p-2.5 rounded-xl border text-left transition-all cursor-pointer"
                          style={{
                            borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                            backgroundColor: isSelected ? 'var(--theme-accent-subtle)' : 'var(--theme-card-bg)',
                            boxShadow: isSelected ? '0 0 0 1px var(--theme-accent)' : undefined,
                          }}
                        >
                          <div
                            className="text-xs leading-tight"
                            style={{ color: 'var(--theme-text-primary)', fontWeight: isSelected ? 700 : 500 }}
                          >
                            {b.name}
                          </div>
                          <div className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
                            {b.shortName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Custom Course Write-in */}
              <div
                className="pt-2 border-t"
                style={{ borderColor: 'var(--theme-card-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    Or Enter a Custom Course / Subject
                  </label>
                  <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>Optional</span>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Subject title (e.g. Microeconomics, Data Structures, Constitutional Law, Neuroscience)"
                    value={customCourseName}
                    onChange={(e) => setCustomCourseName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-surface-subtle)',
                      borderColor: 'var(--theme-card-border)',
                      color: 'var(--theme-text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Theme Preference Preview */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  Reading Palette
                </label>
                <div className="flex flex-wrap gap-2">
                  {THEME_OPTIONS.slice(0, 5).map((t) => {
                    const isSelected = selectedTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(t.id);
                          onSelectTheme(t.id);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-all"
                        style={{
                          borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                          backgroundColor: isSelected ? 'var(--theme-accent-subtle)' : 'var(--theme-surface-subtle)',
                          color: 'var(--theme-text-primary)',
                          boxShadow: isSelected ? '0 0 0 1px var(--theme-accent)' : undefined,
                        }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.previewAccent }} />
                        <span>{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* STEP 2: Presets Selection (User can pick or start blank) */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    Available Subjects for {selectedYear}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    Choose which sample notes to load onto your desk, or start fresh with a blank slate.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = availablePresetCourses
                        .map(c => c.sampleDocument?.id)
                        .filter((id): id is string => !!id);
                      setSelectedPresetIds(allIds);
                    }}
                    className="text-xs hover:underline cursor-pointer font-medium"
                    style={{ color: 'var(--theme-accent)' }}
                  >
                    Select All
                  </button>
                  <span style={{ color: 'var(--theme-card-border)' }}>·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPresetIds([])}
                    className="text-xs hover:underline cursor-pointer"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {availablePresetCourses.length === 0 ? (
                <div
                  className="p-6 text-center text-xs border rounded-xl"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-muted)',
                  }}
                >
                  No preset documents found for this selection. You can start with a blank desk and upload your own notes!
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {availablePresetCourses.map((c) => {
                    const doc = c.sampleDocument;
                    if (!doc) return null;
                    const isSelected = selectedPresetIds.includes(doc.id);

                    return (
                      <div
                        key={doc.id}
                        onClick={() => togglePresetSelection(doc.id)}
                        className="p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3"
                        style={{
                          borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                          backgroundColor: isSelected ? 'var(--theme-accent-subtle)' : 'var(--theme-card-bg)',
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: isSelected ? 'var(--theme-accent)' : 'transparent',
                            borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                            color: '#ffffff',
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs mb-0.5">
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
                              style={{
                                borderColor: 'var(--theme-card-border)',
                                color: 'var(--theme-accent)',
                                backgroundColor: 'var(--theme-accent-subtle)',
                              }}
                            >
                              Ready for audio narration
                            </span>
                          </div>
                          <div
                            className="text-xs font-semibold"
                            style={{ color: 'var(--theme-text-primary)' }}
                          >
                            {c.title}
                          </div>
                          <p
                            className="text-[11px] line-clamp-1 mt-0.5"
                            style={{ color: 'var(--theme-text-muted)' }}
                          >
                            {c.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
          }}
        >
          {step === 1 ? (
            <>
              {onOpenHowToUse && (
                <button
                  type="button"
                  onClick={onOpenHowToUse}
                  className="text-xs cursor-pointer hover:underline"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  Need help?
                </button>
              )}
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="ml-auto px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-white"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartBlankSlate}
                  className="px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                  title="Start with an empty desk, but your selected grade/major will be saved"
                >
                  Start Blank Slate
                </button>

                <button
                  type="button"
                  onClick={handleImportPresets}
                  className="px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-white"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    Import {selectedPresetIds.length > 0 ? `(${selectedPresetIds.length})` : ''} &amp; Start
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
