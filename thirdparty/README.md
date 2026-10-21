# Third-Party API Integrations

Four minimal, self-contained third-party API applications built with Node.js and Express.
Each folder has its own `server.js`, `public/index.html`, and `package.json`.

---

## 🚀 Quick Start (After Cloning)

```bash
# 1. Clone the repository
git clone https://github.com/scarletslayer2006/thirdparty.git
cd thirdparty

# 2. Pick any app you want to run:
cd weather   # or cd currency / cd aqi / cd nasa
npm install
node server.js
```

## 1. Weather App (`weather/`)
- **Port**: `3001`
- **API**: Open-Meteo Geocoding & Weather API (Free, no key needed)
- **Features**: City temperature, wind speed, and observation time.
- **Run**:
  ```bash
  cd weather
  node server.js
  ```
  Open `http://localhost:3001`

---

## 2. Currency Converter (`currency/`)
- **Port**: `3002`
- **API**: Frankfurter Exchange Rates API (Free, no key needed)
- **Features**: Convert values between worldwide currencies.
- **Run**:
  ```bash
  cd currency
  node server.js
  ```
  Open `http://localhost:3002`

---

## 3. Air Quality Index (AQI) Checker (`aqi/`)
- **Port**: `3003`
- **API**: Open-Meteo Geocoding & Air Quality API (Free, no key needed)
- **Features**: Live US AQI, Category, PM 2.5, PM 10, and Carbon Monoxide.
- **Run**:
  ```bash
  cd aqi
  node server.js
  ```
  Open `http://localhost:3003`

---

## 4. NASA Astronomy Picture of the Day (`nasa/`)
- **Port**: `3004`
- **API**: NASA APOD API (`DEMO_KEY` configured in `.env`)
- **Features**: Select a date and fetch Astronomy Picture of the Day with full explanation.
- **Run**:
  ```bash
  cd nasa
  node server.js
  ```
  Open `http://localhost:3004`
