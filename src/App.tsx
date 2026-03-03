import React, { useState } from 'react';
import { Upload, Download, Loader2, Sparkles, Image as ImageIcon, X, Smartphone, Monitor, LayoutTemplate, AlignCenter, AlignLeft, AlignRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dropzone } from './components/Dropzone';
import { generateWallpaper } from './services/gemini';

export type WallpaperType = 'ios' | 'pc';
export type IOSMode = 'balanced' | 'clock';
export type PCRatio = '16:9' | '4:3';
export type PCPosition = 'center' | 'left' | 'right';

export interface GenerationOptions {
  type: WallpaperType;
  iosMode: IOSMode;
  pcRatio: PCRatio;
  pcPosition: PCPosition;
}

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  
  const [options, setOptions] = useState<GenerationOptions>({
    type: 'ios',
    iosMode: 'balanced',
    pcRatio: '16:9',
    pcPosition: 'center'
  });

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setOriginalImage(e.target.result as string);
        setMimeType(file.type);
        setGeneratedImage(null);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Extract base64 data (remove prefix)
      const base64Data = originalImage.split(',')[1];
      
      const result = await generateWallpaper(base64Data, mimeType, options, userApiKey);
      setGeneratedImage(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate wallpaper. Please try again.');
      if (err.message.includes("API Key")) {
        setShowSettings(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `${options.type}-wallpaper-extended.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 right-6 z-50 w-80 bg-[#111] border border-white/10 rounded-xl p-4 shadow-2xl"
            >
              <h3 className="text-sm font-medium mb-3">Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/50 block">Gemini API Key (Optional)</label>
                  <input 
                    type="password" 
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setShowSettings(false);
                      }
                    }}
                    placeholder="Enter your API key..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-white/30">
                      Required if deploying to Vercel/Netlify without environment variables.
                    </p>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                    >
                      Get a free API key here
                    </a>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium uppercase tracking-wider mb-6 text-white/80"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Wallpaper Extender</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-light tracking-tight mb-6"
          >
            Extend your <span className="text-white/50 font-serif italic">vision.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-xl mx-auto"
          >
            Upload any image and let AI seamlessly extend it into a perfect wallpaper for iOS or PC.
          </motion.p>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {!originalImage ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-xl mx-auto"
              >
                <div className="flex justify-center mb-8">
                  <div className="bg-white/5 p-1 rounded-full flex items-center border border-white/10">
                    <button
                      onClick={() => setOptions(prev => ({ ...prev, type: 'ios' }))}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${options.type === 'ios' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
                    >
                      <Smartphone className="w-4 h-4" />
                      iOS
                    </button>
                    <button
                      onClick={() => setOptions(prev => ({ ...prev, type: 'pc' }))}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${options.type === 'pc' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
                    >
                      <Monitor className="w-4 h-4" />
                      PC
                    </button>
                  </div>
                </div>
                <Dropzone onImageSelect={handleImageSelect} />
              </motion.div>
            ) : (
              <motion.div
                key="workspace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
              >
                {/* Original Image Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium">Original</h2>
                    <button 
                      onClick={reset}
                      className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                  
                  <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 aspect-[3/4] group">
                    <img 
                      src={originalImage} 
                      alt="Original" 
                      className="w-full h-full object-contain p-4"
                    />
                  </div>

                  {!generatedImage && (
                    <div className="space-y-6">
                      {/* Configuration Controls */}
                      <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex justify-center mb-2">
                          <div className="bg-black/20 p-1 rounded-full flex items-center border border-white/5">
                            <button
                              onClick={() => setOptions(prev => ({ ...prev, type: 'ios' }))}
                              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${options.type === 'ios' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
                            >
                              <Smartphone className="w-3 h-3" />
                              iOS
                            </button>
                            <button
                              onClick={() => setOptions(prev => ({ ...prev, type: 'pc' }))}
                              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${options.type === 'pc' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
                            >
                              <Monitor className="w-3 h-3" />
                              PC
                            </button>
                          </div>
                        </div>

                        {options.type === 'ios' ? (
                          <div className="space-y-3">
                            <label className="text-xs uppercase tracking-wider text-white/40 font-medium block text-center">Extension Style</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setOptions(prev => ({ ...prev, iosMode: 'balanced' }))}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${options.iosMode === 'balanced' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                              >
                                Balanced
                              </button>
                              <button
                                onClick={() => setOptions(prev => ({ ...prev, iosMode: 'clock' }))}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${options.iosMode === 'clock' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                              >
                                Make room for clock
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-wider text-white/40 font-medium block">Aspect Ratio</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => setOptions(prev => ({ ...prev, pcRatio: '16:9' }))}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${options.pcRatio === '16:9' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                                >
                                  16:9 (Widescreen)
                                </button>
                                <button
                                  onClick={() => setOptions(prev => ({ ...prev, pcRatio: '4:3' }))}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${options.pcRatio === '4:3' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                                >
                                  4:3 (Standard)
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-wider text-white/40 font-medium block">Subject Position</label>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => setOptions(prev => ({ ...prev, pcPosition: 'left' }))}
                                  className={`px-2 py-2 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-1 ${options.pcPosition === 'left' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                                >
                                  <AlignLeft className="w-4 h-4" />
                                  Left
                                </button>
                                <button
                                  onClick={() => setOptions(prev => ({ ...prev, pcPosition: 'center' }))}
                                  className={`px-2 py-2 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-1 ${options.pcPosition === 'center' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                                >
                                  <AlignCenter className="w-4 h-4" />
                                  Center
                                </button>
                                <button
                                  onClick={() => setOptions(prev => ({ ...prev, pcPosition: 'right' }))}
                                  className={`px-2 py-2 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-1 ${options.pcPosition === 'right' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                                >
                                  <AlignRight className="w-4 h-4" />
                                  Right
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full py-4 rounded-xl bg-white text-black font-medium text-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Extending...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Generate Wallpaper
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                </div>

                {/* Generated Image Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium">Extended Wallpaper</h2>
                    {generatedImage && (
                      <span className="text-xs uppercase tracking-wider text-white/50 border border-white/10 px-2 py-1 rounded">
                        {options.type === 'ios' ? '9:16' : options.pcRatio}
                      </span>
                    )}
                  </div>

                  <div className={`relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 ${options.type === 'ios' ? 'aspect-[9/16]' : options.pcRatio === '16:9' ? 'aspect-video' : 'aspect-[4/3]'} flex items-center justify-center ${!generatedImage ? 'border-dashed' : ''}`}>
                    {generatedImage ? (
                      <img 
                        src={generatedImage} 
                        alt="Generated Wallpaper" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-white/30 p-8">
                        {isGenerating ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            <p>Dreaming up pixels...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 opacity-50" />
                            </div>
                            <p>Your extended wallpaper will appear here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {generatedImage && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleDownload}
                      className="w-full py-4 rounded-xl bg-white text-black font-medium text-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download Wallpaper
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
