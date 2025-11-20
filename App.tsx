import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Button from './components/Button';
import UploadZone from './components/UploadZone';
import { ThumbnailStyle, AppState } from './types';
import { generateThumbnail } from './services/geminiService';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [topic, setTopic] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ThumbnailStyle>(ThumbnailStyle.CLICKBAIT);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        // Fallback if not running in AI Studio environment
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !topic) {
      setErrorMsg("Please provide both a photo and a topic.");
      return;
    }

    setAppState(AppState.GENERATING);
    setErrorMsg(null);

    try {
      const url = await generateThumbnail(selectedFile, topic, selectedStyle);
      if (url) {
        setResultUrl(url);
        setAppState(AppState.SUCCESS);
      } else {
        throw new Error("The AI returned a response, but no image was generated. Please try a different prompt or image.");
      }
    } catch (err: any) {
      console.error(err);
      
      // Check for specific API key error to reset selection
      if (err.message && err.message.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setErrorMsg("API Key session expired or invalid. Please select your key again.");
        setAppState(AppState.IDLE);
        return;
      }

      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "Something went wrong during generation.");
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // API Key Selection Screen
  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-900/10">
          <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">TubeGenie Pro</h1>
          <p className="text-zinc-400 mb-6">
            This app uses the advanced <strong>Gemini 3 Pro</strong> model to generate high-quality YouTube thumbnails. Please select a paid API key to continue.
          </p>
          <Button onClick={handleSelectKey} className="w-full mb-4">
            Select API Key
          </Button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-red-400 underline transition-colors"
          >
            About Billing & API Keys
          </a>
        </div>
      </div>
    );
  }

  // Loading state while checking for key
  if (hasApiKey === null) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // Main App UI
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-red-500/30">
      <Header />

      <main className="flex-grow w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Controls */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                  Config
                </h2>
                <span className="text-xs font-medium bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">PRO Model</span>
            </div>

            {/* Topic Input */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-zinc-300 mb-2">
                Video Topic / Title
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., I Spent 24 Hours in a Haunted House"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              />
            </div>

            {/* File Input */}
            <UploadZone 
              onFileSelect={setSelectedFile} 
              selectedFile={selectedFile} 
            />

            {/* Style Selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Thumbnail Style
              </label>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(ThumbnailStyle).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`
                      px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 border
                      ${selectedStyle === style 
                        ? 'bg-red-600/10 border-red-600 text-red-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'}
                    `}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <Button 
                onClick={handleGenerate} 
                isLoading={appState === AppState.GENERATING}
                className="w-full"
                disabled={!topic || !selectedFile}
              >
                Generate Thumbnail
              </Button>
              {errorMsg && (
                <p className="text-red-400 text-sm mt-3 bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                  {errorMsg}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="w-full lg:w-1/2">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-zinc-500 rounded-full"></span>
              Result
            </h2>

            <div className="flex-grow flex items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden min-h-[300px] relative">
              {appState === AppState.IDLE && (
                <div className="text-zinc-600 text-center p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p>Your generated thumbnail will appear here</p>
                </div>
              )}

              {appState === AppState.GENERATING && (
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-zinc-400 animate-pulse">Creating masterpiece...</p>
                </div>
              )}

              {resultUrl && appState === AppState.SUCCESS && (
                <img 
                  src={resultUrl} 
                  alt="Generated Thumbnail" 
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {appState === AppState.SUCCESS && (
              <div className="mt-6 flex gap-3">
                <Button onClick={handleDownload} className="w-full">
                  Download Image
                </Button>
                <Button variant="secondary" onClick={() => {
                    setAppState(AppState.IDLE);
                    setResultUrl(null);
                }}>
                   Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-zinc-800 mt-auto">
         <div className="text-center text-zinc-600 text-sm">
            Powered by Gemini 3 Pro Image
         </div>
      </footer>
    </div>
  );
};

export default App;