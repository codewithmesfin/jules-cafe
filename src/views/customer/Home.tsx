import React from 'react';
import Link from 'next/link';
import { ArrowRight, Utensils, Zap, Gift, Coffee } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Starbucks Inspired */}
      <section className="bg-orange-600 text-white min-h-[600px] flex flex-col md:flex-row items-center overflow-hidden">
        <div className="flex-1 p-12 md:p-24 flex flex-col justify-center items-start text-left">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            SIP, SAVOR, <br />SMILE.
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-medium max-w-lg">
            Experience the warmth of our handcrafted favorites, now with our fastest service ever.
          </p>
          <Link href="/menu">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-6 text-xl rounded-full transition-all hover:scale-105">
              Order Now
            </Button>
          </Link>
        </div>
        <div className="flex-1 h-[400px] md:h-full w-full relative">
          <img
            src="https://assets.hrewards.com/assets/jpg.xxlarge_SHR_Hamburg_restaurant_Stadthaus_18_8e14ca97d4.jpg?optimize"
            alt="Handcrafted Coffee"
            className="w-full h-full object-cover rounded"
          />
        </div>
      </section>

      {/* Feature Section 1 - Alternating */}
      <section className="bg-[#f2f0eb] flex flex-col md:flex-row-reverse items-center min-h-[450px]">
        <div className="flex-1 p-12 md:p-20 flex flex-col justify-center items-center text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase">
            Freshly Baked Bliss
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-md">
            Pair your favorite drink with our new seasonal pastries, baked fresh every morning.
          </p>
          <Link href="/menu">
            <Button variant="outline" className="border-2 border-orange-600 text-orange-600 font-bold hover:bg-orange-600 hover:text-white rounded-full px-8">
              Explore Bakery
            </Button>
          </Link>
        </div>
        <div className="flex-1 h-[350px] md:h-[450px] w-full">
          <img
            src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1000"
            alt="Bakery"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Feature Section 2 - Rewards Inspired */}
      <section className="bg-orange-100 flex flex-col md:flex-row items-center min-h-[450px]">
        <div className="flex-1 p-12 md:p-20 flex flex-col justify-center items-center text-center">
          <Gift className="w-16 h-16 text-orange-600 mb-6" />
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase">
            Flavorful Rewards
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-md">
            Join our loyalty program and earn stars on every order. Free treats are just a few sips away!
          </p>
          <Button className="bg-orange-600 text-white font-bold rounded-full px-8">
            Join Now
          </Button>
        </div>
        <div className="flex-1 h-[350px] md:h-[450px] w-full">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1000"
            alt="Atmosphere"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Featured Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-wider">Fan Favorites</h2>
            <div className="w-24 h-1.5 bg-orange-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { name: 'Signature Latte', price: '$5.49', img: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=400' },
              { name: 'Avocado Toast', price: '$8.99', img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400' },
              { name: 'Berry Smoothie', price: '$6.25', img: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=400' }
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl aspect-square mb-6 shadow-lg transition-transform hover:scale-[1.02]">
                  <img src={item.img || null} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-bold text-gray-900">{item.name}</h4>
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link href="/menu">
              <Button variant="outline" size="lg" className="rounded-full px-12 border-2 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all">
                Full Menu <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Info Section */}
      <section className="py-24 bg-[#1e3932] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="flex flex-col items-center text-center">
              <Zap className="w-12 h-12 text-orange-400 mb-6" />
              <h3 className="text-xl font-bold mb-4">Fast Self-Service</h3>
              <p className="text-gray-300 leading-relaxed">Skip the line with our digital ordering system. Your time is precious, and we value it.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Coffee className="w-12 h-12 text-orange-400 mb-6" />
              <h3 className="text-xl font-bold mb-4">Ethically Sourced</h3>
              <p className="text-gray-300 leading-relaxed">We care about the planet. Every bean is sourced from farmers who get a fair deal.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Utensils className="w-12 h-12 text-orange-400 mb-6" />
              <h3 className="text-xl font-bold mb-4">Chef-Crafted</h3>
              <p className="text-gray-300 leading-relaxed">Not just coffee. Our food is designed by top-tier chefs to satisfy every craving.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
