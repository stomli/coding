/**
 * ScoreManager.js
 * 
 * Description: Score calculation and tracking
 * 
 * Dependencies: ConfigManager, EventEmitter, Constants
 * 
 * Exports: ScoreManager singleton
 */

import { ConfigManager } from './ConfigManager.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { CONSTANTS } from '../utils/Constants.js';

/**
 * ScoreManager class for tracking and calculating scores
 */
class ScoreManagerClass {
	
	constructor() {
		this.score = 0;
		this.difficulty = 1;
		this.currentCascadeData = null;
		this.isInitialized = false;
		
		// Bind methods for event listener removal
		this._boundOnBallsCleared = (data) => this._onBallsCleared(data);
		this._boundOnCascadeComplete = (data) => this._onCascadeComplete(data);
	}
	
	/**
	 * Initialize score manager and set up event listeners
	 * @param {Number} difficulty - Game difficulty level (1-5)
	 * @returns {void}
	 */
	initialize(difficulty) {
		this.difficulty = difficulty || 1;
		this.score = 0;
		this.currentCascadeData = null;
		
		// Remove old listeners if already initialized
		if (this.isInitialized) {
			EventEmitter.off(CONSTANTS.EVENTS.BALLS_CLEARED, this._boundOnBallsCleared);
			EventEmitter.off(CONSTANTS.EVENTS.CASCADE_COMPLETE, this._boundOnCascadeComplete);
		}
		
		// Listen for scoring events
		EventEmitter.on(CONSTANTS.EVENTS.BALLS_CLEARED, this._boundOnBallsCleared);
		EventEmitter.on(CONSTANTS.EVENTS.CASCADE_COMPLETE, this._boundOnCascadeComplete);
		
		this.isInitialized = true;
	}
	
	/**
	 * Handle balls cleared event
	 * @param {Object} data - Event data with count and matches
	 * @private
	 */
	_onBallsCleared(data) {
		// Store data for cascade scoring
		if (!this.currentCascadeData) {
			this.currentCascadeData = {
				totalBalls: 0,
				cascadeLevel: 0
			};
		}
		
		this.currentCascadeData.totalBalls += data.count;
		this.currentCascadeData.cascadeLevel++;
	}
	
	/**
	 * Handle cascade complete event
	 * @param {Object} data - Event data with cascadeCount
	 * @private
	 */
	_onCascadeComplete(data) {
		if (!this.currentCascadeData) {
			return;
		}
		
		// Calculate score for this cascade sequence
		const points = this._calculateCascadeScore(
			this.currentCascadeData.totalBalls,
			data.cascadeCount
		);
		
		this.score += points;
		
		// Emit score update event
		EventEmitter.emit(CONSTANTS.EVENTS.SCORE_UPDATE, { 
			score: this.score,
			points: points,
			cascadeCount: data.cascadeCount
		});
		
		// Reset cascade data
		this.currentCascadeData = null;
	}
	
	/**
	 * Calculate score for a cascade sequence
	 * @param {Number} ballCount - Total balls cleared
	 * @param {Number} cascadeCount - Number of cascades
	 * @returns {Number} Points earned
	 * @private
	 */
	_calculateCascadeScore(ballCount, cascadeCount) {
		const basePoints = ConfigManager.get('scoring.basePointsPerBall', 1);
		const cascadeBase = ConfigManager.get('scoring.cascadeBaseBonus', 3);
		const cascadeMultiplier = ConfigManager.get('scoring.cascadeBonusMultiplier', 2);
		const difficultyMultiplier = ConfigManager.get(`scoring.difficultyMultipliers.difficulty${this.difficulty}`, 1.0);
		
		// Base score from balls
		let score = ballCount * basePoints;
		
		// Cascade bonus: each cascade after first multiplies the bonus
		if (cascadeCount > 1) {
			for (let i = 1; i < cascadeCount; i++) {
				const cascadeBonus = cascadeBase * Math.pow(cascadeMultiplier, i - 1);
				score += cascadeBonus;
			}
		}
		
		// Apply difficulty multiplier
		score = Math.floor(score * difficultyMultiplier);
		
		return score;
	}
	
	/**
	 * Get current score
	 * @returns {Number} Current score
	 */
	getScore() {
		return this.score;
	}
	
	/**
	 * Add points directly (for special events)
	 * @param {Number} points - Points to add
	 * @returns {void}
	 */
	addPoints(points) {
		this.score += points;
		EventEmitter.emit(CONSTANTS.EVENTS.SCORE_UPDATE, { 
			score: this.score,
			points: points
		});
	}
	
	/**
	 * Reset score to zero
	 * @returns {void}
	 */
	reset() {
		this.score = 0;
		this.currentCascadeData = null;
		EventEmitter.emit(CONSTANTS.EVENTS.SCORE_UPDATE, { 
			score: 0,
			points: 0
		});
	}
}

// Export singleton instance
const ScoreManager = new ScoreManagerClass();
export default ScoreManager;
export { ScoreManager };
