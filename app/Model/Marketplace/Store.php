<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'stores';
    protected $timestamps = false;
}
