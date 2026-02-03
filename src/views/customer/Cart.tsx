"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Grid, CreditCard, ChevronRight, ShieldCheck } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
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
    if (!user) {
      showNotification('Please sign in to complete your order', 'info');
      router.push(`/${tenantId}/login`);
      return;
    }

    if (!business) {
      showNotification('Business context missing. Please refresh.', 'error');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        business_id: business.id || business._id,
        customer_id: user.role === 'customer' ? user.id : undefined,
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
        <div className="bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 max-w-sm w-full border border-slate-100">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="text-slate-200 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Cart is Empty</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">
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
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all border border-transparent hover:border-slate-100"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Basket</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl">
             <ShoppingBag size={18} />
             <span className="font-black text-xs uppercase tracking-widest">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id || item._id} className="bg-white rounded-[2.5rem] border border-slate-100 p-5 flex gap-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group border shadow-sm">
                <div className="w-28 h-28 rounded-[1.75rem] overflow-hidden bg-slate-50 shrink-0 border border-slate-50 shadow-inner">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Grid size={40} strokeWidth={1} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                       <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gourmet Selection</p>
                    </div>
                    <button
                      onClick={() => removeFromCart((item.id || item._id)!)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-5 bg-slate-50 rounded-2xl p-1.5 border border-slate-100 shadow-inner">
                      <button
                        onClick={() => updateQuantity((item.id || item._id)!, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-6 text-center font-black text-slate-900 text-lg">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity((item.id || item._id)!, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-100 rounded-xl text-slate-900 transition-all shadow-sm"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <span className="font-black text-blue-600 text-2xl tracking-tighter">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1 space-y-6">
            {tableNo && (
              <div className="rounded-[2.5rem] p-8 bg-slate-900 text-white shadow-2xl shadow-slate-200 border-none relative overflow-hidden group">
                <div className="relative z-10 flex items-center gap-5">
                  <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/50">
                    <Grid size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Active Station</p>
                    <p className="text-2xl font-black">Table {tableNo}</p>
                  </div>
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
              </div>
            )}

            <Card className="rounded-[2.5rem] border-slate-100 p-8 bg-white border shadow-xl shadow-slate-200/50 sticky top-28">
              <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-[0.1em]">Bill Overview</h3>

              <div className="space-y-5 mb-10">
                <div className="flex justify-between text-slate-500 font-bold text-sm">
                  <span>Gross Subtotal</span>
                  <span className="text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold text-sm">
                  <span>Sales Tax (10%)</span>
                  <span className="text-slate-900">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-center">
                  <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Total Amount</span>
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all"
                  disabled={loading}
                  onClick={handlePlaceOrder}
                >
                  {loading ? 'Transmitting...' : 'Confirm Order'}
                  {!loading && <ChevronRight className="ml-2" size={20} />}
                </Button>

                <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pt-4">
                   <ShieldCheck size={16} className="text-green-500/50" />
                   Verified by lunixPOS
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
