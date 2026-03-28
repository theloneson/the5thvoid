import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowRight, Upload, Plus, Trash2 } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  
  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // CMS States
  const [activeTab, setActiveTab] = useState<'ledger' | 'inventory'>('ledger');
  const [isUploading, setIsUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', category: '', color: '', price: '', file: null as File | null });

  const SECRET_CODE = "VOID2026";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === SECRET_CODE) {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert("ACCESS DENIED.");
      setPasscode('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setOrders([]);
    setProducts([]);
    setPasscode('');
  };

  // --- NEW: FETCH BOTH ORDERS AND PRODUCTS ---
  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Orders
    const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (orderData) setOrders(orderData);

    // Fetch Products
    const { data: productData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (productData) setProducts(productData);

    setLoading(false);
  };

  const advanceStatus = async (id: string, currentStatus: string) => {
    let newStatus = 'paid';
    if (currentStatus === 'paid') newStatus = 'shipped';
    else if (currentStatus === 'shipped') newStatus = 'delivered';
    else return; 

    setUpdatingId(id);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);

    if (!error) setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setUpdatingId(null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.file || !newProduct.title || !newProduct.price) return alert("Missing intel.");

    setIsUploading(true);
    try {
      const fileExt = newProduct.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, newProduct.file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('products').insert([{
        title: newProduct.title,
        category: newProduct.category,
        color: newProduct.color,
        price: parseFloat(newProduct.price),
        img_url: publicUrl
      }]);

      if (dbError) throw dbError;

      alert("Asset injected.");
      setNewProduct({ title: '', category: '', color: '', price: '', file: null });
      fetchData(); // Refresh the list instantly

    } catch (error: any) {
      alert("Upload Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- NEW: DELETE PRODUCT LOGIC ---
  const handleDeleteProduct = async (id: string) => {
    const confirmDelete = window.confirm("WARNING: This will permanently purge this asset from the live website. Proceed?");
    if (!confirmDelete) return;

    setUpdatingId(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert("Failed to purge asset.");
    }
    setUpdatingId(null);
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
            <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full bg-transparent border-b border-white/20 py-4 font-sans text-sm text-center text-white tracking-[0.5em] focus:border-white outline-none peer placeholder-transparent" placeholder="Passcode" autoFocus />
            <button type="submit" className="w-full bg-white text-black py-5 font-sans text-[10px] uppercase tracking-[0.3em] hover:bg-gray-200 transition-colors">Unlock Vault</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-noise" />
      <div className="max-w-[90rem] mx-auto relative z-10">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 mb-12 gap-8">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-4">Internal System</span>
            <h1 className="font-serif italic text-5xl md:text-6xl text-white">Operations.</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <button onClick={() => setActiveTab('ledger')} className={`font-sans text-[10px] uppercase tracking-[0.2em] transition-colors pb-1 border-b ${activeTab === 'ledger' ? 'text-white border-white' : 'text-white/40 border-transparent hover:text-white'}`}>The Ledger</button>
            <span className="text-white/20">|</span>
            <button onClick={() => setActiveTab('inventory')} className={`font-sans text-[10px] uppercase tracking-[0.2em] transition-colors pb-1 border-b ${activeTab === 'inventory' ? 'text-white border-white' : 'text-white/40 border-transparent hover:text-white'}`}>Inventory Manager</button>
            <span className="text-white/20 ml-4">|</span>
            <button onClick={handleLogout} className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Lock System</button>
          </div>
        </header>

        {activeTab === 'ledger' ? (
          /* TAB 1: ORDERS */
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
              <div><h2 className="font-serif italic text-3xl mb-2">The Ledger</h2><p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40">Real-time transaction log.</p></div>
              <button onClick={fetchData} className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-2">{loading ? <Loader2 size={12} className="animate-spin" /> : "Sync Data"}</button>
            </div>

            {loading && orders.length === 0 ? (
              <div className="flex justify-center py-32 text-white/50"><Loader2 size={24} className="animate-spin" /></div>
            ) : orders.length === 0 ? (
              <div className="border border-white/10 py-32 text-center text-white/30 font-sans text-[10px] tracking-[0.3em] uppercase">No records found.</div>
            ) : (
              <div className="overflow-x-auto border border-white/10 bg-[#0a0a0a]">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead><tr className="border-b border-white/10 text-white/30 font-sans text-[10px] uppercase tracking-[0.3em]"><th className="p-6">ID</th><th className="p-6">Date</th><th className="p-6">Client Intel</th><th className="p-6">Manifest</th><th className="p-6 text-right">Total</th><th className="p-6 text-right">Status</th></tr></thead>
                  <tbody className="font-sans">
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-[#111] transition-colors group">
                        <td className="p-6 text-white/30 text-xs tracking-widest">{order.id.split('-')[0]}</td>
                        <td className="p-6 text-white/50 text-xs tracking-widest">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-6"><div className="flex flex-col gap-1"><span className="text-white text-sm tracking-wider">{order.customer_info.firstName} {order.customer_info.lastName}</span><span className="text-white/40 text-[10px]">{order.customer_info.email}</span></div></td>
                        <td className="p-6"><div className="flex flex-col gap-3">{order.items.map((item: any, i: number) => (<div key={i} className="flex flex-col"><span className="text-white/80 text-xs">{item.name}</span><span className="text-white/30 text-[10px] italic">{item.color}</span></div>))}</div></td>
                        <td className="p-6 text-right font-serif italic text-xl">${order.total}</td>
                        <td className="p-6 text-right"><div className="flex flex-col items-end gap-3"><span className={`px-4 py-2 text-[9px] uppercase tracking-[0.3em] border ${order.status === 'paid' ? 'border-white/20 text-white/70' : order.status === 'shipped' ? 'bg-white/10 border-white/40 text-white' : 'bg-white border-white text-black font-bold'}`}>{order.status}</span>{order.status !== 'delivered' && <button onClick={() => advanceStatus(order.id, order.status)} disabled={updatingId === order.id} className="text-[9px] uppercase tracking-[0.2em] text-white/30 hover:text-white flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100">{updatingId === order.id ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />} Advance to {order.status === 'paid' ? 'Shipped' : 'Delivered'}</button>}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          /* TAB 2: INVENTORY MANAGER */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* UPLOAD FORM */}
            <div>
              <div className="mb-12">
                <h2 className="font-serif italic text-4xl mb-2">Inject Asset</h2>
                <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40">Add new product to the matrix.</p>
              </div>

              <form onSubmit={handleAddProduct} className="flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="relative group"><input type="text" required value={newProduct.title} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none peer placeholder-transparent" id="title" placeholder="Name" /><label htmlFor="title" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Product Name</label></div>
                  <div className="relative group"><input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none peer placeholder-transparent" id="price" placeholder="Price" /><label htmlFor="price" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Price (USD)</label></div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="relative group"><input type="text" required value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none peer placeholder-transparent" id="cat" placeholder="Category" /><label htmlFor="cat" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Category</label></div>
                  <div className="relative group"><input type="text" required value={newProduct.color} onChange={(e) => setNewProduct({...newProduct, color: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 font-sans text-sm text-white focus:border-white outline-none peer placeholder-transparent" id="col" placeholder="Color" /><label htmlFor="col" className="absolute left-0 -top-3.5 text-[10px] font-sans tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-white">Colorway</label></div>
                </div>
                
                <div className="mt-2">
                  <label className="border border-dashed border-white/20 hover:border-white/60 transition-colors p-8 flex flex-col items-center justify-center cursor-pointer bg-[#0a0a0a]">
                    {newProduct.file ? (
                      <div className="text-center"><p className="font-sans text-sm text-white tracking-widest">{newProduct.file.name}</p></div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-white/40 hover:text-white"><Upload size={20} strokeWidth={1} /><span className="font-sans text-[10px] tracking-[0.2em] uppercase">Select Image</span></div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setNewProduct({...newProduct, file: e.target.files[0]})} />
                  </label>
                </div>

                <button type="submit" disabled={isUploading} className="w-full bg-white text-black py-5 font-sans text-[10px] uppercase tracking-[0.3em] hover:bg-gray-200 transition-colors flex justify-center items-center gap-3 disabled:opacity-50">
                  {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />} {isUploading ? "Injecting..." : "Inject into Database"}
                </button>
              </form>
            </div>

            {/* LIVE INVENTORY LEDGER */}
            <div className="border-l border-white/10 pl-0 lg:pl-16 pt-16 lg:pt-0">
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="font-serif italic text-2xl mb-2">Live Assets</h2>
                  <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40">Manage global inventory.</p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12 text-white/50"><Loader2 size={16} className="animate-spin" /></div>
              ) : products.length === 0 ? (
                <div className="border border-white/10 py-16 text-center text-white/30 font-sans text-[10px] tracking-[0.3em] uppercase bg-[#0a0a0a]">Vault is empty.</div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                  {products.map((product) => (
                    <div key={product.id} className="group border border-white/10 bg-[#0a0a0a] p-4 flex items-center justify-between hover:border-white/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-[#111] overflow-hidden">
                          <img src={product.img_url} alt={product.title} className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-sans text-xs text-white/90 tracking-widest">{product.title}</span>
                          <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/40">{product.category} • {product.color}</span>
                          <span className="font-serif italic text-sm mt-1">${product.price}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={updatingId === product.id}
                        className="p-3 text-red-900 hover:text-red-500 hover:bg-red-900/10 transition-colors disabled:opacity-50"
                        title="Purge Asset"
                      >
                        {updatingId === product.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={1.5} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}