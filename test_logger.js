import fetch from 'node-fetch';

async function testPost() {
  try {
    console.log('👉 Trying to POST directly to Railway logger...');

    const res = await fetch('https://gpt-gpppttt.up.railway.app/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_input: 'Manual test input',
        gpt_response: 'Manual test response',
        session_id: 'manual-test-session',
        secret_key: '' // <--- Leave blank for now unless you set a secret
      })
    });

    console.log('POST attempt finished. Status:', res.status);

    const data = await res.json();
    console.log('Response from logger:', data);

  } catch (error) {
    console.error('🔥 ERROR during manual POST:', error);
  }
}

testPost();
