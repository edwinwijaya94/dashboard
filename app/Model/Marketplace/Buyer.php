<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Buyer extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'buyers';
    public $timestamps = false;
}
