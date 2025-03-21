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
            $table->decimal('usd_rate', 10, 2)->nullable();
            $table->decimal('exchange_house_buying', 20, 2)->nullable();
            $table->decimal('foreign_holding', 20, 2)->nullable();
            $table->decimal('money_products_buying', 20, 2)->nullable();
            $table->decimal('ir_buying', 20, 2)->nullable();
            $table->decimal('inter_bank_buying', 20, 2)->nullable();
            $table->decimal('inter_bank_selling', 20, 2)->nullable();
            $table->decimal('central_bank_buying', 20, 2)->nullable();
            $table->decimal('central_bank_selling', 20, 2)->nullable();
            $table->decimal('cpc_selling', 20, 2)->nullable();

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
