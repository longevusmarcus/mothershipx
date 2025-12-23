import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Target, TrendingUp, Tags, FileText, BarChart3, Layers, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AICapability {
  id: string;
  name: string;
  description: string;
  Icon: LucideIcon;
}

const capabilities: AICapability[] = [
  { id: "sentiment", name: "Sentiment Analysis", description: "Detect positive, negative, and neutral sentiment", Icon: MessageSquare },
  { id: "painpoints", name: "Pain Point Detection", description: "Identify user frustrations and needs", Icon: Target },
  { id: "trends", name: "Trend Momentum", description: "Track velocity and direction of topics", Icon: TrendingUp },
  { id: "classify", name: "Classification", description: "Categorize content automatically", Icon: Tags },
  { id: "summarize", name: "Summarization", description: "Condense long content into key points", Icon: FileText },
  { id: "score", name: "Scoring", description: "Rate opportunities by market signal", Icon: BarChart3 },
];

interface AITransformPanelProps {
  selectedSources: string[];
}

export function AITransformPanel({ selectedSources }: AITransformPanelProps) {
  const hasSelection = selectedSources.length > 0;

  return (
    <Card variant="elevated" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />
      
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Transform with AI</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Extract insights from your selected sources
              </p>
            </div>
          </div>
          <Badge variant={hasSelection ? "glow" : "secondary"}>
            {hasSelection ? `${selectedSources.length} sources` : "No sources"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-1">
                <cap.Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium group-hover:text-primary transition-colors">
                  {cap.name}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {cap.description}
              </p>
            </motion.div>
          ))}
        </div>

        <Button 
          variant={hasSelection ? "glow" : "secondary"} 
          className="w-full"
          disabled={!hasSelection}
        >
          {hasSelection ? (
            <>
              Analyze Sources
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            "Select sources to analyze"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
