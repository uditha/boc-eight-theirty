import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatValue } from '@/utils/formatting';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DataPoint {
  date: string;
  value: number | string;
}

interface StatCardProps {
  title: string;
  data: DataPoint[];
  type?: 'number' | 'percentage';
  decimalPlaces?: number;
  currency?: 'LKR' | 'USD';
  unit?: string;
  className?: string;
  showSparkline?: boolean;
}

function StatCard({
  title,
  data,
  type,
  decimalPlaces = 1,
  currency,
  unit,
  className,
  showSparkline = true,
}: StatCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'YTD' | '1M' | '1W'>('YTD');

  const getLatestValue = (): number | string => {
    if (!data || data.length === 0) return 0;
    const sortedData = [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortedData[sortedData.length - 1].value;
  };

  const findClosestDateValue = (data: DataPoint[], targetDate: Date): number => {
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

  const calculateChange = (): { value: number; percentage: number } => {
    if (!data || data.length < 2) return { value: 0, percentage: 0 };
    
    const sortedData = [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const latestValue = Number(sortedData[sortedData.length - 1].value);
    let comparisonValue: number;
    const latestDate = new Date(sortedData[sortedData.length - 1].date);
    
    switch (selectedPeriod) {
      case 'YTD':
        { 
          const yearStart = new Date(latestDate.getFullYear(), 0, 1);
          comparisonValue = findClosestDateValue(sortedData, yearStart);
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
      default:
        comparisonValue = Number(sortedData[sortedData.length - 2].value);
    }
    
    const changeValue = latestValue - comparisonValue;
    const changePercentage = comparisonValue !== 0 
      ? (changeValue / comparisonValue) * 100 
      : 0;
    
    return { value: changeValue, percentage: changePercentage };
  };

  const prepareChartData = () => {
    if (!data || data.length === 0) return [];
    
    const sortedData = [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const now = new Date(sortedData[sortedData.length - 1].date);
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case '1M':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '1W':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filteredData = sortedData.filter(
      item => new Date(item.date) >= startDate
    );
    
    return filteredData.map(item => ({
      date: item.date,
      value: Number(item.value)
    }));
  };

  // Get and process the latest value
  const latestValue = getLatestValue();
  const numericValue = typeof latestValue === 'string' ? parseFloat(latestValue) : latestValue;
  const isNegativeValue = numericValue < 0;
  const formattedValue = formatValue(latestValue, {
    type,
    decimalPlaces,
  });
  
  // Calculate change data
  const changeData = calculateChange();
  const isPositive = changeData.value >= 0;
  
  const formattedChangePercentage = formatValue(Math.abs(changeData.percentage), {
    type: 'percentage',
    decimalPlaces: 1,
  });

  const periodMap = {
    'YTD': 'from YTD',
    '1W': 'from prev week',
    '1M': 'from prev month'
  };

  const chartData = prepareChartData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const tooltipValue = payload[0].value;
      const isNegativeTooltip = tooltipValue < 0;
      
      return (
        <div className="bg-background/90 dark:bg-background/90 backdrop-blur-sm p-2 border dark:border-border rounded shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">
            {new Date(label).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <p className={cn(
            "text-sm font-semibold",
            isNegativeTooltip && "text-red-600 dark:text-red-500"
          )}>
            {currency === 'LKR' ? 'Rs. ' : currency === 'USD' ? '$ ' : ''}
            {tooltipValue.toLocaleString(undefined, { 
              minimumFractionDigits: decimalPlaces,
              maximumFractionDigits: decimalPlaces
            })} 
            {unit && <span className="text-xs ml-1 font-normal text-muted-foreground">{unit}</span>}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn(
      "overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl min-w-[160px]", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-3">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[130px] whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </h3>
        <div className="inline-flex rounded-md bg-slate-100 dark:bg-slate-800">
          <Button 
            variant={selectedPeriod === 'YTD' ? 'default' : 'ghost'} 
            size="sm"
            className={cn(
              "h-6 px-2 text-xs rounded-r-none shadow-none",
              selectedPeriod === 'YTD' ? (
                "bg-slate-900 text-white hover:bg-slate-800 hover:text-white dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 dark:hover:text-slate-900"
              ) : (
                "dark:text-slate-300 dark:hover:text-white"
              )
            )}
            onClick={() => setSelectedPeriod('YTD')}
          >
            YTD
          </Button>
          <Button 
            variant={selectedPeriod === '1M' ? 'default' : 'ghost'} 
            size="sm"
            className={cn(
              "h-6 px-2 text-xs rounded-none border-l border-r border-slate-200 dark:border-slate-700 shadow-none",
              selectedPeriod === '1M' ? (
                "bg-slate-900 text-white hover:bg-slate-800 hover:text-white dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 dark:hover:text-slate-900"
              ) : (
                "dark:text-slate-300 dark:hover:text-white"
              )
            )}
            onClick={() => setSelectedPeriod('1M')}
          >
            1M
          </Button>
          <Button 
            variant={selectedPeriod === '1W' ? 'default' : 'ghost'} 
            size="sm"
            className={cn(
              "h-6 px-2 text-xs rounded-l-none shadow-none",
              selectedPeriod === '1W' ? (
                "bg-slate-900 text-white hover:bg-slate-800 hover:text-white dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 dark:hover:text-slate-900"
              ) : (
                "dark:text-slate-300 dark:hover:text-white"
              )
            )}
            onClick={() => setSelectedPeriod('1W')}
          >
            1W
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex flex-col space-y-1">
          <div className="flex items-baseline">
            {currency && (
              <span className={cn(
                "mr-1",
                isNegativeValue ? "text-red-600 dark:text-red-500" : "text-slate-500 dark:text-slate-400"
              )}>
                {isNegativeValue ? "-" : ""}Rs.
              </span>
            )}
            <span className={cn(
              "text-xl sm:text-2xl font-bold",
              isNegativeValue && "text-red-600 dark:text-red-500"
            )}>
              {isNegativeValue ? formattedValue.replace(/^-/, '') : formattedValue}
            </span>
            {unit && (
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                Mn
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            {isPositive ? (
              <>
                <ArrowUpRight size={16} className="text-emerald-600 dark:text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">
                  +{formattedChangePercentage}
                </span>
              </>
            ) : (
              <>
                <ArrowDownRight size={16} className="text-red-600 dark:text-red-500" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-500">
                  -{formattedChangePercentage}
                </span>
              </>
            )}
            <span className="text-xs pl-1 text-slate-500 dark:text-slate-400">
              {periodMap[selectedPeriod]}
            </span>
          </div>
          
          {showSparkline && chartData.length > 1 && (
            <div className="h-14 w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={chartData} 
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="5%" 
                        stopColor={numericValue < 0 ? "#f87171" : "#34d399"} 
                        stopOpacity={0.3}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={numericValue < 0 ? "#fee2e2" : "#bbf7d0"} 
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={numericValue < 0 ? "#dc2626" : "#10b981"}
                    strokeWidth={1.5}
                    fill="url(#colorValue)"
                    dot={false}
                    activeDot={{ 
                      r: 4, 
                      strokeWidth: 0, 
                      fill: numericValue < 0 ? "#dc2626" : "#10b981"
                    }}
                    isAnimationActive={true}
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

export default StatCard;