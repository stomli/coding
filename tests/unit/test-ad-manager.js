/**
 * test-ad-manager.js
 *
 * Unit tests for AdManager module
 */

import { AdManager } from '../../src/modules/AdManager.js';
import { ConfigManager } from '../../src/modules/ConfigManager.js';
import { EventEmitter } from '../../src/utils/EventEmitter.js';
import { CONSTANTS } from '../../src/utils/Constants.js';

// Test Suite
const testSuite = {
	name: 'AdManager Tests',
	tests: []
};

// Helper: reset AdManager state between tests
function resetAdManager() {
	AdManager.adsEnabled = false;
	AdManager.gameOverCount = 0;
	AdManager.levelCompleteCount = 0;
	AdManager.lastInterstitialTime = 0;
	AdManager.scriptLoaded = false;
	AdManager.initialized = false;
	localStorage.removeItem('monetization_ad_free_until');
}

// Test: isAdFree returns false when no localStorage key
testSuite.tests.push({
	name: 'isAdFree - returns false when no ad-free key in localStorage',
	async run() {
		resetAdManager();

		const result = AdManager.isAdFree();
		if (result !== false) {
			throw new Error(`Expected false, got ${result}`);
		}
	}
});

// Test: isAdFree returns true when ad-free period is active
testSuite.tests.push({
	name: 'isAdFree - returns true when ad-free period is active',
	async run() {
		resetAdManager();
		const futureTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
		localStorage.setItem('monetization_ad_free_until', futureTime.toString());

		const result = AdManager.isAdFree();
		if (result !== true) {
			throw new Error(`Expected true, got ${result}`);
		}

		localStorage.removeItem('monetization_ad_free_until');
	}
});

// Test: isAdFree returns false and cleans up when period has expired
testSuite.tests.push({
	name: 'isAdFree - returns false and cleans up expired period',
	async run() {
		resetAdManager();
		const pastTime = Date.now() - 1000;
		localStorage.setItem('monetization_ad_free_until', pastTime.toString());

		const result = AdManager.isAdFree();
		if (result !== false) {
			throw new Error(`Expected false, got ${result}`);
		}

		const stored = localStorage.getItem('monetization_ad_free_until');
		if (stored !== null) {
			throw new Error('Expected localStorage key to be removed after expiry');
		}
	}
});

// Test: canShowInterstitial returns false when ads disabled
testSuite.tests.push({
	name: 'canShowInterstitial - returns false when ads disabled',
	async run() {
		resetAdManager();
		AdManager.adsEnabled = false;

		const result = AdManager.canShowInterstitial();
		if (result !== false) {
			throw new Error(`Expected false, got ${result}`);
		}
	}
});

// Test: canShowInterstitial returns false when within min interval
testSuite.tests.push({
	name: 'canShowInterstitial - returns false within min interval',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;
		AdManager.lastInterstitialTime = Date.now(); // Just shown

		const result = AdManager.canShowInterstitial();
		if (result !== false) {
			throw new Error(`Expected false (within min interval), got ${result}`);
		}
	}
});

// Test: canShowInterstitial returns true when enough time has passed
testSuite.tests.push({
	name: 'canShowInterstitial - returns true after min interval',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;
		AdManager.lastInterstitialTime = Date.now() - 400000; // 400s ago, > 300s min

		const result = AdManager.canShowInterstitial();
		if (result !== true) {
			throw new Error(`Expected true, got ${result}`);
		}
	}
});

// Test: canShowInterstitial returns false when ad-free is active
testSuite.tests.push({
	name: 'canShowInterstitial - returns false when ad-free active',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;
		AdManager.lastInterstitialTime = 0;
		const futureTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
		localStorage.setItem('monetization_ad_free_until', futureTime.toString());

		const result = AdManager.canShowInterstitial();
		if (result !== false) {
			throw new Error(`Expected false (ad-free active), got ${result}`);
		}

		localStorage.removeItem('monetization_ad_free_until');
	}
});

// Test: _onGameOver increments counter
testSuite.tests.push({
	name: '_onGameOver - increments game over counter',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;

		AdManager._onGameOver();
		if (AdManager.gameOverCount !== 1) {
			throw new Error(`Expected gameOverCount 1, got ${AdManager.gameOverCount}`);
		}

		AdManager._onGameOver();
		if (AdManager.gameOverCount !== 2) {
			throw new Error(`Expected gameOverCount 2, got ${AdManager.gameOverCount}`);
		}
	}
});

// Test: _onLevelComplete increments counter
testSuite.tests.push({
	name: '_onLevelComplete - increments level complete counter',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;

		AdManager._onLevelComplete();
		if (AdManager.levelCompleteCount !== 1) {
			throw new Error(`Expected levelCompleteCount 1, got ${AdManager.levelCompleteCount}`);
		}
	}
});

// Test: showInterstitial creates overlay DOM element
testSuite.tests.push({
	name: 'showInterstitial - creates overlay element when conditions met',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;
		AdManager.lastInterstitialTime = 0;

		const shown = AdManager.showInterstitial();
		const overlay = document.getElementById('interstitial-overlay');

		if (!shown) {
			throw new Error('Expected showInterstitial to return true');
		}
		if (!overlay) {
			throw new Error('Expected interstitial overlay to exist in DOM');
		}

		// Clean up
		if (overlay && overlay.parentNode) {
			overlay.parentNode.removeChild(overlay);
		}
	}
});

// Test: showInterstitial returns false when too soon
testSuite.tests.push({
	name: 'showInterstitial - returns false when called too soon',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;
		AdManager.lastInterstitialTime = Date.now(); // Just shown

		const shown = AdManager.showInterstitial();
		if (shown !== false) {
			throw new Error(`Expected false, got ${shown}`);
		}
	}
});

// Test: showInterstitial overlay has skip button
testSuite.tests.push({
	name: 'showInterstitial - overlay contains skip button',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;
		AdManager.lastInterstitialTime = 0;

		AdManager.showInterstitial();
		const overlay = document.getElementById('interstitial-overlay');
		const skipBtn = overlay ? overlay.querySelector('.skip-ad-button') : null;

		if (!skipBtn) {
			throw new Error('Expected skip button in interstitial overlay');
		}

		// Skip button should start disabled
		if (!skipBtn.disabled) {
			throw new Error('Expected skip button to start disabled');
		}

		// Clean up
		if (overlay && overlay.parentNode) {
			overlay.parentNode.removeChild(overlay);
		}
	}
});

// Test: showInterstitial overlay has ad label for transparency
testSuite.tests.push({
	name: 'showInterstitial - overlay has Advertisement label',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;
		AdManager.lastInterstitialTime = 0;

		AdManager.showInterstitial();
		const overlay = document.getElementById('interstitial-overlay');
		const label = overlay ? overlay.querySelector('.interstitial-label') : null;

		if (!label) {
			throw new Error('Expected Advertisement label in overlay');
		}
		if (!label.textContent.includes('Advertisement')) {
			throw new Error(`Expected label text to contain "Advertisement", got "${label.textContent}"`);
		}

		// Clean up
		if (overlay && overlay.parentNode) {
			overlay.parentNode.removeChild(overlay);
		}
	}
});

// Test: skip button removes overlay when clicked
testSuite.tests.push({
	name: 'showInterstitial - skip button removes overlay on click',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;
		AdManager.lastInterstitialTime = 0;

		AdManager.showInterstitial();
		const overlay = document.getElementById('interstitial-overlay');
		const skipBtn = overlay ? overlay.querySelector('.skip-ad-button') : null;

		if (!skipBtn) throw new Error('No skip button found');

		// Enable the button manually to test click
		skipBtn.disabled = false;
		skipBtn.click();

		const overlayAfter = document.getElementById('interstitial-overlay');
		if (overlayAfter) {
			overlayAfter.parentNode.removeChild(overlayAfter);
			throw new Error('Expected overlay to be removed after skip click');
		}
	}
});

// Test: _onAdFreeActivated disables ads
testSuite.tests.push({
	name: '_onAdFreeActivated - disables ads',
	async run() {
		resetAdManager();
		AdManager.adsEnabled = true;

		AdManager._onAdFreeActivated();
		if (AdManager.adsEnabled !== false) {
			throw new Error('Expected adsEnabled to be false after ad-free activation');
		}
	}
});

// Test: reset clears counters
testSuite.tests.push({
	name: 'reset - clears all counters',
	async run() {
		resetAdManager();
		AdManager.gameOverCount = 5;
		AdManager.levelCompleteCount = 3;
		AdManager.lastInterstitialTime = 12345;

		AdManager.reset();

		if (AdManager.gameOverCount !== 0) {
			throw new Error(`Expected gameOverCount 0, got ${AdManager.gameOverCount}`);
		}
		if (AdManager.levelCompleteCount !== 0) {
			throw new Error(`Expected levelCompleteCount 0, got ${AdManager.levelCompleteCount}`);
		}
		if (AdManager.lastInterstitialTime !== 0) {
			throw new Error(`Expected lastInterstitialTime 0, got ${AdManager.lastInterstitialTime}`);
		}
	}
});

// Test: interstitial frequency - game over triggers on 3rd occurrence
testSuite.tests.push({
	name: 'Game over frequency - interstitial shown on every Nth game over',
	async run() {
		await ConfigManager.loadConfig();
		resetAdManager();
		AdManager.adsEnabled = true;
		AdManager.lastInterstitialTime = 0;

		// First 2 game overs should not show interstitial
		AdManager._onGameOver();
		AdManager._onGameOver();

		let overlay = document.getElementById('interstitial-overlay');
		if (overlay) {
			overlay.parentNode.removeChild(overlay);
			throw new Error('Interstitial should not show before frequency threshold');
		}

		// 3rd game over should trigger interstitial (frequency default = 3)
		AdManager._onGameOver();
		overlay = document.getElementById('interstitial-overlay');

		if (!overlay) {
			throw new Error('Expected interstitial on 3rd game over (frequency = 3)');
		}

		// Clean up
		if (overlay && overlay.parentNode) {
			overlay.parentNode.removeChild(overlay);
		}
	}
});

export default testSuite;
