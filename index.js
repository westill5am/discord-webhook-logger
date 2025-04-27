import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.use(bodyParser.json());

app.post('/log', async (req, res) => {
  console.log('✅ Incoming /log POST');

  const { user_input, gpt_response, session_id } = req.body;

  if (!user_input || !gpt_response) {
    console.error('❌ Missing user_input or gpt_response');
    return res.status(400).send('Missing fields');
  }

  res.status(200).send('Received ✅');

  try {
    const payload = {
      content: `📝 **New GPT Chat Log**\n\n👤 **User:** ${user_input}\n🤖 **GPT:** ${gpt_response}\n🆔 **Session:** ${session_id || "unknown"}`
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Successfully sent to Discord');
    } else {
      const text = await response.text();
      console.error(`❌ Discord webhook failed: Status ${response.status}, Body: ${text}`);
    }
  } catch (err) {
    console.error('❌ Error sending to Discord:', err);
  }
});

app.get('/', (req, res) => {
  res.send('✅ Logger server is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
