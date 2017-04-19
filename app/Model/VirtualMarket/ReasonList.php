<?php

namespace App\Model\VirtualMarket;

use Illuminate\Database\Eloquent\Model;

class ReasonList extends Model
{

    protected $connection = 'virtual_market';
    protected $table = 'reason_list';
    public $timestamps = false;
}
