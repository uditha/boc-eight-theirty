/**
 * Formats a value based on its type (number or percentage)
 * Utility function for Laravel Inertia React application
 * 
 * @param value - The value to format
 * @param options - Formatting options
 * @param options.type - The type of formatting to apply ('number' or 'percentage')
 * @param options.decimalPlaces - Number of decimal places to display (default: 2)
 * @param options.autoAdjustPercentage - If true, values < 1 will be multiplied by 100 for percentage display (default: true)
 * @returns Formatted value as a string
 */
const formatValue = (
    value: number | string,
    options: {
      type?: 'number' | 'percentage' | 'currency';
      decimalPlaces?: number;
      autoAdjustPercentage?: boolean;
      currency?: string;
    } = {}
  ): string => {
    // Default options
    const {
      type = 'number',
      decimalPlaces = 1,
      autoAdjustPercentage = true,
      currency = 'USD'
    } = options;
  
    // If value is not a number or is invalid, return it as is
    if (value === null || value === undefined || isNaN(Number(value))) {
      return String(value);
    }
  
    // Convert to number if it's a string number
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
    // Format based on type
    if (type === 'number') {
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces
      }).format(numericValue);
    }
    
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces
      }).format(numericValue);
    }
    
    if (type === 'percentage') {
      // Adjust percentage value if it's less than 1 and autoAdjust is enabled
      const adjustedValue = autoAdjustPercentage && Math.abs(numericValue) < 1 
        ? numericValue * 100 
        : numericValue;
        
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces
      }).format(adjustedValue / 100); // Intl.NumberFormat multiplies by 100 for percentage
    }
  
    // Fallback for any other type
    return String(numericValue);
  };

  export { formatValue };