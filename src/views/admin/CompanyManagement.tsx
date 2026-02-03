"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Phone, Globe, Mail, Settings, Building, Edit, Trash2, Plus, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import type { Company, Branch } from '../../types';

const CompanyManagement: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    legal_name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    expected_branches: '1',
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading company data...');
      console.log('Current user:', user);
      console.log('User company_id:', user?.company_id);
      
      // Load company info directly
      let companyData = null;
      let branchesData: Branch[] = [];
      
      try {
        console.log('Fetching company from /api/companies/me...');
        const companyResponse = await api.companies.getMe();
        console.log('Company response received:', companyResponse);
        // Handle response wrapper
        companyData = companyResponse.data || companyResponse;
        console.log('Company data extracted:', companyData);
        setCompany(companyData);
      } catch (err: any) {
        console.error('Error fetching company:', err);
        if (err.message?.includes('No company') || err.message?.includes('404')) {
          setError('COMPANY_NOT_FOUND');
          setLoading(false);
          return;
        }
        throw err;
      }
      
      try {
        console.log('Fetching branches...');
        const branchesResponse = await api.companies.getBranches();
        console.log('Branches response received:', branchesResponse);
        // Handle response wrapper - could be { data: [...], count: n } or [...]
        if (Array.isArray(branchesResponse)) {
          branchesData = branchesResponse;
        } else if (branchesResponse.data && Array.isArray(branchesResponse.data)) {
          branchesData = branchesResponse.data;
        } else if (branchesResponse.data) {
          branchesData = [branchesResponse.data];
        }
        console.log('Branches extracted:', branchesData);
      } catch (err) {
        console.error('Error fetching branches:', err);
        branchesData = [];
      }
      
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setCompanyForm({
        name: companyData.name || '',
        legal_name: companyData.legal_name || '',
        description: companyData.description || '',
        category: companyData.category || '',
        logo: companyData.logo || '',
        address: companyData.address || '',
        phone: companyData.phone || '',
        email: companyData.email || '',
        website: companyData.website || '',
        expected_branches: String(companyData.subscription?.max_branches || 1),
      });
    } catch (error: any) {
      console.error('Failed to load company data:', error);
      setError('LOAD_FAILED');
      showNotification('Failed to load company data: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Map expected_branches to subscription.max_branches for API
      const updateData = {
        name: companyForm.name,
        legal_name: companyForm.legal_name,
        description: companyForm.description,
        category: companyForm.category,
        address: companyForm.address,
        phone: companyForm.phone,
        email: companyForm.email,
        website: companyForm.website,
        logo: companyForm.logo,
        subscription: {
          max_branches: parseInt(companyForm.expected_branches, 10),
        },
      };
      await api.companies.update(updateData);
      showNotification('Company updated successfully', 'success');
      setEditingCompany(false);
      await refreshUser();
      loadCompanyData();
    } catch (error: any) {
      showNotification(error.message || 'Failed to update company', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    
    try {
      await api.branches.delete(branchId);
      showNotification('Branch deleted successfully', 'success');
      loadCompanyData();
    } catch (error: any) {
      showNotification(error.message || 'Failed to delete branch', 'error');
    }
  };

  const getBranchId = (branch: Branch): string => {
    return branch.id || branch._id || '';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60023]"></div>
      </div>
    );
  }

  // Company not found - show setup prompt
  if (error === 'COMPANY_NOT_FOUND' || !company) {
    return (
      <div className="text-center py-12">
        <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Company Found</h2>
        <p className="text-gray-500 mb-6">Please complete your company setup to continue.</p>
        <Button onClick={() => router.push('/company-setup')}>
          Go to Setup
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Debug Info - Remove in production */}
      <div className="bg-gray-100 p-2 text-xs text-gray-500">
        User ID: {String(user?.id || '')} | Company ID: {String(user?.company_id || 'not set')}
      </div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info Card */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Building2 size={32} className="text-[#e60023]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{company.name || 'Company'}</h2>
                  {company.legal_name && (
                    <p className="text-gray-500">{company.legal_name}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setEditingCompany(!editingCompany)}
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
            </div>

            {editingCompany ? (
              <form onSubmit={handleUpdateCompany} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                    <div className="flex items-center gap-4">
                      {companyForm.logo ? (
                        <div className="relative w-20 h-20">
                          <img src={companyForm.logo} alt="Company Logo" className="w-20 h-20 object-contain rounded-lg border border-gray-200" />
                          <button
                            type="button"
                            onClick={() => setCompanyForm({ ...companyForm, logo: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <Building2 size={32} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCompanyForm({ ...companyForm, logo: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">Upload a logo (max 5MB)</p>
                      </div>
                    </div>
                  </div>
                  <Input
                    label="Company Name"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Legal Name"
                    value={companyForm.legal_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, legal_name: e.target.value })}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023] transition-all"
                      value={companyForm.category}
                      onChange={(e) => setCompanyForm({ ...companyForm, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      <option value="cafe">Cafe</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="coffee_shop">Coffee Shop</option>
                      <option value="bar">Bar</option>
                      <option value="bakery">Bakery</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60023] focus:border-transparent"
                      rows={3}
                      placeholder="Tell us about your company..."
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  />
                  <Input
                    label="Phone"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  />
                  <Input
                    label="Website"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  />
                  <Input
                    label="Address"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  />
                  <Input
                    label="Expected Branches"
                    type="number"
                    min={1}
                    value={companyForm.expected_branches}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Only allow numeric values
                      if (val === '' || /^[0-9]+$/.test(val)) {
                        setCompanyForm({ ...companyForm, expected_branches: val });
                      }
                    }}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingCompany(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={18} className="text-gray-400" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={18} className="text-gray-400" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe size={18} className="text-gray-400" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[#e60023] hover:underline">
                      {company.website}
                    </a>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                    <MapPin size={18} className="text-gray-400" />
                    <span>{company.address}</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Stats Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-gray-400" />
              Subscription
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-xl font-bold text-[#e60023] capitalize">
                  {company.subscription?.plan || 'Trial'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  company.subscription?.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {company.subscription?.status || 'Active'}
                </span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Usage</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Branches</span>
                    <span>{branches.length} / {company.subscription?.max_branches || 1}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#e60023] h-2 rounded-full" 
                      style={{ width: `${Math.min((branches.length / (company.subscription?.max_branches || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Branches Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building size={20} className="text-gray-400" />
            Branches ({branches.length})
          </h3>
          <Button onClick={() => router.push('/admin/branches')}>
            <Plus size={16} className="mr-2" />
            Add Branch
          </Button>
        </div>

        {branches.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No branches yet</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/admin/branches')}
            >
              Create your first branch
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch) => (
              <Card key={getBranchId(branch)} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{branch.branch_name}</h4>
                    <p className="text-sm text-gray-500">{branch.location_address}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    branch.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {branch.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  {branch.phone && <span>{branch.phone}</span>}
                  <span>Capacity: {branch.capacity}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/admin/branches?id=${getBranchId(branch)}`)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteBranch(getBranchId(branch))}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;
