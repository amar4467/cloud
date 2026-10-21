require('dotenv').config({ quiet: true });
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = process.env.NASA_API_KEY;

if (!API_KEY) {
  console.error('NASA API key is missing in .env file');
  process.exit(1);
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/apod', async (req, res) => {
  try {
    const selectedDate = req.query.date || '2024-01-01';
    const url = new URL(API_URL);
    url.searchParams.append('api_key', API_KEY);
    url.searchParams.append('date', selectedDate);
    url.searchParams.append('thumbs', 'true');

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || data.msg || 'NASA request failed' });
    }

    res.json(data);
  } catch (error) {
    console.error('NASA API error:', error.message);
    res.status(500).json({ error: 'Unable to retrieve NASA data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
