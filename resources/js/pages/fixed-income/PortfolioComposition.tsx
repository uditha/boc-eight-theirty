import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

interface CompositionDataPoint {
  name: string;
  value: number;
}

interface PortfolioCompositionProps {
  data: TimeSeriesDataPoint[];
  compositionData: CompositionDataPoint[];
  className?: string;
}

const PortfolioComposition: React.FC<PortfolioCompositionProps> = ({ 
  data, 
  compositionData,
  className 
}) => {
  

  const latestValue = useMemo(() => {
    const total = compositionData.reduce((sum, item) => sum + item.value, 0);
    return total;
  }, [compositionData]);

  const totalValue = latestValue;

  // Generate colors for the pie chart using theme variables
  const COLORS = [
    'var(--chart-2)',
    'var(--chart-4)',
    'var(--chart-1)',
    'var(--chart-3)',
    'var(--chart-5)'
  ];
  

  // Format the data with colors and percentages
  const formattedData = useMemo(() => {
    return compositionData.map((item, index) => ({
      ...item,
      percentage: ((item.value / (totalValue || 1)) * 100).toFixed(1),
      color: COLORS[index % COLORS.length]
    }));
  }, [compositionData, totalValue, COLORS]);

  // Find the largest allocation
  const largestAllocation = useMemo(() => {
    if (formattedData.length === 0) return null;
    return [...formattedData].sort((a, b) => b.value - a.value)[0];
  }, [formattedData]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 border border-border rounded shadow-lg text-sm text-card-foreground">
          <p className="font-semibold mb-1">{data.name}</p>
          <p className="text-primary">{`Value: ${data.value.toFixed(2)} Mn LKR`}</p>
          <p className="text-muted-foreground">{`Percentage: ${data.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend renderer
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="flex items-center">
            <div className="w-2 h-2 mr-1 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{`${entry.value}: ${entry.payload.percentage}%`}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Custom label renderer for pie slices
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percentage }) => {
    // Only show label if percentage is significant enough (e.g., > 5%)
    if (parseFloat(percentage) < 5) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="var(--card-foreground)" 
        textAnchor="start" 
        dominantBaseline="central"
        fontSize={16}
        fontWeight="500"
        
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <Card className={cn("shadow-md border-border", className)}>
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-xl font-semibold">Portfolio Composition</CardTitle>
        <CardDescription className="text-sm">
          Current allocation by security type
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {formattedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="var(--background)"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 border-t border-border pt-3 flex justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
            <p className="text-lg font-bold" data-testid="total-portfolio-value">
              {(() => {
                return totalValue.toFixed(2);
              })()} Mn LKR
            </p>
          </div>
          {largestAllocation && (
            <div className="text-right space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Largest Allocation</p>
              <div className="flex items-center justify-end">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: largestAllocation.color }}
                ></div>
                <p className="text-lg font-bold">
                  {largestAllocation.name} 
                  <span className="text-sm font-normal ml-1 text-muted-foreground">
                    ({largestAllocation.percentage}%)
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioComposition;