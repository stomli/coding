/**
 * AnimationManager.js
 * 
 * Description: Manages animations for ball clearing, piece drops, and UI transitions
 * 
 * Dependencies: None
 * 
 * Exports: AnimationManager singleton
 */

/**
 * AnimationManager class for handling game animations
 */
class AnimationManagerClass {
	constructor() {
		this.activeAnimations = [];
		this.animationId = 0;
	}

	/**
	 * Create a fade-out animation for cleared balls
	 * @param {Array} positions - Array of {row, col} positions
	 * @param {Function} callback - Called when animation completes
	 * @returns {Number} Animation ID
	 */
	animateClearBalls(positions, callback) {
		const animation = {
			id: this.animationId++,
			type: 'clearBalls',
			positions: positions,
			progress: 0,
			duration: 300, // ms
			startTime: performance.now(),
			callback: callback
		};
		
		this.activeAnimations.push(animation);
		return animation.id;
	}

	/**
	 * Create a drop animation for a piece
	 * @param {Piece} piece - Piece to animate
	 * @param {Number} fromY - Starting Y position
	 * @param {Number} toY - Ending Y position
	 * @param {Function} callback - Called when animation completes
	 * @returns {Number} Animation ID
	 */
	animatePieceDrop(piece, fromY, toY, callback) {
		const animation = {
			id: this.animationId++,
			type: 'pieceDrop',
			piece: piece,
			fromY: fromY,
			toY: toY,
			progress: 0,
			duration: 200, // ms
			startTime: performance.now(),
			callback: callback
		};
		
		this.activeAnimations.push(animation);
		return animation.id;
	}

	/**
	 * Create a celebration animation for level complete
	 * @param {Function} callback - Called when animation completes
	 * @returns {Number} Animation ID
	 */
	animateLevelComplete(callback) {
		const animation = {
			id: this.animationId++,
			type: 'levelComplete',
			progress: 0,
			duration: 1000, // ms
			startTime: performance.now(),
			callback: callback
		};
		
		this.activeAnimations.push(animation);
		return animation.id;
	}

	/**
	 * Create an explosion animation
	 * @param {Number} row - Grid row
	 * @param {Number} col - Grid column
	 * @param {Number} radius - Explosion radius
	 * @param {Function} callback - Called when animation completes
	 * @returns {Number} Animation ID
	 */
	animateExplosion(row, col, radius, callback) {
		const animation = {
			id: this.animationId++,
			type: 'explosion',
			row: row,
			col: col,
			radius: radius,
			progress: 0,
			duration: 400, // ms
			startTime: performance.now(),
			callback: callback
		};
		
		this.activeAnimations.push(animation);
		return animation.id;
	}

	/**
	 * Update all active animations
	 * @param {Number} currentTime - Current timestamp
	 */
	update(currentTime) {
		const completedAnimations = [];
		
		for (let i = 0; i < this.activeAnimations.length; i++) {
			const anim = this.activeAnimations[i];
			const elapsed = currentTime - anim.startTime;
			anim.progress = Math.min(1, elapsed / anim.duration);
			
			if (anim.progress >= 1) {
				completedAnimations.push(i);
				if (anim.callback) {
					anim.callback();
				}
			}
		}
		
		// Remove completed animations (reverse order to maintain indices)
		for (let i = completedAnimations.length - 1; i >= 0; i--) {
			this.activeAnimations.splice(completedAnimations[i], 1);
		}
	}

	/**
	 * Get all active animations
	 * @returns {Array} Active animations
	 */
	getActiveAnimations() {
		return this.activeAnimations;
	}

	/**
	 * Cancel an animation by ID
	 * @param {Number} id - Animation ID
	 */
	cancelAnimation(id) {
		const index = this.activeAnimations.findIndex(a => a.id === id);
		if (index !== -1) {
			this.activeAnimations.splice(index, 1);
		}
	}

	/**
	 * Cancel all animations
	 */
	cancelAll() {
		this.activeAnimations = [];
	}

	/**
	 * Check if any animations are active
	 * @returns {Boolean}
	 */
	hasActiveAnimations() {
		return this.activeAnimations.length > 0;
	}

	/**
	 * Easing function - ease out cubic
	 * @param {Number} t - Progress (0-1)
	 * @returns {Number} Eased value
	 */
	easeOutCubic(t) {
		return 1 - Math.pow(1 - t, 3);
	}

	/**
	 * Easing function - ease in out cubic
	 * @param {Number} t - Progress (0-1)
	 * @returns {Number} Eased value
	 */
	easeInOutCubic(t) {
		return t < 0.5 
			? 4 * t * t * t 
			: 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	/**
	 * Easing function - bounce
	 * @param {Number} t - Progress (0-1)
	 * @returns {Number} Eased value
	 */
	easeBounce(t) {
		const n1 = 7.5625;
		const d1 = 2.75;
		
		if (t < 1 / d1) {
			return n1 * t * t;
		} else if (t < 2 / d1) {
			return n1 * (t -= 1.5 / d1) * t + 0.75;
		} else if (t < 2.5 / d1) {
			return n1 * (t -= 2.25 / d1) * t + 0.9375;
		} else {
			return n1 * (t -= 2.625 / d1) * t + 0.984375;
		}
	}
}

// Export singleton instance
const AnimationManager = new AnimationManagerClass();
export default AnimationManager;
