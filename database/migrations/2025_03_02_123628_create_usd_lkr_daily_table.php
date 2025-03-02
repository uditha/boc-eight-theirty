<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('usd_lkr_daily', function (Blueprint $table) {
            $table->id();
            $table->date('record_date');

            // market open and close bid and offer rates
            $table->decimal('open_bid', 10, 2)->nullable();
            $table->decimal('open_offer', 10, 2)->nullable();
            $table->decimal('close_bid', 10, 2)->nullable();
            $table->decimal('close_offer', 10, 2)->nullable();

            // Exchange house buying amount and average rate
            $table->decimal('exchange_house_buying', 20, 2)->nullable();
            $table->decimal('exchange_house_average_buy_rate', 20, 2)->nullable();

            // money products buying amount and average rate
            $table->decimal('money_products_buying', 20, 2)->nullable();
            $table->decimal('money_products_average_buy_rate', 20, 2)->nullable();

            // IR buying amount and average rate
            $table->decimal('ir_buying', 20, 2)->nullable();
            $table->decimal('ir_average_buy_rate', 20, 2)->nullable();


            // exchnage house buying county wise
            $table->decimal('korea', 20, 2)->nullable();
            // israel amount
            $table->decimal('israel', 20, 2)->nullable();
            // qatar amount
            $table->decimal('qatar', 20, 2)->nullable();
            // UAE amount
            $table->decimal('uae', 20, 2)->nullable();
            // oman amount
            $table->decimal('oman', 20, 2)->nullable();
            // kuwait amount
            $table->decimal('kuwait', 20, 2)->nullable();
            // italy amount
            $table->decimal('italy', 20, 2)->nullable();
            // saudi arabia amount
            $table->decimal('saudi_arabia', 20, 2)->nullable();
            // jordan amount
            $table->decimal('jordan', 20, 2)->nullable();
            // japan amount
            $table->decimal('japan', 20, 2)->nullable();
            // cyprus amount
            $table->decimal('cyprus', 20, 2)->nullable();




            // Inter bank buying and selling amount and average rates
            $table->decimal('inter_bank_buying', 20, 2)->nullable();
            $table->decimal('inter_bank_selling', 20, 2)->nullable();
            $table->decimal('inter_bank_average_buy_rate', 20, 2)->nullable();
            $table->decimal('inter_bank_average_sell_rate', 20, 2)->nullable();

            // Central bank buying and selling amount and average rates
            $table->decimal('central_bank_buying', 20, 2)->nullable();
            $table->decimal('central_bank_selling', 20, 2)->nullable();
            $table->decimal('central_bank_average_buy_rate', 20, 2)->nullable();
            $table->decimal('central_bank_average_sell_rate', 20, 2)->nullable();

            // selling to CPC amount and average rates
            $table->decimal('cpc_selling', 20, 2)->nullable();
            $table->decimal('cpc_average_sell_rate', 20, 2)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usd_lkr_dailies');
    }
};
