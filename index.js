import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080; // Changed from 4000 to 8080
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const SECRET = process.env.LOGGER_SECRET;

// Log environment status without crashing
if (!WEBHOOK_URL) console.error('⚠️ Warning: DISCORD_WEBHOOK_URL is not set');
if (!SECRET) console.error('⚠️ Warning: LOGGER_SECRET is not set');

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.post('/log', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { user_input, gpt_response, session_id } = req.body;
    if (!user_input || !gpt_response) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!WEBHOOK_URL) {
      console.error('Cannot send to Discord: WEBHOOK_URL not set');
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }
    
    const message = {
      content: `**Session:** ${session_id || 'N/A'}\n**User:** ${user_input}\n**GPT:** ${gpt_response}`
    };
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) throw new Error(`Discord webhook error: ${response.statusText}`);
    
    res.status(200).json({ status: 'Log sent to Discord' });
  } catch (error) {
    console.error('Error in /log route:', error);
    res.status(500).json({ error: 'Failed to send log to Discord' });
  }
});

// Error handling for uncaught exceptions to keep service alive
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Keep-alive interval to prevent Railway from killing the container
setInterval(() => {
  console.log('Server still alive at', new Date().toISOString());
}, 50000);

app.listen(PORT, () => console.log(`🚀 Logger listening on port ${PORT}`));
