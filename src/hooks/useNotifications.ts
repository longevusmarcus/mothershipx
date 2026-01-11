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

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Welcome to Mothership!",
    message: "Start exploring opportunities and building solutions.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
  },
  {
    id: "2",
    type: "collab_request",
    title: "Collaboration Request",
    message: "Sarah Kim wants to team up on the SaaS Onboarding problem.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    actionUrl: "/problems/pr-001",
  },
  {
    id: "3",
    type: "info",
    title: "New Trending Problem",
    message: "A new opportunity is gaining traction: AI-powered meeting notes.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    actionUrl: "/problems",
  },
];

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load mock notifications for logged in users
    if (user) {
      setNotifications(mockNotifications);
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
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
