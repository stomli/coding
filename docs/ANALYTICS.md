# Analytics Setup Guide

This game uses **Mixpanel** for analytics tracking to help understand player behavior and improve the game.

## Quick Start

### 1. Create a Mixpanel Account

1. Go to [mixpanel.com](https://mixpanel.com)
2. Sign up for a free account (100,000 events/month)
3. Create a new project for your game

### 2. Get Your Project Token

1. In Mixpanel, go to **Project Settings**
2. Click **Access Keys** (or **Project Settings > Access Keys**)
3. Copy your **Project Token**

### 3. Configure the Game

1. Open `src/config/analytics.config.js`
2. Set `enabled: true`
3. Replace `'YOUR_TOKEN_HERE'` with your actual token:
   ```javascript
   export const ANALYTICS_CONFIG = {
       enabled: true,  // Enable tracking
       mixpanelToken: 'abc123def456',  // Your actual token
       debug: false  // Set to true to see events in console
   };
   ```

### 4. Test It

1. Open your game
2. Play a level
3. Go to Mixpanel dashboard → **Events** tab
4. You should see events like:
   - `Level Started`
   - `Level Completed`
   - `Player Created`

## What's Being Tracked

### Player Events
- **Player Created** - When a new player profile is made
- **Player Switched** - When switching between player profiles

### Gameplay Events
- **Level Started** - When a level begins (difficulty, level)
- **Level Completed** - When a level is won (score, time, stats)
- **Level Failed** - When a level is lost (reason, score, time)
- **Cascade** - When cascade combos occur (level, points)

### Statistics
- Balls cleared per game
- Special balls used
- High scores
- Time survived
- Player progression

## Privacy & Data

All analytics are **anonymous by default**. Player names are used as identifiers but no personal information is collected. 

To completely disable analytics:
```javascript
// In src/config/analytics.config.js
enabled: false
```

## Viewing Your Data

In Mixpanel, you can:

1. **Insights** - See event trends over time
2. **Funnels** - Track player progression (Level 1 → 2 → 3)
3. **Retention** - See how many players return
4. **Users** - View individual player journeys

## Useful Queries

### Level Completion Rate
- Event: `Level Completed`
- Group by: `difficulty`, `level`
- Chart type: Bar chart

### Average Score by Level
- Event: `Level Completed`
- Metric: Average of `score`
- Group by: `difficulty_level`

### Player Retention
- Report type: Retention
- First event: `Player Created`
- Return event: `Level Started`

## Debugging

Enable debug mode to see events in console:
```javascript
// In src/config/analytics.config.js
debug: true
```

Events will be logged to console but still sent to Mixpanel.

## Cost

Mixpanel's free tier includes:
- **100,000 events/month**
- Unlimited data history
- All core features

For a typical indie game, this is plenty. If you exceed the limit, you can:
- Upgrade to paid plan (~$20/mo for 1M events)
- Switch to self-hosted PostHog
- Reduce tracked events

## Alternative: Disable Analytics

If you don't want any analytics:

1. Set `enabled: false` in `src/config/analytics.config.js`
2. Or remove the Mixpanel script from `index.html` (lines 17-20)
3. Analytics calls will silently fail (no errors)

The game works perfectly without analytics enabled.
