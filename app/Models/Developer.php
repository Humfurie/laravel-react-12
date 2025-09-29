<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Developer extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'description',
        'address',
        'city',
        'province',
        'postal_code',
        'contact_person',
        'contact_email',
        'contact_phone',
        'website',
        'license_number',
        'established_year',
        'logo_url',
        'is_active',
    ];

    protected $casts = [
        'established_year' => 'integer',
        'postal_code' => 'integer',
        'is_active' => 'boolean',
    ];

    public function realEstateProjects(): HasMany
    {
        return $this->hasMany(RealEstateProject::class);
    }

    public function getActiveProjectsCountAttribute(): int
    {
        return $this->realEstateProjects()
            ->whereIn('status', ['pre-selling', 'ready_for_occupancy'])
            ->count();
    }
}
