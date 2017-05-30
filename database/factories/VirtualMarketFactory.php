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
        'order_at' => $faker->dateTimeBetween($startDate = '-1 year', $endDate = 'now', $timezone = date_default_timezone_get()),
        'orderstatus_id' => $faker->numberBetween($min = 1, $max = 2),
        'buyer_id' => $faker->numberBetween($min = 1, $max = 100),
        'garendong_id' => $faker->numberBetween($min = 1, $max = 100),
    ];
});

// shopping list
$factory->define(App\Model\VirtualMarket\ShoppingList::class, function (Faker\Generator $faker) {

    return [
        'quantity' => $faker->numberBetween($min = 1, $max = 10),
        'unit' => $faker->randomElement($array = array ('ons','buah')),
        'subtotal_price' => $faker->numberBetween($min = 5000, $max = 150000),
        'is_priority' => $faker->boolean($chanceOfGettingTrue = 80),
        'product_id' => $faker->numberBetween($min = 1, $max = 100),
        'order_id' => $faker->numberBetween($min = 1, $max = 100),
    ];
});

// product
$factory->define(App\Model\VirtualMarket\Product::class, function (Faker\Generator $faker) {

    return [

        'name' => $faker->word,
        'quantity' => $faker->numberBetween($min = 1, $max = 10),
        'unit_id' => $faker->numberBetween($min = 1, $max = 10),
        'price_min' => $faker->numberBetween($min = 5000, $max = 10000),
        'price_max' => $faker->numberBetween($min = 10001, $max = 25000),
        'file_img' => $faker->url,
        'is_available' => $faker->boolean($chanceOfGettingTrue = 80),
        'category_id' => $faker->numberBetween($min = 1, $max = 10),
    ];
});

// feedback
$factory->define(App\Model\VirtualMarket\UserFeedback::class, function (Faker\Generator $faker) {

    return [

        'order_id' => $faker->numberBetween($min = 1, $max = 100),
        'rating' => $faker->numberBetween($min = 1, $max = 5),
    ];
});

// reason list
$factory->define(App\Model\VirtualMarket\ReasonList::class, function (Faker\Generator $faker) {

    return [
        
        'user_feedback_id' => $faker->numberBetween($min = 1, $max = 100),
        'reason_id' => $faker->numberBetween($min = 1, $max = 3),
    ];
});

// garendong
$factory->define(App\Model\VirtualMarket\Garendong::class, function (Faker\Generator $faker) {

    return [

        'user_id' => $faker->numberBetween($min = 1, $max = 100),
        'number_of_allocation' => $faker->numberBetween($min = 1, $max = 10),
        'status' => $faker->numberBetween($min = 1, $max = 3),
        'rating' => $faker->numberBetween($min = 1, $max = 5),
        // 'rating' => $faker->randomFloat($nbMaxDecimals = 2, $min = 1, $max = 5),
    ];
});