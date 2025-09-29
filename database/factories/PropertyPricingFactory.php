<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PropertyPricing>
 */
class PropertyPricingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalContractPrice = $this->faker->randomFloat(2, 3000000, 25000000); // ₱3M to ₱25M
        $reservationFee = $this->faker->randomFloat(2, 50000, 200000); // ₱50K to ₱200K
        $downpaymentPercentage = $this->faker->randomElement([10, 15, 20, 25, 30]);
        $downpaymentAmount = $totalContractPrice * ($downpaymentPercentage / 100);
        $equityTermsMonths = $this->faker->randomElement([12, 18, 24, 36]);
        $monthlyEquity = ($downpaymentAmount - $reservationFee) / $equityTermsMonths;
        $bankFinancingPercentage = $this->faker->randomElement([70, 75, 80, 85]);
        $bankFinancingAmount = $totalContractPrice * ($bankFinancingPercentage / 100);

        return [
            'reservation_fee' => $reservationFee,
            'total_contract_price' => $totalContractPrice,
            'net_selling_price' => $totalContractPrice * 0.95, // 5% discount from TCP
            'currency' => 'PHP',
            'downpayment_percentage' => $downpaymentPercentage,
            'downpayment_amount' => $downpaymentAmount,
            'equity_terms_months' => $equityTermsMonths,
            'monthly_equity' => $monthlyEquity,
            'balloon_payment' => $this->faker->optional(0.3)->randomFloat(2, 500000, 2000000),
            'balloon_payment_month' => $this->faker->optional(0.3)->numberBetween(6, $equityTermsMonths),
            'bank_financing_amount' => $bankFinancingAmount,
            'bank_financing_percentage' => $bankFinancingPercentage,
            'miscellaneous_fees_included' => $this->faker->boolean(70),
            'transfer_fee_percentage' => $this->faker->randomFloat(2, 0.5, 2.0),
            'move_in_fee_percentage' => $this->faker->randomFloat(2, 1.0, 3.0),
            'association_dues_monthly' => $this->faker->randomFloat(2, 2000, 8000),
            'parking_slot_price' => $this->faker->optional(0.8)->randomFloat(2, 800000, 2500000),
            'payment_scheme_name' => $this->faker->randomElement([
                'Standard Payment Scheme',
                'Flexible Payment Terms',
                'Early Move-in Option',
                'Extended Payment Plan',
                'Premium Package'
            ]),
            'payment_notes' => $this->faker->optional(0.6)->paragraph(),
        ];
    }
}
