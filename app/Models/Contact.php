<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    use HasFactory;

    const TYPE_AGENT = 'agent';
    const TYPE_BROKER = 'broker';
    const TYPE_DEVELOPER_DIRECT = 'developer_direct';

    protected $fillable = [
        'property_id',
        'contact_type',
        'contact_name',
        'contact_email',
        'contact_phone',
        'agent_license',
        'company_name',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }
}
