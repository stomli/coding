/**
 * test-floating-text.js
 * 
 * Unit tests for FloatingText module
 */

import { FloatingTextManager } from '../../src/modules/FloatingText.js';

// Test Suite
const testSuite = {
	name: 'FloatingText Tests',
	tests: []
};

// Test: FloatingTextManager initializes with empty array
testSuite.tests.push({
	name: 'constructor - Initializes with empty texts array',
	async run() {
		const manager = new FloatingTextManager();
		
		if (!manager.texts) {
			throw new Error('Manager should have texts array');
		}
		
		if (manager.texts.length !== 0) {
			throw new Error('Initial texts array should be empty');
		}
	}
});

// Test: add() creates a new floating text
testSuite.tests.push({
	name: 'add - Creates new floating text',
	async run() {
		const manager = new FloatingTextManager();
		
		manager.add('+10', 100, 200);
		
		if (manager.texts.length !== 1) {
			throw new Error('Should have 1 floating text after add');
		}
		
		const text = manager.texts[0];
		
		if (text.text !== '+10') {
			throw new Error(`Expected text '+10', got '${text.text}'`);
		}
		
		if (text.startX !== 100) {
			throw new Error(`Expected startX 100, got ${text.startX}`);
		}
		
		if (text.startY !== 200) {
			throw new Error(`Expected startY 200, got ${text.startY}`);
		}
	}
});

// Test: add() with custom duration
testSuite.tests.push({
	name: 'add - Accepts custom duration',
	async run() {
		const manager = new FloatingTextManager();
		
		manager.add('+20', 100, 200, 2000);
		
		const text = manager.texts[0];
		
		if (text.duration !== 2000) {
			throw new Error(`Expected duration 2000, got ${text.duration}`);
		}
	}
});

// Test: add() multiple texts
testSuite.tests.push({
	name: 'add - Supports multiple floating texts',
	async run() {
		const manager = new FloatingTextManager();
		
		manager.add('+10', 100, 200);
		manager.add('+20', 150, 250);
		manager.add('+30', 200, 300);
		
		if (manager.texts.length !== 3) {
			throw new Error(`Expected 3 texts, got ${manager.texts.length}`);
		}
	}
});

// Test: update() moves text upward
testSuite.tests.push({
	name: 'update - Moves text upward over time',
	async run() {
		const manager = new FloatingTextManager();
		
		manager.add('+10', 100, 200, 1000);
		
		const text = manager.texts[0];
		const initialY = text.y;
		
		// Wait a bit for time to pass
		await new Promise(resolve => setTimeout(resolve, 100));
		
		manager.update();
		
		const newY = text.y;
		
		if (newY >= initialY) {
			throw new Error('Text should move upward (y should decrease)');
		}
	}
});

// Test: update() decreases opacity
testSuite.tests.push({
	name: 'update - Decreases opacity over time',
	async run() {
		const manager = new FloatingTextManager();
		
		manager.add('+10', 100, 200, 1000);
		
		const text = manager.texts[0];
		const initialOpacity = text.opacity;
		
		// Wait a bit
		await new Promise(resolve => setTimeout(resolve, 100));
		
		manager.update();
		
		const newOpacity = text.opacity;
		
		if (newOpacity >= initialOpacity) {
			throw new Error('Opacity should decrease over time');
		}
	}
});

// Test: update() removes expired texts
testSuite.tests.push({
	name: 'update - Removes expired texts',
	async run() {
		const manager = new FloatingTextManager();
		
		// Add text with very short duration
		manager.add('+10', 100, 200, 50);
		
		if (manager.texts.length !== 1) {
			throw new Error('Should have 1 text initially');
		}
		
		// Wait for expiration
		await new Promise(resolve => setTimeout(resolve, 100));
		
		manager.update();
		
		if (manager.texts.length !== 0) {
			throw new Error('Expired text should be removed');
		}
	}
});

// Test: update() keeps active texts
testSuite.tests.push({
	name: 'update - Keeps active texts',
	async run() {
		const manager = new FloatingTextManager();
		
		manager.add('+10', 100, 200, 2000);
		
		// Wait a short time
		await new Promise(resolve => setTimeout(resolve, 100));
		
		manager.update();
		
		if (manager.texts.length !== 1) {
			throw new Error('Active text should not be removed');
		}
	}
});

// Test: update() handles mixed active and expired texts
testSuite.tests.push({
	name: 'update - Filters out expired while keeping active',
	async run() {
		const manager = new FloatingTextManager();
		
		manager.add('+10', 100, 200, 50); // Will expire
		manager.add('+20', 150, 250, 2000); // Will stay
		manager.add('+30', 200, 300, 50); // Will expire
		
		// Wait for short-duration texts to expire
		await new Promise(resolve => setTimeout(resolve, 100));
		
		manager.update();
		
		if (manager.texts.length !== 1) {
			throw new Error(`Expected 1 active text, got ${manager.texts.length}`);
		}
		
		if (manager.texts[0].text !== '+20') {
			throw new Error('Wrong text remained active');
		}
	}
});

// Test: clear() removes all texts
testSuite.tests.push({
	name: 'clear - Removes all floating texts',
	async run() {
		const manager = new FloatingTextManager();
		
		manager.add('+10', 100, 200);
		manager.add('+20', 150, 250);
		manager.add('+30', 200, 300);
		
		if (manager.texts.length !== 3) {
			throw new Error('Should have 3 texts before clear');
		}
		
		manager.clear();
		
		if (manager.texts.length !== 0) {
			throw new Error('All texts should be removed after clear');
		}
	}
});

// Test: FloatingText calculates progress correctly
testSuite.tests.push({
	name: 'FloatingText - Calculates progress correctly',
	async run() {
		const manager = new FloatingTextManager();
		
		manager.add('+10', 100, 200, 1000);
		
		const text = manager.texts[0];
		
		// Progress should start near 0
		const elapsed = Date.now() - text.createdAt;
		const progress = elapsed / text.duration;
		
		if (progress > 0.1) {
			throw new Error('Initial progress should be near 0');
		}
	}
});

// Test: _hexToRgb parses valid 6-char hex with #
testSuite.tests.push({
	name: '_hexToRgb - Parses #RRGGBB correctly',
	async run() {
		const manager = new FloatingTextManager();
		const result = manager._hexToRgb('#FF0000');
		if (result.r !== 255 || result.g !== 0 || result.b !== 0) {
			throw new Error(`Expected {r:255,g:0,b:0}, got {r:${result.r},g:${result.g},b:${result.b}}`);
		}
	}
});

// Test: _hexToRgb parses hex without #
testSuite.tests.push({
	name: '_hexToRgb - Parses RRGGBB without # prefix',
	async run() {
		const manager = new FloatingTextManager();
		const result = manager._hexToRgb('00FF00');
		if (result.r !== 0 || result.g !== 255 || result.b !== 0) {
			throw new Error(`Expected {r:0,g:255,b:0}, got {r:${result.r},g:${result.g},b:${result.b}}`);
		}
	}
});

// Test: _hexToRgb parses blue color
testSuite.tests.push({
	name: '_hexToRgb - Parses blue correctly',
	async run() {
		const manager = new FloatingTextManager();
		const result = manager._hexToRgb('#0000FF');
		if (result.r !== 0 || result.g !== 0 || result.b !== 255) {
			throw new Error(`Expected {r:0,g:0,b:255}, got {r:${result.r},g:${result.g},b:${result.b}}`);
		}
	}
});

// Test: _hexToRgb parses white
testSuite.tests.push({
	name: '_hexToRgb - Parses white (#FFFFFF)',
	async run() {
		const manager = new FloatingTextManager();
		const result = manager._hexToRgb('#FFFFFF');
		if (result.r !== 255 || result.g !== 255 || result.b !== 255) {
			throw new Error(`Expected {r:255,g:255,b:255}, got {r:${result.r},g:${result.g},b:${result.b}}`);
		}
	}
});

// Test: _hexToRgb returns white for invalid hex
testSuite.tests.push({
	name: '_hexToRgb - Returns white for invalid input',
	async run() {
		const manager = new FloatingTextManager();
		const result = manager._hexToRgb('not-a-color');
		if (result.r !== 255 || result.g !== 255 || result.b !== 255) {
			throw new Error(`Expected default white, got {r:${result.r},g:${result.g},b:${result.b}}`);
		}
	}
});

// Test: _hexToRgb returns white for empty string
testSuite.tests.push({
	name: '_hexToRgb - Returns white for empty string',
	async run() {
		const manager = new FloatingTextManager();
		const result = manager._hexToRgb('');
		if (result.r !== 255 || result.g !== 255 || result.b !== 255) {
			throw new Error(`Expected default white for empty string`);
		}
	}
});

// Test: _hexToRgb handles lowercase hex
testSuite.tests.push({
	name: '_hexToRgb - Handles lowercase hex',
	async run() {
		const manager = new FloatingTextManager();
		const result = manager._hexToRgb('#ff8800');
		if (result.r !== 255 || result.g !== 136 || result.b !== 0) {
			throw new Error(`Expected {r:255,g:136,b:0}, got {r:${result.r},g:${result.g},b:${result.b}}`);
		}
	}
});

// Test: add() with custom color parameter
testSuite.tests.push({
	name: 'add - Accepts custom color',
	async run() {
		const manager = new FloatingTextManager();
		manager.add('+50', 100, 200, 1000, '#FF0000');
		const text = manager.texts[0];
		if (text.color !== '#FF0000') {
			throw new Error(`Expected color '#FF0000', got '${text.color}'`);
		}
	}
});

// Test: add() default color is white
testSuite.tests.push({
	name: 'add - Default color is white (#FFFFFF)',
	async run() {
		const manager = new FloatingTextManager();
		manager.add('+10', 100, 200);
		const text = manager.texts[0];
		if (text.color !== '#FFFFFF') {
			throw new Error(`Expected default color '#FFFFFF', got '${text.color}'`);
		}
	}
});

// Test: FloatingText update returns true when active
testSuite.tests.push({
	name: 'FloatingText update - Returns true when active',
	async run() {
		const manager = new FloatingTextManager();
		manager.add('+10', 100, 200, 5000);
		const text = manager.texts[0];
		const result = text.update();
		if (result !== true) {
			throw new Error(`Expected true for active text, got ${result}`);
		}
	}
});

// Test: FloatingText update returns false when expired
testSuite.tests.push({
	name: 'FloatingText update - Returns false when expired',
	async run() {
		const manager = new FloatingTextManager();
		manager.add('+10', 100, 200, 10); // Very short duration
		await new Promise(resolve => setTimeout(resolve, 50));
		const text = manager.texts[0];
		const result = text.update();
		if (result !== false) {
			throw new Error(`Expected false for expired text, got ${result}`);
		}
	}
});

// Test: FloatingText stores initial position
testSuite.tests.push({
	name: 'FloatingText - Stores startX and startY',
	async run() {
		const manager = new FloatingTextManager();
		manager.add('+10', 123, 456);
		const text = manager.texts[0];
		if (text.startX !== 123 || text.startY !== 456) {
			throw new Error(`Expected startX=123, startY=456, got startX=${text.startX}, startY=${text.startY}`);
		}
	}
});

export default testSuite;
