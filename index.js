import express from 'express';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';
import { URLSearchParams } from 'url';

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

const LOG_URL = process.env.DISCORD_WEBHOOK_URL;

// 🚀 Send to Discord
async function sendToDiscord(content) {
  const form = new URLSearchParams();
  form.append('payload_json', JSON.stringify({ content }));
  await fetch(LOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString()
  });
}

// 🚀 /ask: Main GPT chat
app.post('/ask', async (req, res) => {
  const { user_input } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: user_input }]
    });
    const gpt_response = completion.choices[0].message.content;

    // Background logging
    await sendToDiscord(`🧠 **New GPT Chat Log**\n\n🙋‍♂️ **User:** ${user_input}\n🤖 **GPT:** ${gpt_response}`);

    res.json({ gpt_response });
  } catch (error) {
    console.error('🔥 Error talking to OpenAI:', error.message);
    res.status(500).json({ message: 'Failed to get GPT response.' });
  }
});

// 🚀 /log: Manual logging
app.post('/log', async (req, res) => {
  try {
    const { user_input, gpt_response, session_id } = req.body;
    if (!user_input || !gpt_response || !session_id) {
      console.error('🚨 Missing fields in /log POST');
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const message = `🧠 **New GPT Chat Log**\n\n🙋‍♂️ **User:** ${user_input}\n🤖 **GPT:** ${gpt_response}\n🆔 **Session:** ${session_id}`;
    await sendToDiscord(message);
    console.log('✅ Successfully sent log to Discord.');
    res.status(200).json({ message: 'Logged successfully.' });
  } catch (error) {
    console.error('🔥 Failed to log:', error.message);
    res.status(500).json({ message: 'Logging failed.' });
  }
});

// 🚀 Healthcheck
app.get('/', (req, res) => {
  res.send('Logger server running!');
});

// 🚀 Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Logger server running on port ${PORT}`);
});
