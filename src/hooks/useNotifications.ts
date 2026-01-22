import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "collab_request" | "waitlist" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications" as never)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const mapped: Notification[] = ((data || []) as DbNotification[]).map((n) => ({
        id: n.id,
        type: (n.type as Notification["type"]) || "info",
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: new Date(n.created_at),
        actionUrl: n.action_url || undefined,
      }));

      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase
        .from("notifications" as never)
        .update({ read: true } as never)
        .eq("id", id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from("notifications" as never)
        .update({ read: true } as never)
        .eq("user_id", user.id)
        .eq("read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, [user]);

  const dismissNotification = useCallback(async (id: string) => {
    try {
      await supabase.from("notifications" as never).delete().eq("id", id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  }, []);

  const addNotification = useCallback(
    async (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("notifications" as never)
          .insert({
            user_id: user.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            action_url: notification.actionUrl || null,
          } as never)
          .select()
          .single();

        if (error) throw error;

        const dbData = data as DbNotification;
        const newNotification: Notification = {
          id: dbData.id,
          type: (dbData.type as Notification["type"]) || "info",
          title: dbData.title,
          message: dbData.message,
          read: dbData.read,
          createdAt: new Date(dbData.created_at),
          actionUrl: dbData.action_url || undefined,
        };

        setNotifications((prev) => [newNotification, ...prev]);
      } catch (err) {
        console.error("Failed to add notification:", err);
      }
    },
    [user]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification,
    refetch: fetchNotifications,
  };
}
