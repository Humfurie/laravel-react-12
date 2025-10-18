# Automatic Permission Generation

This system automatically generates permissions based on your Laravel models, eliminating the need to manually maintain
permission lists.

## Quick Start

### Generate Permissions

Run the command to automatically scan all models and create permissions:

```bash
php artisan permissions:generate
```

This will:

- Scan all models in `app/Models`
- Create permissions for each model (except excluded ones)
- Use kebab-case naming (e.g., `RealEstateProject` → `realestate-project`)
- Assign default actions: `viewAny`, `view`, `create`, `update`, `delete`, `restore`, `forceDelete`

### Command Options

**Fresh generation** (deletes existing permissions first):

```bash
php artisan permissions:generate --fresh
```

**Exclude specific models**:

```bash
php artisan permissions:generate --exclude=Blog --exclude=Contact
```

## Configuration

Edit `config/permissions.php` to customize the behavior:

### Default Actions

Define which actions are created for each resource:

```php
'default_actions' => [
    'viewAny',
    'view',
    'create',
    'update',
    'delete',
    'restore',
    'forceDelete',
],
```

### Excluded Models

Models that should not have permissions generated:

```php
'excluded_models' => [
    'Permission',
    'Role',
    'User',
],
```

### Custom Resource Names

Override the default kebab-case naming:

```php
'custom_resource_names' => [
    'RealEstateProject' => 'realestate-project',
    'PropertyPricing' => 'property-pricing',
],
```

### Model-Specific Actions

Define custom actions for specific models:

```php
'model_actions' => [
    'Blog' => ['viewAny', 'view', 'create', 'update', 'delete', 'publish', 'unpublish'],
    'User' => ['viewAny', 'view', 'create', 'update', 'delete', 'ban', 'unban'],
],
```

## Usage in Seeders

The `PermissionSeeder` automatically uses the generation command:

```php
public function run(): void
{
    Artisan::call('permissions:generate', ['--fresh' => true]);
}
```

Run it with:

```bash
php artisan db:seed --class=PermissionSeeder
```

## Workflow

### When Adding a New Model

1. Create your model: `php artisan make:model NewModel`
2. Run: `php artisan permissions:generate`
3. Permissions are automatically created!

### When Removing a Model

1. Delete the model file
2. Run: `php artisan permissions:generate --fresh`
3. Old permissions are cleaned up

## Examples

### Basic Usage

```bash
# Generate permissions for all models
php artisan permissions:generate

# Output:
# 🔍 Scanning for models...
# Found 13 models.
# 
# ┌──────────────────────┬─────────────────────────┐
# │ Model                │ Resource Name           │
# ├──────────────────────┼─────────────────────────┤
# │ About                │ about                   │
# │ Blog                 │ blog                    │
# │ Contact              │ contact                 │
# │ Developer            │ developer               │
# │ Experience           │ experience              │
# │ ...                  │ ...                     │
# └──────────────────────┴─────────────────────────┘
# 
# ✅ Permission generation complete!
#    Created: 10
#    Updated: 0
#    Total: 10
```

### With Exclusions

```bash
php artisan permissions:generate --exclude=Contact --exclude=Inquiry
```

### Fresh Generation

```bash
php artisan permissions:generate --fresh
```

## How It Works

1. **Model Discovery**: Scans `app/Models` directory for all Eloquent models
2. **Filtering**: Excludes models listed in config or command options
3. **Resource Naming**: Converts model names to kebab-case (or uses custom names)
4. **Action Assignment**: Uses default or model-specific actions
5. **Database Update**: Creates or updates permission records

## Integration with Frontend

Your React frontend can access these permissions via the `usePermissions` hook:

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
    const { can, getPermissions } = usePermissions();
    
    // Check single permission
    if (can('blog', 'create')) {
        // Show create button
    }
    
    // Get all permissions for a resource
    const blogPerms = getPermissions('blog');
}
```

## Best Practices

1. **Run after model changes**: Always run `permissions:generate` after adding/removing models
2. **Use in CI/CD**: Add to deployment scripts to ensure permissions are up-to-date
3. **Version control config**: Commit `config/permissions.php` to track permission structure
4. **Review before fresh**: Use `--fresh` carefully as it deletes existing permissions
5. **Custom actions**: Define model-specific actions in config for special cases

## Troubleshooting

### No models found

- Ensure models are in `app/Models` directory
- Check that models extend `Illuminate\Database\Eloquent\Model`

### Wrong resource names

- Use `custom_resource_names` in config to override defaults

### Missing actions

- Check `default_actions` in config
- Use `model_actions` for model-specific actions

### Permissions not updating

- Use `--fresh` flag to regenerate all permissions
- Check database connection and permissions table
