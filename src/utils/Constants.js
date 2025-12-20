/**
 * Constants.js
 * 
 * Description: Game constants and enumerations for the Ball Drop Puzzle Game
 * 
 * Dependencies: None
 * 
 * Exports: CONSTANTS object containing all game constants
 */

/**
 * Game constants
 */
const CONSTANTS = {
	
	/**
	 * Grid dimensions
	 */
	GRID_ROWS: 25,
	GRID_COLS: 15,
	
	/**
	 * Ball types enumeration
	 */
	BALL_TYPES: {
		NORMAL: 'NORMAL',
		EXPLODING: 'EXPLODING',
		PAINTER_HORIZONTAL: 'PAINTER_HORIZONTAL',
		PAINTER_VERTICAL: 'PAINTER_VERTICAL',
		PAINTER_DIAGONAL: 'PAINTER_DIAGONAL',
		BLOCKING: 'BLOCKING'
	},
	
	/**
	 * Painter ball types (subset for easy checking)
	 */
	PAINTER_TYPES: ['PAINTER_HORIZONTAL', 'PAINTER_VERTICAL', 'PAINTER_DIAGONAL'],
	
	/**
	 * Direction enumeration
	 */
	DIRECTIONS: {
		UP: 'UP',
		DOWN: 'DOWN',
		LEFT: 'LEFT',
		RIGHT: 'RIGHT',
		NONE: 'NONE'
	},
	
	/**
	 * Match direction enumeration
	 */
	MATCH_DIRECTIONS: {
		HORIZONTAL: 'HORIZONTAL',
		VERTICAL: 'VERTICAL',
		DIAGONAL_NE: 'DIAGONAL_NE',
		DIAGONAL_SE: 'DIAGONAL_SE',
		DIAGONAL_SW: 'DIAGONAL_SW',
		DIAGONAL_NW: 'DIAGONAL_NW'
	},
	
	/**
	 * Game state enumeration
	 */
	GAME_STATES: {
		MENU: 'MENU',
		PLAYING: 'PLAYING',
		PAUSED: 'PAUSED',
		GAME_OVER: 'GAME_OVER',
		LEVEL_COMPLETE: 'LEVEL_COMPLETE'
	},
	
	/**
	 * Piece shape types
	 */
	PIECE_TYPES: {
		I: 'I',
		O: 'O',
		T: 'T',
		L: 'L',
		J: 'J',
		S: 'S',
		Z: 'Z',
		SINGLE: 'SINGLE'
	},
	
	/**
	 * Event names for EventEmitter
	 */
	EVENTS: {
		GAME_START: 'gameStartEvent',
		GAME_PAUSE: 'gamePauseEvent',
		GAME_RESUME: 'gameResumeEvent',
		GAME_OVER: 'gameOverEvent',
		LEVEL_COMPLETE: 'levelCompleteEvent',
		PIECE_SPAWN: 'pieceSpawnEvent',
		PIECE_LOCK: 'pieceLockEvent',
		MATCH_FOUND: 'matchFoundEvent',
		CASCADE: 'cascadeEvent',
		CASCADE_COMPLETE: 'cascadeCompleteEvent',
		BALLS_CLEARED: 'ballsClearedEvent',
		SCORE_UPDATE: 'scoreUpdateEvent',
		MOVE_LEFT: 'moveLeftEvent',
		MOVE_RIGHT: 'moveRightEvent',
		ROTATE: 'rotateEvent',
		HARD_DROP: 'hardDropEvent',
		PAUSE: 'pauseEvent',
		RESTART: 'restartEvent'
	},
	
	/**
	 * Minimum match length for clearing
	 */
	MIN_MATCH_LENGTH: 3,
	
	/**
	 * Maximum cascade depth (emergency break)
	 */
	MAX_CASCADE_DEPTH: 10,
	
	/**
	 * Explosion radius in cells
	 */
	EXPLOSION_RADIUS: 3,
	
	/**
	 * Difficulty levels
	 */
	DIFFICULTY_LEVELS: {
		EASY: 1,
		MEDIUM: 2,
		HARD: 3,
		EXPERT: 4,
		MASTER: 5
	},
	
	/**
	 * LocalStorage keys
	 */
	STORAGE_KEYS: {
		HIGH_SCORES: 'ballDropGame_highScores',
		UNLOCKED_LEVELS: 'ballDropGame_unlockedLevels',
		SETTINGS: 'ballDropGame_settings'
	}
	
};

// Export both CONSTANTS object and individual common constants for convenience
export { CONSTANTS };
export const BALL_TYPES = CONSTANTS.BALL_TYPES;
export const GAME_STATES = CONSTANTS.GAME_STATES;
export const EVENTS = CONSTANTS.EVENTS;
