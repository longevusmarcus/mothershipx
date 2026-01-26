import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface MetricSparklineProps {
  currentValue: number;
  changePercent: number;
  color?: "success" | "destructive" | "primary";
  height?: number;
  dataPoints?: number;
}

/**
 * Generates realistic historical data points based on current value and change percentage.
 * Uses a smooth curve with some natural variation to create believable trends.
 */
function generateTrendData(currentValue: number, changePercent: number, points: number = 12) {
  // Calculate the starting value based on the change percentage
  const startValue = currentValue / (1 + changePercent / 100);
  
  // Generate data points with natural variation
  const data: { value: number; index: number }[] = [];
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    
    // Use an easing function for natural growth curve
    const easedProgress = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Base interpolated value
    const baseValue = startValue + (currentValue - startValue) * easedProgress;
    
    // Add subtle natural variation (±3% of current value)
    const variation = (Math.sin(i * 2.5) * 0.015 + Math.cos(i * 1.7) * 0.01) * currentValue;
    
    const value = Math.max(0, baseValue + variation);
    
    data.push({ value, index: i });
  }
  
  return data;
}

export function MetricSparkline({ 
  currentValue, 
  changePercent, 
  color = "success",
  height = 32,
  dataPoints = 12
}: MetricSparklineProps) {
  const data = useMemo(() => 
    generateTrendData(currentValue, changePercent, dataPoints),
    [currentValue, changePercent, dataPoints]
  );

  const colorMap = {
    success: {
      stroke: "hsl(var(--success))",
      fill: "hsl(var(--success) / 0.15)",
      gradient: ["hsl(var(--success) / 0.3)", "hsl(var(--success) / 0.02)"]
    },
    destructive: {
      stroke: "hsl(var(--destructive))",
      fill: "hsl(var(--destructive) / 0.15)",
      gradient: ["hsl(var(--destructive) / 0.3)", "hsl(var(--destructive) / 0.02)"]
    },
    primary: {
      stroke: "hsl(var(--primary))",
      fill: "hsl(var(--primary) / 0.15)",
      gradient: ["hsl(var(--primary) / 0.3)", "hsl(var(--primary) / 0.02)"]
    }
  };

  const colors = colorMap[color];
  const gradientId = `sparkline-gradient-${color}-${currentValue}`;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.gradient[0]} />
              <stop offset="100%" stopColor={colors.gradient[1]} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.stroke}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
