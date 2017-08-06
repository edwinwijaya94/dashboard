<?php

namespace App;

// use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    
    protected $connection = 'user';
    protected $table = 'roles';

}
