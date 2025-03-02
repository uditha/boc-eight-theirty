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
        Schema::create('fixed_income_daily', function (Blueprint $table) {
            $table->id();

            $table->date('record_date')->unique();
            // balances
            $table->decimal('tbill_balance', 20, 2)->default(0);
            $table->decimal('tbond_balance', 20, 2)->default(0);
            $table->decimal('govt_holding', 20, 2)->default(0);

            // market rates
            $table->decimal('tbill_rate_3m', 20, 2)->default(0);
            $table->decimal('tbill_rate_6m', 20, 2)->default(0);
            $table->decimal('tbill_rate_1y', 20, 2)->default(0);

            // tbonds
            $table->decimal('tbond_rate_2y', 20, 2)->default(0);
            $table->decimal('tbond_rate_3y', 20, 2)->default(0);
            $table->decimal('tbond_rate_5y', 20, 2)->default(0);
            $table->decimal('tbond_rate_10y', 20, 2)->default(0);
            $table->decimal('tbond_rate_15y', 20, 2)->default(0);


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixed_income_dailies');
    }
};
