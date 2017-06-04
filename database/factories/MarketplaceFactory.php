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

// Marketplace order
$factory->define(App\Model\Marketplace\Order::class, function (Faker\Generator $faker) {

    return [
        'buyer_id' => $faker->numberBetween($min = 1, $max = 10),
        'store_id' => $faker->numberBetween($min = 5000, $max = 150000),
        'quantity' => $faker->randomElement($array = array ('mobile','sms')), // app platform
        'time' => $faker->dateTimeBetween($startDate = '-1 year', $endDate = 'now', $timezone = date_default_timezone_get()),
        'payment_method' => $faker->numberBetween($min = 1, $max = 2),
        'status' => $faker->randomElement($array = array ('success','failed')),
    ];
});
