<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Center extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'centers';
    protected $timestamps = false;
}
