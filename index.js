import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const LOG_URL = process.env.DISCORD_WEBHOOK_URL;

app.use(cors());
app.use(express.json());

// 🚀 Send any message to Discord
async function sendToDiscord(content) {
  try {
    const res = await fetch(LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });

    if (!res.ok) {
      throw new Error(`Failed to send to Discord: ${res.status}`);
    }

    console.log('✅ Message sent to Discord successfully.');
  } catch (error) {
    console.error('🔥 Discord send error:', error.message);
  }
}

// 🚀 Chat endpoint
app.post('/ask', async (req, res) => {
  const { user_input } = req.body;

  if (!user_input) {
    return res.status(400).json({ message: 'Missing user_input.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: user_input }]
    });

    const gpt_response = completion.choices[0].message.content;
    const session_id = `session-${Date.now()}`;

    // 🛡️ Fire and forget background logging
    logChat(user_input, gpt_response, session_id);

    res.json({ gpt_response });
  } catch (error) {
    console.error('🔥 GPT error:', error.message);
    res.status(500).json({ message: 'Failed to get GPT response.' });
  }
});

// 🚀 Manual /log endpoint
app.post('/log', async (req, res) => {
  const { user_input, gpt_response, session_id } = req.body;

  if (!user_input || !gpt_response || !session_id) {
    console.error('🚨 Missing fields in /log POST');
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const message = `🧠 **New GPT Chat Log**\n\n👤 **User:** ${user_input}\n🤖 **GPT:** ${gpt_response}\n🆔 **Session:** ${session_id}`;

  await sendToDiscord(message);

  res.status(200).json({ message: 'Logged successfully.' });
});

// 🚀 Healthcheck
app.get('/', (req, res) => {
  res.send('GPT Logger server is alive!');
});

// 🚀 Background Logger function
async function logChat(user_input, gpt_response, session_id) {
  try {
    const res = await fetch('https://gpt-gpppttt.up.railway.app/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_input, gpt_response, session_id })
    });

    if (!res.ok) {
      throw new Error(`Failed to background log: ${res.status}`);
    }

    console.log('✅ Chat background-logged successfully.');
  } catch (error) {
    console.error('🔥 Background log error:', error.message);
  }
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 GPT Logger running on port ${PORT}`);
});
