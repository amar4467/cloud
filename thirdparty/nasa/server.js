const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3004;
const API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

app.use(express.static(path.join(__dirname, 'public')));

// Third-party NASA APOD API endpoint
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
      return res.status(response.status).json({
        error: data.error?.message || data.msg || 'NASA request failed'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('NASA API error:', error.message);
    res.status(500).json({ error: 'Unable to retrieve NASA data' });
  }
});

app.listen(PORT, () => {
  console.log(`NASA APOD app running at http://localhost:${PORT}`);
});
