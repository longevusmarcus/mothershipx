import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SquadMember {
  id: string;
  user_id: string;
  role: "lead" | "member";
  is_online: boolean;
  joined_at: string;
  profile?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
}

export interface Squad {
  id: string;
  problem_id: string;
  name: string;
  tagline: string | null;
  max_members: number;
  momentum: number;
  rank: number | null;
  is_hiring: boolean;
  streak: number;
  lead_id: string;
  created_at: string;
  members?: SquadMember[];
}

export function useSquads(problemId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: squads = [], isLoading, error } = useQuery({
    queryKey: ["squads", problemId],
    queryFn: async () => {
      // Get squads for this problem
      const { data: squadsData, error: squadsError } = await supabase
        .from("squads")
        .select("*")
        .eq("problem_id", problemId)
        .order("momentum", { ascending: false });

      if (squadsError) throw squadsError;

      // Get members for each squad
      const squadIds = squadsData?.map((s) => s.id) || [];
      if (squadIds.length === 0) return [];

      const { data: membersData, error: membersError } = await supabase
        .from("squad_members")
        .select("*")
        .in("squad_id", squadIds);

      if (membersError) throw membersError;

      // Get profiles for members
      const userIds = [...new Set(membersData?.map((m) => m.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);

      // Combine data
      return squadsData?.map((squad) => ({
        ...squad,
        members: membersData
          ?.filter((m) => m.squad_id === squad.id)
          .map((m) => ({
            ...m,
            profile: profilesMap.get(m.user_id),
          })),
      })) as Squad[];
    },
    enabled: !!problemId,
  });

  const userSquad = squads.find((s) =>
    s.members?.some((m) => m.user_id === user?.id)
  );

  const createSquad = useMutation({
    mutationFn: async ({ name, tagline }: { name: string; tagline?: string }) => {
      if (!user) throw new Error("Must be logged in");

      // Create the squad
      const { data: squad, error: squadError } = await supabase
        .from("squads")
        .insert({
          problem_id: problemId,
          name,
          tagline: tagline || null,
          lead_id: user.id,
        })
        .select()
        .single();

      if (squadError) throw squadError;

      // Add creator as lead member
      const { error: memberError } = await supabase
        .from("squad_members")
        .insert({
          squad_id: squad.id,
          user_id: user.id,
          role: "lead",
          is_online: true,
        });

      if (memberError) throw memberError;

      return squad;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["squads", problemId] });
      toast.success("Squad created! 🚀");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const joinSquad = useMutation({
    mutationFn: async (squadId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("squad_members").insert({
        squad_id: squadId,
        user_id: user.id,
        role: "member",
        is_online: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["squads", problemId] });
      toast.success("Joined squad! 🎉");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const leaveSquad = useMutation({
    mutationFn: async (squadId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("squad_members")
        .delete()
        .eq("squad_id", squadId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["squads", problemId] });
      toast.success("Left squad");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    squads,
    userSquad,
    isLoading,
    error,
    createSquad,
    joinSquad,
    leaveSquad,
  };
}

export function useSquadMessages(squadId: string | null) {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["squad_messages", squadId],
    queryFn: async () => {
      if (!squadId) return [];

      const { data, error } = await supabase
        .from("squad_messages")
        .select("*")
        .eq("squad_id", squadId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Get sender profiles
      const userIds = [...new Set(data?.filter((m) => m.user_id).map((m) => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return data?.map((msg) => ({
        ...msg,
        sender: msg.user_id ? profilesMap.get(msg.user_id) : null,
      }));
    },
    enabled: !!squadId,
  });

  // Subscribe to realtime messages
  useEffect(() => {
    if (!squadId) return;

    const channel = supabase
      .channel(`squad-messages-${squadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "squad_messages",
          filter: `squad_id=eq.${squadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["squad_messages", squadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [squadId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, isAI = false }: { content: string; isAI?: boolean }) => {
      if (!squadId || !user) throw new Error("Cannot send message");

      const { error } = await supabase.from("squad_messages").insert({
        squad_id: squadId,
        user_id: isAI ? null : user.id,
        content,
        is_ai: isAI,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["squad_messages", squadId] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    messages,
    isLoading,
    sendMessage,
    currentUser: { id: user?.id, name: profile?.name, avatar_url: profile?.avatar_url },
  };
}
