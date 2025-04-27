import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import http from 'http';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Get environment variables with fallbacks
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const SECRET = process.env.LOGGER_SECRET;

// Log configuration on startup
console.log(`Starting server with configuration:`);
console.log(`- PORT: ${PORT}`);
console.log(`- WEBHOOK_URL: ${WEBHOOK_URL ? '✓ Set' : '✗ Not set'}`);
console.log(`- SECRET: ${SECRET ? '✓ Set' : '✗ Not set'}`);

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    env: {
      webhook: !!WEBHOOK_URL,
      secret: !!SECRET
    }
  });
});

app.post('/log', async (req, res) => {
  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !SECRET || authHeader !== `Bearer ${SECRET}`) {
      console.log('Authentication failed');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Validate request body
    const { user_input, gpt_response, session_id } = req.body;
    if (!user_input || !gpt_response) {
      console.log('Missing required fields', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check webhook URL
    if (!WEBHOOK_URL) {
      console.error('Cannot send to Discord: WEBHOOK_URL not set');
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }
    
    console.log(`Sending log for session: ${session_id || 'N/A'}`);
    
    // Format message
    const message = {
      content: `**Session:** ${session_id || 'N/A'}\n**User:** ${user_input}\n**GPT:** ${gpt_response}`
    };
    
    // Send to Discord
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      throw new Error(`Discord webhook error: ${response.status} ${response.statusText}`);
    }
    
    console.log('Successfully sent log to Discord');
    res.status(200).json({ status: 'Log sent to Discord' });
  } catch (error) {
    console.error('Error in /log route:', error);
    res.status(500).json({ error: error.message || 'Failed to send log to Discord' });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Error handlers to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// IMPORTANT: Keep-alive interval to prevent Railway from killing the container
setInterval(() => {
  console.log(`Server still alive at ${new Date().toISOString()}`);
  
  // Self-ping to keep the server active
  try {
    http.get(`http://localhost:${PORT}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { 
        if (res.statusCode !== 200) {
          console.error(`Self-health check failed: ${res.statusCode}`);
        }
      });
    }).on('error', (err) => {
      console.error('Self-health check error:', err);
    });
  } catch (err) {
    console.error('Error in keep-alive ping:', err);
  }
}, 30000); // Every 30 seconds

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on all interfaces at port ${PORT}`);
});
