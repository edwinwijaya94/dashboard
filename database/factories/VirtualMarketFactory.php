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

// Virtual market order
$factory->define(App\Model\VirtualMarket\Order::class, function (Faker\Generator $faker) {

    return [
        'total_product' => $faker->numberBetween($min = 1, $max = 10),
        'total_price' => $faker->numberBetween($min = 5000, $max = 150000),
        'order_type' => $faker->randomElement($array = array ('mobile','sms')), // app platform
        'created_at' => $faker->dateTimeBetween($startDate = '-1 month', $endDate = 'now', $timezone = date_default_timezone_get()),
        'order_status' => $faker->numberBetween($min = 1, $max = 3),
        'customer_id' => $faker->numberBetween($min = 1, $max = 100),
        'garendong_id' => $faker->numberBetween($min = 1, $max = 100),
        'rating' => $faker->numberBetween($min = 1, $max = 5),
    ];
});

// order line
$factory->define(App\Model\VirtualMarket\OrderLine::class, function (Faker\Generator $faker) {

    return [
        'quantity' => $faker->numberBetween($min = 1, $max = 10),
        'unit_id' => $faker->numberBetween($min = 1, $max = 3),
        'price' => $faker->numberBetween($min = 5000, $max = 150000),
        'is_priority' => $faker->boolean($chanceOfGettingTrue = 80),
        'is_available' => $faker->boolean($chanceOfGettingTrue = 80),
        'product_id' => $faker->numberBetween($min = 1, $max = 10),
        'order_id' => $faker->numberBetween($min = 1, $max = 100),
    ];
});

// product
$factory->define(App\Model\VirtualMarket\Product::class, function (Faker\Generator $faker) {

    return [

        'name' => $faker->word,
        'default_quantity' => $faker->numberBetween($min = 1, $max = 10),
        'default_unit_id' => $faker->numberBetween($min = 1, $max = 3),
        'price_min' => $faker->numberBetween($min = 5000, $max = 10000),
        'price_max' => $faker->numberBetween($min = 10001, $max = 25000),
        'product_img' => $faker->url,
        'is_available' => $faker->boolean($chanceOfGettingTrue = 80),
        'category_id' => $faker->numberBetween($min = 1, $max = 3),
    ];
});

// feedback
$factory->define(App\Model\VirtualMarket\UserFeedback::class, function (Faker\Generator $faker) {

    return [

        'order_id' => $faker->numberBetween($min = 1, $max = 100),
        'reason_id' => $faker->numberBetween($min = 1, $max = 3),
    ];
});

// garendong
$factory->define(App\Model\VirtualMarket\Garendong::class, function (Faker\Generator $faker) {

    return [

        'user_id' => $faker->numberBetween($min = 1, $max = 100),
        'number_of_allocation' => $faker->numberBetween($min = 1, $max = 10),
        'status' => $faker->numberBetween($min = 1, $max = 3),
        'rating' => $faker->numberBetween($min = 1, $max = 25),
        'num_rating' => $faker->numberBetween($min = 3, $max = 7)
    ];
});

// address
$factory->define(App\Model\VirtualMarket\Address::class, function (Faker\Generator $faker) {
    $cities = array('Payakumbuh');
    $districts = array('Payakumbuh Barat', 'Payakumbuh Timur', 'Payakumbuh Selatan', 'Payakumbuh Utara', 'Lamposi Tigo Nagari');
    return [

        'user_id' => $faker->numberBetween($min = 1, $max = 100),
        'city' => $faker->randomElement($cities),
        'district' => $faker->randomElement($districts),
        'address' => $faker->streetAddress,
        'latitude' => $faker->latitude($min = -0.274, $max = -0.184),
        'longitude' => $faker->latitude($min = 100.579, $max = 100.682)
    ];
});