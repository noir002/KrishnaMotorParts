import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#e4e4e7] dark:bg-black/20 dark:backdrop-blur-xl pt-20 pb-10 px-4 md:px-8 border-t border-slate-300 dark:border-white/5 relative z-10 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full neu-pressed text-primary dark:bg-gradient-to-br dark:from-primary dark:to-red-600 dark:text-white dark:shadow-lg">
                <span className="material-symbols-outlined text-xl">settings</span>
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-white transition-colors">
                Krishna<span className="text-primary">Motor</span>Parts
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed transition-colors">
              Your trusted partner for genuine automotive components and accessories. Quality parts for peak performance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-800 dark:text-white font-bold mb-6 text-lg transition-colors">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 dark:text-gray-400 transition-colors">
              <li>
                <Link 
                  to="/" 
                  className="hover:text-primary transition hover:translate-x-2 inline-block font-medium"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="hover:text-primary transition hover:translate-x-2 inline-block font-medium"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/cart" 
                  className="hover:text-primary transition hover:translate-x-2 inline-block font-medium"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className="hover:text-primary transition hover:translate-x-2 inline-block font-medium"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-slate-800 dark:text-white font-bold mb-6 text-lg transition-colors">
              Categories
            </h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 dark:text-gray-400 transition-colors">
              <li>
                <a href="#" className="hover:text-primary transition hover:translate-x-2 inline-block font-medium">
                  Engine Parts
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition hover:translate-x-2 inline-block font-medium">
                  Brake System
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition hover:translate-x-2 inline-block font-medium">
                  Lubricants
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition hover:translate-x-2 inline-block font-medium">
                  Electrical
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-slate-800 dark:text-white font-bold mb-6 text-lg transition-colors">
              Contact Us
            </h4>
            <ul className="flex flex-col gap-5 text-sm text-slate-500 dark:text-gray-400 transition-colors">
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary shrink-0">location_on</span>
                <span>
                  Krishna Motor Parts,<br/>
                  Chhatari Doraha, Chattari,<br/>
                  Bulandshahr, U.P.
                </span>
              </li>
              <li className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary shrink-0">call</span>
                <span>+91 8630373030</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary shrink-0">email</span>
                <span>Krishnamotorparts1993@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-300 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-400 dark:text-gray-500 transition-colors">
          <p>© 2024 Krishna Motor Parts. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary dark:hover:text-white transition font-medium">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary dark:hover:text-white transition font-medium">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary dark:hover:text-white transition font-medium">
              Return Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;