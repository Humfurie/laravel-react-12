# Settings System Documentation

A complete database-driven settings management system for your Laravel application.

## Features

✅ Database-backed settings storage
✅ File upload support (images, PDFs, etc.)
✅ JSON configuration for complex data
✅ Grouped settings (branding, social, files, contact)
✅ Admin UI for easy management
✅ Cached for performance
✅ Helper functions for easy access

---

## Installation & Setup

### 1. Run the Migration

```bash
php artisan migrate
```

This creates the `settings` table with columns:

- `key` - Unique setting identifier
- `value` - Setting value
- `type` - Data type (string, file, json, boolean, integer)
- `description` - Human-readable description
- `group` - Category grouping

### 2. Seed Default Settings

```bash
php artisan db:seed --class=SettingsSeeder
```

This populates default settings including:

- Site logo
- Site name and metadata
- Resume/CV files
- Social media links
- Contact information
- General configuration

### 3. Regenerate Autoload (if needed)

```bash
composer dump-autoload
```

---

## Usage

### Accessing Settings in PHP

**Get a setting value:**

```php
use App\Models\Setting;

// Using the model
$siteName = Setting::get('site_name', 'Default Name');

// Using the helper function
$siteName = setting('site_name', 'Default Name');
```

**Get file URL:**

```php
// Helper function automatically generates storage URL
$resumeUrl = setting_file_url('resume_file', '/default-resume.pdf');
// Returns: /storage/settings/resume.pdf

// Use in blade/views
<a href="{{ setting_file_url('resume_file') }}" download>Download Resume</a>
```

**Get JSON settings:**

```php
$socialLinks = setting('social_links');
// Returns: ['github' => 'https://...', 'linkedin' => '...']
```

### Accessing Settings in React/Inertia

**Share settings globally (in HandleInertiaRequests middleware):**

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'settings' => Setting::getAllGrouped(),
    ];
}
```

**Access in React components:**

```tsx
import { usePage } from '@inertiajs/react';

export default function MyComponent() {
    const { settings } = usePage().props;

    return (
        <div>
            <img src={`/storage/${settings.branding.site_logo}`} alt="Logo" />
            <h1>{settings.branding.site_name}</h1>
        </div>
    );
}
```

### Setting Values Programmatically

```php
use App\Models\Setting;

// Set a simple string value
Setting::set('site_name', 'My Awesome Site');

// Set a file path
Setting::set('site_logo', 'logo.png', 'file', 'branding');

// Set JSON data
Setting::set('social_links', [
    'twitter' => 'https://twitter.com/username',
    'github' => 'https://github.com/username',
], 'json', 'social');

// Set boolean
Setting::set('maintenance_mode', true, 'boolean', 'general');
```

### Clear Cache

After updating settings programmatically:

```php
Setting::clearCache();
```

---

## Admin Panel

Access the settings panel at: **`/admin/settings`**

### Features:

- **File uploads** with preview
- **Text inputs** for strings
- **JSON editor** for complex configuration
- **Boolean toggles** for on/off settings
- **Grouped by category** for easy organization
- **Auto-save** functionality

### File Upload Process:

1. Select file in admin panel
2. File automatically uploads to `/storage/settings/`
3. Old file is deleted automatically
4. Path is saved to database
5. Access via `setting_file_url('key')`

---

## Example Use Cases

### 1. Update Logo Across Site

**In app-logo.tsx:**

```tsx
export default function AppLogo() {
    const logoPath = setting('site_logo', '/logo.png');

    return (
        <img
            src={`/storage/${logoPath}`}
            alt="Logo"
            className="size-8"
        />
    );
}
```

### 2. Resume Download Button

**In HomeBanner.tsx:**

```tsx
const resumeUrl = setting_file_url('resume_file');

return (
    <a href={resumeUrl} download className="btn-orange">
        <Download /> Download Resume
    </a>
);
```

### 3. Social Media Links

**In Footer.tsx:**

```tsx
const socialLinks = JSON.parse(setting('social_links', '{}'));

return (
    <div className="social-links">
        {socialLinks.github && <a href={socialLinks.github}>GitHub</a>}
        {socialLinks.linkedin && <a href={socialLinks.linkedin}>LinkedIn</a>}
        {socialLinks.twitter && <a href={socialLinks.twitter}>Twitter</a>}
    </div>
);
```

### 4. Contact Information

```php
<a href="mailto:{{ setting('contact_email') }}">
    {{ setting('contact_email') }}
</a>

<a href="tel:{{ setting('contact_phone') }}">
    {{ setting('contact_phone') }}
</a>
```

---

## API Reference

### Model Methods

#### `Setting::get(string $key, $default = null)`

Retrieve a setting value with optional default.

####
`Setting::set(string $key, $value, string $type = 'string', string $group = 'general', ?string $description = null)`

Create or update a setting.

#### `Setting::getAllGrouped(): array`

Get all settings grouped by category.

#### `Setting::clearCache(): void`

Clear all settings from cache.

### Helper Functions

#### `setting(string $key, $default = null)`

Quick access to setting values.

#### `setting_file_url(string $key, ?string $default = null): ?string`

Get full URL for file settings.

---

## Available Default Settings

### Branding Group

- `site_logo` - Main site logo (file)
- `site_name` - Website name (string)
- `site_title` - Default page title (string)
- `site_description` - Meta description (string)

### Files Group

- `resume_file` - Resume PDF (file)
- `cv_file` - CV document (file)

### Social Group

- `social_links` - Social media URLs (json)

### Contact Group

- `contact_email` - Primary email (string)
- `contact_phone` - Phone number (string)

### General Group

- `maintenance_mode` - Enable/disable (boolean)
- `items_per_page` - Pagination default (integer)

### Footer Group

- `footer_links` - Footer navigation (json)

---

## Advanced Configuration

### Adding New Settings

**Via Seeder:**

```php
Setting::updateOrCreate(
    ['key' => 'new_setting'],
    [
        'value' => 'default value',
        'type' => 'string',
        'description' => 'Description of setting',
        'group' => 'custom_group',
    ]
);
```

**Via Admin Panel:**
Navigate to `/admin/settings` and manage directly through the UI.

### Custom Setting Types

The system supports:

- `string` - Plain text
- `file` - File paths (with upload support)
- `json` - Complex arrays/objects
- `boolean` - true/false values
- `integer` - Numeric values
- `float` - Decimal numbers

---

## Routes

```php
GET  /admin/settings           - Settings management page
POST /admin/settings           - Update settings
POST /admin/settings/upload/{key} - Upload file for specific setting
```

---

## Tips & Best Practices

1. **Always use helpers** - Use `setting()` and `setting_file_url()` for consistency
2. **Cache clearing** - Settings are cached for 1 hour. Clear cache after programmatic updates
3. **File storage** - Files are stored in `/storage/app/public/settings/`
4. **JSON settings** - Useful for arrays of links, configuration objects, etc.
5. **Grouping** - Organize settings by group for better admin UX
6. **Descriptions** - Always add descriptions for clarity in admin panel
7. **Defaults** - Provide sensible defaults to avoid null errors

---

## Troubleshooting

**Settings not updating?**

```bash
php artisan cache:clear
```

**File uploads not working?**

```bash
php artisan storage:link
```

**Database errors?**

```bash
php artisan migrate:fresh --seed
```

---

## Next Steps

1. Run migrations: `php artisan migrate`
2. Seed settings: `php artisan db:seed --class=SettingsSeeder`
3. Visit `/admin/settings` to configure
4. Replace hardcoded values with `setting()` calls
5. Upload your logo, resume, etc. through admin panel

Enjoy your centralized settings management! 🎉
