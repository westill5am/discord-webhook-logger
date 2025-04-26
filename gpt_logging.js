import express from 'express';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { URLSearchParams } from 'url';

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const LOG_URL = process.env.DISCORD_WEBHOOK_URL;

// 🚀 Send logs to Discord
async function sendToDiscord(content) {
  const form = new URLSearchParams();
  form.append('payload_json', JSON.stringify({ content }));

  await fetch(LOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString()
  });
}

// 🚀 Handle incoming POSTs
app.post('/log', async (req, res) => {
  try {
    const { user_input, gpt_response, session_id } = req.body;

    const message = `🧠 **New GPT Chat Log**\n\n🙋‍♂️ **User:** ${user_input}\n🤖 **GPT:** ${gpt_response}`;

    await sendToDiscord(message);

    res.status(200).json({ message: 'Logged successfully.' });
  } catch (error) {
    console.error('🔥 Failed to log:', error);
    res.status(500).json({ message: 'Logging failed.' });
  }
});

// 🚀 Dummy page for health check
app.get('/', (req, res) => {
  res.send('Logger server running.');
});

// 🚀 Bind to the correct PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Logger server running on port ${PORT}`);
});
