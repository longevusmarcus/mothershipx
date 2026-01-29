import { useMemo, useState } from "react";
import { Play, MessageSquare } from "lucide-react";
import { useProblemEvidence } from "@/hooks/useProblemEvidence";

interface EvidenceThumbnailsProps {
  problemId: string;
  maxThumbnails?: number;
  sourceType?: "reddit" | "youtube" | "tiktok" | "default";
}

// Mock Reddit post thumbnails - realistic Reddit post preview images
const MOCK_REDDIT_THUMBNAILS = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=140&fit=crop", // desk setup
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=140&fit=crop", // workspace
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=140&fit=crop", // person
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=140&fit=crop", // professional
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

  // For Reddit sources with no video evidence, show mock Reddit thumbnails
  if (sourceType === "reddit" && thumbnails.length === 0 && !isLoading) {
    return (
      <div className="flex gap-1.5 overflow-hidden">
        {MOCK_REDDIT_THUMBNAILS.slice(0, 2).map((src, index) => (
          <div
            key={`reddit-mock-${index}`}
            className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-muted group"
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover opacity-80"
              loading="lazy"
            />
            {/* Reddit comment overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <MessageSquare className="h-3 w-3 text-white" />
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
