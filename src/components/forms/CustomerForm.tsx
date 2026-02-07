"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useNotification } from '../../context/NotificationContext';
import type { Customer, CustomerType } from '../../types';

interface CustomerFormProps {
  customerId?: string;
  mode: 'create' | 'edit';
}

const customerTypeOptions: { value: CustomerType; label: string; color: string }[] = [
  { value: 'regular', label: 'Regular', color: 'bg-slate-100 text-slate-600' },
  { value: 'member', label: 'Member', color: 'bg-blue-100 text-blue-600' },
  { value: 'staff', label: 'Staff', color: 'bg-emerald-100 text-emerald-600' },
  { value: 'vip', label: 'VIP', color: 'bg-amber-100 text-amber-600' },
  { value: 'wholesale', label: 'Wholesale', color: 'bg-purple-100 text-purple-600' },
];

const CustomerForm: React.FC<CustomerFormProps> = ({ customerId, mode }) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);

  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCustomerType, setFormCustomerType] = useState<CustomerType>('regular');
  const [formDiscount, setFormDiscount] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    if (mode === 'edit' && customerId) {
      fetchCustomer();
    }
  }, [mode, customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const customer = await api.customers.getOne(customerId!);
      if (customer) {
        setFormFullName(customer.full_name || '');
        setFormEmail(customer.email || '');
        setFormPhone(customer.phone || '');
        setFormAddress(customer.address || '');
        setFormCustomerType(customer.customer_type || 'regular');
        setFormDiscount(customer.discount_percent || 0);
        setFormNotes(customer.notes || '');
        setFormIsActive(customer.is_active !== false);
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      showNotification('Failed to load customer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formFullName) {
      showNotification('Please enter customer name', 'error');
      return;
    }

    try {
      setSaving(true);
      const customerData = {
        full_name: formFullName,
        email: formEmail || undefined,
        phone: formPhone || undefined,
        address: formAddress || undefined,
        customer_type: formCustomerType,
        discount_percent: formDiscount,
        notes: formNotes || undefined,
        is_active: formIsActive
      };

      if (mode === 'edit' && customerId) {
        await api.customers.update(customerId, customerData);
        showNotification('Customer updated successfully');
      } else {
        await api.customers.create(customerData);
        showNotification('Customer created successfully');
      }
      router.push('/dashboard/customers');
    } catch (error: any) {
      showNotification(error.message || 'Failed to save customer', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-48 animate-pulse" />
        <Card className="p-6 space-y-4">
          <div className="h-12 bg-slate-100 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-slate-100 rounded" />
            <div className="h-12 bg-slate-100 rounded" />
          </div>
          <div className="h-12 bg-slate-100 rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/customers')}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {mode === 'edit' ? 'Edit Customer' : 'Add Customer'}
          </h1>
          <p className="text-slate-500 text-sm">
            {mode === 'edit' ? 'Update customer information' : 'Create a new customer'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <Input
            label="Full Name *"
            placeholder="Customer name"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
            <Input
              label="Phone"
              placeholder="+251..."
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>

          <Input
            label="Address"
            placeholder="Street, City..."
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Customer Type</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                value={formCustomerType}
                onChange={(e) => setFormCustomerType(e.target.value as CustomerType)}
              >
                {customerTypeOptions.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Discount (%)"
              type="number"
              min="0"
              max="100"
              value={formDiscount || ''}
              onChange={(e) => setFormDiscount(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              rows={4}
              placeholder="Notes, allergies, preferences..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active customer</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/customers')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              isLoading={saving}
              className="flex-1"
            >
              {mode === 'edit' ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomerForm;
