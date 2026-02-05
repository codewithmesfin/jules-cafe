"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowRight, Ruler, RefreshCcw } from 'lucide-react';
import { api } from '@/utils/api';
import { RoleGuard } from '@/components/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNotification } from '@/context/NotificationContext';

export default function UnitsPage() {
  const { showNotification } = useNotification();
  const [units, setUnits] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isConvModalOpen, setIsConvModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [editingConv, setEditingConv] = useState<any>(null);
  const [unitForm, setUnitForm] = useState({ name: '', description: '' });
  const [convForm, setConvForm] = useState({ from_unit: '', to_unit: '', factor: 1 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, cRes] = await Promise.all([api.settings.getUnits(), api.settings.getConversions()]);
      setUnits(uRes);
      setConversions(cRes);
    } catch (error) { 
      showNotification('Failed to fetch units data', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSaveUnit = async () => {
    try {
      if (editingUnit) await api.settings.updateUnit(editingUnit.id, unitForm);
      else await api.settings.createUnit(unitForm);
      showNotification('Unit saved');
      setIsUnitModalOpen(false);
      fetchData();
    } catch (error: any) { 
      showNotification(error.message || 'Error saving unit', 'error'); 
    }
  };

  const handleSaveConv = async () => {
    try {
      if (editingConv) await api.settings.updateConversion(editingConv.id, convForm);
      else await api.settings.createConversion(convForm);
      showNotification('Conversion saved');
      setIsConvModalOpen(false);
      fetchData();
    } catch (error: any) { 
      showNotification(error.message || 'Error saving conversion', 'error'); 
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { 
      await api.settings.deleteUnit(id); 
      showNotification('Unit deleted'); 
      fetchData(); 
    }
    catch (error: any) { showNotification(error.message || 'Error deleting unit', 'error'); }
  };

  const handleDeleteConv = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { 
      await api.settings.deleteConversion(id); 
      showNotification('Conversion deleted'); 
      fetchData(); 
    }
    catch (error: any) { showNotification(error.message || 'Error deleting conversion', 'error'); }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Units</h1>
            <p className="text-slate-500 text-sm">Manage measurements and conversions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setEditingUnit(null); setUnitForm({name:'', description:''}); setIsUnitModalOpen(true); }}>
              <Plus size={16} className="mr-1" /> Unit
            </Button>
            <Button size="sm" onClick={() => { setEditingConv(null); setConvForm({from_unit:'', to_unit:'', factor:1}); setIsConvModalOpen(true); }}>
              <RefreshCcw size={16} className="mr-1" /> Conversion
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Units Card */}
          <Card title="Custom Units" padding="none">
            <div className="divide-y divide-slate-100">
              {units.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Ruler size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No units defined</p>
                </div>
              ) : (
                units.map((unit) => (
                  <div key={unit.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{unit.name}</p>
                      <p className="text-xs text-slate-500">{unit.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingUnit(unit); setUnitForm({name:unit.name, description:unit.description||''}); setIsUnitModalOpen(true); }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Conversions Card */}
          <Card title="Unit Conversions" padding="none">
            <div className="divide-y divide-slate-100">
              {conversions.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCcw size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No conversions defined</p>
                </div>
              ) : (
                conversions.map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="neutral" size="sm">{conv.from_unit}</Badge>
                      <ArrowRight size={14} className="text-slate-400" />
                      <Badge variant="neutral" size="sm">{conv.to_unit}</Badge>
                      <span className="text-xs text-slate-500">×{conv.factor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingConv(conv); setConvForm({from_unit:conv.from_unit, to_unit:conv.to_unit, factor:conv.factor}); setIsConvModalOpen(true); }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteConv(conv.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Unit Modal */}
        <Modal
          isOpen={isUnitModalOpen}
          onClose={() => setIsUnitModalOpen(false)}
          title={editingUnit ? "Edit Unit" : "Add Unit"}
          footer={
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setIsUnitModalOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSaveUnit}>Save</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Unit Name"
              placeholder="e.g., KG, Liters"
              value={unitForm.name}
              onChange={e => setUnitForm({...unitForm, name: e.target.value})}
            />
            <Input
              label="Description"
              placeholder="Optional description"
              value={unitForm.description}
              onChange={e => setUnitForm({...unitForm, description: e.target.value})}
            />
          </div>
        </Modal>

        {/* Conversion Modal */}
        <Modal
          isOpen={isConvModalOpen}
          onClose={() => setIsConvModalOpen(false)}
          title={editingConv ? "Edit Conversion" : "Add Conversion"}
          footer={
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setIsConvModalOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSaveConv}>Save</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="From Unit"
                placeholder="e.g., KG"
                value={convForm.from_unit}
                onChange={e => setConvForm({...convForm, from_unit: e.target.value})}
              />
              <Input
                label="To Unit"
                placeholder="e.g., G"
                value={convForm.to_unit}
                onChange={e => setConvForm({...convForm, to_unit: e.target.value})}
              />
            </div>
            <Input
              label="Factor"
              type="number"
              step="0.01"
              placeholder="Conversion factor"
              value={convForm.factor || ''}
              onChange={e => setConvForm({...convForm, factor: parseFloat(e.target.value) || 0})}
            />
            <p className="text-xs text-slate-500">1 {convForm.from_unit || 'unit'} = {convForm.factor} {convForm.to_unit || 'unit'}</p>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
