
import React, { useState } from 'react';
import { SheetData } from './types';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [systemInstruction, setSystemInstruction] = useState('');

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-slate-950 font-sans selection:bg-blue-500/30">
      {/* Workplace Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', 
          backgroundSize: '24px 24px' 
        }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 -z-10"></div>
      
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 flex flex-col h-screen max-w-[1600px] mx-auto w-full">
        {/* Branding Header (Minimal) */}
        <div className="flex justify-between items-center mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-xl shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">EMR Support</h1>
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Information Systems</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">System Status</span>
              <span className="text-emerald-400 text-xs font-medium">Core Responsive</span>
            </div>
          </div>
        </div>

        {/* Chat Interface Container */}
        <div className="flex-1 h-full min-h-0">
          <ChatInterface 
            sheetData={sheetData} 
            setSheetData={setSheetData}
            systemInstruction={systemInstruction}
            setSystemInstruction={setSystemInstruction}
          />
        </div>

        {/* Footer Credits */}
        <div className="py-4 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em] font-medium">
            Proprietary Neural Interface • Information Systems Department
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
