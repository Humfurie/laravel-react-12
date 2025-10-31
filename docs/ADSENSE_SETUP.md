# Google AdSense Setup Guide

Your application is now configured to use Google AdSense! Follow these steps to activate ads.

## Step 1: Sign Up for Google AdSense

1. Go to https://www.google.com/adsense
2. Sign up with your Google account
3. Add your website URL
4. Wait for approval (can take 24-48 hours to several days)

## Step 2: Get Your Publisher ID

Once approved:

1. Go to AdSense Dashboard → Account → Settings
2. Find your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)
3. Copy this ID

## Step 3: Create Ad Units

1. In AdSense Dashboard, go to **Ads** → **By ad unit**
2. Click **Create ad unit** and create the following:

### Blog Post Ads

- **Blog Top Banner**
    - Type: Display ads
    - Size: Responsive (horizontal)
    - Name: "Blog Post Top"
    - Copy the Ad slot ID

- **Blog Bottom Banner**
    - Type: Display ads
    - Size: Responsive (horizontal)
    - Name: "Blog Post Bottom"
    - Copy the Ad slot ID

- **Blog Sidebar**
    - Type: Display ads
    - Size: Responsive (vertical) or Fixed (300x600)
    - Name: "Blog Sidebar"
    - Copy the Ad slot ID

### Raffle Page Ads

- **Raffle Top Banner**
    - Type: Display ads
    - Size: Responsive (horizontal)
    - Name: "Raffle Top"
    - Copy the Ad slot ID

- **Raffle Sidebar**
    - Type: Display ads
    - Size: Responsive or Fixed (300x250)
    - Name: "Raffle Sidebar"
    - Copy the Ad slot ID

## Step 4: Add to Environment Variables

Add these to your `.env` file:

```env
# Google AdSense Configuration
ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX

# Blog Post Ad Slots
ADSENSE_BLOG_POST_TOP_SLOT=1234567890
ADSENSE_BLOG_POST_BOTTOM_SLOT=0987654321
ADSENSE_BLOG_POST_SIDEBAR_SLOT=1122334455

# Raffle Page Ad Slots
ADSENSE_RAFFLE_TOP_SLOT=5566778899
ADSENSE_RAFFLE_SIDEBAR_SLOT=9988776655
```

Replace the X's and numbers with your actual IDs from AdSense.

## Step 5: Enable Production Ads

The ads are currently in **test mode** (showing gray placeholders).

To enable real ads, update these files:

### resources/js/pages/user/blog-post.tsx

Change all instances of `testMode={true}` to `testMode={false}`

### resources/js/pages/Raffles/Show.tsx

Change all instances of `testMode={true}` to `testMode={false}`

## Step 6: Deploy and Verify

1. Build your assets: `npm run build`
2. Deploy to production
3. Visit your pages and check if ads are showing
4. **Important**: Do NOT click your own ads! This violates AdSense policies

## Troubleshooting

### Ads not showing

**Blank space where ads should be:**

- Wait 24-48 hours after setup (ads need time to populate)
- Check browser console for errors
- Verify ad slot IDs are correct
- Ensure your site has enough content

**"AdSense not approved" or still in review:**

- Complete the application process
- Ensure your site meets AdSense policies:
    - Original, quality content
    - Easy navigation
    - Privacy policy page
    - About page
    - Contact information

**Console errors:**

- Check that ADSENSE_CLIENT_ID is set correctly
- Verify the AdSense script is loading (check Network tab)
- Make sure testMode is false in production

### Ad Policy Issues

**Content requirements:**

- No illegal content
- No copyrighted material without permission
- No adult/mature content
- No violent or dangerous content
- Original articles with sufficient content

**Technical requirements:**

- Privacy policy must be present
- Site must be publicly accessible
- Pages must load quickly
- Mobile-friendly design

## AdSense Best Practices

### Do's ✅

- Place ads in visible locations
- Use responsive ad units
- Monitor performance in AdSense dashboard
- Maintain high-quality content
- Keep content-to-ad ratio balanced

### Don'ts ❌

- Click your own ads
- Ask others to click ads
- Use phrases like "Click here" or "Support us by clicking"
- Place ads on error pages or empty pages
- Modify the AdSense code
- Use more than 3 ad units per page (recommended)

## Monitoring Performance

1. Go to AdSense Dashboard → Reports
2. Monitor:
    - Page views
    - Clicks
    - CTR (Click-through rate)
    - CPC (Cost per click)
    - Earnings

## Payment

- Minimum payment threshold: $100
- Payment methods: Bank transfer, check, Western Union
- Payment schedule: Monthly (around the 21st-26th)

## Support

- AdSense Help Center: https://support.google.com/adsense
- AdSense Policies: https://support.google.com/adsense/answer/48182
- Contact Support: https://support.google.com/adsense/gethelp

## Current Ad Placements

### Blog Post Pages

- Top banner (horizontal) - Above content
- Bottom banner (horizontal) - Below content
- Sidebar (vertical) - Right side, sticky

### Raffle Pages

- Top banner (horizontal) - Above raffle details
- Sidebar (rectangle) - Above entry form

All ads are responsive and mobile-friendly!
