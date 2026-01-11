import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "collab_request" | "waitlist" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

const STORAGE_KEY = "mothership_notifications";
const READ_KEY = "mothership_notifications_read";
const DISMISSED_KEY = "mothership_notifications_dismissed";

// Mock notifications for demo
const mockNotifications: Omit<Notification, "read">[] = [
  {
    id: "1",
    type: "success",
    title: "Welcome to Mothership!",
    message: "Start exploring opportunities and building solutions.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    type: "collab_request",
    title: "Collaboration Request",
    message: "Sarah Kim wants to team up on the SaaS Onboarding problem.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    actionUrl: "/problems/pr-001",
  },
  {
    id: "3",
    type: "info",
    title: "New Trending Problem",
    message: "A new opportunity is gaining traction: AI-powered meeting notes.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    actionUrl: "/problems",
  },
];

function getReadIds(): Set<string> {
  try {
    const stored = localStorage.getItem(READ_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function getDismissedIds(): Set<string> {
  try {
    const stored = localStorage.getItem(DISMISSED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

function saveDismissedIds(ids: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const readIds = getReadIds();
      const dismissedIds = getDismissedIds();
      
      const loadedNotifications = mockNotifications
        .filter((n) => !dismissedIds.has(n.id))
        .map((n) => ({
          ...n,
          read: readIds.has(n.id),
        }));
      
      setNotifications(loadedNotifications);
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    const readIds = getReadIds();
    readIds.add(id);
    saveReadIds(readIds);
    
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const readIds = getReadIds();
    notifications.forEach((n) => readIds.add(n.id));
    saveReadIds(readIds);
    
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  const dismissNotification = useCallback((id: string) => {
    const dismissedIds = getDismissedIds();
    dismissedIds.add(id);
    saveDismissedIds(dismissedIds);
    
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification,
  };
}
