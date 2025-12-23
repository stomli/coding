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
import PlayerManager from './PlayerManager.js';

/**
 * ScoreManager class for tracking and calculating scores
 */
class ScoreManagerClass {
	
	constructor() {
		this.score = 0;
		this.difficulty = 1;
		this.level = 1;
		this.currentCascadeData = null;
		this.isInitialized = false;
		
		// Bind methods for event listener removal
		this._boundOnBallsCleared = (data) => this._onBallsCleared(data);
		this._boundOnCascadeComplete = (data) => this._onCascadeComplete(data);
	}
	
	/**
	 * Initialize score manager and set up event listeners
	 * @param {Number} difficulty - Game difficulty level (1-5)
	 * @param {Number} level - Game level
	 * @returns {void}
	 */
	initialize(difficulty, level) {
		this.difficulty = difficulty || 1;
		this.level = level || 1;
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
		
		// Emit initial score update with best score
		const bestScore = PlayerManager.getLevelBestScore(this.difficulty, this.level) || 0;
		EventEmitter.emit(CONSTANTS.EVENTS.SCORE_UPDATE, { 
			score: 0,
			bestScore: bestScore,
			points: 0
		});
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
				ballsPerLevel: [] // Track balls cleared at each cascade level
			};
		}
		
		// Add balls to current cascade level (sum all BALLS_CLEARED in this iteration)
		const currentLevel = this.currentCascadeData.ballsPerLevel.length;
		if (!this.currentCascadeData.ballsPerLevel[currentLevel]) {
			this.currentCascadeData.ballsPerLevel[currentLevel] = 0;
		}
		this.currentCascadeData.ballsPerLevel[currentLevel] += data.count;
		
		console.log(`⚽ BALLS_CLEARED: ${data.count} balls, level ${currentLevel} now has ${this.currentCascadeData.ballsPerLevel[currentLevel]} balls`);
	}
	
	/**
	 * Signal start of new cascade level (called between cascade iterations)
	 * This should be called when gravity completes and we're about to check for new matches
	 */
	_onCascadeLevelComplete() {
		if (this.currentCascadeData) {
			// Just a marker - next BALLS_CLEARED will start a new level
			console.log(`📊 Cascade level ${this.currentCascadeData.ballsPerLevel.length} complete`);
		}
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
		
		// Use cascade count from GameEngine (actual cascade iterations)
		const cascadeCount = data.cascadeCount;
		
		// Calculate score using progressive multipliers per level
		const points = this._calculateCascadeScore(
			this.currentCascadeData.ballsPerLevel,
			cascadeCount
		);
		
		this.score += points;
		
		// Get best score for current level/difficulty
		const bestScore = PlayerManager.getLevelBestScore(this.difficulty, this.level) || 0;
		
		// Emit score update event
		EventEmitter.emit(CONSTANTS.EVENTS.SCORE_UPDATE, { 
			score: this.score,
			bestScore: bestScore,
			points: points,
			cascadeCount: cascadeCount
		});
		
		// Reset cascade data
		this.currentCascadeData = null;
	}
	
	/**
	 * Calculate score for a cascade sequence using progressive multipliers
	 * Formula: Each cascade level N: balls × basePoints × N, plus cascade bonuses
	 * Example: 2x cascade with L1(3 balls) + L2(5 balls) = (3×10×1) + (5×10×2) + cascadeBonus = 30 + 100 + 50 = 180 points
	 * @param {Array<Number>} ballsPerLevel - Number of balls cleared at each cascade level [L1, L2, L3, ...]
	 * @param {Number} cascadeCount - Total number of cascade levels in sequence
	 * @returns {Number} Points earned after applying difficulty multiplier
	 * @private
	 */
	_calculateCascadeScore(ballsPerLevel, cascadeCount) {
		const basePoints = ConfigManager.get('scoring.basePointsPerBall', 1); // Default: 1 point per ball
		const difficultyMultiplier = ConfigManager.get(`scoring.difficultyMultipliers.difficulty${this.difficulty}`, 1.0); // 1.0x - 3.0x
		const cascadeBaseBonus = ConfigManager.get('scoring.cascadeBaseBonus', 3); // Bonus for cascades
		
		let score = 0;
		let breakdown = []; // For debug logging: ["L1(3×10×1=30)", "L2(5×10×2=100)"]
		
		// Progressive cascade scoring: each level gets increasing multiplier
		// Level 1: ×1, Level 2: ×2, Level 3: ×3, etc.
		for (let level = 0; level < ballsPerLevel.length; level++) {
			const balls = ballsPerLevel[level] || 0;
			const multiplier = (level + 1); // Cascade level number: 1x, 2x, 3x, 4x, etc.
			const levelScore = balls * basePoints * multiplier;
			score += levelScore;
			breakdown.push(`L${level + 1}(${balls}×${basePoints}×${multiplier}=${levelScore})`);
		}
		
		// Add cascade bonus for 2+ level cascades
		if (cascadeCount >= 2) {
			const cascadeBonus = cascadeBaseBonus * (cascadeCount - 1);
			score += cascadeBonus;
			breakdown.push(`CascadeBonus(${cascadeBonus})`);
		}
		
		// Apply difficulty multiplier to final total
		score = Math.floor(score * difficultyMultiplier);
		
		const totalBalls = ballsPerLevel.reduce((sum, b) => sum + b, 0);
		console.log(`🎯 SCORE CALC: ${totalBalls} balls, ${cascadeCount}x cascade, ${breakdown.join(' + ')}, difficulty=${difficultyMultiplier}x, TOTAL=${score}`);
		
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
			bestScore: 0,
			points: 0
		});
	}
}

// Export singleton instance
const ScoreManager = new ScoreManagerClass();
export default ScoreManager;
export { ScoreManager };
