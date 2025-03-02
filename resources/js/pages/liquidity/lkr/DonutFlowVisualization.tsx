import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ArrowRight } from 'lucide-react';

const DonutFlowVisualization = ({ data, date }) => {
  // Find the data entry for the selected date
  const selectedData = data.find(entry => entry.date === date) || data[data.length - 1];
  
  // Color palettes for inflows and outflows - professional color scheme with enhanced vibrancy
  const inflowColors = {
    interbanks: '#1E88E5',       // Bright blue
    electronic_payments: '#42A5F5', // Light blue
    dst_ins: '#2196F3',          // Standard blue
    tbills: '#64B5F6',           // Very light blue
    tbonds: '#0D47A1',           // Dark blue
    coupons: '#1565C0',          // Medium-dark blue
    dvp: '#5C6BC0'               // Indigo-blue
  };
  
  const outflowColors = {
    interbanks: '#F57C00',       // Bright orange
    electronic_payments: '#FF9800', // Standard orange
    dst_outs: '#FFB74D',         // Light orange
    tbills: '#FFA726',           // Medium orange
    tbonds: '#E65100',           // Dark orange
    rvp: '#FB8C00'               // Medium-bright orange
  };
  
  // Format currency function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Calculate total inflows and outflows
  const totalInflow = 
    selectedData.inflow_interbanks + 
    selectedData.inflow_electronic_payments + 
    selectedData.inflow_dst_ins + 
    selectedData.inflow_tbills + 
    selectedData.inflow_tbonds + 
    selectedData.inflow_coupons +
    selectedData.dvp;
    
  const totalOutflow = 
    selectedData.outflow_interbanks + 
    selectedData.outflow_electronic_payments + 
    selectedData.outflow_dst_outs + 
    selectedData.outflow_tbills + 
    selectedData.outflow_tbonds +
    selectedData.rvp;
  
  // Calculate net flow
  const netFlow = totalInflow - totalOutflow;
  
  // Format inflow categories
  const inflowData = [
    { name: 'Interbank', value: selectedData.inflow_interbanks, color: inflowColors.interbanks },
    { name: 'Electronic Payments', value: selectedData.inflow_electronic_payments, color: inflowColors.electronic_payments },
    { name: 'DST Inflows', value: selectedData.inflow_dst_ins, color: inflowColors.dst_ins },
    { name: 'T-Bills', value: selectedData.inflow_tbills, color: inflowColors.tbills },
    { name: 'T-Bonds', value: selectedData.inflow_tbonds, color: inflowColors.tbonds },
    { name: 'Coupons', value: selectedData.inflow_coupons, color: inflowColors.coupons },
    { name: 'DVP', value: selectedData.dvp, color: inflowColors.dvp }
  ].filter(item => item.value > 0); // Only show items with values
  
  // Format outflow categories
  const outflowData = [
    { name: 'Interbank', value: selectedData.outflow_interbanks, color: outflowColors.interbanks },
    { name: 'Electronic Payments', value: selectedData.outflow_electronic_payments, color: outflowColors.electronic_payments },
    { name: 'DST Outflows', value: selectedData.outflow_dst_outs, color: outflowColors.dst_outs },
    { name: 'T-Bills', value: selectedData.outflow_tbills, color: outflowColors.tbills },
    { name: 'T-Bonds', value: selectedData.outflow_tbonds, color: outflowColors.tbonds },
    { name: 'RVP', value: selectedData.rvp, color: outflowColors.rvp }
  ].filter(item => item.value > 0); // Only show items with values

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const isInflow = payload[0].name.includes('Inflow');
      const total = isInflow ? totalInflow : totalOutflow;
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      const tooltipColor = isInflow ? '#3366CC' : '#E67300';
      
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <p className="font-medium text-sm" style={{ color: tooltipColor }}>
            {payload[0].name.split(' (')[0]}
          </p>
          <p className="text-base font-bold mt-1">{formatCurrency(payload[0].value)}</p>
          <div 
            className="w-full h-1 my-2 rounded-full"
            style={{ 
              background: `linear-gradient(to right, ${tooltipColor} ${percentage}%, #e5e7eb ${percentage}%)` 
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            {percentage}% of {isInflow ? 'Total Inflows' : 'Total Outflows'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate percentages for legends
  const getPercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
  };

  // Custom legend renderer
  const renderCustomizedLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
        {payload.map((entry, index) => {
          const isInflow = entry.value.includes('Inflow');
          const total = isInflow ? totalInflow : totalOutflow;
          const originalData = isInflow 
            ? inflowData.find(d => d.name === entry.value.replace(' (Inflow)', '')) 
            : outflowData.find(d => d.name === entry.value.replace(' (Outflow)', ''));
          
          const percentage = originalData ? getPercentage(originalData.value, total) : '0%';
          
          return (
            <div key={`item-${index}`} className="flex items-center text-xs">
              <div 
                className="w-2 h-2 mr-1 rounded-full flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="mr-1 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">{entry.value.split(' (')[0]}:</span>
              <span className="font-medium whitespace-nowrap">{formatCurrency(originalData?.value || 0)}</span>
              <span className="ml-1 text-gray-500 text-xs whitespace-nowrap">({percentage})</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6  rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Inflow Donut */}
        <div className="w-full md:w-5/12">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inflowData.map(item => ({ ...item, value: Math.max(item.value, 0), name: `${item.name} (Inflow)` }))}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={1}
                  stroke="#fff"
                >
                  {inflowData.map((entry, index) => (
                    <Cell key={`cell-inflow-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderCustomizedLegend} verticalAlign="bottom" height={80} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Middle Flow Indicator */}
        <div className="flex flex-col items-center justify-center">
          <ArrowRight className="h-10 w-10 text-gray-400" />
        </div>
        
        {/* Outflow Donut */}
        <div className="w-full md:w-5/12">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outflowData.map(item => ({ ...item, value: Math.max(item.value, 0), name: `${item.name} (Outflow)` }))}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={1}
                  stroke="#fff"
                >
                  {outflowData.map((entry, index) => (
                    <Cell key={`cell-outflow-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderCustomizedLegend} verticalAlign="bottom" height={80} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Summary Section */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Inflows</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalInflow)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Net Flow</p>
            <div className={`inline-block px-4 py-1 rounded-full ${netFlow >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <p className={`text-xl font-bold ${netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(netFlow)}
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Outflows</p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalOutflow)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutFlowVisualization;