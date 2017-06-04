<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'orders';
    protected $timestamps = false;
}
