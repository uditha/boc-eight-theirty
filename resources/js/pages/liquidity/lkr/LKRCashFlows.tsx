import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, Area } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowDown, ArrowUp, TrendingUp, Activity, DollarSign, Filter } from 'lucide-react';
import DonutFlowVisualization from './DonutFlowVisualization';

// Format currency in LKR (Sri Lankan Rupee)
const formatCurrency = (value) => {
  if (Math.abs(value) >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  } else if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toFixed(2);
};

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-3 rounded-md shadow-md border border-border">
        <p className="font-medium text-sm mb-1">{formatDate(label)}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-xs text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="text-xs font-medium">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Flow category colors
const inflowColors = {
  interbanks: 'var(--chart-1)',
  electronic_payments: 'var(--chart-2)',
  dst_ins: 'var(--chart-3)',
  tbills: 'var(--chart-4)',
  tbonds: 'var(--chart-5)',
  coupons: '#4ade80',
  dvp: '#c084fc'
};

const outflowColors = {
  interbanks: 'var(--chart-1)',
  electronic_payments: 'var(--chart-2)',
  dst_outs: 'var(--chart-3)',
  tbills: 'var(--chart-4)',
  tbonds: 'var(--chart-5)',
  rvp: '#f43f5e'
};

// KPI Card component
const KpiCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={`p-2 rounded-full bg-${color}/10`}>
          <Icon className={`h-4 w-4 text-${color}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          <span className="text-xs">{Math.abs(change).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};



// Main component
const LKRCashFlows = ({ data }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedDate, setSelectedDate] = useState(data[data.length - 1].date);
  
  // Prepare time-filtered data based on selection
  const filteredData = useMemo(() => {
    const currentDate = new Date();
    let cutoffDate;
    
    if (selectedPeriod === 'week') {
      cutoffDate = new Date(currentDate);
      cutoffDate.setDate(currentDate.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      cutoffDate = new Date(currentDate);
      cutoffDate.setMonth(currentDate.getMonth() - 1);
    } else if (selectedPeriod === 'quarter') {
      cutoffDate = new Date(currentDate);
      cutoffDate.setMonth(currentDate.getMonth() - 3);
    } else {
      cutoffDate = new Date(currentDate);
      cutoffDate.setFullYear(currentDate.getFullYear() - 1);
    }
    
    return data.filter(item => new Date(item.date) >= cutoffDate);
  }, [data, selectedPeriod]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const latestDate = new Date(data[data.length - 1].date);
    const previousDay = new Date(latestDate);
    previousDay.setDate(previousDay.getDate() - 1);
    
    const latestData = data[data.length - 1];
    const previousData = data.find(item => 
      new Date(item.date).toDateString() === previousDay.toDateString()
    ) || data[data.length - 2] || data[data.length - 1];
    
    // Total inflows for latest and previous day
    const totalInflow = 
      latestData.inflow_interbanks + 
      latestData.inflow_electronic_payments + 
      latestData.inflow_dst_ins + 
      latestData.inflow_tbills + 
      latestData.inflow_tbonds + 
      latestData.inflow_coupons +
      latestData.dvp;
      
    const prevTotalInflow = 
      previousData.inflow_interbanks + 
      previousData.inflow_electronic_payments + 
      previousData.inflow_dst_ins + 
      previousData.inflow_tbills + 
      previousData.inflow_tbonds + 
      previousData.inflow_coupons +
      previousData.dvp;
    
    // Total outflows for latest and previous day
    const totalOutflow = 
      latestData.outflow_interbanks + 
      latestData.outflow_electronic_payments + 
      latestData.outflow_dst_outs + 
      latestData.outflow_tbills + 
      latestData.outflow_tbonds +
      latestData.rvp;
      
    const prevTotalOutflow = 
      previousData.outflow_interbanks + 
      previousData.outflow_electronic_payments + 
      previousData.outflow_dst_outs + 
      previousData.outflow_tbills + 
      previousData.outflow_tbonds +
      previousData.rvp;
    
    // Net flow for latest and previous day
    const netFlow = totalInflow - totalOutflow;
    const prevNetFlow = prevTotalInflow - prevTotalOutflow;
    
    // Calculate changes
    const inflowChange = prevTotalInflow === 0 ? 0 : ((totalInflow - prevTotalInflow) / prevTotalInflow * 100);
    const outflowChange = prevTotalOutflow === 0 ? 0 : ((totalOutflow - prevTotalOutflow) / prevTotalOutflow * 100);
    const netChange = prevNetFlow === 0 ? 0 : ((netFlow - prevNetFlow) / Math.abs(prevNetFlow) * 100);
    
    return {
      totalInflow: formatCurrency(totalInflow),
      totalOutflow: formatCurrency(totalOutflow),
      netFlow: formatCurrency(netFlow),
      inflowChange,
      outflowChange,
      netChange
    };
  }, [data]);

  // Prepare stacked data for charts
  const stackedChartData = useMemo(() => {
    return filteredData.map(item => ({
      date: item.date,
      // Inflows
      "Interbank In": item.inflow_interbanks,
      "Electronic In": item.inflow_electronic_payments,
      "DST In": item.inflow_dst_ins,
      "T-Bills In": item.inflow_tbills,
      "T-Bonds In": item.inflow_tbonds,
      "Coupons": item.inflow_coupons,
      "DVP": item.dvp,
      // Outflows
      "Interbank Out": -item.outflow_interbanks,
      "Electronic Out": -item.outflow_electronic_payments,
      "DST Out": -item.outflow_dst_outs,
      "T-Bills Out": -item.outflow_tbills,
      "T-Bonds Out": -item.outflow_tbonds,
      "RVP": -item.rvp,
      // Totals for line chart
      "Total Inflow": item.inflow_interbanks + 
                     item.inflow_electronic_payments + 
                     item.inflow_dst_ins + 
                     item.inflow_tbills + 
                     item.inflow_tbonds + 
                     item.inflow_coupons +
                     item.dvp,
      "Total Outflow": -(item.outflow_interbanks + 
                      item.outflow_electronic_payments + 
                      item.outflow_dst_outs + 
                      item.outflow_tbills + 
                      item.outflow_tbonds +
                      item.rvp),
      "Net Flow": (item.inflow_interbanks + 
                  item.inflow_electronic_payments + 
                  item.inflow_dst_ins + 
                  item.inflow_tbills + 
                  item.inflow_tbonds + 
                  item.inflow_coupons +
                  item.dvp) - 
                 (item.outflow_interbanks + 
                  item.outflow_electronic_payments + 
                  item.outflow_dst_outs + 
                  item.outflow_tbills + 
                  item.outflow_tbonds +
                  item.rvp)
    }));
  }, [filteredData]);

  // Handle date selection from chart
  const handleDateClick = (data) => {
    if (data && data.activeLabel) {
      setSelectedDate(data.activeLabel);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardContent className="space-y-4 pt-6">
        {/* Header with tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-chart-1" />
              LKR Cash Flow Analysis
            </h2>
            <p className="text-sm text-muted-foreground">Daily inflows and outflows</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Period:</span>
            <div className="flex rounded-md overflow-hidden border border-border">
              <Button 
                variant={selectedPeriod === 'week' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setSelectedPeriod('week')}
                className="rounded-none h-8"
              >
                Week
              </Button>
              <Button 
                variant={selectedPeriod === 'month' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setSelectedPeriod('month')}
                className="rounded-none h-8"
              >
                Month
              </Button>
              <Button 
                variant={selectedPeriod === 'quarter' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setSelectedPeriod('quarter')}
                className="rounded-none h-8"
              >
                Quarter
              </Button>
              <Button 
                variant={selectedPeriod === 'year' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setSelectedPeriod('year')}
                className="rounded-none h-8"
              >
                Year
              </Button>
            </div>
          </div>
        </div>
    
        
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detail">Detailed Flow</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="pt-4">
            <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Daily Cash Flow</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={stackedChartData} 
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    onClick={handleDateClick}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 11 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      tick={{ fontSize: 11 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    {/* Stacked bars for inflows and outflows */}
                    <Area type="monotone" dataKey="Total Inflow" stackId="1" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="Total Outflow" stackId="2" stroke="var(--destructive)" fill="var(--destructive)" fillOpacity={0.2} />
                    <Line type="monotone" dataKey="Net Flow" stroke="var(--chart-3)" dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Flow Visualization */}
            <div className="mt-4 bg-card rounded-lg p-4 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Flow Analysis for {formatDate(selectedDate)}</h3>
                <span className="text-xs text-muted-foreground">
                  Click on chart points to select a date
                </span>
              </div>
              <DonutFlowVisualization data={data} date={selectedDate} />
            </div>
          </TabsContent>
          
          {/* Detail Tab */}
          <TabsContent value="detail" className="pt-4">
            <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Detailed Cash Flow Components</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stackedChartData} 
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    onClick={handleDateClick}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 11 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      tick={{ fontSize: 11 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    {/* Inflows */}
                    <Bar dataKey="Interbank In" stackId="inflow" fill={inflowColors.interbanks} />
                    <Bar dataKey="Electronic In" stackId="inflow" fill={inflowColors.electronic_payments} />
                    <Bar dataKey="DST In" stackId="inflow" fill={inflowColors.dst_ins} />
                    <Bar dataKey="T-Bills In" stackId="inflow" fill={inflowColors.tbills} />
                    <Bar dataKey="T-Bonds In" stackId="inflow" fill={inflowColors.tbonds} />
                    <Bar dataKey="Coupons" stackId="inflow" fill={inflowColors.coupons} />
                    <Bar dataKey="DVP" stackId="inflow" fill={inflowColors.dvp} />
                    
                    {/* Outflows */}
                    <Bar dataKey="Interbank Out" stackId="outflow" fill={outflowColors.interbanks} />
                    <Bar dataKey="Electronic Out" stackId="outflow" fill={outflowColors.electronic_payments} />
                    <Bar dataKey="DST Out" stackId="outflow" fill={outflowColors.dst_outs} />
                    <Bar dataKey="T-Bills Out" stackId="outflow" fill={outflowColors.tbills} />
                    <Bar dataKey="T-Bonds Out" stackId="outflow" fill={outflowColors.tbonds} />
                    <Bar dataKey="RVP" stackId="outflow" fill={outflowColors.rvp} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends" className="pt-4">
            <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Cash Flow Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={stackedChartData} 
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    onClick={handleDateClick}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 11 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      tick={{ fontSize: 11 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    {/* Trend lines */}
                    <Line type="monotone" dataKey="Total Inflow" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 1 }} />
                    <Line type="monotone" dataKey="Total Outflow" stroke="var(--destructive)" strokeWidth={2} dot={{ r: 1 }} />
                    <Line type="monotone" dataKey="Net Flow" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Analysis Insights */}
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Flow Patterns & Insights
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-chart-1 font-bold">•</span>
                    <span>Primary inflow drivers: {stackedChartData.length > 0 ? 
                      (stackedChartData[stackedChartData.length-1]["Interbank In"] > stackedChartData[stackedChartData.length-1]["Electronic In"] ? 
                        "Interbank transfers" : "Electronic payments") : "Loading..."}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">•</span>
                    <span>Current net flow is {kpis.netChange >= 0 ? "increasing" : "decreasing"} compared to previous period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-chart-3 font-bold">•</span>
                    <span>Flow volatility: {
                      stackedChartData.length > 5 ? 
                        Math.abs(kpis.netChange) > 20 ? "High" : Math.abs(kpis.netChange) > 10 ? "Moderate" : "Low" 
                        : "Insufficient data"
                    }</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer with additional info */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
          <div>
            Last Updated: {formatDate(data[data.length - 1].date)}
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span>Data Source: RTGS & Treasury Systems</span>
            <div className="h-4 w-px bg-border"></div>
            <Button size="sm" variant="outline" className="h-6 gap-1 text-xs">
              <Filter className="h-3 w-3" />
              Export Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};



export default LKRCashFlows;