import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowUp, ArrowDown, Filter,
  ArrowUpRight, ArrowDownRight, Calendar,
  BarChart3, TrendingUp, TrendingDown
} from 'lucide-react';

const UnitSelectionComponent = ({ records }) => {
  // Find the most recent date from records
  const mostRecentDate = records.length > 0
    ? new Date(records[records.length - 1].record_date)
    : new Date();

  // Initialize state for date range - default to last 7 days
  const [dateRange, setDateRange] = useState({
    startDate: formatDate(new Date(mostRecentDate).setDate(mostRecentDate.getDate() - 6)),
    endDate: formatDate(mostRecentDate)
  });

  const [chartData, setChartData] = useState([]);
  const [unitAnalysis, setUnitAnalysis] = useState([]);
  const [timeRange, setTimeRange] = useState('7days');
  const [chartType, setChartType] = useState('overview');

  // State for unit selection and filtering
  const [unitFilterType, setUnitFilterType] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitRow, setUnitRow] = useState([]);
  const [sortMethod, setSortMethod] = useState('amount');

  // Format date function (yyyy-MM-dd)
  function formatDate(date) {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  // Format date for display (MMM dd)
  function formatDisplayDate(dateString) {
    const d = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[d.getMonth()]} ${d.getDate()}`;
  }

  // Format currency values
  const formatCurrency = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return 'USD 0';

    if (numValue >= 1000000) {
      return `USD ${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `USD ${(numValue / 1000).toFixed(1)}K`;
    } else {
      return `USD ${numValue.toFixed(0)}`;
    }
  };

  // Prepare data for date range
  useEffect(() => {
    if (records.length === 0) return;

    // Filter records within date range
    const filteredRecords = records.filter(record => {
      const recordDate = new Date(record.record_date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Sort by date
    filteredRecords.sort((a, b) => new Date(a.record_date) - new Date(b.record_date));

    // Create chart data
    const chartData = filteredRecords.map(record => {
      // Calculate total inflow (buying)
      const totalInflow =
        parseFloat(record.inflow_other_amount || 0) +
        parseFloat(record.inflow_corporate_amount || 0) +
        parseFloat(record.inflow_personal_amount || 0) +
        parseFloat(record.inflow_fcbu_amount || 0) +
        parseFloat(record.inflow_pettah_amount || 0) +
        parseFloat(record.inflow_imp_amount || 0) +
        parseFloat(record.inflow_exchange_house_amount || 0) +
        parseFloat(record.inflow_ir_amount || 0) +
        parseFloat(record.inflow_interbank_amount || 0) +
        parseFloat(record.inflow_internal_entries_amount || 0);

      // Calculate total outflow (selling)
      const totalOutflow =
        parseFloat(record.outflow_pettah_amount || 0) +
        parseFloat(record.outflow_others_amount || 0) +
        parseFloat(record.outflow_tr_amount || 0) +
        parseFloat(record.outflow_metro_tr_amount || 0) +
        parseFloat(record.outflow_ir_amount || 0) +
        parseFloat(record.outflow_nugegoda_amount || 0) +
        parseFloat(record.outflow_corporate_amount || 0) +
        parseFloat(record.outflow_personal_amount || 0) +
        parseFloat(record.outflow_imp_amount || 0) +
        parseFloat(record.outflow_cpc_amount || 0) +
        parseFloat(record.outflow_interbank_amount || 0) +
        parseFloat(record.outflow_internal_entries_amount || 0);

      // Add individual unit volumes to track trend of specific units
      const unitVolumes = {
        // Inflow units (buying)
        'Corporate Buy': parseFloat(record.inflow_corporate_amount || 0),
        'Personal Buy': parseFloat(record.inflow_personal_amount || 0),
        'Pettah Buy': parseFloat(record.inflow_pettah_amount || 0),
        'FCBU Buy': parseFloat(record.inflow_fcbu_amount || 0),
        'Exchange House Buy': parseFloat(record.inflow_exchange_house_amount || 0),
        'IR Buy': parseFloat(record.inflow_ir_amount || 0),
        'IMP Buy': parseFloat(record.inflow_imp_amount || 0),
        'Interbank Buy': parseFloat(record.inflow_interbank_amount || 0),
        'Other Buy': parseFloat(record.inflow_other_amount || 0),
        'Internal Entries Buy': parseFloat(record.inflow_internal_entries_amount || 0),

        // Outflow units (selling)
        'Corporate Sell': parseFloat(record.outflow_corporate_amount || 0),
        'Personal Sell': parseFloat(record.outflow_personal_amount || 0),
        'Pettah Sell': parseFloat(record.outflow_pettah_amount || 0),
        'IR Sell': parseFloat(record.outflow_ir_amount || 0),
        'IMP Sell': parseFloat(record.outflow_imp_amount || 0),
        'Interbank Sell': parseFloat(record.outflow_interbank_amount || 0),
        'TR Sell': parseFloat(record.outflow_tr_amount || 0),
        'Metro TR Sell': parseFloat(record.outflow_metro_tr_amount || 0),
        'Nugegoda Sell': parseFloat(record.outflow_nugegoda_amount || 0),
        'CPC Sell': parseFloat(record.outflow_cpc_amount || 0),
        'Other Sell': parseFloat(record.outflow_others_amount || 0),
        'Internal Entries Sell': parseFloat(record.outflow_internal_entries_amount || 0)
      };

      return {
        date: formatDisplayDate(record.record_date),
        fullDate: record.record_date,
        buy: totalInflow,
        sell: totalOutflow,
        net: totalInflow - totalOutflow,
        ...unitVolumes
      };
    });

    setChartData(chartData);

    // Analyze by unit types
    const unitTypes = {
      // Inflow units (buying)
      'Corporate Buy': {
        category: 'Inflow',
        color: '#4f46e5',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.inflow_corporate_amount || 0), 0)
      },
      'Personal Buy': {
        category: 'Inflow',
        color: '#3b82f6',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.inflow_personal_amount || 0), 0)
      },
      'Pettah Buy': {
        category: 'Inflow',
        color: '#0ea5e9',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.inflow_pettah_amount || 0), 0)
      },
      'FCBU Buy': {
        category: 'Inflow',
        color: '#06b6d4',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.inflow_fcbu_amount || 0), 0)
      },
      'Exchange House Buy': {
        category: 'Inflow',
        color: '#0891b2',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.inflow_exchange_house_amount || 0), 0)
      },
      'IR Buy': {
        category: 'Inflow',
        color: '#0d9488',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.inflow_ir_amount || 0), 0)
      },
      'IMP Buy': {
        category: 'Inflow',
        color: '#059669',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.inflow_imp_amount || 0), 0)
      },
      'Interbank Buy': {
        category: 'Inflow',
        color: '#10b981',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.inflow_interbank_amount || 0), 0)
      },
      'Other Buy': {
        category: 'Inflow',
        color: '#34d399',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.inflow_other_amount || 0), 0)
      },
      'Internal Entries Buy': {
        category: 'Inflow',
        color: '#6ee7b7',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.inflow_internal_entries_amount || 0), 0)
      },

      // Outflow units (selling)
      'Corporate Sell': {
        category: 'Outflow',
        color: '#e11d48',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_corporate_amount || 0), 0)
      },
      'Personal Sell': {
        category: 'Outflow',
        color: '#ef4444',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_personal_amount || 0), 0)
      },
      'Pettah Sell': {
        category: 'Outflow',
        color: '#f43f5e',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_pettah_amount || 0), 0)
      },
      'IR Sell': {
        category: 'Outflow',
        color: '#f97316',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_ir_amount || 0), 0)
      },
      'IMP Sell': {
        category: 'Outflow',
        color: '#fb923c',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_imp_amount || 0), 0)
      },
      'Interbank Sell': {
        category: 'Outflow',
        color: '#f59e0b',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_interbank_amount || 0), 0)
      },
      'TR Sell': {
        category: 'Outflow',
        color: '#d97706',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_tr_amount || 0), 0)
      },
      'Metro TR Sell': {
        category: 'Outflow',
        color: '#b45309',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_metro_tr_amount || 0), 0)
      },
      'Nugegoda Sell': {
        category: 'Outflow',
        color: '#a16207',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_nugegoda_amount || 0), 0)
      },
      'CPC Sell': {
        category: 'Outflow',
        color: '#854d0e',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_cpc_amount || 0), 0)
      },
      'Other Sell': {
        category: 'Outflow',
        color: '#713f12',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_others_amount || 0), 0)
      },
      'Internal Entries Sell': {
        category: 'Outflow',
        color: '#92400e',
        amount: filteredRecords.reduce((sum, r) => sum + parseFloat(r.outflow_internal_entries_amount || 0), 0)
      }
    };

    // Convert to array and sort by amount
    const unitAnalysisArray = Object.entries(unitTypes)
      .map(([name, data]) => ({
        name,
        category: data.category,
        color: data.color,
        amount: data.amount,
        // Calculate day-to-day change
        dailyChange: calculateDailyChange(name, chartData)
      }))
      .filter(item => item.amount > 0);

    setUnitAnalysis(unitAnalysisArray);
  }, [records, dateRange]);

  // Update unit row when filter type or sort method changes
  useEffect(() => {
    // Filter units based on selected type
    let filteredUnits = unitAnalysis.filter(unit => {
      if (unitFilterType === 'all') return true;
      if (unitFilterType === 'buy') return unit.category === 'Inflow';
      if (unitFilterType === 'sell') return unit.category === 'Outflow';
      return true;
    });

    // Sort units based on selected method
    if (sortMethod === 'amount') {
      filteredUnits = filteredUnits.sort((a, b) => b.amount - a.amount);
    } else if (sortMethod === 'change') {
      filteredUnits = filteredUnits.sort((a, b) => b.dailyChange - a.dailyChange);
    } else if (sortMethod === 'name') {
      filteredUnits = filteredUnits.sort((a, b) => a.name.localeCompare(b.name));
    }

    setUnitRow(filteredUnits);
  }, [unitAnalysis, unitFilterType, sortMethod]);

  // Calculate daily change percentage for a unit
  const calculateDailyChange = (unitName, data) => {
    if (data.length < 2) return 0;

    const today = data[data.length - 1][unitName] || 0;
    const yesterday = data[data.length - 2][unitName] || 0;

    if (yesterday === 0) return 0;
    return ((today - yesterday) / yesterday) * 100;
  };

  // Handle date range selection
  const handleDateRangeSelection = (option) => {
    const endDate = new Date(mostRecentDate);
    let startDate = new Date(mostRecentDate);

    switch(option) {
      case '7days':
        startDate.setDate(endDate.getDate() - 6);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 29);
        break;
      case 'mtd':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case 'ytd':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 6);
    }

    setDateRange({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    });

    setTimeRange(option);
  };

  // Handle unit selection
  const handleUnitSelection = (unitName) => {
    if (selectedUnit === unitName) {
      setSelectedUnit(null); // Deselect if already selected
    } else {
      setSelectedUnit(unitName); // Select new unit
    }
  };

  // Prepare data for bar chart
  const getBarChartData = () => {
    if (selectedUnit) {
      // For single unit view
      return chartData.map(day => ({
        date: day.date,
        value: day[selectedUnit] || 0
      }));
    } else {
      // For comparison view - show top 10 units for the period
      return unitRow.slice(0, 10).map(unit => ({
        name: unit.name,
        value: unit.amount,
        color: unit.color,
        category: unit.category
      }));
    }
  };

  // Get range info text
  const getRangeInfoText = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${start.toLocaleDateString(undefined, options)} to ${end.toLocaleDateString(undefined, options)}`;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="text-sm font-medium text-gray-700">{payload[0].payload.date || label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center mt-1">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.payload.color || entry.fill }}
            />
            <span className="text-xs text-gray-700">{entry.name}: </span>
            <span className="text-xs font-medium ml-1">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  // Calculate totals
  const totalBuy = chartData.reduce((sum, day) => sum + day.buy, 0);
  const totalSell = chartData.reduce((sum, day) => sum + day.sell, 0);
  const netFlow = totalBuy - totalSell;

  // Get selected unit data
  const selectedUnitData = selectedUnit
    ? unitAnalysis.find(unit => unit.name === selectedUnit)
    : null;

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Unit Analysis</CardTitle>
            <CardDescription className="text-muted-foreground mt-1 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {getRangeInfoText()}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Tabs defaultValue="7days" value={timeRange} onValueChange={handleDateRangeSelection} className="w-full">
              <TabsList className="grid grid-cols-4 h-8">
                <TabsTrigger value="7days" className="text-xs">7D</TabsTrigger>
                <TabsTrigger value="30days" className="text-xs">30D</TabsTrigger>
                <TabsTrigger value="mtd" className="text-xs">MTD</TabsTrigger>
                <TabsTrigger value="ytd" className="text-xs">YTD</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-2">

        {/* Filter and View Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant={unitFilterType === 'all' ? 'default' : 'outline'}
              onClick={() => { setUnitFilterType('all'); setSelectedUnit(null); }}
              size="sm"
              className="text-xs font-medium"
            >
              <Filter className="h-3 w-3 mr-1" />
              All
            </Button>
            <Button
              variant={unitFilterType === 'buy' ? 'default' : 'outline'}
              onClick={() => { setUnitFilterType('buy'); setSelectedUnit(null); }}
              size="sm"
              className={`text-xs font-medium ${unitFilterType === 'buy' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              <ArrowDownRight className="h-3 w-3 mr-1" />
              Buy
            </Button>
            <Button
              variant={unitFilterType === 'sell' ? 'default' : 'outline'}
              onClick={() => { setUnitFilterType('sell'); setSelectedUnit(null); }}
              size="sm"
              className={`text-xs font-medium ${unitFilterType === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Sell
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Select value={sortMethod} onValueChange={setSortMethod}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort Units By</SelectLabel>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="change">Daily Change</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Tabs defaultValue="bar" value={chartType} onValueChange={setChartType} className="w-full">
              <TabsList className="h-8">
                <TabsTrigger value="overview" className="text-xs">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Bars
                </TabsTrigger>
                <TabsTrigger value="trend" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trend
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Unit selection row */}
        <div className="flex flex-wrap gap-2 mb-6">
          {unitRow.map((unit, index) => (
            <Badge
              key={index}
              variant={selectedUnit === unit.name ? "default" : "outline"}
              className={`cursor-pointer transition-all px-3 py-1 flex items-center gap-2 ${
                selectedUnit === unit.name ? 'bg-gray-100 text-gray-900 border-gray-300' : ''
              }`}
              onClick={() => handleUnitSelection(unit.name)}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: unit.color }}
              ></div>
              <span className="text-xs font-medium whitespace-nowrap">{unit.name}</span>
              <span className={`text-xs flex items-center ${unit.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {unit.dailyChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(unit.dailyChange).toFixed(1)}%
              </span>
            </Badge>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'overview' ? (
              <BarChart
                data={getBarChartData()}
                margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                barSize={selectedUnit ? 20 : 30}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey={selectedUnit ? "date" : "name"}
                  tick={{ fontSize: 10 }}
                  stroke="#94A3B8"
                  angle={selectedUnit ? 0 : -45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  stroke="#94A3B8"
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="value"
                  name={selectedUnit || "Amount"}
                  fill={selectedUnitData?.color || "#3b82f6"}
                >
                  {!selectedUnit && getBarChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              // Trend view - Line chart for time series data
              selectedUnit ? (
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    stroke="#94A3B8"
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={selectedUnit}
                    name={selectedUnit}
                    stroke={selectedUnitData?.color || "#3b82f6"}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              ) : (
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    stroke="#94A3B8"
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="buy"
                    name="Buy"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f680"
                  />
                  <Area
                    type="monotone"
                    dataKey="sell"
                    name="Sell"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef444480"
                  />
                </AreaChart>
              )
            )}
          </ResponsiveContainer>
        </div>

        {/* Selected unit details */}
        {selectedUnit && selectedUnitData && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedUnitData.color }}
                ></div>
                <h3 className="font-medium">{selectedUnit}</h3>
                <Badge variant="outline" className={selectedUnitData.category === 'Inflow' ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}>
                  {selectedUnitData.category === 'Inflow' ? 'Buy' : 'Sell'}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUnit(null)}
                className="text-xs"
              >
                Clear Selection
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-lg font-semibold">{formatCurrency(selectedUnitData.amount || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Latest Value</p>
                <p className="text-lg font-semibold">
                  {chartData.length > 0 ?
                    formatCurrency(chartData[chartData.length - 1][selectedUnit] || 0) :
                    'USD 0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Daily Change</p>
                <p className={`text-lg font-semibold flex items-center ${
                  (selectedUnitData.dailyChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(selectedUnitData.dailyChange || 0) >= 0 ?
                    <ArrowUp className="h-4 w-4 mr-1" /> :
                    <ArrowDown className="h-4 w-4 mr-1" />}
                  {Math.abs(selectedUnitData.dailyChange || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnitSelectionComponent;