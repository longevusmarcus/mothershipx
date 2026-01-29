import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { useProblemEvidence } from "@/hooks/useProblemEvidence";

interface EvidenceThumbnailsProps {
  problemId: string;
  maxThumbnails?: number;
}

export function EvidenceThumbnails({ problemId, maxThumbnails = 4 }: EvidenceThumbnailsProps) {
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

  if (isLoading) {
    return null; // Don't show loading state to keep cards clean
  }

  if (thumbnails.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1.5 mt-3 overflow-hidden">
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
