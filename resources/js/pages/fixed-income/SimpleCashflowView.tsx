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

  // Helper function to identify instrument type
  const getInstrumentType = useCallback((item) => {
    // If coupon is "TB", it's a Treasury Bill
    return item.coupon === "TB" ? 'tbill' : 'tbond';
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

  // Group cashflows by time period and instrument type
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

      // Separate T-Bills from T-Bonds
      const tbills = weekItems.filter(item => getInstrumentType(item) === 'tbill');
      const tbonds = weekItems.filter(item => getInstrumentType(item) === 'tbond');

      weekly.push({
        period: `Week ${i + 1}`,
        startDate: weekStart.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' }),
        endDate: weekEnd.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' }),
        coupon: tbonds.reduce((sum, item) => sum + safeNumber(item.coupon_amount), 0),
        capital: tbonds.reduce((sum, item) => sum + safeNumber(item.capital), 0),
        tbill: tbills.reduce((sum, item) => sum + safeNumber(item.capital), 0), // T-Bills only have capital
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

      // Separate T-Bills from T-Bonds
      const tbills = monthItems.filter(item => getInstrumentType(item) === 'tbill');
      const tbonds = monthItems.filter(item => getInstrumentType(item) === 'tbond');

      monthlyMap[monthKey] = {
        period: `${monthStart.toLocaleString('en-LK', { month: 'short' })}-${String(targetYear).slice(2)}`,
        monthKey,
        coupon: tbonds.reduce((sum, item) => sum + safeNumber(item.coupon_amount), 0),
        capital: tbonds.reduce((sum, item) => sum + safeNumber(item.capital), 0),
        tbill: tbills.reduce((sum, item) => sum + safeNumber(item.capital), 0), // T-Bills only have capital
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
          tbill: 0,
          items: []
        };
      }

      // Add to appropriate category based on instrument type
      const isTBill = getInstrumentType(item) === 'tbill';

      if (isTBill) {
        annualMap[periodKey].tbill += safeNumber(item.capital);
      } else {
        annualMap[periodKey].coupon += safeNumber(item.coupon_amount);
        annualMap[periodKey].capital += safeNumber(item.capital);
      }

      annualMap[periodKey].items.push(item);
    });

    const annual = Object.values(annualMap)
      .sort((a, b) => a.sortKey - b.sortKey);

    return { weekly, monthly, annual };
  }, [filteredData, getInstrumentType]);

  // Calculate total values based on filtered data
  const totalValues = useMemo(() => {
    const tbills = filteredData.filter(item => getInstrumentType(item) === 'tbill');
    const tbonds = filteredData.filter(item => getInstrumentType(item) === 'tbond');

    const totalCoupon = tbonds.reduce((sum, item) => sum + safeNumber(item.coupon_amount), 0);
    const totalCapital = tbonds.reduce((sum, item) => sum + safeNumber(item.capital), 0);
    const totalTBill = tbills.reduce((sum, item) => sum + safeNumber(item.capital), 0);

    const total = totalCoupon + totalCapital + totalTBill;

    // Calculate percentages for the composition indicator
    const totalCouponPercentage = total > 0 ? (totalCoupon / total) * 100 : 0;
    const totalCapitalPercentage = total > 0 ? (totalCapital / total) * 100 : 0;
    const totalTBillPercentage = total > 0 ? (totalTBill / total) * 100 : 0;

    return {
      coupon: formatCurrency(totalCoupon),
      capital: formatCurrency(totalCapital),
      tbill: formatCurrency(totalTBill),
      total: formatCurrency(total),
      totalCouponPercentage,
      totalCapitalPercentage,
      totalTBillPercentage
    };
  }, [filteredData, getInstrumentType]);

  // Calculate trends based on filter
  const { couponTrend, capitalTrend } = useMemo(() => {
    const periods = cashflows[view];

    if (!periods || periods.length < 2) {
      return { couponTrend: 0, capitalTrend: 0 };
    }

    const currentPeriod = periods[0]; // First period is the most recent in our view
    const previousPeriod = periods[1]; // Second period is the previous one

    const couponTrend = previousPeriod.coupon === 0 ? 0 :
      ((currentPeriod.coupon - previousPeriod.coupon) / previousPeriod.coupon) * 100;

    const capitalTrend = previousPeriod.capital === 0 ? 0 :
      ((currentPeriod.capital - previousPeriod.capital) / previousPeriod.capital) * 100;

    return { couponTrend, capitalTrend };
  }, [cashflows, view]);

  // Define instrument types with theme colors
  const instruments = [
    { key: 'all', name: 'All Government Securities', color: 'var(--primary)' },
    { key: 'tbill', name: 'Treasury Bills', color: 'var(--chart-1, #4338ca)' },
    { key: 'tbond', name: 'Treasury Bonds', color: 'var(--chart-2, #0891b2)' }
  ];

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Find values for each category (using 0 as default if not present)
      const couponValue = payload.find(p => p.dataKey === 'coupon')?.value || 0;
      const capitalValue = payload.find(p => p.dataKey === 'capital')?.value || 0;
      const tbillValue = payload.find(p => p.dataKey === 'tbill')?.value || 0;
      const totalValue = couponValue + capitalValue + tbillValue;

      return (
        <div className="bg-card text-card-foreground p-3 rounded-lg shadow-lg border border-border">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">Bond Coupon:</span>
            <span className="font-medium text-right">{formatCurrency(couponValue)}</span>

            <span className="text-muted-foreground">Bond Principal:</span>
            <span className="font-medium text-right">{formatCurrency(capitalValue)}</span>

            <span className="text-muted-foreground">T-Bill Maturity:</span>
            <span className="font-medium text-right">{formatCurrency(tbillValue)}</span>

            <span className="text-muted-foreground font-semibold border-t border-border pt-1 mt-1">Total:</span>
            <span className="font-semibold text-right border-t border-border pt-1 mt-1">{formatCurrency(totalValue)}</span>
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
      <div className="bg-card text-card-foreground p-4 sm:p-6 rounded-lg shadow-sm border border-border">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            {instruments.map((instrument) => (
              <button
                key={instrument.key}
                className={`border ${instrumentFilter === instrument.key ? 'border-primary bg-primary/5' : 'border-border'} rounded-lg p-3 bg-card text-left hover:border-primary transition-colors`}
                onClick={() => setInstrumentFilter(instrument.key)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: instrument.color }}
                  ></div>
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
        <div className="mb-6 p-4 border border-border rounded-lg bg-card/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-md bg-card border border-border">
              <div className="text-xs text-muted-foreground mb-1">Total Cashflow</div>
              <div className="text-lg font-semibold">{totalValues.total}</div>
              <div className="text-xs text-muted-foreground mt-1">
                For {instrumentFilter === 'all' ? 'all instruments' :
                  instrumentFilter === 'tbill' ? 'Treasury Bills' : 'Treasury Bonds'}
              </div>
            </div>

            <div className="p-3 rounded-md bg-card border border-border">
              <div className="text-xs text-muted-foreground mb-1">Coupon Payments</div>
              <div className="text-lg font-semibold">{totalValues.coupon}</div>
              <div className={`text-xs flex items-center gap-1 mt-1 ${couponTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {couponTrend !== 0 && (
                  <>
                    {couponTrend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    <span>{Math.abs(couponTrend).toFixed(1)}% from previous period</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 rounded-md bg-card border border-border">
              <div className="text-xs text-muted-foreground mb-1">Capital Repayments</div>
              <div className="text-lg font-semibold">{totalValues.capital}</div>
              <div className={`text-xs flex items-center gap-1 mt-1 ${capitalTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {capitalTrend !== 0 && (
                  <>
                    {capitalTrend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    <span>{Math.abs(capitalTrend).toFixed(1)}% from previous period</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 rounded-md bg-card border border-border">
              <div className="text-xs text-muted-foreground mb-1">T-Bill Repayments</div>
              <div className="text-lg font-semibold">{totalValues.tbill}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Treasury Bills (Discount Securities)
              </div>
            </div>
          </div>

          {/* Composition Indicator */}
          <div className="mt-4 px-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Coupon: {totalValues.totalCouponPercentage.toFixed(1)}%</span>
              <span>Capital: {totalValues.totalCapitalPercentage.toFixed(1)}%</span>
              <span>T-Bills: {totalValues.totalTBillPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[var(--chart-1,#4338ca)]"
                style={{ width: `${totalValues.totalCouponPercentage}%` }}
              ></div>
              <div
                className="h-full bg-[var(--chart-2,#0891b2)]"
                style={{ width: `${totalValues.totalCapitalPercentage}%` }}
              ></div>
              <div
                className="h-full bg-[var(--chart-3,#f59e0b)]"
                style={{ width: `${totalValues.totalTBillPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="h-80 mb-4">
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
                  angle={view === 'weekly' ? -45 : 0}
                  textAnchor={view === 'weekly' ? "end" : "middle"}
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
                  name="Bond Coupon"
                  fill="var(--chart-1, #4338ca)"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                  fillOpacity={0.85}
                />
                <Bar
                  dataKey="capital"
                  name="Bond Principal"
                  fill="var(--chart-2, #0891b2)"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                  fillOpacity={0.85}
                />
                <Bar
                  dataKey="tbill"
                  name="T-Bill Maturity"
                  fill="var(--chart-3, #f59e0b)"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20 text-muted-foreground">
              <div className="text-center p-6">
                <p className="text-sm mb-2">No cashflow data available for the selected filters.</p>
                <p className="text-xs">Try changing the instrument type or time period.</p>
              </div>
            </div>
          )}
        </div>

        {/* View Description */}
        <div className="text-xs text-muted-foreground text-center">
          {view === 'weekly' ? 'Weekly view shows cashflows for the next 12 weeks from today' :
           view === 'monthly' ? 'Monthly view shows cashflows for the next 12 months from today' :
           'Annual view shows cashflows for the next 10 years with long-term cashflows grouped'}
        </div>
      </div>
    </div>
  );
};

export default SimpleCashflowView;
