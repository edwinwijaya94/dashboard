<?php

namespace App\Model\VirtualMarket;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{

    protected $connection = 'virtual_market';
    protected $table = 'products';
    public $timestamps = false;
}
