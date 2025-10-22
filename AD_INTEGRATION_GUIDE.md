# Ad Integration Guide

This guide shows you how to add advertisements to your blog for monetization.

## Privacy & Consent (GDPR/CCPA Compliant) ✅

**Good news!** Your site already includes a **Google-compliant Consent Management Platform (CMP)** with 3 choices:

- ✅ **Accept All** - User consents to all cookies and personalized ads
- ❌ **Reject All** - User denies consent, only non-personalized ads shown
- ⚙️ **Manage Options** - User can customize individual cookie preferences

### How It Works

1. **First Visit:** Users see a consent banner at the bottom of the page
2. **User Chooses:** Accept All, Reject All, or Manage Options
3. **Consent Stored:** Choice is saved in browser for 13 months
4. **Ads Respect Consent:** Google AdSense automatically serves:
    - **Personalized ads** if user accepts
    - **Non-personalized ads** if user rejects

### Implementation Details

The consent system uses **Google Consent Mode v2**, which:

- Complies with GDPR, CCPA, and other privacy regulations
- Communicates consent choices to Google services automatically
- Doesn't require you to manually check consent before showing ads
- Maintains ad revenue even when users reject personalized ads

**Files involved:**

- `resources/views/app.blade.php` - Google Consent Mode v2 script
- `resources/js/components/consent/ConsentBanner.tsx` - Banner with 3 choices
- `resources/js/components/consent/ConsentModal.tsx` - Preference management modal
- `resources/js/app.tsx` - ConsentBanner integrated globally

**No action needed!** The consent system is already active and working.

---

## Supported Ad Networks

- **Google AdSense** (Recommended for beginners)
- **Mediavine** (Requires 50k monthly sessions)
- **AdThrive** (Requires 100k monthly pageviews)
- **Custom ad networks** (Any HTML/JavaScript based ads)

## Quick Start with Google AdSense

### 1. Sign Up for AdSense

1. Visit [Google AdSense](https://www.google.com/adsense)
2. Create an account or sign in
3. Add your website URL
4. Wait for approval (typically 1-2 weeks)

### 2. Configure ads.txt File ✅

**Already created!** An `ads.txt` file exists at `public/ads.txt`.

**What you need to do:**

1. **Find your AdSense Publisher ID:**
    - Log in to [Google AdSense](https://www.google.com/adsense)
    - Click "Account" in the left sidebar
    - Look for "Publisher ID" (format: `pub-1234567890123456`)

2. **Update the ads.txt file:**
    - Open `public/ads.txt`
    - Replace `pub-0000000000000000` with your actual Publisher ID
    - Save the file

3. **Verify it's accessible:**
    - Visit: `https://humfurie.org/ads.txt`
    - Should show: `google.com, pub-YOUR_ID, DIRECT, f08c47fec0942fa0`

**Why ads.txt is required:**

- Prevents ad fraud
- Verifies you as the legitimate publisher
- Required by Google AdSense
- Improves ad fill rates

**Note:** After deploying, it may take 24-48 hours for Google to crawl your ads.txt file.

### 3. Add AdSense Script to Your Site

Once approved, add the AdSense script to `resources/views/app.blade.php`:

```html
<!-- Add this in the <head> section, AFTER the Google Consent Mode script and before @vite -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_CLIENT_ID"
        crossorigin="anonymous"></script>
```

Replace `YOUR_CLIENT_ID` with your actual AdSense client ID.

**Important:** The AdSense script must be added AFTER the Google Consent Mode script (already in place) to ensure
consent choices are respected.

### 4. Use the AdSlot Component

The `AdSlot` component is already created at `resources/js/components/ads/AdSlot.tsx`.

## Ad Placement Examples

### Option 1: In Blog Post Content

Add ads within the blog post content for maximum visibility.

**File:** `resources/js/pages/user/blog-post.tsx`

```tsx
import AdSlot from '@/components/ads/AdSlot';

// Add after the blog content section (around line 190)
{/* Blog Content */}
<section className="bg-white py-16">
    <div className="container mx-auto max-w-4xl px-4">
        <div className="prose prose-lg ...">
            <div
                dangerouslySetInnerHTML={{ __html: blog.content }}
                className="blog-content ..."
            />
        </div>

        {/* Ad Slot - In-Content */}
        <AdSlot
            type="in-content"
            adClient="ca-pub-YOUR_CLIENT_ID"
            adSlot="YOUR_AD_SLOT_ID"
            className="mt-8"
        />
    </div>
</section>
```

### Option 2: Between Blog Posts in Listing

Show ads between blog post cards on the blog listing page.

**File:** `resources/js/pages/user/blog.tsx`

```tsx
import AdSlot from '@/components/ads/AdSlot';

// Modify the blog grid to add ads every 6 posts (around line 284)
<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
    {blogs.data.map((blog, index) => (
        <>
            <EnhancedBlogCard key={String(blog.id)} blog={blog} showStats={true} />

            {/* Ad every 6 posts */}
            {(index + 1) % 6 === 0 && index !== blogs.data.length - 1 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <AdSlot
                        type="between-posts"
                        adClient="ca-pub-YOUR_CLIENT_ID"
                        adSlot="YOUR_AD_SLOT_ID"
                    />
                </div>
            )}
        </>
    ))}
</div>
```

### Option 3: Top Banner Ad

Add a banner at the top of the blog listing page.

**File:** `resources/js/pages/user/blog.tsx`

```tsx
import AdSlot from '@/components/ads/AdSlot';

// Add after the header section (around line 264)
{/* Header Section */}
<section className="from-brand-orange ...">
    {/* ... header content ... */}
</section>

{/* Top Banner Ad */}
<section className="bg-gray-50 py-4">
    <div className="container mx-auto px-4">
        <AdSlot
            type="banner"
            adClient="ca-pub-YOUR_CLIENT_ID"
            adSlot="YOUR_AD_SLOT_ID"
        />
    </div>
</section>

{/* Blog Posts List */}
<section className="bg-white py-16">
    {/* ... blog posts ... */}
</section>
```

### Option 4: Sticky Bottom Ad (Mobile Only)

Add a sticky banner at the bottom of the screen on mobile devices.

**File:** `resources/js/pages/user/blog-post.tsx`

```tsx
import AdSlot from '@/components/ads/AdSlot';

// Add before the closing </> fragment (around line 206)
        <Footer />

        {/* Sticky Bottom Ad - Mobile Only */}
        <AdSlot
            type="sticky-bottom"
            adClient="ca-pub-YOUR_CLIENT_ID"
            adSlot="YOUR_AD_SLOT_ID"
        />
    </>
);
```

### Option 5: Sidebar Ad (If You Add a Sidebar)

If you create a sidebar layout:

```tsx
<div className="container mx-auto grid grid-cols-1 gap-8 lg:grid-cols-4">
    {/* Main Content */}
    <div className="lg:col-span-3">
        {/* Your blog content */}
    </div>

    {/* Sidebar */}
    <aside className="lg:col-span-1">
        <div className="sticky top-24">
            <AdSlot
                type="sidebar"
                adClient="ca-pub-YOUR_CLIENT_ID"
                adSlot="YOUR_AD_SLOT_ID"
            />
        </div>
    </aside>
</div>
```

## Creating Ad Units in AdSense

1. Log in to your AdSense account
2. Go to **Ads** > **By ad unit**
3. Click **New ad unit**
4. Choose ad type:
    - **Display ads** (Recommended - responsive)
    - **In-feed ads** (For blog listings)
    - **In-article ads** (For blog content)
5. Configure size and settings
6. Copy the `data-ad-client` and `data-ad-slot` values
7. Use these values in the `AdSlot` component

## Ad Placement Best Practices

### High-Performing Placements

1. **Above the fold** - Top of blog post before content
2. **Within content** - After 1-2 paragraphs
3. **End of content** - After the blog post
4. **Between posts** - In blog listing grid
5. **Sticky bottom** - Mobile banner (use sparingly)

### Recommended Ad Density

- **Blog Posts:** 1 ad per 500 words
- **Blog Listing:** 1 ad per 6 posts
- **Maximum:** 3-4 ads per page (avoid over-saturation)

### Avoid

- Ads too close to navigation
- Ads that block content
- Too many ads per page (hurts UX and SEO)
- Ads in the header/navbar
- Auto-play video ads

## Alternative: Mediavine/AdThrive Integration

If you're using Mediavine or AdThrive (premium ad networks), they handle ad placement automatically via their script:

**File:** `resources/views/app.blade.php`

```html
<!-- Mediavine Script -->
<script async src="https://scripts.mediavine.com/tags/YOUR_SITE_ID.js"></script>

<!-- AdThrive Script -->
<script async src="https://www.adthrive.com/sites/YOUR_SITE_ID/ads.min.js"></script>
```

These networks automatically insert ads without needing the `AdSlot` component.

## Custom Ad Networks

For other ad networks or direct ad sales, modify the `AdSlot` component:

```tsx
// Replace the <ins> element with your ad network's code
<div className={`ad-container ${adStyles} ${className}`}>
    {/* Your custom ad code here */}
    <div id="custom-ad-slot" data-ad-id={adSlot} />
</div>
```

## Testing Ads

### Development Mode

The `AdSlot` component shows a placeholder when `adClient` or `adSlot` props are missing:

```tsx
<AdSlot type="banner" />
```

This displays a gray box indicating where the ad will appear.

### Production Testing

1. Enable **Test Ads** in AdSense settings
2. Add `?google_ads_preview=true` to your URL
3. Use the [Google Publisher Toolbar](https://chrome.google.com/webstore/detail/google-publisher-toolbar/)

## Revenue Expectations

**Google AdSense:**

- RPM (Revenue per 1000 views): $1-$15
- 50,000 monthly views = $50-$750/month
- Depends on niche, location, ad placement

**Mediavine:**

- Minimum: 50k sessions/month
- RPM: $10-$30+
- Higher earnings than AdSense

**AdThrive:**

- Minimum: 100k pageviews/month
- RPM: $15-$40+
- Highest tier ad network

## Compliance & Best Practices

### AdSense Policies

- Don't click your own ads
- Don't ask users to click ads
- Don't place ads on blank pages
- Follow [AdSense Program Policies](https://support.google.com/adsense/answer/48182)

### User Experience

- Keep site speed fast (ads can slow down pages)
- Use lazy loading for ads
- Don't block main content
- Provide value before ads

### SEO Considerations

- Ads don't hurt SEO directly
- But too many ads = bad UX = higher bounce rate = worse rankings
- Keep Core Web Vitals in check
- Ensure ads don't block content

## Troubleshooting

### Ads Not Showing

1. **Check AdSense approval status**
2. **Verify script is loaded** - View page source, look for `adsbygoogle.js`
3. **Check browser console** - Look for errors
4. **Ad blockers** - Disable to test
5. **Wait 24-48 hours** - New ad units take time to activate

### Low Ad Revenue

1. **Improve ad placement** - Move ads above the fold
2. **Increase traffic** - SEO and content marketing
3. **Target higher-value niches** - Finance, insurance, legal
4. **Switch to premium networks** - Mediavine/AdThrive when eligible
5. **Optimize site speed** - Faster sites = better ad viewability

## Need Help?

- [AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Community](https://support.google.com/adsense/community)
- Review this guide's code examples
- Test with the placeholder component first

---

**Ready to monetize?** Start by signing up for Google AdSense, then follow the examples above to add your first ad!
