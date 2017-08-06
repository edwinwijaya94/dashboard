<?php

// feedback
$factory->define(App\User::class, function (Faker\Generator $faker) {

    return [

        'role_id' => 4,
        'name' => $faker->name,
        'email' => $faker->unique()->email,
        'password' => bcrypt('secret'),
        'username' => $faker->unique()->userName,
        'phone_number' => $faker->unique()->phoneNumber,
        'address' => $faker->unique()->address,
    ];
});