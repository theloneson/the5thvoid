import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, Twitter } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { 
    name: "New Arrivals", 
    count: "12", 
    image: "https://images.unsplash.com/photo-1552160793-ac2e8c692794?q=80&w=1200" 
  },
  { 
    name: "The Collection", 
    count: "04", 
    image: "https://images.unsplash.com/photo-1618506469810-282bef2abdf0?q=80&w=1200" 
  },
  { 
    name: "Archive", 
    count: "28", 
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200" 
  },
  { 
    name: "Information", 
    count: "", 
    image: "https://images.unsplash.com/photo-1628714399342-a8c7df0e0176?q=80&w=1200" 
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] cursor-pointer"
          />

          {/* Sidebar Panel */}
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed top-0 left-0 w-full md:w-[550px] h-screen bg-[#050505] z-[100] border-r border-white/10 p-8 md:p-12 flex flex-col overflow-hidden"
          >
            {/* GHOST BACKGROUND IMAGES */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <AnimatePresence mode="wait">
                {hoveredLink && (
                  <motion.div
                    key={hoveredLink}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 0.15, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full h-full"
                  >
                    <img 
                      src={navLinks.find(l => l.name === hoveredLink)?.image} 
                      alt="" 
                      className="w-full h-full object-cover grayscale contrast-150"
                    />
                    {/* Noise overlay specific to the image to keep it gritty */}
                    <div className="absolute inset-0 bg-noise opacity-20" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CONTENT START */}
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-24">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40">The 5th Void — Menu</span>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="hover:rotate-90 transition-transform duration-300"
                  aria-label="Close Menu"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex flex-col gap-6 md:gap-8 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div 
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * i + 0.3 }}
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="group flex items-end gap-4 cursor-pointer w-max"
                  >
                    <h3 className="font-serif italic text-4xl md:text-7xl text-white/60 group-hover:text-white transition-all duration-500 transform group-hover:translate-x-4">
                      {link.name}
                    </h3>
                    {link.count && (
                      <span className="font-mono text-[10px] md:text-xs text-white/20 mb-4 md:mb-6">
                        [{link.count}]
                      </span>
                    )}
                  </motion.div>
                ))}
              </nav>

              <div className="flex justify-between items-center pt-12 border-t border-white/10 mt-auto">
                <div className="flex gap-8">
                  <a href="#" className="font-sans text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">Instagram</a>
                  <a href="#" className="font-sans text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">Twitter</a>
                </div>
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/20">
                  Lagos / HQ
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}