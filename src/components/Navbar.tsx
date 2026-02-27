import { ShoppingBag, Search, Menu, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cart, cartCount, isCartOpen, setIsCartOpen, removeFromCart } = useCart();

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const priceNum = parseFloat(item.price.replace('$', ''));
      return total + (priceNum * item.quantity);
    }, 0);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 md:px-12 py-8 mix-blend-difference text-white">
        <button type="button" aria-label="Open Menu" className="hover:opacity-50 transition-opacity">
          <Menu size={24} strokeWidth={1.5} />
        </button>

        {/* Updated Brand Name Here */}
        <div className="absolute left-1/2 -translate-x-1/2 font-sans font-bold text-lg md:text-xl tracking-[0.3em] cursor-pointer whitespace-nowrap">
          THE 5TH VØID
        </div>

        <div className="flex gap-6">
          <button type="button" aria-label="Search" className="hover:opacity-50 transition-opacity">
            <Search size={24} strokeWidth={1.5} />
          </button>
          <button 
            type="button" 
            aria-label="View Cart" 
            onClick={() => setIsCartOpen(true)}
            className="hover:opacity-50 transition-opacity flex items-center gap-2"
          >
            <ShoppingBag size={24} strokeWidth={1.5} />
            <span className="text-xs font-mono hidden md:block">[{cartCount}]</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] cursor-pointer"
            />

            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-[450px] h-screen bg-[#0a0a0a] z-[90] border-l border-white/10 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-8 border-b border-white/10">
                <h3 className="font-serif italic text-3xl text-white">Your Bag</h3>
                <button type="button" aria-label="Close Cart" onClick={() => setIsCartOpen(false)} className="p-2 hover:rotate-90 transition-transform duration-300">
                  <X size={28} className="text-white/70 hover:text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/30 font-sans text-sm uppercase tracking-widest gap-4">
                    <ShoppingBag size={48} strokeWidth={1} />
                    <p>Your bag is empty.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-24 h-32 bg-[#111] overflow-hidden flex-shrink-0">
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover grayscale" />
                        </div>
                        <div className="flex flex-col flex-1 justify-center">
                          <div className="flex justify-between items-start">
                            <h4 className="font-sans text-sm tracking-wider text-white/90">{item.name}</h4>
                            <button type="button" onClick={() => removeFromCart(item.id)} className="text-white/30 hover:text-white transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <span className="font-serif italic text-xs text-white/50">{item.color}</span>
                          <div className="flex justify-between items-center mt-4">
                            <span className="font-sans text-[10px] text-white/50 uppercase tracking-widest">Qty: {item.quantity}</span>
                            <span className="font-mono text-sm">{item.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 border-t border-white/10 bg-[#050505]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-sans text-xs uppercase tracking-widest text-white/50">Subtotal</span>
                    <span className="font-mono text-lg">${calculateTotal()}</span>
                  </div>
                  <button type="button" className="w-full bg-white text-black py-4 font-sans text-xs uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors">
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}