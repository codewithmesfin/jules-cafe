"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Utensils, Zap, Gift, Coffee, Star, MapPin, Phone, ShieldCheck, QrCode, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

const Home: React.FC = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const stagger = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.2 }
  };

  return (
    <div className="flex flex-col overflow-x-hidden bg-white selection:bg-orange-100 selection:text-orange-900">
      {/* Hero Section - The "Showstopper" */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-50 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-100/50 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none"
               style={{ backgroundImage: 'radial-gradient(circle, #ea580c 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Badge className="bg-orange-50 text-orange-600 border-orange-100 mb-8 py-2 px-6 rounded-full font-black tracking-[0.2em] text-[10px] uppercase shadow-sm">
                Next-Gen Dining Experience
              </Badge>
              <h1 className="text-6xl md:text-8xl xl:text-9xl font-black text-gray-900 mb-8 leading-[0.85] tracking-tighter">
                REVOLUTIONIZE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">YOUR TASTE.</span>
              </h1>
              <p className="text-xl md:text-2xl mb-12 font-medium text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Discover a seamless blend of gourmet craftsmanship and lightning-fast digital convenience. Your favorite flavors, reinvented.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link href="/menu">
                  <Button size="lg" className="w-full sm:w-auto bg-gray-900 text-white hover:bg-orange-600 font-black px-12 py-8 text-xl rounded-[2rem] transition-all hover:scale-105 shadow-2xl shadow-gray-900/10 active:scale-95 group">
                    View Menu <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/reservations">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-200 text-gray-900 hover:bg-gray-50 font-black px-12 py-8 text-xl rounded-[2rem] transition-all shadow-lg shadow-gray-100">
                    Book a Table
                  </Button>
                </Link>
              </div>

              <div className="mt-16 flex flex-col sm:flex-row items-center gap-8 justify-center lg:justify-start">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5, zIndex: 50 }}
                      className="w-14 h-14 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-xl cursor-pointer"
                    >
                      <img src={`https://i.pravatar.cc/150?u=rest${i}`} alt="happy customer" />
                    </motion.div>
                  ))}
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex text-orange-500 mb-1 justify-center sm:justify-start">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-widest">4.9/5 from 10k+ reviews</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex-1 relative w-full max-w-[600px]"
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-[12px] border-white">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000"
                  alt="Atmosphere"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Floating UI Elements */}
                <motion.div
                  className="absolute top-12 -left-8 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 hidden md:block"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <Zap className="text-orange-600 w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Fast Service</p>
                      <p className="font-black text-gray-900">Under 10 Mins</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-12 -right-8 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 hidden md:block"
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Verified Quality</p>
                      <p className="font-black text-gray-900">Premium Grade</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - "Simplicity is Beauty" */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-24"
            {...fadeIn}
          >
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight uppercase">HOW IT WORKS</h2>
            <div className="w-24 h-2 bg-orange-600 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20"
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {[
              { icon: QrCode, title: "SCAN", desc: "Find the QR code on your table and scan it with your smartphone camera.", color: "bg-blue-50 text-blue-600" },
              { icon: Utensils, title: "ORDER", desc: "Browse our beautiful visual menu and add your favorites to the cart.", color: "bg-orange-50 text-orange-600" },
              { icon: Sparkles, title: "ENJOY", desc: "Your order goes straight to the kitchen. Relax while we prepare your feast.", color: "bg-purple-50 text-purple-600" }
            ].map((step, i) => (
              <motion.div
                key={i}
                className="relative bg-white p-12 rounded-[3rem] shadow-xl shadow-gray-200/50 flex flex-col items-center text-center group hover:scale-105 transition-transform duration-500"
                variants={fadeIn}
              >
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">
                  0{i + 1}
                </div>
                <div className={cn("w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 transform group-hover:rotate-12 transition-transform duration-500 shadow-inner", step.color)}>
                  <step.icon size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Items - "The Eye Candy" */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <motion.div {...fadeIn}>
              <Badge className="bg-orange-100 text-orange-600 border-none mb-4 py-1 px-4 rounded-full font-black tracking-widest text-[10px] uppercase">Our Pride</Badge>
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight uppercase">FAN FAVORITES</h2>
            </motion.div>
            <motion.div {...fadeIn}>
              <Link href="/menu">
                <Button variant="outline" size="lg" className="rounded-2xl px-10 py-6 border-2 font-black text-lg group">
                  EXPLORE FULL MENU <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {[
              { name: 'Signature Latte', price: '$5.49', img: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=600', tags: ['Award Winning', 'Caffeine'] },
              { name: 'Avocado Toast', price: '$8.99', img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600', tags: ['Healthy', 'Chef Choice'] },
              { name: 'Berry Smoothie', price: '$6.25', img: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=600', tags: ['Fresh', 'Vegan'] }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="relative overflow-hidden rounded-[3rem] aspect-[4/5] mb-8 shadow-2xl transition-all hover:shadow-orange-200">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-[1.5s]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex justify-between items-end">
                       <h4 className="text-3xl font-black text-white">{item.name}</h4>
                       <span className="text-orange-400 font-black text-xl mb-1">{item.price}</span>
                    </div>
                    <Button className="w-full bg-orange-600 text-white font-black hover:bg-orange-500 rounded-2xl py-6 opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                      QUICK ADD +
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section - "The Hook" */}
      <section className="py-24 px-4 overflow-hidden relative">
        <div className="container mx-auto">
          <div className="bg-gray-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-600 rounded-full blur-[150px]" />
              <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[150px]" />
            </div>

            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex p-4 bg-orange-600 rounded-3xl shadow-xl mb-8 transform -rotate-3 hover:rotate-0 transition-transform shadow-orange-600/30">
                <Gift className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl md:text-7xl font-black text-white mb-8 leading-tight tracking-tight uppercase">
                FLAVORFUL <br /><span className="text-orange-600 underline decoration-white/10 underline-offset-8">REWARDS.</span>
              </h2>
              <p className="text-xl text-gray-400 mb-12 leading-relaxed font-medium max-w-xl">
                Join our exclusive CoffeeHub Circle. Earn stars on every order and unlock a world of free treats, early access, and personalized surprises.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Button className="bg-white text-gray-900 font-black rounded-[2rem] px-12 py-8 text-xl hover:bg-orange-50 transition-colors shadow-2xl shadow-white/10 active:scale-95">
                  JOIN THE CIRCLE
                </Button>
                <div className="flex items-center gap-3 justify-center">
                  <div className="flex text-orange-500">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />) }
                  </div>
                  <span className="text-white text-xs font-black uppercase tracking-widest">Join 50k members</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full max-w-md lg:max-w-none relative z-10 grid grid-cols-2 gap-6">
              {[
                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=400"
              ].map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cn("rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800", i % 2 === 1 ? "mt-12" : "")}
                >
                  <img src={img} alt="reward" className="w-full h-full object-cover aspect-square hover:scale-110 transition-transform duration-700" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Info Section / Footer Lite */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
            {[
              { icon: Zap, title: 'DIGITAL FIRST', desc: 'Skip the traditional friction. Scan, pay, and enjoy at your own pace.' },
              { icon: Coffee, title: 'CONSCIOUS SOURCING', desc: 'Ethically grown beans. Sustainable farming. A better world in every cup.' },
              { icon: Utensils, title: 'CULINARY ARTISTRY', desc: 'Crafted by award-winning chefs using only the freshest seasonal ingredients.' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center group"
                {...fadeIn}
                transition={{ delay: i * 0.2 }}
              >
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-gray-900 transition-all duration-500 transform group-hover:rotate-12 shadow-lg shadow-gray-100">
                  <feature.icon className="w-10 h-10 text-orange-600 group-hover:text-orange-500 transition-colors" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight uppercase text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-32 pt-16 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-12"
            {...fadeIn}
          >
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-600/20">
                  <Coffee className="text-white w-7 h-7" />
                </div>
                <span className="text-3xl font-black tracking-tighter uppercase text-gray-900">Coffee<span className="text-orange-600">Hub.</span></span>
              </div>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Est. 2024 • Built for Foodies</p>
            </div>

            <div className="flex flex-wrap justify-center gap-10 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
              <Link href="/menu" className="hover:text-orange-600 transition-colors">Menu</Link>
              <Link href="/reservations" className="hover:text-orange-600 transition-colors">Reservations</Link>
              <Link href="/contact" className="hover:text-orange-600 transition-colors">Contact</Link>
              <Link href="/about" className="hover:text-orange-600 transition-colors">Story</Link>
            </div>

            <div className="flex gap-4">
               <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all cursor-pointer shadow-lg shadow-gray-100">
                 <MapPin size={22} />
               </div>
               <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all cursor-pointer shadow-lg shadow-gray-100">
                 <Phone size={22} />
               </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
