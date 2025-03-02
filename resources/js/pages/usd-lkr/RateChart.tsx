import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface TimeSeriesDataPoint {
  date: string;
  value: number | string | null;
}

interface TimeSeriesData {
  key: string;
  name: string;
  data: TimeSeriesDataPoint[];
}

interface RateChartProps {
  data: TimeSeriesData[];
  title: string;
  description?: string;
  className?: string;
  height?: number;
}

const RateChart: React.FC<RateChartProps> = ({
  data = [],
  title,
  description = "Daily exchange rates",
  className,
  height = 300
}) => {
  // Ensure data is in the correct format
  const validData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      console.warn('RateChart received invalid data format:', data);
      return [];
    }
    return data.filter(series => series && typeof series === 'object');
  }, [data]);
  // Transform the data for the chart
  const chartData = useMemo(() => {
    if (!validData || validData.length === 0) return [];

    // Create a map of dates to values
    const dateMap = new Map();
    
    // Process each series
    validData.forEach(series => {
      // Check if series.data exists and is iterable
      if (!series.data || !Array.isArray(series.data)) {
        console.warn(`Data for series ${series.key} is not an array:`, series.data);
        return; // Skip this series
      }
      
      series.data.forEach(point => {
        if (!point || !point.date) return;
        
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: point.date });
        }
        
        // Convert value to number safely
        const numericValue = typeof point.value === 'string' 
          ? parseFloat(point.value) 
          : (typeof point.value === 'number' ? point.value : null);
        
        dateMap.get(point.date)[series.key] = numericValue;
      });
    });
    
    // Convert the map to an array and sort by date
    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Get the latest values for the stats display
  const latestValues = useMemo(() => {
    const result = {};
    validData.forEach(series => {
      // Check if series.data exists and is iterable
      if (!series.data || !Array.isArray(series.data) || series.data.length === 0) {
        console.warn(`No valid data for series ${series.key}`);
        result[series.key] = {
          name: series.name,
          value: null
        };
        return;
      }
      
      try {
        const sortedData = [...series.data].filter(item => item && item.date).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        if (sortedData.length > 0) {
          result[series.key] = {
            name: series.name,
            value: sortedData[0].value
          };
        } else {
          result[series.key] = {
            name: series.name,
            value: null
          };
        }
      } catch (error) {
        console.error(`Error processing series ${series.key}:`, error);
        result[series.key] = {
          name: series.name,
          value: null
        };
      }
    });
    return result;
  }, [data]);

  // Generate colors for each series
  const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)'
  ];

  // Format the date for the X-axis
  const formatXAxis = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'dd MMM');
    } catch (e) {
      return dateStr;
    }
  };

  // Calculate Y-axis domain with some padding
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 10];
    
    let min = Infinity;
    let max = -Infinity;
    
    chartData.forEach(point => {
      validData.forEach(series => {
        const val = point[series.key];
        if (val !== undefined && val !== null && !isNaN(val)) {
          min = Math.min(min, val);
          max = Math.max(max, val);
        }
      });
    });
    
    // Add 5% padding above and below
    const padding = (max - min) * 0.05;
    return [Math.max(0, min - padding), max + padding];
  }, [chartData, data]);

  // Format values safely
  const formatValue = (value) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') return value.toFixed(2);
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toFixed(2);
    }
    return String(value);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border rounded shadow-lg text-sm text-card-foreground">
          <p className="font-semibold mb-1">{formatXAxis(label)}</p>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center">
              <div
                className="w-2 h-2 mr-1 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="mr-1">{entry.name}:</span>
              <span className="font-medium text-primary">
                {formatValue(entry.value)}
              </span>
            </div>
          ))}
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
            <CardDescription className="text-sm">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tick={{ fill: 'var(--muted-foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                domain={yAxisDomain}
                tickFormatter={(value) => formatValue(value)}
                tick={{ fill: 'var(--muted-foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={{ stroke: 'var(--border)' }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }}
              />
        
                <Area
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, stroke: 'var(--background)', strokeWidth: 1 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-4">
            {data.filter(series => series && series.key).map((series, index) => (
              <div key={series.key} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {series.name || 'Unknown'}
                  </p>
                  <p className="text-lg font-bold">
                    {latestValues[series.key] 
                      ? formatValue(latestValues[series.key].value) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RateChart;