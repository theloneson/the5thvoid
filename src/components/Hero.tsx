import { motion } from 'framer-motion';
import voidBg from '../assets/void-bg.png'; 

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen bg-black flex flex-col md:flex-row pt-32 px-6 md:px-12 pb-12 overflow-hidden">
      
      {/* Left Column: The Editorial Typography */}
      <div className="w-full md:w-1/2 flex flex-col justify-center pr-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-white/50 mb-6 block">
            Autumn / Winter 2026
          </span>
          
          {/* The Font Mix */}
          <h1 className="font-sans text-6xl md:text-8xl font-bold tracking-tighter leading-none">
            THE
          </h1>
          <h1 className="font-serif text-6xl md:text-[9rem] italic text-white/90 leading-none mb-4 md:-ml-4">
            Harmony
          </h1>
          <h1 className="font-sans text-6xl md:text-8xl font-bold tracking-tighter leading-none border-text">
            OF NULL.
          </h1>

          <p className="font-sans text-sm md:text-base text-white/60 max-w-sm mt-12 leading-relaxed">
            Redefining the boundaries of form and function. A brutalist approach to modern luxury, crafted in the shadows.
          </p>

          <button className="mt-12 group flex items-center gap-4 font-sans text-xs uppercase tracking-[0.2em]">
            <span className="border-b border-white pb-1 group-hover:text-white/50 group-hover:border-white/50 transition-colors">
              Explore Collection
            </span>
            <span className="w-8 h-[1px] bg-white group-hover:w-12 transition-all duration-300" />
          </button>
        </motion.div>
      </div>

      {/* Right Column: The Image "Frame" */}
      <div className="w-full md:w-1/2 mt-16 md:mt-0 flex items-center justify-end z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          className="relative w-full max-w-md aspect-[3/4] overflow-hidden bg-white/5"
        >
          <img 
            src={voidBg} 
            alt="Editorial Campaign" 
            className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 hover:scale-105 transition-all duration-700"
          />
        </motion.div>
      </div>

      {/* Minimalist Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-serif italic text-white/[0.02] pointer-events-none select-none z-0">
        V
      </div>
    </section>
  );
}