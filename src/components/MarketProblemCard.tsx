import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendBadge } from "@/components/TrendBadge";
import { SocialProofStats } from "@/components/SocialProofStats";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import type { MarketProblem } from "@/data/marketIntelligence";

interface MarketProblemCardProps {
  problem: MarketProblem;
  delay?: number;
}

export function MarketProblemCard({ problem, delay = 0 }: MarketProblemCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const handleCardClick = () => {
    if (isAuthenticated) {
      // Already signed in - go directly to problem page
      navigate(`/problems/${problem.id}`);
    } else {
      // Not signed in - show auth modal
      setAuthOpen(true);
    }
  };

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
        onClick={handleCardClick}
      >

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

        {/* Auth Modal */}
        <AuthModal
          open={authOpen}
          onOpenChange={setAuthOpen}
          onSuccess={() => navigate(`/problems/${problem.id}`)}
        />
      </Card>
    </motion.div>
  );
}
