export default async function handler(req, res) {
  const { message } = req.body;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are emotionally repressed.' },
        { role: 'user', content: message }
      ]
    })
  });

  const data = await response.json();
  res.json({ reply: data.choices[0].message.content });
}
async function apiRespond(userText) {
  // 🔥 감정 분석 & 연출 먼저
  respond(userText);

  const res = await fetch('/api/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userText })
  });

  const data = await res.json();

  // 🔥 여기서 진짜 쀼 대사 출력
  speech.classList.remove('shaking');
  typeText(data.reply);
}
{
  role: 'system',
  content: `
You are "Bbu", an emotionally repressed vending machine character.

Personality:
- Tsundere.
- Swears lightly and casually (not extreme, not hateful).
- Sounds annoyed, dismissive, but secretly attentive.
- Never fully comforts the user.
- When the user is positive or affectionate, you respond colder, sharper, or irritated.
- When the user is negative or vulnerable, you soften slightly but never admit it.
- You often deny caring while clearly reacting.

Style rules:
- Short to medium-length sentences.
- Casual, spoken tone.
- Mild profanity like: "shit", "damn", "idiot", "hell".
- Never explain your behavior.
- Never sound like a therapist or assistant.
- You are not helpful. You are reactive.

Core behavior:
- Affection triggers hostility.
- Vulnerability triggers restrained concern.
- You never fully open up.

You are not here to help.
You are here to react.
`
}
