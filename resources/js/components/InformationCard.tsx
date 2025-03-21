import { Card, CardContent } from '@/components/ui/card';
import { formatValue } from '@/utils/formatting';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { useMemo } from 'react';

interface PolicyRate {
  key: string;
  name: string;
  valueType: 'percentage' | 'number';
  formatDecimals: number;
  data: Array<{ date: string; value: number | string }>;
}

interface InformationCardProps {
  title: string;
  policyRates: PolicyRate[];
  className?: string;
}

function InformationCard({
  title,
  policyRates,
  className,
}: InformationCardProps) {
  
  // Get the latest values and prepare sparkline data for each policy rate
  const rateValues = useMemo(() => {
    return policyRates.map(rate => {
      const sortedData = [...rate.data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Extract the last 10 data points for the sparkline (or all if less than 10)
      const sparklineData = sortedData.slice(-10).map(item => ({
        date: item.date,
        value: typeof item.value === 'string' ? parseFloat(item.value) : item.value
      }));
      
      return {
        ...rate,
        latestValue: sortedData.length > 0 ? sortedData[sortedData.length - 1].value : 0,
        sparklineData
      };
    });
  }, [policyRates]);

  // Function to render sparkline
  const renderSparkline = (data) => {
    if (!data || data.length < 2) return null;
    
    // Calculate min and max for scaling
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Dimensions
    const width = 60;
    const height = 20;
    const padding = 2;
    
    // Create points for the path
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const normalizedValue = range === 0 ? 0.5 : (d.value - min) / range;
      const y = height - normalizedValue * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');

    // Determine line color based on trend (green for up, red for down)
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const lineColor = lastValue >= firstValue ? "#10b981" : "#ef4444";
    
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
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

  return (
    <Card className={cn(
      "overflow-hidden shadow-md rounded-lg",
      "bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-200">{title}</p>
          <Info size={16} className="text-slate-400 hover:text-slate-300 cursor-help" />
        </div>
        
        <div className="space-y-4">
          {rateValues.map((rate) => (
            <div key={rate.key} className="flex justify-between items-center">
              <span className="text-sm text-slate-300">
                {rate.name}
              </span>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {renderSparkline(rate.sparklineData)}
                </div>
                <span className="text-sm font-semibold text-white">
                  {formatValue(rate.latestValue, {
                    type: rate.valueType,
                    decimalPlaces: rate.formatDecimals,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default InformationCard;