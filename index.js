import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚡ Serve static files like openapi.json
app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/', async (req, res) => {
  try {
    const raw = req.body.payload_json;
    if (!raw) throw new Error('Missing payload_json');
    const payload = JSON.parse(raw);

    const resp = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      console.error('Discord error:', await resp.text());
      return res.status(500).send('Webhook forwarding failed');
    }
    res.send('OK');
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
