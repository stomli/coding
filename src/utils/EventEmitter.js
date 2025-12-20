/**
 * EventEmitter.js
 * 
 * Description: Pub/Sub event system for module communication
 * 
 * Dependencies: None
 * 
 * Exports: EventEmitter singleton with on, off, and emit methods
 */

/**
 * Event emitter class for managing event subscriptions and emissions
 */
class EventEmitterClass {
	
	/**
	 * Constructor initializes the event listeners map
	 */
	constructor() {
		this.listeners = {};
	}
	
	/**
	 * Subscribe to an event
	 * @param {String} event - Event name to listen for
	 * @param {Function} callback - Function to call when event is emitted
	 * @returns {void}
	 */
	on(event, callback) {
		const hasEvent = this.listeners.hasOwnProperty(event);
		
		// Create event array if it doesn't exist
		if (!hasEvent) {
			this.listeners[event] = [];
		}
		else {
			// Event array already exists, do nothing
		}
		
		this.listeners[event].push(callback);
	}
	
	/**
	 * Unsubscribe from an event
	 * @param {String} event - Event name to stop listening for
	 * @param {Function} callback - Function to remove from listeners
	 * @returns {void}
	 */
	off(event, callback) {
		const hasEvent = this.listeners.hasOwnProperty(event);
		
		// Remove callback from event listeners
		if (hasEvent) {
			this.listeners[event] = this.listeners[event].filter(
				listener => listener !== callback
			);
		}
		else {
			// Event doesn't exist, nothing to remove
		}
	}
	
	/**
	 * Emit an event to all subscribers
	 * @param {String} event - Event name to emit
	 * @param {*} data - Data to pass to event listeners
	 * @returns {void}
	 */
	emit(event, data) {
		const hasEvent = this.listeners.hasOwnProperty(event);
		
		// Call all listeners for this event
		if (hasEvent) {
			const callbacks = this.listeners[event];
			callbacks.forEach(callback => {
				callback(data);
			});
		}
		else {
			// No listeners for this event
		}
	}
	
	/**
	 * Remove all listeners for an event or all events
	 * @param {String} event - Optional event name to clear (clears all if not provided)
	 * @returns {void}
	 */
	removeAllListeners(event) {
		const hasSpecificEvent = event !== undefined;
		
		// Clear specific event or all events
		if (hasSpecificEvent) {
			delete this.listeners[event];
		}
		else {
			this.listeners = {};
		}
	}
	
}

// Create singleton instance
const EventEmitter = new EventEmitterClass();

export default EventEmitter;
export { EventEmitter };
