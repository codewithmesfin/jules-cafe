# ABC Cafe - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Managing Orders](#managing-orders)
5. [Inventory Management](#inventory-management)
6. [Product & Recipe Management](#product--recipe-management)
7. [Customer Management](#customer-management)
8. [Staff Management](#staff-management)
9. [Table Management](#table-management)
10. [Reports & Analytics](#reports--analytics)
11. [Settings](#settings)
12. [Troubleshooting](#troubleshooting)

---

## Introduction

Welcome to ABC Cafe Management System! This guide will help you understand how to use all features of the system effectively.

### What is ABC Cafe?

ABC Cafe is a comprehensive restaurant management system that helps you:
- **Track Inventory**: Know what ingredients you have in stock
- **Manage Orders**: Create and track customer orders
- **Handle Customers**: Manage customer information and loyalty programs
- **Manage Staff**: Track employees and their roles
- **View Reports**: Analyze business performance

---

## Getting Started

### Accessing the System

1. Open your web browser
2. Go to your ABC Cafe URL (provided by your administrator)
3. Login with your credentials

### Login Screen

```
┌─────────────────────────────────────┐
│         ABC Cafe Login              │
├─────────────────────────────────────┤
│  Email:    [___________________]    │
│  Password: [___________________]    │
│                                     │
│         [ LOGIN ]                   │
│                                     │
│  Forgot Password?                   │
└─────────────────────────────────────┘
```

### User Roles

| Role | What You Can Do |
|------|-----------------|
| **Admin** | Full access to everything |
| **Manager** | Manage staff, inventory, products, view reports |
| **Cashier** | Create orders, process payments |
| **Waiter** | View orders, manage tables |

---

## Dashboard Overview

The dashboard is your central hub for quick access to important information.

### Dashboard Components

```
┌─────────────────────────────────────────────────────────────┐
│  ABC Cafe                        [User: John] [Logout]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Today's     │  │ Pending     │  │ Low Stock           │ │
│  │ Sales      │  │ Orders     │  │ Items               │ │
│  │ Br 12,450  │  │ 5          │  │ 3                   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Recent Orders                                       │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  #ORD-ABC123 - Table 5 - Br 450 - Preparing        │   │
│  │  #ORD-ABC124 - Takeaway - Br 780 - Ready          │   │
│  │  #ORD-ABC125 - Table 3 - Br 1,200 - Completed     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Quick Stats

| Stat | Description |
|------|-------------|
| **Today's Sales** | Total revenue today |
| **Pending Orders** | Orders waiting to be prepared |
| **Low Stock Items** | Ingredients below reorder level |
| **Total Customers** | Customers served today |

---

## Managing Orders

### Creating a New Order

1. Navigate to **Orders** → **New Order**
2. You'll see the menu with available items (only items with stock are shown)
3. **Select Items**: Click on an item to add it to the cart
4. **Adjust Quantity**: Use `+` and `-` buttons to change quantity
5. **Cart Review**:
   - View all selected items
   - See subtotal and total
6. **Select Customer** (optional): Choose from existing customers
7. **Select Table** (for dine-in): Choose an available table
8. **Add Notes** (optional): Special requests, allergies, etc.
9. **Click "Place Order"**

### Order Status Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Preparing │ ─▶ │  Ready   │ ─▶ │Delivered │ ─▶ │Completed │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                                    │
     ▼                                    ▼
┌──────────┐                        ┌──────────┐
│ Cancelled│                        │  Paid    │
└──────────┘                        └──────────┘
```

### Viewing All Orders

1. Go to **Orders** → **All Orders**
2. Use filters to find specific orders:
   - By date
   - By status
   - By customer
   - By table

### Important: Inventory Validation

When creating an order, the system automatically checks if all ingredients are available:

- **Available Items**: Items with all ingredients in stock appear in the menu
- **Unavailable Items**: Items with missing ingredients are automatically hidden
- **Error Messages**: If an order cannot be created, you'll see which ingredients are missing

---

## Inventory Management

### Viewing Inventory

1. Navigate to **Ingredients** → **Inventory**

```
┌─────────────────────────────────────────────────────────────┐
│  Inventory                                     [+ Add Stock] │
├─────────────────────────────────────────────────────────────┤
│  Search: [Ingredient name...]                [Filter ▼]      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Ingredient      Unit    Available   Reorder   Status│   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  Coffee Beans    kg      5.0         2.0       OK   │   │
│  │  Milk            l       12.5        5.0       OK   │   │
│  │  Sugar           kg      3.0         1.0       Low  │   │
│  │  Tea Bags        pcs     150         50        OK   │   │
│  │  Croissants      pcs     0           20        LOW! │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Adding Stock

1. Find the ingredient
2. Click **+ Add Stock**
3. Enter details:
   - Quantity
   - Unit
   - Notes (optional)
4. Click **Add Stock**

### Recording Waste

Use this when ingredients are spoiled or expired:

1. Go to **Ingredients** → **Transactions**
2. Click **Record Waste**
3. Enter:
   - Ingredient
   - Quantity
   - Reason (spoiled, expired, damaged)

### Viewing Inventory History

1. Go to **Ingredients** → **Transactions**
2. View all stock movements:
   - Purchases (green)
   - Sales (blue)
   - Waste (red)
   - Adjustments (yellow)

### Stock Status Indicators

| Icon | Meaning |
|------|---------|
| 🟢 OK | Stock level is healthy |
| 🟡 Low | Stock is running low |
| 🔴 LOW! | Critical - reorder immediately |
| ⚪ Out | No stock available |

---

## Product & Recipe Management

### Adding Products (Menu Items)

1. Go to **Products** → **Menu**
2. Click **Add Product**
3. Fill in:
   - **Name**: Product name (e.g., "Espresso")
   - **Description**: Product details
   - **Category**: Select from dropdown
   - **Price**: Selling price in Birr
   - **Image**: Upload product photo
   - **Prep Time**: Preparation time in minutes
4. Click **Save Product**

### Managing Categories

1. Go to **Products** → **Categories**
2. **Add Category**: Click "+ Add Category"
3. **Edit Category**: Click the edit icon
4. **Delete Category**: Click the trash icon (only if no products use it)

### Creating Recipes

A recipe defines what ingredients are needed to make a product.

1. Go to **Recipes**
2. Click **Add Recipe**
3. Select the **Product** this recipe is for
4. Add ingredients:

```
┌─────────────────────────────────────────────────────────────┐
│  Create Recipe                                              │
├─────────────────────────────────────────────────────────────┤
│  Product:  [Select Product ▼]                               │
│                                                             │
│  Ingredients:                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Ingredient        Quantity    Unit    Actions      │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  Coffee Beans     [____]      kg      [🗑️]         │   │
│  │  Water            [____]      ml      [🗑️]         │   │
│  │                                                     │   │
│  │                                    [+ Add Ingredient] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                     [Cancel]  [ Save Recipe ]                │
└─────────────────────────────────────────────────────────────┘
```

5. **Add Ingredient**: Click "+ Add Ingredient"
6. Select ingredient and quantity
7. Click **Save Recipe**

### Product Availability

Products are automatically shown/hidden based on inventory:

- **Available**: All recipe ingredients are in stock
- **Unavailable**: One or more ingredients are out of stock

---

## Customer Management

### Adding New Customers

1. Go to **Customers**
2. Click **+ Add Customer**
3. Fill in details:

```
┌─────────────────────────────────────────────────────────────┐
│  Add New Customer                                            │
├─────────────────────────────────────────────────────────────┤
│  Full Name:    [_________________________]                   │
│  Phone:        [_________________________]                   │
│  Email:        [_________________________] (optional)        │
│  Type:        (○ Regular  ○ VIP  ○ Member)                  │
│  Discount:     [____]%                                        │
│                                                             │
│                     [Cancel]  [ Save Customer ]               │
└─────────────────────────────────────────────────────────────┘
```

4. Click **Save Customer**

### Customer Types & Discounts

| Type | Description | Default Discount |
|------|-------------|------------------|
| **Regular** | Regular customer | 0% |
| **VIP** | VIP customer | 5% |
| **Member** | Loyal member | 10% |

### Viewing Customer Details

1. Go to **Customers**
2. Click on a customer to view:
   - Contact information
   - Order history
   - Total spent
   - Loyalty points
   - Visit count

### Managing Customer Types

Customer types can be upgraded based on spending:
- Regular → VIP: After 10,000 Birr spent
- VIP → Member: After 50,000 Birr spent

---

## Staff Management

### Adding Staff Members

1. Go to **Settings** → **Users**
2. Click **+ Add Staff**
3. Fill in:

```
┌─────────────────────────────────────────────────────────────┐
│  Add New Staff                                               │
├─────────────────────────────────────────────────────────────┤
│  Full Name:    [_________________________]                   │
│  Email:        [_________________________]                   │
│  Phone:        [_________________________]                   │
│  Role:         (○ Manager  ○ Cashier  ○ Waiter)            │
│  Position:     [_________________________]                   │
│  Employee ID:   [_________________________]                   │
│                                                             │
│                     [Cancel]  [ Save Staff ]                 │
└─────────────────────────────────────────────────────────────┘
```

### User Roles

| Role | Permissions |
|------|-------------|
| **Manager** | Full management access |
| **Cashier** | Create orders, process payments |
| **Waiter** | View orders, manage tables |

### Editing Staff Details

1. Find the staff member
2. Click **Edit**
3. Update information
4. Click **Save**

### Deactivating Staff

If an employee leaves:
1. Find the staff member
2. Click **Deactivate**
3. Confirm the action

---

## Table Management

### Adding Tables

1. Go to **Tables**
2. Click **+ Add Table**
3. Enter:
   - **Name**: Table number or name (e.g., "Table 1", "Outdoor 1")
   - **Capacity**: Number of seats

### Table Status

| Status | Meaning |
|--------|---------|
| **Available** | Table is free |
| **Occupied** | Table has customers |
| **Reserved** | Table is reserved |

### Managing Table Status

1. Go to **Tables**
2. Click on a table
3. Change status:
   - Available → Occupied (when customers sit)
   - Occupied → Available (when customers leave)

---

## Reports & Analytics

### Sales Reports

1. Go to **Reports**
2. View:
   - **Today's Sales**: Revenue today
   - **Weekly Sales**: Last 7 days
   - **Monthly Sales**: Current month

### Inventory Reports

1. Go to **Reports** → **Inventory**
2. View:
   - Stock levels
   - Low stock alerts
   - Usage trends

### Customer Reports

1. Go to **Reports** → **Customers**
2. View:
   - Top customers
   - Customer acquisition
   - Loyalty program stats

---

## Settings

### Business Settings

1. Go to **Settings** → **Business**
2. Update:
   - Business name
   - Address
   - Phone
   - Email

### Changing Password

1. Go to **Settings** → **Change Password**
2. Enter:
   - Current password
   - New password
   - Confirm new password
3. Click **Change Password**

### Profile Settings

1. Go to **Settings** → **Profile**
2. Update:
   - Full name
   - Phone
   - Email

---

## Troubleshooting

### Common Issues

#### 1. "Cannot Create Order - Missing Ingredients"
**Cause**: Product requires ingredients not in stock
**Solution**: 
- Add stock for missing ingredients
- Or remove the product from the order

#### 2. "Duplicate Order Number Error"
**Cause**: System generated a duplicate order number
**Solution**: 
- Refresh the page
- Try creating the order again
- Contact administrator if persists

#### 3. "User Account Inactive"
**Cause**: Your account has been deactivated
**Solution**: 
- Contact your manager or administrator

#### 4. "Session Expired"
**Cause**: You were inactive for too long
**Solution**: 
- Log in again

#### 5. "Product Not Showing in Menu"
**Cause**: Either:
- Product is inactive
- Product has no recipe
- Recipe ingredients are out of stock
**Solution**: 
- Check product status
- Add or update recipe
- Add stock for ingredients

### Getting Help

If you encounter issues not listed here:

1. Check this guide
2. Contact your system administrator
3. Email support (if available)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New order |
| `Ctrl + S` | Save |
| `Ctrl + F` | Search |
| `Esc` | Close dialog/cancel |

---

## Tips & Best Practices

### Daily Tasks

1. **Morning**: Check inventory, note low stock items
2. **During Service**: Add stock as needed, record waste
3. **End of Day**: Review sales, check tomorrow's prep needs

### Inventory Tips

- **FIFO**: Use First In, First Out for perishables
- **Regular Checks**: Count inventory weekly
- **Set Reorder Levels**: Keep track of minimum stock levels

### Customer Service Tips

- **Remember Regulars**: Use customer history
- **Quick Service**: Use the New Order page efficiently
- **Accurate Orders**: Double-check before placing

---

## Glossary

| Term | Definition |
|------|------------|
| **Inventory** | Stock of ingredients and supplies |
| **Recipe** | List of ingredients needed for a product |
| **Order** | Customer's purchase request |
| **Order Item** | Individual product in an order |
| **Stock Deduction** | Automatic removal of used ingredients |
| **Reorder Level** | Minimum stock before reordering |
| **Loyalty Points** | Rewards earned by customers |
| **Customer Type** | Regular, VIP, or Member classification |

---

## Quick Reference

### Main Navigation

| Menu | Submenu | Purpose |
|------|---------|---------|
| **Dashboard** | - | Overview and quick stats |
| **Orders** | New Order | Create new orders |
| | All Orders | View all orders |
| | Histories | Order history |
| **Products** | Menu | Manage menu items |
| | Categories | Manage categories |
| **Ingredients** | Inventory | View stock levels |
| | Transactions | View stock movements |
| **Recipes** | - | Manage recipes |
| **Customers** | - | Manage customers |
| **Tables** | - | Manage tables |
| **Settings** | Profile | Your account |
| | Business | Business settings |
| | Users | Staff management |
| | Units | Unit of measurement |

---

## Document Information

| Detail | Value |
|--------|-------|
| Version | 1.0 |
| Last Updated | February 2025 |
| System | ABC Cafe Management |
| Platform | Web Browser |

---

**End of User Guide**

For technical documentation, see `TECHNICAL_DOCUMENTATION.md`
