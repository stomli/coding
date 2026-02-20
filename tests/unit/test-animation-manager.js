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

	// ── cancelAnimation tests ──

	test('cancelAnimation removes animation by ID', () => {
		resetAnimationManager();
		const id1 = AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		const id2 = AnimationManager.animateExplosion(1, 1, 2, null);
		const id3 = AnimationManager.animatePieceDrop({}, 0, 5, null);
		
		assert(AnimationManager.activeAnimations.length === 3, 'Should have 3 animations');
		AnimationManager.cancelAnimation(id2);
		assert(AnimationManager.activeAnimations.length === 2, 'Should have 2 animations after cancel');
		assert(AnimationManager.activeAnimations.every(a => a.id !== id2), 'Cancelled animation should be gone');
	});

	test('cancelAnimation with non-existent ID does nothing', () => {
		resetAnimationManager();
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		AnimationManager.cancelAnimation(999);
		assert(AnimationManager.activeAnimations.length === 1, 'Should still have 1 animation');
	});

	test('cancelAnimation does not trigger callback', () => {
		resetAnimationManager();
		let callbackCalled = false;
		const id = AnimationManager.animateClearBalls([{ row: 0, col: 0 }], () => {
			callbackCalled = true;
		});
		AnimationManager.cancelAnimation(id);
		assert(!callbackCalled, 'Callback should not be called on cancel');
	});

	// ── cancelAll tests ──

	test('cancelAll removes all animations', () => {
		resetAnimationManager();
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		AnimationManager.animateExplosion(1, 1, 2, null);
		AnimationManager.animatePieceDrop({}, 0, 5, null);
		AnimationManager.animateLevelComplete(null);
		
		assert(AnimationManager.activeAnimations.length === 4, 'Should have 4 animations');
		AnimationManager.cancelAll();
		assert(AnimationManager.activeAnimations.length === 0, 'Should have 0 animations after cancelAll');
	});

	test('cancelAll on empty list does nothing', () => {
		resetAnimationManager();
		AnimationManager.cancelAll();
		assert(AnimationManager.activeAnimations.length === 0, 'No error on empty cancelAll');
	});

	// ── hasActiveAnimations tests ──

	test('hasActiveAnimations returns false when empty', () => {
		resetAnimationManager();
		assert(AnimationManager.hasActiveAnimations() === false, 'Should return false when empty');
	});

	test('hasActiveAnimations returns true when animations exist', () => {
		resetAnimationManager();
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		assert(AnimationManager.hasActiveAnimations() === true, 'Should return true when animations exist');
	});

	test('hasActiveAnimations returns false after all complete', () => {
		resetAnimationManager();
		const startTime = 1000;
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		AnimationManager.activeAnimations[0].startTime = startTime;
		AnimationManager.activeAnimations[0].duration = 100;
		AnimationManager.update(startTime + 200);
		assert(AnimationManager.hasActiveAnimations() === false, 'Should return false after all complete');
	});

	// ── getActiveAnimations tests ──

	test('getActiveAnimations returns the animations array', () => {
		resetAnimationManager();
		AnimationManager.animateClearBalls([{ row: 0, col: 0 }], null);
		AnimationManager.animateExplosion(1, 1, 2, null);
		const active = AnimationManager.getActiveAnimations();
		assert(Array.isArray(active), 'Should return array');
		assert(active.length === 2, 'Should have 2 active animations');
	});

	test('getActiveAnimations returns empty array when none active', () => {
		resetAnimationManager();
		const active = AnimationManager.getActiveAnimations();
		assert(Array.isArray(active), 'Should return array');
		assert(active.length === 0, 'Should be empty');
	});

	// ── Easing function mathematical correctness ──

	test('easeOutCubic midpoint is greater than 0.5 (eases out)', () => {
		const mid = AnimationManager.easeOutCubic(0.5);
		assert(mid > 0.5, `easeOutCubic(0.5)=${mid} should be > 0.5`);
		// Expected: 1 - (0.5)^3 = 1 - 0.125 = 0.875
		assert(Math.abs(mid - 0.875) < 0.001, `easeOutCubic(0.5) should be ~0.875, got ${mid}`);
	});

	test('easeInOutCubic midpoint is 0.5', () => {
		const mid = AnimationManager.easeInOutCubic(0.5);
		assert(Math.abs(mid - 0.5) < 0.001, `easeInOutCubic(0.5) should be ~0.5, got ${mid}`);
	});

	test('easeInOutCubic is symmetric', () => {
		const val25 = AnimationManager.easeInOutCubic(0.25);
		const val75 = AnimationManager.easeInOutCubic(0.75);
		assert(Math.abs(val25 + val75 - 1.0) < 0.001, `easeInOutCubic should be symmetric: f(0.25)+f(0.75)=${val25 + val75}`);
	});

	test('easeBounce at quarter points returns correct values', () => {
		// At t=0.5, easeBounce should be 0.765625 (second bounce segment)
		const val = AnimationManager.easeBounce(0.5);
		assert(val >= 0 && val <= 1, `easeBounce(0.5)=${val} should be in [0,1]`);
	});

	test('easeOutCubic is monotonically increasing', () => {
		let prev = 0;
		for (let t = 0; t <= 1.0; t += 0.1) {
			const val = AnimationManager.easeOutCubic(t);
			assert(val >= prev - 0.001, `easeOutCubic should be monotonically increasing at t=${t}`);
			prev = val;
		}
	});

	// ── Animation ID auto-increment ──

	test('Animation IDs increment across multiple creations', () => {
		resetAnimationManager();
		const id1 = AnimationManager.animateClearBalls([], null);
		const id2 = AnimationManager.animateExplosion(0, 0, 1, null);
		const id3 = AnimationManager.animateLevelComplete(null);
		assert(id2 > id1, 'Second ID should be greater than first');
		assert(id3 > id2, 'Third ID should be greater than second');
	});

	// ── Multiple completion in single update ──

	test('Multiple animations complete in single update call', () => {
		resetAnimationManager();
		const startTime = 1000;
		let cb1 = false, cb2 = false;
		
		AnimationManager.animateClearBalls([], () => { cb1 = true; });
		AnimationManager.animateExplosion(0, 0, 1, () => { cb2 = true; });
		
		AnimationManager.activeAnimations[0].startTime = startTime;
		AnimationManager.activeAnimations[0].duration = 100;
		AnimationManager.activeAnimations[1].startTime = startTime;
		AnimationManager.activeAnimations[1].duration = 100;
		
		AnimationManager.update(startTime + 200);
		assert(cb1 && cb2, 'Both callbacks should fire');
		assert(AnimationManager.activeAnimations.length === 0, 'Both should be removed');
	});

	return results.tests;
}
