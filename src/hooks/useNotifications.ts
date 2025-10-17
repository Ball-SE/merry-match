import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

type AppNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: {
    match_type: string;
    matched_user_id: string;
    matched_user_name: string;
    matched_user_photo: string;
    match_id: string;
    message_preview: string;
    sender_id: string;
    sender_name: string;
    sender_photo: string;
    liker_user_id?: string;
    liker_user_name?: string;
    liker_user_photo?: string;
  };
  is_read: boolean;
  created_at: string;
};

type Session = {
  user: { id: string };
  access_token: string;
};

export function useNotifications(
  presence?: { activeMatchId?: string; isOtherOnlineInThisRoom?: boolean }
) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Load auth session
  useEffect(() => {
    const getSession = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
  }, []);

  // Initial fetch
  const fetchNotifications = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (session?.access_token) fetchNotifications();
  }, [session?.access_token, fetchNotifications]);

  // Mark as read
  const markAsRead = useCallback(
    async (notificationIds: string[]) => {
      if (!session?.access_token) return;

      try {
        const response = await fetch("/api/notifications", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ notification_ids: notificationIds }),
        });

        if (!response.ok) throw new Error("Failed to mark as read");

        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n.id) ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    },
    [session?.access_token]
  );

  // Realtime subscription with presence suppression
  useEffect(() => {
    if (!session?.access_token) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${session.access_token}` } } }
    );

    const autoRead = async (id: string) => {
      try {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ notification_ids: [id] }),
        });
      } catch (e) {
        console.error("autoRead failed:", e);
      }
    };

    const upsertLocal = (n: AppNotification) => {
      const suppress =
        presence?.activeMatchId &&
        presence?.isOtherOnlineInThisRoom &&
        n.type === "message" &&
        n.data?.match_id === presence.activeMatchId;

      if (suppress) {
        n = { ...n, is_read: true };
        autoRead(n.id);
      }

      setNotifications((prev) => {
        const idx = prev.findIndex((x) => x.id === n.id);
        if (idx === -1) return [n, ...prev];
        const next = [...prev];
        next[idx] = { ...prev[idx], ...n };
        return next;
      });

      if (!n.is_read) setUnreadCount((c) => c + 1);
    };

    const updateLocalRead = (id: string, is_read: boolean) => {
      setNotifications((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_read } : p))
      );
      if (is_read) setUnreadCount((c) => Math.max(0, c - 1));
    };

    const channel = supabase.channel("realtime:notifications");
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: { new: AppNotification }) => {
          const row = payload.new as AppNotification;
          if (row.user_id === session?.user?.id) upsertLocal(row);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload: { new: AppNotification }) => {
          const row = payload.new as AppNotification;
          updateLocalRead(row.id, row.is_read);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.access_token, presence?.activeMatchId, presence?.isOtherOnlineInThisRoom]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    refetch: fetchNotifications,
  };
}