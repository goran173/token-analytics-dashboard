'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

interface HolderData {
  address: string;
  balance: string;
  percentage: string;
  rawBalance: bigint;
}

interface HolderDistributionChartProps {
  data: HolderData[];
  isLoading?: boolean;
  highlightAddress?: string;
}

export function HolderDistributionChart({ data, isLoading, highlightAddress }: HolderDistributionChartProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleBarClick = (entry: HolderData) => {
    navigator.clipboard.writeText(entry.address);
    setCopied(entry.address);
    setTimeout(() => setCopied(null), 2000);
  };

  const truncatedData = data.map(h => ({
    ...h,
    shortAddress: `${h.address.slice(0, 6)}...${h.address.slice(-4)}`,
    percentageNum: parseFloat(h.percentage),
    isUser: highlightAddress && h.address.toLowerCase() === highlightAddress.toLowerCase(),
  }));

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

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holder Distribution</CardTitle>
          <CardDescription>Top active addresses in recent blocks</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex flex-col items-center justify-center text-center">
          <Info className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Not enough transfer activity to compute holders.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holder Distribution</CardTitle>
        <CardDescription>Top addresses by net flow in the block window. Click to copy.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={truncatedData}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload[0]) {
                handleBarClick(e.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
            <XAxis 
              type="number" 
              unit="%" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
            />
            <YAxis 
              dataKey="shortAddress" 
              type="category" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10}
              width={80}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as any;
                  return (
                    <div className="bg-popover border rounded-lg p-2 shadow-md text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono">{item.address}</p>
                        {item.isUser && <span className="text-[10px] bg-green-500/20 text-green-600 px-1 rounded font-bold">YOU</span>}
                      </div>
                      <p className="text-muted-foreground">Balance: <span className="text-foreground font-bold">{item.balance}</span></p>
                      <p className="text-muted-foreground">Percentage: <span className="text-foreground font-bold">{item.percentage}%</span></p>
                      {copied === item.address && <p className="text-green-500 mt-1">Copied!</p>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentageNum" radius={[0, 4, 4, 0]} className="cursor-pointer">
              {truncatedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isUser ? 'hsl(142.1 76.2% 36.3%)' : (index === 0 ? 'hsl(var(--primary))' : `hsl(var(--primary) / ${Math.max(0.3, 1 - index * 0.1)})`)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
