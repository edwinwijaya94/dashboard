<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Sentra extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'sentra';
    public $timestamps = false;
}
