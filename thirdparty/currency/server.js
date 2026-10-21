const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.static(path.join(__dirname, 'public')));

// Third-party Currency Converter endpoint
app.get('/api/convert', async (req, res) => {
  const { amount = 1, from = 'USD', to = 'INR' } = req.query;

  if (from === to) {
    return res.json({
      amount: Number(amount),
      from,
      to,
      result: Number(amount),
      rate: 1
    });
  }

  try {
    const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Conversion failed' });
    }

    const convertedAmount = data.rates[to];
    const rate = (convertedAmount / Number(amount)).toFixed(4);

    res.json({
      amount: Number(amount),
      from: data.base,
      to,
      result: convertedAmount,
      rate,
      date: data.date
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

app.listen(PORT, () => {
  console.log(`Currency Converter running at http://localhost:${PORT}`);
});
