/**
 * Unit tests for Difficulty Modifiers (per mode+difficulty)
 * Tests ConfigManager.getModifiers, ScoreManager diagonal bonus,
 * and PieceFactory painter spawn multiplier.
 * @module test-difficulty-modifiers
 */

import { ConfigManager } from '../../src/modules/ConfigManager.js';
import { ScoreManager } from '../../src/modules/ScoreManager.js';
import PieceFactory from '../../src/modules/PieceFactory.js';

const testSuite = {
	name: 'Difficulty Modifiers Tests',
	tests: []
};

// ── ConfigManager.getModifiers ──

testSuite.tests.push({
	name: 'getModifiers - returns defaults for CLASSIC mode',
	async run() {
		await ConfigManager.loadConfig();
		const mods = ConfigManager.getModifiers('CLASSIC', 1);
		if (mods.lockDelay !== 500) throw new Error(`Expected lockDelay 500, got ${mods.lockDelay}`);
		if (mods.diagonalScoreMultiplier !== 1.0) throw new Error(`Expected diag 1.0, got ${mods.diagonalScoreMultiplier}`);
		if (mods.painterSpawnMultiplier !== 1.0) throw new Error(`Expected painter 1.0, got ${mods.painterSpawnMultiplier}`);
	}
});

testSuite.tests.push({
	name: 'getModifiers - difficulty 5 defaults have reduced lockDelay',
	async run() {
		const mods = ConfigManager.getModifiers('CLASSIC', 5);
		if (mods.lockDelay >= 500) throw new Error(`Expected lockDelay < 500 at D5, got ${mods.lockDelay}`);
	}
});

testSuite.tests.push({
	name: 'getModifiers - difficulty 4+ defaults have diagonal multiplier > 1',
	async run() {
		const mods4 = ConfigManager.getModifiers('CLASSIC', 4);
		const mods5 = ConfigManager.getModifiers('CLASSIC', 5);
		if (mods4.diagonalScoreMultiplier <= 1.0) throw new Error(`Expected diag > 1.0 at D4, got ${mods4.diagonalScoreMultiplier}`);
		if (mods5.diagonalScoreMultiplier <= 1.0) throw new Error(`Expected diag > 1.0 at D5, got ${mods5.diagonalScoreMultiplier}`);
	}
});

testSuite.tests.push({
	name: 'getModifiers - ZEN mode overrides lockDelay at D1',
	async run() {
		const zenMods = ConfigManager.getModifiers('ZEN', 1);
		const classicMods = ConfigManager.getModifiers('CLASSIC', 1);
		if (zenMods.lockDelay <= classicMods.lockDelay) {
			throw new Error(`Expected ZEN lockDelay (${zenMods.lockDelay}) > CLASSIC (${classicMods.lockDelay})`);
		}
	}
});

testSuite.tests.push({
	name: 'getModifiers - RISING_TIDE has painter multiplier at D4+',
	async run() {
		const mods = ConfigManager.getModifiers('RISING_TIDE', 4);
		if (mods.painterSpawnMultiplier <= 1.0) {
			throw new Error(`Expected painter multiplier > 1.0 for RISING_TIDE D4, got ${mods.painterSpawnMultiplier}`);
		}
	}
});

testSuite.tests.push({
	name: 'getModifiers - mode overrides merge onto defaults (non-overridden fields preserved)',
	async run() {
		const mods = ConfigManager.getModifiers('ZEN', 1);
		// ZEN D1 overrides lockDelay but not diagonalScoreMultiplier
		if (typeof mods.diagonalScoreMultiplier !== 'number') {
			throw new Error('diagonalScoreMultiplier should be preserved from defaults');
		}
		if (mods.diagonalScoreMultiplier !== 1.0) {
			throw new Error(`Expected diag 1.0 from defaults, got ${mods.diagonalScoreMultiplier}`);
		}
	}
});

testSuite.tests.push({
	name: 'getModifiers - PUZZLE mode has custom diagonal multiplier',
	async run() {
		const mods = ConfigManager.getModifiers('PUZZLE', 4);
		if (mods.diagonalScoreMultiplier <= 1.0) {
			throw new Error(`Expected PUZZLE D4 diagonal multiplier > 1.0, got ${mods.diagonalScoreMultiplier}`);
		}
	}
});

testSuite.tests.push({
	name: 'getModifiers - GAUNTLET D5 has tighter lockDelay than defaults',
	async run() {
		const gMods = ConfigManager.getModifiers('GAUNTLET', 5);
		const dMods = ConfigManager.getModifiers('CLASSIC', 5);
		if (gMods.lockDelay >= dMods.lockDelay) {
			throw new Error(`Expected GAUNTLET D5 lockDelay (${gMods.lockDelay}) < CLASSIC D5 (${dMods.lockDelay})`);
		}
	}
});

// ── ScoreManager diagonal bonus ──

testSuite.tests.push({
	name: 'ScoreManager - diagonal multiplier 1.0 produces no bonus',
	async run() {
		ScoreManager.difficulty = 1;
		ScoreManager.diagonalScoreMultiplier = 1.0;
		// _calculateCascadeScore is private but accessible for testing
		const score = ScoreManager._calculateCascadeScore([5], 1, [3]);
		const scoreNoDiag = ScoreManager._calculateCascadeScore([5], 1, [0]);
		if (score !== scoreNoDiag) {
			throw new Error(`With multiplier 1.0, diagonal should not add bonus: ${score} vs ${scoreNoDiag}`);
		}
	}
});

testSuite.tests.push({
	name: 'ScoreManager - diagonal multiplier > 1 adds bonus for diagonal balls',
	async run() {
		ScoreManager.difficulty = 1;
		ScoreManager.diagonalScoreMultiplier = 1.5;
		const scoreWithDiag = ScoreManager._calculateCascadeScore([5], 1, [3]);
		ScoreManager.diagonalScoreMultiplier = 1.0;
		const scoreNoDiag = ScoreManager._calculateCascadeScore([5], 1, [0]);
		if (scoreWithDiag <= scoreNoDiag) {
			throw new Error(`Diagonal bonus should increase score: ${scoreWithDiag} vs ${scoreNoDiag}`);
		}
		// Reset
		ScoreManager.diagonalScoreMultiplier = 1.0;
	}
});

testSuite.tests.push({
	name: 'ScoreManager - setDiagonalMultiplier sets the value',
	async run() {
		ScoreManager.setDiagonalMultiplier(2.0);
		if (ScoreManager.diagonalScoreMultiplier !== 2.0) {
			throw new Error(`Expected 2.0, got ${ScoreManager.diagonalScoreMultiplier}`);
		}
		ScoreManager.setDiagonalMultiplier(1.0);
	}
});

testSuite.tests.push({
	name: 'ScoreManager - diagonal bonus scales with cascade level',
	async run() {
		ScoreManager.difficulty = 1;
		ScoreManager.diagonalScoreMultiplier = 1.5;
		// 3 diagonal balls at cascade level 1 vs cascade level 2
		const scoreL1 = ScoreManager._calculateCascadeScore([3], 1, [3]);
		const scoreL2 = ScoreManager._calculateCascadeScore([0, 3], 2, [0, 3]);
		// L2 should have higher diagonal bonus (multiplier ×2 vs ×1)
		if (scoreL2 <= scoreL1) {
			throw new Error(`Cascade level 2 diagonal bonus should be higher: L1=${scoreL1}, L2=${scoreL2}`);
		}
		ScoreManager.diagonalScoreMultiplier = 1.0;
	}
});

// ── PieceFactory painter multiplier ──

testSuite.tests.push({
	name: 'PieceFactory - setPainterSpawnMultiplier sets value',
	async run() {
		PieceFactory.setPainterSpawnMultiplier(2.5);
		if (PieceFactory.painterSpawnMultiplier !== 2.5) {
			throw new Error(`Expected 2.5, got ${PieceFactory.painterSpawnMultiplier}`);
		}
		PieceFactory.setPainterSpawnMultiplier(1.0);
	}
});

testSuite.tests.push({
	name: 'PieceFactory - painter multiplier increases bag pool painter count',
	async run() {
		PieceFactory.currentLevel = 20; // Ensure all types unlocked
		PieceFactory.setPainterSpawnMultiplier(1.0);
		const poolNormal = PieceFactory._getSpecialBagPool();
		const painterCountNormal = poolNormal.filter(t => t.startsWith('PAINTER')).length;
		
		PieceFactory.setPainterSpawnMultiplier(2.0);
		const poolBoosted = PieceFactory._getSpecialBagPool();
		const painterCountBoosted = poolBoosted.filter(t => t.startsWith('PAINTER')).length;
		
		if (painterCountBoosted <= painterCountNormal) {
			throw new Error(`Boosted painters (${painterCountBoosted}) should exceed normal (${painterCountNormal})`);
		}
		PieceFactory.setPainterSpawnMultiplier(1.0);
	}
});

testSuite.tests.push({
	name: 'PieceFactory - painter multiplier does not affect exploding count in bag',
	async run() {
		PieceFactory.currentLevel = 20;
		PieceFactory.setPainterSpawnMultiplier(1.0);
		const poolNormal = PieceFactory._getSpecialBagPool();
		const explodingNormal = poolNormal.filter(t => t === 'EXPLODING').length;
		
		PieceFactory.setPainterSpawnMultiplier(3.0);
		const poolBoosted = PieceFactory._getSpecialBagPool();
		const explodingBoosted = poolBoosted.filter(t => t === 'EXPLODING').length;
		
		if (explodingBoosted !== explodingNormal) {
			throw new Error(`Exploding count should be unchanged: ${explodingNormal} vs ${explodingBoosted}`);
		}
		PieceFactory.setPainterSpawnMultiplier(1.0);
	}
});

export default testSuite;
