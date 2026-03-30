/**
 * PuzzleManager.js
 *
 * Manages PUZZLE mode state: deterministic seed, piece counting,
 * star-threshold scoring (bronze / silver / gold).
 *
 * Dependencies: ConfigManager, EventEmitter, Constants
 * Exports: PuzzleManager singleton
 */

import { ConfigManager } from './ConfigManager.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { CONSTANTS } from '../utils/Constants.js';

class PuzzleManagerClass {
	constructor() {
		this.active = false;
		this.pieceLimit = 1000;
		this.piecesUsed = 0;
		this.level = 1;
		this.difficulty = 1;
	}

	/**
	 * Compute a deterministic seed from level and difficulty.
	 * @param {Number} level
	 * @param {Number} difficulty
	 * @returns {Number} Integer seed
	 */
	getSeed(level, difficulty) {
		return level * 10000 + difficulty;
	}

	/**
	 * Initialize for a new puzzle run.
	 * @param {Number} level
	 * @param {Number} difficulty
	 */
	initialize(level, difficulty) {
		this.level = level || 1;
		this.difficulty = difficulty || 1;
		this.pieceLimit = ConfigManager.get('puzzle.pieceLimit', 1000);
		this.piecesUsed = 0;
		this.active = true;
		this._emitUpdate();
	}

	/**
	 * Record that a piece was placed.
	 * @returns {Boolean} true if pieces remain, false if limit reached
	 */
	recordPiece() {
		this.piecesUsed++;
		this._emitUpdate();
		return this.piecesUsed < this.pieceLimit;
	}

	/** @returns {Number} pieces remaining */
	getPiecesRemaining() {
		return Math.max(0, this.pieceLimit - this.piecesUsed);
	}

	/** @returns {Number} total pieces allowed */
	getPieceLimit() {
		return this.pieceLimit;
	}

	/** @returns {Number} pieces used so far */
	getPiecesUsed() {
		return this.piecesUsed;
	}

	/**
	 * Compute the par score (gold threshold) for a level+difficulty.
	 * Bronze and silver are fractions of par.
	 * @param {Number} level
	 * @param {Number} difficulty
	 * @returns {{ bronze: Number, silver: Number, gold: Number }}
	 */
	getStarThresholds(level, difficulty) {
		const base = ConfigManager.get('puzzle.starThresholds.baseScore', 200);
		const perLevel = ConfigManager.get('puzzle.starThresholds.perLevel', 30);
		const diffMult = ConfigManager.get(
			`scoring.difficultyMultipliers.difficulty${difficulty}`, 1
		);
		const bronzePct = ConfigManager.get('puzzle.starThresholds.bronze', 0.30);
		const silverPct = ConfigManager.get('puzzle.starThresholds.silver', 0.60);
		const goldPct = ConfigManager.get('puzzle.starThresholds.gold', 1.00);

		const par = Math.round((base + perLevel * (level - 1)) * diffMult);
		return {
			bronze: Math.round(par * bronzePct),
			silver: Math.round(par * silverPct),
			gold: Math.round(par * goldPct)
		};
	}

	/**
	 * Determine how many stars a score earns.
	 * @param {Number} score
	 * @param {Number} level
	 * @param {Number} difficulty
	 * @returns {Number} 0-3
	 */
	getStars(score, level, difficulty) {
		const t = this.getStarThresholds(level, difficulty);
		if (score >= t.gold) return 3;
		if (score >= t.silver) return 2;
		if (score >= t.bronze) return 1;
		return 0;
	}

	/** Clean up state. */
	reset() {
		this.active = false;
		this.piecesUsed = 0;
	}

	/** Emit pieces-remaining update for HUD. */
	_emitUpdate() {
		EventEmitter.emit(CONSTANTS.EVENTS.PUZZLE_PIECES_UPDATE, {
			piecesUsed: this.piecesUsed,
			piecesRemaining: this.getPiecesRemaining(),
			pieceLimit: this.pieceLimit
		});
	}
}

const PuzzleManager = new PuzzleManagerClass();
export default PuzzleManager;
export { PuzzleManager };
