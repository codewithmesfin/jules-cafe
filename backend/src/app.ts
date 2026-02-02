import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import branchRoutes from './routes/branchRoutes';
import tableRoutes from './routes/tableRoutes';
import categoryRoutes from './routes/categoryRoutes';
import menuItemRoutes from './routes/menuItemRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';
import otherRoutes from './routes/otherRoutes';
import publicRoutes from './routes/publicRoutes';
import errorHandler from './middleware/errorHandler';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api', otherRoutes);
app.use('/', publicRoutes);

// Health check
app.get('/health', (req, res) => res.send('API is running...'));

// Error Handler Middleware
app.use(errorHandler);

export default app;
