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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const LOG_URL = process.env.DISCORD_WEBHOOK_URL;

// 🚀 Background logger function
async function sendToDiscord(content) {
  const form = new URLSearchParams();
  form.append('payload_json', JSON.stringify({ content }));

  await fetch(LOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString()
  });
}

// 🚀 Handle /ask for GPT chats
app.post('/ask', async (req, res) => {
  const { user_input } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: user_input }]
    });

    const gpt_response = completion.choices[0].message.content;

    // Log chat in background
    await logChat(user_input, gpt_response, 'session-' + Date.now());

    res.json({ gpt_response });
  } catch (error) {
    console.error('🔥 Error talking to OpenAI:', error);
    res.status(500).json({ message: 'Failed to get GPT response.' });
  }
});

// 🚀 Handle /log for external manual logging
app.post('/log', async (req, res) => {
  try {
    const { user_input, gpt_response, session_id } = req.body;

    const message = `🧠 **New GPT Chat Log**\n\n🙋‍♂️ **User:** ${user_input}\n🤖 **GPT:** ${gpt_response}\n🆔 **Session:** ${session_id}`;

    await sendToDiscord(message);

    res.status(200).json({ message: 'Logged successfully.' });
  } catch (error) {
    console.error('🔥 Failed to log:', error);
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
