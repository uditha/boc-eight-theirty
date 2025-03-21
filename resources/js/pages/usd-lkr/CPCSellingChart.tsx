import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CPCSellingChartProps {
  data: {
    record_date: string;
    cpc_selling: number;
  }[];
  title?: string;
}

export default function CPCSellingChart({ data, title }: CPCSellingChartProps) {
  // State for the selected time range
  const [timeRange, setTimeRange] = useState<'1W' | 'MTD' | 'YTD'>('1W');

  // Process data to ensure dates are Date objects
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(item => ({
      date: new Date(item.record_date),
      amount: Number(item.cpc_selling) || 0
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data]);

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (!processedData.length) return [];

    const now = new Date();
    const lastDate = processedData[processedData.length - 1].date;

    if (timeRange === '1W') {
      const oneWeekAgo = new Date(lastDate);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return processedData.filter(item => item.date >= oneWeekAgo);
    } else if (timeRange === 'MTD') {
      const startOfMonth = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
      return processedData.filter(item => item.date >= startOfMonth);
    } else if (timeRange === 'YTD') {
      const startOfYear = new Date(lastDate.getFullYear(), 0, 1);
      return processedData.filter(item => item.date >= startOfYear);
    }

    return processedData;
  }, [processedData, timeRange]);

  // Calculate statistics for the filtered data
  const stats = useMemo(() => {
    if (!filteredData.length) return null;

    // Filter out any non-numeric values before calculating
    const validData = filteredData.filter(item =>
      typeof item.amount === 'number' && !isNaN(item.amount)
    );

    if (!validData.length) {
      return {
        min: '0.00',
        max: '0.00',
        avg: '0.00',
        change: 0,
        changePercent: '0.00',
        total: '0.00'
      };
    }

    const min = Math.min(...validData.map(item => item.amount));
    const max = Math.max(...validData.map(item => item.amount));
    const avg = validData.reduce((sum, item) => sum + item.amount, 0) / validData.length;
    const total = validData.reduce((sum, item) => sum + item.amount, 0);

    // Calculate change over the period
    let change = 0;
    let changePercent = '0.00';

    if (validData.length >= 2) {
      const firstRecord = validData[0];
      const lastRecord = validData[validData.length - 1];
      change = lastRecord.amount - firstRecord.amount;

      if (firstRecord.amount !== 0) {
        changePercent = ((change / firstRecord.amount) * 100).toFixed(2);
      }
    }

    return {
      min: min.toFixed(2),
      max: max.toFixed(2),
      avg: avg.toFixed(2),
      change,
      changePercent,
      total: total.toFixed(2)
    };
  }, [filteredData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="py-2 px-3 bg-card/95 dark:bg-card/95 backdrop-blur border border-border rounded shadow-lg text-sm text-foreground">
          <p className="font-semibold text-xs mb-1">
            {data.date instanceof Date ?
              data.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) :
              'Unknown date'}
          </p>
          <div className="grid gap-y-1">
            <p className="text-chart-3 flex justify-between">
              Amount: <span className="font-medium ml-2">{formatCurrency(data.amount)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Format date for x-axis
  const formatXAxis = (dateObj: Date) => {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full p-4 bg-card rounded-lg border border-border shadow-sm flex items-center justify-center h-52 md:h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-base font-semibold">{title || 'CPC Selling'}</h2>
          {stats && (
            <div className="flex text-xs space-x-3 text-muted-foreground mt-1">
              <span>Avg: <span className="text-chart-3 font-medium">
                {parseFloat(stats.avg) > 0 ? formatCurrency(parseFloat(stats.avg)) : 'N/A'}
              </span></span>
              <span>Total: <span className="text-chart-3 font-medium">
                {parseFloat(stats.total) > 0 ? formatCurrency(parseFloat(stats.total)) : 'N/A'}
              </span></span>
            </div>
          )}
        </div>
        <div className="flex rounded-md shadow-sm bg-secondary/30 p-0.5">
          {['1W', 'MTD', 'YTD'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as '1W' | 'MTD' | 'YTD')}
              className={`px-3 py-1 text-xs font-medium transition-colors rounded ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-secondary/30 p-3 rounded">
            <p className="text-xs text-muted-foreground">Min-Max ({timeRange})</p>
            <p className="text-sm font-semibold">
              {formatCurrency(parseFloat(stats.min))} - {formatCurrency(parseFloat(stats.max))}
            </p>
          </div>
          <div className="bg-secondary/30 p-3 rounded">
            <p className="text-xs text-muted-foreground">Change ({timeRange})</p>
            <p className={`text-sm font-semibold ${stats.change >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {stats.change >= 0 ? '+' : ''}{formatCurrency(parseFloat(stats.change.toFixed(2)))}
              <span className="text-xs ml-1">({stats.changePercent}%)</span>
            </p>
          </div>
        </div>
      )}

      <div className="h-56 md:h-72">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 20, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                className="text-muted-foreground"
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                width={40}
                tickFormatter={(value) => `${Math.abs(value)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                name="CPC Selling"
                stroke="var(--chart-3)"
                fill="var(--chart-3)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available for selected time range</p>
          </div>
        )}
      </div>
    </div>
  );
}
