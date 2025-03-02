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
                    'open_bid' => $record->open_bid,
                    'open_offer' => $record->open_offer,
                    'close_bid' => $record->close_bid,
                    'close_offer' => $record->close_offer,
                    'exchange_house_buying' => $record->exchange_house_buying,
                    'exchange_house_average_buy_rate' => $record->exchange_house_average_buy_rate,
                    'money_products_buying' => $record->money_products_buying,
                    'money_products_average_buy_rate' => $record->money_products_average_buy_rate,
                    'ir_buying' => $record->ir_buying,
                    'ir_average_buy_rate' => $record->ir_average_buy_rate,
                    'korea' => $record->korea,
                    'israel' => $record->israel,
                    'qatar' => $record->qatar,
                    'uae' => $record->uae,
                    'oman' => $record->oman,
                    'kuwait' => $record->kuwait,
                    'italy' => $record->italy,
                    'saudi_arabia' => $record->saudi_arabia,
                    'jordan' => $record->jordan,
                    'japan' => $record->japan,
                    'cyprus' => $record->cyprus,
                    'inter_bank_buying' => $record->inter_bank_buying,
                    'inter_bank_selling' => $record->inter_bank_selling,
                    'inter_bank_average_buy_rate' => $record->inter_bank_average_buy_rate,
                    'inter_bank_average_sell_rate' => $record->inter_bank_average_sell_rate,
                    'central_bank_buying' => $record->central_bank_buying,
                    'central_bank_selling' => $record->central_bank_selling,
                    'central_bank_average_buy_rate' => $record->central_bank_average_buy_rate,
                    'central_bank_average_sell_rate' => $record->central_bank_average_sell_rate,
                ];
            });

        return Inertia::render('usd-lkr/index', [
            'records' => $records,
        ]);
    }

}

