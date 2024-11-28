import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';

const EditModeContext = createContext();

export function EditModeProvider({ children }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditor, setCurrentEditor] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8000', {
      withCredentials: true,
      transports: ['websocket']
    });
    setSocket(newSocket);

    newSocket.on('editModeChange', ({ isEditing, editor }) => {
      const userName = localStorage.getItem('userName');
      if (editor !== userName) {
        setIsEditMode(false);
        setCurrentEditor(isEditing ? editor : null);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <EditModeContext.Provider value={{ 
      isEditMode, 
      setIsEditMode, 
      currentEditor, 
      setCurrentEditor,
      socket 
    }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}