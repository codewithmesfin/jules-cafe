import React from 'react';
import Link from 'next/link';
import { 
  Zap, Shield, Smartphone, Globe, Clock, Users, 
  CreditCard, BarChart, ArrowRight 
} from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Lightning Fast Performance",
      description: "Our platform is optimized for speed, ensuring smooth navigation and quick order placement even during peak hours.",
      color: "text-yellow-500"
    },
    {
      icon: <Smartphone className="w-10 h-10" />,
      title: "Mobile First Design",
      description: "Fully responsive design that works beautifully on all devices - phones, tablets, and desktop computers.",
      color: "text-blue-500"
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: "Multi-Language Support",
      description: "Serve customers in their preferred language with built-in internationalization support.",
      color: "text-green-500"
    },
    {
      icon: <Clock className="w-10 h-10" />,
      title: "Real-Time Updates",
      description: "Get instant notifications about order status, menu changes, and special promotions.",
      color: "text-purple-500"
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Secure Payments",
      description: "Industry-standard encryption and secure payment processing for safe transactions.",
      color: "text-red-500"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Multi-Tenant Architecture",
      description: "Perfect for restaurant chains with separate management for each location while maintaining brand consistency.",
      color: "text-indigo-500"
    },
    {
      icon: <BarChart className="w-10 h-10" />,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into sales, customer behavior, and popular menu items.",
      color: "text-cyan-500"
    },
    {
      icon: <CreditCard className="w-10 h-10" />,
      title: "Multiple Payment Options",
      description: "Support for credit cards, mobile payments, and cash on delivery.",
      color: "text-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Powerful <span className="text-[#e60023]">Features</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Built with modern technology to deliver exceptional user experiences. 
            Discover what makes Abc Cafe the preferred choice for restaurants and customers.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 bg-[#e60023] text-white px-8 py-4 rounded-full font-bold hover:bg-[#ad081b] transition-all shadow-lg hover:shadow-xl"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 lg:p-8 rounded-2xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 transition-all hover:shadow-xl"
              >
                <div className={`${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#e60023]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-white mb-2">10K+</p>
              <p className="text-red-100 text-lg">Orders Processed</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-white mb-2">500+</p>
              <p className="text-red-100 text-lg">Restaurant Partners</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-white mb-2">50K+</p>
              <p className="text-red-100 text-lg">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-white mb-2">99.9%</p>
              <p className="text-red-100 text-lg">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Experience All Features Today
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-10">
            Join the growing community of restaurants and customers who trust Abc Cafe.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Features;
