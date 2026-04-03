/**
 * MissionManager.js
 *
 * Sequential micro-goal chain for MISSION game mode.
 * Reveals one goal at a time; completing it advances to the next.
 * Score = pointsPerGoal × completed + remainingTime × timeBonusMultiplier.
 *
 * Dependencies: ConfigManager, EventEmitter, Constants
 * Exports: MissionManager singleton
 */

import { ConfigManager } from './ConfigManager.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { CONSTANTS } from '../utils/Constants.js';
import { computeGoalTarget } from '../utils/Helpers.js';
import { SubscriptionSet } from '../utils/SubscriptionSet.js';

class MissionManagerClass {
	constructor() {
		this.active = false;
		this.chain = [];          // Array of { type, label, target, progress, completed }
		this.currentIndex = 0;
		this.goalsCompleted = 0;
		this.difficulty = 1;
		this._subs = new SubscriptionSet();

		this._boundOnBallsCleared = (data) => this._onBallsCleared(data);
		this._boundOnCascadeComplete = (data) => this._onCascadeComplete(data);
		this._boundOnScoreUpdate = (data) => this._onScoreUpdate(data);
	}

	/**
	 * Initialize for a new mission run
	 * @param {Number} difficulty - Current difficulty (1-5)
	 * @param {Number} level - Current level (used to filter impossible goals)
	 * @param {Boolean|null} hasSpecials - Whether special ball types are unlocked.
	 *   Pass true/false when known (e.g. from GameEngine). Omit or pass null to
	 *   fall back to the level-based heuristic (level >= 3).
	 */
	initialize(difficulty, level, hasSpecials = null) {
		this.difficulty = difficulty || 1;
		this.level = level || 1;
		this.currentIndex = 0;
		this.goalsCompleted = 0;
		this.active = true;

		// Remove old listeners
		this._subs.clear();

		// Resolve hasSpecials: use explicit value if provided, otherwise fall back to heuristic
		const specialsAvailable = hasSpecials !== null ? hasSpecials : this.level >= 3;

		// Build chain from config, filtering out impossible goals
		const chainCfg = ConfigManager.get('mission.goalChain', []);
		const basePoints = ConfigManager.get('mission.pointsPerGoal', 50);
		let idx = 0;
		this.chain = [];
		for (const cfg of chainCfg) {
			// Skip useSpecials if no specials unlocked at this level
			if (cfg.type === 'useSpecials' && !specialsAvailable) continue;

			const target = this._computeTarget(cfg);
			const points = Math.ceil(basePoints * Math.pow(1.2, this.chain.length) / 5) * 5;
			// Cascade and streak goals are binary (achieved or not): target=1, required depth/streak stored separately
			this.chain.push({
				id: idx++,
				type: cfg.type,
				label: cfg.label.replace('{n}', target),
				target,
				progress: 0,
				completed: false,
				points
			});
		}

		// Subscribe to events
		this._subs.replace(EventEmitter, {
			[CONSTANTS.EVENTS.BALLS_CLEARED]: this._boundOnBallsCleared,
			[CONSTANTS.EVENTS.CASCADE_COMPLETE]: this._boundOnCascadeComplete,
			[CONSTANTS.EVENTS.SCORE_UPDATE]: this._boundOnScoreUpdate
		});

		this._emitUpdate();
	}

	/**
	 * Tear down listeners
	 */
	reset() {
		this._subs.clear();
		this.active = false;
		this.chain = [];
		this.currentIndex = 0;
		this.goalsCompleted = 0;
	}

	// ── Target Computation ──

	_computeTarget(cfg) {
		return computeGoalTarget(cfg, 1, this.difficulty);
	}

	// ── Current Goal ──

	getCurrentGoal() {
		if (this.currentIndex < this.chain.length) {
			return this.chain[this.currentIndex];
		}
		return null;
	}

	isChainComplete() {
		return this.currentIndex >= this.chain.length;
	}

	getGoalsCompleted() {
		return this.goalsCompleted;
	}

	getTotalGoals() {
		return this.chain.length;
	}

	/**
	 * Calculate final mission score
	 * @param {Number} remainingTime - Seconds remaining on the clock
	 * @returns {Number}
	 */
	calculateScore(remainingTime) {
		const pointsPerGoal = ConfigManager.get('mission.pointsPerGoal', 50);
		const timeMult = ConfigManager.get('mission.timeBonusMultiplier', 2);
		return (this.goalsCompleted * pointsPerGoal) + Math.floor(remainingTime * timeMult);
	}

	// ── Event Handlers ──

	_onBallsCleared(data) {
		if (!this.active) return;
		const goal = this.getCurrentGoal();
		if (!goal || goal.completed) return;

		const balls = data.balls || [];

		if (goal.type === 'clearBalls') {
			goal.progress += data.count || balls.length;
		} else if (goal.type === 'useSpecials') {
			const specialCount = balls.filter(b => b.type !== CONSTANTS.BALL_TYPES.NORMAL).length;
			goal.progress += specialCount;
		}

		this._checkCurrent();
	}

	_onCascadeComplete(data) {
		if (!this.active) return;
		const goal = this.getCurrentGoal();
		if (!goal || goal.completed) return;

		if (goal.type === 'cascade') {
			goal.progress = Math.max(goal.progress, data.cascadeCount ?? 0);
		}

		this._checkCurrent();
	}

	_onScoreUpdate(data) {
		if (!this.active) return;
		const goal = this.getCurrentGoal();
		if (!goal || goal.completed) return;

		if (goal.type === 'streak' && data.matchStreak !== undefined) {
			goal.progress = Math.max(goal.progress, data.matchStreak);
		}

		this._checkCurrent();
	}

	// ── Completion ──

	_checkCurrent() {
		const goal = this.getCurrentGoal();
		if (!goal || goal.completed) return;

		if (goal.progress >= goal.target) {
			goal.completed = true;
			this.goalsCompleted++;
			EventEmitter.emit(CONSTANTS.EVENTS.MISSION_GOAL_COMPLETE, {
				goal: { id: goal.id, label: goal.label, points: goal.points },
				goalsCompleted: this.goalsCompleted,
				totalGoals: this.chain.length,
				chainComplete: this.currentIndex + 1 >= this.chain.length
			});
			this.currentIndex++;
		}

		this._emitUpdate();
	}

	_emitUpdate() {
		const current = this.getCurrentGoal();
		EventEmitter.emit(CONSTANTS.EVENTS.MISSION_GOAL_UPDATE, {
			current: current ? {
				id: current.id,
				type: current.type,
				label: current.label,
				progress: Math.min(current.progress, current.target),
				target: current.target,
				completed: current.completed,
				points: current.points
			} : null,
			goalsCompleted: this.goalsCompleted,
			totalGoals: this.chain.length,
			chainComplete: this.isChainComplete()
		});
	}
}

const MissionManager = new MissionManagerClass();
export default MissionManager;
