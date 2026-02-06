import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import Routes
import authRoutes from './routes/authRoutes';
import businessRoutes from './routes/businessRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import ingredientRoutes from './routes/ingredientRoutes';
import recipeRoutes from './routes/recipeRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes';
import tableRoutes from './routes/tableRoutes';
import customerRoutes from './routes/customerRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import publicRoutes from './routes/publicRoutes';
import menuRoutes from './routes/menuRoutes';
import unitRoutes from './routes/unitRoutes';
import uploadRoutes from './routes/uploadRoutes';
import billingRoutes from './routes/billingRoutes';
import bankAccountRoutes from './routes/bankAccountRoutes';

import errorHandler from './middleware/errorHandler';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http://localhost:8000'],
      connectSrc: ["'self'", 'http://localhost:8000'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'http://localhost:8000'],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/settings', unitRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);

// Cron job route for automated billing checks (no auth required)
import cron from 'node-cron';
import { runBillingChecks } from './utils/scheduler';

// Run billing checks every hour
cron.schedule('0 * * * *', async () => {
  console.log('🕐 Running hourly billing checks...');
  try {
    await runBillingChecks();
    console.log('✅ Hourly billing checks completed');
  } catch (error) {
    console.error('❌ Hourly billing checks failed:', error);
  }
});

// Also run a quick check every 15 minutes for due invoices
cron.schedule('*/15 * * * *', async () => {
  console.log('🕐 Running quick overdue check...');
  try {
    const { checkOverdueInvoices } = await import('./utils/scheduler');
    const count = await checkOverdueInvoices();
    console.log(`✅ Quick overdue check completed: ${count} overdue invoices`);
  } catch (error) {
    console.error('❌ Quick overdue check failed:', error);
  }
});

app.use('/', publicRoutes);

app.get('/health', (req, res) => res.send('API is running...'));

app.use(errorHandler);

export default app;
