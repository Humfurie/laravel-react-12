<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FinancingOption>
 */
class FinancingOptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $banks = ['BDO', 'BPI', 'Metrobank', 'Security Bank', 'UnionBank', 'RCBC', 'EastWest Bank'];
        $loanTermYears = $this->faker->randomElement([5, 10, 15, 20, 25, 30]);
        $loanToValue = $this->faker->randomFloat(2, 60, 90);
        $interestRate = $this->faker->randomFloat(2, 4, 10);
        $monthlyAmortization = $this->faker->randomFloat(2, 10000, 100000);

        return [
            'bank_name' => $this->faker->randomElement($banks),
            'loan_to_value_ratio' => $loanToValue,
            'interest_rate' => $interestRate,
            'loan_term_years' => $loanTermYears,
            'monthly_amortization' => $monthlyAmortization,
            'processing_fee' => $this->faker->randomFloat(2, 5000, 50000),
            'requirements' => [
                'Valid ID',
                'Proof of Income',
                'ITR for the last 2 years',
                'Certificate of Employment',
            ],
            'is_active' => $this->faker->boolean(80),
        ];
    }
}
