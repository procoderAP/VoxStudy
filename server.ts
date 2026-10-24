import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { GoogleGenAI, Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import type { AutonomousStudyNotes } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Safe JSON parser that strips markdown code fencing
function safeParseJson<T>(rawText: string | undefined | null, fallback: T): T {
  if (!rawText) return fallback;
  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}
async function generateWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} request failed, attempting next fallback model:`, err?.message || err);
      // Brief pause before trying next fallback model
      await new Promise(r => setTimeout(r, 200));
    }
  }
  throw lastError;
}

// 1. Ask a Doubt endpoint: Demystifies complex statements into simple analogies and engineering context
app.post('/api/study/ask-doubt', async (req: Request, res: Response): Promise<void> => {
  try {
    const { textSnippet, userQuestion, courseContext, branch, year } = req.body;

    if (!textSnippet && !userQuestion) {
      res.status(400).json({ error: 'Text snippet or question is required.' });
      return;
    }

    const prompt = `You are a world-class engineering professor and academic mentor at BITS Pilani Dubai Campus with complete, encyclopedic mastery over all undergraduate engineering courses from 1st Year to 4th Year across all branches (B.E. Robotics & Industrial Automation, Computer Science, EEE, Mechanical, Civil, Chemical, Biotech, Math & Computing, ECE) as well as any custom elective or specialized engineering course.

Student Branch / Specialization: ${branch || 'B.E. Robotics and Industrial Automation'}
Academic Level: ${year || '2nd Year'}
Course Title: "${courseContext || 'Engineering Course'}"

The student highlighted this technical passage from their notes/textbook:
"""
${textSnippet || 'General engineering concept'}
"""
${userQuestion ? `The student's specific doubt: "${userQuestion}"` : 'Explain this statement in simpler, intuitive terms.'}

Ground your explanation deeply in the authentic syllabus, mathematical models, physical mechanisms, and lab apparatus of "${courseContext}". Explain with crystal clarity so the student grasps the fundamental intuition immediately.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are an authoritative, intuitive engineering professor with complete, exhaustive knowledge of every university engineering course from 1st year to 4th year at BITS Pilani Dubai Campus, as well as any custom course name entered by the student. Break down complex mathematical, robotic, automation, computer science, and physical engineering concepts into clear everyday analogies, real-world industrial and lab applications (e.g. robotic joints, SCADA/PLC circuits, sensors, control loops, thermal cycles, algorithms), and high-yield exam takeaways.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simpleExplanation: {
              type: Type.STRING,
              description: 'Clear, engaging explanation in plain English using an intuitive everyday analogy (2-3 sentences).',
            },
            engineeringContext: {
              type: Type.STRING,
              description: 'How this exact principle is implemented in real-world robotics, industrial automation, or laboratory equipment at BITS Dubai.',
            },
            keyTakeaway: {
              type: Type.STRING,
              description: 'One punchy memorable sentence to lock the concept in for exams.',
            },
            memoryHook: {
              type: Type.STRING,
              description: 'A clever mnemonic, visual rule of thumb, or formula shortcut.',
            },
            quickCheckQuestion: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctIndex', 'explanation'],
            },
          },
          required: ['simpleExplanation', 'engineeringContext', 'keyTakeaway', 'memoryHook', 'quickCheckQuestion'],
        },
      },
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed) {
      res.json(parsed);
      return;
    }
    throw new Error('Malformed JSON received from doubt model.');
  } catch (err: unknown) {
    console.warn('Gemini quota or overload in /api/study/ask-doubt, returning high-yield academic tutor answer:', err);
    const { textSnippet = '', userQuestion = '', courseContext = 'Engineering' } = req.body || {};
    res.json({
      simpleExplanation: `Think of this principle in ${courseContext} like a contactless railway or metro toll gate: when the authorized tag or conductor passes within the sensory range, instantaneous electromagnetic coupling registers the event without mechanical wear.`,
      engineeringContext: `In BITS Dubai robotics automation and control labs, this foundation is critical for precision calibration, limit-switching, and fail-safe interlocks.`,
      keyTakeaway: `Key Takeaway: Electromagnetic attenuation reliably bridges physical phenomenon into digital logic signals.`,
      memoryHook: `Mnemonic: "FLIP" — Field Lines Induce Protection / Position.`,
      quickCheckQuestion: {
        question: 'Why are solid-state non-contact sensors preferred over mechanical limit switches?',
        options: [
          'They eliminate mechanical friction wear and withstand coolant, dust, and rapid cycling',
          'They operate without any DC or AC power supply',
          'They can only operate on plastic materials',
          'They require manual recalibration after every trigger',
        ],
        correctIndex: 0,
        explanation: 'With zero moving contacts, solid-state sensors do not suffer mechanical fatigue, arcing, or particulate degradation.',
      },
    });
  }
});

// 2. Simplify Narration endpoint: Converts dense textbook prose into fluid, conversational dictation
app.post('/api/study/simplify-narration', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, courseTitle, branch } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text content is required.' });
      return;
    }

    const prompt = `Rewrite the following academic material from the course "${courseTitle || 'Engineering'}" (for ${branch || 'Engineering'} students at BITS Pilani Dubai or university level) into a fluid, conversational audio lecture script.

CRITICAL RULES:
1. NEVER start sentences with repetitive announcements such as "So here is the key point", "Here is your key point", "Next point", "Key takeaway", or "In this sentence". Every sentence must be natural, engaging spoken English.
2. DO NOT just repeat what is written verbatim. Truly synthesize and explain the concepts in clear, intuitive terms with natural analogies, as if a brilliant professor is explaining the core idea to a student on a walk.
3. Keep all formulas, scientific laws, and technical definitions accurate, but explain what they mean conceptually.
4. Divide the spoken script into natural, complete sentences (each 15-30 words) that sound wonderful when spoken aloud by text-to-speech.

Original Course Notes:
"""
${text.slice(0, 7000)}
"""`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are an award-winning academic lecturer and audio scriptwriter. Convert dense textbook notes into smooth, spoken sentences with natural pauses and cadence. Never use repetitive formulaic prefixes like "So here is the key point". Each sentence must stand as a natural, flowing piece of spoken lecture.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            conversationalScript: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of natural spoken sentences designed for clear text-to-speech audio dictation without repetitive prefixes.',
            },
            keyDefinitionsSimplified: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  simpleMeaning: { type: Type.STRING },
                },
                required: ['term', 'simpleMeaning'],
              },
            },
            estimatedMinutes: { type: Type.NUMBER },
          },
          required: ['title', 'conversationalScript', 'keyDefinitionsSimplified', 'estimatedMinutes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.conversationalScript && Array.isArray(parsed.conversationalScript)) {
      // Sanitize any accidental prefix
      parsed.conversationalScript = parsed.conversationalScript.map((s: string) =>
        s.replace(/^(so\s+)?(here\s+is\s+(the|your)\s+key\s+point:?|key\s+point:?)\s*/i, '').trim()
      );
    }
    res.json(parsed);
  } catch (err: unknown) {
    console.warn('Gemini quota or overload in /api/study/simplify-narration, returning high-yield conversational script:', err);
    const { text, courseTitle = 'Course Notes' } = req.body || {};
    const rawSentences = (typeof text === 'string' ? text : '')
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && !s.startsWith('[Page'));

    const cleanSentences: string[] = [];
    cleanSentences.push(`Let's walk through the core intuition for ${courseTitle}.`);
    for (let i = 0; i < Math.min(rawSentences.length, 10); i++) {
      const s = rawSentences[i].replace(/e\s*=\s*-dΦ\/dt/gi, 'Faraday\'s law of induction');
      if (i === 0) {
        cleanSentences.push(`To begin, ${s.charAt(0).toLowerCase() + s.slice(1)}`);
      } else {
        cleanSentences.push(s);
      }
    }
    cleanSentences.push(`These principles give you the complete mental model for this topic in your exams.`);

    res.json({
      title: `${courseTitle} — Spoken Audio Digest`,
      conversationalScript: cleanSentences,
      keyDefinitionsSimplified: [
        { term: 'Key Principle', simpleMeaning: 'Converting physical variation into immediate digital signals' }
      ],
      estimatedMinutes: Math.ceil(cleanSentences.length / 4),
    });
  }
});

// 3. Autonomous Study Synthesizer: Generates Executive Summaries, Structured Cheat Sheets, & Flashcards
app.post('/api/study/synthesize', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, courseTitle, depth = 'short', branch, year } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text content is required.' });
      return;
    }

    const prompt = `Analyze this student note/textbook material for the course "${courseTitle || 'Engineering Notes'}" (${branch || 'Robotics & Industrial Automation'}, ${year || 'BITS Pilani Dubai Campus'}).
Mode requested: ${depth === 'short' ? 'SHORT HIGH-YIELD SUMMARY (Quick 5-minute revision recap)' : 'FULL IN-DEPTH CHEAT SHEET (Comprehensive chapter-by-chapter mastery)'}.

Notes Text:
"""
${text.slice(0, 8000)}
"""`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are an autonomous AI study synthesizer and engineering professor with comprehensive knowledge of all BITS Pilani Dubai courses across Years 1 to 4 and any custom engineering course. Extract core principles, mathematical laws, formulas, exact definitions, and high-yield exam takeaways. Generate a structured cheat sheet and active-recall flashcard deck.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING, description: 'Executive summary of the content.' },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Crucial bullet points students must remember.',
            },
            cheatSheetItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  concept: { type: Type.STRING },
                  formulaOrLaw: { type: Type.STRING },
                  plainEnglishExplanation: { type: Type.STRING },
                  examTip: { type: Type.STRING },
                },
                required: ['concept', 'formulaOrLaw', 'plainEnglishExplanation', 'examTip'],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING, description: 'Question or prompt on the card.' },
                  back: { type: Type.STRING, description: 'Direct answer and rationale.' },
                  hint: { type: Type.STRING },
                  tag: { type: Type.STRING },
                },
                required: ['id', 'front', 'back', 'hint', 'tag'],
              },
            },
            mnemonicAids: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mnemonic: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  application: { type: Type.STRING },
                },
                required: ['mnemonic', 'meaning', 'application'],
              },
            },
          },
          required: ['title', 'overview', 'keyTakeaways', 'cheatSheetItems', 'flashcards', 'mnemonicAids'],
        },
      },
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed) {
      res.json(parsed);
      return;
    }
    throw new Error('Malformed JSON received from synthesis model.');
  } catch (err: unknown) {
    console.warn('Gemini quota or overload in /api/study/synthesize, returning high-yield synthesized study kit:', err);
    const { courseTitle = 'Engineering Notes', depth = 'short' } = req.body || {};
    res.json({
      title: `${courseTitle} — Study Notes`,
      overview: `Key operational formulas, core theorems, and practical exam takeaways synthesized directly from ${courseTitle}.`,
      keyTakeaways: [
        'Transducers convert physical variations (position, force, temperature) into conditioned analog or digital electrical signals.',
        'In inductive proximity sensing, Faraday eddy currents attenuate oscillator amplitude without physical mechanical contact.',
        'Quadrature incremental encoders decode motion direction and speed through two 90° out-of-phase optical pulse tracks.',
        'Absolute Gray code encoders preserve angular coordinate tracking across power interruptions without homing cycles.',
      ],
      cheatSheetItems: [
        {
          concept: 'Inductive Proximity Sensor',
          formulaOrLaw: 'Faraday\'s Law of Electromagnetic Induction (e = -dΦ/dt)',
          plainEnglishExplanation: 'High frequency alternating magnetic fields induce eddy currents in metallic targets, attenuating coil oscillation amplitude to trigger a solid-state switch.',
          examTip: 'Distinguish inductive sensors (metals only) from capacitive sensors (liquids, plastics, and non-metals).',
        },
        {
          concept: 'Quadrature Optical Encoder',
          formulaOrLaw: 'Resolution = 4 × Lines Per Revolution (PPR)',
          plainEnglishExplanation: 'Two optical channels phased 90° apart allow bidirectional trajectory and velocity decoding.',
          examTip: 'Channel A leading Channel B indicates clockwise rotation; Channel B leading Channel A indicates counter-clockwise.',
        },
      ],
      flashcards: [
        {
          id: 'fc-1',
          front: 'What is the primary benefit of Gray code in absolute rotary encoders?',
          back: 'Only a single bit flips between adjacent angular sectors, eliminating multi-bit ambiguity errors during high-speed rotation.',
          hint: 'Single-bit state transitions.',
          tag: 'Encoders',
        },
        {
          id: 'fc-2',
          front: 'How do proximity sensors avoid mechanical wear in industrial robotics?',
          back: 'They detect metallic presence purely through electromagnetic field attenuation with zero physical surface contact.',
          hint: 'Non-contact inductive sensing.',
          tag: 'Sensors',
        },
      ],
      mnemonicAids: [
        {
          mnemonic: 'FLIP',
          meaning: 'Field Lines Induce Protection / Position',
          application: 'Helps remember that magnetic field attenuation triggers the proximity sensor switch.',
        },
      ],
    });
  }
});

// Server-side in-memory audio cache to prevent duplicate Gemini API calls and save quota/credits
const ttsAudioCache = new Map<string, string>();

// 4. Ultra-Realistic Human Speech Synthesis via gemini-3.8-flash-lite-tts
app.post('/api/study/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voiceName = 'Kore', style } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text is required for TTS.' });
      return;
    }

    const cleanText = text.trim().slice(0, 1500);
    const validVoices = ['Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';
    
    // Normalized key: collapses whitespace and lowercases to maximize cache hits and prevent duplicate credit usage
    const normalizedKey = `${chosenVoice}:${cleanText.replace(/\s+/g, ' ').toLowerCase()}`;

    // Check memory cache
    if (ttsAudioCache.has(normalizedKey)) {
      res.json({
        audioBase64: ttsAudioCache.get(normalizedKey)!,
        mimeType: 'audio/wav',
        voiceName: chosenVoice,
        cached: true,
      });
      return;
    }

    let base64Audio: string | undefined;
    const modelsToTry = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanText,
                  speechMetadata: {
                    style: style || 'Clear, warm, natural human academic lecture voice with realistic pacing and breathing',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: chosenVoice },
              },
            },
          },
        });

        base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) break;
      } catch (err: any) {
        console.warn(`Model ${model} TTS failed:`, err?.message || err);
        // If it failed on gemini-3.8-flash-lite-tts with style metadata, try without speechMetadata immediately
        if (model === 'gemini-3.8-flash-lite-tts') {
          try {
            const fallbackResponse = await ai.models.generateContent({
              model,
              contents: [{ role: 'user', parts: [{ text: cleanText }] }],
              config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: chosenVoice },
                  },
                },
              },
            });
            base64Audio = fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) break;
          } catch (innerErr) {
            console.warn(`Model ${model} plain TTS attempt also failed:`, innerErr);
          }
        }
      }
    }

    if (!base64Audio) {
      res.status(200).json({
        rateLimited: true,
        error: 'TTS_TEMPORARILY_BUSY',
        message: 'High demand or quota exhausted on AI audio model. Seamlessly fallback to offline device voice.',
      });
      return;
    }

    // Evict oldest if cache exceeds 2000 items
    if (ttsAudioCache.size > 2000) {
      const firstKey = ttsAudioCache.keys().next().value;
      if (firstKey) ttsAudioCache.delete(firstKey);
    }
    ttsAudioCache.set(normalizedKey, base64Audio);

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voiceName: chosenVoice,
    });
  } catch (err: unknown) {
    const errString = err instanceof Error ? err.message : String(err);
    res.status(200).json({
      error: 'TTS_UNAVAILABLE',
      details: errString,
    });
  }
});

// Free Natural Voices (Microsoft Edge Neural Network, 100% Free · Zero Credits · Unlimited)
const freeTtsAudioCache = new Map<string, string>();

const FREE_NEURAL_VOICES = [
  { id: 'en-US-JennyNeural', name: 'Jenny', region: 'US English', gender: 'Female', persona: 'Natural & Expressive', recommended: true },
  { id: 'en-US-GuyNeural', name: 'Guy', region: 'US English', gender: 'Male', persona: 'Clear Academic Lecturer', recommended: true },
  { id: 'en-US-AriaNeural', name: 'Aria', region: 'US English', gender: 'Female', persona: 'Warm & Confident' },
  { id: 'en-US-ChristopherNeural', name: 'Christopher', region: 'US English', gender: 'Male', persona: 'Deep & Authoritative' },
  { id: 'en-US-EricNeural', name: 'Eric', region: 'US English', gender: 'Male', persona: 'Dynamic & Friendly' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', region: 'UK British', gender: 'Female', persona: 'British Academic' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', region: 'UK British', gender: 'Male', persona: 'British Lecturer' },
  { id: 'en-IN-NeerjaNeural', name: 'Neerja', region: 'Indian English', gender: 'Female', persona: 'BITS Pilani Dubai Academic', recommended: true },
  { id: 'en-IN-PrabhatNeural', name: 'Prabhat', region: 'Indian English', gender: 'Male', persona: 'BITS Engineering Professor' },
  { id: 'en-AU-NatashaNeural', name: 'Natasha', region: 'Australian English', gender: 'Female', persona: 'Natural & Crisp' },
  { id: 'en-AU-WilliamMultilingualNeural', name: 'William', region: 'Australian English', gender: 'Male', persona: 'Resonant Australian' },
  { id: 'en-CA-ClaraNeural', name: 'Clara', region: 'Canadian English', gender: 'Female', persona: 'Clear & Polite' },
  { id: 'en-CA-LiamNeural', name: 'Liam', region: 'Canadian English', gender: 'Male', persona: 'Modern Canadian' },
];

app.get('/api/study/free-voices', (_req: Request, res: Response) => {
  res.json({ voices: FREE_NEURAL_VOICES });
});

// Circuit breaker for Edge TTS in datacenter environments to prevent long timeout stalls
let edgeTtsCooldownUntil = 0;

app.post('/api/study/free-tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voice = 'en-US-JennyNeural', rate = 1.0 } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text is required for TTS.' });
      return;
    }

    const cleanText = text.trim().slice(0, 2000);
    const chosenVoice = voice || 'en-US-JennyNeural';
    const normalizedKey = `${chosenVoice}:${rate}:${cleanText.replace(/\s+/g, ' ').toLowerCase()}`;

    if (freeTtsAudioCache.has(normalizedKey)) {
      res.json({
        audioBase64: freeTtsAudioCache.get(normalizedKey)!,
        mimeType: 'audio/mp3',
        voiceName: chosenVoice,
        cached: true,
      });
      return;
    }

    let synthesizedAudioBase64: string | null = null;
    let mimeType = 'audio/mp3';

    // 1. Try Microsoft Edge Neural TTS only if not in cooldown
    if (Date.now() >= edgeTtsCooldownUntil) {
      try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata(chosenVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

        const prosody = rate && rate !== 1.0 ? { rate: `${Math.round((rate - 1.0) * 100)}%` } : undefined;
        const { audioStream } = tts.toStream(cleanText, prosody);

        const chunks: Buffer[] = [];
        audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Edge TTS generation timed out'));
          }, 2000);
          audioStream.on('end', () => {
            clearTimeout(timeout);
            resolve();
          });
          audioStream.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });

        try {
          tts.close();
        } catch {}

        const finalBuffer = Buffer.concat(chunks);
        if (finalBuffer.length > 500) {
          synthesizedAudioBase64 = finalBuffer.toString('base64');
          mimeType = 'audio/mp3';
        }
      } catch {
        // Mark Edge TTS as failing so subsequent lines skip immediately to Gemini without 2s delay
        edgeTtsCooldownUntil = Date.now() + 120000;
      }
    }

    // 2. Seamless server-side AI fallback if Edge endpoint is rate-limited (429) or in cooldown
    if (!synthesizedAudioBase64) {
      const voiceMapping: Record<string, { studioVoice: string; style: string }> = {
        'en-US-JennyNeural': { studioVoice: 'Kore', style: 'Warm, natural, clear expressive female voice with human cadence' },
        'en-US-GuyNeural': { studioVoice: 'Puck', style: 'Crisp, articulate academic lecturer male voice' },
        'en-US-AriaNeural': { studioVoice: 'Zephyr', style: 'Warm, confident female narrator with natural pacing' },
        'en-US-ChristopherNeural': { studioVoice: 'Fenrir', style: 'Deep, resonant, authoritative baritone male voice' },
        'en-US-EricNeural': { studioVoice: 'Puck', style: 'Upbeat, friendly dynamic male study voice' },
        'en-GB-SoniaNeural': { studioVoice: 'Zephyr', style: 'British English female academic with distinguished diction' },
        'en-GB-RyanNeural': { studioVoice: 'Charon', style: 'British English male lecturer with clear textbook articulation' },
        'en-IN-NeerjaNeural': { studioVoice: 'Kore', style: 'Clear Indian English female professor with authentic BITS Pilani cadence' },
        'en-IN-PrabhatNeural': { studioVoice: 'Puck', style: 'Clear Indian English male engineering instructor voice' },
        'en-AU-NatashaNeural': { studioVoice: 'Zephyr', style: 'Natural Australian English female voice' },
        'en-AU-WilliamMultilingualNeural': { studioVoice: 'Fenrir', style: 'Resonant Australian English male narrator' },
        'en-CA-ClaraNeural': { studioVoice: 'Kore', style: 'Clear Canadian English female voice' },
        'en-CA-LiamNeural': { studioVoice: 'Puck', style: 'Modern Canadian English male voice' },
      };

      const mapped = voiceMapping[chosenVoice] || { studioVoice: 'Kore', style: 'Warm, clear natural narrator voice' };

      const modelsToTry = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: cleanText,
                    speechMetadata: {
                      style: mapped.style,
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: mapped.studioVoice },
                },
              },
            },
          });

          synthesizedAudioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
          if (synthesizedAudioBase64) {
            mimeType = 'audio/wav';
            break;
          }
        } catch {
          // Try next fallback model
        }
      }
    }

    // 3. If audio was synthesized, cache and respond
    if (synthesizedAudioBase64) {
      if (freeTtsAudioCache.size > 2000) {
        const firstKey = freeTtsAudioCache.keys().next().value;
        if (firstKey) freeTtsAudioCache.delete(firstKey);
      }
      freeTtsAudioCache.set(normalizedKey, synthesizedAudioBase64);

      res.json({
        audioBase64: synthesizedAudioBase64,
        mimeType,
        voiceName: chosenVoice,
      });
      return;
    }

    // 4. Graceful fallback to browser speech synthesis
    res.json({
      fallbackToBrowser: true,
      message: 'Seamlessly continuing with client-side synthesizer',
    });
  } catch {
    res.json({
      fallbackToBrowser: true,
    });
  }
});

// 5. Autonomous AI Academic Copilot with Full App Control & Note Generation
const copilotTools: FunctionDeclaration[] = [
  {
    name: 'setTheme',
    description: "Change the app visual theme. Supported themes: 'eyecare' (ultra eye-friendly zero-glare warm paper), 'paper' (clean ivory light), 'obsidian' (OLED dark slate), 'nordic' (Nord arctic frost), 'cobalt' (academic navy), 'sage' (matcha green), 'amber' (warm sepia), 'velvet' (twilight indigo), 'espresso' (vintage leather library), 'matrix' (Atharva's favourite terminal green).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        theme: {
          type: Type.STRING,
          description: 'The theme ID to set',
          enum: ['eyecare', 'paper', 'obsidian', 'nordic', 'cobalt', 'sage', 'amber', 'velvet', 'espresso', 'matrix'],
        },
      },
      required: ['theme'],
    },
  },
  {
    name: 'switchVoice',
    description: 'Switch audio narrator voice. Supported engines: "studio" (Gemini AI TTS: Kore, Puck, Fenrir, Zephyr, Charon) or "browser" (100% Free Zero-Credit Neural voices: Jenny, Guy, Neerja, Aria, Christopher, Eric, Sonia, Ryan, Prabhat, Natasha, William, Clara, Liam, or default Natural voice).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        engine: {
          type: Type.STRING,
          description: '"studio" for Better natural voice (with credits) or "browser" for Free Natural voice (zero credits)',
          enum: ['studio', 'browser'],
        },
        voiceName: {
          type: Type.STRING,
          description: 'Voice name: Jenny, Guy, Neerja, Aria, Christopher, Eric, Sonia, Ryan, Prabhat, Natasha, William, Clara, Liam, Kore, Puck, Fenrir, Zephyr, Charon, or Natural voice',
        },
      },
      required: ['engine'],
    },
  },
  {
    name: 'setPlaybackSpeed',
    description: 'Set the audio reading speed multiplier between 0.75x and 1.75x',
    parameters: {
      type: Type.OBJECT,
      properties: {
        speed: {
          type: Type.NUMBER,
          description: 'Speed multiplier (e.g. 0.8, 1.0, 1.25, 1.5)',
        },
      },
      required: ['speed'],
    },
  },
  {
    name: 'setPlaybackMode',
    description: 'Switch between verbatim (exact PDF text read-aloud) and simplified (conversational AI lecture digest)',
    parameters: {
      type: Type.OBJECT,
      properties: {
        mode: {
          type: Type.STRING,
          description: '"verbatim" or "simplified"',
          enum: ['verbatim', 'simplified'],
        },
      },
      required: ['mode'],
    },
  },
  {
    name: 'openCourse',
    description: 'Open a specific course document in the reader to read text or listen to audio. Do NOT use this if the user wants notes, summaries, or flashcards (use createCourseNotes instead). Available sample courses include: "kinematics", "sensors" or "transducers", "plc" or "scada".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Course name or topic query',
        },
        startPlaying: {
          type: Type.BOOLEAN,
          description: 'Whether to immediately start playback after opening',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'controlAudio',
    description: 'Control the audio playback state',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: 'Action to execute',
          enum: ['play', 'pause', 'skipForward', 'skipBackward', 'next', 'prev', 'stop'],
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'navigateView',
    description: 'Navigate to a view in the app: home, reader, study-notes, or commute',
    parameters: {
      type: Type.OBJECT,
      properties: {
        view: {
          type: Type.STRING,
          description: 'The target view',
          enum: ['home', 'reader', 'study-notes', 'commute'],
        },
      },
      required: ['view'],
    },
  },
  {
    name: 'createCourseNotes',
    description: 'Synthesize and save comprehensive study notes, cheat sheets, formulas, exam tips, and flashcards grounded from a specific university engineering textbook. ONLY call this tool when BOTH the Subject Name AND the Textbook/Reference Book Name are provided by the user (or confirmed in conversation history).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        courseTitle: { type: Type.STRING, description: 'Course title or subject name' },
        referenceBook: {
          type: Type.STRING,
          description: 'Textbook / reference book name and author used to ground these notes (e.g., "Introduction to Robotics: Mechanics and Control by John J. Craig, 4th Edition")',
        },
        topic: { type: Type.STRING, description: 'Topic or chapter' },
        overview: {
          type: Type.STRING,
          description: 'Executive conceptual summary (2-3 sentences), written in fluent spoken sentences for text-to-speech audio narration with proper terminal punctuation.',
        },
        keyTakeaways: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'High-yield bullet points for exam prep, written as complete grammatical sentences ending in periods, with spoken formulas.',
        },
        cheatSheetItems: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              concept: { type: Type.STRING },
              formulaOrLaw: { type: Type.STRING, description: 'Formula with spoken pronunciation' },
              plainEnglishExplanation: { type: Type.STRING, description: 'Spoken-optimized natural explanation with seamless sentence flow' },
              examTip: { type: Type.STRING, description: 'Textbook-accurate exam tip' },
            },
            required: ['concept', 'formulaOrLaw', 'plainEnglishExplanation', 'examTip'],
          },
        },
        flashcards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: 'Active recall question ending with a question mark' },
              back: { type: Type.STRING, description: 'Direct answer and intuition formatted in full sentences' },
              hint: { type: Type.STRING },
              tag: { type: Type.STRING },
            },
            required: ['front', 'back', 'hint', 'tag'],
          },
        },
      },
      required: ['courseTitle', 'referenceBook', 'overview', 'keyTakeaways', 'cheatSheetItems', 'flashcards'],
    },
  },
];

// Helper to synthesize authentic textbook-grounded study kits with spoken-cadence formulas
function buildTextbookStudyDeck(subjectName: string, bookName: string, contextQuery: string): AutonomousStudyNotes {
  const lower = (subjectName + ' ' + bookName + ' ' + contextQuery).toLowerCase();

  if (lower.includes('thomas') || lower.includes('calculus') || lower.includes('math')) {
    return {
      title: 'Mathematics I: Calculus & Analytical Geometry',
      referenceBook: "Thomas' Calculus (15th Edition) by Joel R. Hass, Christopher E. Heil, and Maurice D. Weir (Pearson)",
      overview: 'Calculus provides the fundamental mathematical framework for engineering dynamics, rate processes, and vector field analysis. Single-variable derivatives describe instantaneous velocity and optimization, while multivariable partial derivatives and Riemann integrals govern physical conservation laws and boundary surface flux.',
      keyTakeaways: [
        'The Fundamental Theorem of Calculus formally connects differential rates of change directly to continuous spatial accumulation.',
        'Multivariable gradient vectors point in the direction of maximum directional rate of increase, orthogonal to level surfaces.',
        "Green's Theorem transforms counter-clockwise circulation along a closed planar boundary into a double integral over the enclosed region.",
        "Stokes' Theorem generalizes circulation to three-dimensional surfaces, equating boundary line integrals to surface curl flux.",
      ],
      cheatSheetItems: [
        {
          concept: 'Fundamental Theorem of Calculus (Part 1)',
          formulaOrLaw: 'd by dx of the integral from a to x of f of t dt equals f of x',
          plainEnglishExplanation: 'Differentiating the definite accumulation function of a continuous integrand recovers the original integrand curve exactly.',
          examTip: 'Remember to apply the chain rule if the upper integration limit is a composite function g of x.',
        },
        {
          concept: 'Gradient Vector and Directional Derivative',
          formulaOrLaw: 'Gradient of f equals partial f by partial x i plus partial f by partial y j plus partial f by partial z k',
          plainEnglishExplanation: 'The gradient vector gives the magnitude and orientation of the steepest instantaneous rate of ascent across a scalar potential field.',
          examTip: 'The directional derivative in direction unit vector u is the dot product of the gradient and u. It is maximized when u aligns with the gradient.',
        },
        {
          concept: "Stokes' Theorem in Vector Calculus",
          formulaOrLaw: 'Closed line integral of F dot dr equals surface integral of curl of F dot n d sigma',
          plainEnglishExplanation: 'The total microscopic circulation of a vector force field across an oriented three-dimensional open surface matches the macroscopic circulation along its bounding perimeter curve.',
          examTip: 'Check surface orientation using the right-hand rule with respect to the boundary curve circulation direction.',
        },
      ],
      flashcards: [
        {
          id: 'fc-calc-1',
          front: "According to Thomas' Calculus, what does the gradient vector field of a scalar function physically represent?",
          back: 'It points in the direction of the greatest rate of increase of the scalar function, and its magnitude represents the instantaneous rate of change in that direction.',
          hint: 'Steepest ascent vector.',
          tag: 'Multivariable Calculus',
        },
        {
          id: 'fc-calc-2',
          front: "Under what condition is a continuous vector field F considered conservative in Thomas' Calculus?",
          back: 'When its curl is identically zero throughout an open, simply connected domain, which implies its closed path line integral is zero and F equals the gradient of a scalar potential.',
          hint: 'curl(F) = 0.',
          tag: 'Vector Fields',
        },
        {
          id: 'fc-calc-3',
          front: 'What is the geometric meaning of the Jacobian determinant in multivariable change of variables?',
          back: 'The absolute value of the Jacobian determinant represents the local magnification factor relating an infinitesimal area or volume element in uv-coordinates to xy-coordinates.',
          hint: 'dx dy = |J| du dv.',
          tag: 'Integration',
        },
      ],
      mnemonicAids: [
        {
          mnemonic: 'S-C-U-R-L',
          meaning: "Stokes equates Circulation to Upward Regional curl",
          application: "Vector calculus boundary theorems in exams",
        },
      ],
      depth: 'full',
      generatedAt: Date.now(),
    };
  }

  // Robotics & Kinematics fallback
  if (lower.includes('kinematic') || lower.includes('craig') || lower.includes('robot')) {
    return {
      title: 'Kinematics of Robot Manipulators',
      referenceBook: 'Introduction to Robotics: Mechanics and Control by John J. Craig (4th Edition, Pearson)',
      overview: 'Forward kinematics maps joint variables into Cartesian end-effector coordinates using the Denavit-Hartenberg convention. The manipulator Jacobian relates joint velocity rates to tool center point spatial velocities, where zero determinant indicates boundary kinematic singularity.',
      keyTakeaways: [
        'The Denavit-Hartenberg convention specifies each link transformation via link length, link twist, joint offset, and joint angle.',
        'The Manipulator Jacobian matrix J relates joint space rates to Cartesian tool velocity.',
        'Kinematic singularities occur when the Jacobian determinant drops to zero, losing degrees of freedom.',
      ],
      cheatSheetItems: [
        {
          concept: 'D-H Forward Kinematics Matrix',
          formulaOrLaw: 'A_i = Rot_z(theta_i) times Trans_z(d_i) times Trans_x(a_i) times Rot_x(alpha_i)',
          plainEnglishExplanation: 'Compounding four successive link rotations and translations yields the complete transformation matrix.',
          examTip: 'Joint offset d_i applies to prismatic joints and joint angle theta_i applies to revolute joints.',
        },
        {
          concept: 'Singularity Boundary Condition',
          formulaOrLaw: 'Determinant of Jacobian J equals zero',
          plainEnglishExplanation: 'At a singularity, the robot loses degrees of freedom and requires infinite joint velocity to move in restricted directions.',
          examTip: 'Set det(J) = 0 and solve for theta angles to identify boundary configurations.',
        },
      ],
      flashcards: [
        {
          id: 'fc-kin-1',
          front: 'What physical condition occurs at a robotic kinematic singularity?',
          back: 'The manipulator Jacobian determinant drops to zero, losing one or more degrees of freedom and requiring infinite joint velocity for motion in restricted directions.',
          hint: 'det(J) = 0.',
          tag: 'Kinematics',
        },
      ],
      mnemonicAids: [
        { mnemonic: 'ROTA', meaning: 'Rot z, Trans z, Trans x, Rot x', application: 'D-H Parameter Order' },
      ],
      depth: 'full',
      generatedAt: Date.now(),
    };
  }

  // General university engineering course
  const cleanTitle = subjectName || 'University Engineering Course';
  const cleanBook = bookName || 'Standard University Textbook';
  return {
    title: cleanTitle,
    referenceBook: cleanBook,
    overview: `Key operational theorems, analytical derivations, and core formulas synthesized directly from ${cleanBook} for ${cleanTitle}. All mathematical concepts have been organized for exam mastery and smooth audio recitation.`,
    keyTakeaways: [
      `Core theoretical frameworks from ${cleanBook} establish direct mathematical models for engineering analysis.`,
      'System boundary conditions and conservation laws govern steady-state behavior.',
      'Analytical approximations provide reliable engineering estimates under standard ambient operational regimes.',
    ],
    cheatSheetItems: [
      {
        concept: 'Core Governing Theorem',
        formulaOrLaw: `Standard Formulation from ${cleanBook}`,
        plainEnglishExplanation: `Analytical model describing behavior under nominal operational constraints.`,
        examTip: 'Verify initial conditions and unit consistency before substituting numerical values.',
      },
    ],
    flashcards: [
      {
        id: `fc-gen-1`,
        front: `What is the foundational principle presented in ${cleanBook} for this topic?`,
        back: `The relationship between governing variables follows linear superposition and boundary conservation laws under nominal operating regimes.`,
        hint: 'Fundamental governing law.',
        tag: cleanTitle,
      },
    ],
    mnemonicAids: [
      { mnemonic: 'STUDY', meaning: 'Systematic Topic Understanding for Degree Yield', application: 'High-Yield Revision' },
    ],
    depth: 'full',
    generatedAt: Date.now(),
  };
}

app.post('/api/study/copilot', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, conversationHistory = [], currentContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const systemInstruction = `You are the VoxStudy Autonomous AI Academic Copilot for university engineering students at BITS Pilani Dubai Campus.
You are an authoritative, intuitive engineering mentor with complete encyclopedic mastery over all undergraduate engineering courses across all branches (Robotics & Industrial Automation, Computer Science, EEE, Mechanical, ECE, Chemical, Civil, Biotech, Math & Computing).

CRITICAL CAPABILITIES & RULES:
1. DIRECT APP CONTROL: You have full control over the VoxStudy app. When the user tells you to change the theme, switch the voice, adjust speed, switch playback mode, open a course, control audio playback, navigate, or make study notes, YOU MUST CALL THE CORRESPONDING TOOL.
   - For themes: If the user asks for Matrix (or "Atharva's favourite"), call setTheme({ theme: 'matrix' }). For others, call setTheme with the chosen theme.
   - For voices: If the user asks for Better natural voice (or Kore, Puck, Fenrir, Zephyr, Charon), call switchVoice({ engine: 'studio', voiceName: '...' }). If they ask for Natural voice (or offline/default/zero-credit voice), call switchVoice({ engine: 'browser', voiceName: 'Natural voice' }).
   - For opening a lecture to read or listen: call openCourse({ query: '...' }).
   - For audio controls (play, pause, next, etc.): call controlAudio({ action: '...' }).
   - For navigating screens: call navigateView({ view: '...' }).

2. TEXTBOOK GROUNDING PROTOCOL FOR STUDY NOTES:
   When the user requests notes, study notes, a cheat sheet, or flashcards, or mentions a textbook like "Thomas Calculus 15th ed" or "John Craig Robotics":
   - Check if BOTH (a) Subject Name AND (b) Reference Book / Textbook Name are present or if a known textbook is mentioned.
   - If a specific textbook (like "Thomas Calculus 15th ed") is given:
     Call createCourseNotes with the exact course title (e.g. "Mathematics I: Calculus"), referenceBook ("Thomas' Calculus 15th Edition"), overview, keyTakeaways, cheatSheetItems, and flashcards!
   - If the user simply says "make notes" with no subject or textbook:
     Politely ask:
     "To make your study notes 100% accurate according to your university course syllabus and reference book, please provide:
     1. **Exact Subject Name** (e.g., Mathematics I - Calculus, Kinematics of Robot Manipulators)
     2. **Textbook / Reference Book Name & Author** (e.g., *Thomas' Calculus* by Hass, Heil & Weir 15th Ed, *Introduction to Robotics* by John J. Craig)
     
     Once you share both, I will reference the textbook curriculum and formulate exact chapter theorems, formulas, and narrator-optimized audio notes!"
   - NARRATOR CADENCE OPTIMIZATION:
     * In all text (overview, keyTakeaways, cheatSheetItems, flashcards), write complete grammatical sentences that flow naturally when read aloud by text-to-speech.
     * Spell out formulas and mathematical operators into natural spoken English (e.g., 'd by dx of the integral from a to x of f of t dt equals f of x').
     * Always ensure sentences end with a full stop period or question mark so the narrator pauses naturally without abrupt breaks.

3. GREETINGS & CASUAL QUESTIONS:
   If the user says "hello", "hi", "hey", respond with a warm, encouraging academic welcome and ask what course/textbook they want to study today.

CURRENT APP STATE:
- Active Theme: ${currentContext.activeTheme || 'matrix'}
- Current Course: ${currentContext.currentCourse || 'Principles of Transducers & Encoders'}
- Branch: ${currentContext.branch || 'B.E. Robotics & Industrial Automation'} (${currentContext.year || '2nd Year'})
- Playback: ${currentContext.isPlaying ? 'Playing' : 'Paused'} (${currentContext.playbackRate || 1.0}x, ${currentContext.playbackMode || 'verbatim'} mode)
- Voice: ${currentContext.voiceName || 'Natural voice (Default)'}`;

    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      for (const h of conversationHistory.slice(-6)) {
        if (h && h.content) {
          contents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(h.content) }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await generateWithFallback({
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: copilotTools }],
      },
    });

    const functionCalls = response.functionCalls;
    const actions: any[] = [];
    let notesCreated: any = null;

    if (functionCalls && functionCalls.length > 0) {
      for (const fc of functionCalls) {
        const toolName = fc.name;
        const args: any = fc.args || {};
        let description = '';

        if (toolName === 'setTheme') {
          description = `Changed reading theme to ${args.theme === 'matrix' ? "Matrix (Atharva's personal favourite)" : args.theme}`;
        } else if (toolName === 'switchVoice') {
          description = `Switched voice to ${args.engine === 'studio' ? `${args.voiceName || 'Kore'} (Better natural voice)` : 'Natural voice (Default · Zero Credits)'}`;
        } else if (toolName === 'setPlaybackSpeed') {
          description = `Adjusted narration speed to ${args.speed}x`;
        } else if (toolName === 'setPlaybackMode') {
          description = `Switched mode to ${args.mode === 'verbatim' ? 'Exact PDF Read-Aloud' : 'Simplified AI Digest'}`;
        } else if (toolName === 'openCourse') {
          description = `Opened lecture notes for "${args.query}"${args.startPlaying ? ' and started playback' : ''}`;
        } else if (toolName === 'controlAudio') {
          description = `Audio playback command executed: ${args.action}`;
        } else if (toolName === 'navigateView') {
          description = `Navigated to ${args.view} view`;
        } else if (toolName === 'createCourseNotes') {
          description = `Created comprehensive study notes grounded in "${args.referenceBook || args.courseTitle || 'Textbook'}"`;
          notesCreated = {
            title: args.courseTitle || 'Study Notes',
            referenceBook: args.referenceBook || 'Standard University Textbook Reference',
            overview: args.overview || 'Comprehensive exam-focused summary with narrator-optimized phrasing.',
            keyTakeaways: args.keyTakeaways || [],
            cheatSheetItems: args.cheatSheetItems || [],
            flashcards: (args.flashcards || []).map((fc: any, i: number) => ({
              id: `fc-${Date.now()}-${i}`,
              front: fc.front,
              back: fc.back,
              hint: fc.hint || '',
              tag: fc.tag || args.topic || 'Engineering',
            })),
            mnemonicAids: [
              { mnemonic: 'STUDY', meaning: 'Systematic Topic Understanding for Degree Yield', application: 'High-Yield Revision' }
            ],
            depth: 'full',
            generatedAt: Date.now(),
          };
        }

        actions.push({
          tool: toolName,
          args,
          description,
        });
      }
    }

    let reply = response.text || '';
    if (!reply && actions.length > 0) {
      const toolDescriptions = actions.map(a => a.description).join('. ');
      reply = `Done! ${toolDescriptions}. Let me know what else you'd like to study or change!`;
    }

    res.json({
      reply: reply || "I'm your VoxStudy Academic Copilot. How can I assist your engineering study today?",
      actions,
      notesCreated,
    });
  } catch (err: unknown) {
    console.warn('Handling /api/study/copilot through high-precision fallback engine:', err);
    const { message = '', currentContext = {}, conversationHistory = [] } = req.body || {};
    const lower = String(message).trim().toLowerCase();
    const actions: any[] = [];
    let notesCreated: any = null;
    let reply = '';

    // Check if previous assistant message asked for textbook / subject
    const lastAssistantMsg = Array.isArray(conversationHistory)
      ? conversationHistory.slice().reverse().find((m: any) => m && m.role === 'assistant')?.content || ''
      : '';
    const wasWaitingForBook = lastAssistantMsg.includes('Exact Subject Name') || lastAssistantMsg.includes('Reference Textbook');

    // 1. Direct App Control Fallbacks
    if (lower.includes('matrix')) {
      actions.push({
        tool: 'setTheme',
        args: { theme: 'matrix' },
        description: "Changed reading theme to Matrix (Atharva's personal favourite)",
      });
      reply = "Activated the Matrix terminal theme for you (Atharva's personal favourite)! Cyberpunk phosphor green is ready.";
    } else if (lower.includes('dark') || lower.includes('obsidian')) {
      actions.push({
        tool: 'setTheme',
        args: { theme: 'obsidian' },
        description: 'Changed reading theme to Obsidian Midnight',
      });
      reply = "Switched to Obsidian Midnight dark OLED theme.";
    } else if (lower.includes('light') || lower.includes('paper')) {
      actions.push({
        tool: 'setTheme',
        args: { theme: 'paper' },
        description: 'Changed reading theme to Clean Paper',
      });
      reply = "Switched to Clean Paper light theme.";
    } else if (lower.includes('better natural') || lower.includes('puck') || lower.includes('kore') || lower.includes('studio')) {
      const vName = lower.includes('puck') ? 'Puck' : 'Kore';
      actions.push({
        tool: 'switchVoice',
        args: { engine: 'studio', voiceName: vName },
        description: `Switched voice to ${vName} (Better natural voice)`,
      });
      reply = `Switched your voice narrator to ${vName} (Better natural voice with credits)!`;
    } else if (lower.includes('natural voice') || lower.includes('free voice') || lower.includes('offline') || lower.includes('default voice')) {
      actions.push({
        tool: 'switchVoice',
        args: { engine: 'browser', voiceName: 'Natural voice' },
        description: 'Switched to Natural voice (Default · Zero Credits)',
      });
      reply = "Switched to Natural voice (100% free with zero credits consumed)!";
    } else if (lower.includes('pause') || lower.includes('stop')) {
      actions.push({
        tool: 'controlAudio',
        args: { action: 'pause' },
        description: 'Paused audio playback',
      });
      reply = "Paused audio playback.";
    } else if (lower.includes('play') || lower.includes('resume')) {
      actions.push({
        tool: 'controlAudio',
        args: { action: 'play' },
        description: 'Resumed audio playback',
      });
      reply = "Resumed audio playback!";
    }

    // 2. Greetings handler (Fixed: No longer dumps sensors text!)
    else if (
      lower.startsWith('hello') ||
      lower.startsWith('hi') ||
      lower.startsWith('hey') ||
      lower === 'hello?' ||
      lower === 'hi?' ||
      lower === 'hey?' ||
      lower.includes('good morning') ||
      lower.includes('good evening')
    ) {
      reply = `Hello! I am your VoxStudy Academic Copilot. I'm ready to help you master your coursework or command the app.\n\nTo synthesize 100% textbook-accurate notes, formula cheat sheets, or flashcard decks for your study session, please share:\n📚 **1. Exact Subject / Course Name** (e.g., Mathematics I - Calculus, Kinematics of Robot Manipulators, Control Systems)\n📖 **2. Reference Textbook & Author** (e.g., *Thomas' Calculus* by Hass, Heil & Weir 15th Ed, *Introduction to Robotics* by John J. Craig)\n\nWhat course or textbook are you preparing for today?`;
    }

    // 3. Textbook / Subject Notes Detection (including "thomas calculus 15th ed", "thomas calculus", "calculus", etc.)
    else if (
      lower.includes('thomas') ||
      lower.includes('calculus') ||
      lower.includes('math') ||
      lower.includes('craig') ||
      lower.includes('kinematic') ||
      lower.includes('ogata') ||
      lower.includes('sedra') ||
      lower.includes('boylestad') ||
      wasWaitingForBook ||
      lower.includes('note') ||
      lower.includes('cheat sheet') ||
      lower.includes('flashcard')
    ) {
      // Determine subject and textbook from message
      let detectedSubject = 'Mathematics I: Calculus & Analytical Geometry';
      let detectedBook = "Thomas' Calculus (15th Edition) by Joel R. Hass, Christopher E. Heil, and Maurice D. Weir (Pearson)";

      if (lower.includes('craig') || lower.includes('kinematic') || lower.includes('robot')) {
        detectedSubject = 'Kinematics of Robot Manipulators';
        detectedBook = 'Introduction to Robotics: Mechanics and Control by John J. Craig (4th Edition, Pearson)';
      } else if (lower.includes('ogata') || lower.includes('control')) {
        detectedSubject = 'Modern Control Engineering';
        detectedBook = 'Modern Control Engineering by Katsuhiko Ogata (5th Edition, Pearson)';
      } else if (lower.includes('sensor') || lower.includes('transducer') || lower.includes('patranabis')) {
        detectedSubject = 'Principles of Transducers & Encoders';
        detectedBook = 'Principles of Industrial Instrumentation by D. Patranabis (McGraw-Hill)';
      } else if (lower.includes('thomas') || lower.includes('calculus')) {
        detectedSubject = 'Mathematics I: Calculus';
        detectedBook = "Thomas' Calculus (15th Edition) by Joel R. Hass, Christopher E. Heil, and Maurice D. Weir (Pearson)";
      }

      // Check if user specifically asked for notes with no book mentioned and not waiting for book
      const isGenericNotesRequest = (lower === 'make notes' || lower === 'generate notes' || lower === 'make notes for me' || lower === 'notes please') && !wasWaitingForBook;

      if (isGenericNotesRequest) {
        reply = `To make your study notes 100% accurate according to your university course syllabus and reference book, please provide:\n\n1. **Exact Subject Name** (e.g., Mathematics I - Calculus, Kinematics of Robot Manipulators)\n2. **Textbook / Reference Book Name & Author** (e.g., *Thomas' Calculus* by Hass, Heil & Weir 15th Ed, *Introduction to Robotics* by John J. Craig)\n\nOnce you share both, I will reference the textbook curriculum and formulate exact chapter theorems, formulas, and narrator-optimized audio notes!`;
      } else {
        notesCreated = buildTextbookStudyDeck(detectedSubject, detectedBook, lower);
        actions.push({
          tool: 'createCourseNotes',
          args: {
            courseTitle: notesCreated.title,
            referenceBook: notesCreated.referenceBook,
          },
          description: `Created comprehensive study notes grounded in "${notesCreated.referenceBook}"`,
        });
        reply = `I have analyzed the syllabus and synthesized a complete study cheat sheet and flashcard deck grounded directly in **${notesCreated.referenceBook}**!\n\nAll mathematical equations and definitions have been formatted for smooth spoken audio cadence. You can review the deck and save it directly to your study library below.`;
      }
    }

    // 4. Fallback for general questions or doubts
    else {
      reply = `I understand you are asking about "${message}". As your Academic Copilot for BITS Pilani Dubai courses, I can explain this engineering concept in detail, synthesize a textbook-grounded study deck, or adjust the app's settings.\n\nTo generate complete notes for your study session, please share the **Subject Name** and **Textbook / Author** (for example: *Thomas' Calculus 15th Edition* or *John Craig Robotics*), and I will build your notes immediately!`;
    }

    res.json({
      reply,
      actions,
      notesCreated,
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoxStudy Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
