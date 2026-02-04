"use client";
import React, { useState } from 'react';
import { Building2, MapPin, Edit, Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import type { Business } from '../../types';
import { cn } from '../../utils/cn';

const BusinessManagement: React.FC = () => {
  const { user, currentBusiness, businesses, refreshUser, switchBusiness } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({ name: '', legal_name: '', address: '', description: '', logo: '', banner: '' });

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingBusiness) await api.business.update(editingBusiness._id || editingBusiness.id!, formData);
      else await api.business.create(formData);
      showNotification('Business saved'); setIsModalOpen(false); await refreshUser();
    } catch (error: any) { showNotification(error.message || 'Failed', 'error'); } finally { setLoading(false); }
  };

  const openModal = (biz: Business | null = null) => {
    if (biz) {
      setEditingBusiness(biz); setFormData({ name: biz.name || '', legal_name: biz.legal_name || '', address: biz.address || '', description: biz.description || '', logo: (biz as any).logo || '', banner: (biz as any).banner || '' });
    } else {
      setEditingBusiness(null); setFormData({ name: '', legal_name: '', address: '', description: '', logo: '', banner: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-black text-slate-900 tracking-tight">Workspaces</h1><p className="text-slate-500 font-medium">Manage your business entities</p></div>
        {user?.role === 'admin' && <Button onClick={() => openModal()} className="gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-black"><Plus size={20} /> Add Business</Button>}
      </div>
      {currentBusiness && (
        <Card className="p-8 border-slate-100 rounded-[2.5rem] shadow-sm bg-white border">
          <div className="flex justify-between items-start">
            <div className="flex gap-6">
              <div className="w-20 h-20 bg-[#e60023] rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-red-100"><Building2 size={40} /></div>
              <div><h2 className="text-3xl font-black text-slate-900 mb-2">{currentBusiness.name}</h2><p className="text-slate-500 flex items-center gap-2"><MapPin size={16} /> {currentBusiness.address || 'No address'}</p></div>
            </div>
            <Button variant="outline" onClick={() => openModal(currentBusiness as any)} className="rounded-xl h-12 px-6 border-slate-200 font-bold">Edit</Button>
          </div>
        </Card>
      )}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 px-2">All Workspaces</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses?.map((biz: any) => (
            <div key={biz._id} className={cn("p-6 rounded-[2.5rem] border transition-all cursor-pointer", (currentBusiness as any)?._id === biz._id ? "border-[#e60023] ring-4 ring-red-50 shadow-xl" : "bg-white hover:border-[#e60023]")} onClick={() => switchBusiness(biz._id)}>
              <div className="flex items-center gap-4 mb-6"><div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black", (currentBusiness as any)?._id === biz._id ? "bg-blue-600 text-white" : "bg-slate-100")}>{biz.name.charAt(0)}</div><div><h4 className="font-black text-slate-900">{biz.name}</h4><p className="text-[10px] text-slate-400 uppercase">{biz.slug}</p></div></div>
              {(currentBusiness as any)?._id === biz._id && <div className="text-[#e60023]"><LayoutDashboard size={20} /></div>}
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Workspace Details" className="max-w-md" footer={<div className="flex gap-3 w-full"><Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl h-12">Cancel</Button><Button onClick={handleSave} disabled={loading} className="flex-1 rounded-xl h-12 bg-[#e60023] text-white font-black">{loading ? '...' : 'Save'}</Button></div>}>
        <div className="space-y-4 pt-4">
          <Input label="Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl h-12" />
          <Input label="Legal Name" value={formData.legal_name} onChange={e => setFormData({...formData, legal_name: e.target.value})} className="rounded-xl h-12" />
          <Input label="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl h-12" />
          <Input label="Logo URL" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} className="rounded-xl h-12" placeholder="https://..." />
          <Input label="Banner URL" value={formData.banner} onChange={e => setFormData({...formData, banner: e.target.value})} className="rounded-xl h-12" placeholder="https://..." />
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe your business..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default BusinessManagement;
