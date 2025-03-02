import React, { useState } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, DollarSign, Percent, TrendingUp } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-4 rounded-lg shadow-lg border border-border">
        <p className="font-semibold text-sm mb-2">{formatDate(label)}</p>
        <div className="space-y-1">
          <p className="text-sm text-foreground flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Balance:</span> 
            <span className="font-bold">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-sm text-foreground flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Rate:</span> 
            <span className="font-bold">{payload[1].value}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const RepoAnalysis = ({ data }) => {
  const [hoverData, setHoverData] = useState(null);
  
  // Get the latest data point for current balance and rate
  const currentData = data[data.length - 1];
  const previousData = data[data.length - 2];
  
  // Calculate change percentage for balance
  const balanceChange = ((currentData.value - previousData.value) / previousData.value) * 100;
  const rateChange = currentData.rate - previousData.rate;
  
  // Determine if balance and rate are increasing or decreasing
  const isBalanceIncreasing = balanceChange >= 0;
  const isRateIncreasing = rateChange >= 0;

  // Find min and max for better chart display
  const minBalance = Math.min(...data.map(item => item.value)) * 0.95;
  const maxBalance = Math.max(...data.map(item => item.value)) * 1.05;
  
  const minRate = Math.min(...data.map(item => item.rate)) * 0.95;
  const maxRate = Math.max(...data.map(item => item.rate)) * 1.05;

  const handleMouseMove = (data) => {
    if (data && data.activePayload) {
      setHoverData(data.activePayload[0].payload);
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <Card className="w-full shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Customer Repo Overview
            </CardTitle>
            <CardDescription>30-day repo balance and rate analysis</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-chart-1 opacity-60"></div>
              <span className="text-xs text-muted-foreground">Balance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-chart-3"></div>
              <span className="text-xs text-muted-foreground">Rate</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Current Balance Card */}
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-white ${isBalanceIncreasing ? 'bg-green-500' : 'bg-red-500'}`}>
                {isBalanceIncreasing ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span className="text-xs font-semibold">{Math.abs(balanceChange).toFixed(1)}%</span>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold">{formatCurrency(currentData.value)}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isBalanceIncreasing ? 'Increased' : 'Decreased'} since {formatDate(previousData.date)}
              </p>
            </div>
            <div className="absolute -bottom-10 -right-5 h-20 w-20 rounded-full bg-primary/5"></div>
          </div>
          
          {/* Current Rate Card */}
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-chart-3/10 p-2 rounded-full">
                  <Percent className="h-5 w-5 text-chart-3" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Current Rate</span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-white ${isRateIncreasing ? 'bg-green-500' : 'bg-red-500'}`}>
                {isRateIncreasing ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span className="text-xs font-semibold">{Math.abs(rateChange).toFixed(2)} pts</span>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold">{Number(currentData.rate).toFixed(2)}%</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isRateIncreasing ? 'Increased' : 'Decreased'} since {formatDate(previousData.date)}
              </p>
            </div>
            <div className="absolute -bottom-10 -right-5 h-20 w-20 rounded-full bg-chart-3/5"></div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-72 mt-6 rounded-lg border border-border p-4 bg-card/50">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={data} 
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                className="text-xs text-muted-foreground"
                tick={{ fontSize: 11 }}
                tickLine={{ stroke: 'var(--border)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickCount={6}
              />
              <YAxis 
                yAxisId="left"
                domain={[minBalance, maxBalance]}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                className="text-xs text-muted-foreground" 
                tick={{ fontSize: 11 }}
                tickLine={{ stroke: 'var(--border)' }}
                axisLine={{ stroke: 'var(--border)' }}
                orientation="left"
              />
              <YAxis 
                yAxisId="right"
                domain={[minRate, maxRate]}
                tickFormatter={(value) => `${value}%`}
                className="text-xs text-muted-foreground" 
                tick={{ fontSize: 11 }}
                tickLine={{ stroke: 'var(--border)' }}
                axisLine={{ stroke: 'var(--border)' }}
                orientation="right"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                yAxisId="left"
                fill="url(#colorBalance)" 
                stroke="var(--chart-1)" 
                strokeWidth={2}
                activeDot={{ r: 6, fill: 'var(--chart-1)', stroke: 'var(--background)', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                yAxisId="right"
                stroke="var(--chart-3)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: 'var(--chart-3)', stroke: 'var(--background)', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-chart-1"></span>
          Balance (LKR) and 
          <span className="inline-block w-2 h-2 rounded-full bg-chart-3"></span>
          Rate (%) history for the last 30 days
        </div>
      </CardContent>
    </Card>
  );
};

export default RepoAnalysis;