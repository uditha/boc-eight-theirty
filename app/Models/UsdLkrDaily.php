<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsdLkrDaily extends Model
{
    protected $table = 'usd_lkr_daily';

    protected $fillable = [
        'record_date',
        'usd_rate',
        'foreign_holding',
        'exchange_house_buying',
        'money_products_buying',
        'ir_buying',
        'inter_bank_buying',
        'inter_bank_selling',
        'central_bank_buying',
        'central_bank_selling',
        'cpc_selling',
    ];

    protected $casts = [
        'record_date' => 'date',
    ];
}
