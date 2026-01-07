import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Clock, ArrowRight, Flame, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendBadge } from "@/components/TrendBadge";
import { SocialProofStats } from "@/components/SocialProofStats";
import { OpportunityMeter } from "@/components/OpportunityMeter";
import type { MarketProblem } from "@/data/marketIntelligence";

interface MarketProblemCardProps {
  problem: MarketProblem;
  delay?: number;
}

export function MarketProblemCard({ problem, delay = 0 }: MarketProblemCardProps) {
  const navigate = useNavigate();
  const slotsRemaining = problem.slotsTotal - problem.slotsFilled;
  const fillPercentage = (problem.slotsFilled / problem.slotsTotal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
    >
      <Card
        variant="interactive"
        className="relative overflow-hidden cursor-pointer group"
        onClick={() => navigate(`/problems/${problem.id}`)}
      >
        {/* Viral Indicator */}
        {problem.isViral && (
          <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
            <div className="absolute top-4 right-[-32px] w-32 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold py-1 text-center transform rotate-45">
              🔥 VIRAL
            </div>
          </div>
        )}

        <CardHeader className="pb-2 space-y-3">
          {/* Top Row: Category + Trend Badge */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-[10px] font-medium">
              {problem.category}
            </Badge>
            <TrendBadge sentiment={problem.sentiment} size="sm" animated={problem.isViral} />
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {problem.title}
          </h3>
          
          {/* Subtitle */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {problem.subtitle}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Social Proof Row */}
          <SocialProofStats
            views={problem.views}
            saves={problem.saves}
            shares={problem.shares}
            trendingRank={problem.trendingRank}
            size="sm"
          />

          {/* Opportunity Score + Market Size */}
          <div className="flex items-center justify-between">
            <OpportunityMeter
              score={problem.opportunityScore}
              marketSize={problem.marketSize}
              demandVelocity={problem.demandVelocity}
              competitionGap={problem.competitionGap}
              size="compact"
            />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-warning" />
              <span>+{problem.demandVelocity}%</span>
            </div>
          </div>

          {/* Builder Capacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                Builders
              </span>
              <span className="font-medium">
                {problem.slotsFilled}/{problem.slotsTotal}
                {slotsRemaining <= 5 && (
                  <span className="text-warning ml-1">• {slotsRemaining} left</span>
                )}
              </span>
            </div>
            <Progress 
              value={fillPercentage} 
              size="sm" 
              indicatorColor={fillPercentage > 80 ? "warning" : "default"} 
            />
          </div>

          {/* Active Builders */}
          {problem.activeBuildersLast24h > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground">
                {problem.activeBuildersLast24h} active in last 24h
              </span>
            </div>
          )}

          {/* CTA */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between mt-1 group-hover:bg-primary/10"
          >
            <span>Explore Opportunity</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
