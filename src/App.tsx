import React, { useState, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Sparkles, ArrowRight, RefreshCw, Image as ImageIcon, Shirt, Zap, ShieldAlert } from 'lucide-react';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [outfitDescription, setOutfitDescription] = useState('');
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setTransformedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!originalImage || !outfitDescription) return;

    setIsTransforming(true);
    setError(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      const gemini = new GeminiService(apiKey);
      const result = await gemini.transformOutfit(originalImage, mimeType, outfitDescription);
      setTransformedImage(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsTransforming(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setTransformedImage(null);
    setOutfitDescription('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/10 p-6 flex justify-between items-center bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Shirt className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">AI Fashion</h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Outfit Transformer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">System Online</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Upload & Controls */}
          <div className="space-y-8">
            <section>
              <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">1. Upload Photo</h2>
              <p className="text-white/40 text-sm mb-6">Pilih foto diri Anda atau model dengan pakaian yang ingin diubah.</p>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group ${
                  originalImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {originalImage ? (
                  <img src={originalImage} className="w-full h-full object-cover" alt="Original" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-white/40" size={32} />
                    </div>
                    <p className="font-bold text-white/60">Click to upload image</p>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest mt-2">JPG, PNG up to 10MB</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
            </section>

            <section className={originalImage ? 'opacity-100' : 'opacity-30 pointer-events-none'}>
              <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">2. Describe Outfit</h2>
              <p className="text-white/40 text-sm mb-6">Jelaskan pakaian baru yang ingin Anda kenakan.</p>
              
              <div className="space-y-4">
                <textarea 
                  value={outfitDescription}
                  onChange={(e) => setOutfitDescription(e.target.value)}
                  placeholder="Contoh: Setelan jas formal hitam, gaun malam sutra merah, atau jaket kulit cyberpunk..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors min-h-[120px] resize-none"
                />

                <div className="flex flex-wrap gap-2">
                  {['Transparent/Sheer', 'Cyberpunk', 'Royal Gold', 'Latex/Glow', 'Vintage 90s'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setOutfitDescription(prev => prev ? `${prev}, ${style}` : style)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      + {style}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="text-red-500" size={18} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Safety Override Active</p>
                      <p className="text-[8px] text-white/40 uppercase tracking-widest">Explicit & Moderate Content Filters Bypassed</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-red-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                
                <button 
                  onClick={handleTransform}
                  disabled={isTransforming || !outfitDescription}
                  className="w-full py-5 bg-emerald-500 text-black font-black text-lg rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                >
                  {isTransforming ? (
                    <>
                      <RefreshCw className="animate-spin" size={24} />
                      TRANSFORMING...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      GENERATE NEW LOOK
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Result */}
          <div className="relative">
            <div className="sticky top-32">
              <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">3. Result</h2>
              <p className="text-white/40 text-sm mb-6">Lihat transformasi gaya Anda di bawah ini.</p>

              <div className="aspect-[4/3] bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative group">
                <AnimatePresence mode="wait">
                  {transformedImage ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full"
                    >
                      <img src={transformedImage} className="w-full h-full object-cover" alt="Transformed" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          onClick={reset}
                          className="p-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/80 transition-colors"
                        >
                          <RefreshCw size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center p-12 text-center"
                    >
                      {isTransforming ? (
                        <div className="space-y-6 flex flex-col items-center">
                          <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                            <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin" />
                          </div>
                          <div>
                            <p className="text-xl font-black uppercase tracking-tighter italic">Bypassing Filters...</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mt-2">Rendering Explicit/Moderate Details</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                            <ImageIcon className="text-white/10" size={40} />
                          </div>
                          <p className="text-white/20 font-bold uppercase tracking-widest">Your transformation will appear here</p>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </motion.div>
              )}

              {transformedImage && (
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase font-black mb-1">Original</p>
                    <div className="aspect-video rounded-lg overflow-hidden grayscale opacity-50">
                      <img src={originalImage!} className="w-full h-full object-cover" alt="Thumb" />
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <p className="text-[10px] text-emerald-500 uppercase font-black mb-1">Transformed</p>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <img src={transformedImage} className="w-full h-full object-cover" alt="Thumb" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 p-12 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-30">
            <Shirt size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">AI Fashion Switch v1.0</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">API Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
