/**
 * ============================================================================
 * PWAManager.js - Orb•Fall: ChromaCrush
 * ============================================================================
 * Copyright (c) 2025 G. Scott Tomlin. All Rights Reserved.
 *
 * Manages Progressive Web App functionality:
 * - Service worker registration and update detection
 * - Install prompt capture and triggering
 * - Online / offline state detection
 * - HUD offline indicator and update notification banner
 *
 * @module PWAManager
 * ============================================================================
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { CONSTANTS } from '../utils/Constants.js';
import { ConfigManager } from './ConfigManager.js';

class PWAManagerClass {

	constructor() {
		/** @type {BeforeInstallPromptEvent|null} */
		this.deferredPrompt = null;
		/** @type {boolean} */
		this.isInstalled = false;
		/** @type {boolean} */
		this.isOnline = navigator.onLine;
		/** @type {ServiceWorkerRegistration|null} */
		this.swRegistration = null;
		/** @type {boolean} */
		this.initialized = false;
	}

	/**
	 * Initialize PWA features — register SW, wire install prompt, monitor connectivity
	 * @returns {void}
	 */
	initialize() {
		// Register the service worker
		this._registerServiceWorker();

		// Capture install prompt before the browser discards it
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			this.deferredPrompt = e;
			this._showInstallButton();
			this._showInstallToast();
		});

		// Track successful installation
		window.addEventListener('appinstalled', () => {
			this.isInstalled = true;
			this.deferredPrompt = null;
			this._hideInstallButton();
			this._hideInstallToast();
			EventEmitter.emit(CONSTANTS.EVENTS.PWA_INSTALLED);
			console.log('[PWA] App installed');
		});

		// Monitor connectivity
		window.addEventListener('online', () => {
			this.isOnline = true;
			this._setOfflineIndicator(false);
			EventEmitter.emit(CONSTANTS.EVENTS.PWA_ONLINE);
		});

		window.addEventListener('offline', () => {
			this.isOnline = false;
			this._setOfflineIndicator(true);
			EventEmitter.emit(CONSTANTS.EVENTS.PWA_OFFLINE);
		});

		// Detect if already running as installed PWA
		const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
		const isStandaloneNav    = window.navigator.standalone === true;

		if (isStandaloneDisplay || isStandaloneNav) {
			this.isInstalled = true;
		}

		// Wire DOM controls (may be called after DOMContentLoaded so elements exist)
		this._wireInstallButton();
		this._wireInstallToast();
		this._wireUpdateBanner();

		// Apply initial offline state if already offline at load time
		if (!this.isOnline) {
			this._setOfflineIndicator(true);
		}

		this.initialized = true;
	}

	// ─── Private Methods ───────────────────────────────────────────────────────

	/**
	 * Register the service worker and listen for update events
	 * @private
	 * @returns {Promise<void>}
	 */
	async _registerServiceWorker() {
		if (!('serviceWorker' in navigator)) {
			console.log('[PWA] Service workers not supported');
			return;
		}

		try {
			const registration = await navigator.serviceWorker.register('/service-worker.js', {
				scope: '/'
			});

			this.swRegistration = registration;
			console.log('[PWA] Service worker registered, scope:', registration.scope);

			// Monitor for new SW versions
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;

				if (!newWorker) {
					return;
				}

				newWorker.addEventListener('statechange', () => {
					// A new version installed while an old SW still controls the page
					const isNewVersionReady = newWorker.state === 'installed';
					const hasActiveController = Boolean(navigator.serviceWorker.controller);

					if (isNewVersionReady && hasActiveController) {
						this._showUpdateBanner();
						EventEmitter.emit(CONSTANTS.EVENTS.PWA_UPDATE_AVAILABLE);
						console.log('[PWA] New version available');
					}
				});
			});

		} catch (error) {
			// SW registration failure is non-fatal — game still works, just no offline support
			console.warn('[PWA] Service worker registration failed:', error);
		}
	}

	/**
	 * Show the "Install App" setting row
	 * @private
	 * @returns {void}
	 */
	_showInstallButton() {
		const setting = document.getElementById('pwaInstallSetting');

		if (setting) {
			setting.style.display = '';
		}
	}

	/**
	 * Hide the "Install App" setting row (after install or if prompt unavailable)
	 * @private
	 * @returns {void}
	 */
	_hideInstallButton() {
		const setting = document.getElementById('pwaInstallSetting');

		if (setting) {
			setting.style.display = 'none';
		}
	}

	/**
	 * Wire the install button click handler
	 * @private
	 * @returns {void}
	 */
	_wireInstallButton() {
		const btn = document.getElementById('installAppButton');

		if (!btn) {
			return;
		}

		btn.addEventListener('click', async () => {
			await this.triggerInstall();
		});
	}

	/**
	 * Wire the install toast Accept / Dismiss buttons
	 * @private
	 * @returns {void}
	 */
	_wireInstallToast() {
		const acceptBtn  = document.getElementById('pwaInstallToastAccept');
		const dismissBtn = document.getElementById('pwaInstallToastDismiss');

		if (acceptBtn) {
			acceptBtn.addEventListener('click', async () => {
				this._hideInstallToast();
				await this.triggerInstall();
			});
		}

		if (dismissBtn) {
			dismissBtn.addEventListener('click', () => {
				this._hideInstallToast();
			});
		}
	}

	/**
	 * Show the install prompt toast
	 * @private
	 * @returns {void}
	 */
	_showInstallToast() {
		const toast = document.getElementById('pwaInstallToast');

		if (toast) {
			toast.classList.remove('hidden');
		}
	}

	/**
	 * Hide the install prompt toast
	 * @private
	 * @returns {void}
	 */
	_hideInstallToast() {
		const toast = document.getElementById('pwaInstallToast');

		if (toast) {
			toast.classList.add('hidden');
		}
	}

	/**
	 * Show a transient success toast after the app is installed
	 * @private
	 * @returns {void}
	 */
	_showInstalledToast() {
		const toast = document.createElement('div');
		toast.className = 'supporter-notification';
		toast.innerHTML = '<p>✅ App installed! Enjoy Orb•Fall on your home screen.</p>';
		document.body.appendChild(toast);

		setTimeout(() => {
			toast.classList.add('supporter-notification-fade');
			setTimeout(() => toast.remove(), 500);
		}, 3000);
	}

	/**
	 * Wire the update notification banner controls
	 * @private
	 * @returns {void}
	 */
	_wireUpdateBanner() {
		const reloadBtn  = document.getElementById('pwaUpdateButton');
		const dismissBtn = document.getElementById('pwaUpdateDismiss');

		if (reloadBtn) {
			reloadBtn.addEventListener('click', () => {
				// Reload so the new service worker takes control
				window.location.reload();
			});
		}

		if (dismissBtn) {
			dismissBtn.addEventListener('click', () => {
				const banner = document.getElementById('pwaUpdateBanner');

				if (banner) {
					banner.classList.add('hidden');
				}
			});
		}
	}

	/**
	 * Show the update available banner
	 * @private
	 * @returns {void}
	 */
	_showUpdateBanner() {
		const banner = document.getElementById('pwaUpdateBanner');

		if (banner) {
			banner.classList.remove('hidden');
		}
	}

	/**
	 * Show or hide the offline indicator in the HUD
	 * @param {boolean} offline - Whether the app is currently offline
	 * @private
	 * @returns {void}
	 */
	_setOfflineIndicator(offline) {
		const indicator = document.getElementById('offlineIndicator');

		if (!indicator) {
			return;
		}

		if (offline) {
			indicator.classList.remove('hidden');
		}
		else {
			indicator.classList.add('hidden');
		}
	}

	// ─── Public API ────────────────────────────────────────────────────────────

	/**
	 * Trigger the native browser install prompt.
	 * Resolves immediately if no prompt is available.
	 * @returns {Promise<void>}
	 */
	async triggerInstall() {
		if (!this.deferredPrompt) {
			console.log('[PWA] No install prompt available');
			return;
		}

		this.deferredPrompt.prompt();
		const { outcome } = await this.deferredPrompt.userChoice;
		console.log('[PWA] Install prompt outcome:', outcome);

		// Clear the prompt — it can only be used once
		this.deferredPrompt = null;

		if (outcome === 'accepted') {
			this._hideInstallButton();
			this._showInstalledToast();
		}
	}

	/**
	 * @returns {boolean} True if running as an installed PWA
	 */
	isAppInstalled() {
		return this.isInstalled;
	}

	/**
	 * @returns {boolean} True if the device currently has a network connection
	 */
	isAppOnline() {
		return this.isOnline;
	}
}

const PWAManager = new PWAManagerClass();
export default PWAManager;
