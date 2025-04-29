import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/generate-poem', async (req, res) => {
  const {
    name = 'Someone Special',
    traits = 'kind, thoughtful, creative',
    mood = 'heartfelt',
    style = 'rhyming',
    tone = 'gentle',
    occasion = 'just because',
    favorites = '',
    wordCount = 50,
  } = req.body;

  const prompt = \`
    Write a unique, beautiful, and memorable poem of approximately \${wordCount} words.
    The poem should be in \${style} style, with a \${mood} and \${tone} tone.
    It's for someone named \${name}, on the occasion of \${occasion}.
    They are known for being \${traits}.
    Please also include or be inspired by these words if possible: \${favorites}.
  \`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${OPENROUTER_API_KEY}\`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ Error from OpenRouter:", data.error);
      return res.status(500).json({ error: data.error.message || "Unknown error" });
    }

    const poem = data.choices?.[0]?.message?.content?.trim();
    res.json({ poem });

  } catch (err) {
    console.error("🔥 Server Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.post('/regenerate', async (req, res) => {
  const { selection } = req.body;

  if (!selection) {
    return res.status(400).json({ error: 'No selection provided.' });
  }

  const prompt = \`
    Take the following excerpt of a poem and regenerate it in a similar tone, but make it fresh and unique:
    "\${selection}"
    Respond with only the revised lines.
  \`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${OPENROUTER_API_KEY}\`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ Error from OpenRouter:", data.error);
      return res.status(500).json({ error: data.error.message || "Unknown error" });
    }

    const newText = data.choices?.[0]?.message?.content?.trim();
    res.json({ newText });

  } catch (err) {
    console.error("🔥 Regeneration Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server now connected to OpenRouter at http://localhost:${PORT}`);
});
