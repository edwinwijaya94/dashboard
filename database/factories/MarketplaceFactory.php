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

// buyer
$factory->define(App\Model\Marketplace\Buyer::class, function (Faker\Generator $faker) {

    return [

        'user_id' => $faker->numberBetween($min = 1, $max = 100),
    ];
});

// store
$factory->define(App\Model\Marketplace\Store::class, function (Faker\Generator $faker) {

    return [

        'sentra_id' => $faker->numberBetween($min = 1, $max = 5),
        'user_id' => $faker->numberBetween($min = 1, $max = 5),
        'name' => $faker->unique()->regexify('[A-Z]+'), 
        'description' => $faker->word,
        'image' => $faker->url,
        'bank_account' => $faker->unique()->regexify('[A-Z]+')
    ];
});

// category
$factory->define(App\Model\Marketplace\Category::class, function (Faker\Generator $faker) {

    return [

        // 'parent_id' => $faker->numberBetween($min = 1, $max = 100),
        'name' => $faker->unique()->regexify('[A-Z]+'), 
        'description' => $faker->word,
        'image' => $faker->url,
    ];
});

// product
$factory->define(App\Model\Marketplace\Product::class, function (Faker\Generator $faker) {

    return [

    	'category_id' => $faker->numberBetween($min = 1, $max = 10),
        // 'name' => $faker->unique()->regexify('[A-Z]+'),
        'name' => $faker->unique()->randomElement($array = array ('rendang daging','rendang telur','suir daging', 'rendang belut', 'rendang ubi', 'rendang ayam', 'rendang paru', 'rendang kambing', 'rendang kerang', 'rendang jagung')),
        'image' => $faker->url,
        'unit' => $faker->randomElement($array = array ('bungkus','ons')),
        'description' => $faker->word,
        'weight' => $faker->numberBetween($min = 1, $max = 10),
    ];
});

// sentra
$factory->define(App\Model\Marketplace\Sentra::class, function (Faker\Generator $faker) {

    return [

        'name' => $faker->word,
        'phone_number' => $faker->e164PhoneNumber,
        'description' => $faker->word,
        'image' => $faker->url,
    ];
});

// delivery agent
$factory->define(App\Model\Marketplace\DeliveryAgent::class, function (Faker\Generator $faker) {

    return [

        'name' => $faker->unique()->regexify('[A-Z]+'), 
        'phone_number' => $faker->e164PhoneNumber,
        'image' => $faker->url,
    ];
});

// order
$factory->define(App\Model\Marketplace\Order::class, function (Faker\Generator $faker) {

    return [
        'buyer_id' => $faker->numberBetween($min = 1, $max = 10),
        'payment_method_type_id' => $faker->numberBetween($min = 1, $max = 3),
        'buyer_address' => $faker->word,
        'buyer_city' => $faker->randomElement($array = array ('Payakumbuh', 'Padang', 'Medan', 'Banda Aceh', 'Bandung', 'Jakarta', 'Semarang', 'Yogyakarta', 'Surabaya', 'Pontianak', 'Palangkaraya', 'Banjarmasin', 'Manado', 'Makassar', 'Ambon', 'Denpasar', 'Jayapura')),
        'buyer_phone_number' => $faker->e164PhoneNumber,
        'store_invoice' => $faker->word,
        'created_at' => $faker->dateTimeBetween($startDate = '-5 month', $endDate = '+1 day', $timezone = 'Asia/Jakarta'),
    ];
});

// order line
$factory->define(App\Model\Marketplace\OrderLine::class, function (Faker\Generator $faker) {

    return [

        'order_id' => $faker->numberBetween($min = 1, $max = 100),
        'buyer_id' => $faker->numberBetween($min = 1, $max = 100),
        'product_id' => $faker->numberBetween($min = 1, $max = 10),
        'store_id' => $faker->numberBetween($min = 1, $max = 100),
        'delivery_agent_id' => $faker->numberBetween($min = 1, $max = 100),
        'subtotal' => $faker->numberBetween($min = 5000, $max = 150000),
        'orderline_status_id' => $faker->numberBetween($min = 1, $max = 3),
        // 'status' => $faker->randomElement($array = array ('success','failed')),
        'quantity' => $faker->numberBetween($min = 1, $max = 10),
        'note' => $faker->word,
        'created_at' => $faker->dateTimeBetween($startDate = '-5 month', $endDate = '+1 day', $timezone = 'Asia/Jakarta'),
    ];
});

// feedback
$factory->define(App\Model\Marketplace\Feedback::class, function (Faker\Generator $faker) {

    return [

        'orderline_id' => $faker->numberBetween($min = 1, $max = 100),
        'order_id' => $faker->numberBetween($min = 1, $max = 100),
        'buyer_id' => $faker->numberBetween($min = 1, $max = 10),
    ];
});

// rating
$factory->define(App\Model\Marketplace\Rating::class, function (Faker\Generator $faker) {

    return [

        'feedback_id' => $faker->numberBetween($min = 1, $max = 10),
        'value' => $faker->numberBetween($min = 1, $max = 5),
    ];
});

// store product
$factory->define(App\Model\Marketplace\StoreProduct::class, function (Faker\Generator $faker) {

    return [

        'store_id' => $faker->numberBetween($min = 1, $max = 100),
        'products_id' => $faker->unique()->numberBetween($min = 1, $max = 10),
        'price' => $faker->numberBetween($min = 5000, $max = 20000),
        'stock' => $faker->numberBetween($min = 1, $max = 100),
    ];
});