import React, { useState } from 'react';
import { format, isValid } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const DailySummaryTable = ({ records }) => {
  // Find the most recent date from records
  const mostRecentDate = records.length > 0
    ? new Date(records[records.length - 1].record_date)
    : new Date();

  const [selectedDate, setSelectedDate] = useState(
    records.length > 0 ? records[records.length - 1].record_date : ''
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Find the record for the selected date
  const selectedRecord = records.find(record => record.record_date === selectedDate);

  // Function to calculate total inflows
  const calculateTotalInflow = (record) => {
    if (!record) return 0;
    // Convert all values to numbers to ensure proper addition
    return parseFloat(record.inflow_other_amount || 0) +
      parseFloat(record.inflow_corporate_amount || 0) +
      parseFloat(record.inflow_personal_amount || 0) +
      parseFloat(record.inflow_fcbu_amount || 0) +
      parseFloat(record.inflow_pettah_amount || 0) +
      parseFloat(record.inflow_imp_amount || 0) +
      parseFloat(record.inflow_exchange_house_amount || 0) +
      parseFloat(record.inflow_ir_amount || 0) +
      parseFloat(record.inflow_interbank_amount || 0) +
      parseFloat(record.inflow_internal_entries_amount || 0);
  };

  // Function to calculate total outflows
  const calculateTotalOutflow = (record) => {
    if (!record) return 0;
    // Convert all values to numbers to ensure proper addition
    return parseFloat(record.outflow_pettah_amount || 0) +
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
  };

  // Calculate LKR amount
  const calculateLKRAmount = (amount, rate) => {
    // Ensure both amount and rate are valid numbers
    if (amount === null || amount === undefined || rate === null || rate === undefined) {
      return 0;
    }
    return parseFloat(amount) * parseFloat(rate);
  };

  // Calculate percentage from total
  const calculatePercentage = (amount, total) => {
    if (total === 0) return 0;
    return (amount / total) * 100;
  };

  // Get totals
  const totalInflow = selectedRecord ? calculateTotalInflow(selectedRecord) : 0;
  const totalOutflow = selectedRecord ? calculateTotalOutflow(selectedRecord) : 0;

  // Prepare inflow data and filter out zero amounts
  const inflowData = selectedRecord ? [
    {
      description: 'Other',
      amount: selectedRecord.inflow_other_amount,
      rate: selectedRecord.inflow_other_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.inflow_other_amount, selectedRecord.inflow_other_rate),
      percentage: calculatePercentage(selectedRecord.inflow_other_amount, totalInflow)
    },
    {
      description: 'Corporate',
      amount: selectedRecord.inflow_corporate_amount,
      rate: selectedRecord.inflow_corporate_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.inflow_corporate_amount, selectedRecord.inflow_corporate_rate),
      percentage: calculatePercentage(selectedRecord.inflow_corporate_amount, totalInflow)
    },
    {
      description: 'Personal',
      amount: selectedRecord.inflow_personal_amount,
      rate: selectedRecord.inflow_personal_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.inflow_personal_amount, selectedRecord.inflow_personal_rate),
      percentage: calculatePercentage(selectedRecord.inflow_personal_amount, totalInflow)
    },
    {
      description: 'FCBU',
      amount: selectedRecord.inflow_fcbu_amount,
      rate: selectedRecord.inflow_fcbu_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.inflow_fcbu_amount, selectedRecord.inflow_fcbu_rate),
      percentage: calculatePercentage(selectedRecord.inflow_fcbu_amount, totalInflow)
    },
    {
      description: 'Pettah',
      amount: selectedRecord.inflow_pettah_amount,
      rate: selectedRecord.inflow_pettah_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.inflow_pettah_amount, selectedRecord.inflow_pettah_rate),
      percentage: calculatePercentage(selectedRecord.inflow_pettah_amount, totalInflow)
    },
    {
      description: 'IMP',
      amount: selectedRecord.inflow_imp_amount,
      rate: selectedRecord.inflow_imp_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.inflow_imp_amount, selectedRecord.inflow_imp_rate),
      percentage: calculatePercentage(selectedRecord.inflow_imp_amount, totalInflow)
    },
    {
      description: 'Exchange House',
      amount: selectedRecord.inflow_exchange_house_amount,
      rate: selectedRecord.inflow_exchange_house_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.inflow_exchange_house_amount, selectedRecord.inflow_exchange_house_rate),
      percentage: calculatePercentage(selectedRecord.inflow_exchange_house_amount, totalInflow)
    },
    {
      description: 'IR',
      amount: selectedRecord.inflow_ir_amount,
      rate: selectedRecord.inflow_ir_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.inflow_ir_amount, selectedRecord.inflow_ir_rate),
      percentage: calculatePercentage(selectedRecord.inflow_ir_amount, totalInflow)
    },
    {
      description: 'Interbank',
      amount: selectedRecord.inflow_interbank_amount,
      rate: selectedRecord.inflow_interbank_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.inflow_interbank_amount, selectedRecord.inflow_interbank_rate),
      percentage: calculatePercentage(selectedRecord.inflow_interbank_amount, totalInflow)
    },
    {
      description: 'Internal Entries',
      amount: selectedRecord.inflow_internal_entries_amount,
      rate: selectedRecord.inflow_internal_entries_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.inflow_internal_entries_amount, selectedRecord.inflow_internal_entries_rate),
      percentage: calculatePercentage(selectedRecord.inflow_internal_entries_amount, totalInflow)
    }
  ].filter(item => item.amount > 0) : [];

  // Prepare outflow data and filter out zero amounts
  const outflowData = selectedRecord ? [
    {
      description: 'Pettah',
      amount: selectedRecord.outflow_pettah_amount,
      rate: selectedRecord.outflow_pettah_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_pettah_amount, selectedRecord.outflow_pettah_rate),
      percentage: calculatePercentage(selectedRecord.outflow_pettah_amount, totalOutflow)
    },
    {
      description: 'Others',
      amount: selectedRecord.outflow_others_amount,
      rate: selectedRecord.outflow_others_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_others_amount, selectedRecord.outflow_others_rate),
      percentage: calculatePercentage(selectedRecord.outflow_others_amount, totalOutflow)
    },
    {
      description: 'TR',
      amount: selectedRecord.outflow_tr_amount,
      rate: selectedRecord.outflow_tr_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_tr_amount, selectedRecord.outflow_tr_rate),
      percentage: calculatePercentage(selectedRecord.outflow_tr_amount, totalOutflow)
    },
    {
      description: 'Metro TR',
      amount: selectedRecord.outflow_metro_tr_amount,
      rate: selectedRecord.outflow_metro_tr_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_metro_tr_amount, selectedRecord.outflow_metro_tr_rate),
      percentage: calculatePercentage(selectedRecord.outflow_metro_tr_amount, totalOutflow)
    },
    {
      description: 'IR',
      amount: selectedRecord.outflow_ir_amount,
      rate: selectedRecord.outflow_ir_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_ir_amount, selectedRecord.outflow_ir_rate),
      percentage: calculatePercentage(selectedRecord.outflow_ir_amount, totalOutflow)
    },
    {
      description: 'Nugegoda',
      amount: selectedRecord.outflow_nugegoda_amount,
      rate: selectedRecord.outflow_nugegoda_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_nugegoda_amount, selectedRecord.outflow_nugegoda_rate),
      percentage: calculatePercentage(selectedRecord.outflow_nugegoda_amount, totalOutflow)
    },
    {
      description: 'Corporate',
      amount: selectedRecord.outflow_corporate_amount,
      rate: selectedRecord.outflow_corporate_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_corporate_amount, selectedRecord.outflow_corporate_rate),
      percentage: calculatePercentage(selectedRecord.outflow_corporate_amount, totalOutflow)
    },
    {
      description: 'Personal',
      amount: selectedRecord.outflow_personal_amount,
      rate: selectedRecord.outflow_personal_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_personal_amount, selectedRecord.outflow_personal_rate),
      percentage: calculatePercentage(selectedRecord.outflow_personal_amount, totalOutflow)
    },
    {
      description: 'IMP',
      amount: selectedRecord.outflow_imp_amount,
      rate: selectedRecord.outflow_imp_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_imp_amount, selectedRecord.outflow_imp_rate),
      percentage: calculatePercentage(selectedRecord.outflow_imp_amount, totalOutflow)
    },
    {
      description: 'CPC',
      amount: selectedRecord.outflow_cpc_amount,
      rate: selectedRecord.outflow_cpc_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_cpc_amount, selectedRecord.outflow_cpc_rate),
      percentage: calculatePercentage(selectedRecord.outflow_cpc_amount, totalOutflow)
    },
    {
      description: 'Interbank',
      amount: selectedRecord.outflow_interbank_amount,
      rate: selectedRecord.outflow_interbank_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_interbank_amount, selectedRecord.outflow_interbank_rate),
      percentage: calculatePercentage(selectedRecord.outflow_interbank_amount, totalOutflow)
    },
    {
      description: 'Internal Entries',
      amount: selectedRecord.outflow_internal_entries_amount,
      rate: selectedRecord.outflow_internal_entries_rate,
      lkrAmount: calculateLKRAmount(selectedRecord.outflow_internal_entries_amount, selectedRecord.outflow_internal_entries_rate),
      percentage: calculatePercentage(selectedRecord.outflow_internal_entries_amount, totalOutflow)
    }
  ].filter(item => item.amount > 0) : [];

  // Format number to always show two decimal places
  const formatNumber = (num) => {
    // Handle null, undefined, or non-numeric values
    if (num === null || num === undefined) {
      return '0.00';
    }

    // Convert to number if it's not already
    const numValue = typeof num === 'number' ? num : Number(num);

    // Check if conversion resulted in a valid number
    if (isNaN(numValue)) {
      console.warn('Invalid number passed to formatNumber:', num);
      return '0.00';
    }

    return numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle date change from calendar
  const handleDateChange = (date) => {
    if (!date) return;

    // Format date to match record_date format (YYYY-MM-DD)
    const formattedDate = format(date, 'yyyy-MM-dd');

    // Check if the formatted date exists in records
    const dateExists = records.some(record => record.record_date === formattedDate);

    if (dateExists) {
      setSelectedDate(formattedDate);
    } else {
      // Find closest available date
      const availableDates = records.map(r => new Date(r.record_date).getTime());
      const selectedTime = date.getTime();
      const closestDate = records[availableDates.reduce((prev, curr, idx) =>
        Math.abs(curr - selectedTime) < Math.abs(availableDates[prev] - selectedTime) ? idx : prev, 0)];

      setSelectedDate(closestDate.record_date);
    }
    setCalendarOpen(false);
  };

  // Determine available dates for the calendar
  const availableDates = records.map(record => new Date(record.record_date));

  // Function to check if a date should be disabled in the calendar
  const isDateDisabled = (date) => {
    return !availableDates.some(
      availableDate =>
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear()
    );
  };

  return (
    <>
      {selectedRecord && (
        <CardContent>
          {/* Comprehensive Summary Table with all data */}
          <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-xl font-semibold text-gray-800">Daily Summary</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Select Date:</span>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-40 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(new Date(selectedDate), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={handleDateChange}
                disabled={isDateDisabled}
                initialFocus
                showOutsideDays={false}
                className="p-3"
                components={{
                  IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                  IconRight: () => <ChevronRight className="h-4 w-4" />,
                }}
                modifiersClassNames={{
                  selected: "bg-primary text-primary-foreground",
                  today: "bg-accent text-accent-foreground",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="py-2 text-xs">Description</TableHead>
                      <TableHead className="py-2 text-xs text-right">Amount (USD)</TableHead>
                      <TableHead className="py-2 text-xs text-right">Rate</TableHead>
                      <TableHead className="py-2 text-xs text-right">LKR Value</TableHead>
                      <TableHead className="py-2 text-xs text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Inflows Section Header */}
                    <TableRow className="bg-blue-100">
                      <TableCell colSpan={5} className="py-1 text-xs font-medium text-blue-700 pl-4">
                        Inflows
                      </TableCell>
                    </TableRow>

                    {/* Opening Balance (if positive) */}
                    {parseFloat(selectedRecord.opening_balance_amount) > 0 && (
                      <TableRow className="bg-blue-50">
                        <TableCell className="py-1.5 text-xs font-medium text-blue-800 pl-8">Opening Balance</TableCell>
                        <TableCell className="py-1.5 text-xs text-right font-medium">{formatNumber(selectedRecord.opening_balance_amount)}</TableCell>
                        <TableCell className="py-1.5 text-xs text-right">{formatNumber(selectedRecord.opening_balance_rate)}</TableCell>
                        <TableCell className="py-1.5 text-xs text-right font-semibold text-blue-700">
                          {formatNumber(calculateLKRAmount(selectedRecord.opening_balance_amount, selectedRecord.opening_balance_rate))}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-right">-</TableCell>
                      </TableRow>
                    )}

                    {/* Inflow Items */}
                    {inflowData.map((item, index) => (
                      <TableRow key={`inflow-${index}`} className="hover:bg-blue-50">
                        <TableCell className="py-1 text-xs pl-8">{item.description}</TableCell>
                        <TableCell className="py-1 text-xs text-right">{formatNumber(item.amount)}</TableCell>
                        <TableCell className="py-1 text-xs text-right">{formatNumber(item.rate)}</TableCell>
                        <TableCell className="py-1 text-xs text-right">{formatNumber(item.lkrAmount)}</TableCell>
                        <TableCell className="py-1 text-xs text-right">{formatNumber(item.percentage)}%</TableCell>
                      </TableRow>
                    ))}

                    {/* Total Inflow */}
                    <TableRow className="bg-blue-50">
                      <TableCell className="py-1.5 text-xs font-medium text-blue-700 pl-4">Total Inflow</TableCell>
                      <TableCell className="py-1.5 text-xs text-right font-medium text-blue-700">
                        {formatNumber(parseFloat(selectedRecord.opening_balance_amount) > 0 ?
                          totalInflow + parseFloat(selectedRecord.opening_balance_amount) :
                          totalInflow)}
                      </TableCell>
                      <TableCell className="py-1.5 text-xs text-right">-</TableCell>
                      <TableCell className="py-1.5 text-xs text-right">-</TableCell>
                      <TableCell className="py-1.5 text-xs text-right">100.00%</TableCell>
                    </TableRow>

                    {/* Outflows Section Header */}
                    <TableRow className="bg-red-100">
                      <TableCell colSpan={5} className="py-1 text-xs font-medium text-red-700 pl-4">
                        Outflows
                      </TableCell>
                    </TableRow>

                    {/* Opening Balance (if negative) */}
                    {parseFloat(selectedRecord.opening_balance_amount) < 0 && (
                      <TableRow className="bg-red-50">
                        <TableCell className="py-1.5 text-xs font-medium text-red-800 pl-8">Opening Balance</TableCell>
                        <TableCell className="py-1.5 text-xs text-right font-medium">{formatNumber(Math.abs(selectedRecord.opening_balance_amount))}</TableCell>
                        <TableCell className="py-1.5 text-xs text-right">{formatNumber(selectedRecord.opening_balance_rate)}</TableCell>
                        <TableCell className="py-1.5 text-xs text-right font-semibold text-red-700">
                          {formatNumber(Math.abs(calculateLKRAmount(selectedRecord.opening_balance_amount, selectedRecord.opening_balance_rate)))}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-right">-</TableCell>
                      </TableRow>
                    )}

                    {/* Outflow Items */}
                    {outflowData.map((item, index) => (
                      <TableRow key={`outflow-${index}`} className="hover:bg-red-50">
                        <TableCell className="py-1 text-xs pl-8">{item.description}</TableCell>
                        <TableCell className="py-1 text-xs text-right">{formatNumber(item.amount)}</TableCell>
                        <TableCell className="py-1 text-xs text-right">{formatNumber(item.rate)}</TableCell>
                        <TableCell className="py-1 text-xs text-right">{formatNumber(item.lkrAmount)}</TableCell>
                        <TableCell className="py-1 text-xs text-right">{formatNumber(item.percentage)}%</TableCell>
                      </TableRow>
                    ))}

                    {/* Total Outflow */}
                    <TableRow className="bg-red-50">
                      <TableCell className="py-1.5 text-xs font-medium text-red-700 pl-4">Total Outflow</TableCell>
                      <TableCell className="py-1.5 text-xs text-right font-medium text-red-700">
                        {formatNumber(parseFloat(selectedRecord.opening_balance_amount) < 0 ?
                          totalOutflow + Math.abs(parseFloat(selectedRecord.opening_balance_amount)) :
                          totalOutflow)}
                      </TableCell>
                      <TableCell className="py-1.5 text-xs text-right">-</TableCell>
                      <TableCell className="py-1.5 text-xs text-right">-</TableCell>
                      <TableCell className="py-1.5 text-xs text-right">100.00%</TableCell>
                    </TableRow>

                    {/* Closing Balance */}
                    <TableRow className="bg-green-50">
                      <TableCell className="py-1.5 text-xs font-medium text-green-800">Closing Balance</TableCell>
                      <TableCell className="py-1.5 text-xs text-right font-medium">{formatNumber(selectedRecord.closing_balance_amount)}</TableCell>
                      <TableCell className="py-1.5 text-xs text-right">{formatNumber(selectedRecord.closing_balance_rate)}</TableCell>
                      <TableCell className="py-1.5 text-xs text-right font-semibold text-green-700">
                        {formatNumber(calculateLKRAmount(selectedRecord.closing_balance_amount, selectedRecord.closing_balance_rate))}
                      </TableCell>
                      <TableCell className="py-1.5 text-xs text-right">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      )}
    </>
  );
};

export default DailySummaryTable;