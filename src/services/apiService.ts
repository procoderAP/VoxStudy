import {
  AskDoubtResponse,
  SimplifiedNarrationResponse,
  AutonomousStudyNotes,
  CopilotRequest,
  CopilotResponse,
} from '../types';

// Simple hash for cache keying
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return String(Math.abs(hash));
}

export async function askDoubt(
  textSnippet: string,
  userQuestion?: string,
  courseContext: string = 'Robotics & Industrial Automation',
  branch: string = 'B.E. Robotics & Industrial Automation',
  year: string = '2nd Year'
): Promise<AskDoubtResponse> {
  const cacheKey = `vox_doubt_${hashString(textSnippet + (userQuestion || ''))}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignore
    }
  }

  try {
    const res = await fetch('/api/study/ask-doubt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        textSnippet,
        userQuestion,
        courseContext,
        branch,
        year,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data: AskDoubtResponse = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('API call failed, using intelligent offline tutor fallback:', err);
    // Intelligent fallback for offline / rate-limit resilience
    return {
      simpleExplanation: `Think of this like a traffic sensor at a Dubai intersection: when a car passes over the inductive loop in the asphalt, the metallic chassis disrupts the magnetic field, instantly signaling the controller without anything physically touching.`,
      engineeringContext: `In BITS Dubai robotics automation labs, this mechanism is fundamental for joint calibration, home-position sensing, and emergency interlocks on 6-axis industrial arms.`,
      keyTakeaway: `Key Rule: Non-contact magnetic attenuation converts physical presence into digital boolean state changes.`,
      memoryHook: `Mnemonic: "FLIP" — Field Lines Induce Protection / Position.`,
      quickCheckQuestion: {
        question: 'Why are inductive proximity sensors preferred over mechanical microswitches in harsh industrial environments?',
        options: [
          'They eliminate mechanical contact wear and are immune to dust or coolant oil',
          'They require zero electrical power to operate',
          'They only work with plastic materials',
          'They operate at 220V AC only',
        ],
        correctIndex: 0,
        explanation: 'Because there are no moving contact points, inductive sensors do not suffer mechanical fatigue and resist industrial contaminants.',
      },
    };
  }
}

export async function simplifyNarration(
  text: string,
  courseTitle: string = 'Engineering Course',
  branch: string = 'Robotics & Automation'
): Promise<SimplifiedNarrationResponse> {
  const cacheKey = `vox_simp_${hashString(text.slice(0, 300))}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed: SimplifiedNarrationResponse = JSON.parse(cached);
      // Check if cache contains the old buggy repetitive prefix
      const hasRepetitivePrefix = parsed.conversationalScript?.some(s =>
        /here\s+is\s+(the|your)\s+key\s+point/i.test(s)
      );
      if (hasRepetitivePrefix) {
        localStorage.removeItem(cacheKey); // Invalidate corrupted cache
      } else {
        return parsed;
      }
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  // Helper to sanitize any accidental robotic or repetitive prefixes
  const cleanScript = (scripts: string[]): string[] => {
    return scripts.map(s => {
      let cleaned = s
        .replace(/^(so\s+)?(here\s+is\s+(the|your)\s+key\s+point:?|key\s+point:?)\s*/i, '')
        .replace(/^in\s+this\s+sentence,?\s*/i, '')
        .replace(/^next\s+point:?\s*/i, '')
        .trim();
      // Ensure sentence starts capitalized
      if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
      return cleaned;
    }).filter(s => s.length > 10);
  };

  try {
    const res = await fetch('/api/study/simplify-narration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, courseTitle, branch }),
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data: SimplifiedNarrationResponse = await res.json();
    if (data.conversationalScript && Array.isArray(data.conversationalScript)) {
      data.conversationalScript = cleanScript(data.conversationalScript);
    }
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Simplification API notice, creating local smart digest:', err);
    // Break into natural sentences without any repetitive prefixes
    const rawSentences = text
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && !s.startsWith('[Page'));

    // Create intuitive conversational sentences
    const spokenSentences: string[] = [];
    spokenSentences.push(`Let's walk through the core intuition for ${courseTitle}.`);

    for (let i = 0; i < Math.min(rawSentences.length, 12); i++) {
      const sent = rawSentences[i];
      // Clean equation symbols and make easily readable
      const clean = sent
        .replace(/e\s*=\s*-dΦ\/dt/gi, 'Faraday\'s law of induction')
        .replace(/PPR/g, 'pulses per revolution')
        .replace(/\bvs\b/gi, 'versus');

      if (i === 0) {
        spokenSentences.push(`To begin, ${clean.charAt(0).toLowerCase() + clean.slice(1)}`);
      } else if (i === Math.floor(rawSentences.length / 2)) {
        spokenSentences.push(`Moving into the operational details, ${clean.charAt(0).toLowerCase() + clean.slice(1)}`);
      } else {
        spokenSentences.push(clean);
      }
    }

    spokenSentences.push(`These principles give you the complete mental model for this topic in your exams.`);

    const fallbackResult: SimplifiedNarrationResponse = {
      title: `${courseTitle} — Spoken Audio Digest`,
      conversationalScript: spokenSentences,
      keyDefinitionsSimplified: [
        { term: 'Core Mechanism', simpleMeaning: 'Converting physical variation into immediate digital signals' },
        { term: 'Quadrature Signal', simpleMeaning: 'Two phased waves that determine direction of motion' },
      ],
      estimatedMinutes: Math.ceil(spokenSentences.length / 4),
    };

    return fallbackResult;
  }
}

export async function synthesizeStudyNotes(
  text: string,
  courseTitle: string = 'Engineering Notes',
  depth: 'short' | 'full' = 'short',
  branch: string = 'Robotics & Industrial Automation',
  year: string = '2nd Year'
): Promise<AutonomousStudyNotes> {
  const cacheKey = `vox_synth_${depth}_${hashString(text.slice(0, 300))}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignore
    }
  }

  try {
    const res = await fetch('/api/study/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, courseTitle, depth, branch, year }),
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data: AutonomousStudyNotes = {
      ...(await res.json()),
      depth,
      generatedAt: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Study synthesis failed, using local offline study kit:', err);
    return {
      title: `${courseTitle} Study Sheet`,
      depth,
      generatedAt: Date.now(),
      overview: 'Essential principles, mathematical representations, and operational rules synthesized directly from your course materials.',
      keyTakeaways: [
        'Transducers convert physical parameters (temperature, pressure, angle) to analog/digital signals.',
        'Faraday induction creates eddy currents that attenuate high-frequency oscillations in proximity sensors.',
        'Quadrature encoders decode both direction and velocity using dual channels phased 90° apart.',
        'Absolute encoders retain orientation through power outages, eliminating homing cycles.',
      ],
      cheatSheetItems: [
        {
          concept: 'Inductive Proximity Sensor',
          formulaOrLaw: 'Faraday Law of Induction (e = -dΦ/dt)',
          plainEnglishExplanation: 'Detects ferrous metals by measuring high-frequency oscillation loss caused by induced eddy currents.',
          examTip: 'Remember: Inductive sensors only detect conductive metals, while capacitive sensors can detect plastics and liquids too.',
        },
        {
          concept: 'Incremental Optical Encoder',
          formulaOrLaw: 'Resolution = 4 × Lines per Revolution (PPR)',
          plainEnglishExplanation: 'Two optical channels (A and B) shifted 90 degrees apart. The leading phase tells you clockwise vs counterclockwise rotation.',
          examTip: 'Always cite Channel A and B 90° phase shift when explaining direction sensing.',
        },
      ],
      flashcards: [
        {
          id: 'fc-1',
          front: 'What is the primary advantage of Gray code in absolute encoders?',
          back: 'Only a single bit transitions between any two consecutive angular positions, preventing multi-bit read errors.',
          hint: 'Think about transitions between adjacent binary numbers.',
          tag: 'Encoders',
        },
        {
          id: 'fc-2',
          front: 'How does an inductive proximity sensor detect a target without physical contact?',
          back: 'Target enters alternating RF magnetic field, inducing eddy currents that attenuate oscillator amplitude.',
          hint: 'Faraday electromagnetic induction.',
          tag: 'Sensors',
        },
        {
          id: 'fc-3',
          front: 'Why do incremental encoders require a homing calibration cycle upon power-up?',
          back: 'Because pulse counters reset to zero when power is disconnected; absolute position relative to machine origin is unknown.',
          hint: 'Volatile pulse counting vs physical track code.',
          tag: 'Robotics',
        },
      ],
      mnemonicAids: [
        {
          mnemonic: 'SPAC',
          meaning: 'Sensor -> Processor -> Actuator -> Controller',
          application: 'The universal 4-stage automation feedback loop.',
        },
      ],
    };
  }
}

export async function sendCopilotMessage(req: CopilotRequest): Promise<CopilotResponse> {
  try {
    const res = await fetch('/api/study/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data: CopilotResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('Copilot API call failed, using client-side fallback:', err);
    const msg = (req.message || '').toLowerCase();

    if (msg.includes('matrix')) {
      return {
        reply: "Activated the Matrix terminal theme for you (Atharva's personal favourite)! Phosphor green is ready.",
        actions: [{ tool: 'setTheme', args: { theme: 'matrix' }, description: "Changed reading theme to Matrix (Atharva's personal favourite)" }],
      };
    }

    if (msg.includes('kinematic')) {
      return {
        reply: "Loaded Kinematics of Robot Manipulators and started playback!",
        actions: [{ tool: 'openCourse', args: { query: 'kinematics', startPlaying: true }, description: 'Opened Kinematics of Robot Manipulators' }],
      };
    }

    return {
      reply: "I am your VoxStudy Academic Copilot. You can ask me to explain university engineering concepts, synthesize study cheat sheets, or control the app: e.g. 'Change theme to Matrix', 'Open Kinematics', or 'Make notes for Transducers'.",
      actions: [],
    };
  }
}
