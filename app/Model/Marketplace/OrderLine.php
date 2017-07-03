<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class OrderLine extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'orderlines';
    public $timestamps = false;
}
