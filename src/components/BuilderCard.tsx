import { motion } from "framer-motion";
import { User, MessageSquare, Users, ExternalLink, Github, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Builder {
  id: string;
  name: string;
  avatar?: string;
  stage: "idea" | "building" | "launched" | "scaling";
  skills: string[];
  solutionName?: string;
  fitScore?: number;
  githubUrl?: string;
  productUrl?: string;
  isLookingForTeam?: boolean;
}

interface BuilderCardProps {
  builder: Builder;
  onRequestCollab?: (builderId: string) => void;
  delay?: number;
}

export function BuilderCard({ builder, onRequestCollab, delay = 0 }: BuilderCardProps) {
  const stageColors = {
    idea: "bg-muted text-muted-foreground",
    building: "bg-primary/20 text-primary",
    launched: "bg-success/20 text-success",
    scaling: "bg-warning/20 text-warning",
  };

  const stageLabels = {
    idea: "Ideating",
    building: "Building",
    launched: "Launched",
    scaling: "Scaling",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            {builder.avatar || builder.name[0]}
          </div>
          {builder.isLookingForTeam && (
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center">
              <Users className="h-3 w-3 text-success-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{builder.name}</h4>
            <Badge className={`text-[10px] ${stageColors[builder.stage]}`}>
              {stageLabels[builder.stage]}
            </Badge>
          </div>

          {builder.solutionName && (
            <p className="text-sm text-muted-foreground mt-0.5">{builder.solutionName}</p>
          )}

          {/* Skills */}
          <div className="flex flex-wrap gap-1 mt-2">
            {builder.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[10px] rounded-full bg-secondary text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {builder.skills.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{builder.skills.length - 3}
              </span>
            )}
          </div>

          {/* Fit Score */}
          {builder.fitScore !== undefined && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Fit Score
                </span>
                <span className="font-medium">{builder.fitScore}%</span>
              </div>
              <Progress 
                value={builder.fitScore} 
                size="sm" 
                indicatorColor={builder.fitScore >= 70 ? "success" : "default"} 
              />
            </div>
          )}

          {/* Links & Actions */}
          <div className="flex items-center gap-2 mt-3">
            {builder.githubUrl && (
              <a
                href={builder.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Github className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            )}
            {builder.productUrl && (
              <a
                href={builder.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            )}
            
            {builder.isLookingForTeam && onRequestCollab && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 text-xs"
                onClick={() => onRequestCollab(builder.id)}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Request Collab
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface BuildersListProps {
  builders: Builder[];
  onRequestCollab?: (builderId: string) => void;
}

export function BuildersList({ builders, onRequestCollab }: BuildersListProps) {
  return (
    <div className="space-y-3">
      {builders.map((builder, index) => (
        <BuilderCard
          key={builder.id}
          builder={builder}
          onRequestCollab={onRequestCollab}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}
