import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Join customer room for order updates
export const joinCustomerRoom = (customerId: string): void => {
  const s = getSocket();
  s.emit('join-customer', customerId);
};

// Join cashier room for new order notifications
export const joinCashierRoom = (): void => {
  const s = getSocket();
  s.emit('join-cashier');
};

// Join manager room for reservation notifications
export const joinManagerRoom = (): void => {
  const s = getSocket();
  s.emit('join-manager');
};

export default {
  getSocket,
  disconnectSocket,
  joinCustomerRoom,
  joinCashierRoom,
  joinManagerRoom,
};
