import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CBSLTradingChartProps {
  data: {
    record_date: string;
    cbsl_buying: number;
    cbsl_selling: number;
  }[];
  title?: string;
}

export default function CBSLTradingChart({ data, title }: CBSLTradingChartProps) {
  // State for the selected time range
  const [timeRange, setTimeRange] = useState<'1W' | 'MTD' | 'YTD'>('1W');

  // Process data to ensure dates are Date objects
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(item => ({
      date: new Date(item.record_date),
      buying: Number(item.cbsl_buying),
      selling: -Number(item.cbsl_selling), // Make selling negative for downward bars
      actualSelling: Number(item.cbsl_selling), // Keep actual value for display
      spread: Number(item.cbsl_selling) - Number(item.cbsl_buying)
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
    const validBuyingData = filteredData.filter(item => typeof item.buying === 'number' && !isNaN(item.buying) && item.buying !== 0);
    const validSellingData = filteredData.filter(item => typeof item.actualSelling === 'number' && !isNaN(item.actualSelling) && item.actualSelling !== 0);
    const validSpreadData = filteredData.filter(item =>
      typeof item.buying === 'number' && !isNaN(item.buying) &&
      typeof item.actualSelling === 'number' && !isNaN(item.actualSelling)
    );

    // Only calculate if we have valid data
    if (!validBuyingData.length || !validSellingData.length) {
      return {
        minBuying: '0.00',
        maxBuying: '0.00',
        avgBuying: '0.00',
        minSelling: '0.00',
        maxSelling: '0.00',
        avgSelling: '0.00',
        avgNetAmount: '0.00',
        buyingChange: 0,
        buyingChangePercent: '0.00',
        sellingChange: 0,
        sellingChangePercent: '0.00'
      };
    }

    const minBuying = Math.min(...validBuyingData.map(item => item.buying));
    const maxBuying = Math.max(...validBuyingData.map(item => item.buying));
    const avgBuying = validBuyingData.reduce((sum, item) => sum + item.buying, 0) / validBuyingData.length;

    const minSelling = Math.min(...validSellingData.map(item => item.actualSelling));
    const maxSelling = Math.max(...validSellingData.map(item => item.actualSelling));
    const avgSelling = validSellingData.reduce((sum, item) => sum + item.actualSelling, 0) / validSellingData.length;

    const avgNetAmount = validSpreadData.length > 0
      ? validSpreadData.reduce((sum, item) => sum + (item.actualSelling - item.buying), 0) / validSpreadData.length
      : 0;

    // Calculate change over the period - safely
    let buyingChange = 0;
    let buyingChangePercent = '0.00';
    let sellingChange = 0;
    let sellingChangePercent = '0.00';

    if (validBuyingData.length >= 2) {
      const firstBuyingRecord = validBuyingData[0];
      const lastBuyingRecord = validBuyingData[validBuyingData.length - 1];
      buyingChange = lastBuyingRecord.buying - firstBuyingRecord.buying;

      if (firstBuyingRecord.buying !== 0) {
        buyingChangePercent = ((buyingChange / firstBuyingRecord.buying) * 100).toFixed(2);
      }
    }

    if (validSellingData.length >= 2) {
      const firstSellingRecord = validSellingData[0];
      const lastSellingRecord = validSellingData[validSellingData.length - 1];
      sellingChange = lastSellingRecord.actualSelling - firstSellingRecord.actualSelling;

      if (firstSellingRecord.actualSelling !== 0) {
        sellingChangePercent = ((sellingChange / firstSellingRecord.actualSelling) * 100).toFixed(2);
      }
    }

    return {
      minBuying: minBuying.toFixed(2),
      maxBuying: maxBuying.toFixed(2),
      avgBuying: avgBuying.toFixed(2),
      minSelling: minSelling.toFixed(2),
      maxSelling: maxSelling.toFixed(2),
      avgSelling: avgSelling.toFixed(2),
      avgNetAmount: avgNetAmount.toFixed(2),
      buyingChange,
      buyingChangePercent,
      sellingChange,
      sellingChangePercent
    };
  }, [filteredData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const buyingValue = data.buying;
      const sellingValue = Math.abs(data.selling); // Convert back to positive for display
      const netAmount = sellingValue - buyingValue; // Sell - Buy = Net Amount (spread)

      return (
        <div className="py-2 px-3 bg-card/95 dark:bg-card/95 backdrop-blur border border-border rounded shadow-lg text-sm text-foreground">
          <p className="font-semibold text-xs mb-1">
            {data.date instanceof Date ?
              data.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) :
              'Unknown date'}
          </p>
          <div className="grid gap-y-1">
            <p className="text-chart-1 flex justify-between">
              Buying: <span className="font-medium ml-2">{formatCurrency(buyingValue)}</span>
            </p>
            <p className="text-chart-2 flex justify-between">
              Selling: <span className="font-medium ml-2">{formatCurrency(sellingValue)}</span>
            </p>
            <p className="text-chart-3 flex justify-between">
              Spread: <span className="font-medium ml-2">{formatCurrency(netAmount)}</span>
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
          <h2 className="text-base font-semibold">{title || 'CBSL Trading'}</h2>
          {stats && (
            <div className="flex text-xs space-x-3 text-muted-foreground mt-1">
              <span>Avg Buying: <span className="text-chart-1 font-medium">
                {parseFloat(stats.avgBuying) > 0 ? stats.avgBuying : 'N/A'}
              </span></span>
              <span>Avg Selling: <span className="text-chart-2 font-medium">
                {parseFloat(stats.avgSelling) > 0 ? stats.avgSelling : 'N/A'}
              </span></span>
              <span>Avg Spread: <span className="text-chart-3 font-medium">
                {parseFloat(stats.avgNetAmount) !== 0 ? stats.avgNetAmount : 'N/A'}
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
            <p className="text-xs text-muted-foreground">Buying Change ({timeRange})</p>
            <p className={`text-sm font-semibold ${stats.buyingChange >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {stats.buyingChange >= 0 ? '+' : ''}{formatCurrency(parseFloat(stats.buyingChange.toFixed(2)))}
              <span className="text-xs ml-1">({stats.buyingChangePercent}%)</span>
            </p>
          </div>
          <div className="bg-secondary/30 p-3 rounded">
            <p className="text-xs text-muted-foreground">Selling Change ({timeRange})</p>
            <p className={`text-sm font-semibold ${stats.sellingChange >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {stats.sellingChange >= 0 ? '+' : ''}{formatCurrency(parseFloat(stats.sellingChange.toFixed(2)))}
              <span className="text-xs ml-1">({stats.sellingChangePercent}%)</span>
            </p>
          </div>
        </div>
      )}

      <div className="h-56 md:h-72">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 5, left: 0, bottom: 5 }}
              barCategoryGap={2}
              barGap={0}
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
              <ReferenceLine y={0} stroke="var(--border)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="buying"
                name="Buying"
                fill="var(--chart-3)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="selling"
                name="Selling"
                fill="var(--chart-4)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
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
