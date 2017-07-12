<?php

use Illuminate\Foundation\Inspiring;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->describe('Display an inspiring quote');

Artisan::command('seed {system=vm} {init=yes} {num=100}', function ($system, $init, $num) {
	
	$num = (int)$num;
	if($system == 'vm') {
        
        if($init == 'yes') {
            // order_status
            DB::connection('virtual_market')->table('order_statuses')->insert([
                ['status' => 'success'],
                ['status' => 'produk habis'],
                ['status' => 'tidak ada garendong'],
            ]);
            // reasons
            DB::connection('virtual_market')->table('reasons')->insert([
                ['reason' => 'pesanan tidak sesuai'],
                ['reason' => 'kualitas pesanan buruk'],
                ['reason' => 'pengantaran lama'],
            ]);
            // units
            DB::connection('virtual_market')->table('units')->insert([
                ['unit_type' => 'common', 'unit' => 'ons'],
                ['unit_type' => 'common', 'unit' => 'gram'],
                ['unit_type' => 'common', 'unit' => 'kilogram'],
            ]);
            // converter
            DB::connection('virtual_market')->table('converters')->insert([
                ['unit_id' => 1, 'in_gram' => '100'],
                ['unit_id' => 2, 'in_gram' => '1'],
                ['unit_id' => 3, 'in_gram' => '1000'],
            ]);
            // category
            DB::connection('virtual_market')->table('categories')->insert([
                ['name' => 'sayuran', 'category_img' => 'a.jpg'],
                ['name' => 'daging', 'category_img' => 'b.jpg'],
                ['name' => 'buah-buahan', 'category_img' => 'c.jpg'],
            ]);
        }
	    factory(App\Model\VirtualMarket\Order::class, $num)->create();
	    factory(App\Model\VirtualMarket\OrderLine::class, $num*3)->create();
	    factory(App\Model\VirtualMarket\Product::class, $num)->create();
	    factory(App\Model\VirtualMarket\UserFeedback::class, $num)->create();
	    factory(App\Model\VirtualMarket\Garendong::class, $num)->create();
        factory(App\Model\VirtualMarket\Address::class, $num)->create();
	} else if($system == 'mp') {

        if($init == 'yes') {
            // sentra
            DB::connection('marketplace')->table('sentra')->insert([
                ['name' => 'Rendang', 'phone_number' => '08123456789', 'image' => 'a', 'description' => 'a' ],
                ['name' => 'Coklat', 'phone_number' => '08123456789', 'image' => 'a', 'description' => 'a' ],
                ['name' => 'Kerajinan', 'phone_number' => '08123456789', 'image' => 'a', 'description' => 'a' ],
                ['name' => 'Batik', 'phone_number' => '08123456789', 'image' => 'a', 'description' => 'a' ],
                ['name' => 'Keripik', 'phone_number' => '08123456789', 'image' => 'a', 'description' => 'a' ],
            ]);

            // payment method
            DB::connection('marketplace')->table('payment_method_types')->insert([
                ['name' => 'transfer', 'type' => 'a', 'image' => 'a', 'description' => 'a' ],
                ['name' => 'kartu debit', 'type' => 'a', 'image' => 'a', 'description' => 'a' ],
                ['name' => 'kartu kredit', 'type' => 'a', 'image' => 'a', 'description' => 'a' ],
            ]);
        }
        factory(App\Model\Marketplace\Buyer::class, $num)->create();
        // factory(App\Model\Marketplace\Sentra::class, $num)->create();
        factory(App\Model\Marketplace\Store::class, $num)->create();
        factory(App\Model\Marketplace\Category::class, $num)->create();
        factory(App\Model\Marketplace\Product::class, $num)->create();
        factory(App\Model\Marketplace\DeliveryAgent::class, $num)->create();
        // factory(App\Model\Marketplace\StoreProduct::class, $num)->create();
        factory(App\Model\Marketplace\Order::class, $num)->create();
        factory(App\Model\Marketplace\OrderLine::class, $num*3)->create();
        factory(App\Model\Marketplace\Feedback::class, $num)->create();
        factory(App\Model\Marketplace\Rating::class, $num)->create();
	}
})->describe('Seed db with specific number of records');
