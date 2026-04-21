import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ─── In-memory store ───────────────────────────────────────────────────────
let responses = [];
let idCounter = 1;

// ─── POST /api/submit ──────────────────────────────────────────────────────
app.post('/api/submit', (req, res) => {
  const { name, age, grade, platforms, hoursPerDay, academicImpact, mentalHealthImpact, sleepImpact } = req.body;

  if (!name || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: name and platforms' });
  }

  const entry = {
    id: idCounter++,
    name: String(name).trim(),
    age: age ? Number(age) : null,
    grade: grade || null,
    platforms: Array.isArray(platforms) ? platforms : [platforms],
    hoursPerDay: Number(hoursPerDay) || 0,
    academicImpact: academicImpact || 'neutral',
    mentalHealthImpact: mentalHealthImpact || 'neutral',
    sleepImpact: sleepImpact || 'neutral',
    timestamp: new Date().toISOString(),
  };

  responses.push(entry);
  console.log(`[submit] saved response #${entry.id} from "${entry.name}"`);
  res.status(201).json({ message: 'Response saved', id: entry.id });
});

// ─── GET /api/responses ────────────────────────────────────────────────────
app.get('/api/responses', (req, res) => {
  res.json({ total: responses.length, responses });
});

// ─── GET /api/stats ────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  if (responses.length === 0) {
    return res.json({ total: 0, stats: null });
  }

  const avgHoursPerDay = (
    responses.reduce((sum, r) => sum + r.hoursPerDay, 0) / responses.length
  ).toFixed(2);

  const platformCount = {};
  responses.forEach(r =>
    r.platforms.forEach(p => { platformCount[p] = (platformCount[p] || 0) + 1; })
  );

  const impactCount = field => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    responses.forEach(r => {
      if (r[field] in counts) counts[r[field]]++;
    });
    return counts;
  };

  res.json({
    total: responses.length,
    stats: {
      total: responses.length,
      avgHoursPerDay,
      platformCount,
      academicImpact: impactCount('academicImpact'),
      mentalHealthImpact: impactCount('mentalHealthImpact'),
      sleepImpact: impactCount('sleepImpact'),
    }
  });
});

// ─── POST /api/analyze ─────────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const { stats } = req.body;
  if (!stats) return res.status(400).json({ error: 'No stats provided' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set on server' });

  const prompt = `You are an educational psychologist. Analyze the following student survey data about social media usage and write a clear, insightful report in 3 paragraphs:
1. Key findings from the data
2. Risks and concerns identified
3. Three practical recommendations for students and educators

Survey data:
${JSON.stringify(stats, null, 2)}`;

  try {
    const { default: fetch } = await import('node-fetch');
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await apiRes.json();
    const analysis = data.content?.[0]?.text || 'No analysis returned.';
    res.json({ analysis });
  } catch (err) {
    console.error('[analyze] error:', err.message);
    res.status(500).json({ error: 'Claude API request failed', detail: err.message });
  }
});

// ─── DELETE /api/responses ─────────────────────────────────────────────────
app.delete('/api/responses', (req, res) => {
  const count = responses.length;
  responses = [];
  idCounter = 1;
  console.log(`[delete] cleared ${count} responses`);
  res.json({ message: `Cleared ${count} responses` });
});

// ─── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n  Socialmedia impact backend running at http://localhost:${PORT}`);
  console.log(`  API key: ${process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET — set ANTHROPIC_API_KEY to enable AI analysis'}\n`);
});
