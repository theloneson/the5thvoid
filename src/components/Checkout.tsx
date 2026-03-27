import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export default function Checkout({ isOpen, onClose, total }: CheckoutProps) {
  // Grab the cart data and the clear function (if you have one, otherwise we handle it below)
  const { cart, clearCart } = useCart() as any; 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: ''
  });

  // Paystack Config (Convert USD to NGN at roughly 1500, then to Kobo by multiplying by 100)
  const EXCHANGE_RATE = 1500; 
  const amountInKobo = total * EXCHANGE_RATE * 100;

  const config = {
    reference: (new Date()).getTime().toString(),
    email: formData.email,
    amount: amountInKobo, 
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_dummy_key',
    currency: 'NGN',
  };

  const initializePayment = usePaystackPayment(config);

  const handleSuccess = async (reference: any) => {
    console.log("Paystack Reference:", reference);
    
    // 1. SHOOT THE ORDER TO SUPABASE
    const { error } = await supabase
      .from('orders')
      .insert([
        {
          customer_info: formData,
          items: cart,
          total: total,
          status: 'paid'
        }
      ]);

    if (error) {
      console.error("Archive Error:", error);
      alert("Payment successful, but failed to log in the Archive.");
    }

    // 2. SHOW SUCCESS SCREEN & CLEAR CART
    setIsSubmitting(false);
    setIsSuccess(true);
    if (clearCart) clearCart();
  };

  const handleClose = () => {
    setIsSubmitting(false);
    console.log('Payment modal closed');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Trigger Paystack popup
    initializePayment({ onSuccess: handleSuccess, onClose: handleClose });
  };

  if (isSuccess) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center text-center p-6">
          <CheckCircle size={80} className="text-white mb-8" strokeWidth={1} />
          <h2 className="font-serif italic text-6xl text-white mb-4">Confirmed.</h2>
          <p className="font-sans text-xs tracking-[0.3em] text-white/50 uppercase mb-12 text-center max-w-md leading-relaxed">
            Your transaction was successful. The archive has been updated.
          </p>
          <button 
            type="button" 
            onClick={() => { 
              setIsSuccess(false); 
              onClose(); 
              window.location.reload(); // Hard refresh to reset the state back to default
            }} 
            className="border border-white/20 px-12 py-4 font-sans text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Return to Archive
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="fixed inset-0 z-[150] bg-[#050505] flex flex-col lg:flex-row overflow-hidden"
        >
          {/* LEFT SIDE - EDITORIAL IMAGE */}
          <div className="hidden lg:block lg:w-1/2 relative h-full bg-[#111]">
            <img 
              src="https://images.unsplash.com/photo-1618506469810-282bef2abdf0?q=80&w=1200" 
              alt="Checkout Editorial" 
              className="w-full h-full object-cover grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-12 left-12">
              <h2 className="font-serif italic text-6xl text-white mb-4">Finalize.</h2>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-white/50">
                The 5th Void / Archive
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - THE FORM */}
          <div className="w-full lg:w-1/2 h-full overflow-y-auto p-8 md:p-16 lg:p-24 bg-[#0a0a0a] flex flex-col relative custom-scrollbar">
            
            <button 
              type="button"
              onClick={onClose}
              className="flex items-center gap-4 font-sans text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors mb-16 lg:mb-24 w-max"
            >
              <ArrowLeft size={16} /> Return to Bag
            </button>

            <div className="max-w-md w-full mx-auto lg:mx-0 flex-1">
              <div className="mb-16">
                <h3 className="font-serif italic text-4xl text-white mb-2">Shipping Intel</h3>
                <p className="font-sans text-xs tracking-widest text-white/40 uppercase">Enter your coordinates.</p>
              </div>
              
              <form onSubmit={onSubmit} className="flex flex-col gap-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="relative group">
                    <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none transition-colors peer placeholder-transparent" id="fname" placeholder="First Name" />
                    <label htmlFor="fname" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">First Name</label>
                  </div>
                  <div className="relative group">
                    <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none transition-colors peer placeholder-transparent" id="lname" placeholder="Last Name" />
                    <label htmlFor="lname" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Last Name</label>
                  </div>
                </div>

                <div className="relative group">
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none transition-colors peer placeholder-transparent" id="email" placeholder="Email Address" />
                  <label htmlFor="email" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Email Address</label>
                </div>

                <div className="relative group">
                  <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none transition-colors peer placeholder-transparent" id="address" placeholder="Shipping Address" />
                  <label htmlFor="address" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Full Address</label>
                </div>

                <div className="mt-8 p-8 bg-[#111] border border-white/5">
                  <div className="flex justify-between font-sans text-xs tracking-widest text-white/50 mb-4">
                    <span>Subtotal</span>
                    <span>${total}</span>
                  </div>
                  <div className="flex justify-between font-sans text-xs tracking-widest text-white/50 mb-6">
                    <span>Est. Naira (x{EXCHANGE_RATE})</span>
                    <span>₦{(total * EXCHANGE_RATE).toLocaleString()}</span>
                  </div>
                  <div className="h-[1px] w-full bg-white/10 mb-6" />
                  <div className="flex justify-between items-end">
                    <span className="font-sans text-xs tracking-widest uppercase text-white/50">Total</span>
                    <span className="font-mono text-2xl text-white">${total}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || total === 0}
                  className="w-full bg-white text-black py-5 font-sans text-xs uppercase tracking-[0.3em] font-bold hover:bg-gray-200 transition-colors mt-4 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Initiate Payment"}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}