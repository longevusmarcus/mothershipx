import { motion } from "framer-motion";
import { Video, MessageSquare, ExternalLink, ThumbsUp, Eye, Play, RefreshCw } from "lucide-react";
import { useProblemEvidence, useScrapeEvidence } from "@/hooks/useProblemEvidence";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

// Source brand icons
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

interface ProblemEvidenceSectionProps {
  problemId: string;
  problemTitle: string;
}

export function ProblemEvidenceSection({ problemId, problemTitle }: ProblemEvidenceSectionProps) {
  const { data, isLoading } = useProblemEvidence(problemId);
  const scrapeEvidence = useScrapeEvidence();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Scrape from both sources
      await Promise.all([
        scrapeEvidence.mutateAsync({
          problemId,
          searchQuery: problemTitle,
          source: "tiktok",
        }),
        scrapeEvidence.mutateAsync({
          problemId,
          searchQuery: problemTitle,
          source: "reddit",
        }),
      ]);
      toast.success("Evidence refreshed!");
    } catch (error) {
      console.error("Error refreshing evidence:", error);
      toast.error("Failed to refresh evidence");
    } finally {
      setIsRefreshing(false);
    }
  };

  const videos = data?.videos || [];
  const comments = data?.comments || [];
  const hasEvidence = videos.length > 0 || comments.length > 0;

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-6 bg-card/50">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-muted rounded w-40" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-lg p-6 bg-card/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Source Evidence</h3>
          <span className="text-xs text-muted-foreground font-mono">
            ({videos.length + comments.length} items)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 font-mono text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {!hasEvidence ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <Video className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No source evidence yet</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="font-mono text-xs"
          >
            {isRefreshing ? "Scraping..." : "Scrape Evidence"}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Video Grid */}
          {videos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TikTokIcon />
                <span className="text-sm font-medium">TikTok Videos</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {videos.map((video, index) => (
                  <motion.a
                    key={video.id}
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all"
                  >
                    {video.video_thumbnail ? (
                      <img
                        src={video.video_thumbnail}
                        alt={video.video_title || "Video thumbnail"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Play className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Stats */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2 text-white text-[10px]">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(video.video_views || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {formatNumber(video.video_likes || 0)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Play icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="h-5 w-5 text-white fill-white" />
                      </div>
                    </div>
                    
                    {/* Author */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      {video.video_author_avatar ? (
                        <img
                          src={video.video_author_avatar}
                          alt={video.video_author}
                          className="w-5 h-5 rounded-full border border-white/30"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {comments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <RedditIcon />
                <span className="text-sm font-medium">Real Comments</span>
              </div>
              <div className="space-y-2">
                {comments.map((comment, index) => (
                  <motion.a
                    key={comment.id}
                    href={comment.comment_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="block p-3 rounded-lg border border-border bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-3">
                          "{comment.comment_text}"
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="font-mono">u/{comment.comment_author}</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {comment.comment_upvotes}
                          </span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
