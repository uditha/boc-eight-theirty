import React, { useState, useMemo } from 'react';

// Define value types that the component can handle
type ValueType = 'percentage' | 'currency' | 'number' | 'rate';

// Enhanced interface to support different data types
interface MarketItem {
  name: string;
  value: number;
  rawValue?: string; // For display purposes if needed
  change: number;
  percentChange: number;
  trend: 'up' | 'down' | 'unchanged';
  valueType: ValueType;
  // History data for sparkline
  history: number[];
  // Optional currency or unit
  unit?: string;
  // Optional benchmark or reference value (like Fed rate)
  benchmark?: number;
  benchmarkName?: string;
}

// Generic data record interface
interface DataRecord {
  record_date: string;
  [key: string]: string | number;
}

interface MetricDefinition {
  key: string;
  name: string;
  valueType: ValueType;
  unit?: string;
  benchmarkKey?: string;
  benchmarkName?: string;
  formatDecimals?: number;
}

// Updated interface to support both direct data and metric format
interface MarketIndicatorProps {
  title: string;
  data?: DataRecord[];
  liquidityData?: Array<{
    key: string;
    name: string;
    valueType: ValueType;
    formatDecimals?: number;
    data: Array<{ date: string; value: number }>;
  }>;
  metrics?: MetricDefinition[];
  historyPoints?: number;
}

// Format value based on its type
const formatValue = (value: number, type: ValueType, unit?: string, decimals: number = 2): string => {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(decimals)}%`;
    case 'currency':
      return `${unit || '$'}${value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}`;
    case 'rate':
      return `${value.toFixed(decimals)}${unit ? ` ${unit}` : ''}`;
    case 'number':
      if (value >= 1000) {
        return value.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
      }
      return value.toFixed(decimals);
    default:
      return `${value}`;
  }
};

// Format change value
const formatChange = (change: number, percentChange: number, type: ValueType, decimals: number = 2): string => {
  const prefix = change >= 0 ? '+' : '';
  
  switch (type) {
    case 'percentage':
      return `${prefix}${change.toFixed(decimals)}%`;
    case 'currency':
      return `${prefix}${change.toFixed(decimals)}`;
    case 'rate':
      return `${prefix}${change.toFixed(decimals)}`;
    case 'number':
      if (Math.abs(change) >= 1000) {
        return `${prefix}${change.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        })}`;
      }
      return `${prefix}${change.toFixed(decimals)}`;
    default:
      return `${prefix}${change.toFixed(decimals)}`;
  }
};

// Format percent change value
const formatPercentChange = (percentChange: number): string => {
  const prefix = percentChange >= 0 ? '+' : '';
  return `${prefix}${percentChange.toFixed(2)}%`;
};

const MarketIndicator: React.FC<MarketIndicatorProps> = ({ 
  title, 
  data, 
  metrics,
  liquidityData,
  historyPoints = 10
}) => {
  // Process market data with history for sparklines
  const marketData = useMemo(() => {
    // Handle the case where liquidityData is provided directly
    if (liquidityData && liquidityData.length > 0) {
      return liquidityData.map(metric => {
        if (!metric.data || metric.data.length < 2) {
          return {
            name: metric.name,
            value: 0,
            rawValue: formatValue(0, metric.valueType, undefined, metric.formatDecimals),
            change: 0,
            percentChange: 0,
            trend: 'unchanged',
            valueType: metric.valueType,
            history: [],
          } as MarketItem;
        }
        
        // Sort the data by date
        const sortedData = [...metric.data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Get latest and previous values
        const latestData = sortedData[sortedData.length - 1];
        const previousData = sortedData[sortedData.length - 2];
        
        const currentValue = Number(latestData.value);
        const previousValue = Number(previousData.value);
        
        // Extract historical values for sparkline
        const history = sortedData
          .slice(-historyPoints)
          .map(record => Number(record.value));
        
        // Calculate change
        const change = currentValue - previousValue;
        
        // Handle potential division by zero
        const safePercentChange = previousValue !== 0 
          ? (change / previousValue) * 100
          : 0;
        
        return {
          name: metric.name,
          value: currentValue,
          rawValue: formatValue(currentValue, metric.valueType, undefined, metric.formatDecimals),
          change: change,
          percentChange: safePercentChange,
          trend: currentValue > previousValue 
            ? 'up' 
            : currentValue < previousValue 
              ? 'down' 
              : 'unchanged',
          valueType: metric.valueType,
          history: history,
        } as MarketItem;
      });
    }
    
    // Original code for handling data and metrics
    if (!data || !metrics || data.length < 2) return [];
    
    // Sort data by date to ensure correct order
    const sortedData = [...data].sort(
      (a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime()
    );
    
    // Get latest and previous record for change calculations
    const latestData = sortedData[sortedData.length - 1];
    const previousData = sortedData[sortedData.length - 2];
    
    // Process each metric
    return metrics.map(metric => {
      // Get current and previous values
      const currentValue = Number(latestData[metric.key]);
      const previousValue = Number(previousData[metric.key]);
      
      // Extract historical values for this metric (for sparkline)
      const history = sortedData
        .slice(-historyPoints) // Use configured number of history points
        .map(record => Number(record[metric.key]));
      
      // Calculate change
      const change = currentValue - previousValue;
      
      // Handle potential division by zero
      const safePercentChange = previousValue !== 0 
        ? (change / previousValue) * 100
        : 0;

      // Get benchmark values if applicable
      const benchmarkValue = metric.benchmarkKey && latestData[metric.benchmarkKey] 
        ? Number(latestData[metric.benchmarkKey]) 
        : undefined;
      
      return {
        name: metric.name,
        value: currentValue,
        rawValue: formatValue(currentValue, metric.valueType, metric.unit, metric.formatDecimals),
        change: change,
        percentChange: safePercentChange,
        trend: currentValue > previousValue 
          ? 'up' 
          : currentValue < previousValue 
            ? 'down' 
            : 'unchanged',
        valueType: metric.valueType,
        unit: metric.unit,
        history: history,
        benchmark: benchmarkValue,
        benchmarkName: metric.benchmarkName
      } as MarketItem;
    });
  }, [data, metrics, liquidityData, historyPoints]);

  // State to track pagination
  const [currentPage, setCurrentPage] = useState(0);
  
  // Responsive items per page - can adjust based on screen size or preference
  const itemsPerPage = 6;
  
  // Calculate total pages
  const totalPages = Math.ceil(marketData.length / itemsPerPage);
  
  // Get current items
  const currentItems = marketData.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );
  
  // Navigation functions
  const goToPrevPage = () => {
    setCurrentPage(prev => (prev > 0 ? prev - 1 : totalPages - 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  // Function to render sparkline
  const renderSparkline = (history: number[], trend: string) => {
    if (!history || history.length < 2) return null;
    
    // Calculate min and max for scaling
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1; // Avoid division by zero
    
    // Calculate points for the sparkline
    const width = 60;
    const height = 20;
    const points = history.map((value, index) => {
      const x = (index / (history.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    // Determine line color based on trend
    const lineColor = trend === 'up' 
      ? 'var(--success, #10b981)' 
      : trend === 'down'
        ? 'var(--error, #ef4444)'
        : 'var(--muted, #9ca3af)';
    
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="ml-1">
        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Function to render comparison to benchmark if available
  const renderBenchmarkComparison = (item: MarketItem) => {
    if (!item.benchmark || item.benchmark === undefined) return null;

    const diff = item.value - item.benchmark;
    const isDiffPositive = diff >= 0;
    
    return (
      <div className="text-xs text-muted-foreground mt-1 flex items-center">
        <span>{item.benchmarkName || 'Benchmark'}: {formatValue(item.benchmark, item.valueType, item.unit)}</span>
        <span className="mx-1">|</span>
        <span className={isDiffPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
          {isDiffPositive ? '+' : ''}{formatValue(diff, item.valueType, null)}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full bg-card text-card-foreground rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-2 flex justify-between items-center">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            <button 
              onClick={goToPrevPage}
              className="rounded-full p-1 bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              aria-label="Previous page"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-medium text-muted-foreground">{currentPage + 1}/{totalPages}</span>
            <button 
              onClick={goToNextPage}
              className="rounded-full p-1 bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              aria-label="Next page"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Responsive grid layout for market items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-2">
        {currentItems.map((item, index) => (
          <div key={index} className="flex flex-col p-3 bg-background hover:bg-muted rounded-md border border-border transition-colors duration-200">
            <div className="flex items-center mb-2">
              {/* Trend icon */}
              <div className="flex-shrink-0 mr-2">
                {item.trend === 'up' ? (
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-1 flex items-center justify-center">
                    <svg className="w-2 h-2 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                ) : item.trend === 'down' ? (
                  <div className="rounded-full bg-rose-100 dark:bg-rose-900/30 p-1 flex items-center justify-center">
                    <svg className="w-2 h-2 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                ) : (
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center">
                    <svg className="w-2 h-2 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Metric name */}
              <h3 className="text-xs font-medium text-foreground truncate">{item.name}</h3>
            </div>
            
            {/* Main content area */}
            <div className="flex justify-between items-center">
              {/* Left column: Value and change info */}
              <div className="flex-1">
                {/* Current value */}
                <div className="text-sm font-bold mb-1">{item.rawValue}</div>
                
                {/* Change and percentage change */}
                <div className="flex items-center text-xs">
                  <span className={`font-medium ${
                    item.trend === 'up' 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : item.trend === 'down' 
                        ? 'text-rose-600 dark:text-rose-400' 
                        : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {formatChange(item.change, item.percentChange, item.valueType)}
                  </span>
                  <span className="mx-1 text-muted-foreground text-xs">|</span>
                  <span className={`font-medium ${
                    item.trend === 'up' 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : item.trend === 'down' 
                        ? 'text-rose-600 dark:text-rose-400' 
                        : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {formatPercentChange(item.percentChange)}
                  </span>
                </div>
                
                {/* Benchmark comparison if available */}
                {renderBenchmarkComparison(item)}
              </div>
              
              {/* Right column: Sparkline */}
              <div className="flex-shrink-0 ml-2">
                {renderSparkline(item.history, item.trend)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketIndicator;