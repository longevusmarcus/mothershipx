import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserSettings {
  // Notification settings
  email_digest: boolean;
  new_problems: boolean;
  leaderboard_updates: boolean;
  build_verification: boolean;
  weekly_report: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  // Privacy settings
  profile_visibility: "public" | "builders" | "private";
  show_email: boolean;
  show_builds: boolean;
  show_stats: boolean;
  allow_collab_requests: boolean;
  show_on_leaderboard: boolean;
}

const defaultSettings: UserSettings = {
  email_digest: true,
  new_problems: true,
  leaderboard_updates: false,
  build_verification: true,
  weekly_report: true,
  marketing_emails: false,
  push_notifications: true,
  in_app_notifications: true,
  profile_visibility: "public",
  show_email: false,
  show_builds: true,
  show_stats: true,
  allow_collab_requests: true,
  show_on_leaderboard: true,
};

export function useUserSettings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<UserSettings>(defaultSettings);

  // Fetch settings from database
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const loadedSettings: UserSettings = {
          email_digest: data.email_digest,
          new_problems: data.new_problems,
          leaderboard_updates: data.leaderboard_updates,
          build_verification: data.build_verification,
          weekly_report: data.weekly_report,
          marketing_emails: data.marketing_emails,
          push_notifications: data.push_notifications,
          in_app_notifications: data.in_app_notifications,
          profile_visibility: data.profile_visibility as "public" | "builders" | "private",
          show_email: data.show_email,
          show_builds: data.show_builds,
          show_stats: data.show_stats,
          allow_collab_requests: data.allow_collab_requests,
          show_on_leaderboard: data.show_on_leaderboard,
        };
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } else {
        // No settings exist yet, create default ones
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({ user_id: user.id });

        if (insertError && !insertError.message.includes("duplicate")) {
          console.error("Error creating settings:", insertError);
        }
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error loading settings",
        description: "Could not load your settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchSettings]);

  // Check for changes whenever settings change
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Save all settings to database
  const saveSettings = useCallback(async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to save settings.",
        variant: "destructive",
      });
      return false;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          email_digest: settings.email_digest,
          new_problems: settings.new_problems,
          leaderboard_updates: settings.leaderboard_updates,
          build_verification: settings.build_verification,
          weekly_report: settings.weekly_report,
          marketing_emails: settings.marketing_emails,
          push_notifications: settings.push_notifications,
          in_app_notifications: settings.in_app_notifications,
          profile_visibility: settings.profile_visibility,
          show_email: settings.show_email,
          show_builds: settings.show_builds,
          show_stats: settings.show_stats,
          allow_collab_requests: settings.allow_collab_requests,
          show_on_leaderboard: settings.show_on_leaderboard,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setOriginalSettings(settings);
      setHasChanges(false);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "Could not save your settings. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, settings, toast]);

  // Reset to original settings (discard changes)
  const resetSettings = useCallback(() => {
    setSettings(originalSettings);
  }, [originalSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    hasChanges,
    isAuthenticated,
    updateSetting,
    saveSettings,
    resetSettings,
    refetch: fetchSettings,
  };
}
