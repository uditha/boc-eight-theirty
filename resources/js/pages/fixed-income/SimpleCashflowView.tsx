import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUp, ArrowDown } from "lucide-react";

const SimpleCashflowView = ({ fixedIncomeData }) => {
  const [view, setView] = useState('annual');
  const [instrumentFilter, setInstrumentFilter] = useState('all');
  
  // Format currency values in LKR billions
  const formatCurrency = (amount) => {
    const numValue = Number(amount);
    
    if (isNaN(numValue)) return 'LKR 0';
    
    if (numValue >= 1000000000) {
      return `LKR ${(numValue / 1000000000).toFixed(1)}Bn`;
    } else if (numValue >= 1000000) {
      return `LKR ${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `LKR ${(numValue / 1000).toFixed(1)}K`;
    } else {
      return `LKR ${numValue.toFixed(0)}`;
    }
  };

  // Safe number conversion function to handle NaN values
  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Determine if an item is a T-Bill or T-Bond based on coupon field
  const getInstrumentType = useCallback((item) => {
    // Assuming Treasury Bills have "TB" in the coupon field
    if (item.coupon === "TB" || item.coupon === "tb") {
      return "tbill";
    }
    // Everything else is considered a T-Bond
    return "tbond";
  }, []);

  // Filter data based on selected instrument type
  const filteredData = useMemo(() => {
    if (instrumentFilter === 'all') {
      return fixedIncomeData;
    }
    
    return fixedIncomeData.filter(item => 
      getInstrumentType(item) === instrumentFilter
    );
  }, [fixedIncomeData, instrumentFilter, getInstrumentType]);

  // Group cashflows by time period
  const cashflows = useMemo(() => {
    // Sort data by cashflow date
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.cf_date) - new Date(b.cf_date)
    );

    // Get current date for calculations
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Weekly cashflows (next 12 weeks)
    const weekly = [];
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekItems = sortedData.filter(item => {
        const cfDate = new Date(item.cf_date);
        return cfDate >= weekStart && cfDate <= weekEnd;
      });
      
      weekly.push({
        period: `Week ${i + 1}`,
        startDate: weekStart.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' }),
        endDate: weekEnd.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' }),
        coupon: weekItems.reduce((sum, item) => sum + safeNumber(item.coupon_amount), 0),
        capital: weekItems.reduce((sum, item) => sum + safeNumber(item.capital), 0),
        items: weekItems
      });
    }
    
    // Monthly cashflows (next 12 months)
    const monthlyMap = {};
    const startMonth = currentDate.getMonth();
    const startYear = currentDate.getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const targetMonth = (startMonth + i) % 12;
      const targetYear = startYear + Math.floor((startMonth + i) / 12);
      const monthKey = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
      
      const monthStart = new Date(targetYear, targetMonth, 1);
      const monthEnd = new Date(targetYear, targetMonth + 1, 0); // Last day of month
      
      const monthItems = sortedData.filter(item => {
        const cfDate = new Date(item.cf_date);
        return cfDate >= monthStart && cfDate <= monthEnd;
      });
      
      monthlyMap[monthKey] = {
        period: `${monthStart.toLocaleString('en-LK', { month: 'short' })}-${String(targetYear).slice(2)}`,
        monthKey,
        coupon: monthItems.reduce((sum, item) => sum + safeNumber(item.coupon_amount), 0),
        capital: monthItems.reduce((sum, item) => sum + safeNumber(item.capital), 0),
        items: monthItems
      };
    }
    
    const monthly = Object.values(monthlyMap)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    
    // Annual cashflows with 10-year bucketing
    const annualMap = {};
    const futureYearsLimit = currentYear + 9; // 10 years including current year
    
    sortedData.forEach(item => {
      const cfDate = new Date(item.cf_date);
      const year = cfDate.getFullYear();
      
      // Determine the period key - either the year or "After XXXX"
      let periodKey;
      let periodLabel;
      
      if (year <= futureYearsLimit) {
        periodKey = `${year}`;
        periodLabel = `${year}`;
      } else {
        periodKey = 'beyond';
        periodLabel = `After ${futureYearsLimit}`;
      }
      
      if (!annualMap[periodKey]) {
        annualMap[periodKey] = {
          period: periodLabel,
          sortKey: year <= futureYearsLimit ? year : 9999, // For sorting
          coupon: 0,
          capital: 0,
          items: []
        };
      }
      
      annualMap[periodKey].coupon += safeNumber(item.coupon_amount);
      annualMap[periodKey].capital += safeNumber(item.capital);
      annualMap[periodKey].items.push(item);
    });
    
    const annual = Object.values(annualMap)
      .sort((a, b) => a.sortKey - b.sortKey);
    
    return { weekly, monthly, annual };
  }, [filteredData]);

  // Calculate total values for the header
  const totalValues = useMemo(() => {
    const totalCoupon = filteredData.reduce((sum, item) => sum + safeNumber(item.coupon_amount), 0);
    const totalCapital = filteredData.reduce((sum, item) => sum + safeNumber(item.capital), 0);
    const totalCashflow = totalCoupon + totalCapital;
    
    return {
      coupon: formatCurrency(totalCoupon),
      capital: formatCurrency(totalCapital),
      total: formatCurrency(totalCashflow)
    };
  }, [filteredData]);

  // Calculate coupon/capital percentages
  const { totalCouponPercentage, totalCapitalPercentage } = useMemo(() => {
    const totalCoupon = filteredData.reduce((sum, item) => sum + safeNumber(item.coupon_amount), 0);
    const totalCapital = filteredData.reduce((sum, item) => sum + safeNumber(item.capital), 0);
    const totalCashflow = totalCoupon + totalCapital;
    
    if (totalCashflow === 0) return { totalCouponPercentage: 0, totalCapitalPercentage: 0 };
    
    return {
      totalCouponPercentage: (totalCoupon / totalCashflow) * 100,
      totalCapitalPercentage: (totalCapital / totalCashflow) * 100
    };
  }, [filteredData]);

  // Calculate trends based on filter
  const { couponTrend, capitalTrend } = useMemo(() => {
    const periods = cashflows[view];
    
    if (!periods || periods.length < 2) {
      return { couponTrend: 0, capitalTrend: 0 };
    }
    
    const currentPeriod = periods[periods.length - 1];
    const previousPeriod = periods[periods.length - 2];
    
    const couponTrend = previousPeriod.coupon === 0 ? 0 : 
      ((currentPeriod.coupon - previousPeriod.coupon) / previousPeriod.coupon) * 100;
    
    const capitalTrend = previousPeriod.capital === 0 ? 0 : 
      ((currentPeriod.capital - previousPeriod.capital) / previousPeriod.capital) * 100;
    
    return { couponTrend, capitalTrend };
  }, [cashflows, view]);
  
  // Define instrument types with theme colors
  const instruments = [
    { key: 'all', name: 'All Govrnment Security', color: 'var(--primary)' },
    { key: 'tbill', name: 'Treasury Bill', color: 'var(--chart-1, #4338ca)' },
    { key: 'tbond', name: 'Treasury Bond', color: 'var(--chart-2, #0891b2)' }
  ];
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const couponValue = payload[0]?.value || 0;
      const capitalValue = payload[1]?.value || 0;
      const totalValue = couponValue + capitalValue;
      
      return (
        <div className="bg-card text-card-foreground p-3 rounded-lg shadow-lg border border-border">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {couponValue > 0 && (
              <>
                <span className="text-muted-foreground">Coupon:</span>
                <span className="font-medium text-right">{formatCurrency(couponValue)}</span>
              </>
            )}
            
            {capitalValue > 0 && (
              <>
                <span className="text-muted-foreground">Capital:</span>
                <span className="font-medium text-right">{formatCurrency(capitalValue)}</span>
              </>
            )}
            
            <span className="text-muted-foreground font-semibold">Total:</span>
            <span className="font-semibold text-right">{formatCurrency(totalValue)}</span>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Chart data
  const viewData = cashflows[view] || [];
  
  return (
    <div className="w-full">
      <div className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border border-border">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Fixed Income Cashflows</h2>
            
            {/* Controls Section */}
            <div className="flex gap-2">
              <div className="flex rounded-md overflow-hidden border border-border text-xs">
                <button 
                  className={`px-3 py-1.5 font-medium transition-all ${view === 'weekly' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                  onClick={() => setView('weekly')}
                >
                  Weekly
                </button>
                <button 
                  className={`px-3 py-1.5 font-medium transition-all ${view === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                  onClick={() => setView('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`px-3 py-1.5 font-medium transition-all ${view === 'annual' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                  onClick={() => setView('annual')}
                >
                  Annual
                </button>
              </div>
            </div>
          </div>
          
          {/* Instrument Selector */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {instruments.map((instrument) => (
              <button
                key={instrument.key}
                className={`border ${instrumentFilter === instrument.key ? 'border-primary' : 'border-border'} rounded p-2 bg-card text-left hover:border-primary transition-colors`}
                onClick={() => setInstrumentFilter(instrument.key)}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs font-medium truncate">{instrument.name}</span>
                </div>
                {instrument.key === 'all' ? (
                  <div className="text-sm font-semibold">
                    {totalValues.total}
                  </div>
                ) : instrument.key === 'tbill' ? (
                  <div className="text-sm font-semibold">
                    {formatCurrency(filteredData
                      .filter(item => getInstrumentType(item) === 'tbill')
                      .reduce((sum, item) => sum + safeNumber(item.coupon_amount) + safeNumber(item.capital), 0)
                    )}
                  </div>
                ) : (
                  <div className="text-sm font-semibold">
                    {formatCurrency(filteredData
                      .filter(item => getInstrumentType(item) === 'tbond')
                      .reduce((sum, item) => sum + safeNumber(item.coupon_amount) + safeNumber(item.capital), 0)
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="mb-4 p-3 border border-border rounded-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-1">
            <div>
              <div className="text-xs text-muted-foreground">Total Cashflow</div>
              <div className="text-lg font-semibold">{totalValues.total}</div>
              <div className="text-xs text-muted-foreground">
                For {instrumentFilter === 'all' ? 'all instruments' : 
                  instrumentFilter === 'tbill' ? 'Treasury Bills' : 'Treasury Bonds'}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground">Coupon Payments</div>
              <div className="text-lg font-semibold">{totalValues.coupon}</div>
              <div className={`text-xs flex items-center ${couponTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground">Capital Repayments</div>
              <div className="text-lg font-semibold">{totalValues.capital}</div>
              <div className={`text-xs flex items-center ${capitalTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground">View</div>
              <div className="text-lg font-semibold">
                {view === 'weekly' ? 'Next 12 weeks' : 
                 view === 'monthly' ? 'Next 12 months' : 
                 'Next 10 years'}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Section */}
        <div className="h-80 mb-6">
          {viewData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={viewData}
                margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                barGap={0}
                barCategoryGap="15%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="period" 
                  angle={0} 
                  textAnchor="middle" 
                  height={50}
                  tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value/1000000000).toFixed(1)}B`} 
                  tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{value}</span>
                  )}
                />
                <Bar 
                  dataKey="coupon" 
                  name="Coupon" 
                  fill="var(--chart-1, #4338ca)" 
                  stackId="a" 
                  radius={[0, 0, 0, 0]}
                  fillOpacity={0.85}
                />
                <Bar 
                  dataKey="capital" 
                  name="Capital" 
                  fill="var(--chart-2, #0891b2)" 
                  stackId="a" 
                  radius={[2, 2, 0, 0]}
                  fillOpacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No cashflow data available for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleCashflowView;