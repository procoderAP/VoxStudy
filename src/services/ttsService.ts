import { VoicePreference, SentenceItem } from '../types';

export type TTSEngineType = 'studio' | 'browser';

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSentenceIndex: number;
  totalSentences: number;
  playbackRate: number;
  playbackPitch: number;
  selectedVoiceURI: string;
  engine: TTSEngineType;
  studioVoiceName: string;
  freeVoiceId: string;
  freeVoiceName: string;
  estimatedRemainingSeconds: number;
  isBuffering: boolean;
  quotaExceeded: boolean;
}

export type TTSEventListener = (state: TTSState) => void;

export interface FreeVoiceOption {
  id: string;
  name: string;
  accent: string;
  locale: string;
  gender: 'Female' | 'Male';
  persona: string;
  description: string;
  recommended?: boolean;
}

export const FREE_NATURAL_VOICES: FreeVoiceOption[] = [
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny',
    accent: 'US English',
    locale: 'en-US',
    gender: 'Female',
    persona: 'Natural & Expressive',
    description: 'Warm, clear conversational voice, perfect for continuous reading without fatigue.',
    recommended: true,
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy',
    accent: 'US English',
    locale: 'en-US',
    gender: 'Male',
    persona: 'Clear Academic Lecturer',
    description: 'Crisp, articulate professor delivery ideal for complex engineering notes.',
    recommended: true,
  },
  {
    id: 'en-IN-NeerjaNeural',
    name: 'Neerja',
    accent: 'Indian English',
    locale: 'en-IN',
    gender: 'Female',
    persona: 'BITS Pilani Dubai Academic',
    description: 'Authentic Indian English pronunciation tailored for BITS Pilani Dubai coursework.',
    recommended: true,
  },
  {
    id: 'en-IN-PrabhatNeural',
    name: 'Prabhat',
    accent: 'Indian English',
    locale: 'en-IN',
    gender: 'Male',
    persona: 'BITS Engineering Professor',
    description: 'Clear, authoritative Indian engineering instructor voice.',
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria',
    accent: 'US English',
    locale: 'en-US',
    gender: 'Female',
    persona: 'Warm & Confident',
    description: 'Engaging, professional female narrator with flawless natural pacing.',
  },
  {
    id: 'en-US-ChristopherNeural',
    name: 'Christopher',
    accent: 'US English',
    locale: 'en-US',
    gender: 'Male',
    persona: 'Deep & Authoritative',
    description: 'Resonant, grounded baritone voice for high-yield exam concepts.',
  },
  {
    id: 'en-US-EricNeural',
    name: 'Eric',
    accent: 'US English',
    locale: 'en-US',
    gender: 'Male',
    persona: 'Dynamic & Friendly',
    description: 'Upbeat, friendly delivery suited for active study and commute listening.',
  },
  {
    id: 'en-GB-SoniaNeural',
    name: 'Sonia',
    accent: 'UK British',
    locale: 'en-GB',
    gender: 'Female',
    persona: 'British Academic',
    description: 'Distinguished British English accent with immaculate diction.',
  },
  {
    id: 'en-GB-RyanNeural',
    name: 'Ryan',
    accent: 'UK British',
    locale: 'en-GB',
    gender: 'Male',
    persona: 'British Lecturer',
    description: 'Measured, articulate British speaker for detailed textbook walkthroughs.',
  },
  {
    id: 'en-AU-NatashaNeural',
    name: 'Natasha',
    accent: 'Australian English',
    locale: 'en-AU',
    gender: 'Female',
    persona: 'Natural & Crisp',
    description: 'Clear Australian English cadence for relaxed, immersive study sessions.',
  },
  {
    id: 'en-AU-WilliamMultilingualNeural',
    name: 'William',
    accent: 'Australian English',
    locale: 'en-AU',
    gender: 'Male',
    persona: 'Resonant Australian',
    description: 'Calm, confident male voice with distinctive Australian accent.',
  },
  {
    id: 'en-CA-ClaraNeural',
    name: 'Clara',
    accent: 'Canadian English',
    locale: 'en-CA',
    gender: 'Female',
    persona: 'Clear & Polite',
    description: 'Smooth North American delivery with gentle, polite cadence.',
  },
  {
    id: 'en-CA-LiamNeural',
    name: 'Liam',
    accent: 'Canadian English',
    locale: 'en-CA',
    gender: 'Male',
    persona: 'Modern Canadian',
    description: 'Natural, modern North American voice for study reviews.',
  },
];

export interface StudioVoiceOption {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  persona: string;
  styleDescription: string;
  recommended?: boolean;
}

export const STUDIO_VOICES: StudioVoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore (Recommended)',
    gender: 'Female',
    persona: 'Academic Mentor',
    styleDescription: 'Warm, natural, crystal-clear articulation with human breathing and conversational cadence.',
    recommended: true,
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    persona: 'Engaging Professor',
    styleDescription: 'Energetic, articulate, engaging speaker ideal for technical walk-throughs and robotics.',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    persona: 'Senior Fellow',
    styleDescription: 'Deep, resonant, authoritative voice suitable for late-night textbook study.',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Female',
    persona: 'Commute Companion',
    styleDescription: 'Smooth, relaxed, ultra-natural cadence perfect for listening during commutes.',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    persona: 'Steady Narrator',
    styleDescription: 'Structured, measured, formal delivery for deep engineering principles.',
  },
];

class TTSService {
  private engine: TTSEngineType = 'browser';
  private studioVoiceName: string = 'Kore';
  private freeVoiceId: string = 'en-US-JennyNeural';
  private quotaExceeded: boolean = false;

  // Studio Audio Element
  private audioPlayer: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map(); // key -> blobUrl
  private inFlightFetches: Map<string, Promise<string | null>> = new Map();
  private isBuffering: boolean = false;
  private isAudioUnlocked: boolean = false;

  // Browser Fallback Synth
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private browserVoices: SpeechSynthesisVoice[] = [];
  private selectedBrowserVoice: SpeechSynthesisVoice | null = null;

  private sentences: SentenceItem[] = [];
  private currentSentenceIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private listeners: Set<TTSEventListener> = new Set();

  private preference: VoicePreference = {
    voiceURI: 'Natural',
    voiceName: 'Natural voice (Default)',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioPlayer = new Audio();
      this.setupAudioListeners();

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initBrowserVoices();
      }
      this.loadSavedPreferences();
    }
  }

  private setupAudioListeners() {
    if (!this.audioPlayer) return;

    this.audioPlayer.onended = () => {
      if (this.isPlaying && !this.isPaused) {
        if (this.currentSentenceIndex < this.sentences.length - 1) {
          this.currentSentenceIndex++;
          this.notify();
          this.speakCurrent();
        } else {
          this.isPlaying = false;
          this.isPaused = false;
          this.isBuffering = false;
          this.notify();
        }
      }
    };

    this.audioPlayer.onerror = () => {
      this.isBuffering = false;
      this.notify();
    };

    this.audioPlayer.onplaying = () => {
      this.isBuffering = false;
      this.notify();
    };

    this.audioPlayer.onwaiting = () => {
      this.isBuffering = true;
      this.notify();
    };
  }

  // Pre-unlock the browser Audio element to prevent autoplay restrictions
  public unlockAudio() {
    if (this.isAudioUnlocked || !this.audioPlayer) return;
    try {
      this.audioPlayer.play().then(() => {
        this.audioPlayer?.pause();
        this.isAudioUnlocked = true;
      }).catch(() => {});
    } catch {
      // Ignore
    }
  }

  private loadSavedPreferences() {
    try {
      const saved = localStorage.getItem('voxstudy_voice_prefs');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.preference = { ...this.preference, ...parsed };
        this.engine = parsed.engine === 'studio' ? 'studio' : 'browser';
        this.studioVoiceName = parsed.studioVoiceName || 'Kore';
        this.freeVoiceId = parsed.freeVoiceId || 'en-US-JennyNeural';
      } else {
        this.engine = 'browser';
        this.studioVoiceName = 'Kore';
        this.freeVoiceId = 'en-US-JennyNeural';
      }
    } catch {
      this.engine = 'browser';
      this.studioVoiceName = 'Kore';
      this.freeVoiceId = 'en-US-JennyNeural';
    }
  }

  public savePreferences(prefs: Partial<VoicePreference & { engine: TTSEngineType; studioVoiceName: string; freeVoiceId?: string }>) {
    if (prefs.engine) this.engine = prefs.engine;
    if (prefs.studioVoiceName) this.studioVoiceName = prefs.studioVoiceName;
    if (prefs.freeVoiceId) this.freeVoiceId = prefs.freeVoiceId;

    this.preference = {
      ...this.preference,
      ...prefs,
    };

    try {
      localStorage.setItem('voxstudy_voice_prefs', JSON.stringify({
        ...this.preference,
        engine: this.engine,
        studioVoiceName: this.studioVoiceName,
        freeVoiceId: this.freeVoiceId,
      }));
    } catch {
      // Ignore
    }
    this.notify();
  }

  public getPreferences() {
    return {
      ...this.preference,
      engine: this.engine,
      studioVoiceName: this.studioVoiceName,
      freeVoiceId: this.freeVoiceId,
    };
  }

  // Sanitize academic text for natural spoken human cadence and seamless flow
  private prepareSpeechText(text: string): string {
    if (!text) return '';
    let cleaned = text
      // Unwrap any intra-sentence soft line-breaks so narrator doesn't stumble
      .replace(/[\r\n]+/g, ' ')
      // Common engineering math formulas & symbols -> phonetic spoken words
      .replace(/\\nabla\s*\\cdot\s*\\mathbf\{B\}\s*=\s*0/gi, "divergence of magnetic flux B is zero")
      .replace(/e\s*=\s*-d[Φphi]+\/dt/gi, "e equals negative d-phi by d-t, Faraday's law of electromagnetic induction")
      .replace(/det\s*\(\s*J(?:\(q\))?\s*\)\s*=\s*0/gi, "determinant of the Jacobian matrix equals zero, indicating kinematic singularity")
      .replace(/J\s*\(\s*q\s*\)/gi, "Jacobian matrix J of q")
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 divided by $2")
      .replace(/\\times|×/g, " times ")
      .replace(/\\cdot|·/g, " dot ")
      .replace(/\\approx|≈/g, " approximately ")
      .replace(/\\pm|±/g, " plus or minus ")
      .replace(/\\le(q)?|<=|≤/g, " less than or equal to ")
      .replace(/\\ge(q)?|>=|≥/g, " greater than or equal to ")
      .replace(/\\ne|!=|≠/g, " not equal to ")
      .replace(/\\to|->|→/g, " leads to ")
      .replace(/\\Delta|Δ/g, " delta ")
      .replace(/\\omega|ω/g, " omega ")
      .replace(/\\theta|θ/g, " theta ")
      .replace(/\\lambda|λ/g, " lambda ")
      .replace(/\\pi|π/g, " pi ")
      .replace(/\\mu|μ/g, " micro ")
      .replace(/\\sigma|σ/g, " sigma ")
      .replace(/\\alpha|α/g, " alpha ")
      .replace(/\\beta|β/g, " beta ")
      .replace(/\\phi|φ|Φ/g, " phi ")
      .replace(/\\partial|∂/g, " partial derivative of ")
      .replace(/\\sum|∑/g, " summation of ")
      .replace(/\\int|∫/g, " integral of ")
      .replace(/\btheta_i\b|θ_i/gi, "theta i")
      .replace(/\balpha_i\b|α_i/gi, "alpha i")
      .replace(/\ba_i\b/gi, "link length a i")
      .replace(/\bd_i\b/gi, "joint offset d i")
      .replace(/\bA_i\b/gi, "homogeneous transformation matrix A i")
      .replace(/\\[a-zA-Z]+/g, "")
      .replace(/\{|\}/g, "")
      // Expand common academic abbreviations into fluent words
      .replace(/\be\.g\.,?\s*/gi, "for example, ")
      .replace(/\bi\.e\.,?\s*/gi, "that is, ")
      .replace(/\bet al\.,?\s*/gi, "and colleagues, ")
      .replace(/\bw\.r\.t\.?\s*/gi, "with respect to ")
      .replace(/\bvs\.\s*/gi, "versus ")
      .replace(/\bapprox\.\s*/gi, "approximately ")
      .replace(/\bdeg C\b/gi, "degrees Celsius")
      .replace(/\b°C\b/gi, "degrees Celsius")
      .replace(/\bdeg F\b/gi, "degrees Fahrenheit")
      .replace(/\b°F\b/gi, "degrees Fahrenheit")
      .replace(/\bkW\b/gi, "kilowatts")
      .replace(/\bMW\b/gi, "megawatts")
      .replace(/\bkHz\b/gi, "kilohertz")
      .replace(/\bMHz\b/gi, "megahertz")
      .replace(/\bGHz\b/gi, "gigahertz")
      // Remove citation brackets like [1], [2-4], (Ref 3)
      .replace(/\[\d+(?:[-,]\s*\d+)*\]/g, "")
      .replace(/\(Ref(?:erence)?\.?\s*\d+\)/gi, "")
      // Clean bullet and markdown symbols
      .replace(/[*_#`~|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Ensure the text ends with terminal punctuation for natural narrator cadence
    if (cleaned && !/[.!?]$/.test(cleaned)) {
      if (/[,\-;:]$/.test(cleaned)) {
        cleaned = cleaned.slice(0, -1);
      }
      cleaned += '.';
    }

    return cleaned;
  }

  private initBrowserVoices() {
    if (!this.synth) return;
    const populate = () => {
      const all = this.synth?.getVoices() || [];
      const english = all.filter(v => v.lang.toLowerCase().startsWith('en'));

      // Score voices so the most natural, human-sounding free voices are ALWAYS ranked first
      const score = (v: SpeechSynthesisVoice) => {
        let s = 0;
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();

        if (lang.startsWith('en')) s += 40;
        if (lang.startsWith('en-us') || lang.startsWith('en-gb') || lang.startsWith('en-in') || lang.startsWith('en-au')) s += 20;

        // 1. Microsoft Edge Natural Voices (Best free human voices on Windows / Edge)
        if (name.includes('natural') || name.includes('online (natural)')) s += 250;
        if (name.includes('jenny') || name.includes('guy') || name.includes('aria') || name.includes('christopher') || name.includes('eric')) s += 100;

        // 2. Google Neural Voices (Chrome on all platforms)
        if (name.includes('google') && (lang.startsWith('en-us') || lang.startsWith('en-gb'))) s += 200;
        if (name.includes('google us english') || name.includes('google uk english')) s += 50;

        // 3. Apple Enhanced / Premium Voices (Safari / macOS / iOS)
        if (name.includes('enhanced') || name.includes('premium')) s += 180;
        if (name.includes('samantha') || name.includes('daniel') || name.includes('karen') || name.includes('ava') || name.includes('zoe')) s += 70;

        // Heavily penalize robotic desktop engines (eSpeak, robotic mbrola, legacy synth)
        if (name.includes('espeak') || name.includes('mbrola')) s -= 500;
        if (name.includes('david desktop') || name.includes('zira desktop') || name.includes('hazel desktop')) s -= 100;

        return s;
      };

      const sorted = [...(english.length > 0 ? english : all)].sort((a, b) => score(b) - score(a));
      this.browserVoices = sorted;

      // Automatically select the highest-scoring natural human voice if none is explicitly saved
      if (sorted.length > 0) {
        if (!this.selectedBrowserVoice) {
          this.selectedBrowserVoice = sorted[0];
          this.preference.voiceURI = sorted[0].voiceURI;
          this.preference.voiceName = sorted[0].name;
        } else {
          // If the currently selected voice is an old robotic voice, upgrade to the top natural voice
          const curScore = score(this.selectedBrowserVoice);
          if (curScore < 100 && score(sorted[0]) >= 100) {
            this.selectedBrowserVoice = sorted[0];
            this.preference.voiceURI = sorted[0].voiceURI;
            this.preference.voiceName = sorted[0].name;
          }
        }
      }
      this.notify();
    };

    populate();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = populate;
    }
  }

  public getAvailableBrowserVoices(): SpeechSynthesisVoice[] {
    return this.browserVoices;
  }

  public subscribe(listener: TTSEventListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  public getState(): TTSState {
    const wordsRemaining = this.sentences
      .slice(this.currentSentenceIndex)
      .reduce((acc, s) => acc + s.text.split(/\s+/).length, 0);

    const wordsPerMinute = 135 * (this.preference.rate || 1);
    const estimatedMinutes = wordsRemaining / Math.max(wordsPerMinute, 60);

    const freeOpt = FREE_NATURAL_VOICES.find(v => v.id === this.freeVoiceId);
    const freeVoiceName = freeOpt ? `${freeOpt.name} (${freeOpt.accent})` : 'Natural voice';

    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentSentenceIndex: this.currentSentenceIndex,
      totalSentences: this.sentences.length,
      playbackRate: this.preference.rate,
      playbackPitch: this.preference.pitch,
      selectedVoiceURI: this.preference.voiceURI,
      engine: this.engine,
      studioVoiceName: this.studioVoiceName,
      freeVoiceId: this.freeVoiceId,
      freeVoiceName: freeVoiceName,
      estimatedRemainingSeconds: Math.round(estimatedMinutes * 60),
      isBuffering: this.isBuffering,
      quotaExceeded: this.quotaExceeded,
    };
  }

  public isFreeNeuralActive(): boolean {
    return this.engine === 'browser' && FREE_NATURAL_VOICES.some(v => v.id === this.freeVoiceId);
  }

  public setDocumentSentences(sentences: SentenceItem[]) {
    this.stop();
    this.sentences = sentences;
    this.currentSentenceIndex = 0;
    this.audioCache.clear();
    this.inFlightFetches.clear();
    this.preloadUpcoming(0, 3);
    this.notify();
  }

  public play() {
    this.unlockAudio();

    if (this.isPaused) {
      if ((this.engine === 'studio' || this.isFreeNeuralActive()) && this.audioPlayer && this.audioPlayer.src) {
        this.audioPlayer.play().catch(() => {});
      } else if (this.synth) {
        this.synth.resume();
      }
      this.isPlaying = true;
      this.isPaused = false;
      this.notify();
      return;
    }

    if (this.sentences.length === 0) return;
    this.isPlaying = true;
    this.isPaused = false;
    this.speakCurrent();
  }

  public pause() {
    if (this.isPlaying && !this.isPaused) {
      if ((this.engine === 'studio' || this.isFreeNeuralActive()) && this.audioPlayer) {
        this.audioPlayer.pause();
      } else if (this.synth) {
        this.synth.pause();
      }
      this.isPaused = true;
      this.isPlaying = false;
      this.notify();
    }
  }

  public stop() {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.isBuffering = false;
    this.notify();
  }

  public togglePlayPause() {
    this.unlockAudio();
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Fetch free neural speech audio from /api/study/free-tts (100% Free · Zero Credits · Unlimited)
  private async fetchFreeAudio(text: string, voiceIdOverride?: string): Promise<string | null> {
    const voiceToUse = voiceIdOverride || this.freeVoiceId || 'en-US-JennyNeural';
    const clean = text.trim();
    if (!clean) return null;

    const rate = this.preference.rate || 1.0;
    const cacheKey = `free_${voiceToUse}_${rate}_${clean}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }
    if (this.inFlightFetches.has(cacheKey)) {
      return this.inFlightFetches.get(cacheKey)!;
    }

    const fetchPromise = (async (): Promise<string | null> => {
      try {
        const res = await fetch('/api/study/free-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: clean,
            voice: voiceToUse,
            rate: rate,
          }),
        });

        if (!res.ok) return null;
        const data = await res.json();
        if (data.error || !data.audioBase64) return null;

        const byteCharacters = atob(data.audioBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mp3' });
        const blobUrl = URL.createObjectURL(blob);

        this.audioCache.set(cacheKey, blobUrl);
        return blobUrl;
      } catch {
        return null;
      }
    })().finally(() => {
      this.inFlightFetches.delete(cacheKey);
    });

    this.inFlightFetches.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  // Proactively fetch upcoming lines into memory so sentence-to-sentence transition is instant (0ms gap)
  public preloadUpcoming(startIndex: number, count: number = 3) {
    if (!this.isFreeNeuralActive()) return;
    const end = Math.min(this.sentences.length, startIndex + count);
    for (let i = startIndex; i < end; i++) {
      const item = this.sentences[i];
      if (item && item.text && item.text.trim()) {
        const text = item.text.trim();
        const cacheKey = `free_${this.freeVoiceId}_${this.preference.rate || 1.0}_${text}`;
        if (!this.audioCache.has(cacheKey) && !this.inFlightFetches.has(cacheKey)) {
          this.fetchFreeAudio(text).catch(() => {});
        }
      }
    }
  }

  public jumpToSentence(index: number) {
    this.unlockAudio();
    if (index < 0 || index >= this.sentences.length) return;
    this.currentSentenceIndex = index;
    if (this.isPlaying || this.isPaused) {
      this.stop();
      this.isPlaying = true;
      this.isPaused = false;
      this.speakCurrent();
    } else {
      this.notify();
    }
  }

  public nextSentence() {
    if (this.currentSentenceIndex < this.sentences.length - 1) {
      this.jumpToSentence(this.currentSentenceIndex + 1);
    } else {
      this.stop();
    }
  }

  public prevSentence() {
    if (this.currentSentenceIndex > 0) {
      this.jumpToSentence(this.currentSentenceIndex - 1);
    }
  }

  public skipForward15() {
    const sentencesToSkip = Math.max(1, Math.round(2 / (this.preference.rate || 1)));
    const target = Math.min(this.sentences.length - 1, this.currentSentenceIndex + sentencesToSkip);
    this.jumpToSentence(target);
  }

  public skipBackward15() {
    const sentencesToSkip = Math.max(1, Math.round(2 / (this.preference.rate || 1)));
    const target = Math.max(0, this.currentSentenceIndex - sentencesToSkip);
    this.jumpToSentence(target);
  }

  public setRate(rate: number) {
    const clamped = Math.max(0.75, Math.min(2.0, rate));
    this.savePreferences({ rate: clamped });
    if (this.audioPlayer) {
      this.audioPlayer.playbackRate = clamped;
    }
  }

  public setEngine(engine: TTSEngineType) {
    this.stop();
    this.savePreferences({ engine });
  }

  public setStudioVoice(voiceName: string) {
    const map: Record<string, string> = {
      Kore: 'en-US-JennyNeural',
      Puck: 'en-US-GuyNeural',
      Zephyr: 'en-US-AriaNeural',
      Fenrir: 'en-US-ChristopherNeural',
      Charon: 'en-GB-RyanNeural',
    };
    const target = map[voiceName] || 'en-US-JennyNeural';
    this.setFreeVoice(target);
  }

  public getAvailableFreeVoices(): FreeVoiceOption[] {
    return FREE_NATURAL_VOICES;
  }

  public setFreeVoice(voiceId: string) {
    this.stop();
    this.engine = 'browser';
    this.freeVoiceId = voiceId;
    const found = FREE_NATURAL_VOICES.find(v => v.id === voiceId);
    const name = found ? `${found.name} (${found.accent})` : 'Natural voice';
    this.preference.voiceURI = voiceId;
    this.preference.voiceName = `${name} (Free Natural Voice)`;
    this.savePreferences({
      engine: 'browser',
      voiceURI: voiceId,
      voiceName: `${name} (Free Natural Voice)`,
      freeVoiceId: voiceId,
    });
    this.notify();
  }

  public setBrowserVoice(voiceURI: string) {
    this.stop();
    // Check if voiceURI is one of our curated free neural voices
    const isFree = FREE_NATURAL_VOICES.find(v => v.id === voiceURI);
    if (isFree) {
      this.setFreeVoice(voiceURI);
      return;
    }

    const found = this.browserVoices.find(v => v.voiceURI === voiceURI);
    if (found) {
      this.selectedBrowserVoice = found;
      this.savePreferences({
        engine: 'browser',
        voiceURI: found.voiceURI,
        voiceName: `${found.name} (Natural voice)`,
      });
    }
  }

  public switchToNaturalVoice(specificVoice?: string) {
    this.stop();
    this.quotaExceeded = false;
    this.engine = 'browser';

    if (specificVoice) {
      const lower = specificVoice.toLowerCase().trim();
      const matched = FREE_NATURAL_VOICES.find(
        v => v.id.toLowerCase() === lower || v.name.toLowerCase() === lower
      );
      if (matched) {
        this.setFreeVoice(matched.id);
        this.play();
        return;
      }
    }

    if (this.freeVoiceId) {
      this.setFreeVoice(this.freeVoiceId);
    } else {
      this.setFreeVoice('en-US-JennyNeural');
    }
    this.play();
  }

  private async speakCurrent() {
    const item = this.sentences[this.currentSentenceIndex];
    if (!item) {
      this.stop();
      return;
    }

    const rawText = item.text.trim();
    // Skip empty or isolated punctuation across all engines
    if (!rawText || rawText.replace(/[\s\d.,!?;:()[\]{}"'\\/-]/g, '').length === 0) {
      if (this.currentSentenceIndex < this.sentences.length - 1) {
        this.currentSentenceIndex++;
        this.notify();
        this.speakCurrent();
      } else {
        this.stop();
      }
      return;
    }

    // Immediately broadcast active sentence index to UI so karaoke highlights in sync
    this.isBuffering = this.isFreeNeuralActive();
    this.notify();

    // 1. Curated Natural Neural Voices (100% Free · Zero Credits · Unlimited)
    if (this.isFreeNeuralActive()) {
      const cacheKey = `free_${this.freeVoiceId}_${this.preference.rate || 1.0}_${rawText}`;
      const cachedBlobUrl = this.audioCache.get(cacheKey);

      if (cachedBlobUrl && this.audioPlayer && this.isPlaying && !this.isPaused) {
        this.audioPlayer.src = cachedBlobUrl;
        this.audioPlayer.playbackRate = this.preference.rate || 1.0;
        this.isBuffering = false;
        this.notify();
        this.preloadUpcoming(this.currentSentenceIndex + 1, 3);
        try {
          await this.audioPlayer.play();
          return;
        } catch {}
      }

      this.isBuffering = true;
      this.notify();

      // Trigger preloading of upcoming lines immediately in parallel
      this.preloadUpcoming(this.currentSentenceIndex + 1, 3);

      // Fetch on-demand strictly for this current sentence
      const blobUrl = await this.fetchFreeAudio(rawText);
      if (!this.isPlaying || this.isPaused) {
        this.isBuffering = false;
        this.notify();
        return;
      }

      if (blobUrl && this.audioPlayer && this.isPlaying && !this.isPaused) {
        this.audioPlayer.src = blobUrl;
        this.audioPlayer.playbackRate = this.preference.rate || 1.0;
        this.isBuffering = false;
        this.notify();
        try {
          await this.audioPlayer.play();
          return;
        } catch {}
      }

      // If network fetch fails (e.g. offline), seamlessly continue below with device SpeechSynthesis
    }

    // 3. Device Fallback Synthesizer (Local Web Speech API)
    if (this.synth) {
      this.synth.cancel();
      const spokenText = this.prepareSpeechText(item.text);
      const utterance = new SpeechSynthesisUtterance(spokenText || item.text);
      utterance.rate = this.preference.rate || 1.0;
      utterance.pitch = this.preference.pitch || 1.0;

      if (this.selectedBrowserVoice) {
        utterance.voice = this.selectedBrowserVoice;
      } else if (this.browserVoices.length > 0) {
        utterance.voice = this.browserVoices[0];
      }

      utterance.onstart = () => {
        this.isBuffering = false;
        this.notify();
      };

      utterance.onend = () => {
        if (this.isPlaying && !this.isPaused) {
          if (this.currentSentenceIndex < this.sentences.length - 1) {
            this.currentSentenceIndex++;
            this.notify();
            this.speakCurrent();
          } else {
            this.isPlaying = false;
            this.isPaused = false;
            this.isBuffering = false;
            this.notify();
          }
        }
      };

      utterance.onerror = (e) => {
        if (e.error === 'canceled' || e.error === 'interrupted') {
          return;
        }
        if (this.isPlaying) {
          this.stop();
        }
      };

      this.currentUtterance = utterance;
      this.isBuffering = false;
      this.notify();
      this.synth.speak(utterance);
    }
  }

  // Test Free Voice sample (Zero AI Credits)
  public async testFreeVoice(voiceId: string) {
    this.unlockAudio();
    const opt = FREE_NATURAL_VOICES.find(v => v.id === voiceId);
    const testText = `Hello! I am ${opt?.name || 'your narrator'} reading your engineering lecture notes with natural human inflection and zero AI credits.`;
    const url = await this.fetchFreeAudio(testText, voiceId);
    if (url && this.audioPlayer) {
      this.audioPlayer.src = url;
      this.audioPlayer.playbackRate = 1.0;
      this.audioPlayer.play().catch(() => {});
    }
  }

  // Backward compatibility alias for testing voices
  public async testStudioVoice(voiceName: string) {
    const map: Record<string, string> = {
      Kore: 'en-US-JennyNeural',
      Puck: 'en-US-GuyNeural',
      Zephyr: 'en-US-AriaNeural',
      Fenrir: 'en-US-ChristopherNeural',
      Charon: 'en-GB-RyanNeural',
    };
    const target = map[voiceName] || 'en-US-JennyNeural';
    return this.testFreeVoice(target);
  }
}

export const ttsService = new TTSService();
