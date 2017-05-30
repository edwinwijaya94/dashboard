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

Artisan::command('seed {system=vm} {num=100}', function ($system, $num) {
	$num = (int)$num;
	if($system == 'vm') {
	    factory(App\Model\VirtualMarket\Order::class, $num)->create();
	    factory(App\Model\VirtualMarket\ShoppingList::class, $num*3)->create();
	    factory(App\Model\VirtualMarket\Product::class, $num)->create();
	    factory(App\Model\VirtualMarket\UserFeedback::class, $num)->create();
	    factory(App\Model\VirtualMarket\ReasonList::class, $num)->create();
	    factory(App\Model\VirtualMarket\Garendong::class, $num)->create();
	} else if($system == 'mp') {

	}
})->describe('Seed db with specific number of records');
