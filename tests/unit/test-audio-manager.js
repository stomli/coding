/**
 * Unit Tests for AudioManager
 */

import AudioManager from '../../src/modules/AudioManager.js';

export function runAudioManagerTests() {
	console.log('=== Running AudioManager Tests ===');
	
	const results = [];
	
	// Helper function to run a test
	function test(name, fn) {
		try {
			fn();
			console.log(`✓ ${name}`);
			results.push({ name, pass: true, error: null });
		} catch (error) {
			console.error(`✗ ${name}`);
			console.error(`  Error: ${error.message}`);
			results.push({ name, pass: false, error: error.message });
		}
	}
	
	// Helper function to assert
	function assert(condition, message) {
		if (!condition) {
			throw new Error(message || 'Assertion failed');
		}
	}
	
	function assertEquals(actual, expected, message) {
		if (actual !== expected) {
			throw new Error(message || `Expected ${expected}, got ${actual}`);
		}
	}
	
	function assertBetween(value, min, max, message) {
		if (value < min || value > max) {
			throw new Error(message || `Expected ${value} to be between ${min} and ${max}`);
		}
	}
	
	// Test: AudioManager initializes
	test('AudioManager initializes', () => {
		AudioManager.initialize();
		assert(AudioManager.isInitialized, 'Should be initialized');
	});
	
	// Test: Default volume settings
	test('AudioManager has default volume settings', () => {
		assertBetween(AudioManager.masterVolume, 0, 1, 'Master volume should be 0-1');
		assertBetween(AudioManager.sfxVolume, 0, 1, 'SFX volume should be 0-1');
		assertBetween(AudioManager.musicVolume, 0, 1, 'Music volume should be 0-1');
	});
	
	// Test: Set master volume
	test('setMasterVolume() updates master volume', () => {
		AudioManager.setMasterVolume(0.5);
		assertEquals(AudioManager.masterVolume, 0.5, 'Master volume should be 0.5');
	});
	
	// Test: Set SFX volume
	test('setSFXVolume() updates SFX volume', () => {
		AudioManager.setSFXVolume(0.6);
		assertEquals(AudioManager.sfxVolume, 0.6, 'SFX volume should be 0.6');
	});
	
	// Test: Set music volume
	test('setMusicVolume() updates music volume', () => {
		AudioManager.setMusicVolume(0.4);
		assertEquals(AudioManager.musicVolume, 0.4, 'Music volume should be 0.4');
	});
	
	// Test: Volume clamping
	test('Volume values are clamped to 0-1 range', () => {
		AudioManager.setMasterVolume(1.5);
		assertEquals(AudioManager.masterVolume, 1, 'Master volume should be clamped to 1');
		
		AudioManager.setMasterVolume(-0.5);
		assertEquals(AudioManager.masterVolume, 0, 'Master volume should be clamped to 0');
	});
	
	// Test: Mute functionality
	test('setMute() toggles mute state', () => {
		AudioManager.setMute(true);
		assertEquals(AudioManager.isMuted, true, 'Should be muted');
		
		AudioManager.setMute(false);
		assertEquals(AudioManager.isMuted, false, 'Should not be muted');
	});
	
	// Test: getEffectiveVolume returns 0 when muted
	test('getEffectiveVolume() returns 0 when muted', () => {
		AudioManager.setMute(true);
		const effectiveVolume = AudioManager.getEffectiveVolume();
		assertEquals(effectiveVolume, 0, 'Effective volume should be 0 when muted');
	});
	
	// Test: getEffectiveVolume calculates correctly when not muted
	test('getEffectiveVolume() calculates master * sfx when not muted', () => {
		AudioManager.setMute(false);
		AudioManager.setMasterVolume(0.8);
		AudioManager.setSFXVolume(0.5);
		const effectiveVolume = AudioManager.getEffectiveVolume();
		assertEquals(effectiveVolume, 0.4, 'Effective volume should be 0.8 * 0.5 = 0.4');
	});
	
	// Test: canPlaySound returns false when muted
	test('canPlaySound() returns false when muted', () => {
		AudioManager.setMute(true);
		const canPlay = AudioManager.canPlaySound();
		assertEquals(canPlay, false, 'Should not be able to play sound when muted');
	});
	
	// Test: canPlaySound returns false when not initialized
	test('canPlaySound() returns false when not initialized', () => {
		const tempManager = { isInitialized: false, isMuted: false };
		const canPlay = AudioManager.canPlaySound.call(tempManager);
		assertEquals(canPlay, false, 'Should not be able to play sound when not initialized');
	});
	
	// Test: Settings persistence
	test('Settings are saved to localStorage', () => {
		AudioManager.setMasterVolume(0.75);
		AudioManager.setSFXVolume(0.85);
		AudioManager.setMusicVolume(0.55);
		AudioManager.setMute(true);
		
		AudioManager.saveSettings();
		
		const saved = localStorage.getItem('audioSettings');
		assert(saved !== null, 'Settings should be saved to localStorage');
		
		const parsed = JSON.parse(saved);
		assertEquals(parsed.masterVolume, 0.75, 'Saved master volume should be 0.75');
		assertEquals(parsed.isMuted, true, 'Saved mute state should be true');
	});
	
	// Test: Settings are loaded from localStorage
	test('Settings are loaded from localStorage', () => {
		// Set up test data
		const testSettings = {
			masterVolume: 0.3,
			sfxVolume: 0.4,
			musicVolume: 0.2,
			isMuted: true
		};
		localStorage.setItem('audioSettings', JSON.stringify(testSettings));
		
		// Load settings
		AudioManager.loadSettings();
		
		assertEquals(AudioManager.masterVolume, 0.3, 'Master volume should be loaded');
		assertEquals(AudioManager.sfxVolume, 0.4, 'SFX volume should be loaded');
		assertEquals(AudioManager.musicVolume, 0.2, 'Music volume should be loaded');
		assertEquals(AudioManager.isMuted, true, 'Mute state should be loaded');
	});
	
	// Test: Sound methods exist and don't throw errors
	test('Sound playback methods exist', () => {
		assert(typeof AudioManager.playMove === 'function', 'playMove should be a function');
		assert(typeof AudioManager.playRotate === 'function', 'playRotate should be a function');
		assert(typeof AudioManager.playLock === 'function', 'playLock should be a function');
		assert(typeof AudioManager.playExplosion === 'function', 'playExplosion should be a function');
	});
	
	// Test: Music control methods exist
	test('Music control methods exist', () => {
		assert(typeof AudioManager.startMusic === 'function', 'startMusic should be a function');
		assert(typeof AudioManager.stopMusic === 'function', 'stopMusic should be a function');
	});
	
	// Test: Resume context method exists
	test('resume() method exists and is callable', () => {
		assert(typeof AudioManager.resume === 'function', 'resume should be a function');
		// Don't actually call it in tests as it's async and context-dependent
	});
	
	// Clean up
	localStorage.removeItem('audioSettings');
	
	// Summary
	const passed = results.filter(r => r.pass).length;
	const failed = results.filter(r => !r.pass).length;
	console.log(`\nAudioManager Tests: ${passed} passed, ${failed} failed\n`);
	
	return results;
}
