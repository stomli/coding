/**
 * AnalyticsManager
 * Handles analytics tracking via Mixpanel
 */

class AnalyticsManager {
	constructor() {
		this.enabled = false;
		this.mixpanel = null;
	}

	/**
	 * Initialize Mixpanel with your project token
	 * Get your token from: https://mixpanel.com/project/YOUR_PROJECT_ID/settings
	 * @param {String} token - Your Mixpanel project token
	 */
	init(token) {
		if (!token || typeof mixpanel === 'undefined') {
			console.warn('AnalyticsManager: Mixpanel not available or no token provided');
			return;
		}

		try {
			mixpanel.init(token, {
				debug: false, // Set to true during development
				track_pageview: false, // We'll track manually
				persistence: 'localStorage'
			});
			
			this.mixpanel = mixpanel;
			this.enabled = true;
			console.log('AnalyticsManager: Initialized');
		} catch (error) {
			console.error('AnalyticsManager: Failed to initialize', error);
		}
	}

	/**
	 * Identify a player for tracking
	 * @param {String} playerName - Player identifier
	 * @param {Object} properties - Additional player properties
	 */
	identifyPlayer(playerName, properties = {}) {
		if (!this.enabled) return;
		
		try {
			this.mixpanel.identify(playerName);
			this.mixpanel.people.set({
				$name: playerName,
				...properties
			});
		} catch (error) {
			console.error('AnalyticsManager: Failed to identify player', error);
		}
	}

	/**
	 * Track a game event
	 * @param {String} eventName - Name of the event
	 * @param {Object} properties - Event properties
	 */
	track(eventName, properties = {}) {
		if (!this.enabled) return;
		
		try {
			this.mixpanel.track(eventName, properties);
		} catch (error) {
			console.error('AnalyticsManager: Failed to track event', error);
		}
	}

	// === Game Events ===

	/**
	 * Track when a player starts the game
	 * @param {String} playerName
	 */
	trackGameStart(playerName) {
		this.track('Game Started', {
			player: playerName
		});
	}

	/**
	 * Track level start
	 * @param {Number} difficulty
	 * @param {Number} level
	 */
	trackLevelStart(difficulty, level) {
		this.track('Level Started', {
			difficulty,
			level,
			difficulty_level: `${difficulty}-${level}`
		});
	}

	/**
	 * Track level completion
	 * @param {Number} difficulty
	 * @param {Number} level
	 * @param {Number} score
	 * @param {Number} timeElapsed - Time in seconds
	 * @param {Object} stats - Additional statistics
	 */
	trackLevelComplete(difficulty, level, score, timeElapsed, stats = {}) {
		this.track('Level Completed', {
			difficulty,
			level,
			difficulty_level: `${difficulty}-${level}`,
			score,
			time_seconds: timeElapsed,
			...stats
		});
	}

	/**
	 * Track level failure
	 * @param {Number} difficulty
	 * @param {Number} level
	 * @param {Number} score
	 * @param {Number} timeElapsed - Time in seconds
	 * @param {String} reason - Reason for failure (e.g., 'out_of_space', 'no_moves')
	 * @param {Object} stats - Additional statistics
	 */
	trackLevelFailed(difficulty, level, score, timeElapsed, reason, stats = {}) {
		this.track('Level Failed', {
			difficulty,
			level,
			difficulty_level: `${difficulty}-${level}`,
			score,
			time_seconds: timeElapsed,
			failure_reason: reason,
			...stats
		});
	}

	/**
	 * Track special ball usage
	 * @param {String} ballType - Type of special ball (bomb, painter, etc.)
	 * @param {Number} difficulty
	 * @param {Number} level
	 */
	trackSpecialBallUsed(ballType, difficulty, level) {
		this.track('Special Ball Used', {
			ball_type: ballType,
			difficulty,
			level,
			difficulty_level: `${difficulty}-${level}`
		});
	}

	/**
	 * Track cascade events (combos)
	 * @param {Number} cascadeLevel - How many cascades in the chain
	 * @param {Number} difficulty
	 * @param {Number} level
	 * @param {Number} points - Points earned from cascade
	 */
	trackCascade(cascadeLevel, difficulty, level, points) {
		this.track('Cascade', {
			cascade_level: cascadeLevel,
			difficulty,
			level,
			difficulty_level: `${difficulty}-${level}`,
			points
		});
	}

	/**
	 * Track player progression milestones
	 * @param {String} milestone - Type of milestone (e.g., 'first_win', 'difficulty_unlocked')
	 * @param {Object} properties - Additional properties
	 */
	trackMilestone(milestone, properties = {}) {
		this.track('Milestone Reached', {
			milestone,
			...properties
		});
	}

	/**
	 * Track settings changes
	 * @param {String} setting - Setting name
	 * @param {*} value - New value
	 */
	trackSettingChanged(setting, value) {
		this.track('Setting Changed', {
			setting,
			value
		});
	}

	/**
	 * Track errors
	 * @param {String} errorType - Type of error
	 * @param {String} message - Error message
	 * @param {Object} context - Additional context
	 */
	trackError(errorType, message, context = {}) {
		this.track('Error Occurred', {
			error_type: errorType,
			message,
			...context
		});
	}

	/**
	 * Update player profile with cumulative stats
	 * @param {Object} stats - Player statistics
	 */
	updatePlayerProfile(stats) {
		if (!this.enabled) return;
		
		try {
			this.mixpanel.people.set({
				games_played: stats.gamesPlayed,
				total_score: stats.totalScore,
				high_score: stats.highScore,
				levels_completed: stats.levelsCompleted,
				highest_level: stats.highestLevel,
				last_played: new Date().toISOString()
			});
		} catch (error) {
			console.error('AnalyticsManager: Failed to update player profile', error);
		}
	}

	/**
	 * Increment a player property (useful for counting events)
	 * @param {String} property - Property name
	 * @param {Number} amount - Amount to increment by (default 1)
	 */
	incrementPlayerProperty(property, amount = 1) {
		if (!this.enabled) return;
		
		try {
			this.mixpanel.people.increment(property, amount);
		} catch (error) {
			console.error('AnalyticsManager: Failed to increment property', error);
		}
	}
}

// Create singleton instance
const analyticsManager = new AnalyticsManager();

export default analyticsManager;
