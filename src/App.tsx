import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReactLenis } from 'lenis/react'; 
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Collections from './components/Collections';
import Cursor from './components/Cursor'; 
import Admin from './components/Admin'; // <-- Import the new Admin room
import { CartProvider } from './context/CartContext';

// 1. We group the entire storefront into one piece
const Storefront = () => (
  <>
    <Navbar />
    <Hero />
    <Marquee />
    <Collections /> 
    
    <footer className="py-24 border-t border-white/10 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-noise" />
      <h2 className="font-serif italic text-4xl text-white/50 relative z-10">The 5th Void</h2>
      <p className="font-sans text-xs text-white/30 tracking-[0.3em] uppercase relative z-10">
        © 2026. Designed in the Shadows.
      </p>
    </footer>
  </>
);

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
      <CartProvider>
        {/* 2. The Router handles the doors */}
        <Router>
          <main className="bg-[#050505] text-white selection:bg-white selection:text-black min-h-screen">
            <Cursor />
            
            <Routes>
              {/* DOOR 1: The Main Store */}
              <Route path="/" element={<Storefront />} />
              
              {/* DOOR 2: The Secret Back Room */}
              <Route path="/archive-sys" element={<Admin />} />
            </Routes>
            
          </main>
        </Router>
      </CartProvider>
    </ReactLenis>
  );
}

export default App;