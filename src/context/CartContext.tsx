"use client";
import React, { createContext, useContext, useState } from 'react';
import type { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Product) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  tableId: string | null;
  tableNo: string | null;
  setTableId: (id: string | null) => void;
  setTableNo: (no: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);
  const [tableNo, setTableNo] = useState<string | null>(null);

  const addToCart = (item: Product) => {
    setCartItems(prev => {
      const id = item.id || item._id;
      const existing = prev.find(i => (i.id === id || i._id === id));
      if (existing) {
        return prev.map(i => (i.id === id || i._id === id) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(i => (i.id !== itemId && i._id !== itemId)));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => prev.map(i => (i.id === itemId || i._id === itemId) ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalAmount,
      tableId,
      tableNo,
      setTableId,
      setTableNo
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
