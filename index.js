import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Get environment variables with fallbacks
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'https://example.com';
const SECRET = process.env.LOGGER_SECRET || 'default-secret';

// Middleware
app.use(bodyParser.json());

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.status(200).send('OK');
});

app.post('/log', async (req, res) => {
  try {
    console.log('Log endpoint accessed');
    
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Validate request body
    const { user_input, gpt_response, session_id } = req.body;
    if (!user_input || !gpt_response) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
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
    
    console.log(`Discord response status: ${response.status}`);
    res.status(200).json({ status: 'Log sent to Discord' });
  } catch (error) {
    console.error('Error in /log route:', error);
    res.status(500).json({ error: 'Failed to send log to Discord' });
  }
});

// Start the server - bind to 0.0.0.0 to listen on all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`Environment: WEBHOOK_URL=${!!WEBHOOK_URL}, SECRET=${!!SECRET}`);
});

// Print periodic logs to show the server is alive
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Server still running`);
}, 30000);
