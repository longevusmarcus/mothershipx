import { useMemo, useState } from "react";
import { Play, MessageSquare } from "lucide-react";
import { useProblemEvidence } from "@/hooks/useProblemEvidence";

interface EvidenceThumbnailsProps {
  problemId: string;
  maxThumbnails?: number;
  sourceType?: "reddit" | "youtube" | "tiktok" | "default";
}

// Mock Reddit text post data
const MOCK_REDDIT_POSTS = [
  { lines: 3, hasAward: true },
  { lines: 2, hasAward: false },
];

export function EvidenceThumbnails({ problemId, maxThumbnails = 4, sourceType = "default" }: EvidenceThumbnailsProps) {
  const { data, isLoading } = useProblemEvidence(problemId);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const thumbnails = useMemo(() => {
    if (!data?.videos) return [];
    return data.videos
      .filter((v) => v.video_thumbnail && !failedImages.has(v.id))
      .slice(0, maxThumbnails);
  }, [data?.videos, maxThumbnails, failedImages]);

  const handleImageError = (videoId: string) => {
    setFailedImages((prev) => new Set(prev).add(videoId));
  };

  // For Reddit sources with no video evidence, show mock Reddit text post thumbnails
  if (sourceType === "reddit" && thumbnails.length === 0 && !isLoading) {
    return (
      <div className="flex gap-1.5 overflow-hidden">
        {MOCK_REDDIT_POSTS.map((post, index) => (
          <div
            key={`reddit-mock-${index}`}
            className="relative w-12 h-14 flex-shrink-0 rounded overflow-hidden bg-[#1a1a1b] border border-[#343536] p-1.5"
          >
            {/* Reddit post header */}
            <div className="flex items-center gap-0.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <div className="h-1 w-4 bg-[#818384] rounded-sm" />
            </div>
            {/* Text lines */}
            <div className="space-y-0.5">
              {Array.from({ length: post.lines }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-1 bg-[#d7dadc]/60 rounded-sm" 
                  style={{ width: `${85 - i * 15}%` }}
                />
              ))}
            </div>
            {/* Bottom bar with upvote icon */}
            <div className="absolute bottom-1 left-1.5 flex items-center gap-1">
              <MessageSquare className="h-2 w-2 text-[#818384]" />
              {post.hasAward && (
                <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return null; // Don't show loading state to keep cards clean
  }

  if (thumbnails.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1.5 overflow-hidden">
      {thumbnails.map((video, index) => (
        <div
          key={video.id || index}
          className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-muted group"
        >
          <img
            src={video.video_thumbnail!}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => handleImageError(video.id)}
          />
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-3 w-3 text-white fill-white" />
          </div>
        </div>
      ))}
      {/* Show count if more videos exist */}
      {data?.videos && data.videos.filter(v => v.video_thumbnail && !failedImages.has(v.id)).length > maxThumbnails && (
        <div className="w-10 h-14 flex-shrink-0 rounded bg-muted/50 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground font-medium">
            +{data.videos.filter(v => v.video_thumbnail && !failedImages.has(v.id)).length - maxThumbnails}
          </span>
        </div>
      )}
    </div>
  );
}
