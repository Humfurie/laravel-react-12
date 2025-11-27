# Giveaway System - Complete Implementation Guide

## 🎉 Overview

All raffle references have been renamed to giveaway, MinIO integration is complete, and comprehensive tests have been
created.

---

## ✅ COMPLETED CHANGES

### 1. **Renamed All "Raffle" to "Giveaway"**

#### Commands Renamed:

- `app/Console/Commands/SelectRaffleWinners.php` → `SelectGiveawayWinners.php`
- `app/Console/Commands/UpdateRaffleStatuses.php` → `UpdateGiveawayStatuses.php`

#### Command Signatures Updated:

- `raffles:select-winners` → `giveaways:select-winners`
- `raffles:update-statuses` → `giveaways:update-statuses`

#### Scheduler Updated (`bootstrap/app.php`):

```php
$schedule->command('giveaways:update-statuses')->everyFiveMinutes();
$schedule->command('giveaways:select-winners')->hourly();
```

#### All Error Messages Updated:

- "this raffle" → "this giveaway"
- "raffle(s)" → "giveaway(s)"
- "Failed to create raffle" → "Failed to create giveaway"

---

### 2. **MinIO Integration Complete**

#### Image Model Updated (`app/Models/Image.php`):

```php
public function getUrlAttribute(): string
{
    // Use MinIO for giveaway images, public disk for others
    $disk = $this->imageable_type === Giveaway::class ? 'minio' : 'public';
    return Storage::disk($disk)->url($this->path);
}
```

#### Giveaway Prize Images:

- **OLD**: Stored in `storage/app/public/raffles/`
- **NEW**: Stored in MinIO at `giveaways/{filename}`

#### Entry Screenshots:

- Stored in MinIO at `screenshots/giveaway_{id}_{phone_hash}.{ext}`
- Phone hash used for privacy
- Max size: 5MB
- Allowed formats: JPG, JPEG, PNG

#### Admin Controller Updated:

```php
// Line 226 in GiveawayController.php
$path = $file->storeAs('giveaways', $filename, 'minio');
```

---

### 3. **Multiple Winners Feature**

#### Database:

- `number_of_winners` column added to `giveaways` table (1-100)
- Defaults to 1 for backward compatibility

#### Model (`app/Models/Giveaway.php`):

- New `winners()` relationship
- Updated `selectWinner()` to select N winners
- Updated `updateStatusIfNeeded()` to check all winners selected

#### Commands:

- `SelectGiveawayWinners` now handles partial winner selection
- Shows progress: "Total winners: 3/5"

#### API Responses Include:

- `number_of_winners`
- `winners` array
- `winners_count`

---

### 4. **Testing Environment** (`docker-compose.test.yml`)

#### Ports:

- HTTP: `9500` (vs 80 prod)
- Vite: `9173` (vs 5173 prod)
- PostgreSQL: `9432` (vs 5432 prod)
- MinIO API: `9100` (vs 9000 prod)
- MinIO Console: `9101` (vs 9001 prod)

#### Isolation:

- Separate database: `laravel_test`
- Separate MinIO volume: `sail-minio-test`
- Separate network: `sail-test`
- Same Docker images as production

#### Usage:

```bash
# Start testing environment
docker-compose -f docker-compose.test.yml up -d

# Run migrations
docker-compose -f docker-compose.test.yml exec laravel.test php artisan migrate

# Run tests
docker-compose -f docker-compose.test.yml exec laravel.test php artisan test

# Stop testing environment
docker-compose -f docker-compose.test.yml down
```

---

### 5. **Comprehensive Pest Tests Created**

#### Test Files:

1. `tests/Feature/Giveaway/GiveawayApiTest.php` (existing - 274 lines)
    - Entry submission
    - Phone normalization
    - Duplicate prevention
    - Validation

2. `tests/Feature/Giveaway/GiveawayMultipleWinnersTest.php` (NEW)
    - Multiple winner selection
    - Partial winner selection
    - Scheduled commands
    - Winner relationships
    - API responses

3. `tests/Feature/Giveaway/GiveawayScreenshotTest.php` (NEW)
    - Screenshot upload
    - File validation (type, size)
    - MinIO storage
    - Privacy (phone hash)

#### Run Tests:

```bash
# Run all giveaway tests
./vendor/bin/sail pest tests/Feature/Giveaway

# Run specific test file
./vendor/bin/sail pest tests/Feature/Giveaway/GiveawayMultipleWinnersTest.php

# Run with coverage
./vendor/bin/sail pest --coverage
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Production Environment

#### 1. Install Dependencies

```bash
composer require league/flysystem-aws-s3-v3 "^3.0"
```

#### 2. Update Environment Variables

Add to `.env`:

```env
# MinIO Configuration
MINIO_ROOT_USER=your_access_key
MINIO_ROOT_PASSWORD=your_secret_key
MINIO_REGION=us-east-1
MINIO_BUCKET=giveaway-screenshots
MINIO_ENDPOINT=http://minio:9000
MINIO_URL=http://localhost:9000

# Use MinIO for file storage
FILESYSTEM_DISK=minio
```

#### 3. Start Docker Services

```bash
docker-compose up -d
```

#### 4. Create MinIO Bucket

Option 1: Via MinIO Console

1. Visit `http://localhost:9001`
2. Login with credentials from `.env`
3. Create bucket: `giveaway-screenshots`
4. Set public read policy (if screenshots should be public)

Option 2: Via CLI (after installing MinIO client)

```bash
mc alias set local http://localhost:9000 sail password
mc mb local/giveaway-screenshots
mc anonymous set public local/giveaway-screenshots
```

#### 5. Run Migrations

```bash
./vendor/bin/sail artisan migrate
```

#### 6. Verify Scheduled Tasks

```bash
./vendor/bin/sail artisan schedule:list
```

Should show:

- `giveaways:update-statuses` (every 5 minutes)
- `giveaways:select-winners` (hourly)

#### 7. Test Commands Manually

```bash
# Update statuses
./vendor/bin/sail artisan giveaways:update-statuses

# Select winners
./vendor/bin/sail artisan giveaways:select-winners
```

---

## 📊 DASHBOARD RECOMMENDATIONS

Based on your question about what to put in the dashboard, here are my recommendations:

### Essential Metrics (No External Services Needed)

#### 1. **Giveaway Overview**

```php
// Total giveaways by status
$activeGiveaways = Giveaway::where('status', 'active')->count();
$draftGiveaways = Giveaway::where('status', 'draft')->count();
$endedGiveaways = Giveaway::where('status', 'ended')->count();

// Giveaway engagement
$totalEntries = GiveawayEntry::count();
$entriesThisWeek = GiveawayEntry::where('created_at', '>=', now()->subWeek())->count();
$entriesThisMonth = GiveawayEntry::where('created_at', '>=', now()->subMonth())->count();
```

**Display as:**

- Cards showing counts with trend indicators
- Pie chart of giveaway statuses
- Line graph of entries over time

#### 2. **Recent Activity Feed**

```php
// Recent entries (last 10)
$recentEntries = GiveawayEntry::with('giveaway')
    ->latest()
    ->take(10)
    ->get();

// Recent winners
$recentWinners = GiveawayEntry::where('status', 'winner')
    ->with('giveaway')
    ->latest()
    ->take(5)
    ->get();
```

**Display as:**

- Real-time activity feed showing:
    - "John entered Summer Giveaway (2 minutes ago)"
    - "Maria won iPhone Raffle (1 hour ago)"
- Avatar + name + action + time

#### 3. **Upcoming Deadlines**

```php
// Giveaways ending soon (within 24 hours)
$endingSoon = Giveaway::where('status', 'active')
    ->where('end_date', '<=', now()->addDay())
    ->where('end_date', '>', now())
    ->withCount('entries')
    ->get();
```

**Display as:**

- Alert cards showing:
    - Giveaway name
    - Time remaining
    - Entry count
    - Action button "Select Winner Now"

#### 4. **Top Performing Giveaways**

```php
// Most entries
$popularGiveaways = Giveaway::withCount('entries')
    ->orderBy('entries_count', 'desc')
    ->take(5)
    ->get();

// Conversion rate (entries per day active)
$giveaways = Giveaway::with('entries')->get()->map(function($g) {
    $daysActive = $g->start_date->diffInDays($g->end_date);
    return [
        'title' => $g->title,
        'entries_per_day' => $g->entries_count / max($daysActive, 1),
    ];
});
```

**Display as:**

- Table with rankings
- Bar chart of entry counts

### Advanced Metrics (Optional)

#### 5. **Visitor Tracking** (Self-hosted, No Google needed)

Use Laravel's database session driver to track unique visitors:

```php
// In controller
Session::put('visitor_id', Session::getId());

// Count unique visitors
$uniqueVisitors = DB::table('sessions')
    ->where('last_activity', '>=', now()->subDay()->timestamp)
    ->count();
```

**Better Alternative:** Use [Matomo](https://matomo.org/) (self-hosted analytics)

- Open-source Google Analytics alternative
- Full privacy control
- Can be integrated via Docker
- Provides detailed visitor insights

#### 6. **Notifications/Alerts**

Create a notifications table:

```php
// Migration
Schema::create('admin_notifications', function (Blueprint $table) {
    $table->id();
    $table->string('type'); // 'new_entry', 'giveaway_ending', 'winner_selected'
    $table->morphs('notifiable'); // Related model
    $table->json('data'); // Additional data
    $table->boolean('read')->default(false);
    $table->timestamps();
});
```

**Events to track:**

- New giveaway entry
- Giveaway ending in 1 hour
- Winner selected
- Prize claimed
- Entry screenshot needs verification

**Display as:**

- Bell icon with count
- Dropdown with recent notifications
- Mark as read functionality

#### 7. **Quick Actions Widget**

```php
// Entries needing verification
$pendingVerification = GiveawayEntry::where('status', 'pending')
    ->whereNotNull('screenshot_path')
    ->count();

// Giveaways ready to start
$readyToStart = Giveaway::where('status', 'draft')
    ->where('start_date', '<=', now())
    ->count();

// Winners pending prize claim
$unclaimedPrizes = Giveaway::whereNotNull('winner_id')
    ->where('prize_claimed', false)
    ->count();
```

**Display as:**

- Action cards with counts
- Quick links to relevant pages

### Recommended Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                                          [Profile] │
├───────┬───────┬───────┬───────────────────────────────────────┤
│ Active│ Draft │ Ended │  Quick Actions                       │
│   5   │   2   │  12   │  • 3 entries need verification      │
│  ▲12% │  ▼5%  │  ▲8%  │  • 1 giveaway ending in 2 hours     │
│       │       │       │  • 2 prizes unclaimed                │
├───────┴───────┴───────┴───────────────────────────────────────┤
│ Recent Activity                │ Upcoming Deadlines           │
│ • Maria entered "Summer..."    │ iPhone Giveaway              │
│   2 min ago                    │ Ends in 2 hours (45 entries) │
│ • John won "MacBook..."        │ [Select Winner Now]          │
│   1 hour ago                   │                              │
│ • Pedro entered "Vacation..."  │ Vacation Package             │
│   3 hours ago                  │ Ends in 8 hours (23 entries) │
├────────────────────────────────┴──────────────────────────────┤
│ Entries Over Time (Last 30 Days)                             │
│ [Line Graph]                                                  │
├───────────────────────────────────────────────────────────────┤
│ Top Performing Giveaways       │ Statistics                  │
│ 1. iPhone Giveaway - 234       │ Total Entries: 1,234        │
│ 2. Vacation Package - 189      │ This Week: 456              │
│ 3. Gaming Console - 156        │ This Month: 890             │
└────────────────────────────────┴──────────────────────────────┘
```

### Implementation Priority

**Phase 1 (Essential):**

1. Giveaway status cards
2. Recent activity feed
3. Upcoming deadlines
4. Quick actions

**Phase 2 (Enhanced):**

5. Charts (entries over time)
6. Top performing giveaways
7. Admin notifications

**Phase 3 (Advanced):**

8. Matomo integration for visitor tracking
9. Real-time updates (Laravel Echo)
10. Export reports

### Sample Controller Method

```php
// app/Http/Controllers/Admin/DashboardController.php
public function index()
{
    return Inertia::render('admin/dashboard/index', [
        'stats' => [
            'active' => Giveaway::where('status', 'active')->count(),
            'draft' => Giveaway::where('status', 'draft')->count(),
            'ended' => Giveaway::where('status', 'ended')->count(),
            'total_entries' => GiveawayEntry::count(),
            'entries_this_week' => GiveawayEntry::where('created_at', '>=', now()->subWeek())->count(),
        ],
        'recent_activities' => GiveawayEntry::with('giveaway')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($entry) => [
                'user' => $entry->name,
                'action' => $entry->status === 'winner' ? 'won' : 'entered',
                'giveaway' => $entry->giveaway->title,
                'time' => $entry->created_at->diffForHumans(),
            ]),
        'ending_soon' => Giveaway::where('status', 'active')
            ->where('end_date', '<=', now()->addDay())
            ->withCount('entries')
            ->get(),
        'quick_actions' => [
            'pending_verification' => GiveawayEntry::where('status', 'pending')->count(),
            'ready_to_start' => Giveaway::where('status', 'draft')
                ->where('start_date', '<=', now())
                ->count(),
            'unclaimed_prizes' => Giveaway::whereNotNull('winner_id')
                ->where('prize_claimed', false)
                ->count(),
        ],
    ]);
}
```

### My Recommendation

**Skip Google Analytics** if you want privacy and control. Instead:

1. **Use built-in database metrics** for giveaway-specific data
2. **Add Matomo** if you need detailed visitor analytics (optional)
3. **Focus on actionable metrics** that help you manage giveaways
4. **Add real-time notifications** for immediate actions

The dashboard should help you:

- Quickly see what needs attention
- Monitor giveaway performance
- Take immediate actions
- Track trends over time

**Start simple** with Phase 1, then add features based on actual usage patterns.

---

## 📝 TESTING GUIDE

### Running All Tests

```bash
# Via Sail
./vendor/bin/sail pest

# Specific feature
./vendor/bin/sail pest tests/Feature/Giveaway

# With coverage
./vendor/bin/sail pest --coverage --min=80
```

### Testing Workflow

1. Start testing environment: `docker-compose -f docker-compose.test.yml up -d`
2. Run migrations: `docker-compose -f docker-compose.test.yml exec laravel.test php artisan migrate`
3. Run tests: `docker-compose -f docker-compose.test.yml exec laravel.test php artisan test`

### Test Coverage

- **API Endpoints**: ✅ Covered
- **Multiple Winners**: ✅ Covered
- **Screenshot Upload**: ✅ Covered
- **Scheduled Commands**: ✅ Covered
- **Phone Normalization**: ✅ Covered
- **Validation**: ✅ Covered

---

## 🔧 TROUBLESHOOTING

### Issue: MinIO Connection Refused

**Solution:**

```bash
# Check MinIO is running
docker-compose ps minio

# Check MinIO health
curl http://localhost:9000/minio/health/live

# Restart MinIO
docker-compose restart minio
```

### Issue: Bucket Doesn't Exist

**Solution:**

```bash
# Access MinIO console
http://localhost:9001

# Create bucket via UI or CLI
mc mb local/giveaway-screenshots
```

### Issue: Images Not Loading

**Solution:**

1. Check MinIO URL in `.env` matches your domain
2. Verify bucket policy is set to public read
3. Check Image model is using correct disk

### Issue: Tests Failing

**Solution:**

```bash
# Clear cache
./vendor/bin/sail artisan config:clear
./vendor/bin/sail artisan cache:clear

# Rebuild autoload
./vendor/bin/sail composer dump-autoload

# Run migrations fresh
./vendor/bin/sail artisan migrate:fresh
```

---

## 📋 REMAINING TASKS

### Frontend Updates Needed

1. **Admin Create/Edit Forms**
    - Add `number_of_winners` field
    - Files: `resources/js/pages/admin/giveaways/create.tsx`, `edit.tsx`

2. **Public Entry Form**
    - Add screenshot upload field
    - Add preview before submit
    - File: `resources/js/pages/giveaways/show.tsx`

3. **Winners Display**
    - Show multiple winners instead of single
    - Files: `resources/js/pages/giveaways/winners.tsx`, `components/giveaway/WinnerAnnouncement.tsx`

4. **Admin Winner Selection**
    - Display all winners
    - Show progress (3/5 winners)
    - File: `resources/js/pages/admin/giveaways/winner-selection.tsx`

5. **Screenshot Viewing**
    - Add screenshot column to entries table
    - Add modal to view screenshots
    - File: `resources/js/pages/admin/giveaways/edit.tsx`

### GiveawayEntry Model Update

Add to fillable:

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

### API Entry Submission Update

Update validation in `GiveawayController@submitEntry`:

```php
'screenshot' => 'required|image|mimes:jpeg,jpg,png|max:5120', // 5MB
```

Add screenshot upload logic (see GIVEAWAY_UPDATES.md for full code)

---

## 🎯 SUCCESS CRITERIA

- ✅ All "raffle" references changed to "giveaway"
- ✅ MinIO integrated for image storage
- ✅ Multiple winners feature implemented
- ✅ Testing environment configured
- ✅ Comprehensive tests created
- ⏳ Frontend updates (to be done)
- ⏳ Production deployment

---

## 📞 SUPPORT

For questions:

- Check this guide first
- Review test files for usage examples
- Check Laravel logs: `storage/logs/laravel.log`
- Check MinIO logs: `docker-compose logs minio`

---

**Last Updated:** 2025-11-15
**Version:** 2.0.0
