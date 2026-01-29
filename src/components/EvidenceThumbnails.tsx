import { useMemo } from "react";
import { Play } from "lucide-react";
import { useProblemEvidence } from "@/hooks/useProblemEvidence";

interface EvidenceThumbnailsProps {
  problemId: string;
  maxThumbnails?: number;
}

export function EvidenceThumbnails({ problemId, maxThumbnails = 4 }: EvidenceThumbnailsProps) {
  const { data, isLoading } = useProblemEvidence(problemId);

  const thumbnails = useMemo(() => {
    if (!data?.videos) return [];
    return data.videos
      .filter((v) => v.video_thumbnail)
      .slice(0, maxThumbnails);
  }, [data?.videos, maxThumbnails]);

  if (isLoading) {
    return (
      <div className="flex gap-1.5 mt-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-10 h-14 rounded bg-muted animate-pulse"
          />
        ))}
      </div>
    );
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
          />
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-3 w-3 text-white fill-white" />
          </div>
        </div>
      ))}
      {/* Show count if more videos exist */}
      {data?.videos && data.videos.length > maxThumbnails && (
        <div className="w-10 h-14 flex-shrink-0 rounded bg-muted/50 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground font-medium">
            +{data.videos.length - maxThumbnails}
          </span>
        </div>
      )}
    </div>
  );
}
