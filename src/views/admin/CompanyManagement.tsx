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
      showNotification('Business saved');
      setIsModalOpen(false);
      await refreshUser();
    } catch (error: any) { 
      showNotification(error.message || 'Failed', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const openModal = (biz: Business | null = null) => {
    if (biz) {
      setEditingBusiness(biz);
      setFormData({ 
        name: biz.name || '', 
        legal_name: biz.legal_name || '', 
        address: biz.address || '', 
        description: biz.description || '', 
        logo: (biz as any).logo || '', 
        banner: (biz as any).banner || '' 
      });
    } else {
      setEditingBusiness(null);
      setFormData({ name: '', legal_name: '', address: '', description: '', logo: '', banner: '' });
    }
    setIsModalOpen(true);
  };

  // Loading skeleton
  if (!currentBusiness) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-100 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Workspaces</h1>
          <p className="text-slate-500 text-sm">Manage your business entities</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => openModal()}>
            <Plus size={18} className="mr-2" /> Add Business
          </Button>
        )}
      </div>

      {/* Current Business */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
              <Building2 size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentBusiness.name}</h2>
              <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                <MapPin size={14} />
                <span>{currentBusiness.address || 'No address'}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => openModal(currentBusiness as any)}>
            <Edit size={14} className="mr-1" /> Edit
          </Button>
        </div>
      </Card>

      {/* All Workspaces */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4">All Workspaces</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses?.map((biz: any) => (
            <div
              key={biz._id}
              onClick={() => switchBusiness(biz._id)}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all",
                (currentBusiness as any)?._id === biz._id 
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" 
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                  (currentBusiness as any)?._id === biz._id 
                    ? "bg-slate-900 text-white" 
                    : "bg-slate-100 text-slate-600"
                )}>
                  {biz.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{biz.name}</p>
                  <p className="text-xs text-slate-400 truncate">{biz.slug}</p>
                </div>
              </div>
              {(currentBusiness as any)?._id === biz._id && (
                <div className="flex items-center gap-1 text-slate-600 text-sm">
                  <LayoutDashboard size={14} />
                  <span>Active</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBusiness ? "Edit Workspace" : "Add Workspace"}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            placeholder="Business name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input
            label="Legal Name"
            placeholder="Legal business name"
            value={formData.legal_name}
            onChange={e => setFormData({...formData, legal_name: e.target.value})}
          />
          <Input
            label="Address"
            placeholder="Business address"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
          <Input
            label="Logo URL"
            placeholder="https://..."
            value={formData.logo}
            onChange={e => setFormData({...formData, logo: e.target.value})}
          />
          <Input
            label="Banner URL"
            placeholder="https://..."
            value={formData.banner}
            onChange={e => setFormData({...formData, banner: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 min-h-[80px]"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your business..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BusinessManagement;
