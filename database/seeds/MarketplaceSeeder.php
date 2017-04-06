<?php

use Illuminate\Database\Seeder;

class MarketplaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

    	// Marketplace transaction
        factory(App\Model\Marketplace\Transaction::class, 10)->create();
    }
}
