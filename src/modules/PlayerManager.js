/**
 * PlayerManager.js
 * 
 * Description: Manages player profiles for multi-player gameplay on the same computer
 * 
 * Dependencies: None (uses localStorage)
 * 
 * Exports: PlayerManager singleton
 */

/**
 * PlayerManager class for managing player profiles
 */
class PlayerManagerClass {
	constructor() {
		this.currentPlayer = null;
		this.players = {};
		this.storageKey = 'ballMatcher_players';
		this.currentPlayerKey = 'ballMatcher_currentPlayer';
		
		this.loadPlayers();
	}

	/**
	 * Load players from localStorage
	 */
	loadPlayers() {
		try {
			const savedPlayers = localStorage.getItem(this.storageKey);
			if (savedPlayers) {
				this.players = JSON.parse(savedPlayers);
				// Migrate old data format to new format
				this.migratePlayerData();
			} else {
				// Create default player
				this.players = {
					'Guest': this.createNewPlayerData('Guest')
				};
				this.savePlayers();
			}

			// Load current player
			const savedCurrentPlayer = localStorage.getItem(this.currentPlayerKey);
			if (savedCurrentPlayer && this.players[savedCurrentPlayer]) {
				this.currentPlayer = savedCurrentPlayer;
			} else {
				this.currentPlayer = 'Guest';
			}
		} catch (error) {
			console.error('PlayerManager: Error loading players', error);
			this.players = {
				'Guest': this.createNewPlayerData('Guest')
			};
			this.currentPlayer = 'Guest';
		}
	}

	/**
	 * Migrate old player data format to new format
	 * Converts old level-only completion to difficulty-level format
	 */
	migratePlayerData() {
		let migrated = false;
		
		Object.keys(this.players).forEach(playerName => {
			const player = this.players[playerName];
			
			if (!player.levelProgress) return;
			
			// Migrate old unlockedLevels array to unlockedLevelsByDifficulty object
			if (Array.isArray(player.levelProgress.unlockedLevels)) {
				const oldUnlockedLevels = [...player.levelProgress.unlockedLevels];
				player.levelProgress.unlockedLevelsByDifficulty = {
					"1": oldUnlockedLevels, // Migrate to Easy difficulty
					"2": [1],
					"3": [1],
					"4": [1],
					"5": [1]
				};
				delete player.levelProgress.unlockedLevels;
				migrated = true;
			}
			
			// Ensure unlockedLevelsByDifficulty exists
			if (!player.levelProgress.unlockedLevelsByDifficulty) {
				player.levelProgress.unlockedLevelsByDifficulty = {
					"1": [1], "2": [1], "3": [1], "4": [1], "5": [1]
				};
				migrated = true;
			}
			
			// Check if completedLevels has old format (numbers instead of "difficulty-level" strings)
			if (player.levelProgress.completedLevels) {
				const hasOldFormat = player.levelProgress.completedLevels.some(item => typeof item === 'number');
				
				if (hasOldFormat) {
					const oldCompletedLevels = [...player.levelProgress.completedLevels];
					const oldLevelScores = { ...player.levelProgress.levelScores };
					
					// Reset to new format
					player.levelProgress.completedLevels = [];
					player.levelProgress.levelScores = {};
					
					// Migrate old level numbers to "1-level" (assume difficulty 1)
					oldCompletedLevels.forEach(level => {
						if (typeof level === 'number') {
							const key = `1-${level}`;
							player.levelProgress.completedLevels.push(key);
							
							// Migrate score if exists
							if (oldLevelScores[level]) {
								player.levelProgress.levelScores[key] = oldLevelScores[level];
							}
						} else {
							// Already in new format, keep it
							player.levelProgress.completedLevels.push(level);
						}
					});
					
					// Migrate old score keys (number keys to "1-level" keys)
					Object.keys(oldLevelScores).forEach(key => {
						if (!isNaN(key)) {
							const newKey = `1-${key}`;
							if (!player.levelProgress.levelScores[newKey]) {
								player.levelProgress.levelScores[newKey] = oldLevelScores[key];
							}
						}
					});
					
					migrated = true;
				}
			}
			
			// NEW MIGRATION: Fill in missing completed levels
			// If a player has completed level 5, they should have checkmarks on 1-4 too
			if (player.levelProgress.completedLevels) {
				const completedByDifficulty = {};
				
				// Group completed levels by difficulty
				player.levelProgress.completedLevels.forEach(key => {
					const [diff, lvl] = key.split('-').map(Number);
					if (!completedByDifficulty[diff]) {
						completedByDifficulty[diff] = [];
					}
					completedByDifficulty[diff].push(lvl);
				});
				
				console.log('Migration: completedByDifficulty', completedByDifficulty);
				
				// For each difficulty, if a higher level is completed, mark all lower levels as completed
				Object.keys(completedByDifficulty).forEach(diff => {
					const levels = completedByDifficulty[diff];
					const maxLevel = Math.max(...levels);
					
					console.log(`Migration: Difficulty ${diff}, maxLevel ${maxLevel}, existing levels:`, levels);
					console.log(`Migration: Current completedLevels:`, player.levelProgress.completedLevels);
					
				// Mark all levels from 1 to maxLevel as completed
				for (let i = 1; i <= maxLevel; i++) {
					const key = `${diff}-${i}`;
					if (!player.levelProgress.completedLevels.includes(key)) {
						player.levelProgress.completedLevels.push(key);
						migrated = true;
					}
				}
			});
		}
		
		// NEW: Migrate difficulty-level format to mode-difficulty-level format (CLASSIC mode)
		// Check if we need to migrate to mode-specific format
		const needsModeMigration = !player.levelProgress.unlockedLevelsByMode || 
		                           (player.levelProgress.completedLevels && 
		                            player.levelProgress.completedLevels.some(key => {
		                            	const parts = key.split('-');
		                            	return parts.length === 2; // "difficulty-level" format
		                            }));
		
		if (needsModeMigration) {
			// Initialize unlockedLevelsByMode if it doesn't exist
			if (!player.levelProgress.unlockedLevelsByMode) {
				player.levelProgress.unlockedLevelsByMode = {
					"CLASSIC": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] },
					"ZEN": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] },
					"GAUNTLET": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] },
					"RISING_TIDE": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] }
				};
			}
			
			// Migrate unlockedLevelsByDifficulty to CLASSIC mode
			if (player.levelProgress.unlockedLevelsByDifficulty) {
				Object.keys(player.levelProgress.unlockedLevelsByDifficulty).forEach(diff => {
					const unlockedLevels = player.levelProgress.unlockedLevelsByDifficulty[diff];
					player.levelProgress.unlockedLevelsByMode.CLASSIC[diff] = [...unlockedLevels];
				});
			}
			
			// Migrate completedLevels from "difficulty-level" to "CLASSIC-difficulty-level"
			if (player.levelProgress.completedLevels) {
				const migratedCompleted = [];
				player.levelProgress.completedLevels.forEach(key => {
					const parts = key.split('-');
					if (parts.length === 2) {
						// Old format: "difficulty-level" -> convert to "CLASSIC-difficulty-level"
						migratedCompleted.push(`CLASSIC-${key}`);
					} else if (parts.length === 3) {
						// Already in new format: "mode-difficulty-level"
						migratedCompleted.push(key);
					}
				});
				player.levelProgress.completedLevels = migratedCompleted;
			}
			
			// Migrate levelScores from "difficulty-level" to "CLASSIC-difficulty-level"
			if (player.levelProgress.levelScores) {
				const migratedScores = {};
				Object.keys(player.levelProgress.levelScores).forEach(key => {
					const parts = key.split('-');
					if (parts.length === 2) {
						// Old format: "difficulty-level" -> convert to "CLASSIC-difficulty-level"
						migratedScores[`CLASSIC-${key}`] = player.levelProgress.levelScores[key];
					} else if (parts.length === 3) {
						// Already in new format: "mode-difficulty-level"
						migratedScores[key] = player.levelProgress.levelScores[key];
					}
				});
				player.levelProgress.levelScores = migratedScores;
			}
			
			migrated = true;
		}
	});
	if (migrated) {
		this.savePlayers();
	}
}	/**
	 * Save players to localStorage
	 */
	savePlayers() {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.players));
			localStorage.setItem(this.currentPlayerKey, this.currentPlayer);
		} catch (error) {
			console.error('PlayerManager: Error saving players', error);
		}
	}

	/**
	 * Create new player data structure
	 * @param {String} name - Player name
	 * @returns {Object} New player data
	 */
	createNewPlayerData(name) {
		return {
			name: name,
			createdAt: new Date().toISOString(),
			lastPlayed: new Date().toISOString(),
			stats: {
				gamesPlayed: 0,
				totalScore: 0,
				highScore: 0,
				longestTime: 0,
				levelsCompleted: 0
			},
			levelProgress: {
				highestLevel: 1,
				// Track unlocked levels by difficulty AND game mode
				// Format: { "CLASSIC": { "1": [1, 2, 3], "2": [1] }, "ZEN": { "1": [1] } }
				unlockedLevelsByDifficulty: {
					"1": [1], // Easy (legacy - for CLASSIC mode)
					"2": [1], // Medium
					"3": [1], // Hard
					"4": [1], // Expert
					"5": [1]  // Master
				},
				// New: Mode-specific unlocked levels
				unlockedLevelsByMode: {
					"CLASSIC": {
						"1": [1], "2": [1], "3": [1], "4": [1], "5": [1]
					},
					"ZEN": {
						"1": [1], "2": [1], "3": [1], "4": [1], "5": [1]
					},
					"GAUNTLET": {
						"1": [1], "2": [1], "3": [1], "4": [1], "5": [1]
					},
					"RISING_TIDE": {
						"1": [1], "2": [1], "3": [1], "4": [1], "5": [1]
					}
				},
				// Track completion and scores by mode+difficulty+level combination
				// Format: "mode-difficulty-level" (e.g., "CLASSIC-1-1", "ZEN-3-5")
				completedLevels: [], // Array of "mode-difficulty-level" or "difficulty-level" (legacy)
				levelScores: {} // Object mapping "mode-difficulty-level" to best score
		},
		settings: {
			isMuted: false,
			masterVolume: 0.7,
			sfxVolume: 0.8,
			musicVolume: 0
		}
	};
}	/**
	 * Get current player name
	 * @returns {String} Current player name
	 */
	getCurrentPlayerName() {
		return this.currentPlayer;
	}

	/**
	 * Get current player data
	 * @returns {Object} Current player data
	 */
	getCurrentPlayerData() {
		return this.players[this.currentPlayer] || this.players['Guest'];
	}

	/**
	 * Get all player names
	 * @returns {Array<String>} Array of player names
	 */
	getPlayerNames() {
		return Object.keys(this.players);
	}

	/**
	 * Switch to a different player
	 * @param {String} playerName - Name of player to switch to
	 * @returns {Boolean} True if switch successful
	 */
	switchPlayer(playerName) {
		if (this.players[playerName]) {
			this.currentPlayer = playerName;
			this.players[playerName].lastPlayed = new Date().toISOString();
			this.savePlayers();
			return true;
		}
		return false;
	}

	/**
	 * Add a new player
	 * @param {String} playerName - Name of new player
	 * @returns {Boolean} True if player added successfully
	 */
	addPlayer(playerName) {
		// Validate name
		if (!playerName || playerName.trim() === '') {
			return false;
		}

		playerName = playerName.trim();

		// Check if player already exists
		if (this.players[playerName]) {
			return false;
		}

		// Create new player
		this.players[playerName] = this.createNewPlayerData(playerName);
		this.savePlayers();
		return true;
	}

	/**
	 * Delete a player
	 * @param {String} playerName - Name of player to delete
	 * @returns {Boolean} True if player deleted successfully
	 */
	deletePlayer(playerName) {
		// Can't delete Guest or current player
		if (playerName === 'Guest') {
			return false;
		}

		if (playerName === this.currentPlayer) {
			return false;
		}

		if (this.players[playerName]) {
			delete this.players[playerName];
			this.savePlayers();
			return true;
		}

		return false;
	}

	/**
	 * Update player stats
	 * @param {Object} stats - Stats to update (score, time, difficulty, level, gameCompleted OR levelCompleted, gameStarted)
	 */
	updateStats(stats) {
		const player = this.getCurrentPlayerData();
		
		// Initialize levelProgress properties if they don't exist (backward compatibility)
		if (!player.levelProgress.completedLevels) {
			player.levelProgress.completedLevels = [];
		}
		if (!player.levelProgress.levelScores) {
			player.levelProgress.levelScores = {};
		}
		if (!player.levelProgress.unlockedLevelsByMode) {
			player.levelProgress.unlockedLevelsByMode = {
				"CLASSIC": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] },
				"ZEN": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] },
				"GAUNTLET": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] },
				"RISING_TIDE": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] }
			};
		}
		
		if (stats.score !== undefined) {
			player.stats.totalScore += stats.score;
			if (stats.score > player.stats.highScore) {
				player.stats.highScore = stats.score;
			}
		}

		if (stats.time !== undefined && stats.time > player.stats.longestTime) {
			player.stats.longestTime = stats.time;
		}
		
		// Handle both levelCompleted and gameCompleted+level formats
		const levelCompleted = stats.levelCompleted || (stats.gameCompleted && stats.level);

		if (levelCompleted && stats.difficulty !== undefined) {
			const level = levelCompleted;
			const difficulty = stats.difficulty;
			const mode = stats.mode || 'CLASSIC'; // Default to CLASSIC for backward compatibility
			const key = `${mode}-${difficulty}-${level}`; // e.g., "CLASSIC-1-5"
			const legacyKey = `${difficulty}-${level}`; // For backward compatibility
			
			// Ensure unlockedLevelsByDifficulty exists (legacy)
			if (!player.levelProgress.unlockedLevelsByDifficulty) {
				player.levelProgress.unlockedLevelsByDifficulty = {
					"1": [1], "2": [1], "3": [1], "4": [1], "5": [1]
				};
			}
			
			// Mark this level and all previous levels as completed for this mode
			for (let i = 1; i <= level; i++) {
				const completionKey = `${mode}-${difficulty}-${i}`;
				if (!player.levelProgress.completedLevels.includes(completionKey)) {
					player.levelProgress.completedLevels.push(completionKey);
					player.stats.levelsCompleted++;
				}
			}
			
			// Update best score for this mode+difficulty+level combination
			if (stats.score !== undefined) {
				const currentBest = player.levelProgress.levelScores[key] || 0;
				if (stats.score > currentBest) {
					player.levelProgress.levelScores[key] = stats.score;
				}
			}
			
			// Update highest level reached
			if (level > player.levelProgress.highestLevel) {
				player.levelProgress.highestLevel = level;
			}
			
			// Unlock next level for this mode+difficulty
			const difficultyKey = String(difficulty);
			
			// Update legacy unlockedLevelsByDifficulty (for CLASSIC mode)
			if (mode === 'CLASSIC' && !player.levelProgress.unlockedLevelsByDifficulty[difficultyKey]) {
				player.levelProgress.unlockedLevelsByDifficulty[difficultyKey] = [1];
			}
			
			// Update mode-specific unlocked levels
			if (!player.levelProgress.unlockedLevelsByMode[mode]) {
				player.levelProgress.unlockedLevelsByMode[mode] = {
					"1": [1], "2": [1], "3": [1], "4": [1], "5": [1]
				};
			}
			if (!player.levelProgress.unlockedLevelsByMode[mode][difficultyKey]) {
				player.levelProgress.unlockedLevelsByMode[mode][difficultyKey] = [1];
			}
			
			// Ensure all levels up to and including current level are unlocked
			const unlockedArray = player.levelProgress.unlockedLevelsByMode[mode][difficultyKey];
			for (let i = 1; i <= level; i++) {
				if (!unlockedArray.includes(i)) {
					unlockedArray.push(i);
				}
			}
			
			// Unlock the next level
			if (!unlockedArray.includes(level + 1)) {
				unlockedArray.push(level + 1);
			}
			
			// Also update legacy array if CLASSIC mode
			if (mode === 'CLASSIC') {
				const legacyArray = player.levelProgress.unlockedLevelsByDifficulty[difficultyKey];
				for (let i = 1; i <= level; i++) {
					if (!legacyArray.includes(i)) {
						legacyArray.push(i);
					}
				}
				if (!legacyArray.includes(level + 1)) {
					legacyArray.push(level + 1);
				}
			}
		}

		if (stats.gameStarted) {
			player.stats.gamesPlayed++;
		}

		player.lastPlayed = new Date().toISOString();
		this.savePlayers();
	}

	/**
	 * Get high score for current player
	 * @returns {Number} High score
	 */
	getHighScore() {
		return this.getCurrentPlayerData().stats.highScore;
	}

	/**
	 * Get longest time for current player
	 * @returns {Number} Longest time survived
	 */
	getLongestTime() {
		return this.getCurrentPlayerData().stats.longestTime;
	}

	/**
	 * Get best score for a specific mode+difficulty+level combination
	 * @param {Number} difficulty - Difficulty level (1-5)
	 * @param {Number} level - Level number
	 * @param {String} mode - Game mode (CLASSIC, ZEN, GAUNTLET, RISING_TIDE)
	 * @returns {Number} Best score for this mode+difficulty+level (0 if never completed)
	 */
	getLevelBestScore(difficulty, level, mode = 'CLASSIC') {
		const player = this.getCurrentPlayerData();
		if (!player.levelProgress.levelScores) {
			player.levelProgress.levelScores = {};
		}
		// Try new mode-based key first
		const modeKey = `${mode}-${difficulty}-${level}`;
		if (player.levelProgress.levelScores[modeKey] !== undefined) {
			return player.levelProgress.levelScores[modeKey];
		}
		// Fall back to legacy key for backward compatibility
		const legacyKey = `${difficulty}-${level}`;
		return player.levelProgress.levelScores[legacyKey] || 0;
	}

	/**
	 * Check if a mode+difficulty+level combination has been completed
	 * @param {Number} difficulty - Difficulty level (1-5)
	 * @param {Number} level - Level number
	 * @param {String} mode - Game mode (CLASSIC, ZEN, GAUNTLET, RISING_TIDE)
	 * @returns {Boolean} True if this mode+difficulty+level has been completed at least once
	 */
	isLevelCompleted(difficulty, level, mode = 'CLASSIC') {
		const player = this.getCurrentPlayerData();
		if (!player.levelProgress.completedLevels) {
			player.levelProgress.completedLevels = [];
		}
		// Check new mode-based key
		const modeKey = `${mode}-${difficulty}-${level}`;
		if (player.levelProgress.completedLevels.includes(modeKey)) {
			return true;
		}
		// Fall back to legacy key for backward compatibility
		const legacyKey = `${difficulty}-${level}`;
		return player.levelProgress.completedLevels.includes(legacyKey);
	}

	/**
	 * Get settings for current player
	 * @returns {Object} Player settings
	 */
	getSettings() {
		const player = this.getCurrentPlayerData();
		// Ensure settings exist (for backward compatibility with old saves)
		if (!player.settings) {
			player.settings = {
				isMuted: false,
				masterVolume: 0.7,
				sfxVolume: 0.8,
				musicVolume: 0
			};
			this.savePlayers();
		}
		return player.settings;
	}

	/**
	 * Update settings for current player
	 * @param {Object} settings - Settings to update
	 */
	updateSettings(settings) {
		const player = this.getCurrentPlayerData();
		if (!player.settings) {
			player.settings = {};
		}
		
		Object.assign(player.settings, settings);
		this.savePlayers();
	}

	/**
	 * Reset current player's stats and progress
	 * @returns {Boolean} True if reset successful
	 */
	resetPlayerData() {
		const playerName = this.currentPlayer;
		const currentSettings = this.getSettings();
		
		// Create fresh player data but keep settings
		const freshData = this.createNewPlayerData(playerName);
		freshData.settings = currentSettings;
		
		this.players[playerName] = freshData;
		this.savePlayers();
		return true;
	}
}

// Export singleton instance
const PlayerManager = new PlayerManagerClass();
export default PlayerManager;
