# Next Steps for AdSense Integration

Your AdSense integration is now complete! Here's what you need to do to activate real ads.

## ✅ What's Already Done

1. **AdSense Script** - Added to `app.blade.php`
2. **Ad Components** - Created reusable React components
3. **Configuration** - Set up in `config/services.php` and `.env.production`
4. **Client ID** - Your AdSense ID `ca-pub-8464970113450424` is already configured
5. **Ad Placements** - Ads are placed on:
    - Blog post pages (top, bottom, sidebar)
    - Raffle pages (top, sidebar)

## 📝 What You Need to Do

### Step 1: Create Ad Units in AdSense Dashboard

Go to your AdSense dashboard: https://www.google.com/adsense

Create 5 ad units:

1. **Blog Post Top Banner**
    - Ad type: Display ads
    - Size: Responsive (horizontal)
    - Name it: "Blog Post Top"

2. **Blog Post Bottom Banner**
    - Ad type: Display ads
    - Size: Responsive (horizontal)
    - Name it: "Blog Post Bottom"

3. **Blog Post Sidebar**
    - Ad type: Display ads
    - Size: Responsive (vertical) or 300x600
    - Name it: "Blog Sidebar"

4. **Raffle Top Banner**
    - Ad type: Display ads
    - Size: Responsive (horizontal)
    - Name it: "Raffle Top"

5. **Raffle Sidebar**
    - Ad type: Display ads
    - Size: Responsive or 300x250
    - Name it: "Raffle Sidebar"

### Step 2: Get the Ad Slot IDs

After creating each ad unit, AdSense will give you a **slot ID** (numbers only, like `1234567890`).

### Step 3: Update .env.production

Edit `/home/humfurie/Desktop/Projects/laravel-react-12/.env.production` and fill in the slot IDs:

```env
# Google AdSense Configuration
ADSENSE_CLIENT_ID=ca-pub-8464970113450424

# Blog Post Ad Slots
ADSENSE_BLOG_POST_TOP_SLOT=YOUR_SLOT_ID_HERE
ADSENSE_BLOG_POST_BOTTOM_SLOT=YOUR_SLOT_ID_HERE
ADSENSE_BLOG_POST_SIDEBAR_SLOT=YOUR_SLOT_ID_HERE

# Raffle Page Ad Slots
ADSENSE_RAFFLE_TOP_SLOT=YOUR_SLOT_ID_HERE
ADSENSE_RAFFLE_SIDEBAR_SLOT=YOUR_SLOT_ID_HERE
```

### Step 4: Deploy to Production

1. Build your frontend assets:
   ```bash
   npm run build
   ```

2. Deploy using your production `.env.production` file

3. Ensure the production server uses the `.env.production` file

## 🔍 How It Works

The ads will automatically:

- Show **placeholders** in development (local environment)
- Show **real AdSense ads** in production (when ADSENSE_CLIENT_ID is set)

This is controlled by the `testMode` prop, which checks if AdSense is enabled:

```typescript
testMode = {!
adsense?.enabled
}
```

## 🧪 Testing

### Local Development

- Ads show as gray placeholders with "Advertisement" text
- No real ads load (prevents invalid clicks during development)

### Production

- Once slot IDs are configured, real ads will display
- Wait 24-48 hours for ads to fully populate
- **Important**: Don't click your own ads!

## ⚠️ Important Notes

1. **Don't click your own ads** - This violates AdSense policy
2. **Wait for ads to populate** - Can take 24-48 hours after setup
3. **Check content policies** - Ensure your content complies with AdSense policies
4. **Monitor performance** - Check AdSense dashboard regularly

## 🚀 Verification Checklist

Before deploying:

- [ ] Created 5 ad units in AdSense dashboard
- [ ] Copied all 5 slot IDs
- [ ] Updated `.env.production` with all slot IDs
- [ ] Built production assets (`npm run build`)
- [ ] Ready to deploy

After deploying:

- [ ] Visit a blog post page
- [ ] Visit a raffle page
- [ ] Check browser console for errors
- [ ] Verify ads are loading (may show blank initially)
- [ ] Wait 24-48 hours for full ad population

## 📊 Monitoring

Check your AdSense dashboard:

- **Reports** → See earnings and performance
- **Sites** → View individual site stats
- **Policy center** → Check for any policy issues

## 🆘 Troubleshooting

**Ads not showing?**

- Check browser console for errors
- Verify slot IDs are correct
- Wait 24-48 hours for ad population
- Ensure site has sufficient content

**Blank ad spaces?**

- AdSense may not have ads for your content yet
- Low competition for your niche
- Give it more time to populate

## 📚 Resources

- AdSense Dashboard: https://www.google.com/adsense
- AdSense Help: https://support.google.com/adsense
- Policy Guide: https://support.google.com/adsense/answer/48182

---

**Current Status:** ⏳ Waiting for ad slot IDs to be added to `.env.production`
