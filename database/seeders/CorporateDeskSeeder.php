<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CorporateDeskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing records before seeding
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('corporate_desks')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Start date and end date
        $startDate = Carbon::create(2024, 12, 31);
        $endDate = Carbon::today();

        // Initial balance and rate - starting base rate
        $balance = 500000.00;
        $baseRate = 297.50;  // Middle point between buy and sell

        $currentDate = clone $startDate;

        while ($currentDate->lte($endDate)) {
            // Skip weekends (Saturday and Sunday)
            if ($currentDate->isWeekend()) {
                $currentDate->addDay();
                continue;
            }

            // Current date for record
            $recordDate = clone $currentDate;

            // Slightly adjust base rate for the day (market fluctuation)
            $dailyBaseRate = $baseRate + $this->getRandomFloat(-0.5, 0.5);

            // Opening balance for the day
            $openingBalanceAmount = $balance;
            $openingBalanceRate = $dailyBaseRate;

            // Generate random data for inflows with buy rates (around 295)
            // Buy rates should be lower (around 295) since bank buys USD at lower rates
            $buyBaseRate = $dailyBaseRate - 2.5;  // Around 295 if daily base is 297.50

            $inflowCorporateAmount = $this->getRandomAmount(30000, 80000, 0.3);
            $inflowCorporateRate = $this->getBuyRate($buyBaseRate, 0.1, 0.5);

            $inflowPersonalAmount = $this->getRandomAmount(20000, 50000, 0.4);
            $inflowPersonalRate = $this->getBuyRate($buyBaseRate, 0.2, 0.7);

            $inflowFcbuAmount = $this->getRandomAmount(10000, 35000, 0.5);
            $inflowFcbuRate = $this->getBuyRate($buyBaseRate, 0.1, 0.4);

            $inflowPettahAmount = $this->getRandomAmount(5000, 20000, 0.6);
            $inflowPettahRate = $this->getBuyRate($buyBaseRate, 0.3, 0.8);

            $inflowExchangeHouseAmount = $this->getRandomAmount(15000, 40000, 0.5);
            $inflowExchangeHouseRate = $this->getBuyRate($buyBaseRate, 0.2, 0.6);

            $inflowOtherAmount = $this->getRandomAmount(10000, 30000, 0.4);
            $inflowOtherRate = $this->getBuyRate($buyBaseRate, 0.1, 0.4);

            $inflowImpAmount = $this->getRandomAmount(0, 15000, 0.7);
            $inflowImpRate = $this->getBuyRate($buyBaseRate, 0.2, 0.5);

            $inflowIrAmount = $this->getRandomAmount(0, 10000, 0.8);
            $inflowIrRate = $this->getBuyRate($buyBaseRate, 0.1, 0.3);

            $inflowInterbankAmount = $this->getRandomAmount(0, 25000, 0.7);
            $inflowInterbankRate = $this->getBuyRate($buyBaseRate, 0, 0.2);

            $inflowInternalEntriesAmount = $this->getRandomAmount(0, 8000, 0.8);
            $inflowInternalEntriesRate = $this->getBuyRate($buyBaseRate, 0, 0.3);

            // Calculate total inflows
            $totalInflowAmount =
                $inflowCorporateAmount +
                $inflowPersonalAmount +
                $inflowFcbuAmount +
                $inflowPettahAmount +
                $inflowExchangeHouseAmount +
                $inflowOtherAmount +
                $inflowImpAmount +
                $inflowIrAmount +
                $inflowInterbankAmount +
                $inflowInternalEntriesAmount;

            // Generate random data for outflows with sell rates (around 299-300)
            // Sell rates should be higher (around 299-300) since bank sells USD at higher rates
            $sellBaseRate = $dailyBaseRate + 2.0;  // Around 299.50 if daily base is 297.50

            $outflowCorporateAmount = $this->getRandomAmount(40000, 90000, 0.3);
            $outflowCorporateRate = $this->getSellRate($sellBaseRate, 0.1, 0.4);

            $outflowPersonalAmount = $this->getRandomAmount(25000, 60000, 0.4);
            $outflowPersonalRate = $this->getSellRate($sellBaseRate, 0.2, 0.5);

            $outflowTrAmount = $this->getRandomAmount(10000, 30000, 0.5);
            $outflowTrRate = $this->getSellRate($sellBaseRate, 0.3, 0.6);

            $outflowMetroTrAmount = $this->getRandomAmount(0, 20000, 0.7);
            $outflowMetroTrRate = $this->getSellRate($sellBaseRate, 0.2, 0.5);

            $outflowNugegodaAmount = $this->getRandomAmount(5000, 25000, 0.6);
            $outflowNugegodaRate = $this->getSellRate($sellBaseRate, 0.1, 0.4);

            $outflowPettahAmount = $this->getRandomAmount(0, 15000, 0.7);
            $outflowPettahRate = $this->getSellRate($sellBaseRate, 0.1, 0.3);

            $outflowOthersAmount = $this->getRandomAmount(10000, 35000, 0.5);
            $outflowOthersRate = $this->getSellRate($sellBaseRate, 0.2, 0.5);

            $outflowIrAmount = $this->getRandomAmount(0, 12000, 0.8);
            $outflowIrRate = $this->getSellRate($sellBaseRate, 0.1, 0.3);

            $outflowImpAmount = $this->getRandomAmount(0, 18000, 0.7);
            $outflowImpRate = $this->getSellRate($sellBaseRate, 0.2, 0.4);

            $outflowCpcAmount = $this->getRandomAmount(0, 10000, 0.8);
            $outflowCpcRate = $this->getSellRate($sellBaseRate, 0.1, 0.3);

            $outflowInterbankAmount = $this->getRandomAmount(0, 22000, 0.7);
            $outflowInterbankRate = $this->getSellRate($sellBaseRate, 0, 0.2);

            $outflowInternalEntriesAmount = $this->getRandomAmount(0, 7000, 0.8);
            $outflowInternalEntriesRate = $this->getSellRate($sellBaseRate, 0, 0.2);

            // Calculate total outflows
            $totalOutflowAmount =
                $outflowCorporateAmount +
                $outflowPersonalAmount +
                $outflowTrAmount +
                $outflowMetroTrAmount +
                $outflowNugegodaAmount +
                $outflowPettahAmount +
                $outflowOthersAmount +
                $outflowIrAmount +
                $outflowImpAmount +
                $outflowCpcAmount +
                $outflowInterbankAmount +
                $outflowInternalEntriesAmount;

            // Calculate closing balance
            $closingBalanceAmount = $openingBalanceAmount + $totalInflowAmount - $totalOutflowAmount;

            // Calculate weighted average inflow rate
            $weightedInflowRate = 0;
            if ($totalInflowAmount > 0) {
                $weightedInflowRate = (
                    ($inflowCorporateAmount * $inflowCorporateRate) +
                    ($inflowPersonalAmount * $inflowPersonalRate) +
                    ($inflowFcbuAmount * $inflowFcbuRate) +
                    ($inflowPettahAmount * $inflowPettahRate) +
                    ($inflowExchangeHouseAmount * $inflowExchangeHouseRate) +
                    ($inflowOtherAmount * $inflowOtherRate) +
                    ($inflowImpAmount * $inflowImpRate) +
                    ($inflowIrAmount * $inflowIrRate) +
                    ($inflowInterbankAmount * $inflowInterbankRate) +
                    ($inflowInternalEntriesAmount * $inflowInternalEntriesRate)
                ) / $totalInflowAmount;
            }

            // Calculate weighted average outflow rate
            $weightedOutflowRate = 0;
            if ($totalOutflowAmount > 0) {
                $weightedOutflowRate = (
                    ($outflowCorporateAmount * $outflowCorporateRate) +
                    ($outflowPersonalAmount * $outflowPersonalRate) +
                    ($outflowTrAmount * $outflowTrRate) +
                    ($outflowMetroTrAmount * $outflowMetroTrRate) +
                    ($outflowNugegodaAmount * $outflowNugegodaRate) +
                    ($outflowPettahAmount * $outflowPettahRate) +
                    ($outflowOthersAmount * $outflowOthersRate) +
                    ($outflowIrAmount * $outflowIrRate) +
                    ($outflowImpAmount * $outflowImpRate) +
                    ($outflowCpcAmount * $outflowCpcRate) +
                    ($outflowInterbankAmount * $outflowInterbankRate) +
                    ($outflowInternalEntriesAmount * $outflowInternalEntriesRate)
                ) / $totalOutflowAmount;
            }

            // Calculate margins
            $corporateMargin = 0;
            if ($inflowCorporateAmount > 0 && $outflowCorporateAmount > 0) {
                $corporateMargin = $outflowCorporateRate - $inflowCorporateRate;
            }

            $overallMargin = 0;
            if ($totalInflowAmount > 0 && $totalOutflowAmount > 0) {
                $overallMargin = $weightedOutflowRate - $weightedInflowRate;
            }

            // Calculate closing rate based on weighted average
            $closingBalanceRate = $dailyBaseRate + $this->getRandomFloat(-0.2, 0.2);

            // Insert the record
            DB::table('corporate_desks')->insert([
                'record_date' => $recordDate->format('Y-m-d'),

                'opening_balance_amount' => $openingBalanceAmount,
                'opening_balance_rate' => $openingBalanceRate,

                'inflow_corporate_amount' => $inflowCorporateAmount,
                'inflow_corporate_rate' => $inflowCorporateRate,
                'inflow_personal_amount' => $inflowPersonalAmount,
                'inflow_personal_rate' => $inflowPersonalRate,
                'inflow_fcbu_amount' => $inflowFcbuAmount,
                'inflow_fcbu_rate' => $inflowFcbuRate,
                'inflow_pettah_amount' => $inflowPettahAmount,
                'inflow_pettah_rate' => $inflowPettahRate,
                'inflow_exchange_house_amount' => $inflowExchangeHouseAmount,
                'inflow_exchange_house_rate' => $inflowExchangeHouseRate,
                'inflow_other_amount' => $inflowOtherAmount,
                'inflow_other_rate' => $inflowOtherRate,
                'inflow_imp_amount' => $inflowImpAmount,
                'inflow_imp_rate' => $inflowImpRate,
                'inflow_ir_amount' => $inflowIrAmount,
                'inflow_ir_rate' => $inflowIrRate,
                'inflow_interbank_amount' => $inflowInterbankAmount,
                'inflow_interbank_rate' => $inflowInterbankRate,
                'inflow_internal_entries_amount' => $inflowInternalEntriesAmount,
                'inflow_internal_entries_rate' => $inflowInternalEntriesRate,

                'outflow_corporate_amount' => $outflowCorporateAmount,
                'outflow_corporate_rate' => $outflowCorporateRate,
                'outflow_personal_amount' => $outflowPersonalAmount,
                'outflow_personal_rate' => $outflowPersonalRate,
                'outflow_tr_amount' => $outflowTrAmount,
                'outflow_tr_rate' => $outflowTrRate,
                'outflow_metro_tr_amount' => $outflowMetroTrAmount,
                'outflow_metro_tr_rate' => $outflowMetroTrRate,
                'outflow_nugegoda_amount' => $outflowNugegodaAmount,
                'outflow_nugegoda_rate' => $outflowNugegodaRate,
                'outflow_pettah_amount' => $outflowPettahAmount,
                'outflow_pettah_rate' => $outflowPettahRate,
                'outflow_others_amount' => $outflowOthersAmount,
                'outflow_others_rate' => $outflowOthersRate,
                'outflow_ir_amount' => $outflowIrAmount,
                'outflow_ir_rate' => $outflowIrRate,
                'outflow_imp_amount' => $outflowImpAmount,
                'outflow_imp_rate' => $outflowImpRate,
                'outflow_cpc_amount' => $outflowCpcAmount,
                'outflow_cpc_rate' => $outflowCpcRate,
                'outflow_interbank_amount' => $outflowInterbankAmount,
                'outflow_interbank_rate' => $outflowInterbankRate,
                'outflow_internal_entries_amount' => $outflowInternalEntriesAmount,
                'outflow_internal_entries_rate' => $outflowInternalEntriesRate,

                'closing_balance_amount' => $closingBalanceAmount,
                'closing_balance_rate' => $closingBalanceRate,

                'corporate_margin' => $corporateMargin,
                'overall_margin' => $overallMargin,

                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update balance and rate for next day
            $balance = $closingBalanceAmount;
            $baseRate = $dailyBaseRate + $this->getRandomFloat(-0.1, 0.1); // Small change for next day

            // Move to next day
            $currentDate->addDay();
        }
    }

    /**
     * Generate a random amount
     *
     * @param float $min Minimum amount
     * @param float $max Maximum amount
     * @param float $zeroProb Probability of returning zero
     * @return float
     */
    private function getRandomAmount($min, $max, $zeroProb = 0)
    {
        // Random chance to return zero
        if (mt_rand() / mt_getrandmax() < $zeroProb) {
            return 0;
        }

        return round(mt_rand($min * 100, $max * 100) / 100, 2);
    }

    /**
     * Generate a random float between min and max
     *
     * @param float $min
     * @param float $max
     * @return float
     */
    private function getRandomFloat($min, $max)
    {
        return $min + mt_rand() / mt_getrandmax() * ($max - $min);
    }

    /**
     * Generate a buy rate (around 295)
     *
     * @param float $baseRate Base buy rate
     * @param float $minDiff Minimum negative difference
     * @param float $maxDiff Maximum negative difference
     * @return float
     */
    private function getBuyRate($baseRate, $minDiff, $maxDiff)
    {
        $diff = $minDiff + (mt_rand() / mt_getrandmax()) * ($maxDiff - $minDiff);
        return round($baseRate - $diff, 6);
    }

    /**
     * Generate a sell rate (around 299-300)
     *
     * @param float $baseRate Base sell rate
     * @param float $minDiff Minimum positive difference
     * @param float $maxDiff Maximum positive difference
     * @return float
     */
    private function getSellRate($baseRate, $minDiff, $maxDiff)
    {
        $diff = $minDiff + (mt_rand() / mt_getrandmax()) * ($maxDiff - $minDiff);
        return round($baseRate + $diff, 6);
    }
}