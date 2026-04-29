/**
 * WeatherBackground.js
 * 
 * Description: Fetches local weather based on IP geolocation and applies dynamic backgrounds
 * 
 * Dependencies: None
 * 
 * Exports: WeatherBackground singleton
 */

class WeatherBackgroundClass {
	constructor() {
		this.currentWeather = null;
		this.backgroundElement = null;
		this.lastUpdate = null;
		this.updateInterval = 30 * 60 * 1000; // Update every 30 minutes
		this.onWeatherUpdate = null; // Callback for when weather updates
	}

	/**
	 * Initialize weather background system
	 */
	async initialize() {
		
		// Create background element
		this.createBackgroundElement();
		
		// Fetch initial weather
		await this.updateWeather();
		
		// Set up periodic updates
		setInterval(() => this.updateWeather(), this.updateInterval);
	}

	/**
	 * Create the background DOM element
	 */
	createBackgroundElement() {
		this.backgroundElement = document.getElementById('weatherBackground');
		
		if (!this.backgroundElement) {
			this.backgroundElement = document.createElement('div');
			this.backgroundElement.id = 'weatherBackground';
			this.backgroundElement.className = 'weather-background';
			
			// Create effects container
			const effectsContainer = document.createElement('div');
			effectsContainer.className = 'weather-effects';
			this.backgroundElement.appendChild(effectsContainer);
			
			// Insert as first child of app to be behind everything
			const app = document.getElementById('app');
			if (app && app.firstChild) {
				app.insertBefore(this.backgroundElement, app.firstChild);
			} else if (app) {
				app.appendChild(this.backgroundElement);
			}
		}
	}

	/**
	 * Fetch weather data and update background
	 */
	async updateWeather() {
		try {
			
			// Use ipapi.co for IP geolocation (free, no API key required)
			const geoResponse = await fetch('https://ipapi.co/json/');
			const geoData = await geoResponse.json();
			
			if (!geoData.latitude || !geoData.longitude) {
				console.warn('WeatherBackground: Could not get location, using default');
				this.applyDefaultBackground();
				return;
			}

			// Use Open-Meteo API (free, no API key required)
			// Request both Celsius and Fahrenheit
			const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current=temperature_2m,weather_code,is_day,cloud_cover&temperature_unit=celsius&daily=sunrise,sunset&timezone=auto`;
			const weatherResponse = await fetch(weatherUrl);
			const weatherData = await weatherResponse.json();

			if (weatherData.current) {
				const tempC = Math.round(weatherData.current.temperature_2m);
				const tempF = Math.round((tempC * 9/5) + 32);
				
				this.currentWeather = {
					temperatureC: tempC,
					temperatureF: tempF,
					weatherCode: weatherData.current.weather_code,
					isDay: weatherData.current.is_day === 1,
					cloudCover: weatherData.current.cloud_cover || 0,
					location: `${geoData.city}, ${geoData.region}`,
					timestamp: new Date()
				};

				this.applyWeatherBackground();
				this.lastUpdate = Date.now();
				
				// Trigger callback if set
				if (this.onWeatherUpdate) {
					this.onWeatherUpdate(this.currentWeather);
				}
			}
		} catch (error) {
			console.error('WeatherBackground: Error fetching weather', error);
			this.applyDefaultBackground();
		}
	}

	/**
	 * Apply background based on weather conditions
	 */
	applyWeatherBackground() {
		if (!this.currentWeather || !this.backgroundElement) return;

		const { weatherCode, isDay, cloudCover } = this.currentWeather;
		const condition = this.getWeatherCondition(weatherCode);
		
		// Remove all weather classes
		this.backgroundElement.className = 'weather-background';
		
		// Add time of day class
		this.backgroundElement.classList.add(isDay ? 'day' : 'night');
		
		// Add weather condition class
		this.backgroundElement.classList.add(condition);
		
		// Apply weather effects
		this.applyWeatherEffects(condition, isDay, cloudCover);
	}
	
	/**
	 * Apply animated weather effects
	 */
	applyWeatherEffects(condition, isDay, cloudCover) {
		const effectsContainer = this.backgroundElement.querySelector('.weather-effects');
		if (!effectsContainer) return;
		
		// Clear existing effects
		effectsContainer.innerHTML = '';
		
		// Apply condition-specific effects
		switch (condition) {
			case 'clear':
				if (isDay) {
					this.addSun(effectsContainer);
				} else {
					this.addMoon(effectsContainer);
					this.addStars(effectsContainer, 100);
				}
				break;
				
			case 'cloudy':
				this.addClouds(effectsContainer, Math.max(3, Math.floor(cloudCover / 20)));
				if (!isDay) {
					this.addMoon(effectsContainer);
					this.addStars(effectsContainer, 30);
				}
				break;
				
			case 'rainy':
				this.addClouds(effectsContainer, 5);
				this.addRain(effectsContainer, 150);
				break;
				
			case 'snowy':
				this.addClouds(effectsContainer, 4);
				this.addSnow(effectsContainer, 80);
				break;
				
			case 'stormy':
				this.addClouds(effectsContainer, 6);
				this.addRain(effectsContainer, 200);
				this.addLightning(effectsContainer);
				break;
				
			case 'foggy':
				this.addFog(effectsContainer);
				if (!isDay) {
					this.addMoon(effectsContainer);
					this.addStars(effectsContainer, 20);
				}
				break;
		}
	}
	
	/**
	 * Add sun element
	 */
	addSun(container) {
		const sun = document.createElement('div');
		sun.className = 'weather-sun';
		container.appendChild(sun);
	}
	
	/**
	 * Add moon element with current phase, drawn on a <canvas> using the
	 * correct terminator-ellipse geometry for all 8 phases.
	 */
	addMoon(container) {
		const SIZE   = 80;  // canvas pixels — matches CSS width/height
		const MOON_R = 30;  // moon disc radius (leaves 10 px margin for glow)
		const cx = SIZE / 2;
		const cy = SIZE / 2;

		const canvas = document.createElement('canvas');
		canvas.width  = SIZE;
		canvas.height = SIZE;
		canvas.className = 'weather-moon';

		// ── Phase calculation ──────────────────────────────────────────────
		const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);
		const SYNODIC_DAYS   = 29.53058867;
		const elapsed  = (Date.now() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
		const cyclePos = ((elapsed % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS;
		const frac  = cyclePos / SYNODIC_DAYS; // 0 = new moon, 0.5 = full moon
		const angle = frac * 2 * Math.PI;
		const illum = (1 - Math.cos(angle)) / 2; // 0 = new, 1 = full
		canvas.setAttribute('data-phase', Math.floor(frac * 8));

		// ── Rendering ─────────────────────────────────────────────────────
		const ctx = canvas.getContext('2d');

		if (illum < 0.02) {
			// New moon — barely visible atmosphere ring
			ctx.beginPath();
			ctx.arc(cx, cy, MOON_R, 0, Math.PI * 2);
			ctx.fillStyle = 'rgba(80,90,120,0.2)';
			ctx.fill();
			container.appendChild(canvas);
			return;
		}

		// Dark disc base
		ctx.beginPath();
		ctx.arc(cx, cy, MOON_R, 0, Math.PI * 2);
		ctx.fillStyle = '#0d1220';
		ctx.fill();

		// ── Terminator geometry ───────────────────────────────────────────
		// terminatorX is the x-radius of the terminator ellipse:
		//   +MOON_R at new moon  (thin crescent visible)
		//       0  at quarter    (terminator is a straight vertical line)
		//   -MOON_R at full moon  (entire disc is lit)
		// Sign change at the quarter phases drives crescent ↔ gibbous.
		const terminatorX = MOON_R * Math.cos(angle);
		const isWaxing    = frac < 0.5; // light on right for waxing, left for waning

		// Trace the lit-area path:
		//   - Waxing: right semicircle (CW) + terminator ellipse bottom→top
		//   - Waning: left  semicircle (CCW) + terminator ellipse bottom→top
		// Crescent  (terminatorX ≥ 0): ellipse on the lit side  → CW(waxing) / CCW(waning)
		// Gibbous   (terminatorX < 0): ellipse on the dark side → CCW(waxing) / CW(waning)
		const absT = Math.max(Math.abs(terminatorX), 0.01); // guard against degenerate 0-radius

		const traceLitPath = () => {
			if (isWaxing) {
				ctx.arc(cx, cy, MOON_R, -Math.PI / 2, Math.PI / 2, false); // right semicircle CW
				if (terminatorX >= 0) {
					// Crescent: terminator CW (from bottom through right side of ellipse to top)
					ctx.ellipse(cx, cy, absT, MOON_R, 0, Math.PI / 2, -Math.PI / 2, false);
				} else {
					// Gibbous: terminator CCW (from bottom through left side of ellipse to top)
					ctx.ellipse(cx, cy, absT, MOON_R, 0, Math.PI / 2, -Math.PI / 2, true);
				}
			} else {
				ctx.arc(cx, cy, MOON_R, -Math.PI / 2, Math.PI / 2, true); // left semicircle CCW
				if (terminatorX <= 0) {
					// Gibbous: terminator CW
					ctx.ellipse(cx, cy, absT, MOON_R, 0, Math.PI / 2, -Math.PI / 2, false);
				} else {
					// Crescent: terminator CCW
					ctx.ellipse(cx, cy, absT, MOON_R, 0, Math.PI / 2, -Math.PI / 2, true);
				}
			}
		};

		// Fill the lit area
		ctx.beginPath();
		traceLitPath();
		ctx.closePath();
		ctx.fillStyle = '#f0efdf';
		ctx.fill();

		// Sphere shading gradient clipped to the lit area
		ctx.save();
		ctx.beginPath();
		traceLitPath();
		ctx.closePath();
		ctx.clip();
		const shading = ctx.createRadialGradient(
			cx - MOON_R * 0.3, cy - MOON_R * 0.3, 0,
			cx, cy, MOON_R
		);
		shading.addColorStop(0,   'rgba(255,255,255,0.28)');
		shading.addColorStop(0.5, 'rgba(255,255,255,0)');
		shading.addColorStop(1,   'rgba(0,0,0,0.22)');
		ctx.fillStyle = shading;
		ctx.fillRect(0, 0, SIZE, SIZE);
		ctx.restore();

		container.appendChild(canvas);
	}
	
	/**
	 * Add stars
	 */
	addStars(container, count) {
		for (let i = 0; i < count; i++) {
			const star = document.createElement('div');
			star.className = 'weather-star';
			star.style.left = Math.random() * 100 + '%';
			star.style.top = Math.random() * 100 + '%';
			star.style.animationDelay = Math.random() * 3 + 's';
			star.style.animationDuration = (Math.random() * 2 + 2) + 's';
			container.appendChild(star);
		}
	}
	
	/**
	 * Add clouds
	 */
	addClouds(container, count) {
		for (let i = 0; i < count; i++) {
			const cloud = document.createElement('div');
			cloud.className = 'weather-cloud';
			cloud.style.left = Math.random() * 100 + '%';
			cloud.style.top = (Math.random() * 40) + '%';
			cloud.style.animationDelay = Math.random() * 20 + 's';
			cloud.style.animationDuration = (Math.random() * 40 + 40) + 's';
			cloud.style.opacity = 0.3 + Math.random() * 0.4;
			cloud.style.transform = `scale(${0.5 + Math.random() * 0.8})`;
			container.appendChild(cloud);
		}
	}
	
	/**
	 * Add rain effect
	 */
	addRain(container, count) {
		for (let i = 0; i < count; i++) {
			const drop = document.createElement('div');
			drop.className = 'weather-rain';
			drop.style.left = Math.random() * 100 + '%';
			drop.style.animationDelay = Math.random() * 2 + 's';
			drop.style.animationDuration = (Math.random() * 0.3 + 0.5) + 's';
			container.appendChild(drop);
		}
	}
	
	/**
	 * Add snow effect
	 */
	addSnow(container, count) {
		for (let i = 0; i < count; i++) {
			const flake = document.createElement('div');
			flake.className = 'weather-snow';
			flake.style.left = Math.random() * 100 + '%';
			flake.style.animationDelay = Math.random() * 5 + 's';
			flake.style.animationDuration = (Math.random() * 3 + 3) + 's';
			flake.style.fontSize = (Math.random() * 10 + 10) + 'px';
			flake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
			container.appendChild(flake);
		}
	}
	
	/**
	 * Add lightning effect
	 */
	addLightning(container) {
		const lightning = document.createElement('div');
		lightning.className = 'weather-lightning';
		container.appendChild(lightning);
	}
	
	/**
	 * Add fog effect
	 */
	addFog(container) {
		for (let i = 0; i < 3; i++) {
			const fog = document.createElement('div');
			fog.className = 'weather-fog';
			fog.style.animationDelay = (i * 5) + 's';
			container.appendChild(fog);
		}
	}

	/**
	 * Convert WMO weather code to condition category
	 * @param {Number} code - WMO weather code
	 * @returns {String} - Weather condition category
	 */
	getWeatherCondition(code) {
		// WMO Weather interpretation codes
		if (code === 0) return 'clear';
		if (code <= 3) return 'cloudy';
		if (code >= 45 && code <= 48) return 'foggy';
		if (code >= 51 && code <= 67) return 'rainy';
		if (code >= 71 && code <= 77) return 'snowy';
		if (code >= 80 && code <= 82) return 'rainy';
		if (code >= 85 && code <= 86) return 'snowy';
		if (code >= 95 && code <= 99) return 'stormy';
		return 'cloudy';
	}

	/**
	 * Apply default background (clear day)
	 */
	applyDefaultBackground() {
		if (!this.backgroundElement) return;
		
		this.backgroundElement.className = 'weather-background day clear';
		console.log('WeatherBackground: Applied default background');
	}

	/**
	 * Get current weather info
	 * @returns {Object|null}
	 */
	getCurrentWeather() {
		return this.currentWeather;
	}
}

// Export singleton instance
const WeatherBackground = new WeatherBackgroundClass();
export default WeatherBackground;
