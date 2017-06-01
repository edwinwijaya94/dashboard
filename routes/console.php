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
	if($init == 'yes') {
		// order_status
    	DB::connection('virtual_market')->table('order_statuses')->insert([
            ['status' => 'success'],
            ['status' => 'failed'],
        ]);
    	// reasons
        DB::connection('virtual_market')->table('reasons')->insert([
            ['reason' => 'pelayanan baik'],
            ['reason' => 'pelayanan biasa saja'],
            ['reason' => 'pelayanan buruk'],
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

	}
	if($system == 'vm') {
	    factory(App\Model\VirtualMarket\Order::class, $num)->create();
	    factory(App\Model\VirtualMarket\OrderLine::class, $num*3)->create();
	    factory(App\Model\VirtualMarket\Product::class, $num)->create();
	    factory(App\Model\VirtualMarket\UserFeedback::class, $num)->create();
	    factory(App\Model\VirtualMarket\Garendong::class, $num)->create();
	} else if($system == 'mp') {

	}
})->describe('Seed db with specific number of records');
