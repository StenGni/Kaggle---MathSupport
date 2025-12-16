
import React, { useState, useRef } from 'react';
import { Play, CheckCircle2, Info, ArrowLeft, ChevronDown } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (user: any) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [showAbout, setShowAbout] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (showAbout) {
    return (
      <div className="flex flex-col items-center min-h-screen p-6 bg-[#ddead1] overflow-y-auto">
        <div className="w-full max-w-sm my-auto py-8">
          <button 
            onClick={() => setShowAbout(false)}
            className="flex items-center text-emerald-800 font-bold mb-6 hover:text-emerald-900 transition-colors group"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-6 tracking-tight">About the App</h1>
          
          <div className="space-y-6 bg-white/60 p-6 rounded-2xl border border-white/50 backdrop-blur-md shadow-lg">
            
            <div className="mb-2 border-b border-emerald-900/10 pb-6">
                <p className="text-slate-800 leading-relaxed font-medium">
                    In a world where ready-made solutions are everywhere, sometimes you only need a little support to find the answer yourself.
                </p>
                <p className="text-slate-700 leading-relaxed mt-4 text-sm">
                    That is why we made <span className="font-bold text-emerald-800">MathSupport</span>. We support people who learn math in this journey. We don't just give full answers—we guide you, point out mistakes, and encourage you to practice.
                </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-700" />
                Help with the exercise
              </h3>
              <p className="text-slate-800 leading-relaxed text-sm">
                Upload a photo of your math problem. We identify mistakes, provide hints, and guide you to the correct solution.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-700" />
                Analyze my skills
              </h3>
              <p className="text-slate-800 leading-relaxed text-sm">
                Share photos of your past work. The app detects your weak and strong points to create a personalized skill profile.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-700" />
                Targeted Practice
              </h3>
              <p className="text-slate-800 leading-relaxed text-sm">
                Based on your identified weaknesses, the app generates custom exercises to help you learn effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden no-scrollbar bg-[#ddead1] scroll-smooth snap-y snap-mandatory font-sans">
      <style>{`
         @keyframes fadeUpSlow {
           0% { opacity: 0; transform: translateY(30px); }
           100% { opacity: 1; transform: translateY(0); }
         }
         @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
         }
         @keyframes float-reverse {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(20px) rotate(-5deg); }
         }
         @keyframes pulse-soft {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
         }
       `}</style>

      {/* Hero Section */}
      <div className="h-full w-full relative flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-500 text-white shrink-0 snap-start overflow-hidden perspective-1000">
         
         {/* 3D Abstract Background Shapes */}
         <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            
            {/* Top Right - Large Sphere */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#d1fae5_0%,_#10b981_25%,_#064e3b_100%)] shadow-2xl opacity-90 animate-[float_8s_ease-in-out_infinite]" />
            
            {/* Bottom Left - Capsule/Pill */}
            <div className="absolute bottom-20 -left-10 w-40 h-80 rounded-full bg-gradient-to-b from-emerald-200 to-emerald-900 shadow-2xl rotate-45 opacity-80 animate-[float-reverse_10s_ease-in-out_infinite]" />
            
            {/* Center Floating Cube-ish (Rotated Div) */}
            <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-300 to-teal-800 rounded-3xl rotate-12 shadow-xl opacity-60 animate-[float_6s_ease-in-out_infinite_1s]" />

            {/* Floating Ring/Torus approximation */}
            <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full border-[16px] border-emerald-400/30 blur-sm animate-[float-reverse_9s_ease-in-out_infinite_0.5s]" />

            {/* Small Particles */}
            <div className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-white blur-sm opacity-60 animate-[pulse-soft_4s_ease-in-out_infinite]" />
            <div className="absolute bottom-1/3 right-1/3 w-12 h-12 rounded-full bg-emerald-300 blur-md opacity-40" />

            {/* Glassmorphism Panel Layer for depth */}
            <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-[1px]" />
         </div>

         {/* Content */}
         <div className="relative z-10 text-center px-6 max-w-4xl">
             <h1 
                className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-4 drop-shadow-xl opacity-0"
                style={{ animation: 'fadeUpSlow 1.5s ease-out forwards', animationDelay: '0.2s' }}
             >
                MathSupport
             </h1>
             <p 
                className="text-2xl md:text-3xl font-light text-emerald-100 tracking-wide opacity-0"
                style={{ animation: 'fadeUpSlow 1.5s ease-out forwards', animationDelay: '0.8s' }}
             >
                Your mathematics assistant
             </p>
         </div>

         {/* Scroll Indicator */}
         <button 
            onClick={scrollToContent} 
            className="absolute bottom-12 flex flex-col items-center z-10 cursor-pointer text-emerald-100 hover:text-white transition-colors opacity-0 animate-[fadeUpSlow_1s_ease-out_forwards]"
            style={{ animationDelay: '2.2s' }}
         >
            <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 opacity-80">Scroll Down</span>
            <ChevronDown size={32} className="animate-bounce" />
         </button>
      </div>

      {/* Start Page Content */}
      <div ref={contentRef} className="h-full w-full flex flex-col items-center snap-start relative bg-[#ddead1]">
        <div className="w-full max-w-sm my-auto py-8 px-6">
            <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-2 tracking-tight">Welcome</h2>
            <p className="text-emerald-900 opacity-70 font-medium">Ready to solve some problems?</p>
            </div>

            <div className="bg-white/40 p-8 rounded-3xl shadow-xl border border-white/50 backdrop-blur-sm mb-8">
            <button
                onClick={() => onAuthSuccess({ name: 'Guest' })}
                className="w-full py-4 bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
                <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform">
                    <Play size={24} fill="currentColor" />
                </div>
                Start Learning
            </button>
            </div>

            <button
                onClick={() => setShowAbout(true)}
                className="w-full py-4 bg-white/40 border border-emerald-600/20 text-emerald-800 font-bold rounded-xl hover:bg-white/60 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
                <Info size={20} />
                About the app
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
