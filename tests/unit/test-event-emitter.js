/**
 * Unit tests for EventEmitter
 * @module test-event-emitter
 */

import EventEmitter from '../../src/utils/EventEmitter.js';

/**
 * Run all EventEmitter tests
 * @returns {Array} Test results
 */
export function testEventEmitter() {
	const tests = [];

	try {
		// Test on/emit
		let callCount = 0;
		const handler = () => callCount++;
		EventEmitter.on('test-event', handler);
		EventEmitter.emit('test-event');
		
		tests.push({
			name: 'on/emit - handler is called',
			pass: callCount === 1,
			error: null
		});

		// Test multiple handlers
		let callCount2 = 0;
		const handler2 = () => callCount2++;
		EventEmitter.on('test-event', handler2);
		EventEmitter.emit('test-event');
		
		tests.push({
			name: 'on/emit - multiple handlers called',
			pass: callCount === 2 && callCount2 === 1,
			error: null
		});

		// Test data passing
		let receivedData = null;
		const dataHandler = (data) => receivedData = data;
		EventEmitter.on('data-event', dataHandler);
		EventEmitter.emit('data-event', { value: 42 });
		
		tests.push({
			name: 'emit - passes data to handler',
			pass: receivedData && receivedData.value === 42,
			error: null
		});

		// Test off
		EventEmitter.off('test-event', handler2);
		callCount = 0;
		callCount2 = 0;
		EventEmitter.emit('test-event');
		
		tests.push({
			name: 'off - removes specific handler',
			pass: callCount === 1 && callCount2 === 0,
			error: null
		});

		// Clean up
		EventEmitter.removeAllListeners();
		callCount = 0;
		EventEmitter.emit('test-event');
		
		tests.push({
			name: 'removeAllListeners - clears all handlers',
			pass: callCount === 0,
			error: null
		});
	}
	catch (error) {
		tests.push({
			name: 'EventEmitter tests',
			pass: false,
			error: error.message
		});
	}

	return tests;
}
