import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AmountChartProps {
  data: {
    date: string;
    amount: number;
  }[];
  title?: string;
}

export default function AmountAreaChart({ data, title }: AmountChartProps) {
  // State for the selected time range
  const [timeRange, setTimeRange] = useState('1W');
  
  // Format date strings to Date objects and ensure numerical values
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    return data.map(item => ({
      date: new Date(item.date),
      amount: typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount || 0))
    }));
  }, [data]);
  
  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (processedData.length === 0) {
      return [];
    }

    const currentDate = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'YTD':
        startDate = new Date(currentDate.getFullYear(), 0, 1); // Jan 1st of current year
        break;
      case 'MTD':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // 1st of current month
        break;
      case '1W':
      default:
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
    }
    
    return processedData
      .filter(item => item.date >= startDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [processedData, timeRange]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const firstDay = filteredData[0];
    const lastDay = filteredData[filteredData.length - 1];
    
    const amountChange = lastDay.amount - firstDay.amount;
    const amountChangePercent = (amountChange / firstDay.amount * 100).toFixed(2);
    
    const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
    const avgAmount = totalAmount / filteredData.length;
    const maxAmount = Math.max(...filteredData.map(item => item.amount));
    const minAmount = Math.min(...filteredData.map(item => item.amount));
    
    return {
      amountChange,
      amountChangePercent,
      totalAmount: totalAmount.toFixed(2),
      avgAmount: avgAmount.toFixed(2),
      maxAmount: maxAmount.toFixed(2),
      minAmount: minAmount.toFixed(2),
      lastAmount: lastDay.amount.toFixed(2)
    };
  }, [filteredData]);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const amountValue = data.amount;
      
      // Determine color based on amount compared to average
      let amountColor = "text-blue-500 dark:text-blue-400";
      
      if (stats) {
        if (amountValue < parseFloat(stats.avgAmount)) {
          amountColor = "text-red-500 dark:text-red-400";
        } else if (amountValue > parseFloat(stats.avgAmount)) {
          amountColor = "text-emerald-500 dark:text-emerald-400";
        }
      }
      
      return (
        <div className="py-2 px-3 bg-card/95 dark:bg-card/95 backdrop-blur border border-border rounded shadow-lg text-sm">
          <p className="font-semibold text-xs mb-1">
            {data.date instanceof Date ? 
              data.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 
              'Unknown date'}
          </p>
          <div className="grid gap-y-1">
            <p className={`${amountColor} flex justify-between`}>
              Amount: <span className="font-medium ml-2">${typeof amountValue === 'number' ? amountValue.toFixed(2) : amountValue}</span>
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
          <h2 className="text-base font-semibold">{title || 'Amount Area Chart'}</h2>
          {stats && (
            <div className="flex text-xs space-x-3 text-muted-foreground mt-1">
              <span>Min: <span className="text-red-500 dark:text-red-400 font-medium">${stats.minAmount}</span></span>
              <span>Avg: <span className="text-blue-500 dark:text-blue-400 font-medium">${stats.avgAmount}</span></span>
              <span>Max: <span className="text-emerald-500 dark:text-emerald-400 font-medium">${stats.maxAmount}</span></span>
            </div>
          )}
        </div>
        <div className="flex rounded-md shadow-sm bg-secondary/30 p-0.5">
          {['1W', 'MTD', 'YTD'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
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
            <p className="text-xs text-muted-foreground">Change ({timeRange})</p>
            <p className={`text-sm font-semibold ${stats.amountChange >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {stats.amountChange >= 0 ? '+' : ''}{formatCurrency(parseFloat(stats.amountChange.toFixed(2)))}
              <span className="text-xs ml-1">({stats.amountChangePercent}%)</span>
            </p>
          </div>
          <div className="bg-secondary/30 p-3 rounded">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-sm font-semibold">
              {formatCurrency(parseFloat(stats.totalAmount))}
            </p>
          </div>
        </div>
      )}
      
      <div className="h-56 md:h-72">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.2} />
                </linearGradient>
              </defs>
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
                domain={['auto', 'auto']} 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground" 
                width={40}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                name="Amount"
                stroke="var(--chart-3, #398bf7)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available for selected time range</p>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-right text-muted-foreground">
        {filteredData.length > 0 && (
          <p>Last updated: {
            filteredData[filteredData.length - 1]?.date instanceof Date ?
              filteredData[filteredData.length - 1].date.toLocaleString(undefined, { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'
          }</p>
        )}
      </div>
    </div>
  );
}