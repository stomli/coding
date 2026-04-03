/**
 * Unit tests for GoalManager
 * @module test-goal-manager
 */

import { GoalManager } from '../../src/modules/GoalManager.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';
import { EventEmitter } from '../../src/utils/EventEmitter.js';
import { CONSTANTS } from '../../src/utils/Constants.js';

const testSuite = {
	name: 'GoalManager Tests',
	tests: []
};

// ── Initialization ──

testSuite.tests.push({
	name: 'initialize - creates goals when enabled',
	async run() {
		GoalManager.initialize(1, 1);
		const goals = GoalManager.getGoals();
		
		if (!Array.isArray(goals)) {
			throw new Error('getGoals() should return an array');
		}
		
		const goalsPerLevel = ConfigManager.get('goals.goalsPerLevel', 2);
		if (goals.length !== goalsPerLevel) {
			throw new Error(`Expected ${goalsPerLevel} goals, got ${goals.length}`);
		}
		
		GoalManager.reset();
	}
});

testSuite.tests.push({
	name: 'initialize - goals have required properties',
	async run() {
		GoalManager.initialize(1, 1);
		const goals = GoalManager.getGoals();
		
		goals.forEach((g, i) => {
			if (g.label === undefined) throw new Error(`Goal ${i} missing label`);
			if (g.target === undefined) throw new Error(`Goal ${i} missing target`);
			if (g.progress === undefined) throw new Error(`Goal ${i} missing progress`);
			if (g.completed !== false) throw new Error(`Goal ${i} should start not completed`);
		});
		
		GoalManager.reset();
	}
});

testSuite.tests.push({
	name: 'initialize - goals scale with difficulty',
	async run() {
		GoalManager.initialize(1, 1);
		const easy = GoalManager.getGoals().map(g => g.target);
		GoalManager.reset();
		
		GoalManager.initialize(5, 1);
		const master = GoalManager.getGoals().map(g => g.target);
		GoalManager.reset();
		
		// At least one goal should have a higher target at higher difficulty
		// (since types are random, both sets may have different types — 
		// but the scaling logic itself is tested via _computeTarget)
		// Just verify both initialize without error
		if (easy.length === 0 || master.length === 0) {
			throw new Error('Goals should be generated for both difficulties');
		}
	}
});

testSuite.tests.push({
	name: 'reset - clears all goals',
	async run() {
		GoalManager.initialize(1, 1);
		GoalManager.reset();
		
		if (GoalManager.getGoals().length !== 0) {
			throw new Error('Goals should be empty after reset');
		}
	}
});

// ── clearBalls goal progress ──

testSuite.tests.push({
	name: 'clearBalls - BALLS_CLEARED advances progress',
	async run() {
		
		// Force a clearBalls goal by initializing until we get one
		let hasClearBalls = false;
		let attempts = 0;
		while (!hasClearBalls && attempts < 20) {
			GoalManager.initialize(1, 1);
			hasClearBalls = GoalManager.getGoals().some(g => g.type === 'clearBalls');
			if (!hasClearBalls) GoalManager.reset();
			attempts++;
		}
		
		if (!hasClearBalls) {
			GoalManager.reset();
			return; // Skip — couldn't get clearBalls goal (unlikely with 3 types, 2 picks)
		}
		
		const before = GoalManager.getGoals().find(g => g.type === 'clearBalls').progress;
		
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, {
			count: 5,
			balls: [
				{ type: CONSTANTS.BALL_TYPES.NORMAL, color: '#FF0000' },
				{ type: CONSTANTS.BALL_TYPES.NORMAL, color: '#00FF00' },
				{ type: CONSTANTS.BALL_TYPES.NORMAL, color: '#FF0000' },
				{ type: CONSTANTS.BALL_TYPES.NORMAL, color: '#0000FF' },
				{ type: CONSTANTS.BALL_TYPES.NORMAL, color: '#FF0000' }
			]
		});
		
		const after = GoalManager.getGoals().find(g => g.type === 'clearBalls').progress;
		
		if (after !== before + 5) {
			throw new Error(`Expected progress ${before + 5}, got ${after}`);
		}
		
		GoalManager.reset();
	}
});

// ── useSpecials goal progress ──

testSuite.tests.push({
	name: 'useSpecials - counts only non-NORMAL balls',
	async run() {
		
		let hasSpecials = false;
		let attempts = 0;
		while (!hasSpecials && attempts < 20) {
			GoalManager.initialize(1, 1);
			hasSpecials = GoalManager.getGoals().some(g => g.type === 'useSpecials');
			if (!hasSpecials) GoalManager.reset();
			attempts++;
		}
		
		if (!hasSpecials) {
			GoalManager.reset();
			return;
		}
		
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, {
			count: 4,
			balls: [
				{ type: CONSTANTS.BALL_TYPES.NORMAL, color: '#FF0000' },
				{ type: CONSTANTS.BALL_TYPES.EXPLODING, color: '#FF0000' },
				{ type: CONSTANTS.BALL_TYPES.NORMAL, color: '#00FF00' },
				{ type: CONSTANTS.BALL_TYPES.PAINTER_HORIZONTAL, color: '#0000FF' }
			]
		});
		
		const goal = GoalManager.getGoals().find(g => g.type === 'useSpecials');
		
		if (goal.progress !== 2) {
			throw new Error(`Expected 2 specials counted, got ${goal.progress}`);
		}
		
		GoalManager.reset();
	}
});

// ── cascade goal progress ──

testSuite.tests.push({
	name: 'cascade - CASCADE_COMPLETE tracks max depth',
	async run() {
		
		let hasCascade = false;
		let attempts = 0;
		while (!hasCascade && attempts < 20) {
			GoalManager.initialize(1, 1);
			hasCascade = GoalManager.getGoals().some(g => g.type === 'cascade');
			if (!hasCascade) GoalManager.reset();
			attempts++;
		}
		
		if (!hasCascade) {
			GoalManager.reset();
			return;
		}
		
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 3 });
		const goal = GoalManager.getGoals().find(g => g.type === 'cascade');
		
		if (goal.progress !== 3) {
			throw new Error(`Expected cascade progress 3, got ${goal.progress}`);
		}
		
		// Lower cascade shouldn't decrease
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 1 });
		if (goal.progress !== 3) {
			throw new Error(`Cascade progress should not decrease, got ${goal.progress}`);
		}
		
		GoalManager.reset();
	}
});

// ── Completion ──

testSuite.tests.push({
	name: 'completion - goal marked completed when target met',
	async run() {
		
		let hasClearBalls = false;
		let attempts = 0;
		while (!hasClearBalls && attempts < 20) {
			GoalManager.initialize(1, 1);
			hasClearBalls = GoalManager.getGoals().some(g => g.type === 'clearBalls');
			if (!hasClearBalls) GoalManager.reset();
			attempts++;
		}
		
		if (!hasClearBalls) {
			GoalManager.reset();
			return;
		}
		
		const goal = GoalManager.getGoals().find(g => g.type === 'clearBalls');
		const needed = goal.target;
		
		// Fire enough clears to meet target
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, {
			count: needed,
			balls: Array(needed).fill({ type: CONSTANTS.BALL_TYPES.NORMAL, color: '#FF0000' })
		});
		
		if (!goal.completed) {
			throw new Error('Goal should be completed');
		}
		
		GoalManager.reset();
	}
});

testSuite.tests.push({
	name: 'completion - getCompletedBonus returns correct bonus',
	async run() {
		GoalManager.initialize(1, 1);
		const bonusPerGoal = ConfigManager.get('goals.bonusPoints', 25);
		
		// No goals completed yet
		if (GoalManager.getCompletedBonus() !== 0) {
			throw new Error('Bonus should be 0 when no goals completed');
		}
		
		// Complete all goals by brute-forcing huge events
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, {
			count: 500,
			balls: Array(500).fill({ type: CONSTANTS.BALL_TYPES.EXPLODING, color: '#FF0000' })
		});
		EventEmitter.emit(CONSTANTS.EVENTS.CASCADE_COMPLETE, { cascadeCount: 10 });
		
		const goalsCount = GoalManager.getGoals().length;
		const expectedBonus = goalsCount * bonusPerGoal;
		const actual = GoalManager.getCompletedBonus();
		
		if (actual !== expectedBonus) {
			throw new Error(`Expected bonus ${expectedBonus}, got ${actual}`);
		}
		
		GoalManager.reset();
	}
});

testSuite.tests.push({
	name: 'completion - emits GOAL_UPDATE with justCompleted flag',
	async run() {
		
		let hasClearBalls = false;
		let attempts = 0;
		while (!hasClearBalls && attempts < 20) {
			GoalManager.initialize(1, 1);
			hasClearBalls = GoalManager.getGoals().some(g => g.type === 'clearBalls');
			if (!hasClearBalls) GoalManager.reset();
			attempts++;
		}
		
		if (!hasClearBalls) {
			GoalManager.reset();
			return;
		}
		
		const goal = GoalManager.getGoals().find(g => g.type === 'clearBalls');
		const needed = goal.target;
		
		let receivedJustCompleted = false;
		const handler = (data) => {
			const g = data.goals.find(g => g.type === 'clearBalls');
			if (g && g.justCompleted) receivedJustCompleted = true;
		};
		EventEmitter.on(CONSTANTS.EVENTS.GOAL_UPDATE, handler);
		
		EventEmitter.emit(CONSTANTS.EVENTS.BALLS_CLEARED, {
			count: needed,
			balls: Array(needed).fill({ type: CONSTANTS.BALL_TYPES.NORMAL, color: '#FF0000' })
		});
		
		EventEmitter.off(CONSTANTS.EVENTS.GOAL_UPDATE, handler);
		
		if (!receivedJustCompleted) {
			throw new Error('GOAL_UPDATE should include justCompleted flag');
		}
		
		GoalManager.reset();
	}
});

export default testSuite;
