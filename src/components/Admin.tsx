import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // The secret password to unlock the terminal
  const SECRET_CODE = "VOID2026";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === SECRET_CODE) {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      alert("ACCESS DENIED.");
      setPasscode('');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    // Fetch all orders from Supabase, newest first
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Failed to fetch archive:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  // --- SCREEN 1: THE LOCK SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full border border-white/20 p-12 bg-[#050505]">
          <h1 className="font-mono text-white text-2xl tracking-widest mb-2 uppercase">System_Locked</h1>
          <p className="font-mono text-white/40 text-xs mb-8">Enter authorization code to access the Archive.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="bg-transparent border border-white/20 p-4 font-mono text-white text-center tracking-[0.5em] focus:border-white outline-none transition-colors"
              placeholder="••••••••"
              autoFocus
            />
            <button type="submit" className="bg-white text-black font-mono text-xs p-4 uppercase tracking-widest hover:bg-gray-300 transition-colors">
              Initialize
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- SCREEN 2: THE ARCHIVE DASHBOARD ---
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono">
      <div className="max-w-[90rem] mx-auto">
        
        <header className="flex justify-between items-end border-b border-white/20 pb-6 mb-12">
          <div>
            <h1 className="text-3xl tracking-widest uppercase mb-2">Archive Terminal</h1>
            <p className="text-white/40 text-xs">Live database connection established.</p>
          </div>
          <button onClick={fetchOrders} className="text-xs uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors flex items-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : "Refresh Data"}
          </button>
        </header>

        {loading && orders.length === 0 ? (
          <div className="flex justify-center items-center py-24 text-white/50">
            <Loader2 size={32} className="animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-white/10 p-12 text-center text-white/40 text-sm tracking-widest uppercase">
            No records found in the archive.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/20 text-white/50 text-xs uppercase tracking-widest">
                  <th className="p-4 font-normal">Order ID</th>
                  <th className="p-4 font-normal">Date</th>
                  <th className="p-4 font-normal">Client Intel</th>
                  <th className="p-4 font-normal">Items</th>
                  <th className="p-4 font-normal text-right">Total (USD)</th>
                  <th className="p-4 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/10 hover:bg-white/5 transition-colors text-sm">
                    <td className="p-4 text-white/50">{order.id.split('-')[0]}...</td>
                    <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-white">{order.customer_info.firstName} {order.customer_info.lastName}</span>
                        <span className="text-white/50 text-xs">{order.customer_info.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {order.items.map((item: any, i: number) => (
                          <span key={i} className="text-xs text-white/70">
                            1x {item.name} ({item.color})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">${order.total}</td>
                    <td className="p-4 text-right">
                      <span className="bg-white text-black px-2 py-1 text-[10px] uppercase tracking-widest">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}