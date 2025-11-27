<?php

use App\Http\Controllers\Admin\AboutController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\BlogLocationController;
use App\Http\Controllers\Admin\ExpertiseController;
use App\Http\Controllers\Admin\GiveawayController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RealEstateController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ExperienceController;

Route::prefix('roles')->middleware('permission:role,viewAny')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->name('roles.index');
    Route::post('/', [RoleController::class, 'store'])->name('roles.store')->middleware('permission:role,create');
    Route::put('/{role}', [RoleController::class, 'update'])->name('roles.update')->middleware('permission:role,update');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->name('roles.destroy')->middleware('permission:role,delete');
    Route::patch('/{role}/restore', [RoleController::class, 'restore'])->name('roles.restore')->withTrashed()->middleware('permission:role,restore');
    Route::delete('/{role}/force', [RoleController::class, 'forceDestroy'])->name('roles.forceDestroy')->middleware('permission:role,forceDelete');
});

Route::prefix('users')->middleware('permission:user,viewAny')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('users.index');
    Route::post('/', [UserController::class, 'store'])->name('users.store')->middleware('permission:user,create');
    Route::put('/{user}', [UserController::class, 'update'])->name('users.update')->middleware('permission:user,update');
    Route::patch('/{user}/assign-role', [UserController::class, 'assignRole'])->name('users.assign-role')->middleware('permission:user,update');
    Route::delete('/{user}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('permission:user,delete');
    Route::patch('/{user}/restore', [UserController::class, 'restore'])->name('users.restore')->withTrashed()->middleware('permission:user,restore');
    Route::delete('/{user}/force', [UserController::class, 'forceDestroy'])->name('users.forceDestroy')->middleware('permission:user,forceDelete');
});

Route::prefix('permissions')->middleware('permission:permission,viewAny')->group(function () {
    Route::get('/', [PermissionController::class, 'index'])->name('permissions.index');
    Route::post('/', [PermissionController::class, 'store'])->name('permissions.store')->middleware('permission:permission,create');
    Route::put('/{permission}', [PermissionController::class, 'update'])->name('permissions.update')->middleware('permission:permission,update');
    Route::delete('/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy')->middleware('permission:permission,delete');
    Route::patch('/{permission}/restore', [PermissionController::class, 'restore'])->name('permissions.restore')->withTrashed()->middleware('permission:permission,restore');
    Route::delete('/{permission}/force', [PermissionController::class, 'forceDestroy'])->name('permissions.force')->middleware('permission:permission,forceDelete');
});

Route::prefix('about')->group(function () {
    Route::get('/', [AboutController::class, 'index'])->name('about.index');
    Route::post('/', [AboutController::class, 'store'])->name('about.store');
    Route::get('/history', [AboutController::class, 'listHistory'])->name('about.history.list');
    Route::get('/history/{about}', [AboutController::class, 'showHistory'])->name('about.history.show');
    Route::delete('/history/{about}', [AboutController::class, 'destroy'])->name('about.history.destroy');
    Route::delete('/history/{about}/force', [AboutController::class, 'forceDestroy'])->name('about.history.force-destroy');
    Route::patch('/history/{about}', [AboutController::class, 'restore'])->name('about.history.restore')->withTrashed();
    Route::patch('/{about}', [AboutController::class, 'setPrimary'])->name('about.set.primary');
});

Route::prefix('blogs')->middleware('permission:blog,viewAny')->group(function () {
    Route::get('/', [BlogController::class, 'index'])->name('blogs.index');
    Route::get('/create', [BlogController::class, 'create'])->name('blogs.create')->middleware('permission:blog,create');
    Route::post('/', [BlogController::class, 'store'])->name('blogs.store')->middleware('permission:blog,create');
    Route::get('/{blog}', [BlogController::class, 'edit'])->name('blogs.edit')->middleware('permission:blog,view');
    Route::put('/{blog}', [BlogController::class, 'update'])->name('blogs.update')->middleware('permission:blog,update');
    Route::delete('/{blog}', [BlogController::class, 'destroy'])->name('blogs.destroy')->middleware('permission:blog,delete');
    Route::patch('/{blog}/restore', [BlogController::class, 'restore'])->name('blogs.restore')->withTrashed()->middleware('permission:blog,restore');
    Route::delete('/{blog}/force', [BlogController::class, 'forceDestroy'])->name('blogs.force-destroy')->middleware('permission:blog,forceDelete');
    Route::post('/upload-image', [BlogController::class, 'uploadImage'])->name('blogs.upload-image')->middleware('permission:blog,create');

    // Blog location routes (travel maps)
    Route::prefix('{blog}/locations')->middleware('permission:blog,update')->group(function () {
        Route::post('/', [BlogLocationController::class, 'store'])->name('blogs.locations.store');
        Route::put('/{location}', [BlogLocationController::class, 'update'])->name('blogs.locations.update');
        Route::delete('/{location}', [BlogLocationController::class, 'destroy'])->name('blogs.locations.destroy');
        Route::post('/reorder', [BlogLocationController::class, 'reorder'])->name('blogs.locations.reorder');
        Route::post('/{location}/images', [BlogLocationController::class, 'uploadImage'])->name('blogs.locations.images.upload');
        Route::delete('/{location}/images/{image}', [BlogLocationController::class, 'deleteImage'])->name('blogs.locations.images.delete');
        Route::patch('/{location}/images/{image}/primary', [BlogLocationController::class, 'setPrimaryImage'])->name('blogs.locations.images.primary');
    });
});

Route::prefix('real-estate')->group(function () {
    // Main admin page - controller handles authorization for multiple resources
    Route::get('/', [RealEstateController::class, 'index'])->name('real-estate.index');

    // Developer routes
    Route::get('/developers/create', [RealEstateController::class, 'createDeveloper'])->name('real-estate.developers.create')->middleware('permission:developer,create');
    Route::post('/developers', [RealEstateController::class, 'storeDeveloper'])->name('real-estate.developers.store')->middleware('permission:developer,create');
    Route::get('/developers/{developer}/edit', [RealEstateController::class, 'editDeveloper'])->name('real-estate.developers.edit')->middleware('permission:developer,view');
    Route::put('/developers/{developer}', [RealEstateController::class, 'updateDeveloper'])->name('real-estate.developers.update')->middleware('permission:developer,update');
    Route::delete('/developers/{developer}', [RealEstateController::class, 'destroyDeveloper'])->name('real-estate.developers.destroy')->middleware('permission:developer,delete');

    // Project routes
    Route::get('/projects/create', [RealEstateController::class, 'createProject'])->name('real-estate.projects.create')->middleware('permission:realestate-project,create');
    Route::post('/projects', [RealEstateController::class, 'storeProject'])->name('real-estate.projects.store')->middleware('permission:realestate-project,create');
    Route::get('/projects/{project}/edit', [RealEstateController::class, 'editProject'])->name('real-estate.projects.edit')->middleware('permission:realestate-project,view');
    Route::put('/projects/{project}', [RealEstateController::class, 'updateProject'])->name('real-estate.projects.update')->middleware('permission:realestate-project,update');
    Route::delete('/projects/{project}', [RealEstateController::class, 'destroyProject'])->name('real-estate.projects.destroy')->middleware('permission:realestate-project,delete');

    // Property routes
    Route::get('/properties', [RealEstateController::class, 'indexProperty'])->name('real-estate.properties.index')->middleware('permission:property,viewAny');
    Route::get('/properties/create', [RealEstateController::class, 'createProperty'])->name('real-estate.properties.create')->middleware('permission:property,create');
    Route::post('/properties', [RealEstateController::class, 'storeProperty'])->name('real-estate.properties.store')->middleware('permission:property,create');
    Route::get('/properties/{property}/edit', [RealEstateController::class, 'editProperty'])->name('real-estate.properties.edit')->middleware('permission:property,view');
    Route::put('/properties/{property}', [RealEstateController::class, 'updateProperty'])->name('real-estate.properties.update')->middleware('permission:property,update');
    Route::delete('/properties/{property}', [RealEstateController::class, 'destroyProperty'])->name('real-estate.properties.destroy')->middleware('permission:property,delete');

    // Property Pricing routes (requires property update permission)
    Route::post('/pricing', [RealEstateController::class, 'storePricing'])->name('real-estate.pricing.store')->middleware('permission:property,update');
    Route::put('/pricing/{pricing}', [RealEstateController::class, 'updatePricing'])->name('real-estate.pricing.update')->middleware('permission:property,update');
    Route::delete('/pricing/{pricing}', [RealEstateController::class, 'destroyPricing'])->name('real-estate.pricing.destroy')->middleware('permission:property,update');

    // Financing Option routes (requires property update permission)
    Route::post('/financing-options', [RealEstateController::class, 'storeFinancingOption'])->name('real-estate.financing-options.store')->middleware('permission:property,update');
    Route::put('/financing-options/{financingOption}', [RealEstateController::class, 'updateFinancingOption'])->name('real-estate.financing-options.update')->middleware('permission:property,update');
    Route::delete('/financing-options/{financingOption}', [RealEstateController::class, 'destroyFinancingOption'])->name('real-estate.financing-options.destroy')->middleware('permission:property,update');

    // Inquiry routes (requires property viewAny permission)
    Route::put('/inquiries/{inquiry}/status', [RealEstateController::class, 'updateInquiryStatus'])->name('real-estate.inquiries.status')->middleware('permission:property,update');
    Route::delete('/inquiries/{inquiry}', [RealEstateController::class, 'destroyInquiry'])->name('real-estate.inquiries.destroy')->middleware('permission:property,delete');

    // Image management
    //    Route::post('/upload-image', [RealEstateController::class, 'uploadImage'])->name('real-estate.upload-image');
    //    Route::post('/attach-images', [RealEstateController::class, 'attachImages'])->name('real-estate.attach-images');
    //    Route::post('/reorder-images', [RealEstateController::class, 'reorderImages'])->name('real-estate.reorder-images');
    //    Route::delete('/images/{image}', [RealEstateController::class, 'deleteImage'])->name('real-estate.images.delete');
    //    Route::patch('/images/{image}/primary', [RealEstateController::class, 'setPrimaryImage'])->name('real-estate.images.set-primary');
});

Route::prefix('experiences')->name('admin.experiences.')->group(function () {
    Route::get('/', [ExperienceController::class, 'index'])->name('index');
    Route::get('/create', [ExperienceController::class, 'create'])->name('create');
    Route::post('/', [ExperienceController::class, 'store'])->name('store');
    Route::get('/{experience}/edit', [ExperienceController::class, 'edit'])->name('edit');
    Route::put('/{experience}', [ExperienceController::class, 'update'])->name('update');
    Route::delete('/{experience}', [ExperienceController::class, 'destroy'])->name('destroy');
});

Route::prefix('expertises')->name('admin.expertises.')->group(function () {
    Route::get('/', [ExpertiseController::class, 'index'])->name('index');
    Route::get('/create', [ExpertiseController::class, 'create'])->name('create');
    Route::post('/', [ExpertiseController::class, 'store'])->name('store');
    Route::get('/{expertise}/edit', [ExpertiseController::class, 'edit'])->name('edit');
    Route::put('/{expertise}', [ExpertiseController::class, 'update'])->name('update');
    Route::delete('/{expertise}', [ExpertiseController::class, 'destroy'])->name('destroy');
    Route::post('/reorder', [ExpertiseController::class, 'reorder'])->name('reorder');
});

Route::prefix('settings')->name('admin.settings.')->group(function () {
    Route::get('/', [SettingsController::class, 'index'])->name('index');
    Route::post('/', [SettingsController::class, 'update'])->name('update');
    Route::post('/upload/{key}', [SettingsController::class, 'uploadFile'])->name('upload');
});

Route::prefix('giveaways')->name('admin.giveaways.')->middleware('permission:giveaway,viewAny')->group(function () {
    Route::get('/', [GiveawayController::class, 'index'])->name('index');
    Route::get('/create', [GiveawayController::class, 'create'])->name('create')->middleware('permission:giveaway,create');
    Route::post('/', [GiveawayController::class, 'store'])->name('store')->middleware('permission:giveaway,create');
    Route::get('/{giveaway}/edit', [GiveawayController::class, 'edit'])->name('edit')->middleware('permission:giveaway,view');
    Route::put('/{giveaway}', [GiveawayController::class, 'update'])->name('update')->middleware('permission:giveaway,update');
    Route::delete('/{giveaway}', [GiveawayController::class, 'destroy'])->name('destroy')->middleware('permission:giveaway,delete');
    Route::patch('/{giveaway}/restore', [GiveawayController::class, 'restore'])->name('restore')->withTrashed()->middleware('permission:giveaway,restore');
    Route::delete('/{giveaway}/force', [GiveawayController::class, 'forceDestroy'])->name('force-destroy')->middleware('permission:giveaway,forceDelete');

    // Image management
    Route::post('/{giveaway}/images', [GiveawayController::class, 'uploadImage'])->name('images.upload')->middleware('permission:giveaway,update');
    Route::post('/{giveaway}/images/reorder', [GiveawayController::class, 'reorderImages'])->name('images.reorder')->middleware('permission:giveaway,update');
    Route::patch('/{giveaway}/images/{image}/primary', [GiveawayController::class, 'setPrimaryImage'])->name('images.set-primary')->middleware('permission:giveaway,update');
    Route::delete('/{giveaway}/images/{image}', [GiveawayController::class, 'deleteImage'])->name('images.delete')->middleware('permission:giveaway,update');

    // Winner selection
    Route::get('/{giveaway}/winner-selection', [GiveawayController::class, 'showWinnerSelection'])->name('winner-selection')->middleware('permission:giveaway,view');
    Route::post('/{giveaway}/select-winner', [GiveawayController::class, 'selectWinner'])->name('select-winner')->middleware('permission:giveaway,update');

    // Prize claim verification
    Route::post('/{giveaway}/claim-prize', [GiveawayController::class, 'claimPrize'])->name('claim-prize')->middleware('permission:giveaway,update');
    Route::post('/{giveaway}/reject-winner', [GiveawayController::class, 'rejectWinner'])->name('reject-winner')->middleware('permission:giveaway,update');

    // Entry management
    Route::get('/{giveaway}/entries', [GiveawayController::class, 'getEntries'])->name('entries')->middleware('permission:giveaway,view');
    Route::patch('/{giveaway}/entries/{entry}/status', [GiveawayController::class, 'updateEntryStatus'])->name('entries.update-status')->middleware('permission:giveaway,update');
    Route::delete('/{giveaway}/entries/{entry}', [GiveawayController::class, 'deleteEntry'])->name('entries.delete')->middleware('permission:giveaway,delete');
});
