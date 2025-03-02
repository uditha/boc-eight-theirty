import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Globe, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  CircleDollarSign, 
  BarChart3 
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Country flag/icon mapping
const countryIcons = {
  USA: DollarSign,
  UK: PoundSterling,
  EU: Euro,
  Australia: CircleDollarSign,
  India: CircleDollarSign,
  Japan: CircleDollarSign,
  China: CircleDollarSign,
};

// Rate name formatting/mapping
const rateNames = {
  fed_fund_rate: "Federal Funds Rate",
  uk_bank_rate: "Bank Rate",
  ecb_rate: "Deposit Facility Rate",
  aus_cash_rate: "Cash Rate",
  india_repo_rate: "Repo Rate",
  japan_rate: "Policy Rate",
  china_rate: "Loan Prime Rate",
};

// Country name mapping from rate keys
const rateToCountry = {
  fed_fund_rate: "USA",
  uk_bank_rate: "UK",
  ecb_rate: "EU",
  aus_cash_rate: "Australia",
  india_repo_rate: "India",
  japan_rate: "Japan",
  china_rate: "China",
};

// Flag emoji mapping
const countryFlags = {
  USA: "🇺🇸",
  UK: "🇬🇧",
  EU: "🇪🇺",
  Australia: "🇦🇺",
  India: "🇮🇳",
  Japan: "🇯🇵",
  China: "🇨🇳",
};

// Colors for trend indicators
const trendColors = {
  up: '#10b981', // Green
  down: '#ef4444', // Red
  unchanged: '#9ca3af', // Gray
};

// Consistent background for all rows
const rowBackground = "bg-gray-50 dark:bg-gray-800/20";

// Sample historical data for trends
const sampleHistoricalData = {
  fed_fund_rate: [5.25, 5.25, 5.50, 5.50, 5.25],
  uk_bank_rate: [5.00, 5.00, 5.25, 5.25, 5.00],
  ecb_rate: [3.75, 3.75, 4.00, 4.00, 3.75],
  aus_cash_rate: [4.10, 4.10, 4.35, 4.35, 4.10],
  india_repo_rate: [6.50, 6.50, 6.50, 6.75, 6.50],
  japan_rate: [0.25, 0.25, 0.25, 0.10, 0.10],
  china_rate: [3.45, 3.45, 3.45, 3.55, 3.45],
};

const RateRow = ({ countryCode, rateName, rateValue, historical }) => {
  const Icon = countryIcons[countryCode] || Globe;
  
  // Format rate to show 2 decimal places
  const formattedRate = rateValue.toFixed(2) + '%';
  
  // Calculate change using the last 30 days of history
  const lastValue = historical[historical.length - 1];
  const firstValue = historical[0];
  const change = lastValue - firstValue;
  const percentChange = (change / firstValue) * 100;
  
  // Determine trend based on history
  const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'unchanged';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trendColors[trend];
  
  // Format change text
  const formattedChange = (percentChange >= 0 ? '+' : '') + percentChange.toFixed(1) + '%';
  
  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between py-2 px-3">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0 w-6 text-base">{countryFlags[countryCode]}</div>
          <div>
            <p className="font-medium text-sm">{countryCode}</p>
            <p className="text-xs text-muted-foreground truncate max-w-32">{rateName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end">
            <p className="font-bold text-base">{formattedRate}</p>
            {/* <div className="flex items-center">
              <TrendIcon size={12} className="mr-1" style={{ color: trendColor }} />
              <span className="text-xs font-medium" style={{ color: trendColor }}>
                {formattedChange}
              </span>
            </div> */}
          </div>
          
          <div className="h-6 w-12">
            <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
              {historical.map((value, index, array) => {
                if (index === 0) return null;
                
                const x1 = ((index - 1) / (array.length - 1)) * 100;
                const y1 = 40 - ((array[index - 1] / Math.max(...array)) * 30);
                const x2 = (index / (array.length - 1)) * 100;
                const y2 = 40 - ((value / Math.max(...array)) * 30);
                
                return (
                  <line
                    key={index}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={trendColor}
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const RateCard = ({ rates }) => {
  // Use provided rates or fallback to sample data
  const data = rates || {
    fed_fund_rate: 5.25,
    uk_bank_rate: 5.00,
    ecb_rate: 3.75,
    aus_cash_rate: 4.10,
    india_repo_rate: 6.50,
    japan_rate: 0.10,
    china_rate: 3.45,
  };
  
  // Generate array of rates for the component
  const rateItems = Object.entries(data).map(([key, value]) => {
    const countryCode = rateToCountry[key];
    const rateName = rateNames[key];
    
    // Use historical data (assuming it will be provided) or generate mock data for 30 days
    // This would be replaced with actual historical data in production
    const historical = [];
    if (key in sampleHistoricalData) {
      // Use sample data for demo
      historical.push(...sampleHistoricalData[key]);
      // Extend to 30 days with similar pattern if needed
      while (historical.length < 30) {
        historical.unshift(historical[0] * (0.995 + Math.random() * 0.01));
      }
    } else {
      // Generate 30 days of mock data if no sample data
      const variance = value * 0.15; // 15% variance for mock data
      for (let i = 0; i < 30; i++) {
        historical.push(value - variance/2 + Math.random() * variance);
      }
    }
    
    return {
      countryCode,
      rateName,
      rateValue: value,
      historical
    };
  });
  
  // Sort by rate value (descending)
  const sortedRates = [...rateItems].sort((a, b) => b.rateValue - a.rateValue);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
        <div>
          <h2 className="text-base font-bold">Global Central Bank Rates</h2>
        </div>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {sortedRates.map((rate) => (
            <RateRow
              key={rate.countryCode}
              countryCode={rate.countryCode}
              rateName={rate.rateName}
              rateValue={rate.rateValue}
              previousRate={rate.previousRate}
              historical={rate.historical}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RateCard;