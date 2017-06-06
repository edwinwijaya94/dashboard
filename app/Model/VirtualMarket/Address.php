<?php

namespace App\Model\VirtualMarket;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{

    protected $connection = 'virtual_market';
    protected $table = 'addresses';
    public $timestamps = false;
}
