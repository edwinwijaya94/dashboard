<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'transaction';

}
