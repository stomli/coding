/**
 * ParticleSystem.js
 * 
 * Description: Particle effects for ball clearing, explosions, and celebrations
 * 
 * Dependencies: None
 * 
 * Exports: ParticleSystem singleton
 */

/**
 * Particle class
 */
class Particle {
	constructor(x, y, vx, vy, color, lifetime) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.color = color;
		this.lifetime = lifetime;
		this.age = 0;
		this.size = Math.random() * 3 + 2;
		this.alpha = 1;
	}
	
	update(deltaTime) {
		this.x += this.vx * deltaTime;
		this.y += this.vy * deltaTime;
		this.vy += 0.0005 * deltaTime; // Gravity
		this.age += deltaTime;
		this.alpha = 1 - (this.age / this.lifetime);
		return this.age < this.lifetime;
	}
	
	render(ctx) {
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
}

/**
 * ParticleSystem class
 */
class ParticleSystemClass {
	constructor() {
		this.particles = [];
		this.overlayParticles = []; // Particles that render above overlays
		this.overlayCanvas = null;
		this.overlayCtx = null;
	}
	
	/**
	 * Initialize overlay canvas for particles that need to appear above UI
	 */
	initializeOverlay() {
		this.overlayCanvas = document.getElementById('particleCanvas');
		if (this.overlayCanvas) {
			this.overlayCtx = this.overlayCanvas.getContext('2d');
			// Match size to window
			this.resizeOverlay();
			window.addEventListener('resize', () => this.resizeOverlay());
		}
	}
	
	/**
	 * Resize overlay canvas to match window
	 */
	resizeOverlay() {
		if (this.overlayCanvas) {
			this.overlayCanvas.width = window.innerWidth;
			this.overlayCanvas.height = window.innerHeight;
		}
	}
	
	/**
	 * Show overlay canvas
	 */
	showOverlay() {
		if (this.overlayCanvas) {
			this.overlayCanvas.classList.add('active');
		}
	}
	
	/**
	 * Hide overlay canvas
	 */
	hideOverlay() {
		if (this.overlayCanvas) {
			this.overlayCanvas.classList.remove('active');
		}
	}

	/**
	 * Create an explosion of particles
	 * @param {Number} x - X position
	 * @param {Number} y - Y position
	 * @param {String} color - Particle color
	 * @param {Number} count - Number of particles
	 */
	createExplosion(x, y, color = '#00ff88', count = 20) {
		for (let i = 0; i < count; i++) {
			const angle = (Math.PI * 2 * i) / count;
			const speed = Math.random() * 0.3 + 0.2;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed;
			const lifetime = Math.random() * 500 + 500; // 500-1000ms
			
			this.particles.push(new Particle(x, y, vx, vy, color, lifetime));
		}
	}

	/**
	 * Create a burst of particles
	 * @param {Number} x - X position
	 * @param {Number} y - Y position
	 * @param {Array} colors - Array of colors to use
	 * @param {Number} count - Number of particles
	 */
	createBurst(x, y, colors = ['#00ff88', '#00ccff', '#ffffff'], count = 15) {
		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 0.4 + 0.1;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed - 0.2; // Upward bias
			const color = colors[Math.floor(Math.random() * colors.length)];
			const lifetime = Math.random() * 600 + 400; // 400-1000ms
			
			this.particles.push(new Particle(x, y, vx, vy, color, lifetime));
		}
	}

	/**
	 * Create confetti particles
	 * @param {Number} x - X position
	 * @param {Number} y - Y position
	 * @param {Number} count - Number of particles
	 * @param {Boolean} overlay - Whether to render on overlay canvas (above UI)
	 */
	createConfetti(x, y, count = 30, overlay = false) {
		const colors = ['#00ff88', '#00ccff', '#FFD700', '#FF69B4', '#FF8800'];
		const targetArray = overlay ? this.overlayParticles : this.particles;
		
		for (let i = 0; i < count; i++) {
			const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3; // Upward cone
			const speed = Math.random() * 0.6 + 0.3;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed;
			const color = colors[Math.floor(Math.random() * colors.length)];
			const lifetime = Math.random() * 1000 + 1000; // 1000-2000ms
			
			targetArray.push(new Particle(x, y, vx, vy, color, lifetime));
		}
		
		if (overlay) {
			this.showOverlay();
		}
	}

	/**
	 * Create a trail of particles
	 * @param {Number} x - X position
	 * @param {Number} y - Y position
	 * @param {String} color - Particle color
	 */
	createTrail(x, y, color = '#00ff88') {
		const count = 3;
		for (let i = 0; i < count; i++) {
			const vx = (Math.random() - 0.5) * 0.1;
			const vy = Math.random() * 0.1;
			const lifetime = Math.random() * 300 + 200; // 200-500ms
			
			this.particles.push(new Particle(x, y, vx, vy, color, lifetime));
		}
	}

	/**
	 * Update all particles
	 * @param {Number} deltaTime - Time elapsed in ms
	 */
	update(deltaTime) {
		this.particles = this.particles.filter(particle => particle.update(deltaTime));
		this.overlayParticles = this.overlayParticles.filter(particle => particle.update(deltaTime));
		
		// Hide overlay canvas when no overlay particles remain
		if (this.overlayParticles.length === 0) {
			this.hideOverlay();
		}
	}

	/**
	 * Render all particles
	 * @param {CanvasRenderingContext2D} ctx - Canvas context
	 */
	render(ctx) {
		// Render normal particles on game canvas
		for (const particle of this.particles) {
			particle.render(ctx);
		}
		
		// Render overlay particles on overlay canvas
		if (this.overlayCtx && this.overlayParticles.length > 0) {
			// Clear overlay canvas
			this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
			
			for (const particle of this.overlayParticles) {
				particle.render(this.overlayCtx);
			}
		}
	}

	/**
	 * Clear all particles
	 */
	clear() {
		this.particles = [];
	}

	/**
	 * Get number of active particles
	 * @returns {Number}
	 */
	getParticleCount() {
		return this.particles.length;
	}
}

// Export singleton instance
const ParticleSystem = new ParticleSystemClass();
export default ParticleSystem;
