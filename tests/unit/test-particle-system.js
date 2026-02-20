/**
 * Unit Tests for ParticleSystem
 */

import ParticleSystem from '../../src/modules/ParticleSystem.js';

/**
 * Run all ParticleSystem tests
 * @returns {Object} Test results with pass/fail counts
 */
export function runParticleSystemTests() {
	const results = {
		passed: 0,
		failed: 0,
		tests: []
	};

	// Helper function to run a test
	function test(name, fn) {
		try {
			fn();
			results.passed++;
			results.tests.push({ name, pass: true, error: null });
		} catch (error) {
			results.failed++;
			results.tests.push({ name, pass: false, error: error.message });
			console.error(`✗ ${name}: ${error.message}`);
		}
	}

	// Helper function for assertions
	function assert(condition, message) {
		if (!condition) {
			throw new Error(message || 'Assertion failed');
		}
	}

	// Reset ParticleSystem before each test
	function resetParticleSystem() {
		ParticleSystem.particles = [];
	}

	// Test 1: Initial state
	test('ParticleSystem starts with empty particles array', () => {
		resetParticleSystem();
		assert(Array.isArray(ParticleSystem.particles), 'particles should be an array');
		assert(ParticleSystem.particles.length === 0, 'particles should start empty');
	});

	// Test 2: createExplosion creates particles
	test('createExplosion creates particles', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(100, 100, '#FF0000', 20);
		
		assert(ParticleSystem.particles.length === 20, 'Should create 20 particles');
		ParticleSystem.particles.forEach(p => {
			assert(p.x === 100, 'Particle x should be 100');
			assert(p.y === 100, 'Particle y should be 100');
			assert(p.color === '#FF0000', 'Particle color should be red');
		});
	});

	// Test 3: createBurst creates particles
	test('createBurst creates particles', () => {
		resetParticleSystem();
		ParticleSystem.createBurst(150, 150, ['#00FF00', '#0000FF'], 15);
		
		assert(ParticleSystem.particles.length === 15, 'Should create 15 particles');
		ParticleSystem.particles.forEach(p => {
			assert(p.x === 150, 'Particle x should be 150');
			assert(p.y === 150, 'Particle y should be 150');
			assert(p.color === '#00FF00' || p.color === '#0000FF', 'Particle color should be from palette');
		});
	});

	// Test 4: createConfetti creates particles
	test('createConfetti creates particles', () => {
		resetParticleSystem();
		ParticleSystem.createConfetti(200, 200, 25);
		
		assert(ParticleSystem.particles.length === 25, 'Should create 25 particles');
		ParticleSystem.particles.forEach(p => {
			assert(p.x === 200, 'Particle x should be 200');
			assert(p.y === 200, 'Particle y should be 200');
			assert(p.color, 'Particle should have a color');
		});
	});

	// Test 5: createTrail creates particles
	test('createTrail creates particles', () => {
		resetParticleSystem();
		ParticleSystem.createTrail(75, 75, '#FFFF00');
		
		assert(ParticleSystem.particles.length === 3, 'Should create 3 trail particles');
		ParticleSystem.particles.forEach(p => {
			assert(p.color === '#FFFF00', 'Particle color should be yellow');
		});
	});

	// Test 6: Particles have required properties
	test('Particles have all required properties', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 1);
		
		const p = ParticleSystem.particles[0];
		assert(typeof p.x === 'number', 'x should be a number');
		assert(typeof p.y === 'number', 'y should be a number');
		assert(typeof p.vx === 'number', 'vx should be a number');
		assert(typeof p.vy === 'number', 'vy should be a number');
		assert(typeof p.color === 'string', 'color should be a string');
		assert(typeof p.lifetime === 'number', 'lifetime should be a number');
		assert(typeof p.age === 'number', 'age should be a number');
		assert(typeof p.size === 'number', 'size should be a number');
		assert(typeof p.alpha === 'number', 'alpha should be a number');
	});

	// Test 7: Particle update increases age
	test('Particle update increases age', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 1);
		
		const p = ParticleSystem.particles[0];
		const initialAge = p.age;
		
		p.update(16); // ~1 frame at 60fps
		assert(p.age > initialAge, 'Age should increase after update');
	});

	// Test 8: Particle update changes position
	test('Particle update changes position due to velocity', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(100, 100, '#FFFFFF', 1);
		
		const p = ParticleSystem.particles[0];
		const initialX = p.x;
		const initialY = p.y;
		
		// Give it some velocity
		p.vx = 0.5;
		p.vy = 0.5;
		
		p.update(16);
		assert(p.x !== initialX || p.y !== initialY, 'Position should change with velocity');
	});

	// Test 9: Particle update applies gravity
	test('Particle update applies gravity to velocity', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 1);
		
		const p = ParticleSystem.particles[0];
		const initialVy = p.vy;
		
		p.update(16);
		assert(p.vy > initialVy, 'Vertical velocity should increase (gravity pulls down)');
	});

	// Test 10: Particle update returns false when age exceeds lifetime
	test('Particle update returns correct alive status', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 1);
		
		const p = ParticleSystem.particles[0];
		assert(p.age < p.lifetime, 'New particle should be alive (age < lifetime)');
		
		// Update returns false when particle is dead
		p.age = p.lifetime + 1;
		const isAlive = p.update(0);
		assert(!isAlive, 'update() should return false when age exceeds lifetime');
	});

	// Test 11: ParticleSystem update removes dead particles
	test('update() removes dead particles', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 5);
		
		// Age all particles to death
		ParticleSystem.particles.forEach(p => {
			p.age = p.lifetime + 1;
		});
		
		ParticleSystem.update(16);
		assert(ParticleSystem.particles.length === 0, 'Dead particles should be removed');
	});

	// Test 12: ParticleSystem update keeps alive particles
	test('update() keeps alive particles', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 5);
		
		ParticleSystem.update(16);
		assert(ParticleSystem.particles.length === 5, 'Alive particles should remain');
	});

	// Test 13: Multiple particle types can coexist
	test('Multiple particle types can coexist', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FF0000', 5);
		ParticleSystem.createBurst(100, 100, ['#00FF00'], 5);
		ParticleSystem.createConfetti(200, 200, 5);
		ParticleSystem.createTrail(300, 300, '#0000FF');
		
		const totalExpected = 5 + 5 + 5 + 3; // 18 particles (trail creates 3)
		assert(ParticleSystem.particles.length === totalExpected, `Should have ${totalExpected} particles`);
	});

	// Test 14: Explosion particles spread radially
	test('Explosion particles have radial velocity distribution', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 10);
		
		// Check that particles have different velocities (radial spread)
		const velocities = ParticleSystem.particles.map(p => Math.atan2(p.vy, p.vx));
		const uniqueAngles = new Set(velocities.map(v => v.toFixed(2)));
		
		assert(uniqueAngles.size > 1, 'Particles should have different angles');
	});

	// Test 15: Burst particles have upward bias
	test('Burst particles have upward velocity bias', () => {
		resetParticleSystem();
		ParticleSystem.createBurst(0, 0, ['#FFFFFF'], 20);
		
		// Most particles should have negative vy (upward)
		const upwardCount = ParticleSystem.particles.filter(p => p.vy < 0).length;
		assert(upwardCount > ParticleSystem.particles.length / 2, 'Most particles should move upward');
	});

	// Test 16: Confetti particles shoot upward in cone
	test('Confetti particles shoot upward', () => {
		resetParticleSystem();
		ParticleSystem.createConfetti(0, 0, 20);
		
		// All confetti should have upward velocity (negative vy)
		const allUpward = ParticleSystem.particles.every(p => p.vy < 0);
		assert(allUpward, 'All confetti should have upward velocity');
	});

	// Test 17: Trail particles are small and short-lived
	test('Trail particles are small and fade quickly', () => {
		resetParticleSystem();
		ParticleSystem.createTrail(0, 0, '#FFFFFF');
		
		ParticleSystem.particles.forEach(p => {
			assert(p.size <= 5, 'Trail particles should be small (<=5)');
			assert(p.lifetime <= 500, 'Trail particles should be short-lived (<=500ms)');
		});
	});

	// Test 18: Particle alpha decreases over time
	test('Particle alpha fades over lifetime', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 1);
		
		const p = ParticleSystem.particles[0];
		const initialAlpha = p.alpha;
		
		// Age particle to 50% of lifetime
		p.age = p.lifetime * 0.5;
		p.update(0);
		
		assert(p.alpha < initialAlpha, 'Alpha should decrease as particle ages');
	});

	// Test 19: render() doesn't crash with canvas context
	test('render() handles mock canvas context', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 5);
		
		// Mock canvas context
		const mockCtx = {
			save: () => {},
			restore: () => {},
			beginPath: () => {},
			arc: () => {},
			fill: () => {},
			globalAlpha: 1,
			fillStyle: '#FFFFFF'
		};
		
		// Should not throw
		ParticleSystem.render(mockCtx);
		assert(true, 'render() should handle mock context');
	});

	// Test 20: Zero particle count creates no particles
	test('Zero particle count creates no particles', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 0);
		
		assert(ParticleSystem.particles.length === 0, 'Should create 0 particles');
	});

	// Test 21: Large particle count is handled
	test('Large particle count is handled', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 1000);
		
		assert(ParticleSystem.particles.length === 1000, 'Should create 1000 particles');
	});

	// Test 22: Particles with different colors
	test('Burst uses multiple colors from palette', () => {
		resetParticleSystem();
		const colors = ['#FF0000', '#00FF00', '#0000FF'];
		ParticleSystem.createBurst(0, 0, colors, 30);
		
		const usedColors = new Set(ParticleSystem.particles.map(p => p.color));
		assert(usedColors.size > 1, 'Should use multiple colors from palette');
		
		usedColors.forEach(color => {
			assert(colors.includes(color), 'All colors should be from palette');
		});
	});

	// Test 23: Particle lifetime is positive
	test('Particle lifetime is positive', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 1);
		
		const p = ParticleSystem.particles[0];
		assert(p.lifetime > 0, 'Particle lifetime should be positive');
	});

	// Test 24: Particle size is positive
	test('Particle size is positive', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 1);
		
		const p = ParticleSystem.particles[0];
		assert(p.size > 0, 'Particle size should be positive');
	});

	// Test 25: Particle alpha is valid
	test('Particle alpha is valid', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 1);
		
		const p = ParticleSystem.particles[0];
		assert(p.alpha === 1, 'Initial alpha should be 1');
	});

	// ── clear() tests ──

	test('clear() removes all particles', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 10);
		ParticleSystem.createBurst(0, 0, ['#FF0000'], 5);
		assert(ParticleSystem.particles.length === 15, 'Should have 15 particles');
		
		ParticleSystem.clear();
		assert(ParticleSystem.particles.length === 0, 'clear() should remove all particles');
	});

	test('clear() on empty system does nothing', () => {
		resetParticleSystem();
		ParticleSystem.clear();
		assert(ParticleSystem.particles.length === 0, 'No error clearing empty system');
	});

	// ── getParticleCount() tests ──

	test('getParticleCount() returns 0 when empty', () => {
		resetParticleSystem();
		assert(ParticleSystem.getParticleCount() === 0, 'Should return 0 for empty system');
	});

	test('getParticleCount() returns correct count', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 7);
		assert(ParticleSystem.getParticleCount() === 7, 'Should return 7');
	});

	test('getParticleCount() updates after clear()', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 5);
		assert(ParticleSystem.getParticleCount() === 5, 'Should return 5');
		ParticleSystem.clear();
		assert(ParticleSystem.getParticleCount() === 0, 'Should return 0 after clear');
	});

	test('getParticleCount() reflects particles after update removes dead', () => {
		resetParticleSystem();
		ParticleSystem.createExplosion(0, 0, '#FFFFFF', 3);
		ParticleSystem.particles.forEach(p => { p.age = p.lifetime + 1; });
		ParticleSystem.update(16);
		assert(ParticleSystem.getParticleCount() === 0, 'Dead particles removed, count should be 0');
	});

	// ── createConfetti overlay param tests ──

	test('createConfetti with overlay=true adds to overlayParticles', () => {
		resetParticleSystem();
		ParticleSystem.overlayParticles = [];
		ParticleSystem.createConfetti(100, 100, 10, true);
		assert(ParticleSystem.overlayParticles.length === 10, 'Overlay particles should have 10');
		assert(ParticleSystem.particles.length === 0, 'Normal particles should be empty');
	});

	test('createConfetti with overlay=false adds to normal particles', () => {
		resetParticleSystem();
		ParticleSystem.overlayParticles = [];
		ParticleSystem.createConfetti(100, 100, 10, false);
		assert(ParticleSystem.particles.length === 10, 'Normal particles should have 10');
		assert(ParticleSystem.overlayParticles.length === 0, 'Overlay particles should be empty');
	});

	// ── update removes dead overlay particles ──

	test('update() removes dead overlay particles', () => {
		resetParticleSystem();
		ParticleSystem.overlayParticles = [];
		ParticleSystem.createConfetti(0, 0, 5, true);
		ParticleSystem.overlayParticles.forEach(p => { p.age = p.lifetime + 1; });
		ParticleSystem.update(16);
		assert(ParticleSystem.overlayParticles.length === 0, 'Dead overlay particles should be removed');
	});

	// ── Particle constructor defaults ──

	test('Particle starts with age 0 and alpha 1', () => {
		resetParticleSystem();
		ParticleSystem.createTrail(50, 50, '#AABBCC');
		const p = ParticleSystem.particles[0];
		assert(p.age === 0, 'Initial age should be 0');
		assert(p.alpha === 1, 'Initial alpha should be 1');
	});

	return results.tests;
}
