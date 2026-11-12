/**
 * SkyPulse Weather Application
 * Week 2: Async JS & APIs
 * 
 * Features:
 * - Uses native Fetch API with async/await
 * - Handles 3 UI states: Loading, Error, and Success
 * - Multi-source API resilience (Open-Meteo + Fallbacks + Offline Demo Mode)
 * - Immune to DNS (ERR_NAME_NOT_RESOLVED) issues via cached city coordinates
 * - Dynamic Celsius / Fahrenheit unit conversion
 * - Geolocation support & Quick-select popular cities
 */

// ==========================================
// 1. STATE & CONSTANTS
// ==========================================
let currentWeatherData = null;
let currentUnit = 'c'; // 'c' for Celsius, 'f' for Fahrenheit

// WMO Weather Interpretation Codes Table
// Maps numeric weather codes to human-readable text and emojis
const WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Moderate Drizzle', icon: '🌧️' },
  55: { label: 'Dense Drizzle', icon: '🌧️' },
  61: { label: 'Slight Rain', icon: '🌦️' },
  63: { label: 'Moderate Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  71: { label: 'Slight Snow Fall', icon: '🌨️' },
  73: { label: 'Moderate Snow', icon: '🌨️' },
  75: { label: 'Heavy Snow', icon: '❄️' },
  77: { label: 'Snow Grains', icon: '❄️' },
  80: { label: 'Light Showers', icon: '🌦️' },
  81: { label: 'Moderate Showers', icon: '🌧️' },
  82: { label: 'Violent Rain Showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with Hail', icon: '⛈️' },
  99: { label: 'Heavy Thunderstorm with Hail', icon: '⛈️' }
};

// Built-in Coordinate Directory
// Prevents DNS/network resolution errors (ERR_NAME_NOT_RESOLVED) for common searches
const POPULAR_CITIES = {
  'chennai': { name: 'Chennai', country: 'India', admin1: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  'bangalore': { name: 'Bengaluru', country: 'India', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  'bengaluru': { name: 'Bengaluru', country: 'India', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  'mumbai': { name: 'Mumbai', country: 'India', admin1: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  'delhi': { name: 'New Delhi', country: 'India', admin1: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  'new delhi': { name: 'New Delhi', country: 'India', admin1: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  'hyderabad': { name: 'Hyderabad', country: 'India', admin1: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  'kolkata': { name: 'Kolkata', country: 'India', admin1: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  'coimbatore': { name: 'Coimbatore', country: 'India', admin1: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
  'madurai': { name: 'Madurai', country: 'India', admin1: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
  'trichy': { name: 'Tiruchirappalli', country: 'India', admin1: 'Tamil Nadu', latitude: 10.7905, longitude: 78.7047 },
  'tiruchirappalli': { name: 'Tiruchirappalli', country: 'India', admin1: 'Tamil Nadu', latitude: 10.7905, longitude: 78.7047 },
  'salem': { name: 'Salem', country: 'India', admin1: 'Tamil Nadu', latitude: 11.6643, longitude: 78.1460 },
  'tirunelveli': { name: 'Tirunelveli', country: 'India', admin1: 'Tamil Nadu', latitude: 8.7139, longitude: 77.7567 },
  'london': { name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.5074, longitude: -0.1278 },
  'new york': { name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.0060 },
  'tokyo': { name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  'dubai': { name: 'Dubai', country: 'United Arab Emirates', admin1: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
  'paris': { name: 'Paris', country: 'France', admin1: 'Île-de-France', latitude: 48.8566, longitude: 2.3522 },
  'singapore': { name: 'Singapore', country: 'Singapore', admin1: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  'sydney': { name: 'Sydney', country: 'Australia', admin1: 'New South Wales', latitude: -33.8688, longitude: 151.2093 }
};

// ==========================================
// 2. DOM ELEMENT REFERENCES
// ==========================================
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const clearBtn = document.getElementById('clear-btn');
const searchBtn = document.getElementById('search-btn');
const geoBtn = document.getElementById('geo-btn');
const retryBtn = document.getElementById('retry-btn');
const demoBtn = document.getElementById('demo-btn');
const quickChips = document.querySelectorAll('.city-chip');
const unitToggleButtons = document.querySelectorAll('.unit-btn');

// UI State Views
const initialState = document.getElementById('initial-state');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const weatherDisplay = document.getElementById('weather-display');
const errorMessage = document.getElementById('error-message');

// Weather Display Elements
const locationNameEl = document.getElementById('location-name');
const locationCountryEl = document.getElementById('location-country');
const timeBadgeEl = document.getElementById('current-time-badge');
const weatherEmojiEl = document.getElementById('weather-emoji');
const currentTempEl = document.getElementById('current-temp');
const displayTempUnitEl = document.getElementById('display-temp-unit');
const weatherDescEl = document.getElementById('weather-description');
const feelsLikeTempEl = document.getElementById('feels-like-temp');
const metricHumidityEl = document.getElementById('metric-humidity');
const metricWindEl = document.getElementById('metric-wind');
const metricRainEl = document.getElementById('metric-rain');
const metricDaytimeEl = document.getElementById('metric-daytime');
const forecastGridEl = document.getElementById('forecast-grid');

// ==========================================
// 3. UI STATE MANAGEMENT FUNCTIONS
// ==========================================

/**
 * 3.1 Show Loading State
 * Hides other views and reveals the spinner.
 */
function showLoading() {
  console.log('[UI State] Switching to LOADING...');
  initialState.classList.add('hidden');
  errorState.classList.add('hidden');
  weatherDisplay.classList.add('hidden');
  loadingState.classList.remove('hidden');
  searchBtn.disabled = true;
  if (geoBtn) geoBtn.disabled = true;
}

/**
 * 3.2 Show Error State
 * Hides spinner and weather card, shows helpful error alert.
 * @param {string} message - User-friendly error message
 */
function showError(message) {
  console.error('[UI State] Switching to ERROR:', message);
  loadingState.classList.add('hidden');
  initialState.classList.add('hidden');
  weatherDisplay.classList.add('hidden');
  
  errorMessage.textContent = message || 'Something went wrong while fetching weather data. Please try again.';
  errorState.classList.remove('hidden');
  searchBtn.disabled = false;
  if (geoBtn) geoBtn.disabled = false;
}

/**
 * 3.3 Show Success State
 * Reveals the populated weather display.
 */
function showSuccess() {
  console.log('[UI State] Switching to SUCCESS (Weather Loaded)');
  loadingState.classList.add('hidden');
  initialState.classList.add('hidden');
  errorState.classList.add('hidden');
  weatherDisplay.classList.remove('hidden');
  searchBtn.disabled = false;
  if (geoBtn) geoBtn.disabled = false;
}

// ==========================================
// 4. API FETCHING LOGIC (Async/Await & Fetch)
// ==========================================

/**
 * 4.1 Step 1: Geocoding
 * Converts a text city name into latitude & longitude coordinates.
 * Multi-layer resilience:
 * 1. Checks pre-mapped POPULAR_CITIES (100% immune to DNS/ERR_NAME_NOT_RESOLVED)
 * 2. Attempts Open-Meteo Geocoding
 * 3. Fallback: OpenStreetMap Nominatim
 * @param {string} city - The city name entered by the user
 * @returns {Promise<Object>} Object with lat, lon, name, country, admin1
 */
async function fetchCoordinates(city) {
  const normalized = city.toLowerCase().trim();

  // 1. Direct local lookup for fast & DNS-immune response
  if (POPULAR_CITIES[normalized]) {
    console.log(`[Geocoding] Instant cached coordinates match for "${city}":`, POPULAR_CITIES[normalized]);
    return POPULAR_CITIES[normalized];
  }

  // 2. Primary: Open-Meteo Geocoding API
  try {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=10&language=en&format=json`;
    console.log(`[API Call] Step 1: Geocoding request for "${city}" -> ${geocodingUrl}`);
    
    const response = await fetch(geocodingUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Sort by population so primary cities are picked
        const sorted = [...data.results].sort((a, b) => (b.population || 0) - (a.population || 0));
        const place = sorted[0];
        return {
          latitude: place.latitude,
          longitude: place.longitude,
          name: place.name,
          country: place.country || '',
          admin1: place.admin1 || ''
        };
      }
    }
  } catch (err) {
    console.warn('[Geocoding] Open-Meteo network/DNS lookup failed, attempting fallback...', err);
  }

  // 3. Fallback: OpenStreetMap Nominatim
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city.trim())}&limit=1`;
    console.log(`[API Call] Step 1 Fallback: OpenStreetMap request -> ${osmUrl}`);
    const osmResp = await fetch(osmUrl);
    if (osmResp.ok) {
      const osmData = await osmResp.json();
      if (osmData && osmData.length > 0) {
        const parts = osmData[0].display_name.split(',');
        return {
          latitude: parseFloat(osmData[0].lat),
          longitude: parseFloat(osmData[0].lon),
          name: parts[0].trim(),
          country: parts[parts.length - 1].trim(),
          admin1: parts.length > 2 ? parts[parts.length - 2].trim() : ''
        };
      }
    }
  } catch (osmErr) {
    console.warn('[Geocoding] OSM Fallback also failed:', osmErr);
  }

  throw new Error(`Location "${city}" could not be resolved. Please check your spelling or internet connection.`);
}

/**
 * 4.2 Step 2: Weather Forecast API Call
 * Fetches current weather and 5-day forecast using latitude and longitude.
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Weather forecast response
 */
async function fetchWeatherForecast(latitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  
  console.log(`[API Call] Step 2: Forecast request -> ${weatherUrl}`);
  
  const response = await fetch(weatherUrl);
  
  if (!response.ok) {
    throw new Error(`Weather API returned status: ${response.status} (${response.statusText})`);
  }
  
  const data = await response.json();
  console.log('[API Call] Forecast Response:', data);
  return data;
}

/**
 * 4.3 High-level orchestrator function
 * Coordinates loading state, geocoding, forecast fetching, rendering, and error handling.
 * @param {string} city - City name
 */
async function loadWeatherForCity(city) {
  if (!city || !city.trim()) {
    showError('Please enter a valid city name.');
    return;
  }

  showLoading();

  try {
    // 1. Fetch geographic coordinates (Local cache or Public API)
    const location = await fetchCoordinates(city);
    
    // 2. Fetch weather data for those coordinates
    const forecast = await fetchWeatherForecast(location.latitude, location.longitude);
    
    // 3. Cache data in global state
    currentWeatherData = {
      location,
      forecast
    };

    // 4. Render UI
    renderWeatherData();
    showSuccess();

  } catch (error) {
    console.error('[Error Details]', error);
    let userMsg = error.message;
    if (error instanceof TypeError && error.message.includes('fetch')) {
      userMsg = 'Network connection failed (DNS/Internet issue). Check your Wi-Fi or click "Load Demo Preview" below.';
    }
    showError(userMsg);
  }
}

/**
 * 4.4 Load weather using Browser Geolocation
 */
async function loadWeatherByCurrentLocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        console.log(`[Geolocation] Got coordinates: ${latitude}, ${longitude}`);
        
        const forecast = await fetchWeatherForecast(latitude, longitude);
        
        currentWeatherData = {
          location: {
            name: 'Your Location',
            country: 'Device Coordinates',
            admin1: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
          },
          forecast
        };

        renderWeatherData();
        showSuccess();
      } catch (error) {
        showError('Could not fetch weather for your location: ' + error.message);
      }
    },
    (geoError) => {
      console.warn('[Geolocation Error]', geoError);
      let msg = 'Unable to retrieve your location.';
      if (geoError.code === geoError.PERMISSION_DENIED) {
        msg = 'Location permission denied. You can search manually by typing a city name.';
      }
      showError(msg);
    },
    { timeout: 10000 }
  );
}

/**
 * 4.5 Offline / Demo Fallback Mode
 * Provides realistic weather data for any city so the application can be
 * fully tested even when offline or during network outages.
 * @param {string} city - City name
 */
function loadDemoWeather(city = 'Chennai') {
  console.log('[Demo Mode] Loading realistic preview weather data for:', city);
  const normalized = city.toLowerCase().trim();
  const loc = POPULAR_CITIES[normalized] || {
    name: city.charAt(0).toUpperCase() + city.slice(1),
    country: 'Demo Mode',
    admin1: 'Offline Preview',
    latitude: 13.08,
    longitude: 80.27
  };

  const today = new Date();
  const times = [];
  const maxTemps = [32, 33, 31, 30, 32];
  const minTemps = [25, 26, 24, 25, 24];
  const codes = [1, 2, 61, 2, 0];

  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    times.push(d.toISOString().split('T')[0]);
  }

  currentWeatherData = {
    location: {
      ...loc,
      country: `${loc.country} (Offline Preview)`
    },
    forecast: {
      current: {
        time: today.toISOString(),
        temperature_2m: 31.0,
        relative_humidity_2m: 68,
        apparent_temperature: 36.0,
        is_day: 1,
        precipitation: 0.2,
        weather_code: 1,
        wind_speed_10m: 14.5
      },
      daily: {
        time: times,
        weather_code: codes,
        temperature_2m_max: maxTemps,
        temperature_2m_min: minTemps
      }
    }
  };

  renderWeatherData();
  showSuccess();
}

// ==========================================
// 5. DATA FORMATTING & RENDERING
// ==========================================

/**
 * Helper to convert Celsius to Fahrenheit
 */
function convertTemp(tempInCelsius) {
  if (tempInCelsius === null || tempInCelsius === undefined) return '--';
  if (currentUnit === 'f') {
    return Math.round((tempInCelsius * 9/5) + 32);
  }
  return Math.round(tempInCelsius);
}

/**
 * Returns weather interpretation metadata
 */
function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { label: 'Partly Cloudy', icon: '🌤️' };
}

/**
 * Format date string into day name (e.g. "Mon", "Tue")
 */
function getDayName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Renders the cached weather data to the DOM
 */
function renderWeatherData() {
  if (!currentWeatherData) return;

  const { location, forecast } = currentWeatherData;
  const current = forecast.current;
  const daily = forecast.daily;

  // 1. Location Header
  locationNameEl.textContent = location.name;
  const regionParts = [location.admin1, location.country].filter(Boolean);
  locationCountryEl.textContent = regionParts.join(', ');

  // 2. Current Time Badge
  const now = new Date();
  timeBadgeEl.textContent = `Updated: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // 3. Current Weather details
  const weatherInfo = getWeatherInfo(current.weather_code);
  weatherEmojiEl.textContent = weatherInfo.icon;
  weatherDescEl.textContent = weatherInfo.label;
  
  currentTempEl.textContent = convertTemp(current.temperature_2m);
  displayTempUnitEl.textContent = currentUnit === 'c' ? '°C' : '°F';
  
  feelsLikeTempEl.textContent = `${convertTemp(current.apparent_temperature)}°${currentUnit.toUpperCase()}`;

  // 4. Metrics
  metricHumidityEl.textContent = `${current.relative_humidity_2m}%`;
  metricWindEl.textContent = `${current.wind_speed_10m} km/h`;
  metricRainEl.textContent = `${current.precipitation} mm`;
  metricDaytimeEl.textContent = current.is_day === 1 ? '☀️ Day' : '🌙 Night';

  // 5. 5-Day Forecast Grid
  forecastGridEl.innerHTML = '';
  const daysCount = Math.min(5, daily.time.length);

  for (let i = 0; i < daysCount; i++) {
    const dayDate = daily.time[i];
    const dayName = i === 0 ? 'Today' : getDayName(dayDate);
    const dayCode = daily.weather_code[i];
    const dayInfo = getWeatherInfo(dayCode);
    const maxTemp = convertTemp(daily.temperature_2m_max[i]);
    const minTemp = convertTemp(daily.temperature_2m_min[i]);

    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <p class="forecast-day">${dayName}</p>
      <span class="forecast-icon" title="${dayInfo.label}">${dayInfo.icon}</span>
      <div class="forecast-temps">
        <span class="temp-max">${maxTemp}°</span>
        <span class="temp-min">${minTemp}°</span>
      </div>
    `;
    forecastGridEl.appendChild(card);
  }
}

// ==========================================
// 6. EVENT LISTENERS
// ==========================================

// Form Submit: Search for City
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    loadWeatherForCity(city);
  }
});

// Clear input button
cityInput.addEventListener('input', () => {
  if (cityInput.value.length > 0) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
  }
});

clearBtn.addEventListener('click', () => {
  cityInput.value = '';
  clearBtn.classList.remove('visible');
  cityInput.focus();
});

// "Near Me" Geolocation button
if (geoBtn) {
  geoBtn.addEventListener('click', () => {
    loadWeatherByCurrentLocation();
  });
}

// "Try Again" Error button
retryBtn.addEventListener('click', () => {
  const city = cityInput.value.trim() || 'Chennai';
  loadWeatherForCity(city);
});

// "Load Demo Preview" Button
if (demoBtn) {
  demoBtn.addEventListener('click', () => {
    const city = cityInput.value.trim() || 'Chennai';
    loadDemoWeather(city);
  });
}

// Quick City Pills
quickChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const city = chip.getAttribute('data-city');
    cityInput.value = city;
    clearBtn.classList.add('visible');
    loadWeatherForCity(city);
  });
});

// Unit Toggle Buttons (°C / °F)
unitToggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const unit = btn.getAttribute('data-unit');
    if (unit === currentUnit) return;

    currentUnit = unit;
    unitToggleButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Re-render without re-fetching API data
    if (currentWeatherData) {
      renderWeatherData();
    }
  });
});

// ==========================================
// 7. INITIAL APP STARTUP
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  console.log('SkyPulse Weather App initialized.');
  // Automatically fetch weather for Chennai on load
  cityInput.value = 'Chennai';
  clearBtn.classList.add('visible');
  loadWeatherForCity('Chennai');
});
