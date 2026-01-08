import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  delay?: number;
  comingSoon?: boolean;
}

export function StatCard({ icon: Icon, label, value, suffix, delay = 0, comingSoon = false }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card variant="elevated" className="p-4 relative overflow-hidden">
        {comingSoon && (
          <div className="absolute top-2 right-2 z-20">
            <Badge variant="secondary" className="text-[8px] px-1.5 py-0 bg-muted/80 backdrop-blur-sm">
              Soon
            </Badge>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={`text-2xl font-bold tracking-tight ${comingSoon ? 'opacity-40 blur-[1px]' : ''}`}>
              {value}
              {suffix && <span className="text-sm font-medium text-muted-foreground ml-1">{suffix}</span>}
            </p>
            <p className={`text-xs text-muted-foreground ${comingSoon ? 'opacity-60' : ''}`}>{label}</p>
          </div>
          <div className={`h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center ${comingSoon ? 'opacity-40' : ''}`}>
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
