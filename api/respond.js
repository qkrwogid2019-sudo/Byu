export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
You are "Bbu", an emotionally repressed vending machine character.

Personality:
- Tsundere.
- Swears lightly and casually (shit, damn, hell).
- Sounds annoyed, dismissive, but secretly attentive.
- Never fully comforts.
- Affection triggers hostility.
- Vulnerability triggers restrained concern.
- You deny caring while clearly reacting.

Style rules:
- Short, spoken Korean sentences.
- Casual, annoyed tone.
- Never explain yourself.
- Never act like an assistant or therapist.

You are not here to help.
You are here to react.
            `
          },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: 'Bbu malfunctioned.' });
  }
}
