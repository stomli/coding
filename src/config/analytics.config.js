/**
 * Analytics Configuration
 * 
 * To enable Mixpanel analytics:
 * 1. Sign up at https://mixpanel.com
 * 2. Create a new project
 * 3. Copy your project token from: Project Settings > Access Keys
 * 4. Replace 'YOUR_TOKEN_HERE' below with your actual token
 * 5. Set enabled: true
 * 
 * To disable analytics completely:
 * - Set enabled: false
 */

export const ANALYTICS_CONFIG = {
	// Set to true to enable analytics tracking
	enabled: true,
	
	// Your Mixpanel project token
	// Get from: https://mixpanel.com/project/YOUR_PROJECT_ID/settings
	mixpanelToken: 'edcdc866ccbef9f9a1cb92383f10ac96',
	
	// Enable debug mode to see events in console
	debug: false,
	
	// Autocapture: Automatically track clicks, page views, and form submissions
	autocapture: true,
	
	// Session Recording: Record user sessions for playback (0-100)
	// 100 = record all sessions, 0 = record none
	recordSessionsPercent: 100
};
