<?php

use Illuminate\Database\Seeder;

class VirtualMarketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
    	// init order_status
    	DB::connection('virtual_market')->table('order_status')->insert([
            ['status' => 'success'],
            ['status' => 'failed'],
        ]);

        DB::connection('virtual_market')->table('reason')->insert([
            ['reason' => 'pelayanan baik'],
            ['reason' => 'pelayanan biasa saja'],
            ['reason' => 'pelayanan buruk'],
        ]);

        factory(App\Model\VirtualMarket\Order::class, 10)->create();
        factory(App\Model\VirtualMarket\ShoppingList::class, 25)->create();
        factory(App\Model\VirtualMarket\Product::class, 10)->create();
        factory(App\Model\VirtualMarket\UserFeedback::class, 10)->create();
        factory(App\Model\VirtualMarket\ReasonList::class, 10)->create();
        factory(App\Model\VirtualMarket\Garendong::class, 10)->create();
    }
}
