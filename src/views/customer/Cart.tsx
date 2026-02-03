"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Grid, CreditCard, ChevronRight, ShieldCheck } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, totalAmount, clearCart, tableId, tableNo } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.tenant_id as string;
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await api.public.getBusiness(tenantId);
        setBusiness(response.data || response);
      } catch (e) {}
    };
    fetchBusiness();
  }, [tenantId]);

  const subtotal = totalAmount;
  const tax = subtotal * 0.1; // 10% tax example
  const finalTotal = subtotal + tax;

  const handlePlaceOrder = async () => {
    // Note: In a real world, you might want to allow guest checkout or force login
    if (!user) {
      showNotification('Please sign in to complete your order', 'info');
      router.push(`/${tenantId}/login`);
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        customer_id: undefined, // Could link to a Customer record if needed
        table_id: tableId || undefined,
        notes: `Customer Order via Mobile`,
        payment_method: 'cash',
        items: cartItems.map(item => ({
          product_id: item.id || item._id,
          quantity: item.quantity
        }))
      };

      await api.orders.create(orderData);
      showNotification('Order transmitted to kitchen!');
      clearCart();
      router.push(`/${tenantId}/orders`);
    } catch (error: any) {
      showNotification(error.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 max-w-sm w-full">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="text-slate-200 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Cart is Empty</h1>
          <p className="text-slate-500 font-medium mb-10">
            Your basket is waiting to be filled with our signature dishes.
          </p>
          <Link href={`/${tenantId}/menu`} className="block">
            <Button size="lg" className="w-full rounded-2xl h-14 font-black shadow-lg shadow-blue-100">
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-black text-slate-900">Your Basket</h1>
          </div>
          <Badge className="bg-blue-50 text-blue-600 border-none font-black px-4 py-1.5 rounded-xl">
            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id || item._id} className="bg-white rounded-[2rem] border border-slate-100 p-4 flex gap-4 hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Grid size={32} strokeWidth={1} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-black text-slate-900 truncate">{item.name}</h3>
                    <button
                      onClick={() => removeFromCart((item.id || item._id)!)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-1 border border-slate-100">
                      <button
                        onClick={() => updateQuantity((item.id || item._id)!, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg text-slate-500 transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-4 text-center font-black text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity((item.id || item._id)!, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg text-slate-900 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="font-black text-blue-600 text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1 space-y-6">
            {tableNo && (
              <Card className="rounded-[2rem] border-slate-100 p-6 bg-slate-900 text-white border-none shadow-xl shadow-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl">
                    <Grid size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Serving Table</p>
                    <p className="text-xl font-black">Table {tableNo}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="rounded-[2rem] border-slate-100 p-8 bg-white border shadow-sm sticky top-28">
              <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Bill Summary</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Sales Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-black text-slate-900">Final Amount</span>
                  <span className="text-3xl font-black text-blue-600">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-16 rounded-2xl font-black text-lg shadow-lg shadow-blue-100"
                  disabled={loading}
                  onClick={handlePlaceOrder}
                >
                  {loading ? 'Processing...' : 'Complete Order'}
                  {!loading && <ChevronRight className="ml-2" size={20} />}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                   <ShieldCheck size={14} className="text-green-500" />
                   Secure Checkout by lunixPOS
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
