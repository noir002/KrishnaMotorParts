import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/common/ToastContainer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Import pages
import Home from './pages/Home';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Import admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import Analytics from './pages/admin/Analytics';

// NOTE: Ensure you have the Material Symbols link in your public/index.html head:
// <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); 

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
          <div className={`${isDarkMode ? 'dark' : ''}`}>
            <style>{`
              /* --- LIGHT THEME: NEUMORPHISM (Soft UI) --- */
              .neu-flat {
                  background: #efeff2;
                  border-radius: 2rem;
                  box-shadow: 9px 9px 18px #c8c8cc, -9px -9px 18px #ffffff;
                  border: 1px solid rgba(255,255,255,0.4);
              }
              .neu-pressed {
                  background: #efeff2;
                  border-radius: 2rem;
                  box-shadow: inset 6px 6px 12px #c8c8cc, inset -6px -6px 12px #ffffff;
                  border: 1px solid rgba(0,0,0,0.02);
              }
              .neu-btn {
                  background: #efeff2;
                  box-shadow: 5px 5px 10px #c8c8cc, -5px -5px 10px #ffffff;
                  border-radius: 9999px;
                  transition: all 0.2s ease;
                  color: #475569;
              }
              .neu-btn:active {
                  box-shadow: inset 4px 4px 8px #c8c8cc, inset -4px -4px 8px #ffffff;
                  transform: scale(0.98);
              }
              .neu-nav {
                  background: #efeff2;
                  box-shadow: 5px 5px 15px #d1d1d6, -5px -5px 15px #ffffff;
                  border: 1px solid rgba(255,255,255,0.5);
              }

              /* --- DARK THEME: AGGRESSIVE 3D GLASS PRISM --- */
              
              /* The specific class for the Stats Section */
              .dark .glass-prism {
                  /* 1. Transparent Crystal Body */
                  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.01));
                  backdrop-filter: blur(20px);
                  
                  /* 2. Strong 3D Lighting (Top-Left Bright, Bottom-Right Dark) */
                  border-top: 2px solid rgba(255, 255, 255, 0.5);  /* Bright Light Hit */
                  border-left: 2px solid rgba(255, 255, 255, 0.5); /* Bright Light Hit */
                  border-right: 1px solid rgba(255, 255, 255, 0.05);
                  border-bottom: 1px solid rgba(0, 0, 0, 0.4);      /* Shadowy edge */
                  
                  /* 3. Deep Shadows for Float + Inner Glow for Thickness */
                  box-shadow: 
                      20px 20px 50px -10px rgba(0, 0, 0, 0.8),    /* Deep Drop Shadow */
                      inset 0 0 20px rgba(255, 255, 255, 0.05);   /* Internal Volume Glow */
                      
                  border-radius: 2rem;
              }

              /* Standard Glass Card for other elements */
              .dark .neu-flat {
                  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.01));
                  backdrop-filter: blur(20px);
                  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                  border: 1px solid rgba(255, 255, 255, 0.15);
                  border-top-color: rgba(255, 255, 255, 0.25);
              }
              
              /* Reset Pressed State in Dark Mode */
              .dark .neu-pressed {
                  background: rgba(0, 0, 0, 0.2);
                  box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.2);
                  border: 1px solid rgba(255, 255, 255, 0.05);
              }

              .dark .neu-btn {
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  color: white;
              }

              .dark .neu-nav {
                  background: rgba(0, 0, 0, 0.3);
                  backdrop-filter: blur(20px) saturate(180%);
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                  border: 1px solid rgba(255, 255, 255, 0.1);
              }

              /* Toast animations */
              @keyframes slide-in {
                from {
                  transform: translateX(100%);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }

              .animate-slide-in {
                animation: slide-in 0.3s ease-out;
              }
            `}</style>

            {/* Main Background */}
            <div className="bg-[#efeff2] dark:bg-slate-900 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-800 dark:to-black font-display text-slate-700 dark:text-slate-200 antialiased transition-colors duration-500 min-h-screen relative overflow-x-hidden">
              
              {/* Ambient Glows */}
              <div className="fixed top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[150px] pointer-events-none z-0 hidden dark:block animate-pulse"></div>
              <div className="fixed bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none z-0 hidden dark:block"></div>

              {/* Header */}
              <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

              {/* Routes */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductCatalog />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<ProductManagement />} />
                <Route path="/admin/orders" element={<OrderManagement />} />
                <Route path="/admin/analytics" element={<Analytics />} />
              </Routes>

              {/* Footer */}
              <Footer />
            </div>
          </div>
        </Router>
      </NotificationProvider>
    </CartProvider>
  </AuthProvider>
</ToastProvider>
</ErrorBoundary>
  );
};

export default App;