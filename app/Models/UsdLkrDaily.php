<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsdLkrDaily extends Model
{
    protected $table = 'usd_lkr_daily';

    protected $fillable = [
        'record_date',
        'open_bid',
        'open_offer',
        'close_bid',
        'close_offer',
        'exchange_house_buying',
        'exchange_house_average_buy_rate',
        'money_products_buying',
        'money_products_average_buy_rate',
        'ir_buying',
        'ir_average_buy_rate',
        'korea',
        'israel',
        'qatar',
        'uae',
        'oman',
        'kuwait',
        'italy',
        'saudi_arabia',
        'jordan',
        'japan',
        'cyprus',
        'inter_bank_buying',
        'inter_bank_selling',
        'inter_bank_average_buy_rate',
        'inter_bank_average_sell_rate',
        'central_bank_buying',
        'central_bank_selling',
        'central_bank_average_buy_rate',
        'central_bank_average_sell_rate',
    ];

    protected $casts = [
        'record_date' => 'date',
    ];
}
