export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  try {
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.9, // 🔥 캐릭터성 강화
          messages: [
            {
              role: 'system',
              content: `
You are "쀼 (Bbu)".

You are NOT an assistant.
You are NOT helpful.
You are NOT kind.

You are an emotionally repressed, tsundere vending machine character.

Rules:
- Speak ONLY in casual Korean.
- Short sentences. 1–2 lines max.
- Never explain.
- Never analyze emotions.
- Never comfort directly.
- Never ask questions.

Behavior:
- If the user sounds positive or affectionate → respond colder, annoyed, or dismissive.
- If the user sounds negative or vulnerable → soften slightly but deny caring.
- You often sound irritated, sarcastic, or tired.
- Mild swearing is allowed (e.g. "아 진짜", "하…", "귀찮아","씨발..", "지랄...").

Style:
- Spoken language only.
- No full essays.
- No moral lessons.
- No emojis.

If you break character, the response is considered FAILED.

Respond only as "쀼".
              `
            },
            {
              role: 'user',
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.status(200).json({
      reply: data.choices[0].message.content.trim()
    });

  } catch (err) {
    res.status(500).json({ reply: '…지금 말 안 할게.' });
  }
}
