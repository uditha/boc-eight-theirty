import React, { useMemo, useState } from 'react';
import { DollarSign, Euro, PoundSterling, CircleDollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// Currency icon mapping
const currencyIcons = {
  USD: DollarSign,
  EUR: Euro,
  GBP: PoundSterling,
  AUD: CircleDollarSign,
};

// Colors from the theme
const currencyColors = {
  USD: 'var(--chart-1)',  // From theme
  EUR: 'var(--chart-2)',  // From theme
  GBP: 'var(--chart-3)',  // From theme
  AUD: 'var(--chart-4)',  // From theme
};

const CurrencyRow = ({ currency, balance, rate, onSelect, isSelected }) => {
  const Icon = currencyIcons[currency] || CircleDollarSign;
  const formattedBalance = parseFloat(balance).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return (
    <tr 
      className={`border-b border-border transition-colors cursor-pointer ${isSelected ? 'bg-accent/10' : 'hover:bg-accent/5'}`}
      onClick={() => onSelect(currency)}
    >
      <td className="py-1.5 pl-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-accent/10">
          <Icon size={12} className="text-muted-foreground" />
        </div>
      </td>
      <td className="py-1.5 pl-2">
        <p className="font-medium text-sm">{currency}</p>
      </td>
      <td className="py-1.5 px-4 text-right">
        <p className="font-semibold text-sm">{formattedBalance}</p>
      </td>
      <td className="py-1.5 px-4 text-center">
        <p className="text-xs text-muted-foreground">{rate}</p>
      </td>
    </tr>
  );
};

const BankFCYLiquidity = ({data}) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  
  const demoData = data || [];
  const sortedData = useMemo(() => {
    return [...demoData].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [demoData]);
  
  const latestData = sortedData.length > 0 ? sortedData[sortedData.length - 1] : null;
  
  if (!latestData) {
    return <Card><CardContent>No data available</CardContent></Card>;
  }
  
  // Get last 30 days of data or all data if less than 30 days
  const last30DaysData = sortedData.slice(-30);
  
  const extractHistory = (key) => {
    return last30DaysData.map(item => ({
      date: item.date,
      value: parseFloat(item[key])
    }));
  };
  
  const currencies = [
    {
      code: 'USD',
      balance: latestData.usd_bal,
      rate: latestData.usd_rate,
      history: extractHistory('usd_bal')
    },
    {
      code: 'EUR',
      balance: latestData.eur_bal,
      rate: latestData.eur_rate,
      history: extractHistory('eur_bal')
    },
    {
      code: 'GBP',
      balance: latestData.gbp_bal,
      rate: latestData.gbp_rate,
      history: extractHistory('gbp_bal')
    },
    {
      code: 'AUD',
      balance: latestData.aud_bal,
      rate: latestData.aud_rate,
      history: extractHistory('aud_bal')
    }
  ];

  // Find current selected currency data
  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);
  const chartData = selectedCurrencyData ? selectedCurrencyData.history : [];
  const chartColor = currencyColors[selectedCurrency];

  // Format dates for the x-axis
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="overflow-hidden transition-colors">
      <CardHeader className="py-2">
        <h2 className="text-sm font-semibold">Bank Foreign Currency Liquidity</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Daily summary of available foreign currency balances and investment trends</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="py-1.5 pl-3 w-8"></th>
                <th className="py-1.5 pl-2">Currency</th>
                <th className="py-1.5 px-4 text-right">Balance(Mn)</th>
                <th className="py-1.5 px-4 text-center">Rate</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map(currency => (
                <CurrencyRow
                  key={currency.code}
                  currency={currency.code}
                  balance={currency.balance}
                  rate={currency.rate}
                  onSelect={setSelectedCurrency}
                  isSelected={currency.code === selectedCurrency}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Area Chart for Selected Currency */}
        <div className="pl-3 pr-6 py-2">
          <div className="text-xs font-medium text-muted-foreground mb-1 pl-2">
            {selectedCurrency} Investment Trend
          </div>
          
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ top: 0, right: 5, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id={`color${selectedCurrency}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate} 
                  tick={{ fontSize: 9 }}
                  tickMargin={5}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 9 }}
                  tickMargin={5}
                  axisLine={false}
                  tickLine={false}
                  domain={[(dataMin) => dataMin * 0.98, (dataMax) => dataMax * 1.02]}
                  allowDataOverflow={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(24, 24, 27, 0.9)',
                    border: 'none',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: '#e4e4e7' }}
                  labelStyle={{ 
                    color: '#a1a1aa', 
                    fontWeight: 500,
                    marginBottom: '4px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [
                    `${value.toLocaleString()}`, 
                    `${selectedCurrency} Balance`
                  ]}
                  labelFormatter={(date) => `${formatDate(date)}, ${new Date(date).getFullYear()}`}
                  cursor={{ stroke: currencyColors[selectedCurrency], strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chartColor} 
                  fillOpacity={1}
                  fill={`url(#color${selectedCurrency})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankFCYLiquidity;