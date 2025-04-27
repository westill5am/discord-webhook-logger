const express = require('express');
const app = express();

// Use the Railway-provided port, or default to 3000 if running locally.
const port = process.env.PORT || 3000;

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from Railway!');
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Optional: Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
