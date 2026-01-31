# Restaurant Inventory Management System - Database Schema Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        ITEMS TABLE                           │
│              (Master Catalog - Single Source)               │
│  - All items created here                                   │
│  - item_type: ingredient | menu_item | product | packaging  │
│  - category, unit, pricing, tracking settings              │
└─────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   MENU ITEMS     │ │  INVENTORY ITEM  │ │   STOCK ENTRY    │
│  (item_id ref)   │ │   (item_id ref)  │ │   (item_id ref)  │
│                  │ │                  │ │                  │
│ - Category       │ │ - Branch stock   │ │ - All movements  │
│ - Pricing        │ │ - Min/max levels │ │ - Purchase       │
│ - Availability   │ │ - Cost tracking  │ │ - Sale           │
│ - Allergens      │ │ - Expiry dates   │ │ - Waste          │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │     RECIPES      │
                                    │  (menu_item_id)  │
                                    │                  │
                                    │ - Recipe         │
                                    │   Ingredients    │
                                    │   (item_id ref)  │
                                    └──────────────────┘
```

---

## Core Tables & Attributes

### 1. **Item** (Master Catalog)
**Purpose**: Single source of truth for all items in the system.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `item_id` | UUID/ObjectId | Yes | Primary key |
| `item_name` | String | Yes | Unique name |
| `item_type` | Enum | Yes | `ingredient`, `menu_item`, `product`, `packaging` |
| `sku` | String | Optional | Stock keeping unit code |
| `category` | String | Yes | Category classification |
| `unit` | String | Yes | Base unit: `kg`, `g`, `l`, `ml`, `pcs`, `box` |
| `conversion_factor` | Decimal | Optional | For unit conversions (default: 1) |
| `default_price` | Decimal | Optional | Standard cost/selling price |
| `description` | Text | Optional | Item description |
| `image_url` | String | Optional | Image path |
| `is_active` | Boolean | Yes | Whether item is usable |
| `expiry_tracking` | Boolean | No | Track expiration dates |

---

### 2. **MenuItem** (Menu Items for Sale)
**Purpose**: Menu items available to customers. References Items table.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `menu_item_id` | UUID/ObjectId | Yes | Primary key |
| `item_id` | UUID/ObjectId | Yes | **FK → Item.item_id** (mandatory) |
| `category_id` | UUID/ObjectId | Yes | FK → Category |
| `base_price` | Decimal | Yes | Standard selling price |
| `is_available` | Boolean | Yes | Available for ordering |
| `is_featured` | Boolean | No | Featured item flag |

---

### 3. **InventoryItem** (Branch Stock Levels)
**Purpose**: Track current stock levels at each branch. References Items table.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `inventory_id` | UUID/ObjectId | Yes | Primary key |
| `branch_id` | UUID/ObjectId | Yes | FK → Branch |
| `item_id` | UUID/ObjectId | Yes | **FK → Item.item_id** |
| `current_quantity` | Decimal | Yes | Current stock on hand |
| `available_quantity` | Computed | - | `current - reserved` |
| `min_stock_level` | Decimal | Yes | Reorder point alert |
| `expiry_date` | Date | Optional | For perishable items |

---

### 4. **Recipe** & **RecipeIngredient** (Menu Item Recipe)
**Purpose**: Defines what ingredients are needed to make a menu item.

| Recipe Attribute | Type | Description |
|------------------|------|-------------|
| `recipe_id` | UUID | Primary key |
| `menu_item_id` | UUID | FK → MenuItem |
| `is_default` | Boolean | Default recipe flag |
| `yield_quantity` | Decimal | Servings per recipe |

| RecipeIngredient Attribute | Type | Description |
|---------------------------|------|-------------|
| `recipe_ingredient_id` | UUID | Primary key |
| `recipe_id` | UUID | FK → Recipe |
| `item_id` | UUID | **FK → Item.item_id** (ingredient) |
| `quantity` | Decimal | Amount required |

---

### 5. **StockEntry** (Stock Movement History)
**Purpose**: Track all stock movements. References Items table.

| Attribute | Type | Description |
|-----------|------|-------------|
| `entry_id` | UUID | Primary key |
| `item_id` | UUID | **FK → Item.item_id** |
| `entry_type` | Enum | `purchase`, `sale`, `waste`, `transfer`, `adjustment` |
| `quantity` | Decimal | Amount (+ in, - out) |
| `previous_quantity` | Decimal | Stock before movement |
| `new_quantity` | Decimal | Stock after movement |

---

### 6. **User** (User Management with Branch-Based Permissions)

**Purpose**: Users with role-based access. Managers can manage users for their branch.

| Attribute | Type | Description |
|-----------|------|-------------|
| `user_id` | UUID | Primary key |
| `email` | String | Unique, required |
| `full_name` | String | User's full name |
| `phone` | String | Contact number |
| `role` | Enum | `admin`, `manager`, `staff`, `cashier`, `customer` |
| `status` | Enum | `active`, `inactive`, `pending`, `suspended` |
| `branch_id` | UUID | FK → Branch (for staff/cashier) |

**Customer-Specific Fields:**
| Attribute | Type | Description |
|-----------|------|-------------|
| `customer_type` | Enum | `regular`, `vip`, `member` |
| `loyalty_points` | Number | Accumulated loyalty points |
| `discount_rate` | Number | Discount percentage |
| `total_spent` | Number | Total amount spent |
| `visit_count` | Number | Number of visits |

**Staff-Specific Fields:**
| Attribute | Type | Description |
|-----------|------|-------------|
| `employee_id` | String | Employee identification |
| `position` | String | Job position |
| `hire_date` | Date | Employment start date |

---

## User Management - Manager Capabilities

### What Managers Can Do

```
Manager Role
│
├─ Create Cashier Accounts
│  └─ For their assigned branch only
│     - email, password, full_name, phone
│     - Automatically assigned to manager's branch
│     - Status: active
│
├─ Add Staff Users
│  └─ For their assigned branch only
│     - email, password, full_name, phone
│     - position (chef, waiter, etc.)
│     - employee_id
│     - hire_date
│
└─ Add Customers
   └─ For their branch
      - email, full_name, phone
      - customer_type (regular/vip/member)
      - discount_rate
```

### User Roles & Permissions

| Role | Can Create | Can Manage | Scope |
|------|------------|------------|-------|
| `admin` | All users | All users | All branches |
| `manager` | Cashier, Staff, Customer | Cashier, Staff, Customer | Assigned branch |
| `staff` | None | Self | - |
| `cashier` | None | Self | - |
| `customer` | None | Self | - |

---

## Customer Loyalty Program

| Customer Type | Spending Threshold | Discount | Benefits |
|---------------|-------------------|----------|----------|
| `regular` | < 10,000 | 0% | Basic customer |
| `vip` | 10,000+ | 5% | Priority service |
| `member` | 50,000+ | 10% | Exclusive benefits |

**Loyalty Points:**
- 1 point per 1 Birr spent
- Points can be redeemed for discounts

---

## Stock Tracking Flow

### Order Completion → Automatic Inventory Deduction

```
Order Completed
    ↓
For Each Order Item:
    ├─ Get Menu Item → Get Default Recipe
    ├─ For Each Recipe Ingredient (references Item):
    │   ├─ Calculate Required Qty
    │   ├─ Check Stock (InventoryItem → Item)
    │   └─ Create StockEntry (entry_type: 'sale')
    └─ Update InventoryItem.current_quantity
```

### Stock Movement Tracking

| Operation | Entry Type | Effect on Quantity |
|-----------|------------|-------------------|
| Purchase | `purchase` | + |
| Sale | `sale` | - |
| Waste | `waste` | - |
| Transfer In | `transfer_in` | + |
| Transfer Out | `transfer_out` | - |
| Adjustment | `adjustment` | + or - |

---

## Key Questions Answered by the System

| Question | Source |
|----------|--------|
| "What is there?" | `InventoryItem.current_quantity` |
| "What is left?" | `InventoryItem.available_quantity` |
| "What has been sold?" | `StockEntry` WHERE `entry_type = 'sale'` |
| "What has been consumed?" | `StockEntry` WHERE `entry_type IN ('sale', 'waste')` |
| "What items are low stock?" | `InventoryItem` WHERE `current_quantity <= min_stock_level` |
| "Stock history for item?" | `StockEntry` ORDER BY `created_at DESC` |
| "Customer spending?" | `User.total_spent` |
| "Customer loyalty points?" | `User.loyalty_points` |

---

## Data Flow During Operations

### Creating a Menu Item
1. Create Item (item_type = 'menu_item')
2. Create MenuItem with `item_id` → Item

### Creating a Recipe
1. Select MenuItem
2. Add Recipe Ingredients with `item_id` → Item (filtered by item_type = 'ingredient')

### Recording Stock Entry
1. Select Item from Items table
2. Record movement (purchase/waste/transfer/adjustment)

### Manager Creating Cashier
1. Manager provides email, name, phone
2. System creates User with role = 'cashier'
3. User assigned to manager's branch

### Manager Adding Customer
1. Manager provides customer details
2. System creates User with role = 'customer'
3. Customer assigned to manager's branch
4. Customer type: regular (upgrades based on spending)
