<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    // Mutator
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = strtolower($value);
    }
}
