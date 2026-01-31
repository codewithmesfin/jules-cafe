"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, User as UserIcon, Users } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { User, UserStatus } from '../../types';

const Customers: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<User | null>(null);

  // Form state
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');
  const [formCustomerType, setFormCustomerType] = useState<'regular' | 'vip' | 'member'>('regular');
  const [formDiscountRate, setFormDiscountRate] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.users.getAll();
      setCustomers(data.filter((u: User) => u.role === 'customer'));
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const name = customer.full_name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
          <Users size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Associated</h2>
        <p className="text-gray-500 text-center max-w-md">
          Please associate this account with a branch to manage customers.
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!formFullName || !formEmail) {
      showNotification("Please fill in required fields", "error");
      return;
    }

    try {
      const customerData = {
        full_name: formFullName,
        email: formEmail,
        phone: formPhone,
        status: formStatus,
        customer_type: formCustomerType,
        discount_rate: formDiscountRate,
        role: 'customer'
      };

      if (editingCustomer) {
        await api.users.update(editingCustomer.id, customerData);
        showNotification("Customer updated successfully");
      } else {
        await api.users.create({
          ...customerData,
          password: 'password123' // Default password for new customers added by manager
        });
        showNotification("Customer created successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      showNotification("Failed to save customer", "error");
    }
  };

  const handleDelete = async () => {
    if (customerToDelete) {
      try {
        await api.users.delete(customerToDelete.id);
        showNotification("Customer deleted successfully", "warning");
        fetchCustomers();
      } catch (error) {
        showNotification("Failed to delete customer", "error");
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
    setFormStatus('active');
    setFormCustomerType('regular');
    setFormDiscountRate(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search customers by name, email or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2" onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}>
          <Plus size={20} /> Add Customer
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading customers...</div>
      ) : (
        <Table
          data={filteredCustomers}
          columns={[
            {
              header: 'Customer',
              accessor: (customer) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    {(customer.full_name || customer.username || 'U').charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{customer.full_name || customer.username || 'Guest'}</div>
                    <div className="text-xs text-gray-500">{customer.email}</div>
                  </div>
                </div>
              )
            },
            { header: 'Phone', accessor: 'phone' },
            {
              header: 'Type & Discount',
              accessor: (customer) => (
                <div className="flex flex-col">
                  <Badge variant="neutral" className="capitalize w-fit">{customer.customer_type || 'regular'}</Badge>
                  <span className="text-xs text-orange-600 font-medium mt-1">
                    {customer.discount_rate || 0}% Discount
                  </span>
                </div>
              )
            },
            {
              header: 'Status',
              accessor: (customer) => (
                <Badge variant={customer.status === 'active' ? 'success' : 'error'} className="capitalize">
                  {customer.status}
                </Badge>
              )
            },
            {
              header: 'Actions',
              accessor: (customer) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCustomer(customer);
                      setFormFullName(customer.full_name || '');
                      setFormEmail(customer.email);
                      setFormPhone(customer.phone || '');
                      setFormStatus(customer.status);
                      setFormCustomerType(customer.customer_type || 'regular');
                      setFormDiscountRate(customer.discount_rate || 0);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => setCustomerToDelete(customer)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )
            }
          ]}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingCustomer ? "Save Changes" : "Create Customer"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. John Doe"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              placeholder="john@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="555-0123"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={formCustomerType}
                onChange={(e) => {
                  const type = e.target.value as 'regular' | 'vip' | 'member';
                  setFormCustomerType(type);
                  // Default discounts for types
                  if (type === 'vip') setFormDiscountRate(15);
                  else if (type === 'member') setFormDiscountRate(5);
                  else setFormDiscountRate(0);
                }}
              >
                <option value="regular">Regular</option>
                <option value="member">Member (5%)</option>
                <option value="vip">VIP (15%)</option>
              </select>
            </div>
            <Input
              label="Discount Rate (%)"
              type="number"
              value={formDiscountRate}
              onChange={(e) => setFormDiscountRate(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as UserStatus)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customerToDelete?.full_name}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Customers;
