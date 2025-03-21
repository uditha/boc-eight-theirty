<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\UsdLkrDaily;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class UsdLkrController extends Controller
{
    public function index()
    {
        $records = UsdLkrDaily::select('*')
            ->orderBy('record_date')
            ->get()
            ->map(function ($record) {
                return [
                    'record_date' => $record->record_date->format('Y-m-d'),
                    'usd_rate' => $record->usd_rate,
                    'exchange_house_buying' => $record->exchange_house_buying,
                    'foreign_holding' => $record->foreign_holding,
                    'money_products_buying' => $record->money_products_buying,
                    'ir_buying' => $record->ir_buying,
                    'inter_bank_buying' => $record->inter_bank_buying,
                    'inter_bank_selling' => $record->inter_bank_selling,
                    'central_bank_buying' => $record->central_bank_buying,
                    'central_bank_selling' => $record->central_bank_selling,
                    'cpc_selling' => $record->cpc_selling,
                ];
            });

        return Inertia::render('usd-lkr/index', [
            'records' => $records,
        ]);
    }

}

