import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { extractTimeSeriesData } from '@/utils/dataTransformers';
import Heading from '@/components/heading';
import { ArrowUp, ArrowDown } from "lucide-react";

interface USDPaymentsProps {
  data: any[];
  title?: string;
  description?: string;
}

const USDPayments: React.FC<USDPaymentsProps> = ({
  data,
  title = "Bank USD Payments",
  description = "Analysis by Department"
}) => {
  // Define departments with theme colors
  const departments = [
    { key: 'import', name: 'Import', color: 'var(--chart-1)' },
    { key: 'pettha', name: 'Pettha', color: 'var(--chart-2)' },
    { key: 'fcbu', name: 'FCBU', color: 'var(--chart-3)' },
    { key: 'travel', name: 'Travel', color: 'var(--chart-4)' },
    { key: 'branch_import', name: 'Branch Import', color: 'var(--chart-5)' },
    { key: 'cpc_payments', name: 'CPC', color: 'var(--primary)' }
  ];

  // UI state
  const [selectedDept, setSelectedDept] = useState(departments[0].key);
  const [timeRange, setTimeRange] = useState(30);
  const [viewMode, setViewMode] = useState('daily'); // daily, monthly, yearly
  const [dataDebug, setDataDebug] = useState<any>(null);

  // Debug logging
  useEffect(() => {
    if (data && data.length > 0) {
      const sample = data[data.length - 1]; // Get the most recent record
      console.log('Sample data record:', sample);
      setDataDebug({
        hasData: data.length > 0,
        sampleRecord: sample,
        departmentFields: departments.map(dept => ({
          key: dept.key,
          exists: dept.key in sample,
          value: sample[dept.key],
          type: typeof sample[dept.key]
        }))
      });
    } else {
      console.log('No data available or empty array');
      setDataDebug({
        hasData: false,
        error: 'No data available'
      });
    }
  }, [data]);

  // Process and validate data
  const processedData = useMemo(() => {
    if (!Array.isArray(data)) {
      console.log('Data is not an array');
      return [];
    }
    
    // Try to identify the fields that might contain payment data
    if (data.length > 0) {
      const sample = data[0];
      console.log('Available fields in data:', Object.keys(sample));
    }
    
    return data
      .filter(item => 
        item && 
        typeof item === 'object' && 
        typeof item.record_date === 'string'
      )
      .sort((a, b) => {
        const dateA = new Date(a.record_date);
        const dateB = new Date(b.record_date);
        return dateA.getTime() - dateB.getTime();
      });
  }, [data]);
  
  // Apply time range filter
  const filteredData = useMemo(() => {
    if (processedData.length === 0) return [];
    
    const latestDate = new Date(processedData[processedData.length - 1].record_date);
    const cutoffDate = new Date(latestDate);
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    
    return processedData.filter(item => new Date(item.record_date) >= cutoffDate);
  }, [processedData, timeRange]);

  // Calculate department data
  const departmentData = useMemo(() => {
    return departments.map(dept => {
      // Get time series for each department
      const dataPoints = filteredData.map(item => {
        // Try to access the field directly or look for alternate field names
        let value = item[dept.key];
        
        // If value is undefined or not a number, try to find similar field names
        if (value === undefined || typeof value !== 'number') {
          // Look for case-insensitive matches
          const keys = Object.keys(item);
          const matchingKey = keys.find(k => 
            k.toLowerCase() === dept.key.toLowerCase() || 
            k.toLowerCase().includes(dept.key.toLowerCase())
          );
          
          if (matchingKey) {
            value = item[matchingKey];
          }
        }
        
        // Ensure value is a number
        const numValue = typeof value === 'number' ? value : 
                        typeof value === 'string' ? parseFloat(value) : 0;
        
        return {
          date: item.record_date,
          value: isNaN(numValue) ? 0 : numValue
        };
      });
      
      // Calculate statistics
      const total = dataPoints.reduce((sum, item) => sum + item.value, 0);
      const avg = dataPoints.length ? total / dataPoints.length : 0;
      const current = dataPoints.length ? dataPoints[dataPoints.length - 1].value : 0;
      const previous = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2].value : 0;
      const percentChange = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      
      // Weekly change
      let weekChange = 0;
      if (dataPoints.length >= 14) {
        const currentWeek = dataPoints.slice(-7).reduce((sum, item) => sum + item.value, 0);
        const previousWeek = dataPoints.slice(-14, -7).reduce((sum, item) => sum + item.value, 0);
        weekChange = previousWeek > 0 ? ((currentWeek - previousWeek) / previousWeek) * 100 : 0;
      }
      
      // Monthly change
      let monthChange = 0;
      if (dataPoints.length >= 60) {
        const currentMonth = dataPoints.slice(-30).reduce((sum, item) => sum + item.value, 0);
        const previousMonth = dataPoints.slice(-60, -30).reduce((sum, item) => sum + item.value, 0);
        monthChange = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
      }
      
      return {
        ...dept,
        data: dataPoints,
        total,
        avg,
        current,
        previous,
        percentChange,
        weekChange,
        monthChange
      };
    });
  }, [filteredData, departments]);

  // Get selected department data
  const selectedDepartment = useMemo(() => {
    return departmentData.find(dept => dept.key === selectedDept) || departmentData[0];
  }, [departmentData, selectedDept]);

  // Calculate monthly data for selected department
  const monthlyData = useMemo(() => {
    if (!selectedDepartment?.data?.length) return [];
    
    const monthMap = new Map();
    
    selectedDepartment.data.forEach(item => {
      if (!item.date) return;
      
      try {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, { 
            month: monthName, 
            value: 0, 
            date: monthKey,
            year: date.getFullYear(),
            monthNum: date.getMonth() + 1
          });
        }
        
        monthMap.get(monthKey).value += item.value || 0;
      } catch (e) {
        // Skip invalid dates
      }
    });
    
    return Array.from(monthMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedDepartment]);
  
  // Calculate yearly data for selected department
  const yearlyData = useMemo(() => {
    if (!selectedDepartment?.data?.length) return [];
    
    const yearMap = new Map();
    
    selectedDepartment.data.forEach(item => {
      if (!item.date) return;
      
      try {
        const date = new Date(item.date);
        const year = date.getFullYear();
        
        if (!yearMap.has(year)) {
          yearMap.set(year, { year, value: 0 });
        }
        
        yearMap.get(year).value += item.value || 0;
      } catch (e) {
        // Skip invalid dates
      }
    });
    
    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  }, [selectedDepartment]);

  // Calculate min/max values
  const { min, max } = useMemo(() => {
    if (!selectedDepartment?.data?.length) return { min: 0, max: 0 };
    
    const values = selectedDepartment.data
      .map(d => typeof d.value === 'number' ? d.value : 0)
      .filter(v => !isNaN(v));
    
    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0
    };
  }, [selectedDepartment]);

  // Format currency values
  const formatCurrency = (value) => {
    const numValue = Number(value);
    
    if (isNaN(numValue)) return '$0';
    
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(1)}K`;
    } else {
      return `$${numValue.toFixed(0)}`;
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    // Format the label based on view mode
    let formattedLabel = label;
    if (viewMode === 'yearly') {
      formattedLabel = `Year: ${label}`;
    } else if (viewMode === 'monthly') {
      formattedLabel = `Month: ${label}`;
    }
    
    return (
      <div className="bg-card text-card-foreground p-2 border border-border shadow-sm rounded-md text-xs">
        <p className="font-semibold">{formattedLabel}</p>
        <div className="mt-1">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: selectedDepartment.color }}
            />
            <span>{selectedDepartment.name}:</span>
            <span className="font-medium">
              {formatCurrency(payload[0].value)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // If no data is available
  if (!processedData.length) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <Heading title={title} description={description} />
        <div className="h-72 flex flex-col items-center justify-center text-muted-foreground">
          <p>No payment data available.</p>
          <div className="mt-4 p-4 bg-secondary/50 rounded text-xs max-w-lg">
            <p>Debug info:</p>
            <pre className="mt-2 overflow-auto max-h-40">
              {JSON.stringify(dataDebug, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-4">
        <Heading title={title} description={description} />
        <div className="flex gap-2">
          <div className="flex rounded-md overflow-hidden border border-border text-xs">
            <button 
              className={`px-2 py-1 ${viewMode === 'daily' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`} 
              onClick={() => setViewMode('daily')}
            >
              Daily
            </button>
            <button 
              className={`px-2 py-1 ${viewMode === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`} 
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`px-2 py-1 ${viewMode === 'yearly' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`} 
              onClick={() => setViewMode('yearly')}
            >
              Yearly
            </button>
          </div>
          <div className="flex rounded-md overflow-hidden border border-border text-xs">
            <button 
              className={`px-2 py-1 ${timeRange === 7 ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`} 
              onClick={() => setTimeRange(7)}
            >
              1W
            </button>
            <button 
              className={`px-2 py-1 ${timeRange === 30 ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`} 
              onClick={() => setTimeRange(30)}
            >
              1M
            </button>
            <button 
              className={`px-2 py-1 ${timeRange === 90 ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`} 
              onClick={() => setTimeRange(90)}
            >
              3M
            </button>
            <button 
              className={`px-2 py-1 ${timeRange === 360 ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`} 
              onClick={() => setTimeRange(360)}
            >
              1Y
            </button>
          </div>
        </div>
      </div>

      {/* Debug info - remove this in production */}
      {dataDebug && (
        <div className="mb-4 p-2 border border-border rounded bg-secondary/20 text-xs">
          <details>
            <summary className="cursor-pointer font-medium">Debug Information (click to expand)</summary>
            <div className="mt-2 overflow-auto max-h-40">
              <pre>{JSON.stringify(dataDebug, null, 2)}</pre>
            </div>
          </details>
        </div>
      )}
      
      {/* Department selector */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {departments.map((dept) => {
          const deptData = departmentData.find(d => d.key === dept.key) || { current: 0, percentChange: 0 };
          return (
            <button
              key={dept.key}
              className={`border ${selectedDept === dept.key ? 'border-primary' : 'border-border'} rounded p-2 bg-card text-left hover:border-primary transition-colors`}
              onClick={() => setSelectedDept(dept.key)}
            >
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }}></div>
                <span className="text-xs font-medium truncate">{dept.name}</span>
              </div>
              <div className="text-sm font-semibold">
                {formatCurrency(deptData.current)}
              </div>
              <div className={`text-xs flex items-center ${deptData.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {deptData.percentChange >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-0.5" />
                )}
                {Math.abs(deptData.percentChange).toFixed(1)}%
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Department Details */}
      {selectedDepartment && (
        <div className="mb-4 p-3 border border-border rounded-md">
          <div className="flex items-center mb-2">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: selectedDepartment.color }}
            ></div>
            <h3 className="font-medium">{selectedDepartment.name} Payments</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-1">
            <div>
              <div className="text-xs text-muted-foreground">Today</div>
              <div className="text-lg font-semibold">{formatCurrency(selectedDepartment.current)}</div>
              <div className={`text-xs flex items-center ${selectedDepartment.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {selectedDepartment.percentChange >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-0.5" />
                )}
                {Math.abs(selectedDepartment.percentChange).toFixed(1)}% from yesterday
              </div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground">Weekly Average</div>
              <div className="text-lg font-semibold">{formatCurrency(selectedDepartment.avg * 7)}</div>
              {selectedDepartment.weekChange !== 0 && (
                <div className={`text-xs flex items-center ${selectedDepartment.weekChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedDepartment.weekChange >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(selectedDepartment.weekChange).toFixed(1)}% week-over-week
                </div>
              )}
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground">Monthly Total</div>
              <div className="text-lg font-semibold">{formatCurrency(selectedDepartment.total)}</div>
              {selectedDepartment.monthChange !== 0 && (
                <div className={`text-xs flex items-center ${selectedDepartment.monthChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedDepartment.monthChange >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(selectedDepartment.monthChange).toFixed(1)}% month-over-month
                </div>
              )}
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground">Daily Average</div>
              <div className="text-lg font-semibold">{formatCurrency(selectedDepartment.avg)}</div>
              <div className="text-xs text-muted-foreground">
                Range: {formatCurrency(min)} - {formatCurrency(max)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Chart */}
      <div className="h-72">
        {viewMode === 'daily' && selectedDepartment?.data?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={selectedDepartment.data}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={50}
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
              />
              <YAxis 
                stroke="var(--muted-foreground)"
                tickFormatter={formatCurrency} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={selectedDepartment.color} 
                fill={selectedDepartment.color} 
                fillOpacity={0.2}
                activeDot={{ r: 6 }} 
                name={selectedDepartment.name}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : viewMode === 'monthly' && monthlyData?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
                height={50}
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
              />
              <YAxis 
                stroke="var(--muted-foreground)"
                tickFormatter={formatCurrency} 
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), selectedDepartment.name]} 
              />
              <Bar 
                dataKey="value" 
                fill={selectedDepartment.color}
                name={selectedDepartment.name}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : viewMode === 'yearly' && yearlyData?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={yearlyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="year" 
                height={50}
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
              />
              <YAxis 
                stroke="var(--muted-foreground)"
                tickFormatter={formatCurrency} 
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), selectedDepartment.name]} 
              />
              <Bar 
                dataKey="value" 
                fill={selectedDepartment.color}
                name={selectedDepartment.name}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Insufficient data to display chart.
          </div>
        )}
      </div>
    </div>
  );
};

export default USDPayments;