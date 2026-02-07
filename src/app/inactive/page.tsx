"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, Mail, User, Clock, CheckCircle, ArrowRight, CreditCard, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InactivePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [statusInfo, setStatusInfo] = useState<any>({ 
        title: '', 
        description: '', 
        color: '',
        action: '',
        actionLink: null
    });

    useEffect(() => {
        if (!user) {
            // Redirect to login if no user
            router.push('/login');
            return;
        }

        if (user.status === 'active' && !user.businessInactive) {
            // Redirect to dashboard if user is active and business is active
            const dashboardPath = user.role === 'admin' ? '/dashboard' : 
                                 user.role === 'manager' ? '/dashboard' : 
                                 user.role === 'cashier' ? '/dashboard' : '/';
            router.push(dashboardPath);
            return;
        }

        const status = getStatusMessage();
        setStatusInfo(status);
    }, [user, router]);

    const getStatusMessage = () => {
        // Check for business subscription issues first
        if (user?.businessInactive) {
            if (user.subscriptionExpired) {
                return {
                    title: 'Subscription Expired',
                    description: 'Your subscription has expired. Please renew your subscription to continue using the system.',
                    color: 'red',
                    action: 'Renew Subscription',
                    actionLink: '/dashboard/billing',
                    icon: <RefreshCw className="w-12 h-12 text-white" />
                };
            }
            if (user.subscriptionPending) {
                return {
                    title: 'Payment Pending',
                    description: 'Your subscription is pending payment. Please make a payment to activate your account.',
                    color: 'yellow',
                    action: 'Go to Billing',
                    actionLink: '/dashboard/billing',
                    icon: <CreditCard className="w-12 h-12 text-white" />
                };
            }
            if (user.businessDeactivated) {
                return {
                    title: 'Business Deactivated',
                    description: 'Your business has been deactivated by the Administrator. Please contact support to reactivate.',
                    color: 'orange',
                    action: 'Contact Support',
                    actionLink: null
                };
            }
        }

        // Check user status
        switch (user?.status) {
            case 'inactive':
                return {
                    title: 'Account Deactivated',
                    description: 'Your account has been deactivated. Please contact the Administrator to reactivate your account.',
                    color: 'red',
                    action: 'Contact Administrator',
                    icon: <AlertTriangle className="w-12 h-12 text-white" />
                };
            case 'pending':
                return {
                    title: 'Account Pending Approval',
                    description: 'Your account is still pending approval from the Administrator. Please wait for activation.',
                    color: 'yellow',
                    action: 'Wait for Approval',
                    icon: <Clock className="w-12 h-12 text-white" />
                };
            case 'suspended':
                return {
                    title: 'Account Suspended',
                    description: 'Your account has been suspended due to a policy violation. Please contact the Administrator for more information.',
                    color: 'orange',
                    action: 'Contact Administrator',
                    icon: <AlertTriangle className="w-12 h-12 text-white" />
                };
            case 'onboarding':
                return {
                    title: 'Complete Your Setup',
                    description: 'Please complete your company setup to activate your account and access all features.',
                    color: 'blue',
                    action: 'Go to Setup',
                    actionLink: '/company-setup',
                    icon: <CheckCircle className="w-12 h-12 text-white" />
                };
            default:
                return {
                    title: 'Account Inactive',
                    description: 'Your account is not active. Please contact the Administrator to activate your account.',
                    color: 'orange',
                    action: 'Contact Administrator',
                    icon: <AlertTriangle className="w-12 h-12 text-white" />
                };
        }
    };

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'red':
                return { bg: 'bg-red-100', text: 'text-red-700', icon: 'bg-red-200', header: 'from-red-600 to-red-700' };
            case 'yellow':
                return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'bg-yellow-200', header: 'from-yellow-500 to-yellow-600' };
            case 'orange':
                return { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'bg-orange-200', header: 'from-orange-500 to-orange-600' };
            case 'blue':
                return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'bg-blue-200', header: 'from-blue-500 to-blue-600' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'bg-gray-200', header: 'from-gray-600 to-gray-700' };
        }
    };

    const colors = getColorClasses(statusInfo.color);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className={`bg-gradient-to-r ${colors.header} p-8 text-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                            {statusInfo.icon}
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{statusInfo.title}</h1>
                        <p className="text-white/90 text-lg">{statusInfo.description}</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8">
                    {/* User Info Card */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <User size={24} className="text-[#e17100]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Logged in as</p>
                                <p className="font-semibold text-gray-900">{user?.full_name || user?.email}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role} Account</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colors.text} ${colors.bg}`}>
                                    <Clock size={14} />
                                    {user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-4 mb-8">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-500" />
                            What You Need To Do
                        </h3>
                        <div className="space-y-3 pl-7">
                            {user?.subscriptionExpired && (
                                <>
                                    <p className="text-gray-600 text-sm">
                                        1. Click "Renew Subscription" to go to the billing page
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        2. Review your subscription details and make a payment
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        3. Once payment is verified, your account will be activated automatically
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        4. After activation, you will have full access to all dashboard features
                                    </p>
                                </>
                            )}
                            {user?.subscriptionPending && (
                                <>
                                    <p className="text-gray-600 text-sm">
                                        1. Click "Go to Billing" to view your pending invoice
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        2. Make a bank transfer payment for the invoice amount
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        3. Once payment is verified, your account will be activated
                                    </p>
                                </>
                            )}
                            {user?.businessDeactivated && (
                                <>
                                    <p className="text-gray-600 text-sm">
                                        1. Contact the System Administrator for reactivation
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        2. Provide your account email: <strong className="text-gray-900">{user?.email}</strong>
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        3. Wait for the Administrator to review and reactivate your business
                                    </p>
                                </>
                            )}
                            {user?.status === 'onboarding' && (
                                <>
                                    <p className="text-gray-600 text-sm">
                                        1. Click "Go to Setup" to complete your company configuration
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        2. Fill in your company and branch details
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        3. Once completed, your account will be activated automatically
                                    </p>
                                </>
                            )}
                            {(user?.status === 'inactive' || user?.status === 'suspended' || user?.status === 'pending') && !user?.businessInactive && (
                                <>
                                    <p className="text-gray-600 text-sm">
                                        1. Contact the System Administrator to activate your account
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        2. Provide your account email: <strong className="text-gray-900">{user?.email}</strong>
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        3. Wait for the Administrator to review and activate your account
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    {user?.businessDeactivated || user?.status === 'inactive' || user?.status === 'suspended' || user?.status === 'pending' ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Mail size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-blue-900">Contact Administrator</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Reach out to your system administrator via email or internal messaging system to request account activation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Billing Info */}
                    {(user?.subscriptionExpired || user?.subscriptionPending) && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                    <CreditCard size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-amber-900">Billing Information</h4>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Subscription: 100 ETB/day (Standard Plan). Payment is made via bank transfer to our registered accounts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={logout}
                            variant="outline"
                            className="flex-1"
                        >
                            Logout
                        </Button>
                        {statusInfo.actionLink ? (
                            <Link href={statusInfo.actionLink} className="flex-1">
                                <Button className="w-full bg-gradient-to-r from-[#e17100] to-[#e17100] hover:from-[#e17100] hover:to-[#ad081b]">
                                    <span className="flex items-center justify-center gap-2">
                                        {statusInfo.action} <ArrowRight size={16} />
                                    </span>
                                </Button>
                            </Link>
                        ) : (
                            <Button className="flex-1 bg-gradient-to-r from-[#e17100] to-[#e17100] hover:from-[#e17100] hover:to-[#ad081b]">
                                {statusInfo.action}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                    <p className="text-center text-xs text-gray-500">
                        Need immediate assistance? Contact your system administrator for account activation.
                    </p>
                </div>
            </div>
        </div>
    );
}
