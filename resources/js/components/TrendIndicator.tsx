import React from 'react';

interface TrendIndicatorProps {
  change: number;
  changePercent: number;
  decimalPlaces?: number;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ 
  change, 
  changePercent, 
  decimalPlaces = 2 
}) => {
  const formatValue = (value: number): string => {
    return value.toFixed(decimalPlaces);
  };

  return (
    <div className={`flex items-center ${
      change >= 0 ? 'text-green-500' : 'text-red-500'
    }`}>
      {change >= 0 ? '▲' : '▼'} 
      <span className="ml-1">{formatValue(change)}</span>
      <span className="ml-2">({formatValue(changePercent)}%)</span>
    </div>
  );
};

export default TrendIndicator;