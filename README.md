# SkyPulse Weather App — Week 2: Async JS & APIs

> **Task Hand-in Statement (One Sentence):**  
> *"A responsive, single-page weather forecast web application built with vanilla JavaScript using asynchronous `fetch()` with `async/await` to consume the public Open-Meteo REST API, providing robust loading, error, and success state handling."*

---

## 📋 Project Overview

**SkyPulse** is a clean, modern, and professional weather application built for the **Week 2: Async JS & APIs** compulsory assignment. It allows users to search for any city globally, view real-time meteorological conditions, check a 5-day weather forecast, switch between Celsius (°C) and Fahrenheit (°F), or discover their local weather via browser geolocation.

### Public API Used
- **Open-Meteo REST API** ([open-meteo.com](https://open-meteo.com/))
  - Geocoding API: `https://geocoding-api.open-meteo.com/v1/search`
  - Weather Forecast API: `https://api.open-meteo.com/v1/forecast`
  - *Benefits:* 100% Free, requires no API key, zero setup hassle for mentors and evaluators, blazing fast response times.

---

## 🚀 How to Run the Project

No build tools, npm packages, or bundlers are required.

1. **Option 1 (Instant):**  
   Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

2. **Option 2 (Live Server / HTTP):**  
   If using VS Code, right-click `index.html` and select **Open with Live Server**, or run:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
   Open `http://localhost:8000` in your browser.

---

## 🎯 4-Part Step-by-Step Implementation

Following the assignment instructions, this project was broken down into 4 clear milestones:

1. **Part 1: HTML & CSS Structure (UI States)**
   - Created clean, semantic HTML5 structure.
   - Built styled components for **Loading State** (animated spinner), **Error State** (styled alert with retry action), and **Success State** (weather card + 5-day forecast grid).
   - Designed responsive modern layout using CSS variables, flexbox, and CSS grid.

2. **Part 2: Geocoding & Asynchronous Fetch**
   - Implemented `fetchCoordinates(cityName)` using `async/await`.
   - Included input sanitization and `response.ok` validation.
   - Handled non-existent cities gracefully before requesting weather data.

3. **Part 3: Weather Data Fetching & Dynamic Rendering**
   - Implemented `fetchWeatherForecast(lat, lon)` to retrieve current conditions and daily forecasts.
   - Mapped WMO standard weather interpretation codes to intuitive emojis and descriptions.
   - Built `renderWeatherData()` to dynamically populate DOM nodes without page reloads.

4. **Part 4: State Management, Unit Conversion & Error Resilience**
   - Implemented `showLoading()`, `showError(message)`, and `showSuccess()` transitions.
   - Added instant °C / °F conversion using cached data (no unnecessary re-fetches).
   - Added geolocation fallback and popular city quick-select pills.

---

## 🔄 UI State Management (Compulsory Requirement)

The app strictly handles the three core states:

| State | Visual Behavior | Trigger |
| :--- | :--- | :--- |
| **Loading** ⏳ | Displays an animated spinner and status label *"Fetching current weather data..."*; search buttons are temporarily disabled. | When user submits a search, clicks a quick chip, or clicks "Near Me". |
| **Error** ⚠️ | Displays an alert banner explaining what went wrong (e.g. invalid city, network failure, or denied location permission) with a *"Try Again"* button. | When a city cannot be found, network disconnects, or API returns non-200. |
| **Success** 🌤️ | Hides loaders and errors; displays current weather card, metrics grid (humidity, wind speed, precipitation, day/night), and a 5-day forecast. | When API returns valid coordinate and meteorological JSON. |

### How to Test Each State:
- **Test Success:** Search for `Chennai`, `London`, or `Tokyo`, or click any of the popular city chips.
- **Test Error:** Search for a non-existent name like `xyz123abc` or disable your internet connection.
- **Test Loading:** Open DevTools > Network tab, throttle to "Slow 3G", and search any city to clearly observe the loading spinner and state transition.

---

## 💡 What I Built & What I Learned (Submission Note)

### What I Built:
- An end-to-end weather web app that accepts user queries, queries a two-step public REST API chain (Geocoding $\to$ Weather), and displays live temperature, feels-like temperature, humidity, wind speed, precipitation, and a 5-day forecast.
- Added user experience enhancements: quick city pills, input clear button, Enter key submission, device geolocation, and Celsius/Fahrenheit toggle.

### What I Learned:
1. **The Fetch API & Promises:**
   - How `fetch()` returns a `Promise` that resolves to a `Response` object.
   - Why `fetch()` does **not** reject HTTP errors (like 404 or 500); we must explicitly verify `if (!response.ok) throw new Error(...)`.
2. **`async` / `await` Syntax:**
   - How `async/await` transforms asynchronous promise chains into readable, synchronous-looking code.
   - Proper placement of `try...catch...finally` blocks to guarantee loaders are cleared even if an error is thrown.
3. **Chaining Asynchronous APIs:**
   - Orchestrating multi-step API flows where the output of API 1 (latitude & longitude from Geocoding) becomes the input parameter for API 2 (Weather forecast).
4. **Resilient UI State Architecture:**
   - Avoiding UI flickering and conflicting states by managing a single active state (`loading`, `error`, or `success`).
5. **DOM Manipulation & State Caching:**
   - Caching the fetched data in memory so users can toggle units (°C $\leftrightarrow$ °F) instantly without making redundant network calls.

---

## 📂 File Structure

```
Async JS & APIs/
│
├── index.html        # Semantic HTML5 markup with 3 distinct state views
├── style.css         # Clean, responsive CSS with modern glassmorphism & typography
├── app.js            # Modular async JavaScript, fetch() calls, and state controllers
└── README.md         # Submission documentation, learning note & task summary
```

---

## 📚 References & Documentation
- [MDN: Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN: Making asynchronous programming easier with async and await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)
- [Open-Meteo Documentation](https://open-meteo.com/en/docs)

