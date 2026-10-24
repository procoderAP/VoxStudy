import React, { useState } from 'react';
import { AcademicYear, CourseBranch, CourseItem, CourseDocument, EducationTier } from '../types';
import {
  ALL_UNIVERSAL_BRANCHES,
  PRIMARY_SCHOOL_BRANCH,
  SECONDARY_SCHOOL_BRANCH,
  ALL_COLLEGE_BRANCHES,
  getGradeOrYearOptionsForTier,
  getCoursesForBranchAndLevel,
} from '../data/universalCurriculum';
import { AppTheme } from './ThemeSelectorModal';
import { GraduationCap, BookOpen, School, Building2, Check, X, PlusCircle } from 'lucide-react';

interface AcademicProfileModalProps {
  isOpen: boolean;
  currentBranch: CourseBranch;
  currentYear: AcademicYear;
  currentTheme: AppTheme;
  educationTier?: EducationTier;
  institutionName?: string;
  onSelectTheme: (theme: AppTheme) => void;
  onSelectBranchAndYear: (
    branch: CourseBranch,
    year: AcademicYear,
    institutionName?: string,
    tier?: EducationTier
  ) => void;
  onSelectCourseDoc: (doc: CourseDocument) => void;
  onAddCustomCourse: (customCourseName: string, customCourseCode?: string) => void;
  onClose: () => void;
}

export const AcademicProfileModal: React.FC<AcademicProfileModalProps> = ({
  isOpen,
  currentBranch,
  currentYear,
  educationTier = 'college',
  institutionName = '',
  onSelectBranchAndYear,
  onAddCustomCourse,
  onClose,
}) => {
  const [selectedTier, setSelectedTier] = useState<EducationTier>(educationTier);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(currentBranch.id);
  const [selectedYear, setSelectedYear] = useState<AcademicYear>(currentYear);
  const [selectedCollegeName, setSelectedCollegeName] = useState<string>(institutionName || '');

  // Custom Course write-in state
  const [customCourseName, setCustomCourseName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  // Synchronize state when modal is opened
  React.useEffect(() => {
    if (isOpen) {
      setSelectedTier(educationTier);
      setSelectedBranchId(currentBranch.id);
      setSelectedYear(currentYear);
      setSelectedCollegeName(institutionName || '');
      setShowCustomInput(false);
    }
  }, [isOpen, educationTier, currentBranch.id, currentYear, institutionName]);

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
  const coursesForLevel: CourseItem[] = getCoursesForBranchAndLevel(activeBranch.id, selectedYear);

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

  const handleApply = () => {
    onSelectBranchAndYear(
      activeBranch,
      selectedYear,
      selectedTier === 'college' ? selectedCollegeName.trim() : undefined,
      selectedTier
    );
    onClose();
  };

  const handleCreateCustomCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCourseName.trim()) return;
    onAddCustomCourse(customCourseName.trim(), '');
    setShowCustomInput(false);
    setCustomCourseName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-lg shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-colors"
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
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
          }}
        >
          <div>
            <h2
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              Student Profile &amp; Curriculum
            </h2>
            <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              Change your education level, grade, school, or course stream
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Education Tier Tabs */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Education Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTierChange('primary')}
                className="p-3 rounded-md border text-left transition-all cursor-pointer"
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
                className="p-3 rounded-md border text-left transition-all cursor-pointer"
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
                className="p-3 rounded-md border text-left transition-all cursor-pointer"
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

          {/* College Name Input (if College) */}
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
                  value={selectedCollegeName}
                  onChange={(e) => setSelectedCollegeName(e.target.value)}
                  placeholder="e.g. BITS Pilani, Dubai Campus / Harvard / IIT"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-md border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Grade or Year Selector */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Select {selectedTier === 'college' ? 'Academic Level' : 'Grade'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {gradeOrYearOptions.map((opt) => {
                const isSelected = selectedYear === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedYear(opt)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer"
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

          {/* Major/Stream (if College) */}
          {selectedTier === 'college' && (
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Degree Program / Stream
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {ALL_COLLEGE_BRANCHES.map((b) => {
                  const isSelected = selectedBranchId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBranchId(b.id)}
                      className="p-2.5 rounded-md border text-left transition-all cursor-pointer"
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

          {/* Core Subjects Preview for this Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Subjects for {selectedYear}
              </label>
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-xs hover:underline flex items-center gap-1 cursor-pointer font-medium"
                style={{ color: 'var(--theme-accent)' }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Custom Subject</span>
              </button>
            </div>

            {/* Custom Subject Input Dropdown */}
            {showCustomInput && (
              <form
                onSubmit={handleCreateCustomCourse}
                className="p-3 mb-3 rounded-md border space-y-2"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                }}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Subject title (e.g. Microeconomics, Cognitive Psychology...)"
                    value={customCourseName}
                    onChange={(e) => setCustomCourseName(e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-md border focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-card-bg)',
                      borderColor: 'var(--theme-card-border)',
                      color: 'var(--theme-text-primary)',
                    }}
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-white cursor-pointer"
                    style={{ backgroundColor: 'var(--theme-accent)' }}
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {coursesForLevel.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-md border transition-colors"
                  style={{
                    backgroundColor: 'var(--theme-surface-subtle)',
                    borderColor: 'var(--theme-card-border)',
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    {c.sampleDocument ? (
                      <span className="text-[10px] font-medium" style={{ color: 'var(--theme-accent)' }}>
                        Ready notes
                      </span>
                    ) : (
                      <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
                        Curriculum subject
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xs font-semibold line-clamp-1"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    {c.title}
                  </div>
                  <div className="text-[10px] line-clamp-1" style={{ color: 'var(--theme-text-muted)' }}>
                    {c.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-md text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-white"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
