<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'sellers';
    protected $timestamps = false;
}
