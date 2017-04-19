<?php

namespace App\Model\VirtualMarket;

use Illuminate\Database\Eloquent\Model;

class Garendong extends Model
{

    protected $connection = 'virtual_market';
    protected $table = 'garendongs';
    public $timestamps = false;
}
