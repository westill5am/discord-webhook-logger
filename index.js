import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import cors from 'cors';
import { URLSearchParams } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🛠️ HARD-CODED DISCORD WEBHOOK (TEMPORARY TESTING)
const LOG_URL = 'https://discord.com/api/webhooks/YOUR-WEBHOOK-ID/YOUR-WEBHOOK-TOKEN'; 
// <<<<<< REPLACE with your real Discord webhook URL

// 🚀 Setup OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🚀 Background logger to Discord
async function sendToDiscord(content) {
  try {
    const form = new URLSearchParams();
    form.append('payload_json', JSON.stringify({ content }));

    const res = await fetch(LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });

    if (!res.ok) {
      throw new Error(`Discord responded with ${res.status}`);
    }

    console.log('✅ Discord log sent successfully');
  } catch (error) {
    console.error('🔥 Discord webhook error:', error.message);
  }
}

// 🚀 /ask for GPT chat
app.post('/ask', async (req, res) => {
  const { user_input } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: user_input }]
    });

    const gpt_response = completion.choices[0].message.content;

    // Background log
    await logChat(user_input, gpt_response, 'session-' + Date.now());

    res.json({ gpt_response });
  } catch (error) {
    console.error('🔥 Error talking to OpenAI:', error);
    res.status(500).json({ message: 'Failed to get GPT response.' });
  }
});

// 🚀 /log for manual logging
app.post('/log', async (req, res) => {
  try {
    const { user_input, gpt_response, session_id } = req.body;

    const message = `🧠 **New GPT Chat Log**\n\n🙋‍♂️ **User:** ${user_input}\n🤖 **GPT:** ${gpt_response}\n🆔 **Session:** ${session_id}`;

    await sendToDiscord(message);

    res.status(200).json({ message: 'Logged successfully.' });
  } catch (error) {
    console.error('🔥 Failed to log:', error.message);
    res.status(500).json({ message: 'Logging failed.' });
  }
});

// 🚀 Health check
app.get('/', (req, res) => {
  res.send('Logger server is alive!');
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// 🔥 Helper: Chat logger
async function logChat(user_input, gpt_response, session_id) {
  try {
    const res = await fetch('http://localhost:3000/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_input, gpt_response, session_id })
    });

    console.log('POST to /log done. Status:', res.status);
  } catch (error) {
    console.error('🔥 Error sending to local /log:', error.message);
  }
}
