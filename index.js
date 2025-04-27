const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from Railway!');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep logs flowing
setInterval(() => {
  console.log(`Still alive at ${new Date().toISOString()}`);
}, 10000);
