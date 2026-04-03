/**
 * ============================================================================
 * GoalManager.js - Orb•Fall: ChromaCrush
 * ============================================================================
 * Copyright (c) 2025 G. Scott Tomlin. All Rights Reserved.
 *
 * Optional per-level goals that award bonus points on completion.
 * Listens to game events (BALLS_CLEARED, CASCADE_COMPLETE) and tracks
 * progress against randomly-selected goals for the current level.
 *
 * Dependencies: ConfigManager, EventEmitter, Constants
 * Exports: GoalManager singleton
 * ============================================================================
 */

import { ConfigManager } from './ConfigManager.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { CONSTANTS } from '../utils/Constants.js';
import { shuffleArray, computeGoalTarget } from '../utils/Helpers.js';
import { SubscriptionSet } from '../utils/SubscriptionSet.js';

/**
 * Goal manager class — picks goals for each level and tracks progress
 */
class GoalManagerClass {

	constructor() {
		this.goals = [];          // Array of { id, type, label, target, progress, completed }
		this.difficulty = 1;
		this.level = 1;
		this.enabled = false;
		this.allCompleted = false;
		this._subs = new SubscriptionSet();

		// Bound handlers for cleanup
		this._boundOnBallsCleared = (data) => this._onBallsCleared(data);
		this._boundOnCascadeComplete = (data) => this._onCascadeComplete(data);
	}

	/**
	 * Initialize goals for a new level
	 * @param {number} difficulty - Current difficulty (1-5)
	 * @param {number} level - Current level number
	 */
	initialize(difficulty, level, availableSpecials = null) {
		this.difficulty = difficulty || 1;
		this.level = level || 1;
		this._availableSpecials = availableSpecials;
		this.goals = [];
		this.allCompleted = false;

		this.enabled = ConfigManager.get('goals.enabled', true);
		if (!this.enabled) return;

		// Pick goals
		this._selectGoals();

		// Subscribe to events
		this._subs.replace(EventEmitter, {
			[CONSTANTS.EVENTS.BALLS_CLEARED]: this._boundOnBallsCleared,
			[CONSTANTS.EVENTS.CASCADE_COMPLETE]: this._boundOnCascadeComplete
		});

		// Emit initial state
		this._emitUpdate();
	}

	/**
	 * Reset / tear down (called on game over, menu return, etc.)
	 */
	reset() {
		this._subs.clear();
		this.goals = [];
		this.allCompleted = false;
	}

	// ── Goal Selection ──

	/**
	 * Select random goals for this level based on config
	 * @private
	 */
	_selectGoals() {
		const goalsPerLevel = ConfigManager.get('goals.goalsPerLevel', 2);
		const types = ConfigManager.get('goals.types', {});
		let typeKeys = Object.keys(types);

		// Exclude useSpecials when no special orbs are unlocked at this level
		if (Array.isArray(this._availableSpecials) && this._availableSpecials.length === 0) {
			typeKeys = typeKeys.filter(k => k !== 'useSpecials');
		}

		if (typeKeys.length === 0) return;

		// Shuffle and pick N distinct goal types
		const shuffled = shuffleArray([...typeKeys]);
		const picked = shuffled.slice(0, Math.min(goalsPerLevel, shuffled.length));

		picked.forEach((key, index) => {
			const cfg = types[key];
			const target = computeGoalTarget(cfg, this.level, this.difficulty);
			const label = cfg.label.replace('{n}', target);

			this.goals.push({
				id: index,
				type: key,
				label,
				target,
				progress: 0,
				completed: false
			});
		});
	}

	// ── Event Handlers ──

	/**
	 * Handle balls cleared event — advances clearBalls and useSpecials goals
	 * @param {Object} data - { count, balls: [{type, color}] }
	 * @private
	 */
	_onBallsCleared(data) {
		if (!this.enabled || this.allCompleted) return;

		const balls = data.balls || [];

		this.goals.forEach(goal => {
			if (goal.completed) return;

			if (goal.type === 'clearBalls') {
				goal.progress += data.count || balls.length;
			} else if (goal.type === 'useSpecials') {
				const specialCount = balls.filter(b => b.type !== CONSTANTS.BALL_TYPES.NORMAL).length;
				goal.progress += specialCount;
			}
		});

		this._checkCompletion();
		this._emitUpdate();
	}

	/**
	 * Handle cascade complete — advances cascade goal (tracks max cascade depth)
	 * @param {Object} data - { cascadeCount }
	 * @private
	 */
	_onCascadeComplete(data) {
		if (!this.enabled || this.allCompleted) return;

		this.goals.forEach(goal => {
			if (goal.completed) return;

			if (goal.type === 'cascade') {
				// Track best cascade this level — goal met if any cascade reaches target
				if (data.cascadeCount > goal.progress) {
					goal.progress = data.cascadeCount;
				}
			}
		});

		this._checkCompletion();
		this._emitUpdate();
	}

	// ── Completion ──

	/**
	 * Check if any goals were just completed
	 * @private
	 */
	_checkCompletion() {
		let newlyCompleted = false;
		this.goals.forEach(goal => {
			goal.justCompleted = false;
			if (!goal.completed && goal.progress >= goal.target) {
				goal.completed = true;
				goal.justCompleted = true;
				newlyCompleted = true;
			}
		});

		this.allCompleted = this.goals.length > 0 && this.goals.every(g => g.completed);
		return newlyCompleted;
	}

	/**
	 * Get the bonus points earned from completed goals
	 * @returns {number}
	 */
	getCompletedBonus() {
		const bonusPerGoal = ConfigManager.get('goals.bonusPoints', 25);
		return this.goals.filter(g => g.completed).length * bonusPerGoal;
	}

	/**
	 * Get current goals array (for HUD display)
	 * @returns {Array<{id, type, label, target, progress, completed}>}
	 */
	getGoals() {
		return this.goals;
	}

	// ── Event Emission ──

	/**
	 * Emit GOAL_UPDATE event with current goal state
	 * @private
	 */
	_emitUpdate() {
		EventEmitter.emit(CONSTANTS.EVENTS.GOAL_UPDATE, {
			goals: this.goals.map(g => ({
				id: g.id,
				type: g.type,
				label: g.label,
				progress: Math.min(g.progress, g.target),
				target: g.target,
				completed: g.completed,
				justCompleted: g.justCompleted || false
			})),
			allCompleted: this.allCompleted
		});
	}
}

const GoalManager = new GoalManagerClass();
export default GoalManager;
export { GoalManager };
