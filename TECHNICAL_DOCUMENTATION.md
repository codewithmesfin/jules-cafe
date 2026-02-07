# ABC Cafe - Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Key Features](#key-features)
7. [Inventory Management](#inventory-management)
8. [Order Processing](#order-processing)
9. [User Roles & Permissions](#user-roles--permissions)
10. [Setup & Deployment](#setup--deployment)

---

## Project Overview

ABC Cafe is a comprehensive restaurant management system built with the MERN stack (MongoDB, Express, React, Node.js). It provides complete business management capabilities including inventory tracking, order processing, customer management, and reporting.

### Key Capabilities
- **Inventory Management**: Track ingredients, stock levels, and automatic deduction on order completion
- **Order Processing**: Create and manage orders with real-time inventory validation
- **Recipe Management**: Define recipes with ingredients and quantities
- **Customer Management**: Track customers, loyalty points, and discount tiers
- **Business Analytics**: Reports and insights for business decisions

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Custom fetch wrapper
- **UI Components**: Custom components (Button, Modal, Drawer, etc.)

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with bcrypt
- **Real-time**: Socket.io for live updates

### DevOps
- **Containerization**: Docker & Docker Compose
- **Package Management**: npm/yarn

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Cashier   │  │  Dashboard  │  │     Settings        │  │
│  │   Views     │  │   Views     │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Express)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Controllers │  │   Routes    │  │    Middleware       │  │
│  │  (Business  │  │  (API End-  │  │  (Auth, Error,      │  │
│  │   Logic)    │  │   points)   │  │   Upload)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Models    │  │   Utils     │  │    Services         │  │
│  │  (Mongoose) │  │  (Helpers)  │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE (MongoDB)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Collections │  │  Indexes    │  │    Transactions     │  │
│  │  - Users    │  │  - Business │  │                     │  │
│  │  - Orders   │  │    ID       │  │                     │  │
│  │  - Products │  │  - Status   │  │                     │  │
│  │  - Inventory│  │  - Created  │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Models

#### User
```typescript
interface IUser {
  _id: ObjectId;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier' | 'waiter' | 'saas_admin';
  is_active: boolean;
  default_business_id: ObjectId;  // Reference to Business
  created_at: Date;
  updated_at: Date;
}
```

#### Business
```typescript
interface IBusiness {
  _id: ObjectId;
  name: string;
  type: string;
  owner_id: ObjectId;  // Reference to User
  subscription_id?: ObjectId;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}
```

#### Product (Menu Items)
```typescript
interface IProduct {
  _id: ObjectId;
  name: string;
  description?: string;
  price: number;
  category_id: ObjectId;
  image_url?: string;
  is_active: boolean;
  preparation_time?: number;  // in minutes
  business_id: ObjectId;
  creator_id: ObjectId;
}
```

#### Recipe (Ingredients Required)
```typescript
interface IRecipe {
  _id: ObjectId;
  product_id: ObjectId;    // Reference to Product
  ingredient_id: ObjectId;  // Reference to Ingredient
  quantity_required: number;
  unit: string;  // kg, g, ml, pcs, etc.
  business_id: ObjectId;
  creator_id: ObjectId;
}
```

#### Ingredient
```typescript
interface IIngredient {
  _id: ObjectId;
  name: string;
  unit_id: ObjectId;  // Reference to Unit
  description?: string;
  is_active: boolean;
  business_id: ObjectId;
  creator_id: ObjectId;
}
```

#### Inventory
```typescript
interface IInventory {
  _id: ObjectId;
  business_id: ObjectId;
  item_id: ObjectId;  // Reference to Ingredient
  item_type: 'ingredient';
  quantity_available: number;
  unit: string;
  reorder_level: number;
  last_restock_date?: Date;
}
```

#### Order
```typescript
interface IOrder {
  _id: ObjectId;
  order_number: string;  // Unique (e.g., ORD-ABC123)
  business_id: ObjectId;
  creator_id: ObjectId;
  customer_id?: ObjectId;
  table_id?: ObjectId;
  waiter_id?: ObjectId;
  order_type: 'dine-in' | 'takeaway' | 'delivery';
  order_status: 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_method?: 'cash' | 'card' | 'mobile' | 'other';
  total_amount: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### OrderItem
```typescript
interface IOrderItem {
  _id: ObjectId;
  order_id: ObjectId;
  product_id: ObjectId;
  quantity: number;
  price: number;
  business_id: ObjectId;
  creator_id: ObjectId;
}
```

#### Customer
```typescript
interface ICustomer {
  _id: ObjectId;
  user_id: ObjectId;  // Reference to User
  full_name: string;
  phone: string;
  email?: string;
  customer_type: 'regular' | 'vip' | 'member';
  discount_percent: number;
  total_spent: number;
  loyalty_points: number;
  visit_count: number;
  business_id: ObjectId;
}
```

#### Table
```typescript
interface ITable {
  _id: ObjectId;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  business_id: ObjectId;
}
```

#### Unit & UnitConversion
```typescript
interface IUnit {
  _id: ObjectId;
  name: string;  // kg, g, l, ml, pcs, etc.
  business_id: ObjectId;
}

interface IUnitConversion {
  _id: ObjectId;
  business_id: ObjectId;
  from_unit: string;
  to_unit: string;
  factor: number;  // Conversion factor
}
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and get JWT | Public |
| GET | `/api/auth/me` | Get current user | Protected |

### Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products | Admin, Manager, Cashier |
| GET | `/api/products/:id` | Get single product | Admin, Manager, Cashier |
| GET | `/api/products/available` | Get products with available inventory | Admin, Manager, Cashier |
| POST | `/api/products` | Create product | Admin, Manager |
| PATCH | `/api/products/:id` | Update product | Admin, Manager |
| DELETE | `/api/products/:id` | Delete product | Admin, Manager |

### Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/orders` | Get all orders | Admin, Manager, Cashier, Waiter |
| GET | `/api/orders/:id` | Get single order | Admin, Manager, Cashier, Waiter |
| GET | `/api/orders/:id/items` | Get order items | Admin, Manager, Cashier, Waiter |
| POST | `/api/orders` | Create new order | Admin, Manager, Cashier |
| PATCH | `/api/orders/:id` | Update order | Admin, Manager, Cashier |
| DELETE | `/api/orders/:id` | Delete order | Admin, Manager |

### Inventory
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/inventory` | Get all inventory | Admin, Manager |
| GET | `/api/inventory/:id` | Get single inventory | Admin, Manager |
| PATCH | `/api/inventory/:id` | Update inventory | Admin, Manager |
| POST | `/api/inventory/add-stock` | Add stock to inventory | Admin, Manager |
| DELETE | `/api/inventory/:id` | Delete inventory | Admin, Manager |

### Recipes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/recipes` | Get all recipes | Admin, Manager |
| GET | `/api/recipes/:id` | Get single recipe | Admin, Manager |
| POST | `/api/recipes` | Create recipe | Admin, Manager |
| PATCH | `/api/recipes/:id` | Update recipe | Admin, Manager |
| DELETE | `/api/recipes/:id` | Delete recipe | Admin, Manager |

### Customers
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/customers` | Get all customers | Admin, Manager, Cashier |
| GET | `/api/customers/:id` | Get single customer | Admin, Manager, Cashier |
| POST | `/api/customers` | Create customer | Admin, Manager, Cashier |
| PATCH | `/api/customers/:id` | Update customer | Admin, Manager, Cashier |
| DELETE | `/api/customers/:id` | Delete customer | Admin, Manager |

### Categories
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/categories` | Get all categories | All authenticated |
| POST | `/api/categories` | Create category | Admin, Manager |
| PATCH | `/api/categories/:id` | Update category | Admin, Manager |
| DELETE | `/api/categories/:id` | Delete category | Admin, Manager |

### Tables
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tables` | Get all tables | All authenticated |
| POST | `/api/tables` | Create table | Admin, Manager |
| PATCH | `/api/tables/:id` | Update table | Admin, Manager |
| DELETE | `/api/tables/:id` | Delete table | Admin, Manager |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin, Manager |
| GET | `/api/users/:id` | Get single user | Admin, Manager |
| POST | `/api/users/staff` | Create staff user | Admin, Manager |
| PATCH | `/api/users/:id` | Update user | Admin, Manager |
| PATCH | `/api/users/:id/password` | Change password | Admin, Manager |
| DELETE | `/api/users/:id` | Delete user | Admin, Manager |

### Business
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/business/setup` | Setup new business | Admin |
| GET | `/api/business/me` | Get current business | All authenticated |
| GET | `/api/business/:id` | Get business | Admin, Manager |
| GET | `/api/business/my-businesses` | Get user's businesses | All authenticated |
| POST | `/api/business/switch` | Switch business context | All authenticated |
| PATCH | `/api/business/:id` | Update business | Admin, Manager |

---

## Key Features

### 1. Inventory Validation on Order Creation

The system automatically checks if all recipe ingredients are available in inventory before creating an order:

```typescript
// Backend: inventoryUtils.ts
export const checkInventoryForOrderItems = async (
  businessId: string, 
  items: any[],
  productsMap?: Map<string, string>
) => {
  const missingIngredients: string[] = [];

  for (const item of items) {
    const recipes = await Recipe.find({ product_id: item.product_id });

    // If no recipes exist for this product
    if (!recipes || recipes.length === 0) {
      const productName = productsMap?.get(item.product_id.toString()) || `Product (ID: ${item.product_id})`;
      missingIngredients.push(`No recipe defined for ${productName}`);
      continue;
    }

    for (const recipe of recipes) {
      const ingredient = await Ingredient.findById(recipe.ingredient_id);
      const inventory = await Inventory.findOne({
        business_id: businessId,
        item_id: recipe.ingredient_id,
        item_type: 'ingredient'
      });

      if (!inventory) {
        missingIngredients.push(`${ingredient.name} (Available: 0)`);
        continue;
      }

      const requiredQuantity = recipe.quantity_required * item.quantity;
      if (inventory.quantity_available < requiredQuantity) {
        missingIngredients.push(
          `${ingredient.name} (Required: ${requiredQuantity}, Available: ${inventory.quantity_available})`
        );
      }
    }
  }

  return {
    canDeduct: missingIngredients.length === 0,
    missingIngredients
  };
};
```

### 2. Automatic Inventory Deduction on Order Completion

When an order is created, inventory is automatically deducted:

```typescript
// Backend: orderController.ts
// 5. Deduct Inventory (without session)
await deductInventoryForOrder(businessId.toString(), orderId.toString(), items, userId.toString());
```

### 3. Available Products Endpoint

The system provides an endpoint to get only products with available inventory:

```typescript
// Backend: productController.ts
export const getAvailableProducts = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user.default_business_id;
  const products = await Product.find({ business_id: businessId, is_active: true });
  
  const productMap = new Map(products.map(p => [p._id.toString(), p.name]));
  const availableProducts = [];
  const unavailableProducts = [];
  
  for (const product of products) {
    const inventoryCheck = await checkInventoryForOrderItems(businessId.toString(), [{
      product_id: product._id,
      quantity: 1
    }], productMap);
    
    if (inventoryCheck.canDeduct) {
      availableProducts.push(product);
    } else {
      unavailableProducts.push({
        product: product,
        reasons: inventoryCheck.missingIngredients
      });
    }
  }
  
  res.status(200).json({
    success: true,
    data: { available: availableProducts, unavailable: unavailableProducts }
  });
});
```

### 4. Unit Conversion Support

The system supports unit conversions for inventory tracking:

```typescript
const convertQuantity = async (
  businessId: string,
  quantity: number,
  fromUnit: string,
  toUnit: string
): Promise<number> => {
  if (fromUnit === toUnit) return quantity;

  const conversion = await UnitConversion.findOne({
    business_id: businessId,
    from_unit: fromUnit,
    to_unit: toUnit
  });

  if (conversion) return quantity * conversion.factor;

  const reverseConversion = await UnitConversion.findOne({
    business_id: businessId,
    from_unit: toUnit,
    to_unit: fromUnit
  });

  if (reverseConversion) return quantity / reverseConversion.factor;

  return quantity; // Default to 1:1 if no conversion found
};
```

### 5. Order Number Generation

Each order gets a unique order number generated automatically:

```typescript
// Backend: Order.ts
OrderSchema.pre('save', async function(next) {
  if (!this.order_number) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.order_number = `ORD-${timestamp}-${random}`;
  }
  next();
});
```

---

## Inventory Management

### Stock Tracking Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Purchase   │───▶│   Inventory  │───▶│   Recipes    │
│   (Add Stock)│    │   (Current)   │    │   (Usage)    │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │   Orders     │
                  │   (Deduction)│
                  └──────────────┘
```

### Inventory Operations

| Operation | Description | Effect |
|-----------|-------------|--------|
| Add Stock | Record new inventory | + quantity |
| Deduct Stock | Manual adjustment | - quantity |
| Waste | Record spoiled items | - quantity |
| Transfer | Move between locations | + or - quantity |

### Automatic Deduction Flow

1. Order is created with items
2. System validates inventory for all recipe ingredients
3. If validated, order is created
4. Inventory is automatically deducted for each ingredient
5. Transaction is recorded in InventoryTransaction

---

## Order Processing

### Order States

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Preparing │───▶│  Ready   │───▶│Delivered │───▶│Completed │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                                    │
     ▼                                    ▼
┌──────────┐                        ┌──────────┐
│ Cancelled │                        │  Paid    │
└──────────┘                        └──────────┘
```

### Order Types
- **Dine-in**: Customer eats at the restaurant
- **Takeaway**: Customer picks up the order
- **Delivery**: Order is delivered to customer

### Payment Status
- **Unpaid**: Order created but not paid
- **Partial**: Partial payment received
- **Paid**: Full payment received

---

## User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **SAAS Admin** | System administrator | Manage all businesses, subscriptions |
| **Admin** | Business owner/manager | Full access to all features |
| **Manager** | Store manager | Manage staff, products, inventory |
| **Cashier** | Point of sale | Create orders, process payments |
| **Waiter** | Floor staff | View orders, assign to tables |
| **Customer** | End customer | View menu, place orders |

### Role Hierarchy

```
SAAS Admin
    │
    └── Admin
        │
        ├── Manager
        │   ├── Cashier
        │   └── Waiter
        └── Customer
```

---

## Setup & Deployment

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Docker & Docker Compose (optional)

### Environment Variables

Create `.env` file in backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/abc-cafe

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Local Development

1. Clone the repository
2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../src
npm install
```

3. Start MongoDB locally or via Docker:
```bash
docker-compose up -d mongodb
```

4. Start the backend:
```bash
cd backend
npm run dev
```

5. Start the frontend:
```bash
cd src
npm run dev
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

1. Build the frontend:
```bash
cd src
npm run build
```

2. Configure reverse proxy (nginx/Apache)
3. Set up SSL certificate
4. Configure environment variables
5. Set up monitoring and logging

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 423 | Account Inactive |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "error": "Error message for frontend",
  "stack": "Error stack trace (development only)"
}
```

---

## Security

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Token expiration: 7 days

### Authorization
- Role-based access control (RBAC)
- Business-level isolation
- Protected routes middleware

### Data Validation
- Input validation on all endpoints
- MongoDB schema validation
- XSS and SQL injection prevention

---

## Performance Considerations

1. **Database Indexing**: Indexes on frequently queried fields
2. **Caching**: Response caching for read-heavy operations
3. **Pagination**: API responses are paginated
4. **Connection Pooling**: MongoDB connection pooling
5. **Lazy Loading**: Frontend code splitting

---

## Testing

### Unit Tests
```bash
cd backend
npm run test
```

### Integration Tests
```bash
cd backend
npm run test:integration
```

### E2E Tests
```bash
cd src
npm run test:e2e
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

## License

This project is proprietary software. All rights reserved.
