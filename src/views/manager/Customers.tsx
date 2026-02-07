"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, Users, Mail, Phone, Percent, Edit } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Customer, CustomerType } from '../../types';

const customerTypeOptions: { value: CustomerType; label: string; color: string }[] = [
  { value: 'regular', label: 'Regular', color: 'bg-slate-100 text-slate-600' },
  { value: 'member', label: 'Member', color: 'bg-blue-100 text-blue-600' },
  { value: 'staff', label: 'Staff', color: 'bg-emerald-100 text-emerald-600' },
  { value: 'vip', label: 'VIP', color: 'bg-amber-100 text-amber-600' },
  { value: 'wholesale', label: 'Wholesale', color: 'bg-purple-100 text-purple-600' },
];

const getTypeInfo = (type: CustomerType) => {
  return customerTypeOptions.find(t => t.value === type) || customerTypeOptions[0];
};

const Customers: React.FC = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

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
          onClick={() => router.push('/dashboard/customers/new')}
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
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg hover:border-slate-300 transition-all"
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
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/customers/${customer.id || customer._id}/edit`)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomerToDelete(customer)}
                    >
                      <Trash2 size={14} className="text-error-600" />
                    </Button>
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
