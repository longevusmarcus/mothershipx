import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityChartProps {
  data: { day: string; value: number }[];
  title?: string;
}

export function ActivityChart({ data, title = "Weekly Activity" }: ActivityChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card variant="elevated">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-xs text-success">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-32">
          {data.map((item, index) => {
            const height = (item.value / maxValue) * 100;
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full bg-gradient-primary rounded-t-sm min-h-[4px]"
                />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
