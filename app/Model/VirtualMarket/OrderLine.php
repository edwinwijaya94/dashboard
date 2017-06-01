<?php

namespace App\Model\VirtualMarket;

use Illuminate\Database\Eloquent\Model;

class OrderLine extends Model
{

    protected $connection = 'virtual_market';
    protected $table = 'order_lines';
    public $timestamps = false;
}
