<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Technology extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'technologies';

    protected $fillable = [
        'name',
        'slug',
        'svg_data',
        'category',
        'skill_id',
    ];

    protected $casts = [
        'svg_data' => 'json',
    ];

    public function skill(): BelongsTo
    {

    }
}
