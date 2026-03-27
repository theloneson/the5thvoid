import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export default function Checkout({ isOpen, onClose, total }: CheckoutProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 35, stiffness: 250 }}
          className="fixed inset-0 z-[110] bg-[#050505] p-6 md:p-12 flex flex-col"
        >
          <button 
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white mb-12"
          >
            <ArrowLeft size={16} /> Return to Bag
          </button>

          <div className="max-w-2xl mx-auto w-full">
            <h2 className="font-serif italic text-5xl text-white mb-12 text-center">Checkout</h2>
            
            <form className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input type="text" placeholder="FIRST NAME" className="bg-transparent border-b border-white/20 py-4 font-sans text-xs tracking-widest focus:border-white outline-none transition-colors" />
                <input type="text" placeholder="LAST NAME" className="bg-transparent border-b border-white/20 py-4 font-sans text-xs tracking-widest focus:border-white outline-none transition-colors" />
              </div>
              <input type="email" placeholder="EMAIL ADDRESS" className="bg-transparent border-b border-white/20 py-4 font-sans text-xs tracking-widest focus:border-white outline-none transition-colors" />
              <input type="text" placeholder="SHIPPING ADDRESS" className="bg-transparent border-b border-white/20 py-4 font-sans text-xs tracking-widest focus:border-white outline-none transition-colors" />
              
              <div className="mt-12 p-8 bg-white/5 border border-white/10 flex flex-col gap-4">
                 <div className="flex justify-between font-sans text-xs tracking-widest text-white/50">
                    <span>Subtotal</span>
                    <span>${total}</span>
                 </div>
                 <div className="flex justify-between font-sans text-xs tracking-widest text-white/50">
                    <span>Shipping</span>
                    <span className="text-white">FREE</span>
                 </div>
                 <div className="h-[1px] bg-white/10 my-2" />
                 <div className="flex justify-between font-mono text-xl">
                    <span>Total</span>
                    <span>${total}</span>
                 </div>
              </div>

              <button type="button" className="w-full bg-white text-black py-6 font-sans text-xs uppercase tracking-[0.3em] font-bold hover:bg-gray-200 transition-colors mt-8">
                Complete Order
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}