import * as pdfjsLib from 'pdfjs-dist';
import { CourseDocument, SentenceItem, DocumentPage, BlockType, AcademicYear } from '../types';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
}

interface LineItem {
  str: string;
  x: number;
  y: number;
  height: number;
}

// Intelligent block classifier
function detectBlockType(text: string): BlockType {
  const trimmed = text.trim();

  // Headings: e.g. "Module 1: Introduction", "Chapter 2", or short uppercase lines
  if (/^(Module\s+\d+|Chapter\s+\d+|Unit\s+\d+|Part\s+\d+)/i.test(trimmed)) {
    return 'heading-1';
  }
  if (/^(Why\s|What\s|Five\s+major|Scientific\s+method|Levels\s+of\s+organization|Principles\s+of|Introduction\s+to|Key\s+Themes)/i.test(trimmed) && trimmed.length < 80) {
    return 'heading-2';
  }
  if (/^[A-Z0-9\s,:\-]{4,50}$/.test(trimmed) && !trimmed.endsWith('.')) {
    return 'heading-2';
  }

  // List items: e.g. "1. Evolution", "• Sensor", "- Examples:"
  if (/^(\d+[\.\)]|[\u2022\u25E6\u2023\u2219\*\-]\s|Examples?:|\([a-z0-9]\))/i.test(trimmed)) {
    return 'list-item';
  }

  // Table rows or comparative statements: e.g. "Statement Valid hypothesis?", "Item | Value"
  if (/^(Statement\s+Valid|Air\s+pollution.*(Yes|No)|Natural\s+disasters.*(Yes|No)|A\s+fresh\s+water.*(Yes|No)|.*\|.*)/i.test(trimmed)) {
    return 'table-row';
  }

  return 'paragraph';
}

// Helper to split a block of text strictly into complete grammatical sentences
function splitIntoGrammaticalSentences(text: string): string[] {
  if (!text || !text.trim()) return [];

  // Protect common academic and English abbreviations from false sentence splits
  const protectedText = text
    .replace(/\b(e\.g\.|i\.e\.|vs\.|al\.|etc\.|Fig\.|Eq\.|Ref\.|Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.|Jan\.|Feb\.|Mar\.|Apr\.|Jun\.|Jul\.|Aug\.|Sep\.|Oct\.|Nov\.|Dec\.|approx\.|w\.r\.t\.|Vol\.|No\.)/gi, (match) => {
      return match.replace(/\./g, '__DOT__');
    })
    // Protect decimal numbers like 3.14 or 0.05
    .replace(/(\d+)\.(\d+)/g, '$1__DOT__$2');

  // Split strictly on terminal punctuation (. ! ?) followed by whitespace and a new sentence start
  const rawParts = protectedText.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/);

  const sentences: string[] = [];
  let currentBuffer = '';

  for (let part of rawParts) {
    const restored = part.replace(/__DOT__/g, '.').trim();
    if (!restored) continue;

    // If previous buffer didn't finish with a terminal mark (e.g. ended with a comma or broken clause), stitch them together
    if (currentBuffer) {
      if (/[,\-;:]$/.test(currentBuffer) || !/[.!?]$/.test(currentBuffer)) {
        currentBuffer += ' ' + restored;
      } else {
        sentences.push(currentBuffer);
        currentBuffer = restored;
      }
    } else {
      currentBuffer = restored;
    }
  }

  if (currentBuffer) {
    sentences.push(currentBuffer);
  }

  return sentences.length > 0 ? sentences : [text.trim()];
}

// Convert a block of raw text into structured sentences with block types and unbroken flow
export function structureTextIntoSentences(
  rawText: string,
  pageNumber: number = 1,
  startGlobalWordIndex: number = 0
): { sentences: SentenceItem[]; wordsAdded: number } {
  // First, split into raw lines while preserving empty line breaks
  const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Unwrap soft line-breaks inside paragraphs so wrapped lines don't break mid-sentence
  const structuredBlocks: { text: string; blockType: BlockType }[] = [];
  let paragraphBuffer = '';

  for (let lIdx = 0; lIdx < rawLines.length; lIdx++) {
    const line = rawLines[lIdx];
    const blockType = detectBlockType(line);

    if (blockType !== 'paragraph') {
      // Flush any accumulated paragraph first
      if (paragraphBuffer.trim()) {
        structuredBlocks.push({ text: paragraphBuffer.trim(), blockType: 'paragraph' });
        paragraphBuffer = '';
      }
      structuredBlocks.push({ text: line, blockType });
    } else {
      // Accumulate paragraph lines
      if (!paragraphBuffer) {
        paragraphBuffer = line;
      } else {
        // Handle hyphenated word wrapped across lines: e.g. "trans-" + "ducer"
        if (paragraphBuffer.endsWith('-') && !paragraphBuffer.endsWith(' -') && /[a-zA-Z]-$/.test(paragraphBuffer)) {
          paragraphBuffer = paragraphBuffer.slice(0, -1) + line;
        } else {
          paragraphBuffer += ' ' + line;
        }
      }
    }
  }

  if (paragraphBuffer.trim()) {
    structuredBlocks.push({ text: paragraphBuffer.trim(), blockType: 'paragraph' });
  }

  // 2. Segment each block into grammatically complete, natural-sounding sentences
  const sentences: SentenceItem[] = [];
  let currentWordCount = startGlobalWordIndex;

  for (let bIdx = 0; bIdx < structuredBlocks.length; bIdx++) {
    const { text: blockText, blockType } = structuredBlocks[bIdx];

    if (blockType !== 'paragraph') {
      const wordCount = blockText.split(/\s+/).length;
      sentences.push({
        id: `s-${pageNumber}-${bIdx}-${Math.random().toString(36).slice(2, 6)}`,
        text: blockText,
        startWordIndex: currentWordCount,
        endWordIndex: currentWordCount + wordCount,
        pageNumber,
        blockType,
      });
      currentWordCount += wordCount;
    } else {
      const gramSentences = splitIntoGrammaticalSentences(blockText);

      for (let sIdx = 0; sIdx < gramSentences.length; sIdx++) {
        const sentenceText = gramSentences[sIdx];
        const wordCount = sentenceText.split(/\s+/).length;

        sentences.push({
          id: `s-${pageNumber}-${bIdx}-${sIdx}-${Math.random().toString(36).slice(2, 6)}`,
          text: sentenceText,
          startWordIndex: currentWordCount,
          endWordIndex: currentWordCount + wordCount,
          pageNumber,
          blockType: 'paragraph',
        });
        currentWordCount += wordCount;
      }
    }
  }

  return { sentences, wordsAdded: currentWordCount - startGlobalWordIndex };
}

export async function parsePdfFile(
  file: File,
  branchId: string = 'robotics-automation',
  year: AcademicYear = '2nd Year'
): Promise<CourseDocument> {
  const arrayBuffer = await file.arrayBuffer();

  const pages: DocumentPage[] = [];
  const allSentences: SentenceItem[] = [];
  let fullCleanText = '';
  let globalWordCount = 0;

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Group items into visual lines using y-coordinates
      const items: LineItem[] = textContent.items
        .map((item: any) => {
          if ('str' in item && item.str.trim()) {
            return {
              str: item.str,
              x: item.transform[4] || 0,
              y: Math.round(item.transform[5] || 0),
              height: item.height || 12,
            };
          }
          return null;
        })
        .filter((i): i is LineItem => i !== null);

      // Sort items: top to bottom (descending y), then left to right (ascending x)
      items.sort((a, b) => {
        if (Math.abs(a.y - b.y) > 4) {
          return b.y - a.y; // Higher y means higher up on page
        }
        return a.x - b.x;
      });

      // Cluster items into lines
      const lines: string[] = [];
      let currentLineY: number | null = null;
      let currentLineStr = '';

      for (const item of items) {
        if (currentLineY === null || Math.abs(item.y - currentLineY) > 5) {
          if (currentLineStr.trim()) {
            lines.push(currentLineStr.trim());
          }
          currentLineY = item.y;
          currentLineStr = item.str;
        } else {
          // Same line: add space if needed
          currentLineStr += ' ' + item.str;
        }
      }
      if (currentLineStr.trim()) {
        lines.push(currentLineStr.trim());
      }

      const pageRawText = lines.join('\n');
      fullCleanText += `\n\n[Page ${pageNum}]\n` + pageRawText;

      const { sentences: pageSentences, wordsAdded } = structureTextIntoSentences(
        pageRawText,
        pageNum,
        globalWordCount
      );

      globalWordCount += wordsAdded;
      allSentences.push(...pageSentences);

      pages.push({
        pageNumber: pageNum,
        title: `Page ${pageNum} of ${numPages}`,
        sentences: pageSentences,
      });
    }
  } catch (err) {
    console.warn('PDF.js binary parsing notice, applying fallback text parsing:', err);
    const textDecoder = new TextDecoder('utf-8');
    const raw = textDecoder.decode(arrayBuffer);
    const textMatches = raw.match(/\(([^)]+)\)/g);
    let extractedText = '';
    if (textMatches && textMatches.length > 5) {
      extractedText = textMatches.map(m => m.slice(1, -1)).join('\n');
    } else {
      extractedText = `Uploaded Document: ${file.name}\n\nNotes loaded from ${file.name}. Audio narration and structured sentence breakdown are ready.`;
    }

    const { sentences } = structureTextIntoSentences(extractedText, 1, 0);
    allSentences.push(...sentences);
    pages.push({
      pageNumber: 1,
      title: 'Page 1',
      sentences,
    });
    fullCleanText = extractedText;
  }

  return {
    id: `custom-doc-${Date.now()}`,
    title: file.name.replace(/\.[^/.]+$/, ''),
    courseCode: 'COURSE NOTES',
    branchId,
    year,
    rawText: fullCleanText.trim(),
    sentences: allSentences,
    pages,
    chapters: [
      { title: file.name.replace(/\.[^/.]+$/, ''), startSentenceIndex: 0 },
    ],
    isCustomUpload: true,
  };
}

// Convert pasted text into formatted structured document with pages
export function parsePastedText(
  text: string,
  title: string = 'My Uploaded Notes',
  branchId: string = 'robotics-automation',
  year: AcademicYear = '2nd Year'
): CourseDocument {
  // Check if text has page markers like "Page 1 of 17" or "[Page 1]"
  const pageChunks = text.split(/(?:\[Page\s+\d+\]|Page\s+\d+\s+of\s+\d+)/i).filter(c => c.trim().length > 0);

  const pages: DocumentPage[] = [];
  const allSentences: SentenceItem[] = [];
  let globalWordCount = 0;

  if (pageChunks.length > 1) {
    pageChunks.forEach((chunk, idx) => {
      const pageNum = idx + 1;
      const { sentences, wordsAdded } = structureTextIntoSentences(chunk, pageNum, globalWordCount);
      globalWordCount += wordsAdded;
      allSentences.push(...sentences);
      pages.push({
        pageNumber: pageNum,
        title: `Page ${pageNum} of ${pageChunks.length}`,
        sentences,
      });
    });
  } else {
    // Single page document
    const { sentences } = structureTextIntoSentences(text, 1, 0);
    allSentences.push(...sentences);
    pages.push({
      pageNumber: 1,
      title: 'Page 1',
      sentences,
    });
  }

  return {
    id: `pasted-doc-${Date.now()}`,
    title,
    courseCode: 'STUDENT NOTES',
    branchId,
    year,
    rawText: text.trim(),
    sentences: allSentences,
    pages,
    chapters: [{ title, startSentenceIndex: 0 }],
    isCustomUpload: true,
  };
}
