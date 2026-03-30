/**
 * Unit tests for PuzzleManager
 * @module test-puzzle-manager
 */

import PuzzleManager from '../../src/modules/PuzzleManager.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';
import { EventEmitter } from '../../src/utils/EventEmitter.js';
import { CONSTANTS } from '../../src/utils/Constants.js';

const testSuite = {
	name: 'PuzzleManager Tests',
	tests: []
};

// ── Seed Computation ──

testSuite.tests.push({
	name: 'getSeed - deterministic for same level+difficulty',
	async run() {
		const a = PuzzleManager.getSeed(5, 3);
		const b = PuzzleManager.getSeed(5, 3);
		if (a !== b) throw new Error('Same inputs should yield same seed');
	}
});

testSuite.tests.push({
	name: 'getSeed - different for different level or difficulty',
	async run() {
		const a = PuzzleManager.getSeed(5, 3);
		const b = PuzzleManager.getSeed(6, 3);
		const c = PuzzleManager.getSeed(5, 4);
		if (a === b) throw new Error('Different levels should yield different seeds');
		if (a === c) throw new Error('Different difficulties should yield different seeds');
	}
});

// ── Initialization ──

testSuite.tests.push({
	name: 'initialize - sets active state and piece limit',
	async run() {
		await ConfigManager.loadConfig();
		PuzzleManager.initialize(1, 1);
		if (!PuzzleManager.active) throw new Error('Should be active');
		if (PuzzleManager.getPiecesUsed() !== 0) throw new Error('Pieces used should be 0');
		if (PuzzleManager.getPieceLimit() <= 0) throw new Error('Piece limit should be positive');
		PuzzleManager.reset();
	}
});

testSuite.tests.push({
	name: 'initialize - resets on re-init',
	async run() {
		await ConfigManager.loadConfig();
		PuzzleManager.initialize(1, 1);
		PuzzleManager.recordPiece();
		PuzzleManager.recordPiece();
		PuzzleManager.initialize(1, 1);
		if (PuzzleManager.getPiecesUsed() !== 0) throw new Error('Should reset piecesUsed');
		PuzzleManager.reset();
	}
});

// ── Piece Recording ──

testSuite.tests.push({
	name: 'recordPiece - increments and returns true while under limit',
	async run() {
		await ConfigManager.loadConfig();
		PuzzleManager.initialize(1, 1);
		const result = PuzzleManager.recordPiece();
		if (PuzzleManager.getPiecesUsed() !== 1) throw new Error('Should be 1');
		if (result !== true) throw new Error('Should return true (pieces remain)');
		PuzzleManager.reset();
	}
});

testSuite.tests.push({
	name: 'recordPiece - returns false when limit reached',
	async run() {
		await ConfigManager.loadConfig();
		PuzzleManager.initialize(1, 1);
		const limit = PuzzleManager.getPieceLimit();
		// Fast-forward to just before limit
		PuzzleManager.piecesUsed = limit - 1;
		const result = PuzzleManager.recordPiece();
		if (result !== false) throw new Error('Should return false at limit');
		if (PuzzleManager.getPiecesRemaining() !== 0) throw new Error('Remaining should be 0');
		PuzzleManager.reset();
	}
});

testSuite.tests.push({
	name: 'getPiecesRemaining - tracks correctly',
	async run() {
		await ConfigManager.loadConfig();
		PuzzleManager.initialize(1, 1);
		const limit = PuzzleManager.getPieceLimit();
		PuzzleManager.recordPiece();
		PuzzleManager.recordPiece();
		PuzzleManager.recordPiece();
		if (PuzzleManager.getPiecesRemaining() !== limit - 3) {
			throw new Error(`Expected ${limit - 3}, got ${PuzzleManager.getPiecesRemaining()}`);
		}
		PuzzleManager.reset();
	}
});

// ── Star Thresholds ──

testSuite.tests.push({
	name: 'getStarThresholds - returns bronze < silver < gold',
	async run() {
		await ConfigManager.loadConfig();
		const t = PuzzleManager.getStarThresholds(5, 3);
		if (t.bronze >= t.silver) throw new Error(`Bronze (${t.bronze}) should be < Silver (${t.silver})`);
		if (t.silver >= t.gold) throw new Error(`Silver (${t.silver}) should be < Gold (${t.gold})`);
	}
});

testSuite.tests.push({
	name: 'getStarThresholds - scales with level',
	async run() {
		await ConfigManager.loadConfig();
		const low = PuzzleManager.getStarThresholds(1, 1);
		const high = PuzzleManager.getStarThresholds(10, 1);
		if (high.gold <= low.gold) throw new Error('Higher level should have higher gold threshold');
	}
});

testSuite.tests.push({
	name: 'getStarThresholds - scales with difficulty',
	async run() {
		await ConfigManager.loadConfig();
		const easy = PuzzleManager.getStarThresholds(5, 1);
		const hard = PuzzleManager.getStarThresholds(5, 5);
		if (hard.gold <= easy.gold) throw new Error('Higher difficulty should have higher gold threshold');
	}
});

// ── getStars ──

testSuite.tests.push({
	name: 'getStars - returns 0 for score below bronze',
	async run() {
		await ConfigManager.loadConfig();
		if (PuzzleManager.getStars(0, 1, 1) !== 0) throw new Error('0 score should be 0 stars');
	}
});

testSuite.tests.push({
	name: 'getStars - returns 1-3 at threshold boundaries',
	async run() {
		await ConfigManager.loadConfig();
		const t = PuzzleManager.getStarThresholds(1, 1);
		if (PuzzleManager.getStars(t.bronze, 1, 1) !== 1) throw new Error('Bronze score should be 1 star');
		if (PuzzleManager.getStars(t.silver, 1, 1) !== 2) throw new Error('Silver score should be 2 stars');
		if (PuzzleManager.getStars(t.gold, 1, 1) !== 3) throw new Error('Gold score should be 3 stars');
	}
});

testSuite.tests.push({
	name: 'getStars - returns 3 for score above gold',
	async run() {
		await ConfigManager.loadConfig();
		const t = PuzzleManager.getStarThresholds(1, 1);
		if (PuzzleManager.getStars(t.gold + 1000, 1, 1) !== 3) throw new Error('Above gold should be 3 stars');
	}
});

// ── PUZZLE_PIECES_UPDATE event ──

testSuite.tests.push({
	name: 'emits PUZZLE_PIECES_UPDATE on initialize and recordPiece',
	async run() {
		await ConfigManager.loadConfig();
		let count = 0;
		const handler = () => { count++; };
		EventEmitter.on(CONSTANTS.EVENTS.PUZZLE_PIECES_UPDATE, handler);
		try {
			PuzzleManager.initialize(1, 1);
			if (count !== 1) throw new Error('Should emit on initialize');
			PuzzleManager.recordPiece();
			if (count !== 2) throw new Error('Should emit on recordPiece');
		} finally {
			EventEmitter.off(CONSTANTS.EVENTS.PUZZLE_PIECES_UPDATE, handler);
			PuzzleManager.reset();
		}
	}
});

// ── Reset ──

testSuite.tests.push({
	name: 'reset - clears state',
	async run() {
		await ConfigManager.loadConfig();
		PuzzleManager.initialize(1, 1);
		PuzzleManager.recordPiece();
		PuzzleManager.reset();
		if (PuzzleManager.active) throw new Error('Should not be active');
		if (PuzzleManager.getPiecesUsed() !== 0) throw new Error('Pieces should be 0');
	}
});

export default testSuite;
