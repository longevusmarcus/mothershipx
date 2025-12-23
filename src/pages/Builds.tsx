import { motion } from "framer-motion";
import { Plus, ExternalLink, Github, TrendingUp, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const myBuilds = [
  {
    id: "1",
    name: "OnboardFlow",
    problem: "SaaS Onboarding",
    status: "live",
    fitScore: 78,
    adoption: 245,
    revenue: "$1,240",
    rank: 4,
    url: "https://onboardflow.app",
    github: "alexchen/onboardflow",
  },
  {
    id: "2",
    name: "MeetSum AI",
    problem: "Meeting Transcription",
    status: "building",
    fitScore: 45,
    adoption: 0,
    revenue: "$0",
    rank: null,
    url: null,
    github: "alexchen/meetsum",
  },
  {
    id: "3",
    name: "InvoiceGen",
    problem: "Freelancer Legal Docs",
    status: "submitted",
    fitScore: 62,
    adoption: 34,
    revenue: "$0",
    rank: 12,
    url: "https://invoicegen.io",
    github: "alexchen/invoicegen",
  },
];

const Builds = () => {
  const navigate = useNavigate();

  return (
    <AppLayout title="My Builds">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-muted-foreground">Track your solutions and their performance</p>
          </div>
          <Button variant="glow" onClick={() => navigate("/submit")}>
            <Plus className="h-4 w-4 mr-2" />
            New Build
          </Button>
        </motion.div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Builds", value: "3" },
            { label: "Live Solutions", value: "2" },
            { label: "Total Revenue", value: "$1,240" },
            { label: "Avg Fit Score", value: "62%" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="elevated" className="p-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Builds List */}
        <div className="space-y-4">
          {myBuilds.map((build, index) => (
            <motion.div
              key={build.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="interactive">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Build Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{build.name}</h3>
                        <Badge
                          variant={
                            build.status === "live" ? "live" : build.status === "submitted" ? "glow" : "secondary"
                          }
                        >
                          {build.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Problem: {build.problem}</p>
                      <div className="flex items-center gap-4 pt-2">
                        {build.url && (
                          <a
                            href={build.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Live Demo
                          </a>
                        )}
                        <a
                          href={`https://github.com/${build.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Github className="h-3.5 w-3.5" />
                          {build.github}
                        </a>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Fit Score
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold">{build.fitScore}%</p>
                          <Progress
                            value={build.fitScore}
                            size="sm"
                            indicatorColor={build.fitScore > 70 ? "success" : "default"}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Adoption</p>
                        <p className="font-bold">{build.adoption}</p>
                        <p className="text-xs text-muted-foreground">users</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-bold text-success">{build.revenue}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Rank</p>
                        <p className="font-bold">{build.rank ? `#${build.rank}` : "-"}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 md:flex-none">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Builds;
