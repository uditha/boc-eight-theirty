<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\FixedIncomeCashflow;
use App\Models\FixedIncomeDaily;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class FixedIncomeController extends Controller
{
    public function index()
    {
        $records = FixedIncomeCashflow::select('*')
            ->orderBy('cf_date')
            ->get()
            ->map(function ($record) {
                return [
                    'security' => $record->security,
                    'maturity' => Carbon::parse($record->maturity)->format('Y-m-d'),
                    'amount' => $record->amount,
                    'coupon' => $record->coupon,
                    'cf_date' => Carbon::parse($record->cf_date)->format('Y-m-d'),
                    'coupon_amount' => $record->coupon_amount,
                    'capital' => $record->capital,
                ];
            });

        $dailyRecords = FixedIncomeDaily::select('*')
            ->orderBy('record_date')
            ->get()
            ->map(function ($record) {
                return [
                    'record_date' => Carbon::parse($record->record_date)->format('Y-m-d'),
                    'tbill_balance' => $record->tbill_balance,
                    'tbond_balance' => $record->tbond_balance,
                    'govt_holding' => $record->govt_holding,
                    'tbill_rate_3m' => $record->tbill_rate_3m,
                    'tbill_rate_6m' => $record->tbill_rate_6m,
                    'tbill_rate_1y' => $record->tbill_rate_1y,
                    'tbond_rate_2y' => $record->tbond_rate_2y,
                    'tbond_rate_3y' => $record->tbond_rate_3y,
                    'tbond_rate_5y' => $record->tbond_rate_5y,
                    'tbond_rate_10y' => $record->tbond_rate_10y,
                    'tbond_rate_15y' => $record->tbond_rate_15y,
                ];
            });



        return Inertia::render('fixed-income/index', [
            'fixedIncomeData' => $records,
            'fixedIncomeDailyData' => $dailyRecords,
        ]);
    }
}

