import React, { useState } from 'react';
import { CourseDocument, AcademicYear } from '../types';
import { parsePdfFile, parsePastedText } from '../services/pdfParser';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onDocLoaded: (doc: CourseDocument) => void;
  onClose: () => void;
  branchId?: string;
  year?: AcademicYear;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onDocLoaded,
  onClose,
  branchId = 'robotics-automation',
  year = '2nd Year',
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'paste'>('pdf');
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    try {
      const doc = await parsePdfFile(file, branchId, year);
      onDocLoaded(doc);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Could not extract text from this file. You can paste the text directly in the Paste tab.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedContent.trim()) return;

    const doc = parsePastedText(pastedContent.trim(), pastedTitle.trim() || 'My Lecture Notes', branchId, year);
    onDocLoaded(doc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-lg shadow-2xl border overflow-hidden flex flex-col transition-colors"
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
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-md"
              style={{
                backgroundColor: 'var(--theme-accent-subtle)',
                color: 'var(--theme-accent)',
              }}
            >
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2
                className="text-base font-bold tracking-tight"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Upload Course Notes
              </h2>
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                PDF or pasted text with sentence-by-sentence audio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div
          className="flex border-b px-6 pt-2 text-xs"
          style={{ borderColor: 'var(--theme-card-border)' }}
        >
          <button
            onClick={() => setActiveTab('pdf')}
            className="pb-3 font-semibold transition-colors mr-6 border-b-2 cursor-pointer"
            style={{
              borderColor: activeTab === 'pdf' ? 'var(--theme-accent)' : 'transparent',
              color: activeTab === 'pdf' ? 'var(--theme-accent)' : 'var(--theme-text-muted)',
            }}
          >
            Upload PDF Document
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className="pb-3 font-semibold transition-colors border-b-2 cursor-pointer"
            style={{
              borderColor: activeTab === 'paste' ? 'var(--theme-accent)' : 'transparent',
              color: activeTab === 'paste' ? 'var(--theme-accent)' : 'var(--theme-text-muted)',
            }}
          >
            Paste Text / Slide Notes
          </button>
        </div>

        {/* Tab 1: PDF Dropzone */}
        {activeTab === 'pdf' && (
          <div className="p-6 space-y-4">
            <label
              className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              style={{
                borderColor: 'var(--theme-card-border)',
                backgroundColor: 'var(--theme-surface-subtle)',
              }}
            >
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="hidden"
              />
              <FileText
                className="w-10 h-10 mb-3"
                style={{ color: 'var(--theme-text-muted)' }}
              />
              <div
                className="text-sm font-bold mb-1"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                {isProcessing ? 'Extracting text & sentences...' : 'Click or drag course PDF here'}
              </div>
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                Supports PDF textbooks, course handouts, and lecture slides
              </p>
            </label>

            {error && (
              <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Paste Text */}
        {activeTab === 'paste' && (
          <form onSubmit={handlePasteSubmit} className="p-6 space-y-4">
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Document / Chapter Title
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 4: Industrial Robot Arms & Actuators"
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-md border focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Notes Content (Paste text here)
              </label>
              <textarea
                required
                rows={6}
                placeholder="Paste course text, slide outlines, or exam notes here..."
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                className="w-full text-xs p-3.5 rounded-md border focus:outline-none leading-relaxed transition-colors"
                style={{
                  backgroundColor: 'var(--theme-surface-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-md hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white rounded-md shadow-sm transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                Load &amp; Generate Audio
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
