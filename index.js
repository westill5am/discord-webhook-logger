import express from 'express';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

// 🚀 Main GPT chat endpoint
app.post('/ask', async (req, res) => {
  const { user_input } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: user_input }]
    });

    const gpt_response = completion.choices[0].message.content;

    // 🚨 Send it to the logger server
    await logChat(user_input, gpt_response, 'session-' + Date.now());

    res.json({ gpt_response });
  } catch (error) {
    console.error('🔥 Error talking to OpenAI:', error);
    res.status(500).json({ message: 'Failed to get GPT response.' });
  }
});

// 🚀 Updated working logChat() function
async function logChat(user_input, gpt_response, session_id) {
  try {
    console.log('👉 Trying to POST to logger server...');

    const res = await fetch('https://gpt-gpppttt.up.railway.app/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_input,
        gpt_response,
        session_id,
        secret_key: '' // blank unless you have a secret key
      })
    });

    console.log('POST sent. Status:', res.status);

    const data = await res.json();
    console.log('Response from logger:', data);

  } catch (error) {
    console.error('🔥 ERROR sending to logger server:', error);
  }
}

// 🚀 Start Express server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
