/**
 * Unit Tests for Constants
 */

import { CONSTANTS, BALL_TYPES, GAME_STATES, EVENTS } from '../../src/utils/Constants.js';

export function runConstantsTests() {
	const results = [];

	function test(name, fn) {
		try {
			fn();
			results.push({ name, pass: true, error: null });
		} catch (error) {
			console.error(`✗ ${name}`);
			console.error(`  Error: ${error.message}`);
			results.push({ name, pass: false, error: error.message });
		}
	}

	function assert(condition, message) {
		if (!condition) throw new Error(message || 'Assertion failed');
	}

	function assertEquals(actual, expected, message) {
		if (actual !== expected) throw new Error(message || `Expected ${expected}, got ${actual}`);
	}

	// ── CONSTANTS object structure ──

	test('CONSTANTS is a non-null object', () => {
		assert(CONSTANTS !== null && typeof CONSTANTS === 'object', 'CONSTANTS should be an object');
	});

	test('CONSTANTS has GRID_ROWS and GRID_COLS', () => {
		assertEquals(CONSTANTS.GRID_ROWS, 25, 'GRID_ROWS should be 25');
		assertEquals(CONSTANTS.GRID_COLS, 15, 'GRID_COLS should be 15');
	});

	// ── BALL_TYPES ──

	test('BALL_TYPES has all expected types', () => {
		const expected = ['NORMAL', 'EXPLODING', 'PAINTER_HORIZONTAL', 'PAINTER_VERTICAL',
			'PAINTER_DIAGONAL_NE', 'PAINTER_DIAGONAL_NW', 'BLOCKING'];
		expected.forEach(t => {
			assert(BALL_TYPES[t] !== undefined, `BALL_TYPES should have ${t}`);
			assertEquals(BALL_TYPES[t], t, `BALL_TYPES.${t} should equal "${t}"`);
		});
	});

	test('BALL_TYPES export matches CONSTANTS.BALL_TYPES', () => {
		assert(BALL_TYPES === CONSTANTS.BALL_TYPES, 'Named export should reference same object');
	});

	test('PAINTER_TYPES contains all painter ball types', () => {
		const expected = ['PAINTER_HORIZONTAL', 'PAINTER_VERTICAL', 'PAINTER_DIAGONAL_NE', 'PAINTER_DIAGONAL_NW'];
		assertEquals(CONSTANTS.PAINTER_TYPES.length, 4, 'Should have 4 painter types');
		expected.forEach(t => {
			assert(CONSTANTS.PAINTER_TYPES.includes(t), `PAINTER_TYPES should include ${t}`);
		});
	});

	// ── DIRECTIONS ──

	test('DIRECTIONS has UP, DOWN, LEFT, RIGHT, NONE', () => {
		const expected = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'NONE'];
		expected.forEach(d => {
			assertEquals(CONSTANTS.DIRECTIONS[d], d, `DIRECTIONS.${d} should equal "${d}"`);
		});
	});

	// ── MATCH_DIRECTIONS ──

	test('MATCH_DIRECTIONS has all match direction types', () => {
		const expected = ['HORIZONTAL', 'VERTICAL', 'DIAGONAL_NE', 'DIAGONAL_SE', 'DIAGONAL_SW', 'DIAGONAL_NW'];
		expected.forEach(md => {
			assert(CONSTANTS.MATCH_DIRECTIONS[md] !== undefined, `MATCH_DIRECTIONS should have ${md}`);
		});
	});

	// ── GAME_STATES ──

	test('GAME_STATES has all expected states', () => {
		const expected = ['MENU', 'PLAYING', 'PAUSED', 'GAME_OVER', 'LEVEL_COMPLETE'];
		expected.forEach(s => {
			assertEquals(CONSTANTS.GAME_STATES[s], s, `GAME_STATES.${s} should equal "${s}"`);
		});
	});

	test('GAME_STATES export matches CONSTANTS.GAME_STATES', () => {
		assert(GAME_STATES === CONSTANTS.GAME_STATES, 'Named export should reference same object');
	});

	// ── GAME_MODES ──

	test('GAME_MODES has CLASSIC, ZEN, GAUNTLET, RISING_TIDE', () => {
		const expected = ['CLASSIC', 'ZEN', 'GAUNTLET', 'RISING_TIDE'];
		expected.forEach(m => {
			assertEquals(CONSTANTS.GAME_MODES[m], m, `GAME_MODES.${m} should equal "${m}"`);
		});
	});

	// ── GAME_MODE_CONFIG ──

	test('GAME_MODE_CONFIG has config for each game mode', () => {
		['CLASSIC', 'ZEN', 'GAUNTLET', 'RISING_TIDE'].forEach(m => {
			const cfg = CONSTANTS.GAME_MODE_CONFIG[m];
			assert(cfg !== undefined, `Should have config for ${m}`);
			assert(typeof cfg.name === 'string', `${m} config should have string name`);
			assert(typeof cfg.description === 'string', `${m} config should have string description`);
			assert(typeof cfg.timed === 'boolean', `${m} config should have boolean timed`);
			assert(typeof cfg.preFillRows === 'number', `${m} config should have number preFillRows`);
			assert(typeof cfg.risingBlocks === 'boolean', `${m} config should have boolean risingBlocks`);
		});
	});

	test('CLASSIC mode is timed with no pre-fill', () => {
		const cfg = CONSTANTS.GAME_MODE_CONFIG.CLASSIC;
		assertEquals(cfg.timed, true, 'CLASSIC should be timed');
		assertEquals(cfg.preFillRows, 0, 'CLASSIC should have 0 pre-fill rows');
		assertEquals(cfg.risingBlocks, false, 'CLASSIC should not have rising blocks');
	});

	test('ZEN mode is untimed with no pre-fill', () => {
		const cfg = CONSTANTS.GAME_MODE_CONFIG.ZEN;
		assertEquals(cfg.timed, false, 'ZEN should not be timed');
		assertEquals(cfg.preFillRows, 0, 'ZEN should have 0 pre-fill rows');
		assertEquals(cfg.risingBlocks, false, 'ZEN should not have rising blocks');
	});

	test('GAUNTLET mode is timed with pre-filled rows', () => {
		const cfg = CONSTANTS.GAME_MODE_CONFIG.GAUNTLET;
		assertEquals(cfg.timed, true, 'GAUNTLET should be timed');
		assert(cfg.preFillRows > 0, 'GAUNTLET should have pre-fill rows');
		assertEquals(cfg.risingBlocks, true, 'GAUNTLET should have rising blocks');
		assert(typeof cfg.risingInterval === 'number', 'GAUNTLET should have risingInterval');
	});

	test('RISING_TIDE mode is timed with rising blocks', () => {
		const cfg = CONSTANTS.GAME_MODE_CONFIG.RISING_TIDE;
		assertEquals(cfg.timed, true, 'RISING_TIDE should be timed');
		assertEquals(cfg.preFillRows, 0, 'RISING_TIDE should have 0 pre-fill rows');
		assertEquals(cfg.risingBlocks, true, 'RISING_TIDE should have rising blocks');
		assertEquals(cfg.risingInterval, 9000, 'RISING_TIDE risingInterval should be 9000ms');
	});

	// ── PIECE_TYPES ──

	test('PIECE_TYPES has all tetromino shapes plus SINGLE', () => {
		const expected = ['I', 'O', 'T', 'L', 'J', 'S', 'Z', 'SINGLE'];
		expected.forEach(p => {
			assertEquals(CONSTANTS.PIECE_TYPES[p], p, `PIECE_TYPES.${p} should equal "${p}"`);
		});
	});

	// ── EVENTS ──

	test('EVENTS has all expected event names', () => {
		const expected = [
			'GAME_START', 'GAME_PAUSE', 'GAME_RESUME', 'GAME_OVER',
			'LEVEL_COMPLETE', 'PIECE_SPAWN', 'PIECE_LOCK', 'MATCH_FOUND',
			'CASCADE', 'CASCADE_COMPLETE', 'BALLS_CLEARED', 'SCORE_UPDATE',
			'MOVE_LEFT', 'MOVE_RIGHT', 'ROTATE', 'SOFT_DROP',
			'SOFT_DROP_END', 'HARD_DROP', 'PAUSE', 'RESTART'
		];
		expected.forEach(e => {
			assert(CONSTANTS.EVENTS[e] !== undefined, `EVENTS should have ${e}`);
			assert(typeof CONSTANTS.EVENTS[e] === 'string', `EVENTS.${e} should be a string`);
		});
	});

	test('EVENTS export matches CONSTANTS.EVENTS', () => {
		assert(EVENTS === CONSTANTS.EVENTS, 'Named export should reference same object');
	});

	test('EVENTS values are unique', () => {
		const values = Object.values(CONSTANTS.EVENTS);
		const unique = new Set(values);
		assertEquals(unique.size, values.length, 'All event values should be unique');
	});

	// ── Numeric constants ──

	test('MIN_MATCH_LENGTH is 3', () => {
		assertEquals(CONSTANTS.MIN_MATCH_LENGTH, 3, 'MIN_MATCH_LENGTH should be 3');
	});

	test('MAX_CASCADE_DEPTH is 10', () => {
		assertEquals(CONSTANTS.MAX_CASCADE_DEPTH, 10, 'MAX_CASCADE_DEPTH should be 10');
	});

	test('EXPLOSION_RADIUS is 3', () => {
		assertEquals(CONSTANTS.EXPLOSION_RADIUS, 3, 'EXPLOSION_RADIUS should be 3');
	});

	// ── DIFFICULTY_LEVELS ──

	test('DIFFICULTY_LEVELS has EASY through MASTER as 1-5', () => {
		assertEquals(CONSTANTS.DIFFICULTY_LEVELS.EASY, 1);
		assertEquals(CONSTANTS.DIFFICULTY_LEVELS.MEDIUM, 2);
		assertEquals(CONSTANTS.DIFFICULTY_LEVELS.HARD, 3);
		assertEquals(CONSTANTS.DIFFICULTY_LEVELS.EXPERT, 4);
		assertEquals(CONSTANTS.DIFFICULTY_LEVELS.MASTER, 5);
	});

	// ── STORAGE_KEYS ──

	test('STORAGE_KEYS has expected localStorage key strings', () => {
		assert(typeof CONSTANTS.STORAGE_KEYS.HIGH_SCORES === 'string', 'HIGH_SCORES should be a string');
		assert(typeof CONSTANTS.STORAGE_KEYS.UNLOCKED_LEVELS === 'string', 'UNLOCKED_LEVELS should be a string');
		assert(typeof CONSTANTS.STORAGE_KEYS.SETTINGS === 'string', 'SETTINGS should be a string');
	});

	return results;
}
