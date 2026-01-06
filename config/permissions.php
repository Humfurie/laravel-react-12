<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Permission Actions
    |--------------------------------------------------------------------------
    |
    | These are the default actions that will be created for each resource
    | when generating permissions automatically from models.
    |
    */
    'default_actions' => [
        'viewAny',      // List/index - view all records
        'view',         // Show - view single record
        'create',       // Create new record
        'update',       // Edit/update existing record
        'delete',       // Delete record
        'restore',      // Restore soft-deleted record
        'forceDelete',  // Permanently delete record
    ],

    /*
    |--------------------------------------------------------------------------
    | Excluded Models
    |--------------------------------------------------------------------------
    |
    | Models listed here will be excluded from automatic permission generation.
    | By default, Permission, Role, and User are excluded to prevent conflicts.
    |
    */
    'excluded_models' => [
        'Permission',
        'Role',
        'User',
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Resource Names
    |--------------------------------------------------------------------------
    |
    | Override the default kebab-case resource name for specific models.
    | Format: 'ModelName' => 'custom-resource-name'
    |
    */
    'custom_resource_names' => [
        // 'RealEstateProject' => 'realestate-project',
        // 'PropertyPricing' => 'property-pricing',
    ],

    /*
    |--------------------------------------------------------------------------
    | Model-Specific Actions
    |--------------------------------------------------------------------------
    |
    | Define custom actions for specific models. If not specified,
    | the default actions will be used.
    |
    */
    'model_actions' => [
        // 'Blog' => ['viewAny', 'view', 'create', 'update', 'delete', 'publish', 'unpublish'],
        // 'User' => ['viewAny', 'view', 'create', 'update', 'delete', 'ban', 'unban'],
    ],
];
