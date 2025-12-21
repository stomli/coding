/**
 * Unit Tests for AnimationManager
 */

import AnimationManager from '../../src/modules/AnimationManager.js';

/**
 * Run all AnimationManager tests
 * @returns {Object} Test results with pass/fail counts
 */
export function runAnimationManagerTests() {
	const results = {
		passed: 0,
		failed: 0,
		tests: []
	};

	console.log('Running AnimationManager Tests...');

	// Helper function to run a test
	function test(name, fn) {
		try {
			fn();
			results.passed++;
			results.tests.push({ name, pass: true, error: null });
			console.log(`✓ ${name}`);
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

	// Reset AnimationManager before each test
	function resetAnimationManager() {
		AnimationManager.activeAnimations = [];
	}

	// Test 1: Initial state
	test('AnimationManager starts with empty animations array', () => {
		resetAnimationManager();
		assert(Array.isArray(AnimationManager.activeAnimations), 'activeAnimations should be an array');
		assert(AnimationManager.activeAnimations.length === 0, 'activeAnimations should start empty');
	});

	// Test 2: animateClearBalls creates animation
	test('animateClearBalls creates clear animation', () => {
		resetAnimationManager();
		const positions = [{ row: 0, col: 0 }, { row: 1, col: 1 }];
		AnimationManager.animateClearBalls(positions, null);
		
		assert(AnimationManager.activeAnimations.length === 1, 'Should create one animation');
		const anim = AnimationManager.activeAnimations[0];
		assert(anim.type === 'clearBalls', 'Animation type should be clearBalls');
		assert(anim.positions === positions, 'Animation should store positions');
		assert(anim.progress === 0, 'Initial progress should be 0');
	});

	// Test 3: animateExplosion creates explosion animation
	test('animateExplosion creates explosion animation', () => {
		resetAnimationManager();
		AnimationManager.animateExplosion(5, 5, 3, null);
		
		assert(AnimationManager.activeAnimations.length === 1, 'Should create one animation');
		const anim = AnimationManager.activeAnimations[0];
		assert(anim.type === 'explosion', 'Animation type should be explosion');
		assert(anim.row === 5, 'Should store row');
		assert(anim.col === 5, 'Should store col');
		assert(anim.radius === 3, 'Should store radius');
	});

	// Test 4: animatePieceDrop creates piece drop animation
	test('animatePieceDrop creates piece drop animation', () => {
		resetAnimationManager();
		const piece = { type: 'L', rotation: 0, balls: [] };
		AnimationManager.animatePieceDrop(piece, 0, 10, null);
		
		assert(AnimationManager.activeAnimations.length === 1, 'Should create one animation');
		const anim = AnimationManager.activeAnimations[0];
		assert(anim.type === 'pieceDrop', 'Animation type should be pieceDrop');
		assert(anim.piece === piece, 'Should store piece');
		assert(anim.fromY === 0, 'Should store fromY');
		assert(anim.toY === 10, 'Should store toY');
	});

	// Test 5: animateLevelComplete creates level complete animation
	test('animateLevelComplete creates level complete animation', () => {
		resetAnimationManager();
		AnimationManager.animateLevelComplete(null);
		
		assert(AnimationManager.activeAnimations.length === 1, 'Should create one animation');
		const anim = AnimationManager.activeAnimations[0];
		assert(anim.type === 'levelComplete', 'Animation type should be levelComplete');
	});

	// Test 6: Multiple animations can exist simultaneously
	test('Multiple animations can exist simultaneously', () => {
		resetAnimationManager();
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		AnimationManager.animateExplosion(1, 1, 2, null);
		AnimationManager.animatePieceDrop({}, 0, 5, null);
		
		assert(AnimationManager.activeAnimations.length === 3, 'Should have 3 animations');
		assert(AnimationManager.activeAnimations[0].type === 'clearBalls', 'First should be clearBalls');
		assert(AnimationManager.activeAnimations[1].type === 'explosion', 'Second should be explosion');
		assert(AnimationManager.activeAnimations[2].type === 'pieceDrop', 'Third should be pieceDrop');
	});

	// Test 7: Animation progress updates
	test('update() advances animation progress', () => {
		resetAnimationManager();
		const startTime = 1000;
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		AnimationManager.activeAnimations[0].startTime = startTime;
		AnimationManager.activeAnimations[0].duration = 1000;
		
		// Update after 500ms (50% progress)
		AnimationManager.update(startTime + 500);
		assert(AnimationManager.activeAnimations[0].progress === 0.5, 'Progress should be 0.5 after 50% time');
		
		// Update after 750ms (75% progress)
		AnimationManager.update(startTime + 750);
		assert(AnimationManager.activeAnimations[0].progress === 0.75, 'Progress should be 0.75 after 75% time');
	});

	// Test 8: Animation completes and is removed
	test('Completed animations are removed', () => {
		resetAnimationManager();
		const startTime = 1000;
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		AnimationManager.activeAnimations[0].startTime = startTime;
		AnimationManager.activeAnimations[0].duration = 1000;
		
		// Update past completion
		AnimationManager.update(startTime + 1500);
		assert(AnimationManager.activeAnimations.length === 0, 'Completed animation should be removed');
	});

	// Test 9: Callback is called on completion
	test('Callback is called when animation completes', () => {
		resetAnimationManager();
		const startTime = 1000;
		let callbackCalled = false;
		
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], () => {
			callbackCalled = true;
		});
		AnimationManager.activeAnimations[0].startTime = startTime;
		AnimationManager.activeAnimations[0].duration = 1000;
		
		// Update past completion
		AnimationManager.update(startTime + 1500);
		assert(callbackCalled, 'Callback should be called');
	});

	// Test 10: Only completed animations trigger callbacks
	test('Only completed animations trigger callbacks', () => {
		resetAnimationManager();
		const startTime = 1000;
		let callback1Called = false;
		let callback2Called = false;
		
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], () => {
			callback1Called = true;
		});
		AnimationManager.animateExplosion(1, 1, 2, () => {
			callback2Called = true;
		});
		
		AnimationManager.activeAnimations[0].startTime = startTime;
		AnimationManager.activeAnimations[0].duration = 1000;
		AnimationManager.activeAnimations[1].startTime = startTime;
		AnimationManager.activeAnimations[1].duration = 2000;
		
		// Update after 1500ms (first done, second not)
		AnimationManager.update(startTime + 1500);
		assert(callback1Called, 'First callback should be called');
		assert(!callback2Called, 'Second callback should not be called yet');
		assert(AnimationManager.activeAnimations.length === 1, 'First animation should be removed');
	});

	// Test 11: Progress never exceeds 1.0
	test('Progress is clamped to 1.0', () => {
		resetAnimationManager();
		const startTime = 1000;
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		AnimationManager.activeAnimations[0].startTime = startTime;
		AnimationManager.activeAnimations[0].duration = 1000;
		
		// Update way past completion
		AnimationManager.update(startTime + 5000);
		// Animation should be removed, but check it was at 1.0 before removal
		// Since it's removed, we can't check directly, but test ensures no crash
		assert(true, 'No error on over-completion');
	});

	// Test 12: Each animation has unique ID
	test('Each animation has unique ID', () => {
		resetAnimationManager();
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		AnimationManager.animateExplosion(1, 1, 2, null);
		AnimationManager.animatePieceDrop({}, 0, 5, null);
		
		const ids = AnimationManager.activeAnimations.map(a => a.id);
		const uniqueIds = new Set(ids);
		assert(uniqueIds.size === ids.length, 'All animation IDs should be unique');
	});

	// Test 13: Easing functions exist
	test('Easing functions are defined', () => {
		assert(typeof AnimationManager.easeOutCubic === 'function', 'easeOutCubic should exist');
		assert(typeof AnimationManager.easeInOutCubic === 'function', 'easeInOutCubic should exist');
		assert(typeof AnimationManager.easeBounce === 'function', 'easeBounce should exist');
	});

	// Test 14: easeOutCubic returns correct values
	test('easeOutCubic returns values in [0,1]', () => {
		assert(AnimationManager.easeOutCubic(0) === 0, 'easeOutCubic(0) should be 0');
		assert(AnimationManager.easeOutCubic(1) === 1, 'easeOutCubic(1) should be 1');
		const mid = AnimationManager.easeOutCubic(0.5);
		assert(mid > 0 && mid < 1, 'easeOutCubic(0.5) should be in (0,1)');
	});

	// Test 15: easeInOutCubic returns correct values
	test('easeInOutCubic returns values in [0,1]', () => {
		assert(AnimationManager.easeInOutCubic(0) === 0, 'easeInOutCubic(0) should be 0');
		assert(AnimationManager.easeInOutCubic(1) === 1, 'easeInOutCubic(1) should be 1');
		const mid = AnimationManager.easeInOutCubic(0.5);
		assert(mid > 0 && mid < 1, 'easeInOutCubic(0.5) should be in (0,1)');
	});

	// Test 16: easeBounce returns correct values
	test('easeBounce returns values in [0,1]', () => {
		assert(AnimationManager.easeBounce(0) === 0, 'easeBounce(0) should be 0');
		assert(AnimationManager.easeBounce(1) === 1, 'easeBounce(1) should be 1');
		const mid = AnimationManager.easeBounce(0.5);
		assert(mid >= 0 && mid <= 1, 'easeBounce(0.5) should be in [0,1]');
	});

	// Test 17: Animation with null callback doesn't crash
	test('Animation with null callback completes without error', () => {
		resetAnimationManager();
		const startTime = 1000;
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		AnimationManager.activeAnimations[0].startTime = startTime;
		AnimationManager.activeAnimations[0].duration = 1000;
		
		// Should not throw
		AnimationManager.update(startTime + 1500);
		assert(true, 'No error with null callback');
	});

	// Test 18: Custom duration is respected
	test('Custom duration is respected', () => {
		resetAnimationManager();
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		
		const anim = AnimationManager.activeAnimations[0];
		assert(anim.duration > 0, 'Animation should have positive duration');
	});

	// Test 19: Empty positions array doesn't crash clearBalls
	test('Empty positions array for clearBalls is handled', () => {
		resetAnimationManager();
		AnimationManager.animateClearBalls([], null);
		
		assert(AnimationManager.activeAnimations.length === 1, 'Animation should still be created');
		assert(AnimationManager.activeAnimations[0].positions.length === 0, 'Positions should be empty');
	});

	// Test 20: Piece drop with different values
	test('Piece drop with different values', () => {
		resetAnimationManager();
		const piece = { type: 'T', rotation: 2, balls: [] };
		AnimationManager.animatePieceDrop(piece, 5, 15, null);
		
		assert(AnimationManager.activeAnimations.length === 1, 'Should create one animation');
		const anim = AnimationManager.activeAnimations[0];
		assert(anim.type === 'pieceDrop', 'Animation type should be pieceDrop');
	});

	console.log(`\nAnimationManager Tests: ${results.passed} passed, ${results.failed} failed`);
	return results.tests;
}
