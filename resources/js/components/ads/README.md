# Advertisement Components

This folder contains reusable ad components for integrating advertisements into your application.

## Components

### 1. AdBanner

A flexible banner ad component that supports Google AdSense and other ad networks.

**Props:**

- `adSlot` - Ad slot ID (e.g., Google AdSense slot ID)
- `adClient` - Ad client ID (e.g., "ca-pub-XXXXXXXXXXXXXXXX")
- `adFormat` - Ad format: "auto", "rectangle", "horizontal", "vertical"
- `adLayout` - Ad layout (for responsive ads)
- `adLayoutKey` - Ad layout key (for responsive ads)
- `style` - Custom inline styles
- `className` - Custom CSS classes
- `testMode` - Boolean, shows placeholder when true (default: true)

### 2. StickyAd

A sidebar ad that sticks to the viewport while scrolling.

**Props:**

- `adSlot` - Ad slot ID
- `adClient` - Ad client ID
- `testMode` - Boolean (default: true)
- `position` - "left" or "right" (default: "right")

## Setup Instructions

### For Google AdSense:

1. **Add AdSense Script to HTML Head**

   Edit `resources/views/app.blade.php` and add this in the `<head>` section:

   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```

   Replace `XXXXXXXXXXXXXXXX` with your AdSense Publisher ID.

2. **Create Ad Units in AdSense Dashboard**
    - Go to https://www.google.com/adsense
    - Create ad units for each placement
    - Copy the ad slot IDs

3. **Configure Environment Variables** (Optional)

   Add to `.env`:
   ```
   ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
   ADSENSE_BLOG_TOP_SLOT=1234567890
   ADSENSE_BLOG_SIDEBAR_SLOT=0987654321
   ADSENSE_RAFFLE_TOP_SLOT=1122334455
   ```

4. **Update Components to Use Real Ads**

   Change `testMode={true}` to `testMode={false}` and add your ad IDs:

   ```tsx
   <AdBanner
       adClient={import.meta.env.VITE_ADSENSE_CLIENT_ID}
       adSlot={import.meta.env.VITE_ADSENSE_BLOG_TOP_SLOT}
       adFormat="horizontal"
       testMode={false}
   />
   ```

### For Other Ad Networks:

1. Set `testMode={false}`
2. Use the component as a container
3. Insert your ad network's code inside the component or modify the component to suit your needs

## Current Ad Placements

### Blog Post Page (`blog-post.tsx`)

- **Top Banner**: Above content (horizontal format)
- **Bottom Banner**: Below content (horizontal format)
- **Sidebar**: Sticky sidebar ad (vertical format, 300x600)

### Raffle Page (`Raffles/Show.tsx`)

- **Top Banner**: Above raffle details (horizontal format)
- **Sidebar Top**: Above entry form (rectangle format, 300x250)

## Ad Slot Naming Convention

Use descriptive slot names:

- `blog-post-top` - Top banner on blog post
- `blog-post-sidebar` - Sidebar on blog post
- `raffle-top` - Top banner on raffle page
- `raffle-sidebar-top` - Sidebar ad on raffle page

## Testing

All ads are in **test mode** by default (showing gray placeholders). This prevents accidental clicks and invalid traffic
during development.

**To enable real ads:**

1. Complete Google AdSense setup
2. Add your client ID and slot IDs
3. Change `testMode={true}` to `testMode={false}`
4. Deploy to production

## Best Practices

1. **Don't overload pages** - Too many ads hurt user experience
2. **Respect Google's policies** - Follow AdSense program policies
3. **Mobile-friendly** - Ensure ads are responsive
4. **Page load speed** - Monitor impact on performance
5. **Ad blindness** - Don't make ads look like content

## AdSense Policy Reminders

- Don't click your own ads
- Don't encourage clicks ("Click here", "Support us")
- Don't place ads on error pages or empty content
- Maintain content-to-ad ratio (more content than ads)
- Don't modify AdSense code

## Troubleshooting

**Ads not showing:**

- Check AdSense script is loaded
- Verify ad slot IDs are correct
- Check browser console for errors
- Ensure page has enough content
- Wait 24-48 hours for new sites (AdSense review period)

**Blank space instead of ads:**

- AdSense may not have ads for your content
- Low bid competition
- Content policy issues

## Support

For AdSense support: https://support.google.com/adsense
