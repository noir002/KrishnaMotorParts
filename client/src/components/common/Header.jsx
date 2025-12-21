import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NotificationBell from './NotificationBell';

const Header = ({ isDarkMode, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartTotals } = useCart();
  const navigate = useNavigate();
  const { itemCount } = getCartTotals();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="neu-nav relative flex items-center justify-between rounded-full px-8 py-4 transition-all duration-300">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full neu-pressed text-primary dark:bg-gradient-to-br dark:from-primary dark:to-red-600 dark:text-white dark:shadow-[0_0_15px_rgba(215,25,32,0.6)] dark:border-none">
              <span className="material-symbols-outlined text-xl">settings</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors">
              Krishna<span className="text-primary">Motor</span>Parts
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link 
              to="/" 
              className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
            >
              Products
            </Link>
            <Link 
              to="/cart" 
              className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all relative"
            >
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
                >
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin/dashboard" 
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all"
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : null}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications (only for authenticated users) */}
            {isAuthenticated && <NotificationBell />}

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="neu-btn flex items-center justify-center p-2 size-10 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              <span className="material-symbols-outlined text-xl">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-slate-600 dark:text-gray-300">
                  Hi, {user?.firstName}
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-full bg-slate-600 text-white px-6 py-2.5 text-sm font-bold shadow-[6px_6px_12px_#d1d1d6,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(100,100,100,0.4)] dark:bg-slate-700 dark:hover:scale-105 dark:border dark:border-white/20 transition-all transform active:scale-95"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="hidden md:flex items-center justify-center gap-2 rounded-full bg-primary text-white px-6 py-2.5 text-sm font-bold shadow-[6px_6px_12px_#d1d1d6,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(215,25,32,0.4)] dark:bg-gradient-to-r dark:from-primary dark:to-red-600 dark:hover:scale-105 dark:border dark:border-white/20 transition-all transform active:scale-95"
              >
                <span>Login</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden neu-btn flex items-center justify-center p-2 size-10"
              aria-label="Toggle Menu"
            >
              <span className="material-symbols-outlined text-xl">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 neu-flat rounded-3xl p-6 space-y-4">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-2"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-2"
            >
              Products
            </Link>
            <Link 
              to="/cart" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-2"
            >
              Cart {itemCount > 0 && `(${itemCount})`}
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-2"
                >
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors py-2"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-bold text-primary hover:text-primary/80 transition-colors py-2"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;