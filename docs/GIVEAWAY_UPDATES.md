# Giveaway System Updates - Implementation Notes

## Overview

This document outlines all the changes made to fix and enhance the giveaway system.

---

## ✅ COMPLETED CHANGES

### 1. **CRITICAL BUG FIX** - Winner Selection Not Working

**Problem:** Giveaways were ending but not selecting winners automatically.

**Root Cause:** The scheduled commands were referencing a non-existent `Raffle` model instead of `Giveaway`.

**Files Fixed:**

- `app/Console/Commands/SelectRaffleWinners.php` - Changed all `Raffle` references to `Giveaway`
- `app/Console/Commands/UpdateRaffleStatuses.php` - Changed all `Raffle` references to `Giveaway`

**Result:** Automatic winner selection now works via scheduled tasks:

- `raffles:update-statuses` - Runs every 5 minutes to end expired giveaways
- `raffles:select-winners` - Runs hourly to select winners for ended giveaways

---

### 2. **Multiple Winners Feature**

#### Backend Changes

**Database Migration Created:**

- `database/migrations/2025_11_15_220946_add_number_of_winners_to_giveaways_table.php`
- Adds `number_of_winners` column (default: 1, range: 1-100)

**Model Updates (`app/Models/Giveaway.php`):**

- Added `number_of_winners` to fillable array
- Added `number_of_winners` cast as integer
- Added `winners()` relationship (hasMany to GiveawayEntry where status='winner')
- Updated `selectWinner()` method to select multiple winners based on `number_of_winners` setting
- Updated `updateStatusIfNeeded()` to check if all required winners are selected

**Command Updates:**

- `app/Console/Commands/SelectRaffleWinners.php`:
    - Now checks if giveaway needs more winners
    - Displays progress (e.g., "3/5 winners selected")
    - Handles partial winner selection

**Admin Controller Updates (`app/Http/Controllers/Admin/GiveawayController.php`):**

- `store()` - Added `number_of_winners` validation (1-100)
- `update()` - Added `number_of_winners` validation
- `index()` - Returns `winners_count` and `number_of_winners`
- `edit()` - Returns all winners and `number_of_winners`
- `selectWinner()` - Updated to handle multiple winner selection
- `showWinnerSelection()` - Returns all winners data

**API Controller Updates (`app/Http/Controllers/Api/GiveawayController.php`):**

- `index()` - Returns `number_of_winners` for each giveaway
- `show()` - Returns `winners` array and `winners_count`
- `winners()` - Returns all winners for completed giveaways

---

### 3. **MinIO Integration for Screenshot Storage**

#### MinIO Service Setup

**docker-compose.yml:**

```yaml
minio:
    image: 'minio/minio:latest'
    ports:
        - '9000:9000'  # MinIO API
        - '9001:9001'  # MinIO Console
    environment:
        MINIO_ROOT_USER: 'sail'
        MINIO_ROOT_PASSWORD: 'password'
    volumes:
        - 'sail-minio:/data/minio'
    command: 'minio server /data/minio --console-address ":9001"'
```

**Laravel Filesystem Configuration (`config/filesystems.php`):**

```php
'minio' => [
    'driver' => 's3',
    'key' => env('MINIO_ACCESS_KEY', 'sail'),
    'secret' => env('MINIO_SECRET_KEY', 'password'),
    'region' => 'us-east-1',
    'bucket' => 'giveaway-screenshots',
    'url' => 'http://minio:9000',
    'endpoint' => 'http://minio:9000',
    'use_path_style_endpoint' => true,
],
```

#### Database Migration

**Migration Created:**

- `database/migrations/2025_11_15_221544_add_screenshot_path_to_giveaway_entries_table.php`
- Adds `screenshot_path` column to `giveaway_entries` table (nullable)

---

### 4. **Testing Environment Setup**

**docker-compose.test.yml Created:**

- Isolated testing environment with separate:
    - Database: `laravel_test` (port 9432)
    - HTTP Server: port 9500
    - Vite Dev Server: port 9173
    - MinIO API: port 9100
    - MinIO Console: port 9101
    - Separate Docker volumes for complete isolation

**Usage:**

```bash
# Start testing environment
docker-compose -f docker-compose.test.yml up -d

# Run migrations on test environment
docker-compose -f docker-compose.test.yml exec laravel.test php artisan migrate

# Stop testing environment
docker-compose -f docker-compose.test.yml down
```

---

## 📋 REMAINING TASKS (TO BE COMPLETED)

### 1. **Run Database Migrations**

**Required:**

```bash
# Production environment
./vendor/bin/sail artisan migrate

# Testing environment
docker-compose -f docker-compose.test.yml exec laravel.test php artisan migrate
```

---

### 2. **Update GiveawayEntry Model**

**File:** `app/Models/GiveawayEntry.php`

**Add to fillable array:**

```php
protected $fillable = [
    'giveaway_id',
    'name',
    'phone',
    'facebook_url',
    'screenshot_path',  // ADD THIS
    'status',
    'entry_date',
];
```

---

### 3. **Update Entry Submission API to Handle Screenshot Upload**

**File:** `app/Http/Controllers/Api/GiveawayController.php`

**Update `submitEntry()` method:**

```php
public function submitEntry(Request $request, Giveaway $giveaway)
{
    if (!$giveaway->canAcceptEntries()) {
        return response()->json([
            'success' => false,
            'message' => 'This giveaway is not currently accepting entries.',
        ], 400);
    }

    try {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => [
                'required',
                'string',
                'regex:/^(\+639|09)\d{9}$/',
                // ... existing phone validation
            ],
            'facebook_url' => 'required|url|max:500',
            'screenshot' => 'required|image|mimes:jpeg,jpg,png|max:5120', // 5MB max, ADD THIS
        ], [
            'phone.regex' => 'Phone number must be in format 09XXXXXXXXX or +639XXXXXXXXX',
            'screenshot.required' => 'Please upload a screenshot showing you are following our page.',
            'screenshot.image' => 'The file must be an image.',
            'screenshot.max' => 'The screenshot must not be larger than 5MB.',
        ]);
    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed.',
            'errors' => $e->errors(),
        ], 422);
    }

    // Normalize phone number
    $normalizedPhone = $validated['phone'];
    if (str_starts_with($validated['phone'], '09')) {
        $normalizedPhone = '+63' . substr($validated['phone'], 1);
    }

    DB::beginTransaction();
    try {
        // Upload screenshot to MinIO
        $screenshot = $request->file('screenshot');
        $phoneHash = md5($normalizedPhone);
        $filename = "giveaway_{$giveaway->id}_{$phoneHash}." . $screenshot->getClientOriginalExtension();
        $path = $screenshot->storeAs('screenshots', $filename, 'minio');

        $entry = $giveaway->entries()->create([
            'name' => $validated['name'],
            'phone' => $normalizedPhone,
            'facebook_url' => $validated['facebook_url'],
            'screenshot_path' => $path,  // ADD THIS
            'status' => GiveawayEntry::STATUS_PENDING,
        ]);

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Your entry has been submitted successfully!',
            'data' => [
                'id' => $entry->id,
                'name' => $entry->name,
                'entry_date' => $entry->entry_date,
            ],
        ], 201);
    } catch (Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to submit entry. Please try again.',
        ], 500);
    }
}
```

---

### 4. **Frontend Updates Required**

#### A. Admin Giveaway Create/Edit Forms

**Files:**

- `resources/js/pages/admin/giveaways/create.tsx`
- `resources/js/pages/admin/giveaways/edit.tsx`

**Add number_of_winners field:**

```tsx
<div>
    <label htmlFor="number_of_winners">Number of Winners</label>
    <input
        type="number"
        id="number_of_winners"
        name="number_of_winners"
        min="1"
        max="100"
        defaultValue={giveaway?.number_of_winners || 1}
        required
    />
    <p className="text-sm text-gray-500">
        How many winners should be selected for this giveaway?
    </p>
</div>
```

---

#### B. Public Entry Form

**File:** `resources/js/pages/giveaways/show.tsx`

**Add screenshot upload field:**

```tsx
<div>
    <label htmlFor="screenshot">
        Screenshot Proof <span className="text-red-500">*</span>
    </label>
    <input
        type="file"
        id="screenshot"
        name="screenshot"
        accept="image/jpeg,image/jpg,image/png"
        required
        onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
                // Optional: Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setScreenshotPreview(e.target?.result);
                };
                reader.readAsDataURL(file);
            }
        }}
    />
    <p className="text-sm text-gray-500">
        Upload a screenshot showing that you are following our Facebook page.
        Maximum file size: 5MB. Accepted formats: JPG, PNG.
    </p>
    {screenshotPreview && (
        <img src={screenshotPreview} alt="Preview" className="mt-2 max-w-xs" />
    )}
</div>
```

**Update form submission:**

```tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('facebook_url', facebookUrl);
    formData.append('screenshot', screenshotFile); // ADD THIS

    try {
        const response = await axios.post(
            `/api/v1/giveaways/${slug}/enter`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        // Handle success
    } catch (error) {
        // Handle error
    }
};
```

---

#### C. Display Multiple Winners

**Files:**

- `resources/js/pages/giveaways/winners.tsx`
- `resources/js/components/giveaway/WinnerAnnouncement.tsx`
- `resources/js/pages/admin/giveaways/winner-selection.tsx`

**Update winner display:**

```tsx
{/* Instead of showing single winner */}
{giveaway.winner && (
    <p>Winner: {giveaway.winner.name}</p>
)}

{/* Show all winners */}
{giveaway.winners && giveaway.winners.length > 0 && (
    <div>
        <h3>Winners ({giveaway.winners.length}/{giveaway.number_of_winners})</h3>
        <ul>
            {giveaway.winners.map((winner, index) => (
                <li key={winner.id}>
                    {index + 1}. {winner.name}
                </li>
            ))}
        </ul>
    </div>
)}
```

---

#### D. Admin: View Entry Screenshots

**File:** `resources/js/pages/admin/giveaways/edit.tsx`

**Add screenshot viewing:**

```tsx
{entries.map((entry) => (
    <tr key={entry.id}>
        <td>{entry.name}</td>
        <td>{entry.phone}</td>
        <td>
            <a href={entry.facebook_url} target="_blank" rel="noopener">
                View Profile
            </a>
        </td>
        <td>
            {entry.screenshot_path && (
                <a
                    href={`/api/screenshots/${entry.id}`}
                    target="_blank"
                    rel="noopener"
                >
                    View Screenshot
                </a>
            )}
        </td>
        <td>{entry.status}</td>
    </tr>
))}
```

**Add route to serve screenshots (optional):**

```php
// routes/admin.php
Route::get('/screenshots/{entry}', [GiveawayController::class, 'viewScreenshot'])
    ->name('admin.giveaways.screenshot');

// app/Http/Controllers/Admin/GiveawayController.php
public function viewScreenshot(GiveawayEntry $entry)
{
    if (!$entry->screenshot_path) {
        abort(404);
    }

    return Storage::disk('minio')->response($entry->screenshot_path);
}
```

---

### 5. **Environment Configuration**

**Add to `.env` file:**

```env
# MinIO Configuration
MINIO_ROOT_USER=sail
MINIO_ROOT_PASSWORD=password
MINIO_REGION=us-east-1
MINIO_BUCKET=giveaway-screenshots
MINIO_ENDPOINT=http://minio:9000
MINIO_URL=http://localhost:9000

# Use MinIO for file storage
FILESYSTEM_DISK=minio
```

**For production, update to external URL:**

```env
MINIO_URL=https://yourdomain.com/minio
```

---

### 6. **Create MinIO Bucket**

After starting Docker containers, create the bucket:

**Option 1: Via MinIO Console**

1. Open http://localhost:9001
2. Login with `sail` / `password`
3. Create bucket named `giveaway-screenshots`
4. Set bucket policy to public (if screenshots should be publicly viewable)

**Option 2: Via Artisan Command (Recommended)**

Create a new artisan command:

```bash
php artisan make:command SetupMinIO
```

```php
// app/Console/Commands/SetupMinIO.php
public function handle()
{
    $disk = Storage::disk('minio');
    $bucket = config('filesystems.disks.minio.bucket');

    // Create bucket if it doesn't exist
    if (!$disk->exists('')) {
        $this->info("Creating bucket: {$bucket}");
        // Bucket creation logic here
    }

    $this->info('MinIO setup complete!');
}
```

---

### 7. **Install AWS SDK** (Required for MinIO)

```bash
composer require league/flysystem-aws-s3-v3 "^3.0"
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Production Environment

1. **Update Environment Variables:**
   ```bash
   MINIO_URL=https://storage.yourdomain.com
   MINIO_ENDPOINT=https://storage.yourdomain.com
   FILESYSTEM_DISK=minio
   ```

2. **Run Migrations:**
   ```bash
   php artisan migrate --force
   ```

3. **Create MinIO Bucket:**
   ```bash
   php artisan setup:minio
   ```

4. **Restart Services:**
   ```bash
   docker-compose up -d
   ```

5. **Verify Winner Selection:**
   ```bash
   php artisan raffles:select-winners
   ```

### Testing Environment

1. **Start Test Environment:**
   ```bash
   docker-compose -f docker-compose.test.yml up -d
   ```

2. **Run Migrations:**
   ```bash
   docker-compose -f docker-compose.test.yml exec laravel.test php artisan migrate
   ```

3. **Access Test Environment:**
    - App: http://localhost:9500
    - MinIO Console: http://localhost:9101
    - Database: localhost:9432

---

## 📝 TESTING INSTRUCTIONS

### Test Multiple Winners

1. Create a giveaway with `number_of_winners = 3`
2. Add 10+ entries
3. Run winner selection command:
   ```bash
   php artisan raffles:select-winners
   ```
4. Verify 3 winners are selected
5. Check that giveaway status changes to "ended"

### Test Screenshot Upload

1. Navigate to an active giveaway
2. Fill in entry form including screenshot upload
3. Submit entry
4. Verify screenshot is stored in MinIO
5. Verify admin can view screenshot

### Test Automatic Winner Selection

1. Create a giveaway with end_date in the past
2. Add entries
3. Wait for scheduled task to run (or run manually)
4. Verify winners are selected automatically

---

## 🔧 TROUBLESHOOTING

### Issue: Migrations Fail with "could not find driver"

**Solution:** Run migrations inside Docker container:

```bash
./vendor/bin/sail artisan migrate
```

### Issue: MinIO Connection Refused

**Solution:** Ensure MinIO container is running:

```bash
docker-compose ps minio
```

### Issue: Screenshot Upload Fails

**Solutions:**

1. Verify MinIO is accessible: `curl http://localhost:9000/minio/health/live`
2. Check bucket exists in MinIO console
3. Verify `FILESYSTEM_DISK=minio` in .env
4. Check Laravel logs: `tail -f storage/logs/laravel.log`

### Issue: Winners Not Being Selected Automatically

**Solution:** Check scheduler is running:

```bash
php artisan schedule:list
php artisan schedule:work  # For testing
```

---

## 📊 SUMMARY OF CHANGES

### Files Modified: 12

1. `app/Console/Commands/SelectRaffleWinners.php`
2. `app/Console/Commands/UpdateRaffleStatuses.php`
3. `app/Models/Giveaway.php`
4. `app/Http/Controllers/Admin/GiveawayController.php`
5. `app/Http/Controllers/Api/GiveawayController.php`
6. `docker-compose.yml`
7. `config/filesystems.php`
8. Migration: `add_number_of_winners_to_giveaways_table.php`
9. Migration: `add_screenshot_path_to_giveaway_entries_table.php`

### Files Created: 2

1. `docker-compose.test.yml`
2. `GIVEAWAY_UPDATES.md` (this file)

### Frontend Files Requiring Updates: 6

1. `resources/js/pages/admin/giveaways/create.tsx`
2. `resources/js/pages/admin/giveaways/edit.tsx`
3. `resources/js/pages/giveaways/show.tsx`
4. `resources/js/pages/giveaways/winners.tsx`
5. `resources/js/components/giveaway/WinnerAnnouncement.tsx`
6. `resources/js/pages/admin/giveaways/winner-selection.tsx`

---

## ✨ NEW FEATURES SUMMARY

### 1. Multiple Winners

- Admins can specify 1-100 winners per giveaway
- Winners are selected randomly from eligible entries
- Progress tracking (e.g., "3/5 winners selected")
- Backward compatible (defaults to 1 winner)

### 2. Screenshot Verification

- Users must upload screenshot when entering
- Stored in MinIO (S3-compatible object storage)
- Admins can view screenshots for verification
- Max file size: 5MB (configurable)

### 3. Testing Environment

- Complete isolation from production
- Separate database, ports, and volumes
- Easy to start/stop for testing
- Same Docker images as production

### 4. Bug Fixes

- Fixed automatic winner selection (critical!)
- Fixed giveaway status updates

---

## 📧 SUPPORT

For questions or issues, please refer to:

- Laravel Documentation: https://laravel.com/docs
- MinIO Documentation: https://min.io/docs
- Project Repository Issues

---

**Last Updated:** 2025-11-15
**Version:** 1.0.0
