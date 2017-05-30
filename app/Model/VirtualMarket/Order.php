<?php

namespace App\Model\VirtualMarket;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{

    protected $connection = 'virtual_market';
    protected $table = 'orders';
    // public $timestamps = false;
}
