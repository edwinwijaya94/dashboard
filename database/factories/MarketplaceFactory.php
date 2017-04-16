<?php

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| Here you may define all of your model factories. Model factories give
| you a convenient way to create models for testing and seeding your
| database. Just tell the factory how a default model should look.
|
*/

// Marketplace transaction
$factory->define(App\Model\Marketplace\Transaction::class, function (Faker\Generator $faker) {

    return [
    	'datetime' => $faker->dateTimeBetween($startDate = '-1 year', $endDate = 'now', $timezone = date_default_timezone_get()),
        'seller_type' => $faker->randomElement($array = array ('sentra','perorangan')),
        'seller_id' => $faker->randomDigit,
        'buyer_id' => $faker->randomDigit,
        'product_id' => $faker->randomDigit,
        'quantity' => $faker->randomDigit,
        'amount' => $faker->numberBetween($min = 5000, $max = 150000),
        'payment_method' => $faker->randomElement($array = array ('cod','credit_card','debit_card')),
        'delivery_id' => $faker->randomDigit,
        'status' => $faker->randomElement($array = array ('ordered','on_delivery','closed')),
    ];
});
