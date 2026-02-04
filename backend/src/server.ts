import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.io instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join room for specific business (Cashier, Manager, Staff)
  socket.on('join-business', (businessId: string) => {
    socket.join(`business_${businessId}`);
    console.log(`Socket ${socket.id} joined business room: business_${businessId}`);
  });

  // Join room for specific user/customer
  socket.on('join-customer', (customerId: string) => {
    socket.join(`customer-${customerId}`);
    console.log(`Customer ${customerId} joined room`);
  });

  // Legacy events (keeping for compatibility during transition if needed)
  socket.on('join-cashier', () => {
    socket.join('cashier-queue');
  });

  socket.on('join-manager', () => {
    socket.join('manager-reservations');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible in app
app.set('io', io);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
