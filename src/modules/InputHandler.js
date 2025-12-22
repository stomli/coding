/**
 * InputHandler.js
 * 
 * Description: Keyboard input processing and event emission
 * 
 * Dependencies: EventEmitter, Constants, ConfigManager
 * 
 * Exports: InputHandler singleton
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { CONSTANTS } from '../utils/Constants.js';
import { ConfigManager } from './ConfigManager.js';

/**
 * Input handler class for keyboard controls
 */
class InputHandlerClass {
	
	/**
	 * Constructor initializes input state
	 */
	constructor() {
		this.isEnabled = false;
		this.keyDownHandler = null;
		this.keyRepeatTimers = {};
	}
	
	/**
	 * Initialize input handler and set up event listeners
	 * @returns {void}
	 */
	initialize() {
		const moveLeft = ConfigManager.get('controls.moveLeft', 'ArrowLeft');
		const moveRight = ConfigManager.get('controls.moveRight', 'ArrowRight');
		const rotate = ConfigManager.get('controls.rotate', 'ArrowUp');
		const hardDrop = ConfigManager.get('controls.hardDrop', 'ArrowDown');
		const pause = ConfigManager.get('controls.pause', 'KeyP');
		const restart = ConfigManager.get('controls.restart', 'KeyR');
		
		// Store key mappings
		this.keyMappings = {
			[moveLeft]: CONSTANTS.EVENTS.MOVE_LEFT,
			[moveRight]: CONSTANTS.EVENTS.MOVE_RIGHT,
			[rotate]: CONSTANTS.EVENTS.ROTATE,
			[hardDrop]: CONSTANTS.EVENTS.HARD_DROP,
			[pause]: CONSTANTS.EVENTS.PAUSE,
			[restart]: CONSTANTS.EVENTS.RESTART
		};
		
		// Create key down handler
		this.keyDownHandler = (event) => {
			this._handleKeyDown(event);
		};
		
		// Add event listener
		window.addEventListener('keydown', this.keyDownHandler);
		this.isEnabled = true;
	}
	
	/**
	 * Handle key down events
	 * @param {KeyboardEvent} event - Keyboard event
	 * @returns {void}
	 * @private
	 */
	_handleKeyDown(event) {
		const isEnabled = this.isEnabled;
		
		// Ignore if disabled
		if (!isEnabled) {
			return;
		}
		else {
			// Process key
		}
		
		const keyCode = event.code;
		const hasMapping = this.keyMappings.hasOwnProperty(keyCode);
		
		// Emit event if key is mapped
		if (hasMapping) {
			event.preventDefault();
			
			const eventName = this.keyMappings[keyCode];
			const isRepeat = event.repeat;
			
			// Only emit if not a key repeat (or allow repeats for movement)
			const allowRepeat = eventName === CONSTANTS.EVENTS.MOVE_LEFT ||
			                    eventName === CONSTANTS.EVENTS.MOVE_RIGHT;
			
			const shouldEmit = !isRepeat || allowRepeat;
			
			// Emit event
			if (shouldEmit) {
				EventEmitter.emit(eventName);
			}
			else {
				// Key repeat for non-movement keys, ignore
			}
		}
		else {
			// Unmapped key, ignore
		}
	}
	
	/**
	 * Enable input processing
	 * @returns {void}
	 */
	enableInput() {
		this.isEnabled = true;
	}
	
	/**
	 * Disable input processing
	 * @returns {void}
	 */
	disableInput() {
		this.isEnabled = false;
	}
	
	/**
	 * Trigger a game action programmatically (for touch controls)
	 * @param {string} action - Action name (moveLeft, moveRight, rotate, drop, pause, restart)
	 * @returns {void}
	 */
	triggerAction(action) {
		if (!this.isEnabled) {
			return;
		}
		
		const actionMap = {
			'moveLeft': CONSTANTS.EVENTS.MOVE_LEFT,
			'moveRight': CONSTANTS.EVENTS.MOVE_RIGHT,
			'rotate': CONSTANTS.EVENTS.ROTATE,
			'drop': CONSTANTS.EVENTS.HARD_DROP,
			'pause': CONSTANTS.EVENTS.PAUSE,
			'restart': CONSTANTS.EVENTS.RESTART
		};
		
		const eventName = actionMap[action];
		if (eventName) {
			EventEmitter.emit(eventName);
		}
	}
	
	/**
	 * Clean up event listeners
	 * @returns {void}
	 */
	destroy() {
		const hasHandler = this.keyDownHandler !== null;
		
		// Remove event listener if exists
		if (hasHandler) {
			window.removeEventListener('keydown', this.keyDownHandler);
			this.keyDownHandler = null;
		}
		else {
			// No handler to remove
		}
		
		this.isEnabled = false;
	}
	
}

// Create singleton instance
const InputHandler = new InputHandlerClass();

export default InputHandler;
export { InputHandler };
