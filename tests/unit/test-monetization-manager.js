/**
 * test-monetization-manager.js
 *
 * Unit tests for MonetizationManager module (Lemonsqueezy license key integration)
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
	MonetizationManager.enabled = false;
	MonetizationManager.storeUrl = '';
	MonetizationManager.storeId = 0;
	MonetizationManager.productId = 0;
	MonetizationManager.initialized = false;
	localStorage.removeItem('monetization_ad_free_until');
	localStorage.removeItem('monetization_license');
	localStorage.removeItem('monetization_last_validation');
	localStorage.removeItem('monetization_used_tokens');

	// Remove any DOM elements
	document.querySelectorAll('.supporter-button, .license-modal, .supporter-notification').forEach(el => {
		if (el.parentNode) el.parentNode.removeChild(el);
	});
}

// Test: getAdFreeStatus returns null when no license stored
testSuite.tests.push({
	name: 'getAdFreeStatus - returns null when no license stored',
	async run() {
		resetManager();

		const status = MonetizationManager.getAdFreeStatus();
		if (status !== null) {
			throw new Error(`Expected null, got ${JSON.stringify(status)}`);
		}
	}
});

// Test: getAdFreeStatus returns status for perpetual license
testSuite.tests.push({
	name: 'getAdFreeStatus - returns status for perpetual license',
	async run() {
		resetManager();
		localStorage.setItem('monetization_ad_free_until', 'license');
		localStorage.setItem('monetization_license', JSON.stringify({
			key: 'test-key',
			instanceId: 'test-instance',
			status: 'active',
			expiresAt: null,
			activatedAt: new Date().toISOString()
		}));

		const status = MonetizationManager.getAdFreeStatus();
		if (!status) throw new Error('Expected status object, got null');
		if (status.active !== true) throw new Error(`Expected active=true, got ${status.active}`);
		if (status.type !== 'license') throw new Error(`Expected type=license, got ${status.type}`);
		if (status.daysRemaining !== null) throw new Error(`Expected null daysRemaining for perpetual, got ${status.daysRemaining}`);

		resetManager();
	}
});

// Test: getAdFreeStatus returns status for time-limited license
testSuite.tests.push({
	name: 'getAdFreeStatus - returns status for time-limited license',
	async run() {
		resetManager();
		const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
		localStorage.setItem('monetization_ad_free_until', 'license');
		localStorage.setItem('monetization_license', JSON.stringify({
			key: 'test-key',
			instanceId: 'test-instance',
			status: 'active',
			expiresAt: futureDate,
			activatedAt: new Date().toISOString()
		}));

		const status = MonetizationManager.getAdFreeStatus();
		if (!status) throw new Error('Expected status object, got null');
		if (status.active !== true) throw new Error(`Expected active=true`);
		if (status.daysRemaining < 29 || status.daysRemaining > 30) {
			throw new Error(`Expected ~30 days remaining, got ${status.daysRemaining}`);
		}

		resetManager();
	}
});

// Test: getAdFreeStatus returns null for expired license
testSuite.tests.push({
	name: 'getAdFreeStatus - returns null for expired license',
	async run() {
		resetManager();
		const pastDate = new Date(Date.now() - 1000).toISOString();
		localStorage.setItem('monetization_ad_free_until', 'license');
		localStorage.setItem('monetization_license', JSON.stringify({
			key: 'test-key',
			instanceId: 'test-instance',
			status: 'active',
			expiresAt: pastDate,
			activatedAt: new Date().toISOString()
		}));

		const status = MonetizationManager.getAdFreeStatus();
		if (status !== null) throw new Error(`Expected null for expired license, got ${JSON.stringify(status)}`);

		resetManager();
	}
});

// Test: getAdFreeStatus handles legacy timestamp format
testSuite.tests.push({
	name: 'getAdFreeStatus - handles legacy timestamp format (backward compat)',
	async run() {
		resetManager();
		const futureTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
		localStorage.setItem('monetization_ad_free_until', futureTime.toString());

		const status = MonetizationManager.getAdFreeStatus();
		if (!status) throw new Error('Expected status for legacy format');
		if (status.type !== 'legacy') throw new Error(`Expected type=legacy, got ${status.type}`);
		if (status.active !== true) throw new Error('Expected active=true');

		resetManager();
	}
});

// Test: showActivateDialog creates modal in DOM
testSuite.tests.push({
	name: 'showActivateDialog - creates modal element',
	async run() {
		resetManager();

		MonetizationManager.showActivateDialog();

		const modal = document.querySelector('.license-modal');
		if (!modal) throw new Error('Expected .license-modal in DOM');

		const input = modal.querySelector('#license-key-input');
		const activateBtn = modal.querySelector('#license-activate-btn');
		const cancelBtn = modal.querySelector('#license-cancel-btn');

		if (!input) throw new Error('Expected license key input in modal');
		if (!activateBtn) throw new Error('Expected activate button in modal');
		if (!cancelBtn) throw new Error('Expected cancel button in modal');

		resetManager();
	}
});

// Test: showActivateDialog cancel removes modal
testSuite.tests.push({
	name: 'showActivateDialog - cancel button removes modal',
	async run() {
		resetManager();

		MonetizationManager.showActivateDialog();

		const cancelBtn = document.querySelector('#license-cancel-btn');
		if (!cancelBtn) throw new Error('No cancel button found');

		cancelBtn.click();

		const modalAfter = document.querySelector('.license-modal');
		if (modalAfter) {
			resetManager();
			throw new Error('Expected modal to be removed after cancel');
		}
	}
});

// Test: showActivateDialog prevents duplicates
testSuite.tests.push({
	name: 'showActivateDialog - prevents duplicate modals',
	async run() {
		resetManager();

		MonetizationManager.showActivateDialog();
		MonetizationManager.showActivateDialog();

		const modals = document.querySelectorAll('.license-modal');
		if (modals.length !== 1) {
			resetManager();
			throw new Error(`Expected 1 modal, got ${modals.length}`);
		}

		resetManager();
	}
});

// Test: showActivateDialog contains purchase link
testSuite.tests.push({
	name: 'showActivateDialog - contains purchase link',
	async run() {
		resetManager();

		MonetizationManager.showActivateDialog();

		const link = document.querySelector('.license-purchase-link a');
		if (!link) {
			resetManager();
			throw new Error('Expected purchase link in modal');
		}

		resetManager();
	}
});

// Test: activateLicense rejects empty key
testSuite.tests.push({
	name: 'activateLicense - rejects empty key',
	async run() {
		await ConfigManager.loadConfig();
		resetManager();

		// Need modal open for error display
		MonetizationManager.showActivateDialog();
		const result = await MonetizationManager.activateLicense('');
		if (result !== false) throw new Error('Expected false for empty key');

		resetManager();
	}
});

// Test: _storeLicense stores data correctly
testSuite.tests.push({
	name: '_storeLicense - stores license data in localStorage',
	async run() {
		resetManager();

		MonetizationManager._storeLicense({
			key: 'test-key-123',
			instanceId: 'inst-456',
			status: 'active',
			expiresAt: null,
			customerName: 'Test User',
			activatedAt: new Date().toISOString()
		});

		const stored = JSON.parse(localStorage.getItem('monetization_license'));
		if (!stored) throw new Error('Expected license data in localStorage');
		if (stored.key !== 'test-key-123') throw new Error(`Expected key test-key-123, got ${stored.key}`);
		if (stored.instanceId !== 'inst-456') throw new Error(`Expected instanceId inst-456, got ${stored.instanceId}`);

		const adFreeFlag = localStorage.getItem('monetization_ad_free_until');
		if (adFreeFlag !== 'license') throw new Error(`Expected ad_free_until=license, got ${adFreeFlag}`);

		resetManager();
	}
});

// Test: _clearLicense removes all stored data
testSuite.tests.push({
	name: '_clearLicense - removes all stored license data',
	async run() {
		resetManager();

		localStorage.setItem('monetization_license', '{"key":"test"}');
		localStorage.setItem('monetization_ad_free_until', 'license');
		localStorage.setItem('monetization_last_validation', '12345');

		MonetizationManager._clearLicense();

		if (localStorage.getItem('monetization_license') !== null) throw new Error('Expected license to be removed');
		if (localStorage.getItem('monetization_ad_free_until') !== null) throw new Error('Expected ad_free_until to be removed');
		if (localStorage.getItem('monetization_last_validation') !== null) throw new Error('Expected last_validation to be removed');
	}
});

// Test: _getStoredLicense returns parsed data
testSuite.tests.push({
	name: '_getStoredLicense - returns parsed license data',
	async run() {
		resetManager();

		const testData = { key: 'abc-123', instanceId: 'inst-1', status: 'active' };
		localStorage.setItem('monetization_license', JSON.stringify(testData));

		const result = MonetizationManager._getStoredLicense();
		if (!result) throw new Error('Expected license data');
		if (result.key !== 'abc-123') throw new Error(`Expected key abc-123, got ${result.key}`);

		resetManager();
	}
});

// Test: _getStoredLicense returns null for invalid JSON
testSuite.tests.push({
	name: '_getStoredLicense - returns null for invalid JSON',
	async run() {
		resetManager();

		localStorage.setItem('monetization_license', 'not-json');

		const result = MonetizationManager._getStoredLicense();
		if (result !== null) throw new Error('Expected null for invalid JSON');

		resetManager();
	}
});

// Test: _getStoredLicense returns null when nothing stored
testSuite.tests.push({
	name: '_getStoredLicense - returns null when nothing stored',
	async run() {
		resetManager();

		const result = MonetizationManager._getStoredLicense();
		if (result !== null) throw new Error('Expected null');
	}
});

// Test: _showConfirmation creates notification element
testSuite.tests.push({
	name: '_showConfirmation - creates notification element',
	async run() {
		resetManager();

		MonetizationManager._showConfirmation(null);

		const notification = document.querySelector('.supporter-notification');
		if (!notification) throw new Error('Expected notification in DOM');
		if (!notification.textContent.includes('License activated')) {
			throw new Error('Expected "License activated" in notification text');
		}

		// Clean up
		if (notification.parentNode) notification.parentNode.removeChild(notification);
	}
});

// Test: _showConfirmation shows expiry date for time-limited
testSuite.tests.push({
	name: '_showConfirmation - shows expiry for time-limited license',
	async run() {
		resetManager();

		const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
		MonetizationManager._showConfirmation(futureDate);

		const notification = document.querySelector('.supporter-notification');
		if (!notification) throw new Error('Expected notification in DOM');
		if (notification.textContent.includes('forever')) {
			throw new Error('Should not say "forever" for time-limited license');
		}

		if (notification.parentNode) notification.parentNode.removeChild(notification);
	}
});

// Test: _showConfirmation shows "forever" for perpetual
testSuite.tests.push({
	name: '_showConfirmation - shows "forever" for perpetual license',
	async run() {
		resetManager();

		MonetizationManager._showConfirmation(null);

		const notification = document.querySelector('.supporter-notification');
		if (!notification) throw new Error('Expected notification in DOM');
		if (!notification.textContent.includes('forever')) {
			throw new Error('Expected "forever" for perpetual license');
		}

		if (notification.parentNode) notification.parentNode.removeChild(notification);
	}
});

export default testSuite;
