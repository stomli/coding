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

		// Test once - handler called only once
		let onceCount = 0;
		const onceHandler = () => onceCount++;
		EventEmitter.once('once-event', onceHandler);
		EventEmitter.emit('once-event');
		EventEmitter.emit('once-event');
		
		tests.push({
			name: 'once - handler called only once',
			pass: onceCount === 1,
			error: onceCount !== 1 ? `Expected 1 call, got ${onceCount}` : null
		});

		// Test multiple data arguments
		let arg1, arg2, arg3;
		EventEmitter.on('multi-arg-event', (a, b, c) => { arg1 = a; arg2 = b; arg3 = c; });
		EventEmitter.emit('multi-arg-event', 'first', 'second', 'third');
		
		tests.push({
			name: 'emit - passes multiple arguments',
			pass: arg1 === 'first' && arg2 === 'second' && arg3 === 'third',
			error: arg1 !== 'first' ? `Expected args ('first', 'second', 'third'), got ('${arg1}', '${arg2}', '${arg3}')` : null
		});

		// Test removeAllListeners for specific event
		EventEmitter.on('event-a', () => {});
		EventEmitter.on('event-b', () => {});
		let eventBCount = 0;
		const eventBHandler = () => eventBCount++;
		EventEmitter.on('event-b', eventBHandler);
		EventEmitter.removeAllListeners('event-a');
		EventEmitter.emit('event-b');
		
		tests.push({
			name: 'removeAllListeners - clears specific event only',
			pass: eventBCount === 1,
			error: eventBCount !== 1 ? `Expected event-b to still work, got ${eventBCount} calls` : null
		});

		// Test emitting non-existent event (should not throw)
		let noError = true;
		try {
			EventEmitter.emit('non-existent-event', {});
		} catch (e) {
			noError = false;
		}
		
		tests.push({
			name: 'emit - non-existent event does not throw',
			pass: noError,
			error: !noError ? 'Emitting non-existent event threw error' : null
		});

		// Test off non-existent event (should not throw)
		noError = true;
		try {
			EventEmitter.off('non-existent-event', () => {});
		} catch (e) {
			noError = false;
		}
		
		tests.push({
			name: 'off - non-existent event does not throw',
			pass: noError,
			error: !noError ? 'Removing from non-existent event threw error' : null
		});

		// Test handler execution order
		const executionOrder = [];
		EventEmitter.on('order-test', () => executionOrder.push(1));
		EventEmitter.on('order-test', () => executionOrder.push(2));
		EventEmitter.on('order-test', () => executionOrder.push(3));
		EventEmitter.emit('order-test');
		
		tests.push({
			name: 'emit - handlers execute in registration order',
			pass: executionOrder[0] === 1 && executionOrder[1] === 2 && executionOrder[2] === 3,
			error: executionOrder.join(',') !== '1,2,3' ? `Expected order 1,2,3, got ${executionOrder.join(',')}` : null
		});

		// Test handler with error doesn't break other handlers
		const errorSafeResults = [];
		EventEmitter.removeAllListeners();
		EventEmitter.on('error-test', () => errorSafeResults.push('before'));
		EventEmitter.on('error-test', () => { throw new Error('Handler error'); });
		EventEmitter.on('error-test', () => errorSafeResults.push('after'));
		
		let errorCaught = false;
		try {
			EventEmitter.emit('error-test');
		} catch (e) {
			errorCaught = true;
		}
		
		tests.push({
			name: 'emit - handler errors propagate',
			pass: errorCaught && errorSafeResults.length === 1,
			error: !errorCaught ? 'Error should propagate' : errorSafeResults.length !== 1 ? `Expected 1 handler to run before error, got ${errorSafeResults.length}` : null
		});

		// Test off removes correct handler (not other similar handlers)
		EventEmitter.removeAllListeners();
		let count1 = 0, count2 = 0;
		const handlerA = () => count1++;
		const handlerB = () => count2++;
		EventEmitter.on('removal-test', handlerA);
		EventEmitter.on('removal-test', handlerB);
		EventEmitter.off('removal-test', handlerA);
		EventEmitter.emit('removal-test');
		
		tests.push({
			name: 'off - removes only specified handler',
			pass: count1 === 0 && count2 === 1,
			error: count1 !== 0 || count2 !== 1 ? `Expected counts (0, 1), got (${count1}, ${count2})` : null
		});

		// Test adding same handler multiple times
		EventEmitter.removeAllListeners();
		let duplicateCount = 0;
		const duplicateHandler = () => duplicateCount++;
		EventEmitter.on('duplicate-test', duplicateHandler);
		EventEmitter.on('duplicate-test', duplicateHandler);
		EventEmitter.emit('duplicate-test');
		
		tests.push({
			name: 'on - same handler can be added multiple times',
			pass: duplicateCount === 2,
			error: duplicateCount !== 2 ? `Expected 2 calls, got ${duplicateCount}` : null
		});

		// Test off removes all instances of handler
		EventEmitter.off('duplicate-test', duplicateHandler);
		duplicateCount = 0;
		EventEmitter.emit('duplicate-test');
		
		tests.push({
			name: 'off - removes all instances of handler',
			pass: duplicateCount === 0,
			error: duplicateCount !== 0 ? `Expected 0 calls after removal, got ${duplicateCount}` : null
		});

		// Test complex data objects
		EventEmitter.removeAllListeners();
		let complexData = null;
		EventEmitter.on('complex-data', (data) => complexData = data);
		const testData = { nested: { value: 123 }, array: [1, 2, 3], fn: () => 'test' };
		EventEmitter.emit('complex-data', testData);
		
		tests.push({
			name: 'emit - handles complex data objects',
			pass: complexData && complexData.nested.value === 123 && complexData.array[1] === 2 && typeof complexData.fn === 'function',
			error: !complexData ? 'No data received' : null
		});

		// Clean up at end
		EventEmitter.removeAllListeners();
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
