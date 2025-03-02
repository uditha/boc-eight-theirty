import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatValue } from '@/utils/formatting';
import { LucideIcon, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, ReferenceLine } from 'recharts';

interface HistoricalDataPoint {
  date: string;
  value: number | string;
  rate?: number;
}

interface StatCardWithRateProps {
  title: string;
  data: HistoricalDataPoint[];
  type?: 'number' | 'percentage';
  decimalPlaces?: number;
  currency?: 'LKR' | 'USD';
  change?: '1D' | '1W' | '1M' | '1Y';
  icon?: LucideIcon;
  unit?: string;
  className?: string;
  rateDecimalPlaces?: number;
  rateUnit?: string;
  showSparkline?: boolean;
  inMillions?: boolean; // New prop to indicate if values are in millions
}

function StatCardWithRate({
  title,
  data,
  type,
  decimalPlaces = 1,
  currency,
  change = '1D',
  icon: Icon,
  unit,
  className,
  rateDecimalPlaces = 2,
  rateUnit = '/hr',
  showSparkline = true,
  inMillions = true, // Default to true since numbers are always in millions
}: StatCardWithRateProps) {

  // Format number in millions for display
  const formatInMillions = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (inMillions) {
      // If already in millions, just format it
      return numValue.toFixed(decimalPlaces);
    } else {
      // If not already in millions, convert and format
      return (numValue / 1000000).toFixed(decimalPlaces);
    }
  };

  const getLatestValue = (): number | string => {
    if (!data || data.length === 0) return 0;
    const sortedData = [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortedData[sortedData.length - 1].value;
  };

  // Get the latest rate from sorted data
  const getLatestRate = (): number => {
    if (!data || data.length === 0) return 0;
    const sortedData = [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const latestDataPoint = sortedData[sortedData.length - 1];
    
    // If rate is directly provided, use it
    if (latestDataPoint.rate !== undefined) {
      return Number(latestDataPoint.rate);
    }
    
    // Otherwise calculate rate based on the last two data points
    if (sortedData.length >= 2) {
      const current = Number(sortedData[sortedData.length - 1].value);
      const previous = Number(sortedData[sortedData.length - 2].value);
      const currentDate = new Date(sortedData[sortedData.length - 1].date).getTime();
      const previousDate = new Date(sortedData[sortedData.length - 2].date).getTime();
      
      // Convert milliseconds to hours
      const hoursDiff = (currentDate - previousDate) / (1000 * 60 * 60);
      
      if (hoursDiff > 0) {
        return (current - previous) / hoursDiff;
      }
    }
    
    return 0;
  };

  // Find the closest date value in the dataset
  const findClosestDateValue = (data: HistoricalDataPoint[], targetDate: Date): number => {
    if (data.length === 1) return Number(data[0].value);
    
    let closestDataPoint = data[0];
    let smallestDiff = Math.abs(new Date(data[0].date).getTime() - targetDate.getTime());
    
    for (let i = 1; i < data.length; i++) {
      const currentDiff = Math.abs(new Date(data[i].date).getTime() - targetDate.getTime());
      if (currentDiff < smallestDiff) {
        smallestDiff = currentDiff;
        closestDataPoint = data[i];
      }
    }
    
    return Number(closestDataPoint.value);
  };

  // Calculate change between latest value and a previous period
  const calculateChange = (): { value: number; percentage: number } => {
    if (!data || data.length < 2) return { value: 0, percentage: 0 };
    
    const sortedData = [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const latestValue = Number(sortedData[sortedData.length - 1].value);
    let comparisonValue: number;
    const latestDate = new Date(sortedData[sortedData.length - 1].date);
    
    switch (change) {
      case '1D':
        { 
          const oneDayAgo = new Date(latestDate);
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          comparisonValue = findClosestDateValue(sortedData, oneDayAgo);
          break; 
        }
      case '1W':
        { 
          const oneWeekAgo = new Date(latestDate);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          comparisonValue = findClosestDateValue(sortedData, oneWeekAgo);
          break; 
        }
      case '1M':
        { 
          const oneMonthAgo = new Date(latestDate);
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          comparisonValue = findClosestDateValue(sortedData, oneMonthAgo);
          break; 
        }
      case '1Y':
        { 
          const oneYearAgo = new Date(latestDate);
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          comparisonValue = findClosestDateValue(sortedData, oneYearAgo);
          break; 
        }
      default:
        comparisonValue = Number(sortedData[sortedData.length - 2].value);
    }
    
    const changeValue = latestValue - comparisonValue;
    const changePercentage = comparisonValue !== 0 
      ? (changeValue / comparisonValue) * 100 
      : 0;
    
    return { value: changeValue, percentage: changePercentage };
  };

  // Prepare data for sparkline chart
  const prepareChartData = () => {
    if (!data || data.length === 0) return [];
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Convert to format expected by recharts
    return sortedData.map(item => ({
      date: item.date,
      value: Number(item.value),
      rate: item.rate !== undefined ? Number(item.rate) : undefined
    }));
  };

  const latestValue = getLatestValue();
  const latestRate = getLatestRate();

  // Use our custom millions formatter instead of the general formatValue
  const formattedValue = formatInMillions(latestValue);
  
  // For rate, we still use formatValue
  const formattedRate = formatValue(latestRate, {
    type: 'number',
    decimalPlaces: rateDecimalPlaces,
  });
  
  const changeData = calculateChange();
  const isPositive = changeData.value >= 0;
  const isRatePositive = latestRate >= 0;
  
  const formattedChangePercentage = formatValue(Math.abs(changeData.percentage), {
    type: 'percentage',
    decimalPlaces: 1,
  });

  // Period mapping for readable text
  const periodMap = {
    '1D': 'day',
    '1W': 'week',
    '1M': 'month',
    '1Y': 'year'
  };

  const chartData = prepareChartData();
  
  return (
    <Card className={cn(
      "overflow-hidden transition-colors hover:bg-accent/5 gap-4", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <div className="flex items-center">
          <h3 className="text-md font-medium text-muted-foreground">
            {title}
          </h3>
          <div className="flex items-center ml-2">
            <span className="text-xs font-medium border rounded px-1 text-muted-foreground">
              {change}
            </span>
          </div>
        </div>
        {Icon ? (
          <Icon className="h-4 w-4 text-muted-foreground" />
        ) : (
          isPositive ? 
            <TrendingUp className="h-4 w-4 text-green-500" /> : 
            <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent className="pt-1">
        <div className="flex flex-col space-y-2">
          {/* Main Value and Rate on same line */}
          <div className="flex items-center space-x-2">
            <div className="flex items-baseline">
              {currency && (
                <span className="text-base font-medium text-muted-foreground mr-1">
                  {currency === 'LKR' ? 'Rs.' : '$'}
                </span>
              )}
              <span className="text-2xl font-semibold">
                {formattedValue}
              </span>
              {unit ? (
                <span className="text-sm font-medium text-muted-foreground ml-1">
                  {unit}
                </span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground ml-1">
                  M
                </span>
              )}
            </div>
            
            <span className="text-sm font-medium text-muted-foreground">at</span>
            
            <div className="flex items-center bg-accent/20 rounded px-2 py-1">
              <span className={cn(
                "text-base font-semibold",
                isRatePositive ? "text-green-500" : "text-red-500"
              )}>
                {formattedRate}
              </span>
              <span className="text-sm ml-1 font-medium text-muted-foreground">
                {rateUnit}
              </span>
            </div>
          </div>
          
          {/* Change indicator with percentage */}
          <div className="flex items-center">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? "+" : "-"}{formattedChangePercentage}
            </span>
            <span className="text-sm pl-1 font-medium text-muted-foreground">
              from last {periodMap[change] || 'period'}
            </span>
          </div>
          
          {/* Sparkline area chart */}
          {showSparkline && chartData.length > 1 && (
            <div className="h-16 w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <ReferenceLine y={0} stroke="rgba(156, 163, 175, 0.5)" strokeDasharray="3 3" />
                  <Area 
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    fill={isPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCardWithRate;