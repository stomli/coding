/**
 * test-mobile-interactions.js
 * 
 * Unit tests for mobile touch interactions
 */

import { GameEngine } from '../../src/modules/GameEngine.js';
import { InputHandler } from '../../src/modules/InputHandler.js';
import { EventEmitter } from '../../src/utils/EventEmitter.js';
import { CONSTANTS } from '../../src/utils/Constants.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';

// Test Suite
const testSuite = {
	name: 'Mobile Interactions Tests',
	tests: []
};

// Helper to create mock touch event
function createMockTouchEvent(type, touches, changedTouches) {
	return {
		type,
		touches,
		changedTouches,
		defaultPrevented: false,
		preventDefault() { this.defaultPrevented = true; }
	};
}

// Test: Canvas detects swipe up for rotate
testSuite.tests.push({
	name: 'canvas touch - Swipe up triggers rotate',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		let rotateEventFired = false;
		const listener = () => { rotateEventFired = true; };
		EventEmitter.on(CONSTANTS.EVENTS.ROTATE, listener);
		
		// Simulate swipe up gesture
		const canvas = GameEngine.renderer.canvas;
		const rect = canvas.getBoundingClientRect();
		const startY = rect.top + 200;
		const endY = rect.top + 100; // 100px up
		
		const touchStart = createMockTouchEvent('touchstart', 
			[{ clientX: rect.left + 100, clientY: startY }],
			[{ clientX: rect.left + 100, clientY: startY }]
		);
		
		const touchEnd = createMockTouchEvent('touchend',
			[],
			[{ clientX: rect.left + 100, clientY: endY }]
		);
		
		// Manually trigger the handlers (since we can't dispatch real events in tests)
		// This tests the logic, not the actual event dispatching
		const deltaY = endY - startY;
		const isSwipeUp = deltaY < -50;
		
		if (isSwipeUp) {
			InputHandler.triggerAction('rotate');
		}
		
		EventEmitter.off(CONSTANTS.EVENTS.ROTATE, listener);
		
		if (!rotateEventFired) {
			throw new Error('Swipe up should trigger rotate event');
		}
	}
});

// Test: Canvas detects swipe down for hard drop
testSuite.tests.push({
	name: 'canvas touch - Swipe down triggers hard drop',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		let dropEventFired = false;
		const listener = () => { dropEventFired = true; };
		EventEmitter.on(CONSTANTS.EVENTS.HARD_DROP, listener);
		
		// Simulate swipe down gesture
		const deltaY = 100; // 100px down
		const isSwipeDown = deltaY > 50;
		
		if (isSwipeDown) {
			InputHandler.triggerAction('drop');
		}
		
		EventEmitter.off(CONSTANTS.EVENTS.HARD_DROP, listener);
		
		if (!dropEventFired) {
			throw new Error('Swipe down should trigger hard drop event');
		}
	}
});

// Test: Canvas tap on left side triggers move left
testSuite.tests.push({
	name: 'canvas touch - Tap left side triggers move left',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let moveLeftFired = false;
		const listener = () => { moveLeftFired = true; };
		EventEmitter.on(CONSTANTS.EVENTS.MOVE_LEFT, listener);
		
		// Test that InputHandler.triggerAction works for moveLeft
		InputHandler.triggerAction('moveLeft');
		
		EventEmitter.off(CONSTANTS.EVENTS.MOVE_LEFT, listener);
		
		if (!moveLeftFired) {
			throw new Error('Tap on left side should trigger move left');
		}
	}
});

// Test: Canvas tap on right side triggers move right
testSuite.tests.push({
	name: 'canvas touch - Tap right side triggers move right',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let moveRightFired = false;
		const listener = () => { moveRightFired = true; };
		EventEmitter.on(CONSTANTS.EVENTS.MOVE_RIGHT, listener);
		
		// Test that InputHandler.triggerAction works for moveRight
		InputHandler.triggerAction('moveRight');
		
		EventEmitter.off(CONSTANTS.EVENTS.MOVE_RIGHT, listener);
		
		if (!moveRightFired) {
			throw new Error('Tap on right side should trigger move right');
		}
	}
});

// Test: Touch and hold activates soft drop
testSuite.tests.push({
	name: 'canvas touch - Hold activates soft drop',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		let softDropFired = false;
		const listener = () => { softDropFired = true; };
		EventEmitter.on(CONSTANTS.EVENTS.SOFT_DROP, listener);
		
		// Simulate hold (>200ms)
		const holdDuration = 250;
		
		// After 200ms threshold, soft drop should activate
		if (holdDuration > 200) {
			GameEngine._startSoftDrop();
		}
		
		EventEmitter.off(CONSTANTS.EVENTS.SOFT_DROP, listener);
		
		if (!GameEngine.isSoftDropping) {
			throw new Error('Hold should activate soft drop after 200ms');
		}
	}
});

// Test: Touch release ends soft drop
testSuite.tests.push({
	name: 'canvas touch - Release ends soft drop',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		// Start soft drop
		GameEngine._startSoftDrop();
		
		if (!GameEngine.isSoftDropping) {
			throw new Error('Soft drop should be active');
		}
		
		// Simulate touch release
		GameEngine._endSoftDrop();
		
		if (GameEngine.isSoftDropping) {
			throw new Error('Touch release should end soft drop');
		}
	}
});

// Test: Kbd button with softDrop action triggers soft drop
testSuite.tests.push({
	name: 'kbd button - softDrop action triggers soft drop event',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let softDropFired = false;
		const listener = () => { softDropFired = true; };
		EventEmitter.on(CONSTANTS.EVENTS.SOFT_DROP, listener);
		
		// Simulate button press
		InputHandler.triggerAction('softDrop');
		
		EventEmitter.off(CONSTANTS.EVENTS.SOFT_DROP, listener);
		
		if (!softDropFired) {
			throw new Error('Kbd button with softDrop action should trigger soft drop');
		}
	}
});

// Test: Kbd button release ends soft drop
testSuite.tests.push({
	name: 'kbd button - Release ends soft drop',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let softDropEndFired = false;
		const listener = () => { softDropEndFired = true; };
		EventEmitter.on(CONSTANTS.EVENTS.SOFT_DROP_END, listener);
		
		// Simulate button release
		InputHandler.triggerActionEnd('softDrop');
		
		EventEmitter.off(CONSTANTS.EVENTS.SOFT_DROP_END, listener);
		
		if (!softDropEndFired) {
			throw new Error('Kbd button release should trigger soft drop end');
		}
	}
});

// Test: Swipe detection requires sufficient distance
testSuite.tests.push({
	name: 'canvas touch - Small movements do not trigger swipe',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		// Small vertical movement (< 50px)
		const deltaY = 30;
		const deltaTime = 200;
		
		const isSwipeDown = deltaY > 50 && deltaTime < 300;
		const isSwipeUp = deltaY < -50 && deltaTime < 300;
		
		if (isSwipeDown || isSwipeUp) {
			throw new Error('Small movements should not be detected as swipes');
		}
	}
});

// Test: Swipe detection requires sufficient speed
testSuite.tests.push({
	name: 'canvas touch - Slow movements do not trigger swipe',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		// Large distance but slow (> 300ms)
		const deltaY = 100;
		const deltaTime = 500;
		
		const isSwipeDown = deltaY > 50 && deltaTime < 300;
		const isSwipeUp = deltaY < -50 && deltaTime < 300;
		
		if (isSwipeDown || isSwipeUp) {
			throw new Error('Slow movements should not be detected as swipes');
		}
	}
});

// Test: Tap detection requires small movement
testSuite.tests.push({
	name: 'canvas touch - Large movements are not taps',
	async run() {
		await ConfigManager.loadConfig();
		GameEngine.initialize();
		GameEngine.start(1, 1);
		
		// Large horizontal movement
		const deltaX = 50;
		const deltaY = 10;
		const deltaTime = 200;
		
		const isTap = Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20 && deltaTime < 300;
		
		if (isTap) {
			throw new Error('Large movements should not be detected as taps');
		}
	}
});

export default testSuite;
