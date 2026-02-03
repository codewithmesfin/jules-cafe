import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Calendar, ShoppingBag, Star, ArrowRight } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      icon: <UtensilsCrossed className="w-12 h-12" />,
      title: "Digital Menu Ordering",
      description: "Browse our delicious menu online, view high-quality food images, and place orders with just a few clicks. Our intuitive interface makes ordering quick and easy.",
      color: "bg-orange-100 text-[#e60023]"
    },
    {
      icon: <Calendar className="w-12 h-12" />,
      title: "Table Reservations",
      description: "Book your table in advance and skip the wait. Choose your preferred date, time, and special requests. We'll have your table ready!",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <ShoppingBag className="w-12 h-12" />,
      title: "Order Tracking",
      description: "Track your orders in real-time from preparation to delivery. Get notifications at every stage and know exactly when your food will arrive.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <Star className="w-12 h-12" />,
      title: "Loyalty Rewards",
      description: "Earn points with every order and redeem them for exclusive discounts and free items. Our loyalty program rewards you for being a valued customer.",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-red-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-[#e60023]">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Discover the convenience of our comprehensive restaurant management platform. 
            From digital menus to loyalty rewards, we've got everything you need for a seamless dining experience.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 bg-[#e60023] text-white px-8 py-4 rounded-full font-bold hover:bg-[#ad081b] transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group p-8 lg:p-10 rounded-3xl bg-white border-2 border-gray-100 hover:border-[#e60023]/30 transition-all hover:shadow-xl"
              >
                <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience Our Services?
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
            Join thousands of happy customers who enjoy the convenience of Abc Cafe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-[#e60023] text-white px-8 py-4 rounded-full font-bold hover:bg-[#ad081b] transition-all"
            >
              Sign Up Now
            </Link>
            <Link 
              href="/login" 
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
