import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface YieldCurvePoint {
  tenor: string;
  rate: number;
}

interface YieldCurveAnalysisProps {
  data: YieldCurvePoint[];
  title?: string;
  className?: string;
}

const YieldCurveAnalysis: React.FC<YieldCurveAnalysisProps> = ({ 
  data,
  title = "Treasury Yield Curve Analysis",
  className
}) => {
  // Sort the data by tenor for proper curve display
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // Convert tenor to months for proper sorting
      const getMonths = (tenor: string) => {
        if (tenor.endsWith('M')) {
          return parseInt(tenor.slice(0, -1));
        } else if (tenor.endsWith('Y')) {
          return parseInt(tenor.slice(0, -1)) * 12;
        }
        return 0;
      };
      
      return getMonths(a.tenor) - getMonths(b.tenor);
    });
  }, [data]);

  // Calculate spread between shortest and longest tenors
  const shortTermRate = sortedData[0]?.rate || 0;
  const longTermRate = sortedData[sortedData.length - 1]?.rate || 0;
  const yieldSpread = (longTermRate - shortTermRate).toFixed(2);

  // Calculate if the yield curve is normal, flat, or inverted
  const curveStatus = useMemo(() => {
    if (sortedData.length < 2) return { status: 'Insufficient data', color: 'bg-gray-500' };
    
    if (longTermRate - shortTermRate > 0.5) {
      return { status: 'Normal', color: 'bg-green-500' };
    } else if (Math.abs(longTermRate - shortTermRate) <= 0.5) {
      return { status: 'Flat', color: 'bg-yellow-500' };
    } else {
      return { status: 'Inverted', color: 'bg-red-500' };
    }
  }, [sortedData, shortTermRate, longTermRate]);

  // Find the minimum and maximum values to set the y-axis domain
  const minRate = Math.min(...sortedData.map(item => item.rate));
  const maxRate = Math.max(...sortedData.map(item => item.rate));
  const yAxisDomain = [Math.max(0, minRate - 0.5), maxRate + 0.5];

  // Get the average rate for a reference line
  const averageRate = useMemo(() => {
    const sum = sortedData.reduce((acc, item) => acc + item.rate, 0);
    return sum / sortedData.length;
  }, [sortedData]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border rounded shadow-lg text-sm text-card-foreground">
          <p className="font-semibold mb-1">{`Tenor: ${label}`}</p>
          <p className="text-primary font-medium">{`Yield: ${payload[0].value.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("shadow-md border-border", className)}>
      <CardHeader className="pb-2 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription className="mt-1 text-sm">
              Current spread: <span className="font-medium">{yieldSpread}%</span>
            </CardDescription>
          </div>
          <Badge className={`${curveStatus.color} text-white px-2 py-1`}>
            {curveStatus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sortedData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="var(--border)" />
              <XAxis 
                dataKey="tenor" 
                tick={{ fill: 'var(--muted-foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={{ stroke: 'var(--border)' }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                domain={yAxisDomain}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                tick={{ fill: 'var(--muted-foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={{ stroke: 'var(--border)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={averageRate} 
                stroke="var(--muted-foreground)" 
                strokeDasharray="3 3" 
                label={{ 
                  value: `Avg: ${averageRate.toFixed(2)}%`, 
                  position: 'right',
                  fill: 'var(--muted-foreground)',
                  fontSize: 12
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="var(--chart-1)" 
                strokeWidth={3}
                dot={{ 
                  r: 4, 
                  fill: 'var(--chart-1)', 
                  strokeWidth: 1,
                  stroke: 'var(--chart-2)'
                }}
                activeDot={{ 
                  r: 6, 
                  fill: 'var(--chart-2)',
                  stroke: 'var(--background)',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="font-medium">Normal:</span>
              <span className="ml-1">Long-term rates higher (economic expansion)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="font-medium">Flat:</span>
              <span className="ml-1">Similar rates across maturities</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="font-medium">Inverted:</span>
              <span className="ml-1">Short-term rates higher (recession signal)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default YieldCurveAnalysis;