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
			const response = await fetch('config.json');
			const isSuccess = response.ok;
			
			// Parse JSON if successful
			if (isSuccess) {
				this.config = await response.json();
				this.isLoaded = true;
				return this.config;
			}
			else {
				throw new Error(`Failed to load config: ${response.status}`);
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
	
}

// Create singleton instance
const ConfigManager = new ConfigManagerClass();

export default ConfigManager;
export { ConfigManager };
