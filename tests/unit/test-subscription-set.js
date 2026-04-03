/**
 * Unit tests for SubscriptionSet utility
 * @module test-subscription-set
 */

import { SubscriptionSet } from '../../src/utils/SubscriptionSet.js';
import { assert, assertEquals } from '../utils/assert.js';

export function runSubscriptionSetTests() {
	const results = [];

	function test(name, fn) {
		try {
			fn();
			results.push({ name, pass: true, error: null });
		} catch (error) {
			results.push({ name, pass: false, error: error.message });
		}
	}

	// Minimal stub emitter so tests don't depend on the real EventEmitter singleton
	function makeEmitter() {
		const listeners = {};
		return {
			on(event, handler) {
				if (!listeners[event]) listeners[event] = [];
				listeners[event].push(handler);
			},
			off(event, handler) {
				if (!listeners[event]) return;
				listeners[event] = listeners[event].filter(h => h !== handler);
			},
			emit(event, data) {
				(listeners[event] || []).forEach(h => h(data));
			},
			count(event) {
				return (listeners[event] || []).length;
			}
		};
	}

	// ── construction ──

	test('SubscriptionSet - can be instantiated', () => {
		const subs = new SubscriptionSet();
		assert(subs !== null, 'should create instance');
	});

	test('SubscriptionSet - starts with no entries', () => {
		const subs = new SubscriptionSet();
		assertEquals(subs._entries.length, 0, 'should have 0 entries initially');
	});

	// ── replace ──

	test('replace - subscribes all provided handlers', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		let aCount = 0;
		let bCount = 0;
		subs.replace(emitter, {
			'eventA': () => aCount++,
			'eventB': () => bCount++,
		});
		emitter.emit('eventA');
		emitter.emit('eventB');
		assertEquals(aCount, 1, 'eventA handler should fire once');
		assertEquals(bCount, 1, 'eventB handler should fire once');
	});

	test('replace - stores entries for later removal', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		subs.replace(emitter, { 'ev': () => {} });
		assertEquals(subs._entries.length, 1, 'should track 1 entry');
	});

	test('replace - tracks emitter and event name', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		const h = () => {};
		subs.replace(emitter, { 'myEvent': h });
		assertEquals(subs._entries[0].event, 'myEvent', 'should record event name');
		assert(subs._entries[0].emitter === emitter, 'should record emitter reference');
		assert(subs._entries[0].handler === h, 'should record handler reference');
	});

	test('replace - clears previous subscriptions before adding new ones', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		let count = 0;
		const h = () => count++;
		subs.replace(emitter, { 'ev': h });
		subs.replace(emitter, { 'ev': h }); // second replace must not double-subscribe
		emitter.emit('ev');
		assertEquals(count, 1, 'handler should only fire once after second replace');
	});

	test('replace - previous event no longer fires after replace with new events', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		let oldFired = false;
		let newFired = false;
		subs.replace(emitter, { 'oldEv': () => { oldFired = true; } });
		subs.replace(emitter, { 'newEv': () => { newFired = true; } });
		emitter.emit('oldEv');
		emitter.emit('newEv');
		assert(!oldFired, 'old handler should have been removed');
		assert(newFired, 'new handler should fire');
	});

	test('replace - works with multiple events', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		let a = 0, b = 0, c = 0;
		subs.replace(emitter, {
			'A': () => a++,
			'B': () => b++,
			'C': () => c++,
		});
		assertEquals(subs._entries.length, 3, 'should track 3 entries');
		emitter.emit('A'); emitter.emit('B'); emitter.emit('C');
		assertEquals(a, 1, 'A fired');
		assertEquals(b, 1, 'B fired');
		assertEquals(c, 1, 'C fired');
	});

	// ── clear ──

	test('clear - removes all subscriptions', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		let count = 0;
		subs.replace(emitter, { 'ev': () => count++ });
		subs.clear();
		emitter.emit('ev');
		assertEquals(count, 0, 'handler should not fire after clear');
	});

	test('clear - empties the entries array', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		subs.replace(emitter, { 'ev': () => {} });
		subs.clear();
		assertEquals(subs._entries.length, 0, 'entries should be empty after clear');
	});

	test('clear - is safe to call when already empty', () => {
		const subs = new SubscriptionSet();
		subs.clear(); // should not throw
		assertEquals(subs._entries.length, 0, 'still empty after no-op clear');
	});

	test('clear - removes multiple subscriptions', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		let a = 0, b = 0;
		subs.replace(emitter, { 'A': () => a++, 'B': () => b++ });
		subs.clear();
		emitter.emit('A'); emitter.emit('B');
		assertEquals(a, 0, 'A should not fire');
		assertEquals(b, 0, 'B should not fire');
	});

	// ── replace after clear ──

	test('replace after clear - re-subscribes correctly', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		let count = 0;
		subs.replace(emitter, { 'ev': () => count++ });
		subs.clear();
		subs.replace(emitter, { 'ev': () => count++ });
		emitter.emit('ev');
		assertEquals(count, 1, 'handler fires exactly once after re-subscribe');
	});

	// ── data passing ──

	test('replace - handlers receive emitted data', () => {
		const emitter = makeEmitter();
		const subs = new SubscriptionSet();
		let received = null;
		subs.replace(emitter, { 'ev': (data) => { received = data; } });
		emitter.emit('ev', { value: 42 });
		assert(received !== null && received.value === 42, 'handler should receive payload');
	});

	return results;
}
