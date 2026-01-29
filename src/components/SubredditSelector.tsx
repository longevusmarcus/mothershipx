import { motion } from "framer-motion";
import { Check, MessageSquare, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChannelScans } from "@/hooks/useChannelScans";
import { formatDistanceToNow } from "date-fns";
import logoReddit from "@/assets/logo-reddit.png";

interface Subreddit {
  id: string;
  name: string;
  displayName: string;
  description: string;
  members: string;
}

const SUBREDDITS: Subreddit[] = [
  {
    id: "findapath",
    name: "r/findapath",
    displayName: "Find A Path",
    description: "Career guidance, life direction & decision making",
    members: "800K+",
  },
  {
    id: "finance",
    name: "r/finance",
    displayName: "Finance",
    description: "Financial news, analysis & market discussions",
    members: "2M+",
  },
  {
    id: "problemgambling",
    name: "r/problemgambling",
    displayName: "Problem Gambling",
    description: "Support community for gambling addiction recovery",
    members: "100K+",
  },
];

interface SubredditSelectorProps {
  selectedSubreddit: string | null;
  onSelect: (subredditId: string) => void;
  disabled?: boolean;
}

export function SubredditSelector({ selectedSubreddit, onSelect, disabled }: SubredditSelectorProps) {
  const { data: scans = [] } = useChannelScans();

  const getScanInfo = (subredditId: string) => {
    return scans.find((s) => s.channel_id === `reddit-${subredditId}`);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
        Select a subreddit to analyze (currently 1)
      </p>

      <div className="grid gap-3">
        {SUBREDDITS.map((subreddit, index) => {
          const isSelected = selectedSubreddit === subreddit.id;
          const scanInfo = getScanInfo(subreddit.id);

          return (
            <motion.button
              key={subreddit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              onClick={() => !disabled && onSelect(subreddit.id)}
              disabled={disabled}
              className={cn(
                "relative w-full p-4 rounded-xl text-left transition-all duration-200",
                "border flex items-center gap-4",
                disabled && "opacity-50 cursor-not-allowed",
                isSelected
                  ? "border-orange-500/50 bg-orange-500/10 shadow-lg"
                  : "border-border/50 bg-secondary/30 hover:border-border hover:bg-secondary/50",
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center",
                  isSelected ? "bg-orange-500/20" : "bg-secondary",
                )}
              >
                <img src={logoReddit} alt="Reddit" className="h-7 w-7" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{subreddit.name}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{subreddit.members} members</p>

                {/* Last scanned indicator */}
                {scanInfo ? (
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground/60">
                      Scanned {formatDistanceToNow(new Date(scanInfo.last_scanned_at), { addSuffix: true })}
                    </span>
                    <span className="text-xs text-success">• {scanInfo.problems_found} problems found</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{subreddit.description}</p>
                )}
              </div>

              {/* Action indicator */}
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    scanInfo ? "bg-secondary" : "bg-orange-500/10",
                  )}
                >
                  {scanInfo ? (
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        We analyze top posts and comments to identify real career problems and opportunities
      </p>
    </div>
  );
}
