import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Target, TrendingUp, Tags, FileText, BarChart3, Layers, Lock, Sparkles, Users, Database, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/WaitlistForm";

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
  isAdmin?: boolean;
}

export function AITransformPanel({ selectedSources, isAdmin = false }: AITransformPanelProps) {
  const hasSelection = selectedSources.length > 0;
  const isLocked = !isAdmin;

  return (
    <Card variant="elevated" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />
      
      {/* Lock Overlay for non-admins */}
      {isLocked && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 max-w-sm"
          >
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Founding Members Only</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect <span className="text-foreground font-medium">10+ data sources</span> to discover real problems and trends.
                Then <span className="text-foreground font-medium">build solutions together</span> with our community of builders.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Database className="h-3 w-3" />
                10+ Sources
              </Badge>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                AI Analysis
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                Co-Build
              </Badge>
            </div>
            <WaitlistForm feature="general" buttonText="Join Waitlist" />
          </motion.div>
        </div>
      )}
      
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Transform with AI
                {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Extract insights from your selected sources
              </p>
            </div>
          </div>
          <Badge variant={hasSelection && !isLocked ? "glow" : "secondary"}>
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
          variant={hasSelection && !isLocked ? "glow" : "secondary"} 
          className="w-full"
          disabled={!hasSelection || isLocked}
        >
          {isLocked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Founders Only
            </>
          ) : hasSelection ? (
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
