<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class UsdLkrDailySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        try {
            // Check if the table exists
            if (!Schema::hasTable('usd_lkr_daily')) {
                $this->command->error('Table usd_lkr_daily does not exist. Please run migrations first.');
                return;
            }

            // Clear existing records - using delete instead of truncate to avoid foreign key issues
            DB::table('usd_lkr_daily')->delete();

            // Create data from January 1 to today
            $startDate = Carbon::create(2025, 1, 1);
            $endDate = Carbon::now(); // March 4, 2025
            $dayCount = $startDate->diffInDays($endDate) + 1; // Ensure positive day count

            // Starting and ending rates
            $startRate = 300.00;  // Starting LKR to USD rate
            $endRate = 295.00;    // Ending LKR to USD rate

            // Debug info
            $this->command->info("Start date: {$startDate->toDateString()}");
            $this->command->info("End date: {$endDate->toDateString()}");
            $this->command->info("Day count: {$dayCount}");

            $this->command->info("Generating data for {$dayCount} days from {$startDate->toDateString()} to {$endDate->toDateString()}");
            $insertCount = 0;

            for ($i = 0; $i < $dayCount; $i++) {
                $currentDate = clone $startDate;
                $currentDate->addDays($i);

                // Skip weekends
                if ($currentDate->isWeekend()) {
                    continue;
                }

                // Calculate gradual decrease from start to end rate
                $progressRatio = $i / max(1, $dayCount - 1);
                $baseRate = $startRate - ($progressRatio * ($startRate - $endRate));

                // Create slight daily variations
                $dailyVariation = (mt_rand(-30, 30) / 100); // -0.30 to +0.30 variation
                $usdRate = round($baseRate + $dailyVariation, 2);

                // Exchange house buying amounts (now in millions)
                $exchangeHouseBuying = mt_rand(35, 80);

                // Other buying amounts (in millions)
                $moneyProductsBuying = mt_rand(15, 45);
                $irBuying = mt_rand(10, 30);

                // Bank transactions (in millions)
                $interBankBuying = mt_rand(20, 50);
                $interBankSelling = mt_rand(18, 45);

                $centralBankBuying = mt_rand(50, 90);
                $centralBankSelling = mt_rand(40, 85);

                // CPC (Ceylon Petroleum Corporation) selling (in millions)
                $cpcSelling = mt_rand(30, 80);

                // Foreign holding (in millions)
                $foreignHolding = mt_rand(800, 1200);

                try {
                    DB::table('usd_lkr_daily')->insert([
                        'record_date' => $currentDate->toDateString(),
                        'usd_rate' => $usdRate,
                        'foreign_holding' => $foreignHolding,
                        'exchange_house_buying' => $exchangeHouseBuying,
                        'money_products_buying' => $moneyProductsBuying,
                        'ir_buying' => $irBuying,
                        'inter_bank_buying' => $interBankBuying,
                        'inter_bank_selling' => $interBankSelling,
                        'central_bank_buying' => $centralBankBuying,
                        'central_bank_selling' => $centralBankSelling,
                        'cpc_selling' => $cpcSelling,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $insertCount++;
                } catch (\Exception $e) {
                    $this->command->error("Error inserting record for {$currentDate->toDateString()}: {$e->getMessage()}");
                }
            }

            $this->command->info("Successfully inserted {$insertCount} records");

        } catch (\Exception $e) {
            $this->command->error("Seeder failed: {$e->getMessage()}");
            $this->command->error($e->getTraceAsString());
        }
    }
}