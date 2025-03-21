import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BankInflowChartProps {
  data: {
    record_date: string;
    exchange_house_buying: number;
    money_products_buying: number;
    ir_buying: number;
  }[];
  title?: string;
}

export default function BankInflowChart({ data, title }: BankInflowChartProps) {
  // State for the selected time range
  const [timeRange, setTimeRange] = useState<'1W' | 'MTD' | 'YTD'>('1W');

  // Process data to ensure dates are Date objects and calculate total
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(item => ({
      date: new Date(item.record_date),
      exchangeHouse: Number(item.exchange_house_buying) || 0,
      moneyProducts: Number(item.money_products_buying) || 0,
      irBuying: Number(item.ir_buying) || 0,
      total: (Number(item.exchange_house_buying) || 0) +
             (Number(item.money_products_buying) || 0) +
             (Number(item.ir_buying) || 0)
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

    // Calculate totals for each category
    const totalExchangeHouse = filteredData.reduce((sum, item) => sum + item.exchangeHouse, 0);
    const totalMoneyProducts = filteredData.reduce((sum, item) => sum + item.moneyProducts, 0);
    const totalIrBuying = filteredData.reduce((sum, item) => sum + item.irBuying, 0);
    const grandTotal = totalExchangeHouse + totalMoneyProducts + totalIrBuying;

    // Calculate percentages
    const exchangeHousePercent = grandTotal > 0 ? (totalExchangeHouse / grandTotal * 100).toFixed(1) : '0.0';
    const moneyProductsPercent = grandTotal > 0 ? (totalMoneyProducts / grandTotal * 100).toFixed(1) : '0.0';
    const irBuyingPercent = grandTotal > 0 ? (totalIrBuying / grandTotal * 100).toFixed(1) : '0.0';

    // Calculate averages
    const avgExchangeHouse = filteredData.length > 0 ? totalExchangeHouse / filteredData.length : 0;
    const avgMoneyProducts = filteredData.length > 0 ? totalMoneyProducts / filteredData.length : 0;
    const avgIrBuying = filteredData.length > 0 ? totalIrBuying / filteredData.length : 0;
    const avgTotal = filteredData.length > 0 ? grandTotal / filteredData.length : 0;

    // Calculate change over the period
    let totalChange = 0;
    let totalChangePercent = '0.00';

    if (filteredData.length >= 2) {
      const firstRecord = filteredData[0];
      const lastRecord = filteredData[filteredData.length - 1];
      totalChange = lastRecord.total - firstRecord.total;

      if (firstRecord.total !== 0) {
        totalChangePercent = ((totalChange / firstRecord.total) * 100).toFixed(2);
      }
    }

    return {
      totalExchangeHouse: totalExchangeHouse.toFixed(2),
      totalMoneyProducts: totalMoneyProducts.toFixed(2),
      totalIrBuying: totalIrBuying.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      exchangeHousePercent,
      moneyProductsPercent,
      irBuyingPercent,
      avgExchangeHouse: avgExchangeHouse.toFixed(2),
      avgMoneyProducts: avgMoneyProducts.toFixed(2),
      avgIrBuying: avgIrBuying.toFixed(2),
      avgTotal: avgTotal.toFixed(2),
      totalChange,
      totalChangePercent
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
            <p className="text-chart-2 flex justify-between">
              Exchange House: <span className="font-medium ml-2">{formatCurrency(data.exchangeHouse)}</span>
            </p>
            <p className="text-chart-3 flex justify-between">
              Money Products: <span className="font-medium ml-2">{formatCurrency(data.moneyProducts)}</span>
            </p>
            <p className="text-chart-4 flex justify-between">
              IR Buying: <span className="font-medium ml-2">{formatCurrency(data.irBuying)}</span>
            </p>
            <div className="border-t border-border/30 mt-1 pt-1">
              <p className="text-foreground flex justify-between font-medium">
                Total: <span className="ml-2">{formatCurrency(data.total)}</span>
              </p>
            </div>
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
          <h2 className="text-base font-semibold">{title || 'Bank USD Inflow Methods'}</h2>
          {stats && (
            <div className="flex text-xs space-x-3 text-muted-foreground mt-1">
              <span>Daily Avg: <span className="text-foreground font-medium">
                {parseFloat(stats.avgTotal) > 0 ? formatCurrency(parseFloat(stats.avgTotal)) : 'N/A'}
              </span></span>
              <span>Total: <span className="text-foreground font-medium">
                {parseFloat(stats.grandTotal) > 0 ? formatCurrency(parseFloat(stats.grandTotal)) : 'N/A'}
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
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-secondary/30 p-3 rounded">
            <p className="text-xs text-muted-foreground">Exchange House</p>
            <p className="text-sm font-semibold text-chart-1">
              {formatCurrency(parseFloat(stats.totalExchangeHouse))}
              <span className="text-xs ml-1 text-muted-foreground">({stats.exchangeHousePercent}%)</span>
            </p>
          </div>
          <div className="bg-secondary/30 p-3 rounded">
            <p className="text-xs text-muted-foreground">Money Products</p>
            <p className="text-sm font-semibold text-chart-2">
              {formatCurrency(parseFloat(stats.totalMoneyProducts))}
              <span className="text-xs ml-1 text-muted-foreground">({stats.moneyProductsPercent}%)</span>
            </p>
          </div>
          <div className="bg-secondary/30 p-3 rounded">
            <p className="text-xs text-muted-foreground">IR Buying</p>
            <p className="text-sm font-semibold text-chart-3">
              {formatCurrency(parseFloat(stats.totalIrBuying))}
              <span className="text-xs ml-1 text-muted-foreground">({stats.irBuyingPercent}%)</span>
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
              stackOffset="sign"
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
              <Legend />
              <Bar
                dataKey="exchangeHouse"
                name="Exchange House"
                stackId="a"
                fill="var(--chart-2)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="moneyProducts"
                name="Money Products"
                stackId="a"
                fill="var(--chart-3)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="irBuying"
                name="IR Buying"
                stackId="a"
                fill="var(--chart-4)"
                radius={[0, 0, 0, 0]}
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
