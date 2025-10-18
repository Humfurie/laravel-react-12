<?php

namespace App\Console\Commands;

use App\Models\Permission;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use ReflectionClass;

class GenerateModelPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:generate
                            {--fresh : Delete existing permissions before generating}
                            {--exclude=* : Models to exclude from permission generation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically generate permissions based on policies';

    /**
     * Default actions for each resource
     */
    protected array $defaultActions = [];

    /**
     * Models to exclude from permission generation by default
     */
    protected array $defaultExclusions = [];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Scanning for policies...');

        // Load configuration
        $this->defaultActions = config('permissions.default_actions', [
            'viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete',
        ]);
        $this->defaultExclusions = config('permissions.excluded_models', [
            'Permission', 'Role', 'User',
        ]);

        // Get custom exclusions from command option
        $customExclusions = $this->option('exclude');
        $exclusions = array_merge($this->defaultExclusions, $customExclusions);

        // Discover all policies
        $policies = $this->discoverPolicies();

        if (empty($policies)) {
            $this->error('No policies found in app/Policies directory.');

            return Command::FAILURE;
        }

        $this->info('Found ' . count($policies) . ' policies.');

        // Filter out excluded policies
        $policiesToProcess = array_filter($policies, function ($policy) use ($exclusions) {
            $modelName = str_replace('Policy', '', $policy);

            return !in_array($modelName, $exclusions) && !in_array($policy, $exclusions);
        });

        if (empty($policiesToProcess)) {
            $this->warn('All policies are excluded. No permissions to generate.');

            return Command::SUCCESS;
        }

        // Show what will be processed
        $this->table(
            ['Policy', 'Resource Name'],
            collect($policiesToProcess)->map(fn($policy) => [
                $policy,
                $this->policyToResourceName($policy),
            ])->toArray()
        );

        if (!$this->confirm('Do you want to generate permissions for these policies?', true)) {
            $this->info('Operation cancelled.');

            return Command::SUCCESS;
        }

        // Fresh option: delete existing permissions
        if ($this->option('fresh')) {
            $this->warn('🗑️  Deleting existing permissions...');
            // Force delete to avoid unique constraint issues with soft deletes
            Permission::whereNotIn('resource', ['*'])->forceDelete();
        }

        // Generate permissions
        $created = 0;
        $updated = 0;

        foreach ($policiesToProcess as $policy) {
            $resourceName = $this->policyToResourceName($policy);
            $modelName = str_replace('Policy', '', $policy);

            // Use withTrashed to find soft-deleted records too
            $permission = Permission::withTrashed()->firstOrNew(['resource' => $resourceName]);

            if ($permission->exists) {
                // Restore if soft-deleted
                if ($permission->trashed()) {
                    $permission->restore();
                    $this->line("  ⟲ Restoring: {$resourceName}");
                } else {
                    $this->line("  ↻ Updating: {$resourceName}");
                }
                $updated++;
            } else {
                $this->line("  ✓ Creating: {$resourceName}");
                $created++;
            }

            // Use model-specific actions if defined, otherwise use default
            $actions = config("permissions.model_actions.{$modelName}", $this->defaultActions);
            $permission->actions = $actions;
            $permission->save();
        }

        // Ensure wildcard permission exists
        Permission::firstOrCreate(
            ['resource' => '*'],
            ['resource' => '*', 'actions' => ['*']]
        );

        $this->newLine();
        $this->info('✅ Permission generation complete!');
        $this->info("   Created: {$created}");
        $this->info("   Updated: {$updated}");
        $this->info('   Total: ' . ($created + $updated));

        return Command::SUCCESS;
    }

    /**
     * Discover all policies in the app/Policies directory
     */
    protected function discoverPolicies(): array
    {
        $policiesPath = app_path('Policies');

        if (!File::isDirectory($policiesPath)) {
            return [];
        }

        $policies = [];
        $files = File::allFiles($policiesPath);

        foreach ($files as $file) {
            // Skip if not a PHP file
            if ($file->getExtension() !== 'php') {
                continue;
            }

            // Get the filename without extension
            $filename = $file->getFilenameWithoutExtension();

            // Try the filename first
            $fullClassName = 'App\\Policies\\' . $filename;

            // If class doesn't exist with filename, try to parse the file to find the actual class name
            if (!class_exists($fullClassName)) {
                $content = File::get($file->getPathname());
                if (preg_match('/class\s+(\w+Policy)\s*/', $content, $matches)) {
                    $actualClassName = $matches[1];
                    $fullClassName = 'App\\Policies\\' . $actualClassName;
                } else {
                    continue;
                }
            }

            // Check if class exists and is a valid policy
            if (class_exists($fullClassName)) {
                $reflection = new ReflectionClass($fullClassName);

                // Skip abstract classes and traits
                if ($reflection->isAbstract() || $reflection->isTrait()) {
                    continue;
                }

                // Get the short class name
                $className = $reflection->getShortName();

                // Only include classes that end with 'Policy'
                if (str_ends_with($className, 'Policy')) {
                    $policies[] = $className;
                }
            }
        }

        sort($policies);

        return array_unique($policies);
    }

    /**
     * Convert policy name to resource name
     * Extracts the resource name from the policy class using the same logic as HasDynamicPermissions trait
     */
    protected function policyToResourceName(string $policyName): string
    {
        $fullClassName = 'App\\Policies\\' . $policyName;

        // Try to get resource name from the policy instance if it has getResourceName method
        if (class_exists($fullClassName)) {
            try {
                $reflection = new ReflectionClass($fullClassName);

                // Check if the class has a getResourceName method
                if ($reflection->hasMethod('getResourceName')) {
                    $method = $reflection->getMethod('getResourceName');

                    // Make the method accessible if it's protected
                    $method->setAccessible(true);

                    // Create an instance and call the method
                    $instance = new $fullClassName;

                    return $method->invoke($instance);
                }
            } catch (Exception $e) {
                // Fall through to default logic if instantiation fails
            }
        }

        // Fallback: Remove 'Policy' suffix and convert to lowercase
        $modelName = str_replace('Policy', '', $policyName);

        // Check for custom resource name in config
        $customNames = config('permissions.custom_resource_names', []);

        if (isset($customNames[$modelName])) {
            return $customNames[$modelName];
        }

        // Use lowercase (matching HasDynamicPermissions trait logic)
        return strtolower($modelName);
    }
}
