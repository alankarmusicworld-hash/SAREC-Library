
"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

type Notification = {
  id: string;
  message: string;
  timestamp: Date;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
      { id: '1', message: 'Your book "The Great Gatsby" is due tomorrow.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { id: '2', message: 'A new book in "Sci-Fi" has been added.', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  ]);

  const addNotification = useCallback((message: string) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      message,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
