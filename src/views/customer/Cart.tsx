"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Grid } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { Branch } from '../../types';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, totalAmount, clearCart, branchId, tableId, tableNo } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await api.branches.getAll();
        setBranches(data);
        if (branchId) {
          setSelectedBranchId(branchId);
        } else if (data.length > 0) {
          setSelectedBranchId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      }
    };
    fetchBranches();
  }, [branchId]);

  const discountRate = user?.discount_rate || 0;
  const discountAmount = (totalAmount * discountRate) / 100;
  const subtotalAfterDiscount = totalAmount - discountAmount;
  const serviceFee = subtotalAfterDiscount * 0.05;
  const tax = subtotalAfterDiscount * 0.08;
  const finalTotal = subtotalAfterDiscount + serviceFee + tax;

  const handlePlaceOrder = async () => {
    if (!user) {
      showNotification('Please login to place an order', 'error');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        customer_id: user.id,
        branch_id: selectedBranchId,
        table_id: tableId || undefined,
        status: 'pending',
        type: 'self-service',
        total_amount: finalTotal,
        discount_amount: discountAmount,
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          menu_item_name: item.name,
          quantity: item.quantity,
          unit_price: item.base_price
        }))
      };

      await api.orders.create(orderData);
      showNotification('Order placed successfully!');
      clearCart();
      router.push('/orders');
    } catch (error) {
      showNotification('Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

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
                  src={item.image_url || undefined}
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

        <div className="lg:col-span-1 space-y-6">
          <Card title="Order Settings">
            <div className="space-y-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  disabled={!!branchId}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name || b.branch_name}</option>
                  ))}
                </select>
              </div>

              {tableNo && (
                <div className="p-3 bg-orange-50 rounded-lg flex items-center gap-3 text-orange-800">
                  <Grid className="text-orange-500" size={18} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Assigned Table</p>
                    <p className="font-bold">Table {tableNo}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="sticky top-24" title="Order Summary">
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              {discountRate > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({user?.customer_type?.toUpperCase()} {discountRate}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Service Fee (5%)</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span className="text-orange-600">${finalTotal.toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={loading}
                onClick={handlePlaceOrder}
              >
                {loading ? 'Processing...' : 'Place Order'}
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
