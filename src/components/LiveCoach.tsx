import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, MessageSquare, Sparkles, Loader2, Gauge } from 'lucide-react';
import { GeminiLiveService } from '../lib/geminiLive';
import { cn } from '../lib/utils';

export function LiveCoach() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.2);
  const [transcriptions, setTranscriptions] = useState<{ text: string; isModel: boolean }[]>([]);
  const serviceRef = useRef<GeminiLiveService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
        serviceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (serviceRef.current) {
      serviceRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const toggleConnection = async () => {
    if (isConnecting) return;
    
    if (isConnected) {
      serviceRef.current?.disconnect();
      serviceRef.current = null;
      setIsConnected(false);
      return;
    }

    setIsConnecting(true);
    try {
      // Ensure old service is disconnected
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }

      const apiKey = process.env.GEMINI_API_KEY || '';
      const service = new GeminiLiveService(apiKey);
      serviceRef.current = service;
      
      service.setPlaybackRate(playbackRate);
      await service.connect({
        onopen: () => {
          setIsConnected(true);
          setIsConnecting(false);
        },
        onTranscription: (text, isModel) => {
          setTranscriptions(prev => [...prev, { text, isModel }]);
        },
        onerror: (err) => {
          console.error(err);
          setIsConnecting(false);
        },
        onclose: () => {
          setIsConnected(false);
          setIsConnecting(false);
        }
      });
      serviceRef.current = service;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const speedOptions = [0.75, 1.0, 1.2, 1.5];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-40px)] max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500",
              isConnected ? "bg-indigo-600 animate-pulse" : "bg-slate-400"
            )}>
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Business English Coach</h2>
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-slate-300")} />
                <span className="text-xs font-medium text-slate-500">
                  {isConnected ? "Verbunden & Bereit" : isConnecting ? "Verbindung wird aufgebaut..." : "Nicht verbunden"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Speed Control */}
            <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 gap-2 shadow-sm">
              <Gauge size={16} className="text-slate-400" />
              <div className="flex gap-1">
                {speedOptions.map(speed => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackRate(speed)}
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full transition-all",
                      playbackRate === speed 
                        ? "bg-indigo-600 text-white" 
                        : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={toggleConnection}
              disabled={isConnecting}
              className={cn(
                "px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md",
                isConnected 
                  ? "bg-red-50 text-red-600 hover:bg-red-100" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              )}
            >
              {isConnecting ? <Loader2 className="animate-spin" size={20} /> : isConnected ? "Beenden" : "Starten"}
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30"
        >
          {transcriptions.length === 0 && !isConnected && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                <Mic size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Bereit zum Sprechen?</h3>
              <p className="text-slate-500 max-w-xs">
                Klicke auf Starten, um dein Echtzeit-Englischtraining mit dem KI-Coach zu beginnen.
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {transcriptions.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex",
                  t.isModel ? "justify-start" : "justify-end"
                )}
              >
                <div className={cn(
                  "max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                  t.isModel 
                    ? "bg-white text-slate-800 border border-slate-100 rounded-tl-none" 
                    : "bg-indigo-600 text-white rounded-tr-none"
                )}>
                  {t.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="p-6 bg-white border-t border-slate-50 flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
              isMuted ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <div className="flex-1 max-w-md bg-slate-100 h-14 rounded-full flex items-center px-6 text-slate-400 font-medium">
            {isConnected ? "Spreche jetzt..." : "Warte auf Start..."}
          </div>

          <button className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
