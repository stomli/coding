/**
 * Unit tests for game modes functionality
 */

import { CONSTANTS } from '../../src/utils/Constants.js';
import PlayerManager from '../../src/modules/PlayerManager.js';

/**
 * Run all game mode tests
 * @returns {Array} Test results
 */
export function runGameModeTests() {
	const tests = [];
	
	// Test 1: Game mode constants exist
	try {
		const pass = CONSTANTS.GAME_MODES !== undefined && typeof CONSTANTS.GAME_MODES === 'object';
		tests.push({
			name: 'Game modes constants are defined',
			pass: pass,
			error: pass ? null : 'GAME_MODES not defined or not an object'
		});
	} catch (error) {
		tests.push({
			name: 'Game modes constants are defined',
			pass: false,
			error: error.message
		});
	}
	
	// Test 2: All game modes are configured
	try {
		const modes = ['CLASSIC', 'ZEN', 'GAUNTLET', 'RISING_TIDE'];
		const allDefined = modes.every(mode => CONSTANTS.GAME_MODES[mode] !== undefined);
		tests.push({
			name: 'All game modes have configurations',
			pass: allDefined,
			error: allDefined ? null : 'Not all modes are defined'
		});
	} catch (error) {
		tests.push({
			name: 'All game modes have configurations',
			pass: false,
			error: error.message
		});
	}
	
	// Test 3: CLASSIC mode configuration
	try {
		const config = CONSTANTS.GAME_MODE_CONFIG[CONSTANTS.GAME_MODES.CLASSIC];
		const pass = config.timed === true && config.preFillRows === 0 && config.risingBlocks === false;
		tests.push({
			name: 'CLASSIC mode has correct configuration',
			pass: pass,
			error: pass ? null : 'CLASSIC config incorrect'
		});
	} catch (error) {
		tests.push({
			name: 'CLASSIC mode has correct configuration',
			pass: false,
			error: error.message
		});
	}
	
	// Test 4: ZEN mode configuration
	try {
		const config = CONSTANTS.GAME_MODE_CONFIG[CONSTANTS.GAME_MODES.ZEN];
		const pass = config.timed === false && config.preFillRows === 0 && config.risingBlocks === false;
		tests.push({
			name: 'ZEN mode has correct configuration',
			pass: pass,
			error: pass ? null : 'ZEN config incorrect'
		});
	} catch (error) {
		tests.push({
			name: 'ZEN mode has correct configuration',
			pass: false,
			error: error.message
		});
	}
	
	// Test 5: GAUNTLET mode configuration
	try {
		const config = CONSTANTS.GAME_MODE_CONFIG[CONSTANTS.GAME_MODES.GAUNTLET];
		const pass = config.timed === true && config.preFillRows === 5 && 
		             config.risingBlocks === true && config.risingInterval === 5000;
		tests.push({
			name: 'GAUNTLET mode has correct configuration',
			pass: pass,
			error: pass ? null : 'GAUNTLET config incorrect'
		});
	} catch (error) {
		tests.push({
			name: 'GAUNTLET mode has correct configuration',
			pass: false,
			error: error.message
		});
	}
	
	// Test 6: RISING_TIDE mode configuration
	try {
		const config = CONSTANTS.GAME_MODE_CONFIG[CONSTANTS.GAME_MODES.RISING_TIDE];
		const pass = config.timed === true && config.preFillRows === 0 && 
		             config.risingBlocks === true && config.risingInterval === 9000;
		tests.push({
			name: 'RISING_TIDE mode has correct configuration',
			pass: pass,
			error: pass ? null : 'RISING_TIDE config incorrect'
		});
	} catch (error) {
		tests.push({
			name: 'RISING_TIDE mode has correct configuration',
			pass: false,
			error: error.message
		});
	}
	
	// Test 7: PlayerManager stores mode-specific progression
	try {
		const playerData = PlayerManager.getCurrentPlayerData();
		const pass = playerData.levelProgress.unlockedLevelsByMode !== undefined && 
		             typeof playerData.levelProgress.unlockedLevelsByMode === 'object';
		tests.push({
			name: 'PlayerManager uses mode-specific progression structure',
			pass: pass,
			error: pass ? null : 'unlockedLevelsByMode not properly structured'
		});
	} catch (error) {
		tests.push({
			name: 'PlayerManager uses mode-specific progression structure',
			pass: false,
			error: error.message
		});
	}
	
	// Test 8: Level completion is tracked by mode
	try {
		// Reset to a clean player state
		localStorage.removeItem('ballMatcher_players');
		PlayerManager.loadPlayers();
		
		// Simulate completing a level in CLASSIC mode
		PlayerManager.updateStats({
			score: 1000,
			time: 100,
			difficulty: 1,
			levelCompleted: 1,
			mode: 'CLASSIC'
		});
		
		// Check that it's marked as completed for CLASSIC but not for ZEN
		const classicCompleted = PlayerManager.isLevelCompleted(1, 1, 'CLASSIC');
		const zenCompleted = PlayerManager.isLevelCompleted(1, 1, 'ZEN');
		
		const pass = classicCompleted === true && zenCompleted === false;
		tests.push({
			name: 'Level completion is tracked separately by mode',
			pass: pass,
			error: pass ? null : 'Level completion not tracked correctly by mode'
		});
		
		// Clean up
		localStorage.removeItem('ballMatcher_players');
		PlayerManager.loadPlayers();
	} catch (error) {
		tests.push({
			name: 'Level completion is tracked separately by mode',
			pass: false,
			error: error.message
		});
	}
	
	// Test 9: Best scores are stored by mode
	try {
		// Set scores for different modes
		PlayerManager.updateStats({
			score: 1000,
			time: 100,
			difficulty: 1,
			levelCompleted: 1,
			mode: 'CLASSIC'
		});
		PlayerManager.updateStats({
			score: 2000,
			time: 200,
			difficulty: 1,
			levelCompleted: 1,
			mode: 'ZEN'
		});
		
		const classicScore = PlayerManager.getLevelBestScore(1, 1, 'CLASSIC');
		const zenScore = PlayerManager.getLevelBestScore(1, 1, 'ZEN');
		
		const pass = classicScore === 1000 && zenScore === 2000;
		tests.push({
			name: 'Best scores are stored separately by mode',
			pass: pass,
			error: pass ? null : `Scores incorrect: CLASSIC=${classicScore}, ZEN=${zenScore}`
		});
		
		// Clean up
		localStorage.removeItem('ballMatcher_players');
		PlayerManager.loadPlayers();
	} catch (error) {
		tests.push({
			name: 'Best scores are stored separately by mode',
			pass: false,
			error: error.message
		});
	}
	
	// Test 10: Level unlocking is mode-specific
	try {
		// Complete level 1-1 in CLASSIC mode
		PlayerManager.updateStats({
			score: 1000,
			time: 100,
			difficulty: 1,
			levelCompleted: 1,
			mode: 'CLASSIC'
		});
		
		const playerData = PlayerManager.getCurrentPlayerData();
		
		// Check that level 1-2 is unlocked in CLASSIC
		const classicUnlocked = playerData.levelProgress.unlockedLevelsByMode['CLASSIC'] && 
		                        playerData.levelProgress.unlockedLevelsByMode['CLASSIC']['1'] &&
		                        playerData.levelProgress.unlockedLevelsByMode['CLASSIC']['1'].includes(2);
		
		// Check that level 1-2 is NOT unlocked in ZEN
		const zenUnlocked = playerData.levelProgress.unlockedLevelsByMode['ZEN'] && 
		                    playerData.levelProgress.unlockedLevelsByMode['ZEN']['1'] &&
		                    playerData.levelProgress.unlockedLevelsByMode['ZEN']['1'].includes(2);
		
		const pass = classicUnlocked === true && zenUnlocked === false;
		tests.push({
			name: 'Level unlocking is mode-specific',
			pass: pass,
			error: pass ? null : 'Level unlocking not mode-specific'
		});
		
		// Clean up
		localStorage.removeItem('ballMatcher_players');
		PlayerManager.loadPlayers();
	} catch (error) {
		tests.push({
			name: 'Level unlocking is mode-specific',
			pass: false,
			error: error.message
		});
	}
	
	// Test 11: Legacy data migration
	try {
		// Create legacy player data (old format without mode)
		const legacyPlayers = {
			'Guest': {
				name: 'Guest',
				stats: {
					gamesPlayed: 5,
					highScore: 2000,
					totalScore: 5000,
					longestTime: 300,
					levelsCompleted: 3
				},
				levelProgress: {
					completedLevels: ['1-1', '1-2', '1-3'],
					levelScores: {
						'1-1': 1000,
						'1-2': 2000
					},
					unlockedLevelsByDifficulty: {
						'1': [1, 2, 3, 4]
					},
					highestLevel: 3
				},
				settings: {}
			}
		};
		
		// Save legacy data and reload to trigger migration
		localStorage.setItem('ballMatcher_players', JSON.stringify(legacyPlayers));
		PlayerManager.loadPlayers();
		const migratedData = PlayerManager.getCurrentPlayerData();
		
		// Check that data was migrated to CLASSIC mode
		const hasStructure = migratedData.levelProgress.unlockedLevelsByMode !== undefined &&
		                     migratedData.levelProgress.unlockedLevelsByMode['CLASSIC'] !== undefined;
		
		const classicLevels = migratedData.levelProgress.unlockedLevelsByMode['CLASSIC']['1'];
		const pass = hasStructure &&
		             classicLevels && classicLevels.includes(1) && 
		             classicLevels.includes(2) && 
		             classicLevels.includes(3);
		
		tests.push({
			name: 'Legacy player data migrates to CLASSIC mode',
			pass: pass,
			error: pass ? null : 'Migration failed or data incorrect'
		});
		
		// Clean up
		localStorage.removeItem('ballMatcher_players');
		PlayerManager.loadPlayers();
	} catch (error) {
		tests.push({
			name: 'Legacy player data migrates to CLASSIC mode',
			pass: false,
			error: error.message
		});
		localStorage.removeItem('ballMatcher_players');
		PlayerManager.loadPlayers();
	}
	
	// Test 12: Mode-specific key format
	try {
		// Complete a level in ZEN mode
		PlayerManager.updateStats({
			score: 5000,
			time: 500,
			difficulty: 2,
			levelCompleted: 3,
			mode: 'ZEN'
		});
		
		const playerData = PlayerManager.getCurrentPlayerData();
		
		// Check that the key format is correct
		const expectedKey = 'ZEN-2-3';
		const hasCompletedKey = playerData.levelProgress.completedLevels && 
		                        playerData.levelProgress.completedLevels.includes(expectedKey);
		const hasScoreKey = playerData.levelProgress.levelScores && 
		                    playerData.levelProgress.levelScores[expectedKey] !== undefined;
		const scoreCorrect = playerData.levelProgress.levelScores[expectedKey] === 5000;
		
		const pass = hasCompletedKey && hasScoreKey && scoreCorrect;
		tests.push({
			name: 'Completion and score keys use mode-difficulty-level format',
			pass: pass,
			error: pass ? null : 'Key format incorrect or data missing'
		});
		
		// Clean up
		localStorage.removeItem('ballMatcher_players');
		PlayerManager.loadPlayers();
	} catch (error) {
		tests.push({
			name: 'Completion and score keys use mode-difficulty-level format',
			pass: false,
			error: error.message
		});
	}
	
	return tests;
}
