import { useState } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, ThumbsUp, Eye, MessageSquare, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import type { ProblemEvidence } from "@/hooks/useProblemEvidence";

interface EvidencePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidence: ProblemEvidence | null;
  allEvidence?: ProblemEvidence[];
  onNavigate?: (evidence: ProblemEvidence) => void;
}

// TikTok embed URL converter
function getTikTokEmbedUrl(url: string): string | null {
  // Extract video ID from TikTok URL
  // Formats: tiktok.com/@user/video/123456 or vm.tiktok.com/123456
  const match = url.match(/video\/(\d+)/) || url.match(/tiktok\.com\/[^/]+\/(\d+)/);
  if (match) {
    return `https://www.tiktok.com/embed/v2/${match[1]}`;
  }
  return null;
}

// YouTube embed URL converter
function getYouTubeEmbedUrl(url: string): string | null {
  // Extract video ID from YouTube URL
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  return null;
}

export function EvidencePreviewModal({ 
  open, 
  onOpenChange, 
  evidence,
  allEvidence = [],
  onNavigate
}: EvidencePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!evidence) return null;

  const isVideo = evidence.evidence_type === "video";
  const currentIndex = allEvidence.findIndex(e => e.id === evidence.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allEvidence.length - 1;

  const handlePrev = () => {
    if (hasPrev && onNavigate) {
      setIsLoading(true);
      onNavigate(allEvidence[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      setIsLoading(true);
      onNavigate(allEvidence[currentIndex + 1]);
    }
  };

  // Get embed URL based on source
  const getEmbedUrl = (): string | null => {
    if (!evidence.video_url) return null;
    
    if (evidence.source === "tiktok") {
      return getTikTokEmbedUrl(evidence.video_url);
    } else if (evidence.source === "youtube") {
      return getYouTubeEmbedUrl(evidence.video_url);
    }
    return null;
  };

  const embedUrl = isVideo ? getEmbedUrl() : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-3xl p-0 gap-0 overflow-hidden bg-black border-border/10">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {evidence.video_author_avatar || evidence.comment_author_avatar ? (
              <img
                src={evidence.video_author_avatar || evidence.comment_author_avatar}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10" />
            )}
            <div>
              <p className="text-sm text-white font-medium">
                {isVideo ? evidence.video_author : `u/${evidence.comment_author}`}
              </p>
              <p className="text-xs text-white/50 capitalize">{evidence.source}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(evidence.video_url || evidence.comment_source_url, '_blank')}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs sm:text-sm px-2 sm:px-3"
            >
              <ExternalLink className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Open Original</span>
            </Button>
            <DialogClose asChild>
              <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
            </DialogClose>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {isVideo ? (
            <div className="relative aspect-[9/16] max-h-[70vh] mx-auto bg-black">
              {embedUrl ? (
                <>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onLoad={() => setIsLoading(false)}
                  />
                </>
              ) : (
                // Fallback to thumbnail with play button linking to external
                <div className="relative w-full h-full">
                  {evidence.video_thumbnail && (
                    <img
                      src={evidence.video_thumbnail}
                      alt={evidence.video_title || "Video"}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <a
                      href={evidence.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 text-white"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Play className="h-8 w-8 fill-white" />
                      </div>
                      <span className="text-sm">Watch on {evidence.source}</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Navigation arrows */}
              {allEvidence.length > 1 && (
                <>
                  {hasPrev && (
                    <button
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  )}
                  {hasNext && (
                    <button
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            // Comment view
            <div className="p-8 min-h-[300px] flex flex-col justify-center">
              <div className="max-w-xl mx-auto">
                <MessageSquare className="h-8 w-8 text-white/30 mb-4" />
                <blockquote className="text-lg text-white leading-relaxed mb-6">
                  "{evidence.comment_text}"
                </blockquote>
                <div className="flex items-center gap-4 text-white/50 text-sm">
                  <span>u/{evidence.comment_author}</span>
                  {evidence.comment_upvotes && (
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {formatNumber(evidence.comment_upvotes)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with stats */}
        {isVideo && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <div className="flex items-center gap-6 text-white/70 text-sm">
              {evidence.video_views && (
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {formatNumber(evidence.video_views)} views
                </span>
              )}
              {evidence.video_likes && (
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  {formatNumber(evidence.video_likes)} likes
                </span>
              )}
              {evidence.video_comments_count && (
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {formatNumber(evidence.video_comments_count)} comments
                </span>
              )}
            </div>
            {allEvidence.length > 1 && (
              <span className="text-xs text-white/40 font-mono">
                {currentIndex + 1} / {allEvidence.length}
              </span>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
