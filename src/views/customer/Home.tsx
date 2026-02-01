import React from 'react';
import Link from 'next/link';
import { ArrowRight, Utensils, Zap, Gift, Coffee, Star, MapPin, Phone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section - Elevated Starbucks Inspired */}
      <section className="relative bg-[#4a3520] text-white min-h-[700px] flex flex-col md:flex-row items-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-300 rounded-full blur-[120px]" />
        </div>

        <div className="flex-1 p-8 md:p-24 z-10 flex flex-col justify-center items-start text-left">
          <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/30 mb-6 py-1.5 px-4 rounded-full font-black tracking-widest text-[10px] uppercase">
            Premium Coffee & Dining
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
            SIP, SAVOR, <br /><span className="text-orange-500">SMILE.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 font-medium max-w-lg text-orange-50/80 leading-relaxed">
            Experience the warmth of our handcrafted favorites, now with our fastest digital service ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/menu">
              <Button size="lg" className="w-full sm:w-auto bg-orange-600 text-white hover:bg-orange-500 font-black px-10 py-8 text-xl rounded-2xl transition-all hover:scale-105 shadow-2xl shadow-orange-900/20 active:scale-95">
                Order Now <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <Link href="/reservations">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-black px-10 py-8 text-xl rounded-2xl transition-all">
                Book Table
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#4a3520] bg-gray-200 overflow-hidden shadow-xl">
                  <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <div>
              <div className="flex text-orange-500">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs font-bold text-orange-50/60 uppercase tracking-widest">500k+ Happy Guests</p>
            </div>
          </div>
        </div>
        <div className="flex-1 h-[500px] md:h-full w-full relative">
          <img
            src="https://assets.hrewards.com/assets/jpg.xxlarge_SHR_Hamburg_restaurant_Stadthaus_18_8e14ca97d4.jpg?optimize"
            alt="Handcrafted Coffee"
            className="w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-[5s] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#4a3520] via-transparent to-transparent md:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4a3520] via-transparent to-transparent md:hidden block" />
        </div>
      </section>

      {/* Feature Section 1 - Elevated */}
      <section className="bg-white py-24 flex flex-col md:flex-row-reverse items-center min-h-[600px] container mx-auto px-4 gap-16">
        <div className="flex-1 flex flex-col justify-center items-start text-left max-w-xl">
          <div className="w-16 h-1.5 bg-orange-600 rounded-full mb-8" />
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tight uppercase">
            Freshly Baked <br /><span className="text-orange-600">Daily Bliss</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
            Pair your favorite drink with our new seasonal pastries, baked fresh every morning by our master pastry chefs.
          </p>
          <Link href="/menu">
            <Button variant="outline" className="border-2 border-orange-600 text-orange-600 font-black hover:bg-orange-600 hover:text-white rounded-2xl px-10 py-6 transition-all hover:translate-x-2">
              Explore Bakery <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
        <div className="flex-1 h-[400px] md:h-[500px] w-full relative rounded-[3rem] overflow-hidden shadow-2xl group">
          <img
            src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1000"
            alt="Bakery"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[3rem]" />
        </div>
      </section>

      {/* Feature Section 2 - Rewards Inspired */}
      <section className="bg-orange-50 py-24 overflow-hidden relative">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left z-10">
            <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-orange-200/50 mb-8 transform -rotate-3 hover:rotate-0 transition-transform">
              <Gift className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tight uppercase">
              Flavorful <br /><span className="text-orange-600">Rewards</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium max-w-md">
              Join our loyalty program and earn stars on every order. Free treats and exclusive offers are just a few sips away!
            </p>
            <Button className="bg-gray-900 text-white font-black rounded-2xl px-10 py-6 hover:bg-orange-600 transition-colors shadow-xl active:scale-95">
              Start Earning Now
            </Button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 relative">
            <div className="space-y-4 pt-12">
              <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600" className="rounded-3xl shadow-lg" alt="img1" />
              <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600" className="rounded-3xl shadow-lg" alt="img2" />
            </div>
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=600" className="rounded-3xl shadow-lg" alt="img3" />
              <img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=600" className="rounded-3xl shadow-lg" alt="img4" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-20">
            <Badge className="bg-orange-100 text-orange-600 border-none mb-4 py-1 px-4 rounded-full font-black tracking-widest text-[10px] uppercase">
              Selected For You
            </Badge>
            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight uppercase">Fan Favorites</h2>
            <div className="w-24 h-1.5 bg-orange-600 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {[
              { name: 'Signature Latte', price: 'ETB 549', img: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=600' },
              { name: 'Avocado Toast', price: 'ETB 899', img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600' },
              { name: 'Berry Smoothie', price: 'ETB 625', img: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=600' }
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-[2.5rem] aspect-square mb-8 shadow-2xl transition-all hover:-translate-y-2 hover:shadow-orange-200">
                  <img src={item.img || undefined} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <Button className="w-full bg-white text-gray-900 font-black hover:bg-orange-600 hover:text-white rounded-xl">Add to Order</Button>
                  </div>
                </div>
                <div className="flex justify-between items-center px-4">
                  <h4 className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">{item.name}</h4>
                  <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full font-black text-sm">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-20 text-center">
            <Link href="/menu">
              <Button variant="outline" size="lg" className="rounded-2xl px-12 py-8 border-2 text-xl font-black hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-xl hover:shadow-orange-100">
                Full Menu <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Info Section */}
      <section className="py-32 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-orange-500 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
            {[
              { icon: Zap, title: 'Fast Self-Service', desc: 'Skip the line with our advanced digital ordering system. Designed for the modern pace of life.' },
              { icon: Coffee, title: 'Ethically Sourced', desc: 'We care about the planet and its people. Every bean is sourced with transparency and fairness.' },
              { icon: Utensils, title: 'Chef-Crafted', desc: 'Our menu is a labor of love, designed by top-tier chefs to satisfy your most refined cravings.' }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-600 transition-colors duration-500 transform group-hover:rotate-12">
                  <feature.icon className="w-10 h-10 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-32 pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                <Coffee className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">Coffee<span className="text-orange-600">Hub</span></span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-black uppercase tracking-widest text-gray-500">
              <Link href="/menu" className="hover:text-white transition-colors">Menu</Link>
              <Link href="/reservations" className="hover:text-white transition-colors">Reservations</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/about" className="hover:text-white transition-colors">Our Story</Link>
            </div>
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer">
                 <MapPin size={18} />
               </div>
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer">
                 <Phone size={18} />
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
