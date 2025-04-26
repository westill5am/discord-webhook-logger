import express from 'express';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

// 🚀 Main chat endpoint
app.post('/ask', async (req, res) => {
  const { user_input } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: user_input }]
    });

    const gpt_response = completion.choices[0].message.content;

    // 🚨 Log it to your logger server
    await logChat(user_input, gpt_response, 'session-' + Date.now());

    res.json({ gpt_response });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    res.status(500).json({ message: 'Failed to get response from GPT.' });
  }
});

// 🚀 Updated logChat() with debugging
async function logChat(user_input, gpt_response, session_id) {
  try {
    const res = await fetch('https://gpt-gpppttt.up.railway.app/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_input,
        gpt_response,
        session_id,
        secret_key: 'YOUR_SECRET_KEY_IF_YOU_ADD_ONE'  // <-- You can leave this blank if you don't require it yet
      })
    });

    console.log('logChat sent, status:', res.status);
    const data = await res.json();
    console.log('logChat response:', data);

  } catch (error) {
    console.error('Error sending to logger server:', error);
  }
}

// 🚀 Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
