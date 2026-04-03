/**
 * SubscriptionSet.js
 *
 * Manages a fixed set of EventEmitter subscriptions for a single owner.
 * Eliminates the repeated off/on/off pattern in manager classes.
 *
 * Usage:
 *   this._subs = new SubscriptionSet();
 *   // in initialize():
 *   this._subs.replace(EventEmitter, {
 *     [CONSTANTS.EVENTS.BALLS_CLEARED]: this._boundOnBallsCleared,
 *     [CONSTANTS.EVENTS.CASCADE_COMPLETE]: this._boundOnCascadeComplete,
 *   });
 *   // in reset():
 *   this._subs.clear();
 *
 * Dependencies: None (receives EventEmitter instance as argument)
 * Exports: SubscriptionSet class
 */
export class SubscriptionSet {
	constructor() {
		/** @type {Array<{emitter: object, event: string, handler: Function}>} */
		this._entries = [];
	}

	/**
	 * Remove all current subscriptions then add a new set.
	 * @param {object} emitter - EventEmitter instance with on/off methods
	 * @param {Object.<string, Function>} bindings - Map of eventName → bound handler
	 */
	replace(emitter, bindings) {
		this.clear();
		for (const [event, handler] of Object.entries(bindings)) {
			emitter.on(event, handler);
			this._entries.push({ emitter, event, handler });
		}
	}

	/**
	 * Remove all subscriptions held by this set.
	 */
	clear() {
		for (const { emitter, event, handler } of this._entries) {
			emitter.off(event, handler);
		}
		this._entries = [];
	}
}
