/**
 * test-monetization-manager.js
 *
 * Unit tests for MonetizationManager module
 */

import { MonetizationManager } from '../../src/modules/MonetizationManager.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';
import { EventEmitter } from '../../src/utils/EventEmitter.js';
import { CONSTANTS } from '../../src/utils/Constants.js';

// Test Suite
const testSuite = {
	name: 'MonetizationManager Tests',
	tests: []
};

// Helper: reset state between tests
function resetManager() {
	MonetizationManager.bmacEnabled = false;
	MonetizationManager.bmacUsername = '';
	MonetizationManager.initialized = false;
	localStorage.removeItem('monetization_ad_free_until');
	localStorage.removeItem('monetization_used_tokens');

	// Remove any BMAC DOM elements
	document.querySelectorAll('.bmac-button, .bmac-modal, .bmac-notification').forEach(el => {
		if (el.parentNode) el.parentNode.removeChild(el);
	});
}

// Test: getAdFreeStatus returns null when no ad-free key
testSuite.tests.push({
	name: 'getAdFreeStatus - returns null when no ad-free period',
	async run() {
		resetManager();

		const status = MonetizationManager.getAdFreeStatus();
		if (status !== null) {
			throw new Error(`Expected null, got ${JSON.stringify(status)}`);
		}
	}
});

// Test: getAdFreeStatus returns status object when active
testSuite.tests.push({
	name: 'getAdFreeStatus - returns status when ad-free is active',
	async run() {
		resetManager();
		const futureTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
		localStorage.setItem('monetization_ad_free_until', futureTime.toString());

		const status = MonetizationManager.getAdFreeStatus();
		if (!status) {
			throw new Error('Expected status object, got null');
		}
		if (status.active !== true) {
			throw new Error(`Expected active=true, got ${status.active}`);
		}
		if (status.daysRemaining < 6 || status.daysRemaining > 7) {
			throw new Error(`Expected ~7 days remaining, got ${status.daysRemaining}`);
		}

		localStorage.removeItem('monetization_ad_free_until');
	}
});

// Test: getAdFreeStatus returns null when expired
testSuite.tests.push({
	name: 'getAdFreeStatus - returns null when period expired',
	async run() {
		resetManager();
		const pastTime = Date.now() - 1000;
		localStorage.setItem('monetization_ad_free_until', pastTime.toString());

		const status = MonetizationManager.getAdFreeStatus();
		if (status !== null) {
			throw new Error(`Expected null for expired period, got ${JSON.stringify(status)}`);
		}
	}
});

// Test: redeemToken rejects empty token
testSuite.tests.push({
	name: 'redeemToken - rejects empty token',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const result = MonetizationManager.redeemToken('');
		if (result !== false) {
			throw new Error('Expected false for empty token');
		}
	}
});

// Test: redeemToken rejects invalid format
testSuite.tests.push({
	name: 'redeemToken - rejects token without BMAC- prefix',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const result = MonetizationManager.redeemToken('INVALID-5-12345-abc');
		if (result !== false) {
			throw new Error('Expected false for invalid prefix');
		}
	}
});

// Test: redeemToken rejects wrong number of parts
testSuite.tests.push({
	name: 'redeemToken - rejects token with wrong part count',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const result = MonetizationManager.redeemToken('BMAC-5-12345');
		if (result !== false) {
			throw new Error('Expected false for 3-part token');
		}
	}
});

// Test: redeemToken rejects invalid amount
testSuite.tests.push({
	name: 'redeemToken - rejects token with non-numeric amount',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const result = MonetizationManager.redeemToken('BMAC-abc-12345-sig1');
		if (result !== false) {
			throw new Error('Expected false for non-numeric amount');
		}
	}
});

// Test: redeemToken rejects expired token (> 1 year)
testSuite.tests.push({
	name: 'redeemToken - rejects token older than 1 year',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const oldTimestamp = Date.now() - (366 * 24 * 60 * 60 * 1000);
		const result = MonetizationManager.redeemToken(`BMAC-5-${oldTimestamp}-sig1`);
		if (result !== false) {
			throw new Error('Expected false for expired token');
		}
	}
});

// Test: redeemToken succeeds with valid token
testSuite.tests.push({
	name: 'redeemToken - succeeds with valid token and sets ad-free',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const timestamp = Date.now() - 1000; // 1 second ago
		const token = `BMAC-5-${timestamp}-sig1`;

		const result = MonetizationManager.redeemToken(token);
		if (result !== true) {
			throw new Error('Expected true for valid token redemption');
		}

		// Check ad-free was set
		const adFreeUntil = localStorage.getItem('monetization_ad_free_until');
		if (!adFreeUntil) {
			throw new Error('Expected monetization_ad_free_until to be set');
		}

		// Check token was marked as used
		const usedTokens = JSON.parse(localStorage.getItem('monetization_used_tokens') || '[]');
		if (!usedTokens.includes(token)) {
			throw new Error('Expected token to be in used tokens list');
		}

		// Clean up notification
		document.querySelectorAll('.bmac-notification').forEach(el => {
			if (el.parentNode) el.parentNode.removeChild(el);
		});

		resetManager();
	}
});

// Test: redeemToken rejects already-used token
testSuite.tests.push({
	name: 'redeemToken - rejects already-used token',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const timestamp = Date.now() - 1000;
		const token = `BMAC-5-${timestamp}-sig1`;

		// First redemption
		MonetizationManager.redeemToken(token);

		// Clean up notification from first redemption
		document.querySelectorAll('.bmac-notification').forEach(el => {
			if (el.parentNode) el.parentNode.removeChild(el);
		});

		// Second redemption should fail
		const result = MonetizationManager.redeemToken(token);
		if (result !== false) {
			throw new Error('Expected false for duplicate token');
		}

		resetManager();
	}
});

// Test: _calculateAdFreeDays returns correct tier
testSuite.tests.push({
	name: '_calculateAdFreeDays - returns correct days for $5 tier',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const days = MonetizationManager._calculateAdFreeDays(5);
		if (days !== 30) {
			throw new Error(`Expected 30 days for $5, got ${days}`);
		}
	}
});

// Test: _calculateAdFreeDays returns correct tier for $10
testSuite.tests.push({
	name: '_calculateAdFreeDays - returns correct days for $10 tier',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const days = MonetizationManager._calculateAdFreeDays(10);
		if (days !== 90) {
			throw new Error(`Expected 90 days for $10, got ${days}`);
		}
	}
});

// Test: _calculateAdFreeDays returns correct tier for $3
testSuite.tests.push({
	name: '_calculateAdFreeDays - returns correct days for $3 tier',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const days = MonetizationManager._calculateAdFreeDays(3);
		if (days !== 7) {
			throw new Error(`Expected 7 days for $3, got ${days}`);
		}
	}
});

// Test: _calculateAdFreeDays defaults for amounts below tiers
testSuite.tests.push({
	name: '_calculateAdFreeDays - defaults to 1 day/dollar for sub-tier amounts',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		const days = MonetizationManager._calculateAdFreeDays(2);
		if (days !== 2) {
			throw new Error(`Expected 2 days for $2, got ${days}`);
		}
	}
});

// Test: showRedeemDialog creates modal in DOM
testSuite.tests.push({
	name: 'showRedeemDialog - creates modal element',
	async run() {
		resetManager();

		MonetizationManager.showRedeemDialog();

		const modal = document.querySelector('.bmac-modal');
		if (!modal) {
			throw new Error('Expected .bmac-modal in DOM');
		}

		// Should have input, redeem and cancel buttons
		const input = modal.querySelector('#bmac-token-input');
		const redeemBtn = modal.querySelector('#bmac-redeem-btn');
		const cancelBtn = modal.querySelector('#bmac-cancel-btn');

		if (!input) throw new Error('Expected token input in modal');
		if (!redeemBtn) throw new Error('Expected redeem button in modal');
		if (!cancelBtn) throw new Error('Expected cancel button in modal');

		resetManager();
	}
});

// Test: showRedeemDialog cancel removes modal
testSuite.tests.push({
	name: 'showRedeemDialog - cancel button removes modal',
	async run() {
		resetManager();

		MonetizationManager.showRedeemDialog();

		const cancelBtn = document.querySelector('#bmac-cancel-btn');
		if (!cancelBtn) throw new Error('No cancel button found');

		cancelBtn.click();

		const modalAfter = document.querySelector('.bmac-modal');
		if (modalAfter) {
			resetManager();
			throw new Error('Expected modal to be removed after cancel');
		}
	}
});

// Test: showRedeemDialog doesn't create duplicate modals
testSuite.tests.push({
	name: 'showRedeemDialog - prevents duplicate modals',
	async run() {
		resetManager();

		MonetizationManager.showRedeemDialog();
		MonetizationManager.showRedeemDialog();

		const modals = document.querySelectorAll('.bmac-modal');
		if (modals.length !== 1) {
			resetManager();
			throw new Error(`Expected 1 modal, got ${modals.length}`);
		}

		resetManager();
	}
});

// Test: redeemToken emits AD_FREE_ACTIVATED event
testSuite.tests.push({
	name: 'redeemToken - emits AD_FREE_ACTIVATED event',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		let eventFired = false;
		const handler = () => { eventFired = true; };
		EventEmitter.on(CONSTANTS.EVENTS.AD_FREE_ACTIVATED, handler);

		const timestamp = Date.now() - 1000;
		MonetizationManager.redeemToken(`BMAC-5-${timestamp}-sig1`);

		EventEmitter.off(CONSTANTS.EVENTS.AD_FREE_ACTIVATED, handler);

		if (!eventFired) {
			throw new Error('Expected AD_FREE_ACTIVATED event to be emitted');
		}

		// Clean up notification
		document.querySelectorAll('.bmac-notification').forEach(el => {
			if (el.parentNode) el.parentNode.removeChild(el);
		});

		resetManager();
	}
});

export default testSuite;
