<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'ratings';
    public $timestamps = false;
}
