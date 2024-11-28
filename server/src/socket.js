import { Server } from 'socket.io';

let io = null;
let currentEditor = null;

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

    // Send current editor state when client connects
    socket.emit('editModeState', { editor: currentEditor });

    socket.on('accountUpdate', (data) => {
      console.log('Received account update:', data);
      // Broadcast the update to all clients including the sender
      io.emit('accountUpdate', data);
    });

    socket.on('editModeChange', (data) => {
      if (data.isEditing) {
        currentEditor = data.editor;
      } else if (currentEditor === data.editor) {
        currentEditor = null;
      }
      // Broadcast edit mode changes to all clients
      io.emit('editModeChange', { isEditing: data.isEditing, editor: data.editor });
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