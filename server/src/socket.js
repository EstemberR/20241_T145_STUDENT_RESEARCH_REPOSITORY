import { Server } from 'socket.io';

let io = null;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('accountUpdate', (data) => {
      // Broadcast the update to all clients including the sender
      io.emit('accountUpdate', data);
    });

    socket.on('editModeChange', (data) => {
      // Broadcast edit mode changes to all clients
      io.emit('editModeChange', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};