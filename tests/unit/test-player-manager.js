/**
 * Unit Tests for PlayerManager
 */

import PlayerManager from '../../src/modules/PlayerManager.js';

export function runPlayerManagerTests() {
	const results = [];
	
	// Helper function to run a test
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
	
	// Helper function to assert
	function assert(condition, message) {
		if (!condition) {
			throw new Error(message || 'Assertion failed');
		}
	}
	
	function assertEquals(actual, expected, message) {
		if (actual !== expected) {
			throw new Error(message || `Expected ${expected}, got ${actual}`);
		}
	}
	
	function assertNotNull(value, message) {
		if (value === null || value === undefined) {
			throw new Error(message || 'Value should not be null or undefined');
		}
	}
	
	function assertArrayContains(array, value, message) {
		if (!array.includes(value)) {
			throw new Error(message || `Array should contain ${value}`);
		}
	}
	
	// Save original localStorage to restore after tests
	const originalLocalStorage = {};
	beforeTests();
	
	function beforeTests() {
		// Clear localStorage for clean test environment
		localStorage.clear();
	}
	
	function afterTests() {
		// Clean up
		localStorage.clear();
	}
	
	// Test: PlayerManager initializes with Guest player
	test('PlayerManager initializes with Guest player', () => {
		const players = PlayerManager.getPlayerNames();
		assertArrayContains(players, 'Guest', 'Should have Guest player');
		assertEquals(PlayerManager.getCurrentPlayerName(), 'Guest', 'Current player should be Guest');
	});
	
	// Test: Add new player
	test('addPlayer() creates a new player', () => {
		const result = PlayerManager.addPlayer('Alice');
		assert(result, 'Should successfully add player');
		
		const players = PlayerManager.getPlayerNames();
		assertArrayContains(players, 'Alice', 'Should have Alice in player list');
	});
	
	// Test: Cannot add duplicate player
	test('addPlayer() prevents duplicate player names', () => {
		PlayerManager.addPlayer('Bob');
		const result = PlayerManager.addPlayer('Bob');
		assert(!result, 'Should not add duplicate player');
	});
	
	// Test: Cannot add player with empty name
	test('addPlayer() rejects empty player names', () => {
		const result = PlayerManager.addPlayer('');
		assert(!result, 'Should reject empty name');
		
		const result2 = PlayerManager.addPlayer('   ');
		assert(!result2, 'Should reject whitespace-only name');
	});
	
	// Test: Switch player
	test('switchPlayer() changes current player', () => {
		PlayerManager.addPlayer('Charlie');
		PlayerManager.switchPlayer('Charlie');
		assertEquals(PlayerManager.getCurrentPlayerName(), 'Charlie', 'Current player should be Charlie');
	});
	
	// Test: Get current player data
	test('getCurrentPlayerData() returns player data', () => {
		const data = PlayerManager.getCurrentPlayerData();
		assertNotNull(data, 'Should return player data');
		assertNotNull(data.levelProgress, 'Should have levelProgress');
		assertNotNull(data.stats, 'Should have stats');
	});
	
	// Test: Delete player
	test('deletePlayer() removes a player', () => {
		PlayerManager.addPlayer('David');
		const result = PlayerManager.deletePlayer('David');
		assert(result, 'Should successfully delete player');
		
		const players = PlayerManager.getPlayerNames();
		assert(!players.includes('David'), 'David should not be in player list');
	});
	
	// Test: Cannot delete Guest player
	test('deletePlayer() prevents deleting Guest player', () => {
		const result = PlayerManager.deletePlayer('Guest');
		assert(!result, 'Should not delete Guest player');
		
		const players = PlayerManager.getPlayerNames();
		assertArrayContains(players, 'Guest', 'Guest should still exist');
	});
	
	// Test: Update player stats
	test('updateStats() updates player statistics', () => {
		PlayerManager.switchPlayer('Guest');
		const initialData = PlayerManager.getCurrentPlayerData();
		const initialGamesPlayed = initialData.stats.gamesPlayed;
		
		PlayerManager.updateStats({
			gameStarted: true,
			gameCompleted: true,
			score: 1000,
			level: 1,
			difficulty: 1
		});
		
		const updatedData = PlayerManager.getCurrentPlayerData();
		assert(updatedData.stats.gamesPlayed > initialGamesPlayed, 'Games played should increase');
	});
	
	// Test: Level completion unlocks next level
	test('updateStats() unlocks next level on completion', () => {
		PlayerManager.switchPlayer('Guest');
		
		// Complete level 1, difficulty 1
		PlayerManager.updateStats({
			gameCompleted: true,
			score: 500,
			level: 1,
			difficulty: 1
		});
		
		const data = PlayerManager.getCurrentPlayerData();
		const unlockedLevels = data.levelProgress.unlockedLevelsByDifficulty["1"];
		assert(unlockedLevels.includes(2), 'Level 2 should be unlocked');
	});
	
	// Test: Level completion is tracked per difficulty
	test('updateStats() tracks completions per difficulty', () => {
		PlayerManager.addPlayer('TestPlayer1');
		PlayerManager.switchPlayer('TestPlayer1');
		
		// Complete level 1 on Easy (difficulty 1)
		PlayerManager.updateStats({
			gameCompleted: true,
			score: 500,
			level: 1,
			difficulty: 1
		});
		
		// Complete level 1 on Hard (difficulty 3)
		PlayerManager.updateStats({
			gameCompleted: true,
			score: 800,
			level: 1,
			difficulty: 3
		});
		
		assert(PlayerManager.isLevelCompleted(1, 1), 'Level 1 Easy should be completed');
		assert(PlayerManager.isLevelCompleted(3, 1), 'Level 1 Hard should be completed');
		assert(!PlayerManager.isLevelCompleted(2, 1), 'Level 1 Medium should not be completed');
	});
	
	// Test: Best score is tracked per difficulty and level
	test('getLevelBestScore() returns best score for difficulty-level', () => {
		PlayerManager.addPlayer('TestPlayer2');
		PlayerManager.switchPlayer('TestPlayer2');
		
		// Score 500 on Easy Level 1
		PlayerManager.updateStats({
			gameCompleted: true,
			score: 500,
			level: 1,
			difficulty: 1
		});
		
		// Score 800 on Easy Level 1 (should replace)
		PlayerManager.updateStats({
			gameCompleted: true,
			score: 800,
			level: 1,
			difficulty: 1
		});
		
		// Score 600 on Hard Level 1 (different difficulty)
		PlayerManager.updateStats({
			gameCompleted: true,
			score: 600,
			level: 1,
			difficulty: 3
		});
		
		assertEquals(PlayerManager.getLevelBestScore(1, 1), 800, 'Easy Level 1 best score should be 800');
		assertEquals(PlayerManager.getLevelBestScore(3, 1), 600, 'Hard Level 1 best score should be 600');
	});
	
	// Test: Unlocked levels are tracked per difficulty
	test('Unlocked levels tracked per difficulty in player data', () => {
		PlayerManager.addPlayer('TestPlayer3');
		PlayerManager.switchPlayer('TestPlayer3');
		
		// Complete levels 1-3 on Easy
		for (let i = 1; i <= 3; i++) {
			PlayerManager.updateStats({
				gameCompleted: true,
				score: 500,
				level: i,
				difficulty: 1
			});
		}
		
		// Complete only level 1 on Hard
		PlayerManager.updateStats({
			gameCompleted: true,
			score: 600,
			level: 1,
			difficulty: 3
		});
		
		const data = PlayerManager.getCurrentPlayerData();
		const easyUnlocked = data.levelProgress.unlockedLevelsByDifficulty["1"];
		const hardUnlocked = data.levelProgress.unlockedLevelsByDifficulty["3"];
		
		assert(easyUnlocked.includes(4), 'Easy should have level 4 unlocked');
		assert(easyUnlocked.length >= 4, 'Easy should have at least 4 levels unlocked');
		assert(hardUnlocked.includes(2), 'Hard should have level 2 unlocked');
		assert(hardUnlocked.length === 2, 'Hard should have exactly 2 levels unlocked');
	});
	
	// Test: Settings are saved and loaded per player
	test('updateSettings() and getSettings() work per player', () => {
		PlayerManager.addPlayer('TestPlayer4');
		PlayerManager.switchPlayer('TestPlayer4');
		
		PlayerManager.updateSettings({
			isMuted: true,
			masterVolume: 0.5,
			sfxVolume: 0.6,
			musicVolume: 0.7
		});
		
		const settings = PlayerManager.getSettings();
		assertEquals(settings.isMuted, true, 'isMuted should be true');
		assertEquals(settings.masterVolume, 0.5, 'masterVolume should be 0.5');
		
		// Switch to another player and verify different settings
		PlayerManager.switchPlayer('Guest');
		const guestSettings = PlayerManager.getSettings();
		assertEquals(guestSettings.isMuted, false, 'Guest isMuted should be false (default)');
	});
	
	// Test: Data persistence across reload
	test('Players persist to localStorage', () => {
		PlayerManager.addPlayer('PersistTest');
		
		// Simulate reload by getting data from localStorage
		const savedData = localStorage.getItem('ballMatcher_players');
		assertNotNull(savedData, 'Player data should be saved');
		
		const parsedData = JSON.parse(savedData);
		assertNotNull(parsedData['PersistTest'], 'PersistTest should be in saved data');
	});
	
	// Test: Migration from old data format
	test('migratePlayerData() converts old array-based unlocked levels', () => {
		// Create a player with old format data
		const oldFormatPlayer = {
			name: 'OldFormatPlayer',
			levelProgress: {
				unlockedLevels: [1, 2, 3, 4, 5], // Old array format
				completedLevels: [1, 2, 3], // Old number format
				levelScores: { 1: 500, 2: 600, 3: 700 }
			},
			statistics: {
				gamesPlayed: 10,
				gamesCompleted: 5,
				totalScore: 5000
			}
		};
		
		// Save in old format
		const players = JSON.parse(localStorage.getItem('ballMatcher_players') || '{}');
		players['OldFormatPlayer'] = oldFormatPlayer;
		localStorage.setItem('ballMatcher_players', JSON.stringify(players));
		
		// Create new PlayerManager instance (triggers migration)
		const freshManager = new (PlayerManager.constructor)();
		freshManager.loadPlayers();
		
		// Verify migration
		const migratedPlayer = freshManager.players['OldFormatPlayer'];
		assertNotNull(migratedPlayer.levelProgress.unlockedLevelsByDifficulty, 'Should have unlockedLevelsByDifficulty');
		assert(!Array.isArray(migratedPlayer.levelProgress.unlockedLevels), 'Should not have old unlockedLevels array');
	});
	
	// Test: Gap filling in unlocked levels
	test('updateStats() fills gaps in unlocked levels', () => {
		PlayerManager.addPlayer('GapTest');
		PlayerManager.switchPlayer('GapTest');
		
		// Complete level 5 (should unlock 1-6 with no gaps)
		PlayerManager.updateStats({
			gameCompleted: true,
			score: 1000,
			level: 5,
			difficulty: 1
		});
		
		const data = PlayerManager.getCurrentPlayerData();
		const unlockedLevels = data.levelProgress.unlockedLevelsByDifficulty["1"];
		assert(unlockedLevels.includes(1), 'Should include level 1');
		assert(unlockedLevels.includes(2), 'Should include level 2');
		assert(unlockedLevels.includes(3), 'Should include level 3');
		assert(unlockedLevels.includes(4), 'Should include level 4');
		assert(unlockedLevels.includes(5), 'Should include level 5');
		assert(unlockedLevels.includes(6), 'Should include level 6');
	});
	
	// Clean up after tests
	afterTests();
	
	// Summary
	const passed = results.filter(r => r.pass).length;
	const failed = results.filter(r => !r.pass).length;
	
	return results;
}
