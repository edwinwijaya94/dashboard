<?php

namespace App\Model\VirtualMarket;

use Illuminate\Database\Eloquent\Model;

class Reason extends Model
{

    protected $connection = 'virtual_market';
    protected $table = 'reasons';
    public $timestamps = false;
}
