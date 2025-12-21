/**
 * FloatingText.js
 * 
 * Description: Manages floating text animations for score popups
 * 
 * Dependencies: None
 * 
 * Exports: FloatingTextManager class
 */

/**
 * Represents a single floating text element
 */
class FloatingText {
	constructor(text, x, y, duration = 1000, color = '#FFFFFF') {
		this.text = text;
		this.startX = x;
		this.startY = y;
		this.x = x;
		this.y = y;
		this.duration = duration;
		this.createdAt = Date.now();
		this.opacity = 1.0;
		this.color = color;
	}
	
	/**
	 * Update floating text position and opacity
	 * @returns {Boolean} True if still active, false if expired
	 */
	update() {
		const elapsed = Date.now() - this.createdAt;
		const progress = elapsed / this.duration;
		
		if (progress >= 1.0) {
			return false; // Expired
		}
		
		// Float upward (move up 50 pixels over duration)
		this.y = this.startY - (progress * 50);
		
		// Fade out (linear)
		this.opacity = 1.0 - progress;
		
		return true; // Still active
	}
}

/**
 * Manages all floating text elements
 */
class FloatingTextManager {
	constructor() {
		this.texts = [];
	}
	
	/**
	 * Add a new floating text
	 * @param {String} text - Text to display
	 * @param {Number} x - X position
	 * @param {Number} y - Y position
	 * @param {Number} duration - Animation duration in ms
	 * @param {String} color - Text color (default white)
	 */
	add(text, x, y, duration = 1000, color = '#FFFFFF') {
		this.texts.push(new FloatingText(text, x, y, duration, color));
	}
	
	/**
	 * Update all floating texts and remove expired ones
	 */
	update() {
		this.texts = this.texts.filter(text => text.update());
	}
	
	/**
	 * Render all floating texts
	 * @param {CanvasRenderingContext2D} ctx - Canvas context
	 */
	render(ctx) {
		for (const text of this.texts) {
			ctx.save();
			
			// Set text style
			ctx.font = 'bold 20px Arial';
			// Parse color for rgba
			const rgb = this._hexToRgb(text.color);
			ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${text.opacity})`;
			ctx.strokeStyle = `rgba(0, 0, 0, ${text.opacity})`;
			ctx.lineWidth = 3;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			
			// Draw text with outline
			ctx.strokeText(text.text, text.x, text.y);
			ctx.fillText(text.text, text.x, text.y);
			
			ctx.restore();
		}
	}
	
	/**
	 * Clear all floating texts
	 */
	clear() {
		this.texts = [];
	}
	
	/**
	 * Convert hex color to RGB
	 * @param {String} hex - Hex color code
	 * @returns {Object} RGB values
	 * @private
	 */
	_hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : { r: 255, g: 255, b: 255 };
	}
}

export default FloatingTextManager;
export { FloatingTextManager };
