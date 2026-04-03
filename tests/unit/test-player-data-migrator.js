/**
 * Unit tests for PlayerDataMigrator
 * @module test-player-data-migrator
 */

import { migratePlayerData } from '../../src/modules/PlayerDataMigrator.js';
import { assert, assertEquals } from '../utils/assert.js';

export function runPlayerDataMigratorTests() {
	const results = [];

	function test(name, fn) {
		try {
			fn();
			results.push({ name, pass: true, error: null });
		} catch (error) {
			results.push({ name, pass: false, error: error.message });
		}
	}

	// Helper: build a minimal player object with levelProgress
	function makePlayer(levelProgress = {}) {
		return { name: 'Test', createdAt: '2025-01-01', levelProgress };
	}

	// ── no-op cases ──

	test('migratePlayerData - returns false when nothing to migrate', () => {
		const players = {
			'Guest': makePlayer({
				unlockedLevelsByMode: { CLASSIC: { '1': [1] } },
				completedLevels: ['CLASSIC-1-1'],
				levelScores: {},
				unlockedLevelsByDifficulty: { '1': [1] }
			})
		};
		const changed = migratePlayerData(players);
		assert(!changed, 'should return false when already up-to-date');
	});

	test('migratePlayerData - skips players with no levelProgress', () => {
		const players = { 'Guest': { name: 'Guest' } };
		const changed = migratePlayerData(players);
		assert(!changed, 'should return false for player with no levelProgress');
	});

	test('migratePlayerData - returns false for empty players object', () => {
		const changed = migratePlayerData({});
		assert(!changed, 'should return false for empty players map');
	});

	// ── unlockedLevels array → unlockedLevelsByDifficulty ──

	test('migrate unlockedLevels array - converts to unlockedLevelsByDifficulty', () => {
		const players = {
			'P1': makePlayer({ unlockedLevels: [1, 2, 3] })
		};
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		assert(!Array.isArray(p.unlockedLevels), 'old unlockedLevels array should be removed');
		assert(typeof p.unlockedLevelsByDifficulty === 'object', 'should create unlockedLevelsByDifficulty');
		assertEquals(JSON.stringify(p.unlockedLevelsByDifficulty['1']), JSON.stringify([1, 2, 3]), 'should migrate to difficulty 1');
	});

	test('migrate unlockedLevels array - sets other difficulties to [1]', () => {
		const players = { 'P1': makePlayer({ unlockedLevels: [1, 2] }) };
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		assertEquals(JSON.stringify(p.unlockedLevelsByDifficulty['2']), JSON.stringify([1]));
		assertEquals(JSON.stringify(p.unlockedLevelsByDifficulty['5']), JSON.stringify([1]));
	});

	test('migrate unlockedLevels array - returns true', () => {
		const players = { 'P1': makePlayer({ unlockedLevels: [1] }) };
		const changed = migratePlayerData(players);
		assert(changed, 'should return true when migration occurred');
	});

	// ── missing unlockedLevelsByDifficulty ──

	test('migrate missing unlockedLevelsByDifficulty - creates default structure', () => {
		const players = { 'P1': makePlayer({}) };
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		assert(typeof p.unlockedLevelsByDifficulty === 'object', 'should create it');
		assertEquals(JSON.stringify(p.unlockedLevelsByDifficulty['1']), JSON.stringify([1]));
	});

	// ── completedLevels number → "1-level" string ──

	test('migrate numeric completedLevels - converts to CLASSIC-prefixed keys', () => {
		const players = {
			'P1': makePlayer({
				completedLevels: [1, 2, 3],
				levelScores: {}
			})
		};
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		// Numeric → '1-level' → 'CLASSIC-1-level' (mode migration runs in same pass)
		assert(p.completedLevels.includes('CLASSIC-1-1'), 'should have "CLASSIC-1-1"');
		assert(p.completedLevels.includes('CLASSIC-1-2'), 'should have "CLASSIC-1-2"');
		assert(p.completedLevels.includes('CLASSIC-1-3'), 'should have "CLASSIC-1-3"');
		assert(!p.completedLevels.some(k => typeof k === 'number'), 'no numeric keys should remain');
	});

	test('migrate numeric completedLevels - migrates matching level scores', () => {
		const players = {
			'P1': makePlayer({
				completedLevels: [2],
				levelScores: { 2: 500 }
			})
		};
		migratePlayerData(players);
		const p = players['P1'].levelProgress;		// numeric 2 → '1-2' → 'CLASSIC-1-2'		assertEquals(p.levelScores['1-2'], 500, 'score should be migrated to "1-2"');
	});

	test('migrate numeric completedLevels - keeps existing string keys', () => {
		const players = {
			'P1': makePlayer({
				completedLevels: [1, '1-2'],
				levelScores: {}
			})
		};
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		// Both end up as CLASSIC-prefixed after mode migration
		assert(p.completedLevels.includes('CLASSIC-1-1'), 'numeric 1 migrated to CLASSIC-1-1');
		assert(p.completedLevels.includes('CLASSIC-1-2'), 'existing "1-2" promoted to CLASSIC-1-2');
	});

	// ── fill in lower levels for legacy 2-part keys ──

	test('fill legacy levels - marks all lower levels when higher completed', () => {
		const players = {
			'P1': makePlayer({
				completedLevels: ['1-5'],
				levelScores: {}
			})
		};
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		// Fill adds '1-1'..'1-4', then mode migration promotes all to CLASSIC-1-N
		for (let i = 1; i <= 5; i++) {
			assert(p.completedLevels.includes(`CLASSIC-1-${i}`), `should include CLASSIC-1-${i}`);
		}
	});

	test('fill legacy levels - does not affect modern 3-part keys', () => {
		const players = {
			'P1': makePlayer({
				completedLevels: ['CLASSIC-1-5'],
				levelScores: {}
			})
		};
		const before = ['CLASSIC-1-5'];
		// No 2-part keys present, so fill logic should add nothing new
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		assert(!p.completedLevels.includes('1-1'), '3-part keys must not trigger legacy fill');
	});

	// ── mode migration (2-part → 3-part) ──

	test('mode migration - converts "difficulty-level" to "CLASSIC-difficulty-level"', () => {
		const players = {
			'P1': makePlayer({
				completedLevels: ['1-1', '1-2'],
				levelScores: { '1-1': 100, '1-2': 200 },
				unlockedLevelsByDifficulty: { '1': [1, 2] }
			})
		};
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		assert(p.completedLevels.includes('CLASSIC-1-1'), 'should have CLASSIC-1-1');
		assert(p.completedLevels.includes('CLASSIC-1-2'), 'should have CLASSIC-1-2');
		assert(!p.completedLevels.some(k => k.split('-').length === 2), 'no legacy 2-part keys should remain');
	});

	test('mode migration - migrates levelScores to CLASSIC prefix', () => {
		const players = {
			'P1': makePlayer({
				completedLevels: ['1-1'],
				levelScores: { '1-1': 999 },
				unlockedLevelsByDifficulty: { '1': [1] }
			})
		};
		migratePlayerData(players);
		assertEquals(players['P1'].levelProgress.levelScores['CLASSIC-1-1'], 999, 'score should be under CLASSIC- key');
	});

	test('mode migration - keeps already-migrated 3-part keys intact', () => {
		const players = {
			'P1': makePlayer({
				completedLevels: ['CLASSIC-1-1', 'ZEN-2-3'],
				levelScores: { 'CLASSIC-1-1': 500, 'ZEN-2-3': 750 },
				unlockedLevelsByMode: { CLASSIC: { '1': [1] } },
				unlockedLevelsByDifficulty: { '1': [1] }
			})
		};
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		assert(p.completedLevels.includes('CLASSIC-1-1'), 'CLASSIC key preserved');
		assert(p.completedLevels.includes('ZEN-2-3'), 'ZEN key preserved');
		assertEquals(p.levelScores['CLASSIC-1-1'], 500);
		assertEquals(p.levelScores['ZEN-2-3'], 750);
	});

	test('mode migration - creates unlockedLevelsByMode when missing', () => {
		const players = {
			'P1': makePlayer({
				completedLevels: ['1-1'],
				levelScores: {},
				unlockedLevelsByDifficulty: { '1': [1, 2] }
			})
		};
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		assert(typeof p.unlockedLevelsByMode === 'object', 'should create unlockedLevelsByMode');
		assert(Array.isArray(p.unlockedLevelsByMode.CLASSIC['1']), 'CLASSIC difficulty 1 should be an array');
	});

	test('mode migration - copies unlockedLevelsByDifficulty into CLASSIC mode', () => {
		const players = {
			'P1': makePlayer({
				completedLevels: ['1-1'],
				levelScores: {},
				unlockedLevelsByDifficulty: { '1': [1, 2, 3], '2': [1, 2] }
			})
		};
		migratePlayerData(players);
		const p = players['P1'].levelProgress;
		assertEquals(JSON.stringify(p.unlockedLevelsByMode.CLASSIC['1']), JSON.stringify([1, 2, 3]));
		assertEquals(JSON.stringify(p.unlockedLevelsByMode.CLASSIC['2']), JSON.stringify([1, 2]));
	});

	// ── multi-player ──

	test('migratePlayerData - migrates all players in the map', () => {
		const players = {
			'Alice': makePlayer({ unlockedLevels: [1] }),
			'Bob': makePlayer({ unlockedLevels: [1, 2] }),
		};
		migratePlayerData(players);
		assert(typeof players['Alice'].levelProgress.unlockedLevelsByDifficulty === 'object', 'Alice migrated');
		assert(typeof players['Bob'].levelProgress.unlockedLevelsByDifficulty === 'object', 'Bob migrated');
	});

	return results;
}
