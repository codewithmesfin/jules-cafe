import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { Card } from '../../components/ui/Card';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, totalAmount } = useCart();
  const router = useRouter();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="text-orange-500 w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet.
          Go ahead and explore our menu!
        </p>
        <Link href="/menu">
          <Button size="lg">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold">Your Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-0">
              <div className="flex flex-col sm:flex-row p-4 gap-4">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full sm:w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-1">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="font-bold text-lg">${(item.base_price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24" title="Order Summary">
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service Fee (5%)</span>
                <span>${(totalAmount * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${(totalAmount * 0.08).toFixed(2)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>${(totalAmount * 1.13).toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push('/orders')} // Just simulate order placement
              >
                Place Order
              </Button>
              <p className="text-center text-xs text-gray-400">
                By placing this order, you agree to our Terms and Conditions.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
