"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Phone, Globe, Mail, ArrowRight, Clock, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const CompanySetup: React.FC = () => {
  const { showNotification } = useNotification();
  const { refreshUser } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [companyData, setCompanyData] = useState({
    name: '',
    legal_name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  
  const [branchData, setBranchData] = useState({
    branch_name: 'Main Branch',
    branch_address: '',
    branch_phone: '',
    branch_email: '',
    opening_time: '09:00',
    closing_time: '22:00',
    capacity: 50,
  });

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyData.name.trim()) {
      showNotification('Company name is required', 'error');
      return;
    }
    setStep(2);
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Combine company and branch data
      const combinedData = {
        ...companyData,
        ...branchData,
      };
      
      const response = await api.companies.setup(combinedData);
      showNotification('Company setup completed successfully!', 'success');
      
      // Clear auth storage and redirect to login for a fresh session
      // This ensures the user gets updated company_id and status='active'
      localStorage.removeItem('user');
      localStorage.removeItem('jwt');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error: any) {
      showNotification(error.message || 'Failed to setup company', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-100 text-[#e60023] mb-6 shadow-xl shadow-orange-100">
            <Building2 size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            {step === 1 ? 'Setup Your Company' : 'Setup Your First Branch'}
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            {step === 1 
              ? 'Tell us about your business to get started' 
              : 'Configure your main branch location'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
              ${step >= 1 ? 'bg-[#e60023]' : 'bg-gray-300'}
            `}>1</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-[#e60023]' : 'bg-gray-300'}`} />
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
              ${step >= 2 ? 'bg-[#e60023]' : 'bg-gray-300'}
            `}>2</div>
          </div>
        </div>

        <Card className="p-8 border-none shadow-2xl shadow-gray-200/50 rounded-[2rem]">
          {step === 1 ? (
            /* Company Information Form */
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Company Name"
                    placeholder="e.g. Gourmet Kitchen"
                    required
                    value={companyData.name}
                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Legal Business Name (Optional)"
                    placeholder="e.g. Gourmet Kitchen LLC"
                    value={companyData.legal_name}
                    onChange={(e) => setCompanyData({ ...companyData, legal_name: e.target.value })}
                  />
                </div>

                <Input
                  label="Business Email"
                  type="email"
                  placeholder="contact@company.com"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                />

                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Website"
                    placeholder="https://www.company.com"
                    value={companyData.website}
                    onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Headquarters Address"
                    placeholder="123 Business Ave, Suite 100"
                    value={companyData.address}
                    onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-8 py-6 text-lg font-bold rounded-2xl bg-[#e60023] hover:bg-[#e60023] shadow-xl shadow-orange-200 transition-all active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  Continue to Branch Setup <ArrowRight size={20} />
                </span>
              </Button>
            </form>
          ) : (
            /* Branch Information Form */
            <form onSubmit={handleBranchSubmit} className="space-y-6">
              <div className="bg-orange-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> You are setting up your first branch. You can add more branches later from the admin dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Branch Name"
                    placeholder="e.g. Main Branch"
                    required
                    value={branchData.branch_name}
                    onChange={(e) => setBranchData({ ...branchData, branch_name: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Branch Address"
                    placeholder="123 Business Ave, Suite 100"
                    value={branchData.branch_address || companyData.address}
                    onChange={(e) => setBranchData({ ...branchData, branch_address: e.target.value })}
                  />
                </div>

                <Input
                  label="Branch Phone"
                  placeholder="+1 (555) 000-0000"
                  value={branchData.branch_phone || companyData.phone}
                  onChange={(e) => setBranchData({ ...branchData, branch_phone: e.target.value })}
                />

                <Input
                  label="Branch Email"
                  type="email"
                  placeholder="branch@company.com"
                  value={branchData.branch_email || companyData.email}
                  onChange={(e) => setBranchData({ ...branchData, branch_email: e.target.value })}
                />

                <Input
                  label="Opening Time"
                  type="time"
                  value={branchData.opening_time}
                  onChange={(e) => setBranchData({ ...branchData, opening_time: e.target.value })}
                />

                <Input
                  label="Closing Time"
                  type="time"
                  value={branchData.closing_time}
                  onChange={(e) => setBranchData({ ...branchData, closing_time: e.target.value })}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Branch Capacity (seats)"
                    type="number"
                    min={1}
                    value={branchData.capacity || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^[0-9]+$/.test(value)) {
                        setBranchData({ ...branchData, capacity: value === '' ? 50 : parseInt(value, 10) });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 py-6 text-lg font-bold rounded-2xl"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 py-6 text-lg font-bold rounded-2xl bg-[#e60023] hover:bg-[#e60023] shadow-xl shadow-orange-200 transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Setting up...' : (
                    <span className="flex items-center justify-center gap-2">
                      Complete Setup <ArrowRight size={20} />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <p className="text-center text-gray-400 mt-8 text-sm font-medium uppercase tracking-widest">
          Step {step} of 2: {step === 1 ? 'Company Information' : 'Branch Configuration'}
        </p>
      </div>
    </div>
  );
};

export default CompanySetup;
