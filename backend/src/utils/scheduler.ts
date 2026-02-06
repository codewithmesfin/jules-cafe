import mongoose from 'mongoose';
import Business from '../models/Business';
import Subscription from '../models/Subscription';
import Invoice from '../models/Invoice';

// Pricing constants
const PRICING = {
  standard: { daily: 100, name: 'Standard' }
};

const VAT_RATE = 15; // 15% VAT
const YEARLY_DISCOUNT = 20; // 20% discount for yearly

/**
 * Check and expire subscriptions that have passed their end date
 * Deactivates businesses whose subscriptions have expired
 */
export const checkExpiredSubscriptions = async () => {
  try {
    console.log('🔄 Checking for expired subscriptions...');
    
    // Find active subscriptions that have expired
    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      end_date: { $lt: new Date() }
    });

    console.log(`📊 Found ${expiredSubscriptions.length} expired subscriptions`);

    for (const subscription of expiredSubscriptions) {
      // Update subscription status
      subscription.status = 'expired';
      await subscription.save();

      // Deactivate the business
      await Business.findByIdAndUpdate(subscription.business_id, {
        is_active: false
      });

      console.log(`❌ Deactivated business ${subscription.business_id} - subscription expired`);
    }

    // Find subscriptions expiring in the next 24 hours and send notifications
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const expiringSoonSubscriptions = await Subscription.find({
      status: 'active',
      end_date: { $gte: new Date(), $lte: tomorrow }
    });

    console.log(`📅 ${expiringSoonSubscriptions.length} subscriptions expiring within 24 hours`);

    return {
      expired: expiredSubscriptions.length,
      expiringSoon: expiringSoonSubscriptions.length
    };
  } catch (error) {
    console.error('❌ Error checking expired subscriptions:', error);
    throw error;
  }
};

/**
 * Check and mark overdue invoices
 * Deactivates businesses with overdue invoices beyond grace period
 */
export const checkOverdueInvoices = async () => {
  try {
    console.log('🔄 Checking for overdue invoices...');

    const today = new Date();

    // Find pending invoices that are past due date
    const overdueInvoices = await Invoice.find({
      status: 'pending',
      due_date: { $lt: today }
    });

    console.log(`📊 Found ${overdueInvoices.length} overdue invoices`);

    for (const invoice of overdueInvoices) {
      // Mark invoice as overdue
      invoice.status = 'overdue';
      await invoice.save();

      // Deactivate the business (payment not received within grace period)
      await Business.findByIdAndUpdate(invoice.business_id, {
        is_active: false
      });

      console.log(`❌ Deactivated business ${invoice.business_id} - invoice overdue`);
    }

    return overdueInvoices.length;
  } catch (error) {
    console.error('❌ Error checking overdue invoices:', error);
    throw error;
  }
};

/**
 * Generate invoice for subscription renewal
 * Creates a new invoice when subscription is about to expire
 */
export const generateRenewalInvoice = async (subscription: any) => {
  try {
    const billing_cycle = subscription.billing_cycle || 'monthly';
    const days = billing_cycle === 'yearly' ? 365 : 30;
    const dailyRate = PRICING.standard.daily;

    // Calculate price breakdown
    const priceWithVAT = dailyRate * days;
    const subtotal = priceWithVAT / (1 + VAT_RATE / 100);
    const vatAmount = priceWithVAT - subtotal;

    const startDate = new Date(subscription.end_date);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    // Create renewal invoice
    const invoice = await Invoice.create({
      business_id: subscription.business_id,
      subscription_id: subscription._id,
      plan: PRICING.standard.name,
      billing_cycle,
      days,
      subtotal,
      vat_amount: vatAmount,
      discount: 0,
      discount_percent: 0,
      total: subtotal + vatAmount,
      status: 'pending',
      period_start: startDate,
      period_end: endDate,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    console.log(`📄 Generated renewal invoice ${invoice._id} for business ${subscription.business_id}`);

    return invoice;
  } catch (error) {
    console.error('❌ Error generating renewal invoice:', error);
    throw error;
  }
};

/**
 * Auto-renew subscription if payment was verified
 * Activates business and creates new subscription period
 */
export const processRenewalPayment = async (invoiceId: string) => {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Mark invoice as paid
    invoice.status = 'paid';
    await invoice.save();

    // Activate the business
    await Business.findByIdAndUpdate(invoice.business_id, {
      is_active: true
    });

    // Create new subscription period
    const billing_cycle = invoice.billing_cycle || 'monthly';
    const days = billing_cycle === 'yearly' ? 365 : 30;
    const dailyRate = PRICING.standard.daily;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const subscription = await Subscription.create({
      business_id: invoice.business_id,
      plan: 'standard',
      status: 'active',
      start_date: startDate,
      end_date: endDate,
      billing_cycle,
      daily_rate: dailyRate
    });

    console.log(`✅ Renewed subscription ${subscription._id} for business ${invoice.business_id}`);

    return subscription;
  } catch (error) {
    console.error('❌ Error processing renewal payment:', error);
    throw error;
  }
};

/**
 * Run all scheduled billing checks
 * Should be called by a cron job
 */
export const runBillingChecks = async () => {
  try {
    console.log('🚀 Running scheduled billing checks...');
    
    const expiredResult = await checkExpiredSubscriptions();
    const overdueCount = await checkOverdueInvoices();

    console.log('✅ Billing checks completed:', expiredResult, { overdueCount });

    return {
      ...expiredResult,
      overdueCount
    };
  } catch (error) {
    console.error('❌ Error running billing checks:', error);
    throw error;
  }
};
