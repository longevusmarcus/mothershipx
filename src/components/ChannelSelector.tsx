import { motion } from "framer-motion";
import { Check, Play, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChannelScans } from "@/hooks/useChannelScans";
import { formatDistanceToNow } from "date-fns";

interface Channel {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
}

const YOUTUBE_CHANNELS: Channel[] = [
  {
    id: "diary-of-a-ceo",
    name: "The Diary Of A CEO",
    handle: "@TheDiaryOfACEO",
    description: "Entrepreneurship, mindset & success stories",
    avatar: "🎙️"
  },
  {
    id: "alex-hormozi",
    name: "Alex Hormozi",
    handle: "@AlexHormozi",
    description: "Business growth, sales & marketing tactics",
    avatar: "💪"
  }
];

interface ChannelSelectorProps {
  selectedChannel: string | null;
  onSelect: (channelId: string) => void;
  disabled?: boolean;
}

export function ChannelSelector({ selectedChannel, onSelect, disabled }: ChannelSelectorProps) {
  const { data: scans = [] } = useChannelScans();

  const getScanInfo = (channelId: string) => {
    return scans.find(s => s.channel_id === channelId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Play className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium">Select a YouTube channel to analyze</span>
      </div>
      
      <div className="grid gap-3">
        {YOUTUBE_CHANNELS.map((channel, index) => {
          const isSelected = selectedChannel === channel.id;
          const scanInfo = getScanInfo(channel.id);
          
          return (
            <motion.button
              key={channel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              onClick={() => !disabled && onSelect(channel.id)}
              disabled={disabled}
              className={cn(
                "relative w-full p-4 rounded-xl text-left transition-all duration-200",
                "border flex items-center gap-4",
                disabled && "opacity-50 cursor-not-allowed",
                isSelected
                  ? "border-red-500/50 bg-red-500/10 shadow-lg"
                  : "border-border/50 bg-secondary/30 hover:border-border hover:bg-secondary/50"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center text-2xl",
                isSelected ? "bg-red-500/20" : "bg-secondary"
              )}>
                {channel.avatar}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{channel.name}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{channel.handle}</p>
                
                {/* Last scanned indicator */}
                {scanInfo ? (
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground/60">
                      Scanned {formatDistanceToNow(new Date(scanInfo.last_scanned_at), { addSuffix: true })}
                    </span>
                    <span className="text-xs text-success">
                      • {scanInfo.problems_found} problems found
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                    {channel.description}
                  </p>
                )}
              </div>
              
              {/* Action indicator */}
              <div className="flex-shrink-0">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  scanInfo ? "bg-secondary" : "bg-red-500/10"
                )}>
                  {scanInfo ? (
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Play className="h-4 w-4 text-red-500 fill-red-500" />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        We analyze recent videos with 50K+ views to find real problems and opportunities
      </p>
    </div>
  );
}
