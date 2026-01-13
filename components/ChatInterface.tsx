
import React, { useState, useRef, useEffect } from 'react';
import { Message, SheetData, Source, AppStatus } from '../types';
import { generateSupportResponse } from '../services/geminiService';
import { fetchSheetAsCsv } from '../services/sheetService';

interface ChatInterfaceProps {
  sheetData: SheetData | null;
  setSheetData: (data: SheetData | null) => void;
  systemInstruction: string;
  setSystemInstruction: (val: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  sheetData, 
  setSheetData, 
  systemInstruction, 
  setSystemInstruction 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "EMR Support Portal initialized. I'm ready to assist with system navigation or clinical data queries. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleConnect = async () => {
    if (!sheetUrl) return;
    setStatus(AppStatus.LOADING_SHEET);
    setError(null);
    try {
      const data = await fetchSheetAsCsv(sheetUrl);
      setSheetData(data);
      setStatus(AppStatus.SHEET_LOADED);
      // Auto-close config after successful connection
      setTimeout(() => setShowConfig(false), 1500);
    } catch (err: any) {
      setError(err.message || 'Connection failed.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { text, sources } = await generateSupportResponse(input, messages, sheetData, systemInstruction);
      const botMessage: Message = {
        role: 'model',
        text: text,
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'model',
        text: "System Interruption: Please check Information Systems connectivity.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative">
      {/* Configuration Slide-over */}
      {showConfig && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white font-bold text-lg">System Configuration</h3>
            <button 
              onClick={() => setShowConfig(false)}
              className="text-slate-400 hover:text-white p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 max-w-md mx-auto w-full">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GSheet Database URL</label>
              <input 
                type="text" 
                placeholder="Enter secure link..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <button 
              onClick={handleConnect}
              disabled={status === AppStatus.LOADING_SHEET}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              {status === AppStatus.LOADING_SHEET ? 'Synchronizing...' : 'Sync Database'}
            </button>

            {status === AppStatus.SHEET_LOADED && (
              <div className="text-emerald-400 text-xs text-center font-medium animate-bounce">
                ✓ Connection Verified
              </div>
            )}

            {error && (
              <div className="text-red-400 text-xs bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <div className="pt-6 border-t border-white/5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Agent Protocol Override</label>
              <textarea 
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                placeholder="Custom HIPAA or protocol instructions..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900/80 p-5 text-white flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-base tracking-tight leading-none mb-1">EMR Support Portal</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-medium uppercase tracking-widest">
              <span className={`w-1.5 h-1.5 rounded-full ${sheetData ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
              {sheetData ? 'Database Linked' : 'General Mode'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowConfig(true)}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
            title="Database Configuration"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button 
            onClick={() => setMessages([messages[0]])}
            className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/20"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div 
              className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white/95 text-slate-800 border border-white/10 rounded-tl-none shadow-xl'
              }`}
            >
              <div className="text-[14px] whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Medical References</div>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] bg-slate-100/80 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md flex items-center gap-1 transition-colors border border-slate-200 max-w-full overflow-hidden"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="truncate">{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className={`text-[9px] mt-2 opacity-60 font-medium ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/80 border border-white/20 px-4 py-2 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-500 italic">Processing Query...</span>
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        className="p-6 bg-slate-900/60 border-t border-white/5 flex gap-4 items-center"
      >
        <div className="flex-1">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything or sync a database for internal records..."
            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
          />
        </div>
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`h-14 w-14 flex items-center justify-center rounded-2xl transition-all shadow-2xl ${
            !input.trim() || isLoading 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
