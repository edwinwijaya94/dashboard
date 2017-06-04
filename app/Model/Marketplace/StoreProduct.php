<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class StoreProduct extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'store_products';
    protected $timestamps = false;
}
