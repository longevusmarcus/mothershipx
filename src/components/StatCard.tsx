import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  delay?: number;
}

export function StatCard({ icon: Icon, label, value, suffix, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card variant="elevated" className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">
              {value}
              {suffix && <span className="text-sm font-medium text-muted-foreground ml-1">{suffix}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
