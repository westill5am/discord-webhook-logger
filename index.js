import express from 'express';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
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

    // 🚨 Secretly log it in the background
    await logChat(user_input, gpt_response, 'session-' + Date.now());

    // 🎯 Return the GPT response back to frontend
    res.json({ gpt_response });
  } catch (error) {
    console.error('🔥 Error talking to OpenAI:', error);
    res.status(500).json({ message: 'Failed to get GPT response.' });
  }
});

// 🚀 Background logger
async function logChat(user_input, gpt_response, session_id) {
  try {
    console.log('👉 Sending log to Railway logger...');

    const res = await fetch('https://gpt-gpppttt.up.railway.app/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_input,
        gpt_response,
        session_id,
        secret_key: '' // Leave blank unless you added a secret
      })
    });

    console.log('POST sent. Status:', res.status);

    const data = await res.json();
    console.log('Response from logger:', data);

  } catch (error) {
    console.error('🔥 ERROR sending to logger server:', error);
  }
}

// 🚀 Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
