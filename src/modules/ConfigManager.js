/**
 * ConfigManager.js
 * 
 * Description: Manages game configuration loading and access
 * 
 * Dependencies: Helpers
 * 
 * Exports: ConfigManager singleton with loadConfig, get, and getAll methods
 */

import { getNestedProperty } from '../utils/Helpers.js';

/**
 * Configuration manager class
 */
class ConfigManagerClass {
	
	/**
	 * Constructor initializes config to null
	 */
	constructor() {
		this.config = null;
		this.isLoaded = false;
	}
	
	/**
	 * Load configuration from config.json
	 * @returns {Promise<Object>} Configuration object
	 */
	async loadConfig() {
		const hasConfig = this.config !== null;
		
		// Return cached config if already loaded
		if (hasConfig) {
			return this.config;
		}
		else {
			// Load config from file
		}
		
		try {
			// Try multiple possible paths (for tests and normal operation)
			const possiblePaths = ['./config.json', '../config.json', '../../config.json'];
			let response = null;
			let loadedPath = null;
			
			for (const path of possiblePaths) {
				try {
					response = await fetch(path);
					if (response.ok) {
						loadedPath = path;
						break;
					}
				} catch (e) {
					// Try next path
					continue;
				}
			}
			
			// Parse JSON if successful
			if (response && response.ok) {
				this.config = await response.json();
				this.isLoaded = true;
				return this.config;
			}
			else {
				throw new Error(`Failed to load config: Could not find config.json in any expected location`);
			}
		}
		catch (error) {
			console.error('ConfigManager: Error loading config.json', error);
			throw error;
		}
	}
	
	/**
	 * Get a configuration value by key (supports dot notation)
	 * @param {String} key - Configuration key (e.g., 'colors.balls.red')
	 * @param {*} defaultValue - Default value if key not found
	 * @returns {*} Configuration value or default
	 */
	get(key, defaultValue = null) {
		const hasConfig = this.config !== null;
		
		// Return default if config not loaded
		if (!hasConfig) {
			console.warn('ConfigManager: Config not loaded yet');
			return defaultValue;
		}
		else {
			// Config loaded, get value
		}
		
		return getNestedProperty(this.config, key, defaultValue);
	}
	
	/**
	 * Get the entire configuration object
	 * @returns {Object|null} Complete configuration or null if not loaded
	 */
	getAll() {
		return this.config;
	}
	
	/**
	 * Check if configuration is loaded
	 * @returns {Boolean} True if loaded, false otherwise
	 */
	isConfigLoaded() {
		return this.isLoaded;
	}
	
	/**
	 * Resolve difficulty modifiers for a mode+difficulty pair.
	 * Mode-specific overrides are merged on top of defaults.
	 * @param {String} mode - Game mode (e.g. 'CLASSIC', 'ZEN')
	 * @param {Number} difficulty - Difficulty level (1-5)
	 * @returns {{ lockDelay: Number, diagonalScoreMultiplier: Number, painterSpawnMultiplier: Number }}
	 */
	getModifiers(mode, difficulty) {
		const diffKey = `difficulty${difficulty}`;
		const defaults = this.get(`modifiers.defaults.${diffKey}`, {});
		const modeOverrides = this.get(`modifiers.${mode}.${diffKey}`, {});
		return {
			lockDelay: 500,
			diagonalScoreMultiplier: 1.0,
			painterSpawnMultiplier: 1.0,
			...defaults,
			...modeOverrides
		};
	}
	
}

// Create singleton instance
const ConfigManager = new ConfigManagerClass();

export default ConfigManager;
export { ConfigManager };
