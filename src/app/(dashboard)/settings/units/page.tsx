"use client";

import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { RoleGuard } from '../../../../components/RoleGuard';
import { Plus, Edit, Trash2, ArrowRight } from 'lucide-react';

export default function UnitsPage() {
  const unitConversions = [
    { id: 1, from: 'kg', to: 'g', factor: 1000 },
    { id: 2, from: 'L', to: 'mL', factor: 1000 },
    { id: 3, from: 'box', to: 'pieces', factor: 12 },
    { id: 4, from: 'dozen', to: 'pieces', factor: 12 },
  ];

  const customUnits = [
    { id: 1, name: 'portion', description: 'Standard portion size' },
    { id: 2, name: 'serving', description: 'Single serving size' },
    { id: 3, name: 'plate', description: 'Full plate portion' },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Units & Conversions</h1>
            <p className="text-slate-500">Manage measurement units and conversions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
            <Plus size={20} />
            Add Conversion
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Unit Conversions</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {unitConversions.map((conversion) => (
                <div key={conversion.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">{conversion.from}</span>
                    <ArrowRight size={16} className="text-slate-400" />
                    <span className="font-semibold text-slate-900">{conversion.to}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">1 {conversion.from} = {conversion.factor} {conversion.to}</span>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit size={16} className="text-slate-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Custom Units</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {customUnits.map((unit) => (
                <div key={unit.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-900">{unit.name}</p>
                    <p className="text-sm text-slate-500">{unit.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit size={16} className="text-slate-500" />
                    </button>
                    <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={16} className="text-rose-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
