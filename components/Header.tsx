import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tube<span className="text-red-500">Genie</span>
          </h1>
        </div>
        <div className="text-sm text-zinc-400 hidden sm:block">
          Генератор превью на базе ИИ
        </div>
      </div>
    </header>
  );
};

export default Header;