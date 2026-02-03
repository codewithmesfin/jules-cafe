"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, User as UserIcon, Users, Mail, Phone, MapPin, Award, DollarSign } from 'lucide-react';
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
import type { Customer } from '../../types';

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
  const [formNotes, setFormNotes] = useState('');

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
                         (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()));
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
        notes: formNotes || undefined
      };

      if (editingCustomer) {
        await api.customers.update((editingCustomer.id || editingCustomer._id)!, customerData);
        showNotification("Customer profile updated");
      } else {
        await api.customers.create(customerData);
        showNotification("New customer added to database");
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
        showNotification("Customer record deleted", "warning");
        fetchCustomers();
      } catch (error: any) {
        showNotification(error.message || "Failed to delete customer", "error");
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
    setFormNotes('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">CRM & Loyalty</h1>
          <p className="text-slate-500 font-medium">Manage your customer relationships and loyalty programs</p>
        </div>
        <Button
          className="gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-blue-100"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} /> Register Customer
        </Button>
      </div>

      <Card className="p-6 border-slate-100 rounded-[2rem] shadow-sm bg-white border">
        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
          <input
            placeholder="Search by name, phone, or email..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2rem]" />
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
            <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold text-lg">No customers found</p>
            <p className="text-slate-400 text-sm">Start building your customer base today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCustomers.map(customer => (
              <div
                key={customer.id || customer._id}
                className="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col border"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-100">
                      {customer.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight truncate max-w-[150px]">
                        {customer.full_name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                        <Award size={12} />
                        <span>Loyalty Member</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingCustomer(customer);
                        setFormFullName(customer.full_name);
                        setFormEmail(customer.email || '');
                        setFormPhone(customer.phone || '');
                        setFormAddress(customer.address || '');
                        setFormNotes(customer.notes || '');
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setCustomerToDelete(customer)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {customer.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                      <div className="p-2 bg-slate-50 rounded-lg"><Phone size={14} className="text-slate-400" /></div>
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                      <div className="p-2 bg-slate-50 rounded-lg"><Mail size={14} className="text-slate-400" /></div>
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Spent</p>
                    <div className="flex items-center gap-1 text-slate-900 font-black">
                      <DollarSign size={14} className="text-green-500" />
                      <span>{customer.total_spent.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Points</p>
                    <div className="flex items-center gap-1 text-slate-900 font-black">
                      <Award size={14} className="text-blue-500" />
                      <span>{customer.loyalty_points}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCustomer ? "Update Profile" : "New Customer Registration"}
        className="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}>Cancel</Button>
            <Button className="flex-1 rounded-xl h-12 shadow-lg shadow-blue-100" onClick={handleSave}>
              {editingCustomer ? "Update Record" : "Register Customer"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <Input
            label="Full Name *"
            placeholder="e.g. Jane Smith"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
            className="rounded-xl"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="jane@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="rounded-xl"
            />
            <Input
              label="Phone Number"
              placeholder="+251..."
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <Input
            label="Home/Delivery Address"
            placeholder="Street, City..."
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
            className="rounded-xl"
          />
          <div className="space-y-1">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Internal Notes</label>
            <textarea
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
              rows={3}
              placeholder="Allergies, preferences, or VIP notes..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Customer Profile"
        description={`Are you sure you want to remove ${customerToDelete?.full_name}? All loyalty data and history will be permanently lost.`}
        confirmLabel="Confirm Deletion"
      />
    </div>
  );
};

export default Customers;
