import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

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

// Join business room for updates
export const joinBusinessRoom = (businessId: string): void => {
  if (!businessId) return;
  const s = getSocket();
  s.emit('join-business', businessId);
};

// Join customer room for order updates
export const joinCustomerRoom = (customerId: string): void => {
  if (!customerId) return;
  const s = getSocket();
  s.emit('join-customer', customerId);
};

// Legacy methods
export const joinCashierRoom = (): void => {
  const s = getSocket();
  s.emit('join-cashier');
};

export const joinManagerRoom = (): void => {
  const s = getSocket();
  s.emit('join-manager');
};

export default {
  getSocket,
  disconnectSocket,
  joinBusinessRoom,
  joinCustomerRoom,
  joinCashierRoom,
  joinManagerRoom,
};
