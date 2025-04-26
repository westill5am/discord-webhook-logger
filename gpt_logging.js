import express from 'express';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { URLSearchParams } from 'url';

dotenv.config();

const app = express();
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

// 🚀 Chat with GPT and log to Discord
export async function chatWithLogging(prompt) {
  const { choices } = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });
  const reply = choices[0].message.content;
  await sendToDiscord(`**User:** ${prompt}\n**Bot:** ${reply}`);
  return reply;
}

// 🚀 Dummy express server to keep Railway alive
app.get('/', (req, res) => {
  res.send('Logger server is running.');
});

// 🚀 Bind to Railway's required PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Logger server running on port ${PORT}`);
});
