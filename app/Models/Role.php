<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected $table = 'roles';

    // Mutator
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = strtolower($value);
    }
}
