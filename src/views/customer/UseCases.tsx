import React from 'react';
import Link from 'next/link';
import { 
  UtensilsCrossed, Building2, Coffee, ChefHat, 
  ArrowRight, CheckCircle 
} from 'lucide-react';

const UseCases: React.FC = () => {
  const useCases = [
    {
      icon: <UtensilsCrossed className="w-12 h-12" />,
      title: "Fine Dining Restaurants",
      description: "Elevate your fine dining experience with digital menus, table-side ordering, and seamless reservation management.",
      color: "bg-amber-100 text-amber-600",
      benefits: ["Digital wine lists", "Table reservations", "Multi-course ordering"]
    },
    {
      icon: <Coffee className="w-12 h-12" />,
      title: "Cafes & Coffee Shops",
      description: "Streamline quick service with mobile ordering, loyalty programs, and efficient queue management.",
      color: "bg-orange-100 text-orange-600",
      benefits: ["Mobile pre-orders", "Loyalty rewards", "Quick checkout"]
    },
    {
      icon: <Building2 className="w-12 h-12" />,
      title: "Restaurant Chains",
      description: "Centralized management across multiple locations with consistent branding and unified customer data.",
      color: "bg-blue-100 text-blue-600",
      benefits: ["Multi-location support", "Centralized analytics", "Brand consistency"]
    },
    {
      icon: <ChefHat className="w-12 h-12" />,
      title: "Cloud Kitchens",
      description: "Optimized for delivery-first operations with integrated delivery partners and real-time order tracking.",
      color: "bg-green-100 text-green-600",
      benefits: ["Delivery integration", "Order optimization", "Customer notifications"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Use <span className="text-green-600">Cases</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            QuickServe adapts to various business models. Discover how different types of food 
            businesses leverage our platform to grow and succeed.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
          >
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 lg:space-y-24">
            {useCases.map((useCase, index) => (
              <div 
                key={index}
                className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1 lg:px-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${useCase.color} mb-6`}>
                    {useCase.icon}
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {useCase.title}
                  </h2>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    {useCase.description}
                  </p>
                  <ul className="space-y-4">
                    {useCase.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Visual */}
                <div className="flex-1 w-full">
                  <div className={`aspect-video rounded-3xl bg-gradient-to-br ${useCase.color.split(' ')[0]} to-white p-8 flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow`}>
                    <div className="text-center">
                      <div className={`w-24 h-24 mx-auto rounded-full ${useCase.color} flex items-center justify-center mb-4 shadow-lg`}>
                        {React.cloneElement(useCase.icon, { className: "w-12 h-12" })}
                      </div>
                      <p className="text-gray-600 font-medium">Perfect for</p>
                      <p className="text-2xl font-bold text-gray-900">{useCase.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-gray-400 text-xl">
              See what our customers have to say about their experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "Restaurant Owner", text: "QuickServe transformed our operations. We now handle 3x more orders with the same staff." },
              { name: "Mike Chen", role: "Cafe Manager", text: "The mobile ordering feature is a game-changer. Our customers love the convenience." },
              { name: "Emily Davis", role: "Chain Director", text: "Managing multiple locations has never been easier. Highly recommended!" }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-800 p-8 rounded-2xl">
                <p className="text-gray-300 text-lg mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="text-white font-bold">{testimonial.name}</p>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-10">
            Join hundreds of successful restaurants using QuickServe to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-green-600 text-white px-8 py-4 rounded-full font-bold hover:bg-green-700 transition-all"
            >
              Get Started Free
            </Link>
            <Link 
              href="/contact" 
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UseCases;
