import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext'; // <-- Import Cart hook

const collections = [
  { 
    id: 'c1', 
    title: 'The Heavyweight Series', 
    category: 'Outerwear & Knits',
    variants: '06 Styles', 
    img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop',
    items: [
      { name: "Oversized Null Hoodie", color: "Onyx Black", price: "$180", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600" },
      { name: "Oversized Null Hoodie", color: "Ash Gray", price: "$180", img: "https://images.unsplash.com/photo-1556821835-51dc58fa3910?q=80&w=600" },
      { name: "Structured Zip-Up", color: "Faded Bone", price: "$210", img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600" }
    ]
  },
  { 
    id: 'c2', 
    title: 'Null Essentials', 
    category: 'Base Layers',
    variants: '04 Colors', 
    img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop',
    items: [
      { name: "Abyss Tee", color: "Pitch Black", price: "$90", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600" },
      { name: "Abyss Tee", color: "Chalk White", price: "$90", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600" }
    ]
  },
  { id: 'c3', title: 'Void Architecture', category: 'Bottoms & Cargo', variants: '03 Styles', img: 'https://images.unsplash.com/photo-1628714399342-a8c7df0e0176?q=80&w=1200&auto=format&fit=crop', items: [] },
  { id: 'c4', title: 'Hardware & Objects', category: 'Accessories', variants: '08 Pieces', img: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1200&auto=format&fit=crop', items: [] },
];

export default function Collections() {
  const [activeVault, setActiveVault] = useState<typeof collections[0] | null>(null);
  const { addToCart } = useCart(); // <-- Grab the function

  useEffect(() => {
    if (activeVault) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeVault]);

  return (
    <section className="bg-[#050505] min-h-screen px-6 md:px-12 py-32 relative">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-noise" />
      <div className="max-w-[90rem] mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 pb-8 border-b border-white/10 gap-4">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.3em] text-white/50 block mb-4">Discover</span>
            <h2 className="font-serif italic text-5xl md:text-7xl text-white">Campaigns</h2>
          </div>
          <p className="font-sans text-sm text-white/50 max-w-xs md:text-right uppercase tracking-widest leading-relaxed">
            Select a silhouette to view available colorways and variants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-32 gap-x-16 lg:gap-x-32">
          {collections.map((collection, i) => (
            <motion.div 
              key={collection.id}
              onClick={() => setActiveVault(collection)}
              className={`group cursor-pointer flex flex-col ${i % 2 !== 0 ? 'md:mt-48' : ''}`}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="relative overflow-hidden aspect-[4/5] mb-8 bg-[#111]">
                <img 
                  src={collection.img} 
                  alt={collection.title}
                  className="w-full h-full object-cover md:grayscale contrast-125 transition-transform duration-[1.5s] ease-out group-hover:scale-105 md:group-hover:grayscale-0"
                />
                <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 items-center justify-center backdrop-blur-sm">
                  <span className="font-sans text-sm tracking-[0.3em] uppercase text-white border border-white/30 px-8 py-4 backdrop-blur-md">
                    Explore Vault
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 md:hidden bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans text-[10px] uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2">
                  Tap to Explore <span className="text-white/50">↗</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-2">{collection.category}</span>
                    <h3 className="font-serif text-3xl md:text-4xl italic text-white/90 group-hover:text-white transition-colors">{collection.title}</h3>
                  </div>
                  <span className="font-mono text-xs text-black bg-white px-3 py-1 rounded-full mt-6">[{collection.variants}]</span>
                </div>
                <div className="h-[1px] w-full bg-white/10 mt-4 group-hover:bg-white/40 transition-colors duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeVault && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVault(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] cursor-pointer"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-[600px] h-screen bg-[#0a0a0a] z-[70] border-l border-white/10 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-8 border-b border-white/10">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-1">Vault Open</span>
                  <h3 className="font-serif italic text-3xl text-white">{activeVault.title}</h3>
                </div>
                <button aria-label="Close Vault" onClick={() => setActiveVault(null)} className="p-2 hover:rotate-90 transition-transform duration-300">
                  <X size={28} className="text-white/70 hover:text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeVault.items && activeVault.items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeVault.items.map((item, idx) => (
                      <div key={idx} className="group cursor-pointer flex flex-col">
                        <div className="aspect-[3/4] bg-[#111] overflow-hidden mb-4 relative">
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover md:grayscale contrast-125 transition-all duration-500 group-hover:scale-110 md:group-hover:grayscale-0" />
                          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                             
                             {/* FIX: Connected the addToCart button here */}
                             <button 
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevents clicking the image by accident
                                  addToCart({ name: item.name, color: item.color, price: item.price, img: item.img });
                                }}
                                className="w-full bg-white text-black py-3 md:py-2 font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors"
                             >
                               Add to Bag
                             </button>

                          </div>
                        </div>
                        <h4 className="font-sans text-sm tracking-wider text-white/90">{item.name}</h4>
                        <span className="font-serif italic text-xs text-white/50">{item.color}</span>
                        <span className="font-mono text-sm mt-2">{item.price}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/30 font-sans text-sm uppercase tracking-widest">
                    <p>Archived. No items available.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}