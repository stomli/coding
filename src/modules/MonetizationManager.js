/**
 * ============================================================================
 * MonetizationManager.js - Orb•Fall: ChromaCrush
 * ============================================================================
 * Copyright (c) 2025 G. Scott Tomlin. All Rights Reserved.
 *
 * Manages Buy Me a Coffee integration and ad-free state:
 * - BMAC support button in UI
 * - Token redemption for ad-free periods
 * - Ad-free period management via localStorage
 * - Expiration warnings
 *
 * Constitution compliance:
 * - Donations are voluntary and optional
 * - Never guilt-trip or manipulate
 * - Fair ad-free periods for contributions
 * - No gameplay advantages for supporters
 *
 * @module MonetizationManager
 * ============================================================================
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { CONSTANTS } from '../utils/Constants.js';
import { ConfigManager } from './ConfigManager.js';

class MonetizationManagerClass {

	constructor() {
		/** @type {boolean} */
		this.bmacEnabled = false;
		/** @type {string} */
		this.bmacUsername = '';
		/** @type {boolean} */
		this.initialized = false;
	}

	/**
	 * Initialize the monetization manager with config settings
	 * @returns {void}
	 */
	initialize() {
		const bmacConfig = ConfigManager.get('monetization.bmac', null);

		if (!bmacConfig || !bmacConfig.enabled) {
			this.bmacEnabled = false;
			return;
		}

		this.bmacEnabled = true;
		this.bmacUsername = bmacConfig.username || '';

		this._addBMACButton();
		this._checkAdFreeStatus();
		this.initialized = true;
	}

	/**
	 * Add the floating BMAC support button to the page
	 * @private
	 * @returns {void}
	 */
	_addBMACButton() {
		// Don't add duplicate buttons
		if (document.querySelector('.bmac-button')) return;

		const buttonText = ConfigManager.get('monetization.bmac.buttonText', '☕ Support');

		const button = document.createElement('a');
		button.href = `https://www.buymeacoffee.com/${this.bmacUsername}`;
		button.target = '_blank';
		button.rel = 'noopener noreferrer';
		button.className = 'bmac-button';
		button.textContent = buttonText;

		document.body.appendChild(button);
	}

	/**
	 * Check current ad-free status and warn if expiring soon
	 * @private
	 * @returns {void}
	 */
	_checkAdFreeStatus() {
		const status = this.getAdFreeStatus();
		if (!status) return;

		if (status.daysRemaining <= 3) {
			this._showExpirationWarning(status.daysRemaining);
		}
	}

	/**
	 * Show a non-intrusive warning that ad-free is expiring
	 * @param {number} daysRemaining
	 * @private
	 * @returns {void}
	 */
	_showExpirationWarning(daysRemaining) {
		console.log(`[BMAC] Ad-free expires in ${daysRemaining} day(s)`);
	}

	/**
	 * Show the redeem dialog overlay
	 * @returns {void}
	 */
	showRedeemDialog() {
		// Don't create duplicate modals
		if (document.querySelector('.bmac-modal')) return;

		const modal = document.createElement('div');
		modal.className = 'bmac-modal';

		modal.innerHTML = `
			<div class="bmac-modal-content">
				<h2>Redeem Support Code</h2>
				<p>Thank you for supporting the game! Enter your code below to activate ad-free mode.</p>
				<input type="text" id="bmac-token-input" class="bmac-token-input" placeholder="BMAC-XXX-XXXXX-XXXX" />
				<div id="bmac-error" class="bmac-error"></div>
				<div class="bmac-modal-actions">
					<button id="bmac-redeem-btn" class="btn-primary">Redeem</button>
					<button id="bmac-cancel-btn" class="btn-secondary">Cancel</button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		document.getElementById('bmac-redeem-btn').addEventListener('click', () => {
			const token = document.getElementById('bmac-token-input').value.trim();
			this.redeemToken(token);
		});

		document.getElementById('bmac-cancel-btn').addEventListener('click', () => {
			if (modal.parentNode) {
				modal.parentNode.removeChild(modal);
			}
		});
	}

	/**
	 * Validate and redeem a BMAC support token
	 * @param {string} token - Token string in format BMAC-[amount]-[timestamp]-[signature]
	 * @returns {boolean} Whether redemption succeeded
	 */
	redeemToken(token) {
		if (!token) {
			this._showRedeemError('Please enter a token');
			return false;
		}

		if (!token.startsWith('BMAC-')) {
			this._showRedeemError('Invalid token format');
			return false;
		}

		const parts = token.split('-');
		if (parts.length !== 4) {
			this._showRedeemError('Invalid token structure');
			return false;
		}

		const amount = parseInt(parts[1]);
		const timestamp = parseInt(parts[2]);

		if (isNaN(amount) || amount < 1) {
			this._showRedeemError('Invalid token amount');
			return false;
		}

		if (isNaN(timestamp)) {
			this._showRedeemError('Invalid token timestamp');
			return false;
		}

		// Check token age (must be less than 1 year old)
		const tokenAge = Date.now() - timestamp;
		const oneYear = 365 * 24 * 60 * 60 * 1000;
		if (tokenAge > oneYear || tokenAge < 0) {
			this._showRedeemError('Token has expired');
			return false;
		}

		// Check if token was already used
		const usedTokens = JSON.parse(localStorage.getItem('monetization_used_tokens') || '[]');
		if (usedTokens.includes(token)) {
			this._showRedeemError('This token has already been redeemed');
			return false;
		}

		// Calculate ad-free days based on amount
		const days = this._calculateAdFreeDays(amount);

		// Activate ad-free
		this._activateAdFree(days, token);

		return true;
	}

	/**
	 * Calculate the number of ad-free days for a given donation amount
	 * @param {number} amount - Donation amount
	 * @returns {number} Number of ad-free days
	 */
	_calculateAdFreeDays(amount) {
		const periods = ConfigManager.get('monetization.bmac.adFreePeriods', {});
		const amounts = Object.keys(periods).map(Number).sort((a, b) => b - a);

		for (const tierAmount of amounts) {
			if (amount >= tierAmount) {
				return periods[tierAmount];
			}
		}

		// Default: 1 day per dollar
		return Math.max(1, Math.floor(amount));
	}

	/**
	 * Activate ad-free mode for a given number of days
	 * @param {number} days - Number of ad-free days
	 * @param {string} token - The redeemed token
	 * @private
	 * @returns {void}
	 */
	_activateAdFree(days, token) {
		const now = Date.now();
		const duration = days * 24 * 60 * 60 * 1000;
		const expirationTime = now + duration;

		// Store expiration
		localStorage.setItem('monetization_ad_free_until', expirationTime.toString());

		// Mark token as used
		const usedTokens = JSON.parse(localStorage.getItem('monetization_used_tokens') || '[]');
		usedTokens.push(token);
		localStorage.setItem('monetization_used_tokens', JSON.stringify(usedTokens));

		// Emit event so AdManager can react
		EventEmitter.emit(CONSTANTS.EVENTS.AD_FREE_ACTIVATED, { days, expirationTime });

		// Show confirmation
		this._showConfirmation(days);

		// Close modal
		const modal = document.querySelector('.bmac-modal');
		if (modal && modal.parentNode) {
			modal.parentNode.removeChild(modal);
		}
	}

	/**
	 * Show confirmation after successful redemption
	 * @param {number} days - Number of ad-free days activated
	 * @private
	 * @returns {void}
	 */
	_showConfirmation(days) {
		const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
		const dateString = expirationDate.toLocaleDateString();

		// Create a non-blocking notification instead of alert
		const notification = document.createElement('div');
		notification.className = 'bmac-notification';
		notification.innerHTML = `
			<p>✅ Thank you for your support!</p>
			<p>Ads disabled until ${dateString} (${days} days)</p>
		`;
		document.body.appendChild(notification);

		setTimeout(() => {
			notification.classList.add('bmac-notification-fade');
			setTimeout(() => {
				if (notification.parentNode) {
					notification.parentNode.removeChild(notification);
				}
			}, 500);
		}, 4000);
	}

	/**
	 * Show error message in the redeem dialog
	 * @param {string} message
	 * @private
	 * @returns {void}
	 */
	_showRedeemError(message) {
		const errorDiv = document.getElementById('bmac-error');
		if (errorDiv) {
			errorDiv.textContent = message;
			errorDiv.style.display = 'block';
		}
	}

	/**
	 * Get the current ad-free status
	 * @returns {Object|null} Status object with active, expiresAt, daysRemaining, or null
	 */
	getAdFreeStatus() {
		const adFreeUntil = localStorage.getItem('monetization_ad_free_until');
		if (!adFreeUntil) return null;

		const expirationTime = parseInt(adFreeUntil);
		const now = Date.now();

		if (now < expirationTime) {
			return {
				active: true,
				expiresAt: expirationTime,
				daysRemaining: Math.ceil((expirationTime - now) / (1000 * 60 * 60 * 24))
			};
		}

		return null;
	}
}

// Singleton instance
const MonetizationManager = new MonetizationManagerClass();

export default MonetizationManager;
export { MonetizationManager };
