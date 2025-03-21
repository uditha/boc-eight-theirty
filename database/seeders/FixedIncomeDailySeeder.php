<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class FixedIncomeDailySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Check if table exists before truncating
        if (Schema::hasTable('fixed_income_daily')) {
            // Use try-catch to handle any truncation issues
            try {
                DB::table('fixed_income_daily')->truncate();
            } catch (\Exception $e) {
                $this->command->error('Could not truncate table: ' . $e->getMessage());
                // Disable foreign key checks to allow truncation if that's the issue
                DB::statement('SET FOREIGN_KEY_CHECKS=0;');
                DB::table('fixed_income_daily')->truncate();
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            }
        }

        // Define start and end dates
        $startDate = Carbon::create(2024, 12, 31);
        $endDate = Carbon::create(2025, 3, 21);

        // Calculate number of days in range correctly
        $daysCount = $startDate->diffInDays($endDate) + 1; // +1 to include both start and end dates

        $this->command->info("Seeding $daysCount days of fixed income data");

        // Create records for each day in the range
        for ($i = 0; $i < $daysCount; $i++) {
            $date = $startDate->copy()->addDays($i);

            // Random fluctuation for rates to simulate real market conditions
            $baseRate3m = 8.50; // Base 3-month rate for Sri Lanka
            $baseRate6m = 8.75;
            $baseRate1y = 9.25;
            $baseRate2y = 9.75;
            $baseRate3y = 10.20;
            $baseRate5y = 11.00;
            $baseRate10y = 11.75;
            $baseRate15y = 12.25;

            $fluctuation3m = mt_rand(-20, 20) / 100; // Random fluctuation between -0.2 and +0.2
            $fluctuation6m = mt_rand(-25, 25) / 100;
            $fluctuation1y = mt_rand(-30, 30) / 100;
            $fluctuation2y = mt_rand(-35, 35) / 100;
            $fluctuation3y = mt_rand(-40, 40) / 100;
            $fluctuation5y = mt_rand(-45, 45) / 100;
            $fluctuation10y = mt_rand(-50, 50) / 100;
            $fluctuation15y = mt_rand(-55, 55) / 100;

            // Fix potential rounding issues by using floor/ceiling
            $tbillBalance = round(830.00 + (mt_rand(-15, 20) / 100 * 830.00), 2);
            $tbondBalance = round(1950.00 + (mt_rand(-25, 30) / 100 * 1950.00), 2);
            $govtHolding = round(2500.00 + (mt_rand(-20, 25) / 100 * 1500.00), 2);

            try {
                DB::table('fixed_income_daily')->insert([
                    'record_date' => $date->format('Y-m-d'),

                    // Small random variations in balances for Sri Lanka with explicit rounding
                    'tbill_balance' => $tbillBalance,
                    'tbond_balance' => $tbondBalance,
                    'govt_holding' => $govtHolding,

                    // Market rates with random fluctuation to simulate real data
                    'tbill_rate_3m' => round($baseRate3m + $fluctuation3m, 2),
                    'tbill_rate_6m' => round($baseRate6m + $fluctuation6m, 2),
                    'tbill_rate_1y' => round($baseRate1y + $fluctuation1y, 2),
                    'tbond_rate_2y' => round($baseRate2y + $fluctuation2y, 2),
                    'tbond_rate_3y' => round($baseRate3y + $fluctuation3y, 2),
                    'tbond_rate_5y' => round($baseRate5y + $fluctuation5y, 2),
                    'tbond_rate_10y' => round($baseRate10y + $fluctuation10y, 2),
                    'tbond_rate_15y' => round($baseRate15y + $fluctuation15y, 2),

                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Display a dot for each successful insertion
                $this->command->info(".");
            } catch (\Exception $e) {
                $this->command->error("Error inserting record for {$date->format('Y-m-d')}: " . $e->getMessage());
            }
        }

        $this->command->info('Fixed income data seeding completed');
    }
}