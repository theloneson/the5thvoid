import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowRight, Upload, Plus } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // --- NEW: CMS STATE ---
  const [activeTab, setActiveTab] = useState<'ledger' | 'inventory'>('ledger');
  const [isUploading, setIsUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: '',
    color: '',
    price: '',
    file: null as File | null
  });

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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setOrders([]);
    setPasscode('');
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Failed to fetch archive:", error);
    else setOrders(data || []);
    setLoading(false);
  };

  const advanceStatus = async (id: string, currentStatus: string) => {
    let newStatus = 'paid';
    if (currentStatus === 'paid') newStatus = 'shipped';
    else if (currentStatus === 'shipped') newStatus = 'delivered';
    else return; 

    setUpdatingId(id);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);

    if (!error) {
      setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
    } else {
      alert("Failed to update status.");
    }
    setUpdatingId(null);
  };

  // --- NEW: UPLOAD PRODUCT LOGIC ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.file || !newProduct.title || !newProduct.price) {
      alert("Please fill all required fields and select an image.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Create a unique file name
      const fileExt = newProduct.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // 2. Upload the image to the 'product-images' bucket
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, newProduct.file);

      if (uploadError) throw uploadError;

      // 3. Get the public URL for the image
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // 4. Save the product details to the database
      const { error: dbError } = await supabase
        .from('products')
        .insert([{
          title: newProduct.title,
          category: newProduct.category,
          color: newProduct.color,
          price: parseFloat(newProduct.price),
          img_url: publicUrl
        }]);

      if (dbError) throw dbError;

      alert("Asset successfully injected into the Vault.");
      
      // Reset form
      setNewProduct({ title: '', category: '', color: '', price: '', file: null });

    } catch (error: any) {
      console.error("Upload Error:", error);
      alert("Failed to upload: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = orders.length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-noise" />
        <div className="relative z-10 max-w-sm w-full flex flex-col items-center text-center">
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/40 mb-6">Restricted Access</span>
          <h1 className="font-serif italic text-6xl text-white mb-16">Archive.</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-8 w-full">
            <div className="relative group w-full">
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full bg-transparent border-b border-white/20 py-4 font-sans text-sm text-center text-white tracking-[0.5em] focus:border-white outline-none transition-colors peer placeholder-transparent" id="passcode" placeholder="Passcode" autoFocus />
            </div>
            <button type="submit" className="w-full bg-white text-black py-5 font-sans text-[10px] uppercase tracking-[0.3em] hover:bg-gray-200 transition-colors">
              Unlock Vault
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-noise" />
      <div className="max-w-[90rem] mx-auto relative z-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 mb-12 gap-8">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-4">Internal System</span>
            <h1 className="font-serif italic text-5xl md:text-6xl text-white">Operations.</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* TAB CONTROLS */}
            <button onClick={() => setActiveTab('ledger')} className={`font-sans text-[10px] uppercase tracking-[0.2em] transition-colors pb-1 border-b ${activeTab === 'ledger' ? 'text-white border-white' : 'text-white/40 border-transparent hover:text-white'}`}>
              The Ledger
            </button>
            <span className="text-white/20">|</span>
            <button onClick={() => setActiveTab('inventory')} className={`font-sans text-[10px] uppercase tracking-[0.2em] transition-colors pb-1 border-b ${activeTab === 'inventory' ? 'text-white border-white' : 'text-white/40 border-transparent hover:text-white'}`}>
              Inventory Manager
            </button>
            <span className="text-white/20 ml-4">|</span>
            <button onClick={handleLogout} className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">
              Lock System
            </button>
          </div>
        </header>

        {activeTab === 'ledger' ? (
          /* --- TAB 1: THE LEDGER (ORDERS) --- */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 mb-16">
              <div className="bg-[#050505] p-10 md:p-16 flex flex-col justify-center">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6 block">Gross Volume</span>
                <span className="font-serif italic text-6xl md:text-8xl">${totalRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-[#050505] p-10 md:p-16 flex flex-col justify-center">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6 block">Total Dispatches</span>
                <span className="font-serif italic text-6xl md:text-8xl">{totalOrders}</span>
              </div>
            </div>

            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="font-serif italic text-3xl mb-2">The Ledger</h2>
                <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40">Real-time transaction log.</p>
              </div>
              <button onClick={fetchOrders} className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-2">
                {loading ? <Loader2 size={12} className="animate-spin" /> : "Sync Data"}
              </button>
            </div>

            {loading && orders.length === 0 ? (
              <div className="flex justify-center items-center py-32 text-white/50">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-white/10 py-32 text-center text-white/30 font-sans text-[10px] tracking-[0.3em] uppercase">
                No records found.
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar border border-white/10 bg-[#0a0a0a]">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/10 text-white/30 font-sans text-[10px] uppercase tracking-[0.3em]">
                      <th className="p-6 md:p-8 font-normal">ID</th>
                      <th className="p-6 md:p-8 font-normal">Date</th>
                      <th className="p-6 md:p-8 font-normal">Client Intel</th>
                      <th className="p-6 md:p-8 font-normal">Manifest</th>
                      <th className="p-6 md:p-8 font-normal text-right">Total</th>
                      <th className="p-6 md:p-8 font-normal text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-sans">
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-[#111] transition-colors group">
                        <td className="p-6 md:p-8 text-white/30 text-xs tracking-widest">{order.id.split('-')[0]}</td>
                        <td className="p-6 md:p-8 text-white/50 text-xs tracking-widest">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-6 md:p-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-white text-sm tracking-wider">{order.customer_info.firstName} {order.customer_info.lastName}</span>
                            <span className="text-white/40 text-[10px] tracking-widest">{order.customer_info.email}</span>
                            <span className="text-white/30 text-[10px] tracking-widest mt-1 capitalize">{order.customer_info.address}</span>
                          </div>
                        </td>
                        <td className="p-6 md:p-8">
                          <div className="flex flex-col gap-3">
                            {order.items.map((item: any, i: number) => (
                              <div key={i} className="flex flex-col">
                                <span className="text-white/80 text-xs tracking-wider">{item.name}</span>
                                <span className="text-white/30 text-[10px] tracking-widest italic">{item.color}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-6 md:p-8 text-right font-serif italic text-xl">${order.total}</td>
                        <td className="p-6 md:p-8 text-right">
                          <div className="flex flex-col items-end gap-3">
                            <span className={`px-4 py-2 text-[9px] uppercase tracking-[0.3em] border ${
                              order.status === 'paid' ? 'bg-transparent border-white/20 text-white/70' : 
                              order.status === 'shipped' ? 'bg-white/10 border-white/40 text-white' : 
                              'bg-white border-white text-black font-bold'
                            }`}>
                              {order.status}
                            </span>
                            {order.status !== 'delivered' && (
                              <button onClick={() => advanceStatus(order.id, order.status)} disabled={updatingId === order.id} className="text-[9px] uppercase tracking-[0.2em] text-white/30 hover:text-white flex items-center gap-2 transition-colors mt-2 disabled:opacity-50 opacity-0 group-hover:opacity-100">
                                {updatingId === order.id ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                                Advance to {order.status === 'paid' ? 'Shipped' : 'Delivered'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          /* --- TAB 2: INVENTORY MANAGER (CMS) --- */
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h2 className="font-serif italic text-4xl mb-2">New Silhouette</h2>
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40">Inject a new product into the database.</p>
            </div>

            <form onSubmit={handleAddProduct} className="flex flex-col gap-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative group">
                  <input type="text" required value={newProduct.title} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none transition-colors peer placeholder-transparent" id="title" placeholder="Product Name" />
                  <label htmlFor="title" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Product Name</label>
                </div>
                
                <div className="relative group">
                  <input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none transition-colors peer placeholder-transparent" id="price" placeholder="Price (USD)" />
                  <label htmlFor="price" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Price (USD)</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative group">
                  <input type="text" required value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none transition-colors peer placeholder-transparent" id="category" placeholder="Category (e.g., Womenswear)" />
                  <label htmlFor="category" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Category</label>
                </div>

                <div className="relative group">
                  <input type="text" required value={newProduct.color} onChange={(e) => setNewProduct({...newProduct, color: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none transition-colors peer placeholder-transparent" id="color" placeholder="Colorway (e.g., Onyx Black)" />
                  <label htmlFor="color" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Colorway</label>
                </div>
              </div>

              {/* IMAGE UPLOAD FIELD */}
              <div className="mt-4">
                <span className="font-sans text-[10px] tracking-widest uppercase text-white/40 block mb-4">Product Asset</span>
                <label className="border border-dashed border-white/20 hover:border-white/60 transition-colors p-12 flex flex-col items-center justify-center cursor-pointer bg-[#0a0a0a]">
                  {newProduct.file ? (
                    <div className="text-center">
                      <p className="font-sans text-sm text-white tracking-widest">{newProduct.file.name}</p>
                      <p className="font-sans text-[10px] text-white/40 mt-2 uppercase tracking-[0.2em]">Ready for upload</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-white/40 hover:text-white transition-colors">
                      <Upload size={24} strokeWidth={1} />
                      <span className="font-sans text-xs tracking-[0.2em] uppercase">Select Image File</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewProduct({...newProduct, file: e.target.files[0]});
                      }
                    }} 
                  />
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-white text-black py-6 font-sans text-xs uppercase tracking-[0.3em] hover:bg-gray-200 transition-colors mt-8 flex justify-center items-center gap-3 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                {isUploading ? "Injecting Asset..." : "Inject into Database"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}