import { motion } from "framer-motion";
import { Search, Filter, TrendingUp, Zap } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ProblemCard } from "@/components/ProblemCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = ["All", "Productivity", "UX/UI", "SMB Tools", "Developer Tools", "AI/ML"];

const mockProblems = [
  {
    id: "1",
    title: "Users struggle with complex onboarding flows in SaaS apps",
    category: "UX/UI",
    sentiment: "high" as const,
    slotsTotal: 20,
    slotsFilled: 17,
    momentum: 24,
  },
  {
    id: "2",
    title: "No affordable way to transcribe and summarize meetings",
    category: "Productivity",
    sentiment: "high" as const,
    slotsTotal: 15,
    slotsFilled: 8,
    momentum: 45,
  },
  {
    id: "3",
    title: "Small businesses lack simple inventory tracking tools",
    category: "SMB Tools",
    sentiment: "medium" as const,
    slotsTotal: 25,
    slotsFilled: 25,
    momentum: 12,
    isLocked: true,
  },
  {
    id: "4",
    title: "Developers need better local environment debugging tools",
    category: "Developer Tools",
    sentiment: "high" as const,
    slotsTotal: 30,
    slotsFilled: 12,
    momentum: 67,
  },
  {
    id: "5",
    title: "No simple way to generate legal documents for freelancers",
    category: "Productivity",
    sentiment: "medium" as const,
    slotsTotal: 20,
    slotsFilled: 19,
    momentum: 33,
  },
  {
    id: "6",
    title: "AI image generators lack consistent character control",
    category: "AI/ML",
    sentiment: "high" as const,
    slotsTotal: 10,
    slotsFilled: 10,
    momentum: 89,
    isLocked: true,
  },
];

const Problems = () => {
  return (
    <AppLayout title="Problem Discovery">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search validated problems..."
                className="pl-9 bg-secondary border-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Sort by Momentum
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, index) => (
              <Badge
                key={cat}
                variant={index === 0 ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
              >
                {cat}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Live Problems</p>
              <p className="text-sm text-muted-foreground">Real-time validated pain points</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold">156</p>
              <p className="text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">24</p>
              <p className="text-muted-foreground">New Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">18</p>
              <p className="text-muted-foreground">Almost Full</p>
            </div>
          </div>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProblems.map((problem, index) => (
            <ProblemCard
              key={problem.id}
              {...problem}
              delay={0.05 * index}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Problems;
