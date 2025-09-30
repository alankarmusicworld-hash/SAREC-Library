
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';

type Notification = {
  id: string;
  message: string;
  timestamp: Date;
  userId: string;
  createdAt: Timestamp;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (message: string, userId: string) => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
        setNotifications([]);
        return;
    }

    const notificationsCollectionRef = collection(db, 'notifications');
    const q = query(
        notificationsCollectionRef, 
        where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notificationsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                message: data.message,
                userId: data.userId,
                timestamp: data.createdAt ? data.createdAt.toDate() : new Date(),
                createdAt: data.createdAt,
            } as Notification;
        });

        // Sort on the client-side to avoid composite index requirement
        notificationsData.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            }
            return 0;
        });

        setNotifications(notificationsData);
    });

    return () => unsubscribe();

  }, [userId]);


  const addNotification = useCallback(async (message: string, targetUserId: string) => {
    if(!targetUserId) return;
    try {
        const notificationsCollectionRef = collection(db, 'notifications');
        await addDoc(notificationsCollectionRef, {
            message,
            userId: targetUserId,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding notification: ", error);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    // This would require deleting documents from Firestore.
    // For now, we'll just clear the local state for simplicity.
    // A more robust solution would be to mark them as 'read'.
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
