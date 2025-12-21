/**
 * DOMHelpers.js
 * 
 * Description: Common DOM manipulation utilities
 * 
 * Dependencies: None
 * 
 * Exports: DOM helper functions
 */

/**
 * Get element by ID safely
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} Element or null if not found
 */
export function getElement(id) {
	return document.getElementById(id);
}

/**
 * Get multiple elements by IDs
 * @param {string[]} ids - Array of element IDs
 * @returns {Object} Object with IDs as keys and elements as values
 */
export function getElements(ids) {
	return ids.reduce((acc, id) => {
		acc[id] = document.getElementById(id);
		return acc;
	}, {});
}

/**
 * Update element text content safely
 * @param {string} id - Element ID
 * @param {string} text - Text content to set
 * @returns {boolean} True if updated, false if element not found
 */
export function updateTextContent(id, text) {
	const el = document.getElementById(id);
	if (el) {
		el.textContent = text;
		return true;
	}
	return false;
}

/**
 * Update element inner HTML safely
 * @param {string} id - Element ID
 * @param {string} html - HTML content to set
 * @returns {boolean} True if updated, false if element not found
 */
export function updateHTML(id, html) {
	const el = document.getElementById(id);
	if (el) {
		el.innerHTML = html;
		return true;
	}
	return false;
}

/**
 * Toggle class on element
 * @param {string} id - Element ID
 * @param {string} className - Class name to toggle
 * @param {boolean} [force] - Optional force add/remove
 * @returns {boolean} True if toggled, false if element not found
 */
export function toggleClass(id, className, force) {
	const el = document.getElementById(id);
	if (el) {
		el.classList.toggle(className, force);
		return true;
	}
	return false;
}

/**
 * Add class to element
 * @param {string} id - Element ID
 * @param {string} className - Class name to add
 * @returns {boolean} True if added, false if element not found
 */
export function addClass(id, className) {
	const el = document.getElementById(id);
	if (el) {
		el.classList.add(className);
		return true;
	}
	return false;
}

/**
 * Remove class from element
 * @param {string} id - Element ID
 * @param {string} className - Class name to remove
 * @returns {boolean} True if removed, false if element not found
 */
export function removeClass(id, className) {
	const el = document.getElementById(id);
	if (el) {
		el.classList.remove(className);
		return true;
	}
	return false;
}

/**
 * Show element by removing 'hidden' class
 * @param {string} id - Element ID
 * @returns {boolean} True if shown, false if element not found
 */
export function show(id) {
	return removeClass(id, 'hidden');
}

/**
 * Hide element by adding 'hidden' class
 * @param {string} id - Element ID
 * @returns {boolean} True if hidden, false if element not found
 */
export function hide(id) {
	return addClass(id, 'hidden');
}

/**
 * Setup button with event listener and optional audio
 * @param {string} id - Button element ID
 * @param {Function} handler - Click handler function
 * @param {boolean} [playSound=true] - Whether to play click sound
 * @param {Object} [audioManager] - Optional AudioManager instance
 * @returns {HTMLElement|null} Button element or null
 */
export function setupButton(id, handler, playSound = true, audioManager = null) {
	const btn = document.getElementById(id);
	if (btn) {
		btn.addEventListener('click', async () => {
			if (playSound && audioManager) {
				audioManager.playClick();
			}
			await handler();
		});
	}
	return btn;
}

/**
 * Setup multiple buttons with the same configuration
 * @param {Object} config - Configuration object with id as key and handler as value
 * @param {boolean} [playSound=true] - Whether to play click sound
 * @param {Object} [audioManager] - Optional AudioManager instance
 * @returns {Object} Object with IDs as keys and button elements as values
 */
export function setupButtons(config, playSound = true, audioManager = null) {
	const buttons = {};
	for (const [id, handler] of Object.entries(config)) {
		buttons[id] = setupButton(id, handler, playSound, audioManager);
	}
	return buttons;
}

/**
 * Show overlay by removing hidden class
 * @param {string} id - Overlay element ID
 * @returns {boolean} True if shown, false if element not found
 */
export function showOverlay(id) {
	return removeClass(id, 'hidden');
}

/**
 * Hide overlay by adding hidden class
 * @param {string} id - Overlay element ID
 * @returns {boolean} True if hidden, false if element not found
 */
export function hideOverlay(id) {
	return addClass(id, 'hidden');
}

/**
 * Set element disabled state
 * @param {string} id - Element ID
 * @param {boolean} disabled - Whether to disable the element
 * @returns {boolean} True if updated, false if element not found
 */
export function setDisabled(id, disabled) {
	const el = document.getElementById(id);
	if (el) {
		el.disabled = disabled;
		return true;
	}
	return false;
}

/**
 * Update element attribute
 * @param {string} id - Element ID
 * @param {string} attribute - Attribute name
 * @param {string} value - Attribute value
 * @returns {boolean} True if updated, false if element not found
 */
export function setAttribute(id, attribute, value) {
	const el = document.getElementById(id);
	if (el) {
		el.setAttribute(attribute, value);
		return true;
	}
	return false;
}

/**
 * Get element attribute value
 * @param {string} id - Element ID
 * @param {string} attribute - Attribute name
 * @returns {string|null} Attribute value or null if element not found
 */
export function getAttribute(id, attribute) {
	const el = document.getElementById(id);
	return el ? el.getAttribute(attribute) : null;
}
