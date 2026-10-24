import React, { useEffect, useState } from 'react';
import {
  ttsService,
  FREE_NATURAL_VOICES,
} from '../services/ttsService';
import { Volume2, Play, Check, X, Sliders, Globe } from 'lucide-react';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ isOpen, onClose }) => {
  const [selectedFreeVoice, setSelectedFreeVoice] = useState<string>('en-US-JennyNeural');
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserURI, setSelectedBrowserURI] = useState<string>('');
  const [rate, setRate] = useState<number>(1.0);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const prefs = ttsService.getPreferences();
    setSelectedFreeVoice(prefs.freeVoiceId || 'en-US-JennyNeural');
    setSelectedBrowserURI(prefs.voiceURI || '');
    setRate(prefs.rate || 1.0);

    const available = ttsService.getAvailableBrowserVoices();
    setBrowserVoices(available);

    const unsubscribe = ttsService.subscribe((state) => {
      setSelectedFreeVoice(state.freeVoiceId || 'en-US-JennyNeural');
      setSelectedBrowserURI(state.selectedVoiceURI);
    });

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const handleVoicesChanged = () => {
        setBrowserVoices(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        unsubscribe();
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectFreeVoice = (voiceId: string) => {
    setSelectedFreeVoice(voiceId);
    ttsService.setFreeVoice(voiceId);
  };

  const handleSelectBrowserVoice = (uri: string) => {
    setSelectedBrowserURI(uri);
    ttsService.setBrowserVoice(uri);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    ttsService.setRate(newRate);
  };

  const handleTestFree = async (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTestingVoice(voiceId);
    try {
      await ttsService.testFreeVoice(voiceId);
    } finally {
      setTestingVoice(null);
    }
  };

  const handleTestBrowser = (voice: SpeechSynthesisVoice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance('Welcome to VoxStudy! Reading your study desk notes.');
      u.voice = voice;
      u.rate = rate;
      window.speechSynthesis.speak(u);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-lg shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-colors"
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
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2
                className="text-base font-bold tracking-tight"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Audio Voices &amp; Speed
              </h2>
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                13 realistic neural voices with unlimited playback
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

        {/* Sliders: Rate / Pacing */}
        <div
          className="px-6 py-3.5 border-b"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
          }}
        >
          <div
            className="flex items-center justify-between text-xs font-semibold mb-1"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
              Narration Speed / Pacing
            </span>
            <span className="font-mono tabular-nums font-bold" style={{ color: 'var(--theme-accent)' }}>
              {rate.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min={0.75}
            max={1.75}
            step={0.05}
            value={rate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-[var(--theme-accent)]"
          />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
            <span>0.75x (Deliberate Study)</span>
            <span>1.0x (Natural Pace)</span>
            <span>1.75x (Quick Review)</span>
          </div>
        </div>

        {/* Voices Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Natural Neural Voices ({FREE_NATURAL_VOICES.length})
            </span>
          </div>

          <div className="space-y-2">
            {FREE_NATURAL_VOICES.map((v) => {
              const isSelected = selectedFreeVoice === v.id || selectedBrowserURI === v.id;
              const isTesting = testingVoice === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectFreeVoice(v.id)}
                  className="flex items-start justify-between p-3.5 rounded-md border cursor-pointer transition-all"
                  style={{
                    borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                    backgroundColor: isSelected ? 'var(--theme-accent-subtle)' : 'var(--theme-card-bg)',
                    boxShadow: isSelected ? '0 0 0 1px var(--theme-accent)' : undefined,
                  }}
                >
                  <div className="space-y-0.5 min-w-0 flex-1 mr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-bold"
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        {v.name}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1 border"
                        style={{
                          backgroundColor: 'var(--theme-surface-subtle)',
                          borderColor: 'var(--theme-card-border)',
                          color: 'var(--theme-text-muted)',
                        }}
                      >
                        <Globe className="w-2.5 h-2.5" />
                        {v.accent}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono border"
                        style={{
                          backgroundColor: 'var(--theme-surface-subtle)',
                          borderColor: 'var(--theme-card-border)',
                          color: 'var(--theme-text-muted)',
                        }}
                      >
                        {v.gender}
                      </span>
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >
                      {v.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => handleTestFree(v.id, e)}
                      disabled={isTesting}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--theme-surface-subtle)',
                        borderColor: 'var(--theme-card-border)',
                        color: 'var(--theme-text-primary)',
                      }}
                      title="Preview voice"
                    >
                      {isTesting ? (
                        <span
                          className="w-2.5 h-2.5 rounded-full animate-ping"
                          style={{ backgroundColor: 'var(--theme-accent)' }}
                        />
                      ) : (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{isTesting ? 'Playing...' : 'Test'}</span>
                    </button>
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center border"
                      style={{
                        backgroundColor: isSelected ? 'var(--theme-accent)' : 'transparent',
                        borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                        color: '#ffffff',
                      }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Native Device Synthesizers if available */}
          {browserVoices.length > 0 && (
            <div
              className="pt-4 border-t space-y-2"
              style={{ borderColor: 'var(--theme-card-border)' }}
            >
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Offline Device Synthesizers ({browserVoices.length})
              </div>
              {browserVoices
                .filter(v => v.lang.toLowerCase().startsWith('en') || !v.lang)
                .slice(0, 6)
                .map((v) => {
                  const isSelected = selectedBrowserURI === v.voiceURI;

                  return (
                    <div
                      key={v.voiceURI}
                      onClick={() => handleSelectBrowserVoice(v.voiceURI)}
                      className="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all text-xs"
                      style={{
                        borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                        backgroundColor: isSelected ? 'var(--theme-accent-subtle)' : 'var(--theme-card-bg)',
                      }}
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <span
                          className="font-semibold truncate block"
                          style={{ color: 'var(--theme-text-primary)' }}
                        >
                          {v.name.replace(/Microsoft |Google |Apple /gi, '')}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--theme-text-muted)' }}>
                          {v.lang} · Local Synthesizer
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handleTestBrowser(v, e)}
                          className="px-2 py-0.5 rounded text-[11px] font-medium border"
                          style={{
                            backgroundColor: 'var(--theme-surface-subtle)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-primary)',
                          }}
                        >
                          Test
                        </button>
                        <div
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center border"
                          style={{
                            backgroundColor: isSelected ? 'var(--theme-accent)' : 'transparent',
                            borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                            color: '#ffffff',
                          }}
                        >
                          {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3.5 border-t flex justify-end"
          style={{
            backgroundColor: 'var(--theme-surface-subtle)',
            borderColor: 'var(--theme-card-border)',
          }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          >
            Apply Voice &amp; Done
          </button>
        </div>
      </div>
    </div>
  );
};
