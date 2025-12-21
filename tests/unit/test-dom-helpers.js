/**
 * Unit tests for DOMHelpers utility functions
 * @module test-dom-helpers
 */

import * as DOMHelpers from '../../src/utils/DOMHelpers.js';

/**
 * Run all DOM helper tests
 * @returns {Array} Test results
 */
export function testDOMHelpers() {
	const tests = [];
	
	// Setup test DOM elements
	const testContainer = document.createElement('div');
	testContainer.id = 'test-container';
	testContainer.innerHTML = `
		<div id="test-element">Original Text</div>
		<button id="test-button">Click Me</button>
		<div id="test-hidden" class="hidden">Hidden Element</div>
		<input id="test-input" type="text" value="test" />
		<div id="test-classes"></div>
	`;
	document.body.appendChild(testContainer);

	// Test getElement
	tests.push({
		name: 'getElement - returns element when it exists',
		pass: DOMHelpers.getElement('test-element') !== null,
		error: null
	});

	tests.push({
		name: 'getElement - returns null when element does not exist',
		pass: DOMHelpers.getElement('nonexistent') === null,
		error: null
	});
	
	// Edge cases for getElement
	tests.push({
		name: 'getElement - returns null for empty string ID',
		pass: DOMHelpers.getElement('') === null,
		error: null
	});
	
	tests.push({
		name: 'getElement - returns null for null ID',
		pass: (() => {
			try {
				return DOMHelpers.getElement(null) === null;
			} catch (e) {
				return true; // Acceptable to throw
			}
		})(),
		error: null
	});

	// Test getElements
	const elements = DOMHelpers.getElements(['test-element', 'test-button', 'nonexistent']);
	tests.push({
		name: 'getElements - returns object with all IDs',
		pass: elements.hasOwnProperty('test-element') && 
		      elements.hasOwnProperty('test-button') && 
		      elements.hasOwnProperty('nonexistent'),
		error: null
	});

	tests.push({
		name: 'getElements - has null for nonexistent elements',
		pass: elements['nonexistent'] === null,
		error: null
	});

	// Test updateTextContent
	tests.push({
		name: 'updateTextContent - updates existing element',
		pass: (() => {
			const result = DOMHelpers.updateTextContent('test-element', 'New Text');
			return result === true && DOMHelpers.getElement('test-element').textContent === 'New Text';
		})(),
		error: null
	});

	tests.push({
		name: 'updateTextContent - returns false for nonexistent element',
		pass: DOMHelpers.updateTextContent('nonexistent', 'Text') === false,
		error: null
	});

	// Test updateHTML
	tests.push({
		name: 'updateHTML - updates existing element',
		pass: (() => {
			const result = DOMHelpers.updateHTML('test-element', '<span>HTML</span>');
			return result === true && DOMHelpers.getElement('test-element').innerHTML === '<span>HTML</span>';
		})(),
		error: null
	});

	tests.push({
		name: 'updateHTML - returns false for nonexistent element',
		pass: DOMHelpers.updateHTML('nonexistent', '<p>Test</p>') === false,
		error: null
	});

	// Test addClass
	tests.push({
		name: 'addClass - adds class to element',
		pass: (() => {
			const result = DOMHelpers.addClass('test-classes', 'new-class');
			return result === true && DOMHelpers.getElement('test-classes').classList.contains('new-class');
		})(),
		error: null
	});

	tests.push({
		name: 'addClass - returns false for nonexistent element',
		pass: DOMHelpers.addClass('nonexistent', 'class') === false,
		error: null
	});

	// Test removeClass
	tests.push({
		name: 'removeClass - removes class from element',
		pass: (() => {
			DOMHelpers.addClass('test-classes', 'remove-me');
			const result = DOMHelpers.removeClass('test-classes', 'remove-me');
			return result === true && !DOMHelpers.getElement('test-classes').classList.contains('remove-me');
		})(),
		error: null
	});

	// Test toggleClass
	tests.push({
		name: 'toggleClass - toggles class on element',
		pass: (() => {
			const el = DOMHelpers.getElement('test-classes');
			el.classList.remove('toggle-test');
			DOMHelpers.toggleClass('test-classes', 'toggle-test');
			const added = el.classList.contains('toggle-test');
			DOMHelpers.toggleClass('test-classes', 'toggle-test');
			const removed = !el.classList.contains('toggle-test');
			return added && removed;
		})(),
		error: null
	});

	tests.push({
		name: 'toggleClass - forces add when force=true',
		pass: (() => {
			const el = DOMHelpers.getElement('test-classes');
			el.classList.remove('force-test');
			DOMHelpers.toggleClass('test-classes', 'force-test', true);
			const added = el.classList.contains('force-test');
			DOMHelpers.toggleClass('test-classes', 'force-test', true);
			const stillThere = el.classList.contains('force-test');
			return added && stillThere;
		})(),
		error: null
	});

	// Test show/hide
	tests.push({
		name: 'show - removes hidden class',
		pass: (() => {
			const el = DOMHelpers.getElement('test-hidden');
			el.classList.add('hidden');
			DOMHelpers.show('test-hidden');
			return !el.classList.contains('hidden');
		})(),
		error: null
	});

	tests.push({
		name: 'hide - adds hidden class',
		pass: (() => {
			const el = DOMHelpers.getElement('test-element');
			el.classList.remove('hidden');
			DOMHelpers.hide('test-element');
			return el.classList.contains('hidden');
		})(),
		error: null
	});

	// Test setDisabled
	tests.push({
		name: 'setDisabled - disables element',
		pass: (() => {
			DOMHelpers.setDisabled('test-button', true);
			return DOMHelpers.getElement('test-button').disabled === true;
		})(),
		error: null
	});

	tests.push({
		name: 'setDisabled - enables element',
		pass: (() => {
			DOMHelpers.setDisabled('test-button', false);
			return DOMHelpers.getElement('test-button').disabled === false;
		})(),
		error: null
	});

	// Test setAttribute/getAttribute
	tests.push({
		name: 'setAttribute - sets attribute value',
		pass: (() => {
			DOMHelpers.setAttribute('test-input', 'placeholder', 'Enter text');
			return DOMHelpers.getElement('test-input').getAttribute('placeholder') === 'Enter text';
		})(),
		error: null
	});

	tests.push({
		name: 'getAttribute - gets attribute value',
		pass: DOMHelpers.getAttribute('test-input', 'placeholder') === 'Enter text',
		error: null
	});

	tests.push({
		name: 'getAttribute - returns null for nonexistent element',
		pass: DOMHelpers.getAttribute('nonexistent', 'attr') === null,
		error: null
	});

	// Test setupButton
	tests.push({
		name: 'setupButton - attaches event listener',
		pass: (() => {
			let clicked = false;
			DOMHelpers.setupButton('test-button', () => { clicked = true; }, false);
			DOMHelpers.getElement('test-button').click();
			return clicked === true;
		})(),
		error: null
	});

	tests.push({
		name: 'setupButton - returns button element',
		pass: DOMHelpers.setupButton('test-button', () => {}, false) !== null,
		error: null
	});

	tests.push({
		name: 'setupButton - returns null for nonexistent button',
		pass: DOMHelpers.setupButton('nonexistent-button', () => {}, false) === null,
		error: null
	});

	// Test setupButtons
	tests.push({
		name: 'setupButtons - sets up multiple buttons',
		pass: (() => {
			const clicks = { btn1: false, btn2: false };
			const btn1 = document.createElement('button');
			btn1.id = 'multi-btn-1';
			const btn2 = document.createElement('button');
			btn2.id = 'multi-btn-2';
			testContainer.appendChild(btn1);
			testContainer.appendChild(btn2);
			
			const buttons = DOMHelpers.setupButtons({
				'multi-btn-1': () => { clicks.btn1 = true; },
				'multi-btn-2': () => { clicks.btn2 = true; }
			}, false);
			
			btn1.click();
			btn2.click();
			
			return clicks.btn1 && clicks.btn2 && Object.keys(buttons).length === 2;
		})(),
		error: null
	});

	// Test showOverlay/hideOverlay
	tests.push({
		name: 'showOverlay - removes hidden class',
		pass: (() => {
			const overlay = document.createElement('div');
			overlay.id = 'test-overlay';
			overlay.classList.add('hidden');
			testContainer.appendChild(overlay);
			DOMHelpers.showOverlay('test-overlay');
			return !overlay.classList.contains('hidden');
		})(),
		error: null
	});

	tests.push({
		name: 'hideOverlay - adds hidden class',
		pass: (() => {
			const overlay = DOMHelpers.getElement('test-overlay');
			overlay.classList.remove('hidden');
			DOMHelpers.hideOverlay('test-overlay');
			return overlay.classList.contains('hidden');
		})(),
		error: null
	});

	// Cleanup
	document.body.removeChild(testContainer);

	return tests;
}
