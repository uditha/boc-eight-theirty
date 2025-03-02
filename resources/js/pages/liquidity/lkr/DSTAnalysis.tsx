import React from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';

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

// Different color palette for this component to differentiate from RepoAnalysis
const COLORS = [
  'var(--chart-2)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-3)'
];

const RADIAN = Math.PI / 180;
// No labels on donut chart
const renderCustomizedLabel = () => null;

const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-3 rounded-md shadow-md border border-border">
        <p className="font-medium text-sm">{formatDate(label)}</p>
        <p className="text-sm text-foreground mt-1">
          <span className="font-medium">Total:</span> {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// No tooltip for donut chart

const DSTAnalysis = ({ data, compositionData }) => {
  // Get the current and previous total balance
  const currentTotal = data[data.length - 1].value;
  const previousTotal = data.length > 7 ? data[data.length - 7].value : data[0].value;
  
  // Calculate change percentage
  const changePercentage = ((currentTotal - previousTotal) / previousTotal) * 100;
  const isIncreasing = changePercentage >= 0;

  return (
    <Card className="w-full shadow-md">
      <CardContent className="space-y-4 pt-6">
        {/* Row 1: Title and Total Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-chart-2" />
            <div>
              <h2 className="text-lg font-semibold">DST Balance Analysis</h2>
              <p className="text-sm text-muted-foreground">14-day trend and composition</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm text-muted-foreground">Current Balance:</span>
            </div>
            <div className='flex items-center justify-end gap-2'>
                <span className="text-xl font-bold">{formatCurrency(currentTotal)}</span>
                <div className={`flex items-center gap-1 text-sm ${isIncreasing ? 'text-chart-2' : 'text-chart-3'}`}>
                    {isIncreasing ? <ArrowUpRight /> : <ArrowDownRight />}
                    <span>{changePercentage.toFixed(1)}%</span>
                </div>
            </div>
          </div>
        </div>
        
        {/* Row 2: Donut Chart and Balance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 bg-card rounded-lg p-4 border border-border shadow-sm">
          {/* Donut Chart */}
                          <div className="h-44 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={65}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Balance Breakdown */}
          <div className="flex flex-col justify-center space-y-3">
            {compositionData.map((item, index) => {
              // Create abbreviation for account name
              let abbr = '';
              if (item.name.includes('Current Account')) abbr = 'CA';
              else if (item.name.includes('Fund Management')) abbr = 'FMA';
              else if (item.name.includes('Seven Day')) abbr = '7D';
              else if (item.name.includes('Fixed Deposit')) abbr = 'FD';
              else abbr = item.name.substring(0, 2).toUpperCase();
              
              const percentage = (item.value / currentTotal * 100).toFixed(1);
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium">{abbr}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm">{formatCurrency(item.value)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 3: Area Chart - Trend */}
        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Balance Trend (10 days)</h3>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorDST" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate} 
                  tick={{ fontSize: 10 }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 10 }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--chart-2)" 
                  fillOpacity={1} 
                  fill="url(#colorDST)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DSTAnalysis;