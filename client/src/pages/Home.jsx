import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Home page component - Krishna Motor Parts landing page
 * @returns {JSX.Element} The home page component
 */
const Home = () => { 
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // Here you would typically send the email to your backend
      console.log('Subscribing email:', email);
      setIsSubscribed(true);
      setEmail('');
      
      // Reset the success message after 3 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }
  }; 

  const categories = [
    { title: "Lubricants", subtitle: "Oils, Fluids & Greases", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBa8SPr50MN030ZwU8xhoD-NV1aH9VOqWvoYwtjPa8MfxJwqkrawUk6L7oP2MjCA1z7UguuaPOiO3f_tkcmauxzHN-WJn_e2mfoCeapIRtx0spG4rVSUlxuMO08HonsQPjAh4FFx-y1YcYLbudUNKJs3VTryBt_6YGHI_dZNHJbfiA_gMC8UOdxrXtvkz-ipz0lmBjIXuB_LUhR1IwiZhLWL3Zj0zdUG3kAV1HKAFn0FERKbvJ_xOuT-MTP9RFruygKFv12FR9ry0rO" },
    { title: "Braking", subtitle: "Pads, Discs & Calipers", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCm_PSHmi_PxKZaNu9hryt6wdoNFtqJ1O4hfqTI4WAa7pvmRYQ1OUpCAH_U7j4JcuagOwE62iJhPoraEPIdRVLAIKV7sKaF19evqfnd4KOFNdBhrh1IFCJ1vhB3j0_9SZqeAFDc4-LTPM42BfMFs9TQ62qC8CI-dnicT3EtAMmcUUw9AeDjTj4RbzWfmhlqcqcsHrNg6DzlgqhCHeXpI3L6TTN03KHf0OiGudKshM6A9k5IPdPz8iYSNxN4vKRd8-tp2vQn9IktLTdI" },
    { title: "Engine", subtitle: "Filters, Belts & Plugs", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtOmpjtpW1gvbK-qfxhp8jVVUHvZWsDY9SWbuxwHxY_vwRthKaQ4kulAXmo2GAWzsgaJ46RZd_UrlHVf6BWbH52FNujPlf7U9Arpc0z6aZDHS60xdpRashOXXKJ6_WPaTry0IR_5feTKh2cvuWQq-2m2YfhwS_nijlZzF_vPeeSQ8CYO7rfSFwDZB-rD1u_AlIcbxkrgKc3t4XfhYwJjuIu_NFvj2HVZK4CS8fReKgI2RhYmKQFX0dBhW_sUJ3eOiZQ3VZ1XL39bbA" },
    { title: "Electrical", subtitle: "Batteries, Lights & Sensors", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6_Awi7bbC2ePJdvKPaPfXAfxnqgkPKjPUKi_tU9ryVWmpeZcgcekruFuK4Ejx_Mf8C48sdw5s3zU-hC08jWtkJylWhea7_RqLSiuystiC6aYZEUwz2s4UozTiTSf7KvQwit_qteIppAmOnRBDTX9a0i2NtwovEz_zxLUh3MLNt2kdqqe_rs2x9gxoVLAMjSb46fD6MXsvfUBVEvH9K1otWsB-AGVfimODFXeqRGv6gQcjUo6-WTe_bFt2fYJza7tPgT4S1qMjCmLj" },
  ];

  const services = [
    { icon: "local_shipping", title: "Express Delivery", desc: "Same-day dispatch for orders placed before 2 PM. We understand your urgency.", color: "primary" },
    { icon: "workspace_premium", title: "Quality Guarantee", desc: "100% genuine parts sourced directly from manufacturers with warranty support.", color: "secondary-green" },
    { icon: "support_agent", title: "Expert Support", desc: "Not sure which part fits? Our mechanics are just a call away to help you.", color: "blue-500" },
    { icon: "handshake", title: "B2B Wholesale", desc: "Special pricing and credit terms for garage owners and fleet managers.", color: "yellow-500" }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-screen w-full items-center justify-center pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#efeff2] dark:bg-transparent transition-colors">
          <div className="h-full w-full bg-cover bg-center opacity-10 dark:opacity-60 transition-opacity duration-500" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAR99SdQgUGyps3PboVssdNJA2gxJIQp1uTREYcBIwWakRbg9xrfjc3p6B-jK0nZFKVp4YrcFobgrze2QtnH9ZPgBI13LOsD-SucBJEGmE3V9c6-QxP23h-C49Pa5ER27EqKhPmjMOjjNZUd1teKOn3Zf2QzDuUuE7wgZnR79OAMNCTIJh36OCMT5-_VBo9rhsarbd6-zgYDZJxehYaImw2qT8rRfC6n43VUOuIe5KGNPdlVAnvyb26AFbcpFP0uCibVtPSf0yG2Qx3')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#efeff2] via-[#efeff2]/80 to-[#efeff2]/20 dark:from-black/90 dark:via-black/60 dark:to-transparent transition-all"></div>
        </div>

        <div className="relative z-10 w-full px-4 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="flex flex-col gap-8">
                <div className="neu-flat inline-flex w-fit items-center gap-3 px-5 py-2 dark:rounded-full">
                  <span className="relative flex size-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-3 bg-secondary-green shadow-[0_0_10px_#059669]"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white dark:drop-shadow-md">Authorized Distributor</span>
                </div>
                
                <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-800 dark:text-white md:text-6xl lg:text-7xl transition-colors duration-300">
                  PRECISION PARTS <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-slate-800 dark:from-primary dark:to-white dark:drop-shadow-[0_0_15px_rgba(215,25,32,0.3)]">PEAK PERFORMANCE</span>
                </h1>
                <p className="max-w-xl text-xl text-slate-500 dark:text-gray-300 font-medium transition-colors">
                  Your one-stop destination for genuine automotive spares. From high-performance lubricants to precision engine components.
                </p>
                <div className="flex flex-wrap gap-5 pt-2">
                  <Link 
                    to="/products"
                    className="flex h-14 min-w-[160px] items-center justify-center rounded-full bg-primary text-white text-lg font-bold shadow-[6px_6px_12px_#d1d1d6,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] dark:bg-gradient-to-br dark:from-primary dark:to-red-600 dark:shadow-[0_0_25px_rgba(215,25,32,0.5)] dark:border dark:border-white/10 transition-all transform active:scale-95 hover:scale-105"
                  >
                    Browse Catalog
                  </Link>
                  <Link
                    to="/login"
                    className="neu-btn flex h-14 min-w-[160px] items-center justify-center gap-3 px-8 text-lg font-bold text-slate-700 dark:text-white dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-primary dark:text-white">call</span>
                    Get Started
                  </Link>
                </div>
                
                {/* Stats Section */}
                <div className="mt-10 flex items-center gap-10 p-8 w-fit transition-all duration-300 neu-pressed dark:glass-prism">
                  {[
                    { val: "5k+", label: "Parts in Stock" },
                    { val: "13+", label: "Years Excellence" },
                    { val: "100%", label: "Genuine Parts" }
                  ].map((stat, idx) => (
                    <React.Fragment key={idx}>
                      <div className="relative z-10">
                        <p className="text-3xl font-black text-slate-700 dark:text-white transition-colors dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{stat.val}</p>
                        <p className="text-sm font-semibold text-slate-400 dark:text-blue-100/70 transition-colors tracking-wide">{stat.label}</p>
                      </div>
                      {idx !== 2 && <div className="h-10 w-[2px] rounded-full bg-slate-300 dark:bg-white/20 dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 3D Card Effect */}
              <div className="relative hidden lg:block perspective-[1000px]">
                <div className="neu-flat relative aspect-square w-full max-w-lg mx-auto overflow-hidden p-4 transform rotate-y-6 hover:rotate-y-0 transition-transform duration-700 dark:rounded-[2.5rem]">
                  <img className="h-full w-full object-cover rounded-[1.5rem] dark:opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_Ej631c6x_3buDDX3YL90gEj5Z7fRJRarlCrsciutk30n8zQeLIUdl5EI9UEM0bzhNOHkovwY1DQJ_eyJvZUGK6DNWuv2EKA288PF-czLyjt37opk84Hl-zhFzBrk0oEDkTTnPN-STahMGgPkyOExZlbWsclDpBLhD-nKMwnLlsg-jjOx5_DvGm48uRg0eQ5DfdDQQOEiCY8eR0EN_C9Ph25F0DUTkEwn5OafTrzflzqEA52SlO0czEZaqxCy8mAT7EYqfkJOj1Tu" alt="Detailed close up of metal gears" />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent pointer-events-none rounded-[2rem] dark:from-black/60 dark:to-transparent"></div>
                </div>
                <div className="absolute -bottom-8 -left-8 neu-flat p-6 z-20 dark:bg-black/40 dark:backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-full neu-pressed text-secondary-green dark:bg-secondary-green/20 dark:text-secondary-green dark:shadow-[0_0_15px_rgba(5,150,105,0.4)] dark:border dark:border-secondary-green/30">
                      <span className="material-symbols-outlined text-2xl">verified</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800 dark:text-white">Official Partner</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wide">Castrol & Bosch</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Strip */}
      <div className="w-full border-y border-transparent dark:border-white/5 bg-[#e4e4e7] dark:bg-white/5 py-10 relative z-10 shadow-[inset_0_4px_8px_rgba(0,0,0,0.05)] dark:shadow-none dark:backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-12 px-6 opacity-70 transition-all hover:opacity-100 md:justify-between">
          {[
            { name: "Castrol", icon: "water_drop", color: "text-primary" },
            { name: "BOSCH", icon: "bolt", color: "text-blue-600 dark:text-blue-400" },
            { name: "MICHELIN", icon: "tire_repair", color: "text-yellow-600 dark:text-yellow-400" },
            { name: "TOYOTA", icon: "car_repair", color: "text-red-600 dark:text-red-500" },
            { name: "3M Auto", icon: "engineering", color: "text-slate-500 dark:text-gray-400" },
          ].map((brand) => (
            <div key={brand.name} className="flex items-center gap-3 text-2xl font-bold text-slate-600 dark:text-white font-display group cursor-default transition-colors">
              <span className={`material-symbols-outlined ${brand.color} group-hover:scale-110 transition-all dark:drop-shadow-md`}>
                {brand.icon}
              </span> 
              {brand.name}
            </div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <section className="py-24 px-4 md:px-8 relative z-10" id="products">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white md:text-5xl transition-colors dark:drop-shadow-lg">Explore Our Categories</h2>
              <p className="mt-6 text-lg text-slate-500 dark:text-gray-400 transition-colors">Find exactly what you need from our extensive inventory.</p>
            </div>
            <Link 
              to="/products"
              className="neu-btn group flex items-center gap-3 text-base font-bold text-primary px-6 py-3 dark:bg-white/5 dark:text-white dark:hover:bg-primary dark:border-white/10"
            >
              View Full Catalog <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_right_alt</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                to="/products"
                className="neu-flat group relative overflow-hidden p-4 transition-all duration-500 hover:translate-y-[-5px] dark:hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.1)] cursor-pointer"
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-slate-200 dark:bg-black/30 relative">
                  <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${cat.img}')` }}></div>
                  <div className="absolute inset-0 bg-transparent dark:bg-gradient-to-t dark:from-black/80 dark:to-transparent opacity-60"></div>
                </div>
                <div className="mt-6 flex items-center justify-between px-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-1 transition-colors">{cat.subtitle}</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full neu-pressed text-slate-400 dark:text-white dark:bg-white/10 dark:shadow-none group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_outward</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4 md:px-8 relative overflow-hidden" id="services">
        <div className="absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-[#ffffff] to-[#d1d1d6] opacity-40 blur-[80px] dark:from-primary/20 dark:to-purple-500/20 dark:blur-[120px] transition-all"></div>
        
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {services.map((svc, idx) => (
                  <div key={idx} className="neu-flat p-8 hover:bg-[#fafafa] dark:hover:bg-white/10 transition-colors group">
                    <div className={`size-14 rounded-2xl neu-pressed flex items-center justify-center mb-6 text-${svc.color} group-hover:scale-110 transition-all dark:bg-white/5 dark:shadow-none dark:border dark:border-white/10`}>
                      <span className="material-symbols-outlined text-3xl">{svc.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">{svc.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed transition-colors">{svc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-1 lg:order-2 flex flex-col gap-8">
              <h2 className="text-4xl font-black text-slate-800 dark:text-white md:text-6xl tracking-tight leading-tight transition-colors">
                SERVICE BEYOND <br />
                <span className="text-primary dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-primary dark:to-red-500 dark:drop-shadow-lg">JUST SELLING PARTS</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-gray-300 font-light leading-relaxed transition-colors">
                We provide the expertise and reliability you need to keep your vehicles on the road. Professional mechanics, easy returns, and genuine support.
              </p>
              <div className="pt-4">
                <Link 
                  to="/products"
                  className="group flex items-center gap-4 text-slate-800 dark:text-white font-bold text-lg hover:text-primary dark:hover:text-primary transition-colors"
                >
                  <span className="border-b-2 border-primary pb-1">Explore Services</span>
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-2 text-primary">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-4 md:px-8 relative z-10">
        <div className="mx-auto max-w-5xl text-center neu-flat p-12 md:p-16 relative overflow-hidden dark:bg-white/5 dark:backdrop-blur-lg">
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white md:text-6xl mb-8 transition-colors">Ready to Rev Up?</h2>
            <p className="text-slate-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto text-lg transition-colors">Join our newsletter to get exclusive deals on parts and maintenance tips.</p>
            <form className="flex flex-col sm:flex-row gap-6 max-w-lg mx-auto" onSubmit={handleSubscribe}>
              <input 
                className="flex-1 neu-pressed px-8 py-4 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10" 
                placeholder="Enter your email address" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <button 
                className="rounded-full bg-primary text-white font-bold px-10 py-4 shadow-[6px_6px_12px_#d1d1d6,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] dark:bg-gradient-to-r dark:from-primary dark:to-red-600 dark:shadow-[0_0_20px_rgba(215,25,32,0.4)] transition-all transform active:scale-95 text-lg disabled:opacity-50" 
                type="submit"
                disabled={isSubscribed}
              >
                {isSubscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
            {isSubscribed && (
              <p className="mt-4 text-secondary-green font-medium">Thank you for subscribing! You'll receive our latest updates.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;