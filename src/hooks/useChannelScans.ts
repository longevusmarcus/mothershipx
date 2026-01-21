import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export interface ChannelScan {
  id: string;
  channel_id: string;
  channel_name: string;
  last_scanned_at: string;
  videos_analyzed: number;
  problems_found: number;
}

export function useChannelScans() {
  return useQuery({
    queryKey: ["channel-scans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_scans")
        .select("*")
        .order("last_scanned_at", { ascending: false });

      if (error) {
        console.error("Error fetching channel scans:", error);
        return [];
      }

      return data as ChannelScan[];
    },
    staleTime: 1000 * 30, // Fresh for 30 seconds
  });
}

export function useChannelScan(channelId: string | null) {
  return useQuery({
    queryKey: ["channel-scan", channelId],
    queryFn: async () => {
      if (!channelId) return null;
      
      const { data, error } = await supabase
        .from("channel_scans")
        .select("*")
        .eq("channel_id", channelId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching channel scan:", error);
        return null;
      }

      return data as ChannelScan | null;
    },
    enabled: !!channelId,
    staleTime: 1000 * 30,
  });
}
