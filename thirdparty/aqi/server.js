const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.static(path.join(__dirname, 'public')));

function getAqiCategory(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

// Third-party AQI API endpoint
app.get('/api/aqi', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    // 1. Geocoding
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Fetch AQI data
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5,carbon_monoxide`;
    const aqiRes = await fetch(aqiUrl);
    const aqiData = await aqiRes.json();

    const current = aqiData.current;
    const aqi = current.us_aqi;

    res.json({
      city: name,
      country: country || '',
      aqi,
      category: getAqiCategory(aqi),
      pm2_5: current.pm2_5,
      pm10: current.pm10,
      carbon_monoxide: current.carbon_monoxide,
      time: current.time
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch AQI data' });
  }
});

app.listen(PORT, () => {
  console.log(`AQI app running at http://localhost:${PORT}`);
});
