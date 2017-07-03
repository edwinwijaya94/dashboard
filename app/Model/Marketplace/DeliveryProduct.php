<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class DeliveryProduct extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'delivery_products';
    public $timestamps = false;
}
