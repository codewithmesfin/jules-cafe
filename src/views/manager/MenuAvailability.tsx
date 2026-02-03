"use client";
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Package, Filter, MoreVertical, Edit } from 'lucide-react';
import { api } from '../../utils/api';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Product, Category } from '../../types';

const MenuAvailability: React.FC = () => {
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll(),
      ]);
      setProducts(Array.isArray(prodRes) ? prodRes : prodRes.data || []);
      setCategories(Array.isArray(catRes) ? catRes : catRes.data || []);
    } catch (error) {
      console.error('Failed to fetch menu availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (product: Product, currentStatus: boolean) => {
    try {
      await api.products.update((product.id || (product as any)._id)!, { is_active: !currentStatus });
      showNotification(`Updated status for ${product.name}`);
      fetchData();
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const filteredProducts = products.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Menu Availability</h1>
        <p className="text-slate-500 font-medium">Quickly toggle item availability for your storefront</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
          <input
            placeholder="Search items by name..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden border">
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24">
             <Package size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold">No products found in catalog</p>
          </div>
        ) : (
          <Table
            data={filteredProducts}
            columns={[
              {
                header: 'Menu Product',
                accessor: (p) => (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
                       {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Package size={20} className="text-slate-200" />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 leading-tight">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {categories.find(c => (c.id === p.category_id || (c as any)._id === p.category_id))?.name || 'Item'}
                      </p>
                    </div>
                  </div>
                )
              },
              {
                header: 'Live Status',
                accessor: (p) => (
                  <div className="flex items-center gap-2">
                     <div className={cn("w-2 h-2 rounded-full", p.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]")} />
                     <Badge
                       className={cn(
                         "font-black text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg border-none",
                         p.is_active ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"
                       )}
                     >
                       {p.is_active ? 'Available' : 'Sold Out'}
                     </Badge>
                  </div>
                )
              },
              {
                header: 'Action Control',
                accessor: (p) => (
                  <Button
                    variant={p.is_active ? 'outline' : 'primary'}
                    size="sm"
                    className={cn(
                      "gap-2 rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-4",
                      p.is_active ? "border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100" : "bg-blue-600 text-white"
                    )}
                    onClick={() => handleToggle(p, p.is_active)}
                  >
                    {p.is_active ? (
                      <>
                        <XCircle size={14} /> Disable
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} /> Enable
                      </>
                    )}
                  </Button>
                )
              }
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default MenuAvailability;
