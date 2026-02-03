"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UtensilsCrossed, Menu, Calendar, ShoppingBag, LogIn, UserPlus, ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { api } from '@/utils/api';
import { cn } from '@/utils/cn';

const TenantLandingPage = () => {
  const params = useParams();
  const tenantId = params?.tenant_id as string;
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await api.public.getBusiness(tenantId);
        setBusiness(response.data || response);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [tenantId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-slate-900">
        {business?.banner ? (
          <img src={business.banner} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Hero" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 opacity-60" />
        )}

        <div className="relative z-10 container mx-auto px-4 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
             <Star size={12} fill="currentColor" />
             Premiere Dining Experience
           </div>

           <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
             {business?.name || 'Welcome'}
           </h1>

           <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
             {business?.description || 'Indulge in a world of flavors where every dish tells a story of passion and excellence.'}
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/${tenantId}/menu`}>
                <Button className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-2xl shadow-blue-600/30 gap-2">
                  Explore Menu <ArrowRight size={20} />
                </Button>
              </Link>
              <Link href={`/${tenantId}/reservations`}>
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 font-black text-lg">
                  Book a Table
                </Button>
              </Link>
           </div>
        </div>

        {/* Floating Info bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/5 backdrop-blur-xl border-t border-white/10 py-6">
           <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16">
              <div className="flex items-center gap-3 text-white">
                 <Clock className="text-blue-400" size={20} />
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Open Hours</p>
                    <p className="text-sm font-bold">08:00 AM - 10:00 PM</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 text-white">
                 <MapPin className="text-blue-400" size={20} />
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</p>
                    <p className="text-sm font-bold truncate max-w-[200px]">{business?.address || 'City Center'}</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Digital Guest Services</h2>
           <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: 'Digital Menu',
              desc: 'Browse our latest seasonal collections with vivid photography.',
              icon: Menu,
              link: `/${tenantId}/menu`,
              color: 'blue'
            },
            {
              title: 'Reservations',
              desc: 'Secure your spot for lunch or dinner in just a few clicks.',
              icon: Calendar,
              link: `/${tenantId}/reservations`,
              color: 'indigo'
            },
            {
              title: 'Track Orders',
              desc: 'Stay updated with live kitchen progress and estimated delivery.',
              icon: ShoppingBag,
              link: `/${tenantId}/orders`,
              color: 'slate'
            }
          ].map((item, idx) => (
            <Link key={idx} href={item.link} className="group">
              <Card className="p-10 rounded-[3rem] border-slate-100 hover:border-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-900/10 bg-white h-full border text-center flex flex-col items-center">
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110",
                  item.color === 'blue' ? "bg-blue-50 text-blue-600" :
                  item.color === 'indigo' ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-900"
                )}>
                  <item.icon size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                <div className="mt-8 pt-8 border-t border-slate-50 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-blue-600 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                     Get Started <ChevronRight size={16} />
                   </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto px-4 flex flex-col items-center gap-6">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                 <div className="w-3 h-3 bg-blue-500 rounded-full" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase text-slate-900">
                Lunix<span className="text-blue-600">POS</span>
              </span>
           </div>
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Powered by Next Gen Hospitality</p>
        </div>
      </footer>
    </div>
  );
};

export default TenantLandingPage;
