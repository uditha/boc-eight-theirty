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
            // Using the correct year - 2023 (since today is March 2, 2025)
            $startDate = Carbon::create(2025, 1, 1);
            $endDate = Carbon::now(); // March 2, 2025
            $dayCount = $startDate->diffInDays($endDate) + 1; // Ensure positive day count

            // Starting and ending rates
            $startBidRate = 300.00;  // Starting LKR to USD bid rate
            $endBidRate = 295.00;    // Ending LKR to USD bid rate
            $spreadAmount = 3.25;    // Spread between bid and offer

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
                $baseBidRate = $startBidRate - ($progressRatio * ($startBidRate - $endBidRate));
                $baseOfferRate = $baseBidRate + $spreadAmount;

                // Create slight daily variations
                $dailyVariation = (mt_rand(-30, 30) / 100); // -0.30 to +0.30 variation

                $openBid = round($baseBidRate + $dailyVariation, 2);
                $openOffer = round($baseOfferRate + $dailyVariation, 2);

                // Close rates with slight intraday variation
                $intradayVariation = (mt_rand(-20, 30) / 100); // -0.20 to +0.30 variation
                $closeBid = round($openBid + $intradayVariation, 2);
                $closeOffer = round($openOffer + $intradayVariation, 2);

                // Exchange house buying amounts
                $exchangeHouseBuying = mt_rand(350000, 1200000);
                $exchangeHouseRate = round($openBid - (mt_rand(10, 50) / 10), 2); // Slightly lower than open bid

                // Create country-wise breakdowns that sum to the total exchange house buying
                $countries = ['korea', 'israel', 'qatar', 'uae', 'oman', 'kuwait', 'italy', 'saudi_arabia', 'jordan', 'japan', 'cyprus'];
                $countryAmounts = $this->distributeAmountAcrossCountries($exchangeHouseBuying, $countries);

                // Other buying amounts
                $moneyProductsBuying = mt_rand(150000, 450000);
                $moneyProductsRate = round($openBid - (mt_rand(15, 60) / 10), 2);

                $irBuying = mt_rand(100000, 300000);
                $irRate = round($openBid - (mt_rand(5, 40) / 10), 2);

                // Bank transactions
                $interBankBuying = mt_rand(2000000, 5000000);
                $interBankSelling = mt_rand(1800000, 4500000);
                $interBankBuyRate = round($openBid - (mt_rand(2, 15) / 10), 2);
                $interBankSellRate = round($openOffer + (mt_rand(2, 15) / 10), 2);

                $centralBankBuying = mt_rand(5000000, 15000000);
                $centralBankSelling = mt_rand(4000000, 12000000);
                $centralBankBuyRate = round($openBid - (mt_rand(1, 10) / 10), 2);
                $centralBankSellRate = round($openOffer + (mt_rand(1, 10) / 10), 2);

                // CPC (Ceylon Petroleum Corporation) selling
                $cpcSelling = mt_rand(3000000, 8000000);
                $cpcSellRate = round($openOffer + (mt_rand(5, 25) / 10), 2);

                try {
                    DB::table('usd_lkr_daily')->insert([
                        'record_date' => $currentDate->toDateString(),
                        'open_bid' => $openBid,
                        'open_offer' => $openOffer,
                        'close_bid' => $closeBid,
                        'close_offer' => $closeOffer,
                        'exchange_house_buying' => $exchangeHouseBuying,
                        'exchange_house_average_buy_rate' => $exchangeHouseRate,
                        'money_products_buying' => $moneyProductsBuying,
                        'money_products_average_buy_rate' => $moneyProductsRate,
                        'ir_buying' => $irBuying,
                        'ir_average_buy_rate' => $irRate,
                        'korea' => $countryAmounts['korea'],
                        'israel' => $countryAmounts['israel'],
                        'qatar' => $countryAmounts['qatar'],
                        'uae' => $countryAmounts['uae'],
                        'oman' => $countryAmounts['oman'],
                        'kuwait' => $countryAmounts['kuwait'],
                        'italy' => $countryAmounts['italy'],
                        'saudi_arabia' => $countryAmounts['saudi_arabia'],
                        'jordan' => $countryAmounts['jordan'],
                        'japan' => $countryAmounts['japan'],
                        'cyprus' => $countryAmounts['cyprus'],
                        'inter_bank_buying' => $interBankBuying,
                        'inter_bank_selling' => $interBankSelling,
                        'inter_bank_average_buy_rate' => $interBankBuyRate,
                        'inter_bank_average_sell_rate' => $interBankSellRate,
                        'central_bank_buying' => $centralBankBuying,
                        'central_bank_selling' => $centralBankSelling,
                        'central_bank_average_buy_rate' => $centralBankBuyRate,
                        'central_bank_average_sell_rate' => $centralBankSellRate,
                        'cpc_selling' => $cpcSelling,
                        'cpc_average_sell_rate' => $cpcSellRate,
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

    /**
     * Distribute a total amount across multiple countries
     * 
     * @param float $totalAmount The total amount to distribute
     * @param array $countries List of country keys
     * @return array Associative array of country => amount
     */
    private function distributeAmountAcrossCountries(float $totalAmount, array $countries): array
    {
        $countryAmounts = [];
        $remainingAmount = $totalAmount;
        $remainingCountries = count($countries);

        // Give each country a proportional amount with some randomness
        foreach ($countries as $index => $country) {
            $remainingCountries--;

            if ($remainingCountries === 0) {
                // Last country gets the remainder to ensure we sum exactly to total
                $countryAmounts[$country] = round($remainingAmount, 2);
            } else {
                // Calculate a percentage of the remaining amount
                $percentage = mt_rand(10, 30) / 100;
                $amount = round($remainingAmount * $percentage, 2);

                // Ensure we never exceed the remaining amount
                $amount = min($amount, $remainingAmount);

                $countryAmounts[$country] = $amount;
                $remainingAmount -= $amount;
            }
        }

        return $countryAmounts;
    }
}