import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';

export default function RateChart({ data, title }) {
  // State for the selected time range
  const [timeRange, setTimeRange] = useState('7D');
  
  // Format date strings to Date objects and ensure numerical values
  const processedData = useMemo(() => {
    return data.map(item => ({
      date: new Date(item.date),
      close_bid: parseFloat(item.close_bid),
      close_offer: parseFloat(item.close_offer),
      spread: (parseFloat(item.close_offer) - parseFloat(item.close_bid)).toFixed(2)
    }));
  }, [data]);
  
  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    const currentDate = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7D':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case '14D':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 14);
        break;
      case '30D':
      default:
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
    }
    
    return processedData
      .filter(item => item.date >= startDate)
      .sort((a, b) => a.date - b.date);
  }, [processedData, timeRange]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const firstDay = filteredData[0];
    const lastDay = filteredData[filteredData.length - 1];
    
    const bidChange = lastDay.close_bid - firstDay.close_bid;
    const bidChangePercent = (bidChange / firstDay.close_bid * 100).toFixed(2);
    
    const offerChange = lastDay.close_offer - firstDay.close_offer;
    const offerChangePercent = (offerChange / firstDay.close_offer * 100).toFixed(2);
    
    const avgSpread = filteredData.reduce((sum, item) => 
      sum + (parseFloat(item.close_offer) - parseFloat(item.close_bid)), 0
    ) / filteredData.length;
    
    const maxSpread = Math.max(...filteredData.map(item => parseFloat(item.spread)));
    const minSpread = Math.min(...filteredData.map(item => parseFloat(item.spread)));
    
    return {
      bidChange,
      bidChangePercent,
      offerChange,
      offerChangePercent,
      avgSpread: avgSpread.toFixed(2),
      maxSpread: maxSpread.toFixed(2),
      minSpread: minSpread.toFixed(2)
    };
  }, [filteredData]);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const spreadValue = parseFloat(data.spread);
      let spreadColor = "text-amber-500";
      
      if (spreadValue < parseFloat(stats?.avgSpread)) {
        spreadColor = "text-green-500";
      } else if (spreadValue > parseFloat(stats?.avgSpread)) {
        spreadColor = "text-red-500";
      }
      
      return (
        <div className="py-2 px-3 bg-card/95 backdrop-blur border border-border rounded shadow-lg text-sm">
          <p className="font-semibold text-xs mb-1">{new Date(data.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <p className="text-chart-1 flex justify-between">Bid: <span className="font-medium ml-2">{data.close_bid.toFixed(2)}</span></p>
            <p className="text-chart-2 flex justify-between">Offer: <span className="font-medium ml-2">{data.close_offer.toFixed(2)}</span></p>
            <p className={`${spreadColor} flex justify-between col-span-2`}>
              Spread: <span className="font-medium ml-2">{data.spread}</span>
              <span className="ml-1 text-xs">
                ({(parseFloat(data.spread) / data.close_bid * 100).toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Format date for x-axis
  const formatXAxis = (dateObj) => {
    if (!(dateObj instanceof Date)) return '';
    return dateObj.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Color gradient for spread
  const getSpreadBarColor = (spread) => {
    const avgSpread = parseFloat(stats?.avgSpread || 0);
    if (spread < avgSpread * 0.9) return "var(--chart-3)";
    if (spread > avgSpread * 1.1) return "var(--chart-5)";
    return "var(--chart-4)";
  };
  
  return (
    <div className="w-full p-4 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base font-semibold">{title || 'Exchange Rate Chart'}</h2>
          {stats && (
            <div className="flex text-xs space-x-3 text-muted-foreground mt-1">
              <span>Min spread: <span className="text-chart-3 font-medium">{stats.minSpread}</span></span>
              <span>Avg spread: <span className="text-chart-4 font-medium">{stats.avgSpread}</span></span>
              <span>Max spread: <span className="text-chart-5 font-medium">{stats.maxSpread}</span></span>
            </div>
          )}
        </div>
        <div className="flex rounded-md shadow-sm bg-secondary/30 p-0.5">
          {['7D', '14D', '30D'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-1 text-xs font-medium transition-colors rounded ${
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
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-secondary/50 p-2 rounded">
            <p className="text-xs text-muted-foreground">Bid ({timeRange})</p>
            <p className={`text-sm font-semibold ${stats.bidChange >= 0 ? 'text-chart-3' : 'text-chart-5'}`}>
              {stats.bidChange >= 0 ? '+' : ''}{stats.bidChange.toFixed(2)} 
              <span className="text-xs ml-1">({stats.bidChangePercent}%)</span>
            </p>
          </div>
          <div className="bg-secondary/50 p-2 rounded">
            <p className="text-xs text-muted-foreground">Offer ({timeRange})</p>
            <p className={`text-sm font-semibold ${stats.offerChange >= 0 ? 'text-chart-3' : 'text-chart-5'}`}>
              {stats.offerChange >= 0 ? '+' : ''}{stats.offerChange.toFixed(2)}
              <span className="text-xs ml-1">({stats.offerChangePercent}%)</span>
            </p>
          </div>
          <div className="bg-secondary/50 p-2 rounded">
            <p className="text-xs text-muted-foreground">Latest</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-chart-1">Bid: <span className="font-medium">{filteredData[filteredData.length - 1]?.close_bid.toFixed(2)}</span></p>
              <p className="text-xs text-chart-2">Offer: <span className="font-medium">{filteredData[filteredData.length - 1]?.close_offer.toFixed(2)}</span></p>
            </div>
          </div>
        </div>
      )}
      
      <div className="h-52 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorBid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOffer" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis} 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              className="text-muted-foreground" 
              minTickGap={15}
            />
            <YAxis 
              yAxisId="left"
              domain={['auto', 'auto']} 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground" 
              width={35}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              dataKey="spread"
              domain={[0, 'dataMax + 1']}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground" 
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', bottom: -5 }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="close_bid"
              name="Bid"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fillOpacity={1}
              fill="none"
              activeDot={{ r: 4, strokeWidth: 1 }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="close_offer"
              name="Offer"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fillOpacity={1}
              fill="none"
              activeDot={{ r: 4, strokeWidth: 1 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground flex justify-between items-center">
        <p>Last updated: {new Date(filteredData[filteredData.length - 1]?.date).toLocaleString(undefined, { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        {stats && (
          <div className="text-xs flex items-center">
            <span className="inline-block w-2 h-2 bg-chart-3 rounded-full mr-1"></span>
            <span className="mr-2">Low spread</span>
            <span className="inline-block w-2 h-2 bg-chart-4 rounded-full mr-1"></span>
            <span className="mr-2">Avg spread</span>
            <span className="inline-block w-2 h-2 bg-chart-5 rounded-full mr-1"></span>
            <span>High spread</span>
          </div>
        )}
      </div>
    </div>
  );
}