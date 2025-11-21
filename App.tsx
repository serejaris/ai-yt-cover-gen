import React, { useState, useEffect } from 'react';
import VibeMarquee from './components/VibeMarquee';
import Header from './components/Header';
import Button from './components/Button';
import UploadZone from './components/UploadZone';
import { ThumbnailStyle, AppState } from './types';
import { generateThumbnail } from './services/geminiService';

const styleTranslations: Record<ThumbnailStyle, string> = {
  [ThumbnailStyle.MINIMALIST]: 'Минимализм и чистота',
  [ThumbnailStyle.CLICKBAIT]: 'Высокий контраст и эмоции (Кликбейт)',
  [ThumbnailStyle.GAMING]: 'Гейминг и неон',
  [ThumbnailStyle.PROFESSIONAL]: 'Профессиональный и корпоративный',
  [ThumbnailStyle.VLOG]: 'Лайфстайл и влог'
};

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
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        setHasApiKey(true);
      } else {
        setHasApiKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSaveKey = (key: string) => {
    if (key.trim().length > 0) {
      // In a real app you might want to save this to localStorage or context
      // For now we just set the state to allow usage
      // Note: This won't persist across reloads unless we add storage logic
      // But for this fix, we just want to enable the app to work if env var is missing
      (window as any).GEMINI_API_KEY = key;
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !topic) {
      setErrorMsg("Пожалуйста, укажите тему и загрузите фото.");
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
        throw new Error("ИИ вернул ответ, но изображение не было сгенерировано. Попробуйте другой промпт или изображение.");
      }
    } catch (err: any) {
      console.error(err);

      // Check for specific API key error to reset selection
      if (err.message && err.message.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setErrorMsg("Сессия API ключа истекла или он недействителен. Пожалуйста, выберите ключ заново.");
        setAppState(AppState.IDLE);
        return;
      }

      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "Что-то пошло не так при генерации.");
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
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-white">
        <VibeMarquee />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-900/10">
          <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">TubeGenie Pro</h1>
          <p className="text-zinc-400 mb-6">
            Это приложение использует передовую модель <strong>Gemini 3 Pro</strong>. Пожалуйста, укажите ваш API ключ для продолжения.
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSaveKey(formData.get('apiKey') as string);
          }} className="w-full mb-4">
            <input
              name="apiKey"
              type="password"
              placeholder="Введите Gemini API Key"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all mb-4"
            />
            <Button type="submit" className="w-full">
              Начать создание
            </Button>
          </form>
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-red-400 underline transition-colors"
          >
            Получить API ключ
          </a>
        </div>
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
    <div className="min-h-screen flex flex-col font-sans selection:bg-red-500/30 bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      <VibeMarquee />
      <Header />

      <main className="flex-grow w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 relative z-0">
        {/* Background ambient light */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        {/* Left Side: Controls */}
        <div className="w-full lg:w-5/12 space-y-6">
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 space-y-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                Настройки
              </h2>
              <span className="text-xs font-medium bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">PRO Модель</span>
            </div>

            {/* Topic Input */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-zinc-300 mb-2 pl-1">
                Тема видео / Заголовок
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="например, Я провел 24 часа в доме с привидениями"
                className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              />
            </div>

            {/* File Input */}
            <UploadZone
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />

            {/* Style Selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 pl-1">
                Стиль превью
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {Object.values(ThumbnailStyle).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`
                      px-4 py-3.5 rounded-xl text-left text-sm font-medium transition-all duration-200 border flex items-center justify-between group
                      ${selectedStyle === style
                        ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-lg shadow-red-900/10'
                        : 'bg-zinc-950/30 border-zinc-800/50 text-zinc-400 hover:bg-zinc-900/50 hover:border-zinc-700'}
                    `}
                  >
                    <span>{styleTranslations[style]}</span>
                    {selectedStyle === style && (
                       <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                    )}
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
                Сгенерировать превью
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
        <div className="w-full lg:w-7/12">
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 h-full flex flex-col shadow-xl shadow-black/20">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-zinc-500 rounded-full"></span>
              Результат
            </h2>

            <div className="flex-grow flex items-center justify-center bg-zinc-950/50 rounded-2xl border-2 border-dashed border-zinc-800/50 overflow-hidden min-h-[400px] relative group">
              {appState === AppState.IDLE && (
                <div className="text-zinc-600 text-center p-12">
                  <div className="w-20 h-20 bg-zinc-900/80 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 opacity-40">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-zinc-500">Здесь появится ваш шедевр</p>
                  <p className="text-sm text-zinc-600 mt-2">Заполните настройки слева и нажмите "Сгенерировать"</p>
                </div>
              )}

              {appState === AppState.GENERATING && (
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-zinc-400 animate-pulse">Создаем шедевр...</p>
                </div>
              )}

              {resultUrl && appState === AppState.SUCCESS && (
                <img
                  src={resultUrl}
                  alt="Сгенерированное превью"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {appState === AppState.SUCCESS && (
              <div className="mt-6 flex gap-3">
                <Button onClick={handleDownload} className="w-full">
                  Скачать
                </Button>
                <Button variant="secondary" onClick={() => {
                  setAppState(AppState.IDLE);
                  setResultUrl(null);
                }}>
                  Очистить
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