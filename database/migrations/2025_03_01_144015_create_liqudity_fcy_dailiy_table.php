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
        Schema::create('liqudity_fcy_daily', function (Blueprint $table) {
            $table->id();
            $table->date('record_date');

            // FCUB Desk
            $table->decimal('usd_bal', 15, 2)->nullable();
            $table->decimal('usd_rate', 4, 2)->nullable();
            $table->decimal('eur_bal', 15, 2)->nullable();
            $table->decimal('eur_rate', 4, 2)->nullable();
            $table->decimal('gbp_bal', 15, 2)->nullable();
            $table->decimal('gbp_rate', 4, 2)->nullable();
            $table->decimal('aud_bal', 15, 2)->nullable();
            $table->decimal('aud_rate', 4, 2)->nullable();
            $table->decimal('nostro_bal', 15, 2)->nullable();
            $table->decimal('swaps', 15, 2)->nullable();
            $table->decimal('swap_cost', 15, 2)->nullable();
            $table->decimal('placement_on', 15, 2)->nullable();
            $table->decimal('placement_on_rate', 4, 2)->nullable();
            $table->decimal('placement_term', 15, 2)->nullable();
            $table->decimal('placement_term_rate', 4, 2)->nullable();

            // FCBU output
            $table->decimal('fcbu_payments', 15, 2)->nullable();

            // CPC payments
            $table->decimal('cpc_payments', 15, 2)->nullable();

            // DBU Desk
            // outflow value
            $table->decimal('import', 15, 2)->nullable();
            $table->decimal('pettha', 15, 2)->nullable();
            $table->decimal('fcbu', 15, 2)->nullable();
            $table->decimal('travel', 15, 2)->nullable();
            $table->decimal('branch_import', 15, 2)->nullable();
            $table->decimal('usd_unknown_inflows', 15, 2)->nullable();

            // Reference Rates
            $table->decimal('sofr', 15, 2)->nullable();
            $table->decimal('brent', 15, 2)->nullable();
            $table->decimal('nemex', 15, 2)->nullable();
            $table->decimal('gold', 15, 2)->nullable();

            // Foreing Interest Rates starting form fed_funds_rate
            $table->decimal('fed_fund_rate', 4, 2)->nullable();
            $table->decimal('uk_bank_rate', 4, 2)->nullable();
            $table->decimal('ecb_rate', 4, 2)->nullable();
            $table->decimal('aus_cash_rate', 4, 2)->nullable();
            $table->decimal('india_repo_rate', 4, 2)->nullable();
            $table->decimal('japan_rate', 4, 2)->nullable();
            $table->decimal('china_rate', 4, 2)->nullable();


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('liqudity_fcy_dailies');
    }
};
