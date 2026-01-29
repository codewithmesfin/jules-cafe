import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Utensils } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000"
            alt="Restaurant Hero"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Delicious Food, Delivered to Your Table</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">Experience the finest dining with our modern self-service system. Fast, fresh, and flavored to perfection.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Order Now <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/reservations">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border-white/30">
                Book a Table
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
                <Utensils size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Quality Ingredients</h3>
              <p className="text-gray-600">We source only the freshest, high-quality ingredients for every dish we serve.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Master Chefs</h3>
              <p className="text-gray-600">Our experienced chefs bring passion and creativity to every plate they create.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Fast Service</h3>
              <p className="text-gray-600">Enjoy your meal without the long wait thanks to our efficient self-service system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Popular Dishes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left">
                <img
                  src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400&h=300`}
                  alt="Food"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold">Chef's Special Salad</h4>
                    <span className="text-orange-600 font-bold">$14.99</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Fresh seasonal greens with grilled chicken, avocado, and house dressing.</p>
                  <Link to="/menu">
                    <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-orange-600">
                      View details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Link to="/menu">
            <Button variant="outline" size="lg">View Full Menu</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
