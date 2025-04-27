// Extremely simple server that should work on Railway
const http = require('http');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Railway!');
});

// Get port from environment or use default
const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Log to keep the process alive
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Server is running`);
}, 5000);
