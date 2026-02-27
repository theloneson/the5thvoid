import { motion } from 'framer-motion';

export default function Marquee() {
  return (
    <div className="w-full py-6 bg-white text-black overflow-hidden flex whitespace-nowrap border-y border-white/20">
      <motion.div 
        className="flex gap-12 font-sans text-sm md:text-base font-bold uppercase tracking-[0.2em]"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
      >
        {/* We repeat the text a few times to make it seamless */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-12">
            <span>Free Worldwide Shipping</span>
            <span className="font-serif italic text-black/50">✦</span>
            <span>Collection 001</span>
            <span className="font-serif italic text-black/50">✦</span>
            <span>The Harmony of Null</span>
            <span className="font-serif italic text-black/50">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}