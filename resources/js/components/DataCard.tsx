import React from 'react';
import TrendIndicator from './TrendIndicator';

interface DataCardProps {
  title: string;
  value: number;
  change: number;
  changePercent: number;
  valuePrefix?: string;
  valueSuffix?: string;
  decimalPlaces?: number;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  change,
  changePercent,
  valuePrefix = "",
  valueSuffix = "",
  decimalPlaces = 2
}) => {
  const formatValue = (val: number): string => {
    // Check if value is a valid number
    if (typeof val !== 'number' || isNaN(val)) {
      return '0';
    }
    // number should be multiplied by 100 to get the percentage
    if (valueSuffix === '%') {
      return (val * 100).toFixed(decimalPlaces);
    }
    return val.toFixed(decimalPlaces);
  };

  return (
    <div className="bg-gray-900 p-3 rounded-lg flex justify-between items-center">
      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="text-xl font-bold mt-1">
        {valuePrefix}{formatValue(value)}{valueSuffix}
      </div>
      <TrendIndicator 
        change={change} 
        changePercent={changePercent} 
        decimalPlaces={decimalPlaces} 
      />
    </div>
  );
};

export default DataCard;