/**
 * PlayerDataMigrator.js
 *
 * Description: Standalone migration logic for PlayerManager player data.
 *   Converts legacy storage formats to the current mode-difficulty-level format.
 *
 * Exports: migratePlayerData(players) → boolean (true if any data was changed)
 */

/**
 * Migrate all player records in-place from older storage formats to the current format.
 * @param {Object} players - The players map keyed by player name (mutated in place).
 * @returns {boolean} True if any player record was changed.
 */
export function migratePlayerData(players) {
	let migrated = false;

	Object.keys(players).forEach(playerName => {
		const player = players[playerName];

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

		// MIGRATION: Fill in missing completed levels for legacy 2-part keys only
		// If a player has completed level 5, they should have checkmarks on 1-4 too.
		// Only process legacy "difficulty-level" format (2 numeric parts) — skip modern
		// "mode-difficulty-level" (3-part) keys to avoid NaN pollution in the index.
		if (player.levelProgress.completedLevels) {
			const completedByDifficulty = {};

			// Group completed levels by difficulty — legacy keys only
			player.levelProgress.completedLevels.forEach(key => {
				const parts = key.split('-');
				if (parts.length !== 2) return; // Skip modern 3-part keys
				const diff = Number(parts[0]);
				const lvl  = Number(parts[1]);
				if (isNaN(diff) || isNaN(lvl)) return; // Skip any malformed keys
				if (!completedByDifficulty[diff]) {
					completedByDifficulty[diff] = [];
				}
				completedByDifficulty[diff].push(lvl);
			});

			// For each difficulty, if a higher level is completed, mark all lower levels too
			Object.keys(completedByDifficulty).forEach(diff => {
				const levels = completedByDifficulty[diff];
				const maxLevel = Math.max(...levels);

				// Mark all levels from 1 to maxLevel as completed (legacy format)
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
					"RISING_TIDE": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] },
					"MISSION": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] },
					"PUZZLE": { "1": [1], "2": [1], "3": [1], "4": [1], "5": [1] }
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

	return migrated;
}
