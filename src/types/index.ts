export type EducationTier = 'primary' | 'secondary' | 'college';

export type AcademicYear =
  | '1st Year'
  | '2nd Year'
  | '3rd Year'
  | '4th Year'
  | "Master's Degree"
  | 'PhD / Doctoral'
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5'
  | 'Grade 6'
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9'
  | 'Grade 10'
  | 'Grade 11'
  | 'Grade 12'
  | string;

export interface StudentProfile {
  tier: EducationTier;
  gradeOrYear: AcademicYear;
  institutionName?: string;
  streamOrGradeLabel: string;
  branchId: string;
}

export interface CourseBranch {
  id: string;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  tier?: EducationTier;
  years: Record<string, CourseItem[]>;
}

export interface CourseItem {
  id: string;
  courseCode?: string;
  title: string;
  description: string;
  sampleDocument?: CourseDocument;
}

export type BlockType = 'heading-1' | 'heading-2' | 'paragraph' | 'list-item' | 'table-row';

export interface SentenceItem {
  id: string;
  text: string;
  startWordIndex: number;
  endWordIndex: number;
  chapterTitle?: string;
  pageNumber?: number;
  blockType?: BlockType;
}

export interface DocumentPage {
  pageNumber: number;
  title?: string;
  sentences: SentenceItem[];
}

export interface CourseDocument {
  id: string;
  title: string;
  courseCode?: string;
  branchId: string;
  year: AcademicYear;
  rawText: string;
  sentences: SentenceItem[];
  pages?: DocumentPage[];
  chapters: { title: string; startSentenceIndex: number }[];
  isCustomUpload?: boolean;
}

export interface AskDoubtResponse {
  simpleExplanation: string;
  engineeringContext: string;
  keyTakeaway: string;
  memoryHook: string;
  quickCheckQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface SimplifiedNarrationResponse {
  title: string;
  conversationalScript: string[];
  keyDefinitionsSimplified: {
    term: string;
    simpleMeaning: string;
  }[];
  estimatedMinutes: number;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint: string;
  tag: string;
  isMastered?: boolean;
}

export interface CheatSheetItem {
  concept: string;
  formulaOrLaw: string;
  plainEnglishExplanation: string;
  examTip: string;
}

export interface MnemonicAid {
  mnemonic: string;
  meaning: string;
  application: string;
}

export interface AutonomousStudyNotes {
  title: string;
  overview: string;
  referenceBook?: string;
  keyTakeaways: string[];
  cheatSheetItems: CheatSheetItem[];
  flashcards: FlashcardItem[];
  mnemonicAids: MnemonicAid[];
  generatedAt: number;
  depth: 'short' | 'full';
}

export interface VoicePreference {
  voiceURI: string;
  voiceName: string;
  pitch: number;
  rate: number;
  volume: number;
}

export type PlaybackMode = 'verbatim' | 'simplified';

export type AppTheme =
  | 'eyecare'
  | 'paper'
  | 'obsidian'
  | 'nordic'
  | 'cobalt'
  | 'sage'
  | 'amber'
  | 'velvet'
  | 'espresso'
  | 'matrix';

export type CopilotActionType =
  | 'setTheme'
  | 'switchVoice'
  | 'setPlaybackSpeed'
  | 'setPlaybackMode'
  | 'openCourse'
  | 'controlAudio'
  | 'createCourseNotes'
  | 'navigateView';

export interface CopilotAction {
  tool: CopilotActionType;
  args: Record<string, any>;
  description: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actionsExecuted?: CopilotAction[];
  notesCreated?: AutonomousStudyNotes;
}

export interface CopilotRequest {
  message: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  currentContext?: {
    currentCourse?: string;
    branch?: string;
    year?: string;
    activeTheme?: string;
    playbackRate?: number;
    playbackMode?: string;
    isPlaying?: boolean;
    voiceName?: string;
  };
}

export interface CopilotResponse {
  reply: string;
  actions?: CopilotAction[];
  notesCreated?: AutonomousStudyNotes;
}
