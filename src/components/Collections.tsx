import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase'; 

export default function Collections() {
  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVault, setActiveVault] = useState<any | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Failed to fetch inventory:", error);
        setLoading(false);
        return;
      }

      // 1. THE NEW SORTING ALGORITHM (Fixes Duplicates & Sets Covers)
      const groupedData = data.reduce((acc: any, curr: any) => {
        // This strips accidental spaces and makes it uppercase so "Eyewear", "eyewear", and " eyewear " all group together
        const normalizedCat = curr.category.trim().toUpperCase(); 
        const displayCat = curr.category.trim(); // Keeps the nice casing for the UI

        if (!acc[normalizedCat]) {
          acc[normalizedCat] = {
            id: normalizedCat,
            category: displayCat,
            title: displayCat, 
            items: [],
            img: curr.img_url // Default to the first item if no cover is selected yet
          };
        }

        // IF THIS ITEM IS MARKED AS THE COVER, OVERWRITE THE VAULT IMAGE
        if (curr.is_cover) {
          acc[normalizedCat].img = curr.img_url;
        }
        
        acc[normalizedCat].items.push({
          name: curr.title,
          color: curr.color,
          price: `$${curr.price}`, 
          img: curr.img_url
        });
        
        return acc;
      }, {});

      const dynamicVaults = Object.values(groupedData).map((vault: any) => {
        const itemCount = vault.items.length;
        return { ...vault, variants: `${itemCount < 10 ? '0' : ''}${itemCount} Styles` };
      });

      const EDITORIAL_OVERRIDES: any = {
        'OUTERWEAR & KNITS': { title: 'The Heavyweight Series' },
        'BASE LAYERS': { title: 'Null Essentials' },
        'WOMENSWEAR': { title: 'Cropped Silhouettes' },
        'BOTTOMS & CARGO': { title: 'Void Architecture' },
        'ACCESSORIES': { title: 'Hardware & Objects' }
      };

      const finalVaults = dynamicVaults.map(v => ({
        ...v,
        // Check if we have a cool editorial title for it, otherwise just use the category name
        title: EDITORIAL_OVERRIDES[v.id]?.title || v.category,
      }));

      setVaults(finalVaults);
      setLoading(false);
    };

    fetchInventory();
  }, []);

  useEffect(() => {
    if (activeVault || zoomImage) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeVault, zoomImage]);

  return (
    <section className="bg-[#050505] min-h-screen px-6 md:px-12 py-20 md:py-32 relative">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-noise" />
      <div className="max-w-[90rem] mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 pb-8 border-b border-white/10 gap-4">
          <div>
            <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/50 block mb-4">Discover</span>
            <h2 className="font-serif italic text-4xl md:text-7xl text-white">Campaigns</h2>
          </div>
          <p className="font-sans text-[10px] md:text-sm text-white/50 max-w-xs md:text-right uppercase tracking-widest leading-relaxed">
            Select a silhouette to view available colorways and variants.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-white/30 gap-6">
            <Loader2 size={32} className="animate-spin" />
            <span className="font-sans text-[10px] uppercase tracking-[0.3em]">Syncing Global Inventory...</span>
          </div>
        ) : vaults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-white/30 border border-white/10 bg-[#0a0a0a]">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em]">Vaults Empty. Inject inventory via Admin Terminal.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-20 md:gap-y-32 gap-x-16 lg:gap-x-32">
            {vaults.map((collection, i) => (
              <motion.div 
                key={collection.id}
                onClick={() => setActiveVault(collection)}
                className={`group cursor-pointer flex flex-col ${i % 2 !== 0 ? 'md:mt-48' : ''}`}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="relative overflow-hidden aspect-[4/5] mb-6 md:mb-8 bg-[#111]">
                  <img src={collection.img} alt={collection.title} className="w-full h-full object-cover md:grayscale contrast-125 transition-transform duration-[1.5s] ease-out group-hover:scale-105 md:group-hover:grayscale-0" />
                  <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 items-center justify-center backdrop-blur-sm">
                    <span className="font-sans text-sm tracking-[0.3em] uppercase text-white border border-white/30 px-8 py-4 backdrop-blur-md">Explore Vault</span>
                  </div>
                  <div className="absolute bottom-4 right-4 md:hidden bg-black/60 backdrop-blur-md border border-white/20 text-white font-sans text-[10px] uppercase tracking-widest px-4 py-2 flex items-center gap-2">
                    Explore <span className="text-white/50">↗</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-2">{collection.category}</span>
                      <h3 className="font-serif text-2xl md:text-4xl italic text-white/90 group-hover:text-white transition-colors">{collection.title}</h3>
                    </div>
                    <span className="font-mono text-[10px] md:text-xs text-black bg-white px-3 py-1 rounded-full mt-4 md:mt-6">[{collection.variants}]</span>
                  </div>
                  <div className="h-[1px] w-full bg-white/10 mt-4 group-hover:bg-white/40 transition-colors duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeVault && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveVault(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] cursor-pointer" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 w-full md:w-[600px] h-screen bg-[#0a0a0a] z-[70] border-l border-white/10 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/10">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-1">Vault Open</span>
                  <h3 className="font-serif italic text-2xl md:text-3xl text-white">{activeVault.title}</h3>
                </div>
                <button type="button" aria-label="Close Vault" onClick={() => setActiveVault(null)} className="p-2 hover:rotate-90 transition-transform duration-300">
                  <X size={24} className="text-white/70 hover:text-white md:w-7 md:h-7" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
                {activeVault.items && activeVault.items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-6">
                    {activeVault.items.map((item: any, idx: number) => (
                      <div key={idx} className="group cursor-pointer flex flex-col">
                        <div className="aspect-[3/4] bg-[#111] overflow-hidden mb-4 relative">
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover md:grayscale contrast-125 transition-all duration-500 md:group-hover:scale-110 md:group-hover:grayscale-0" />
                          <button type="button" onClick={(e) => { e.stopPropagation(); setZoomImage(item.img); }} className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                            <Maximize2 size={14} className="text-white" />
                          </button>
                          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 z-10">
                             <button type="button" onClick={(e) => { e.stopPropagation(); addToCart({ name: item.name, color: item.color, price: item.price, img: item.img }); }} className="w-full bg-white text-black py-3 md:py-2 font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors shadow-xl">
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
                  <div className="h-full flex flex-col items-center justify-center text-white/30 font-sans text-xs md:text-sm uppercase tracking-widest">
                    <p>Archived. No items available.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out" onClick={() => setZoomImage(null)}>
            <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={zoomImage} className="max-h-full max-w-full object-contain shadow-2xl" />
            <button type="button" className="absolute top-6 right-6 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors p-2 bg-black/50 rounded-full md:bg-transparent" onClick={(e) => { e.stopPropagation(); setZoomImage(null); }}>
              <X size={24} className="md:w-10 md:h-10" strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}