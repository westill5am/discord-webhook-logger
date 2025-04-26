import express from 'express';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

app.post('/ask', async (req, res) => {
  const { user_input } = req.body;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: user_input }]
  });

  const gpt_response = completion.choices[0].message.content;

  // 🚨 RIGHT HERE 🚨
  await logChat(user_input, gpt_response, 'session-' + Date.now());

  res.json({ gpt_response });
});

// 🚀 ADD THIS at bottom or top
async function logChat(user_input, gpt_response, session_id) {
  await fetch('https://gpt-gpppttt.up.railway.app/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_input,
      gpt_response,
      session_id,
      secret_key: 'YOUR_SECRET_KEY_IF_YOU_ADD_ONE'
    })
  });
}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
