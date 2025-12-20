/**
 * test-input-handler.js
 * 
 * Unit tests for InputHandler module (singleton)
 */

import { InputHandler } from '../../src/modules/InputHandler.js';
import { EventEmitter } from '../../src/utils/EventEmitter.js';
import { CONSTANTS } from '../../src/utils/Constants.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';

// Test Suite
const testSuite = {
	name: 'InputHandler Tests',
	tests: []
};

// Test: InputHandler exists as singleton
testSuite.tests.push({
	name: 'singleton - InputHandler exists',
	async run() {
		await ConfigManager.loadConfig();
		
		if (!InputHandler) {
			throw new Error('InputHandler singleton should exist');
		}
		
		if (typeof InputHandler.initialize !== 'function') {
			throw new Error('InputHandler should have initialize method');
		}
	}
});

// Test: InputHandler emits move-left event via EventEmitter
testSuite.tests.push({
	name: 'handleKeyDown - emits move-left on ArrowLeft',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let eventFired = false;
		const listener = () => { eventFired = true; };
		
		EventEmitter.on(CONSTANTS.EVENTS.MOVE_LEFT, listener);
		
		const event = new KeyboardEvent('keydown', { 
			code: 'ArrowLeft',
			bubbles: true,
			cancelable: true
		});
		
		InputHandler._handleKeyDown(event);
		
		EventEmitter.off(CONSTANTS.EVENTS.MOVE_LEFT, listener);
		
		if (!eventFired) {
			throw new Error('move-left event should be emitted');
		}
	}
});

// Test: InputHandler emits move-right event
testSuite.tests.push({
	name: 'handleKeyDown - emits move-right on ArrowRight',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let eventFired = false;
		const listener = () => { eventFired = true; };
		
		EventEmitter.on(CONSTANTS.EVENTS.MOVE_RIGHT, listener);
		
		const event = new KeyboardEvent('keydown', { 
			code: 'ArrowRight',
			bubbles: true,
			cancelable: true
		});
		
		InputHandler._handleKeyDown(event);
		
		EventEmitter.off(CONSTANTS.EVENTS.MOVE_RIGHT, listener);
		
		if (!eventFired) {
			throw new Error('move-right event should be emitted');
		}
	}
});

// Test: InputHandler emits rotate event
testSuite.tests.push({
	name: 'handleKeyDown - emits rotate on ArrowUp',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let eventFired = false;
		const listener = () => { eventFired = true; };
		
		EventEmitter.on(CONSTANTS.EVENTS.ROTATE, listener);
		
		const event = new KeyboardEvent('keydown', { 
			code: 'ArrowUp',
			bubbles: true,
			cancelable: true
		});
		
		InputHandler._handleKeyDown(event);
		
		EventEmitter.off(CONSTANTS.EVENTS.ROTATE, listener);
		
		if (!eventFired) {
			throw new Error('rotate event should be emitted');
		}
	}
});

// Test: InputHandler emits hard-drop event
testSuite.tests.push({
	name: 'handleKeyDown - emits hard-drop on ArrowDown',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let eventFired = false;
		const listener = () => { eventFired = true; };
		
		EventEmitter.on(CONSTANTS.EVENTS.HARD_DROP, listener);
		
		const event = new KeyboardEvent('keydown', { 
			code: 'ArrowDown',
			bubbles: true,
			cancelable: true
		});
		
		InputHandler._handleKeyDown(event);
		
		EventEmitter.off(CONSTANTS.EVENTS.HARD_DROP, listener);
		
		if (!eventFired) {
			throw new Error('hard-drop event should be emitted');
		}
	}
});

// Test: InputHandler emits pause event
testSuite.tests.push({
	name: 'handleKeyDown - emits pause on KeyP',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let eventFired = false;
		const listener = () => { eventFired = true; };
		
		EventEmitter.on(CONSTANTS.EVENTS.PAUSE, listener);
		
		const event = new KeyboardEvent('keydown', { 
			code: 'KeyP',
			bubbles: true,
			cancelable: true
		});
		
		InputHandler._handleKeyDown(event);
		
		EventEmitter.off(CONSTANTS.EVENTS.PAUSE, listener);
		
		if (!eventFired) {
			throw new Error('pause event should be emitted');
		}
	}
});

// Test: InputHandler emits restart event
testSuite.tests.push({
	name: 'handleKeyDown - emits restart on KeyR',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let eventFired = false;
		const listener = () => { eventFired = true; };
		
		EventEmitter.on(CONSTANTS.EVENTS.RESTART, listener);
		
		const event = new KeyboardEvent('keydown', { 
			code: 'KeyR',
			bubbles: true,
			cancelable: true
		});
		
		InputHandler._handleKeyDown(event);
		
		EventEmitter.off(CONSTANTS.EVENTS.RESTART, listener);
		
		if (!eventFired) {
			throw new Error('restart event should be emitted');
		}
	}
});

// Test: InputHandler prevents default on game keys
testSuite.tests.push({
	name: 'handleKeyDown - prevents default on arrow keys',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		const event = {
			code: 'ArrowLeft',
			defaultPrevented: false,
			repeat: false,
			preventDefault() { this.defaultPrevented = true; }
		};
		
		InputHandler._handleKeyDown(event);
		
		if (!event.defaultPrevented) {
			throw new Error('preventDefault should be called on arrow keys');
		}
	}
});

// Test: InputHandler ignores non-game keys
testSuite.tests.push({
	name: 'handleKeyDown - ignores non-game keys',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let eventFired = false;
		
		// Listen to all possible events
		const listener = () => { eventFired = true; };
		EventEmitter.on(CONSTANTS.EVENTS.MOVE_LEFT, listener);
		EventEmitter.on(CONSTANTS.EVENTS.MOVE_RIGHT, listener);
		EventEmitter.on(CONSTANTS.EVENTS.ROTATE, listener);
		EventEmitter.on(CONSTANTS.EVENTS.HARD_DROP, listener);
		EventEmitter.on(CONSTANTS.EVENTS.PAUSE, listener);
		EventEmitter.on(CONSTANTS.EVENTS.RESTART, listener);
		
		const event = new KeyboardEvent('keydown', { 
			code: 'KeyA',
			bubbles: true,
			cancelable: true
		});
		
		InputHandler._handleKeyDown(event);
		
		// Clean up
		EventEmitter.off(CONSTANTS.EVENTS.MOVE_LEFT, listener);
		EventEmitter.off(CONSTANTS.EVENTS.MOVE_RIGHT, listener);
		EventEmitter.off(CONSTANTS.EVENTS.ROTATE, listener);
		EventEmitter.off(CONSTANTS.EVENTS.HARD_DROP, listener);
		EventEmitter.off(CONSTANTS.EVENTS.PAUSE, listener);
		EventEmitter.off(CONSTANTS.EVENTS.RESTART, listener);
		
		if (eventFired) {
			throw new Error('No event should be emitted for non-game keys');
		}
	}
});

// Test: InputHandler respects enabled/disabled state
testSuite.tests.push({
	name: 'enableInput/disableInput - controls event emission',
	async run() {
		await ConfigManager.loadConfig();
		InputHandler.initialize();
		
		let eventFired = false;
		const listener = () => { eventFired = true; };
		
		// Disable input
		InputHandler.disableInput();
		
		EventEmitter.on(CONSTANTS.EVENTS.MOVE_LEFT, listener);
		
		const event = new KeyboardEvent('keydown', { 
			code: 'ArrowLeft',
			bubbles: true,
			cancelable: true
		});
		
		InputHandler._handleKeyDown(event);
		
		EventEmitter.off(CONSTANTS.EVENTS.MOVE_LEFT, listener);
		
		// Re-enable for other tests
		InputHandler.enableInput();
		
		if (eventFired) {
			throw new Error('No event should be emitted when input is disabled');
		}
	}
});

export default testSuite;
