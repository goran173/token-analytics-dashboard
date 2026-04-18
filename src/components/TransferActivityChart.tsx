'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUnits } from 'viem';

interface TransferActivityChartProps {
  transfers: any[];
  decimals: number;
  isLoading?: boolean;
}

export function TransferActivityChart({ transfers, decimals, isLoading }: TransferActivityChartProps) {
  const chartData = React.useMemo(() => {
    if (!transfers.length) return [];
    
    const bins: Record<string, { hour: string, count: number, volume: bigint, timestamp: number }> = {};
    const now = new Date();
    
    // Initialize last 24 hours
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      d.setMinutes(0, 0, 0);
      const label = d.getHours().toString().padStart(2, '0') + ':00';
      const key = d.toISOString().split(':')[0]; // YYYY-MM-DDTHH
      bins[key] = { hour: label, count: 0, volume: 0n, timestamp: d.getTime() };
    }

    transfers.forEach(tx => {
      const d = new Date(tx.timestamp * 1000);
      d.setMinutes(0, 0, 0);
      const key = d.toISOString().split(':')[0];
      if (bins[key]) {
        bins[key].count++;
        bins[key].volume += tx.value;
      }
    });

    const sortedData = Object.values(bins).sort((a, b) => a.timestamp - b.timestamp);
    
    let cumulative = 0n;
    return sortedData.map(bin => {
      cumulative += bin.volume;
      return {
        ...bin,
        cumulativeVolume: Number(formatUnits(cumulative, decimals)),
        volumeFormatted: formatUnits(bin.volume, decimals),
      };
    });
  }, [transfers, decimals]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Activity</CardTitle>
        <CardDescription>Frequency and cumulative volume in the last 24h.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="hour" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10}
              interval={4}
            />
            <YAxis 
              yAxisId="left"
              stroke="hsl(var(--primary))" 
              fontSize={10}
              tickFormatter={(val) => Math.floor(val).toString()}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10}
              hide={chartData.length === 0}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border rounded-lg p-2 shadow-md text-xs">
                      <p className="font-bold mb-1">{label}</p>
                      <p className="text-primary">Transfers: <span className="font-bold">{payload[0].value}</span></p>
                      <p className="text-muted-foreground">Vol (Hour): <span className="text-foreground">{payload[0].payload.volumeFormatted}</span></p>
                      <p className="text-muted-foreground">Cumulative: <span className="text-foreground font-bold">{payload[1]?.value}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorCount)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulativeVolume"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
