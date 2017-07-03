<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'products';
    public $timestamps = false;
}
