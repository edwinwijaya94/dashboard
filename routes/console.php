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
                ['status' => 'pembeli tidak di rumah'],
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
                ['unit_type' => 'common', 'unit' => 'kg'],
            ]);
            // converter
            DB::connection('virtual_market')->table('converters')->insert([
                ['unit_id' => 1, 'in_gram' => '100'],
                ['unit_id' => 2, 'in_gram' => '1000'],
            ]);
            // category
            DB::connection('virtual_market')->table('categories')->insert([
                ['name' => 'sayuran', 'category_img' => 'a.jpg'],
                ['name' => 'daging', 'category_img' => 'b.jpg'],
                ['name' => 'buah', 'category_img' => 'c.jpg'],
            ]);
            // pays
            DB::connection('virtual_market')->table('pays')->insert([
                ['parameter' => 'tarif_dasar', 'constant' => 1],
                ['parameter' => 'tarif_jarak', 'constant' => 2],
            ]);
            DB::connection('virtual_market')->table('undefine_words')->insert([
                ['undefine_word' => 'dgng', 'word' => ''],
                ['undefine_word' => 'jmb', 'word' => ''],
                ['undefine_word' => 'knkg', 'word' => ''],
            ]);
        }
	    factory(App\Model\VirtualMarket\Order::class, $num)->create();
	    factory(App\Model\VirtualMarket\OrderLine::class, $num*3)->create();
	    factory(App\Model\VirtualMarket\Product::class, $num)->create();
	    factory(App\Model\VirtualMarket\UserFeedback::class, $num)->create();
	    factory(App\Model\VirtualMarket\Garendong::class, $num)->create();
        // factory(App\Model\VirtualMarket\Address::class, $num)->create();
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

            // orderline status
            DB::connection('marketplace')->table('orderline_statuses')->insert([
                ['name' => 'success'],
                ['name' => 'produk habis'],
                ['name' => 'barang tidak sampai pembeli'],
            ]);            
        }
        factory(App\Model\Marketplace\Buyer::class, $num)->create();
        // factory(App\Model\Marketplace\Sentra::class, $num)->create();
        factory(App\Model\Marketplace\Store::class, $num)->create();
        factory(App\Model\Marketplace\Category::class, $num)->create();
        factory(App\Model\Marketplace\Product::class, 10)->create();
        factory(App\Model\Marketplace\DeliveryAgent::class, $num)->create();
        // factory(App\Model\Marketplace\StoreProduct::class, $num)->create();
        factory(App\Model\Marketplace\Order::class, $num)->create();
        factory(App\Model\Marketplace\OrderLine::class, $num*3)->create();
        factory(App\Model\Marketplace\Feedback::class, $num)->create();
        factory(App\Model\Marketplace\Rating::class, $num)->create();
	} else if($system == 'user') {
        DB::connection('user')->table('roles')->insert([
                ['name' => 'dashboard_admin'],
                ['name' => 'staf_dinas'],
                ['name' => 'staf_pasar'],
                ['name' => 'garendong'],
            ]);
        DB::connection('user')->table('users')->insert([
                [   
                    'role_id' => 1,
                    'name' => 'Kepala Disperindag',
                    'email' => 'disperindag@gmail.com',
                    'password' => bcrypt('12345'),
                    'username' => 'disperindag',
                    'phone_number' => '08123456789',
                    'address' => 'Kota Payakumbuh',
                ],
            ]);
        factory(App\User::class, 9)->create();
    }
})->describe('Seed db with specific number of records');
