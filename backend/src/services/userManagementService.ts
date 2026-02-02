import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Branch from '../models/Branch';

/**
 * User Management Service
 * 
 * Managers can:
 * - Create cashier accounts for their branch
 * - Add staff users (chefs, waiters, etc.)
 * - Add customers
 * 
 * Admins can do everything across all branches
 */
class UserManagementService {
  /**
   * Create a new user with role-based permissions
   */
  async createUser(params: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role: 'cashier' | 'staff' | 'customer';
    branch_id?: string; // Required for cashier/staff
    created_by: string; // The manager/admin creating this user
    // Customer-specific
    customer_type?: 'regular' | 'vip' | 'member';
    discount_rate?: number;
    // Staff-specific
    employee_id?: string;
    position?: string;
    hire_date?: Date;
    // Common
    status?: 'active' | 'inactive' | 'pending';
    session?: mongoose.ClientSession;
  }) {
    const {
      email,
      password,
      full_name,
      phone,
      role,
      branch_id,
      created_by,
      customer_type,
      discount_rate,
      employee_id,
      position,
      hire_date,
      status,
      session
    } = params;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Get creator's company to inherit
    const creator = await User.findById(created_by);
    const creatorCompanyId = creator?.company_id || undefined;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create([{
      email: email.toLowerCase(),
      password: hashedPassword,
      full_name,
      phone,
      role,
      branch_id: branch_id || undefined,
      company_id: creatorCompanyId,
      created_by,
      status: status || 'pending',
      
      // Role-specific fields
      ...(role === 'customer' && {
        customer_type: customer_type || 'regular',
        discount_rate: discount_rate || 0,
        loyalty_points: 0,
        total_spent: 0,
        visit_count: 0
      }),
      
      ...(role === 'staff' && {
        employee_id,
        position,
        hire_date: hire_date || new Date()
      }),
      
      ...(role === 'cashier' && {
        // Cashiers may have some customer-like fields
        customer_type: 'regular',
        discount_rate: 0
      })
    }], { session });

    return user[0];
  }

  /**
   * Manager creates a cashier for their branch
   */
  async createCashier(params: {
    managerId: string;
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    session?: mongoose.ClientSession;
  }) {
    const { managerId, email, password, full_name, phone, session } = params;

    // Get manager's branch
    const manager = await User.findById(managerId);
    if (!manager) {
      throw new Error('Manager not found');
    }

    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new Error('Only managers can create cashier accounts');
    }

    // For managers, verify they manage this branch
    if (manager.role === 'manager' && manager.branch_id) {
      // Manager can only create users for their own branch
    }

    return await this.createUser({
      email,
      password,
      full_name,
      phone,
      role: 'cashier',
      branch_id: manager.branch_id?.toString(),
      created_by: managerId,
      status: 'active',
      session
    });
  }

  /**
   * Manager creates a staff member for their branch
   */
  async createStaff(params: {
    managerId: string;
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    position: string;
    employee_id?: string;
    hire_date?: Date;
    session?: mongoose.ClientSession;
  }) {
    const {
      managerId,
      email,
      password,
      full_name,
      phone,
      position,
      employee_id,
      hire_date,
      session
    } = params;

    const manager = await User.findById(managerId);
    if (!manager) {
      throw new Error('Manager not found');
    }

    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new Error('Only managers can create staff accounts');
    }

    return await this.createUser({
      email,
      password,
      full_name,
      phone,
      role: 'staff',
      branch_id: manager.branch_id?.toString(),
      created_by: managerId,
      position,
      employee_id,
      hire_date,
      status: 'active',
      session
    });
  }

  /**
   * Manager or admin adds a customer
   */
  async createCustomer(params: {
    creatorId: string;
    email: string;
    password?: string;
    full_name: string;
    phone?: string;
    customer_type?: 'regular' | 'vip' | 'member';
    discount_rate?: number;
    branch_id?: string; // For managers, defaults to their branch
    session?: mongoose.ClientSession;
  }) {
    const {
      creatorId,
      email,
      password,
      full_name,
      phone,
      customer_type,
      discount_rate,
      branch_id,
      session
    } = params;

    const creator = await User.findById(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    // Generate password if not provided (for manual creation)
    const finalPassword = password || this.generateTemporaryPassword();

    // Determine branch_id
    let finalBranchId: string | undefined;
    if (creator.role === 'admin' && branch_id) {
      finalBranchId = branch_id;
    } else if (creator.role === 'manager') {
      finalBranchId = creator.branch_id?.toString();
    }

    return await this.createUser({
      email,
      password: finalPassword,
      full_name,
      phone,
      role: 'customer',
      branch_id: finalBranchId,
      created_by: creatorId,
      customer_type: customer_type || 'regular',
      discount_rate: discount_rate || 0,
      status: 'active',
      session
    });
  }

  /**
   * Get all users at a branch
   */
  async getBranchUsers(branchId: string, options?: {
    role?: string;
    status?: string;
    search?: string;
  }) {
    const query: any = { branch_id: branchId };
    
    if (options?.role) query.role = options.role;
    if (options?.status) query.status = options.status;
    if (options?.search) {
      query.$or = [
        { full_name: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } },
        { phone: { $regex: options.search, $options: 'i' } }
      ];
    }

    return await User.find(query)
      .select('-password')
      .sort({ role: 1, full_name: 1 });
  }

  /**
   * Get all cashiers at a branch
   */
  async getBranchCashiers(branchId: string) {
    return await User.find({
      branch_id: branchId,
      role: 'cashier',
      status: { $ne: 'suspended' }
    }).select('full_name email phone status');
  }

  /**
   * Get all staff at a branch
   */
  async getBranchStaff(branchId: string) {
    return await User.find({
      branch_id: branchId,
      role: 'staff',
      status: { $ne: 'suspended' }
    }).select('full_name email phone position status employee_id');
  }

  /**
   * Update user status (suspend/activate)
   */
  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended', updatedBy: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.status = status;
    await user.save();

    // Log the change
    // TODO: Add to audit log

    return user;
  }

  /**
   * Get customers at a branch with spending info
   */
  async getBranchCustomers(branchId: string, options?: {
    customer_type?: string;
    min_spent?: number;
    search?: string;
  }) {
    const query: any = {
      branch_id: branchId,
      role: 'customer'
    };

    if (options?.customer_type) query.customer_type = options.customer_type;
    if (options?.min_spent) query.total_spent = { $gte: options.min_spent };
    if (options?.search) {
      query.$or = [
        { full_name: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } },
        { phone: { $regex: options.search, $options: 'i' } }
      ];
    }

    return await User.find(query)
      .select('-password')
      .sort({ total_spent: -1 });
  }

  /**
   * Add loyalty points to customer
   */
  async addLoyaltyPoints(customerId: string, points: number) {
    const customer = await User.findById(customerId);
    if (!customer || customer.role !== 'customer') {
      throw new Error('Customer not found');
    }

    customer.loyalty_points = (customer.loyalty_points || 0) + points;
    await customer.save();

    return customer;
  }

  /**
   * Update customer after order
   */
  async updateCustomerAfterOrder(customerId: string, orderAmount: number) {
    const customer = await User.findById(customerId);
    if (!customer || customer.role !== 'customer') {
      throw new Error('Customer not found');
    }

    customer.total_spent = (customer.total_spent || 0) + orderAmount;
    customer.visit_count = (customer.visit_count || 0) + 1;
    
    // Auto-upgrade to VIP after certain spending threshold
    if (customer.total_spent >= 10000 && customer.customer_type === 'regular') {
      customer.customer_type = 'vip';
      customer.discount_rate = 5; // 5% discount
    }

    // Auto-upgrade to member after higher threshold
    if (customer.total_spent >= 50000 && customer.customer_type === 'vip') {
      customer.customer_type = 'member';
      customer.discount_rate = 10; // 10% discount
    }

    // Add loyalty points (1 point per birr spent)
    customer.loyalty_points = (customer.loyalty_points || 0) + Math.floor(orderAmount);

    await customer.save();
    return customer;
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(branchId?: string) {
    const match: any = { role: 'customer' };
    if (branchId) match.branch_id = new mongoose.Types.ObjectId(branchId);

    const stats = await User.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$customer_type',
          count: { $sum: 1 },
          total_spent: { $sum: '$total_spent' },
          avg_spent: { $avg: '$total_spent' },
          total_visits: { $sum: '$visit_count' },
          total_points: { $sum: '$loyalty_points' }
        }
      }
    ]);

    return stats;
  }

  /**
   * Generate temporary password
   */
  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 1000);
  }
}

export default new UserManagementService();
