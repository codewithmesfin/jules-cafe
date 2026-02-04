"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowRight, Loader2, Ruler, RefreshCcw } from 'lucide-react';
import { api } from '@/utils/api';
import { RoleGuard } from '@/components/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
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
      setUnits(uRes); setConversions(cRes);
    } catch (error) { showNotification('Failed to fetch units data', 'error'); } finally { setLoading(false); }
  };
  const handleSaveUnit = async () => {
    try {
      if (editingUnit) await api.settings.updateUnit(editingUnit.id, unitForm);
      else await api.settings.createUnit(unitForm);
      showNotification('Unit saved'); setIsUnitModalOpen(false); fetchData();
    } catch (error: any) { showNotification(error.message || 'Error saving unit', 'error'); }
  };
  const handleSaveConv = async () => {
    try {
      if (editingConv) await api.settings.updateConversion(editingConv.id, convForm);
      else await api.settings.createConversion(convForm);
      showNotification('Conversion saved'); setIsConvModalOpen(false); fetchData();
    } catch (error: any) { showNotification(error.message || 'Error saving conversion', 'error'); }
  };
  const handleDeleteUnit = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { await api.settings.deleteUnit(id); showNotification('Unit deleted'); fetchData(); }
    catch (error: any) { showNotification(error.message || 'Error deleting unit', 'error'); }
  };
  const handleDeleteConv = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { await api.settings.deleteConversion(id); showNotification('Conversion deleted'); fetchData(); }
    catch (error: any) { showNotification(error.message || 'Error deleting conversion', 'error'); }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'manager']}>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div><h1 className="text-3xl font-black text-slate-900 tracking-tight">Units & Metrics</h1><p className="text-slate-500 font-medium">Standardize measurements across your inventory and recipes</p></div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={() => { setEditingUnit(null); setUnitForm({name:'', description:''}); setIsUnitModalOpen(true); }} className="rounded-2xl h-12 px-6 border-slate-200 font-bold"><Plus size={18} className="mr-2" /> New Unit</Button>
             <Button onClick={() => { setEditingConv(null); setConvForm({from_unit:'', to_unit:'', factor:1}); setIsConvModalOpen(true); }} className="rounded-2xl h-12 px-6 bg-[#e60023] hover:bg-[#ad081b] font-bold shadow-lg shadow-red-100"><RefreshCcw size={18} className="mr-2" /> Add Conversion</Button>
          </div>
        </div>
        {loading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={48} /></div> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Ruler size={20} /></div><h2 className="text-xl font-black text-slate-900">Custom Units</h2></div>
              <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
                {units.length === 0 ? <div className="p-12 text-center text-slate-400 font-bold">No units defined</div> : units.map((unit) => (
                  <div key={unit.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                    <div><p className="font-black text-slate-900">{unit.name}</p><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{unit.description || 'No description'}</p></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingUnit(unit); setUnitForm({name:unit.name, description:unit.description||''}); setIsUnitModalOpen(true); }} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100"><Edit size={18} /></button>
                      <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-rose-600 transition-all border border-transparent hover:border-slate-100"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 flex items-center gap-3"><div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><RefreshCcw size={20} /></div><h2 className="text-xl font-black text-slate-900">Unit Conversions</h2></div>
              <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
                {conversions.length === 0 ? <div className="p-12 text-center text-slate-400 font-bold">No conversions defined</div> : conversions.map((conv) => (
                  <div key={conv.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-4"><div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg"><span className="font-black text-slate-900 text-sm">{conv.from_unit}</span><ArrowRight size={14} className="text-slate-400" /><span className="font-black text-slate-900 text-sm">{conv.to_unit}</span></div><p className="text-xs font-black text-blue-600 uppercase tracking-widest">Factor: {conv.factor}</p></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingConv(conv); setConvForm({from_unit:conv.from_unit, to_unit:conv.to_unit, factor:conv.factor}); setIsConvModalOpen(true); }} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100"><Edit size={18} /></button>
                      <button onClick={() => handleDeleteConv(conv.id)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-rose-600 transition-all border border-transparent hover:border-slate-100"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Modal isOpen={isUnitModalOpen} onClose={() => setIsUnitModalOpen(false)} title={editingUnit ? "Update Unit" : "Register New Unit"} className="max-w-md" footer={<div className="flex gap-3 w-full"><Button variant="outline" onClick={() => setIsUnitModalOpen(false)} className="flex-1 rounded-xl h-12 font-bold">Cancel</Button><Button onClick={handleSaveUnit} className="flex-1 rounded-xl h-12 bg-[#e60023] hover:bg-[#ad081b] font-black shadow-lg shadow-red-100">Save Unit</Button></div>}>
        <div className="space-y-4 py-2"><Input label="Unit Name (e.g. KG, Liters)" value={unitForm.name} onChange={e => setUnitForm({...unitForm, name: e.target.value})} className="rounded-xl h-12" /><Input label="Description" value={unitForm.description} onChange={e => setUnitForm({...unitForm, description: e.target.value})} className="rounded-xl h-12" /></div>
      </Modal>
      <Modal isOpen={isConvModalOpen} onClose={() => setIsConvModalOpen(false)} title={editingConv ? "Update Conversion" : "New Unit Conversion"} className="max-w-md" footer={<div className="flex gap-3 w-full"><Button variant="outline" onClick={() => setIsConvModalOpen(false)} className="flex-1 rounded-xl h-12 font-bold">Cancel</Button><Button onClick={handleSaveConv} className="flex-1 rounded-xl h-12 bg-[#e60023] hover:bg-[#ad081b] font-black shadow-lg shadow-red-100">Save Conversion</Button></div>}>
        <div className="space-y-4 py-2"><div className="grid grid-cols-2 gap-4"><Input label="From Unit" placeholder="KG" value={convForm.from_unit} onChange={e => setConvForm({...convForm, from_unit: e.target.value})} className="rounded-xl h-12" /><Input label="To Unit" placeholder="G" value={convForm.to_unit} onChange={e => setConvForm({...convForm, to_unit: e.target.value})} className="rounded-xl h-12" /></div><Input label="Multiplication Factor" type="number" value={convForm.factor} onChange={e => setConvForm({...convForm, factor: parseFloat(e.target.value) || 0})} className="rounded-xl h-12" /><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Formula: 1 {convForm.from_unit || '?'} = {convForm.factor} {convForm.to_unit || '?'}</p></div>
      </Modal>
    </RoleGuard>
  );
}
