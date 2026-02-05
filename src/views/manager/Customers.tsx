"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, User as UserIcon, Users, Mail, Phone, Percent } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Customer, CustomerType } from '../../types';

const Customers: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Form state
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCustomerType, setFormCustomerType] = useState<CustomerType>('regular');
  const [formDiscount, setFormDiscount] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const customerTypeOptions: { value: CustomerType; label: string; color: string }[] = [
    { value: 'regular', label: 'Regular', color: 'bg-slate-100 text-slate-600' },
    { value: 'member', label: 'Member', color: 'bg-blue-100 text-blue-600' },
    { value: 'staff', label: 'Staff', color: 'bg-emerald-100 text-emerald-600' },
    { value: 'vip', label: 'VIP', color: 'bg-amber-100 text-amber-600' },
    { value: 'wholesale', label: 'Wholesale', color: 'bg-purple-100 text-purple-600' },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.customers.getAll();
      setCustomers(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const name = customer.full_name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (customer.phone && customer.phone.includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleSave = async () => {
    if (!formFullName) {
      showNotification("Please enter customer name", "error");
      return;
    }

    try {
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

      if (editingCustomer) {
        await api.customers.update((editingCustomer.id || editingCustomer._id)!, customerData);
        showNotification("Customer profile updated");
      } else {
        await api.customers.create(customerData);
        showNotification("New customer added");
      }
      setIsModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error: any) {
      showNotification(error.message || "Failed to save customer", "error");
    }
  };

  const handleDelete = async () => {
    if (customerToDelete) {
      try {
        await api.customers.delete((customerToDelete.id || customerToDelete._id)!);
        showNotification("Customer deleted", "warning");
        fetchCustomers();
      } catch (error: any) {
        showNotification(error.message || "Failed to delete", "error");
      } finally {
        setCustomerToDelete(null);
      }
    }
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormCustomerType('regular');
    setFormDiscount(0);
    setFormNotes('');
    setFormIsActive(true);
  };

  const getTypeInfo = (type: CustomerType) => {
    return customerTypeOptions.find(t => t.value === type) || customerTypeOptions[0];
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormFullName(customer.full_name);
    setFormEmail(customer.email || '');
    setFormPhone(customer.phone || '');
    setFormAddress(customer.address || '');
    setFormCustomerType(customer.customer_type);
    setFormDiscount(customer.discount_percent || 0);
    setFormNotes(customer.notes || '');
    setFormIsActive(customer.is_active !== false);
    setIsModalOpen(true);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-100 rounded w-40 animate-pulse" />
          <div className="h-10 bg-slate-100 rounded w-36 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-48 animate-pulse" />
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm">Manage customers and loyalty</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} className="mr-2" /> Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500">No customers found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const typeInfo = getTypeInfo(customer.customer_type);
            return (
              <div
                key={customer.id || customer._id}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer"
                onClick={() => openEditModal(customer)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold">
                      {(customer.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 truncate max-w-[120px]">{customer.full_name}</h3>
                      <Badge className={cn("text-[10px]", typeInfo.color)} size="sm">
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} />
                      <span className="truncate">{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} />
                      <span className="truncate text-xs">{customer.email}</span>
                    </div>
                  )}
                  {(customer.discount_percent || 0) > 0 && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <Percent size={14} />
                      <span className="font-medium text-xs">{customer.discount_percent}% discount</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Total Spent</p>
                    <p className="font-semibold text-slate-900">${(customer.total_spent || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Points</p>
                    <p className="font-semibold text-slate-900">{customer.loyalty_points || 0}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        size="lg"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingCustomer ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="Customer name"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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
              rows={3}
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
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customerToDelete?.full_name}?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Customers;
