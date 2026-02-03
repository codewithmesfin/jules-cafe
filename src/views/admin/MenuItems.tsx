"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, ShoppingBag, Clock } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

const MenuAvailability: React.FC = () => {
  const { currentBusiness } = useAuth();
  const { showNotification } = useNotification();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [formData, setFormData] = useState({ product_id: '', is_available: true, display_order: 0, available_from: '', available_to: '' });

  useEffect(() => { fetchData(); }, [currentBusiness]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, prodRes] = await Promise.all([api.menu.getAll(), api.products.getAll()]);
      setMenuItems(menuRes); setProducts(prodRes);
    } catch (error) { console.error('Fetch error:', error); } finally { setLoading(false); }
  };
  const handleSave = async () => {
    try {
      if (editingMenu) await api.menu.update(editingMenu.id, formData);
      else await api.menu.create(formData);
      showNotification('Menu updated'); setIsModalOpen(false); fetchData();
    } catch (error: any) { showNotification(error.message || 'Error saving', 'error'); }
  };
  const filteredMenu = menuItems.filter(m => {
     const prod = products.find(p => p.id === (m.product_id?.id || m.product_id));
     return prod?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-black text-slate-900 tracking-tight">Public Menu</h1><p className="text-slate-500 font-medium">Product availability on your digital menu</p></div>
        <Button onClick={() => { setEditingMenu(null); setFormData({ product_id: '', is_available: true, display_order: 0, available_from: '', available_to: '' }); setIsModalOpen(true); }} className="gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-black"><Plus size={20} /> Add to Menu</Button>
      </div>
      <div className="relative group max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 w-5 h-5" /><input placeholder="Search menu..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? <div className="py-24 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div> : (
          <Table data={filteredMenu} columns={[
            { header: 'Product', accessor: (m) => <span className="font-black text-slate-900">{products.find(p => p.id === (m.product_id?.id || m.product_id))?.name || 'Unknown'}</span> },
            { header: 'Status', accessor: (m) => <Badge variant={m.is_available ? 'success' : 'neutral'} className="font-black text-[10px]">{m.is_available ? 'Live' : 'Hidden'}</Badge> },
            { header: 'Sort', accessor: (m) => <span className="font-bold text-slate-400">Pos. {m.display_order}</span> },
            { header: 'Actions', accessor: (m) => <div className="flex items-center gap-2"><button onClick={() => { setEditingMenu(m); setFormData({ product_id: m.product_id?.id || m.product_id, is_available: m.is_available, display_order: m.display_order, available_from: m.available_from || '', available_to: m.available_to || '' }); setIsModalOpen(true); }} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400"><Edit size={18} /></button><button onClick={async () => { if(confirm('Remove?')){ await api.menu.delete(m.id); fetchData(); } }} className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-400"><Trash2 size={18} /></button></div> }
          ]} />
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Menu Item" className="max-w-md" footer={<div className="flex gap-3 w-full"><Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl h-12">Cancel</Button><Button onClick={handleSave} className="flex-1 rounded-xl h-12 bg-blue-600 text-white font-black shadow-lg shadow-blue-100">Save</Button></div>}>
        <div className="space-y-6 pt-4">{!editingMenu && <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product</label><select className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold appearance-none cursor-pointer" value={formData.product_id} onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}><option value="">Select...</option>{products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div>}
          <div className="grid grid-cols-2 gap-4"><Input label="Display Order" type="number" value={formData.display_order} onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})} className="rounded-xl h-12" /><div className="flex items-center gap-3 pt-8 px-2"><input type="checkbox" id="is_available" className="w-5 h-5 rounded-lg border-slate-200 text-blue-600" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} /><label htmlFor="is_available" className="text-sm font-black text-slate-700">Available</label></div></div>
        </div>
      </Modal>
    </div>
  );
};
export default MenuAvailability;
