/* ===============================
   DOM ELEMENTS
================================ */
const emotions = document.querySelectorAll('.emotion');
const emotionLayers = Array.from(emotions);

const speech = document.getElementById('speech');
const speechText = speech.querySelector('p');

const overflowFill = document.getElementById('overflowFill');
const input = document.getElementById('chatInput');

/* ===============================
   STATE
================================ */
let shuffleTimer = null;
let overflow = 70;

/* ===============================
   EMOTION GROUPS
================================ */
const negativeEmotions = [
  'img/angry_01.png',
  'img/angry_02.png',
  'img/angry_03.png',
  'img/angry_04.png'
];

const positiveEmotions = [
  'img/love_01.png',
  'img/love_02.png',
  'img/love_03.png',
  'img/love_04.png'
];

/* ===============================
   KEYWORDS
================================ */
const positiveWords = [
  '좋아','행복','사랑','기뻐','편해',
  '괜찮아','고마워','안정','즐거워'
];

const negativeWords = [
  '싫어','불안','짜증','화나','우울',
  '힘들어','불편','괴로워'
];
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
/* ===============================
   ANALYSIS
================================ */
function analyzeInput(text) {
  const lower = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;

  positiveWords.forEach(w => {
    if (lower.includes(w)) positiveScore++;
  });

  negativeWords.forEach(w => {
    if (lower.includes(w)) negativeScore++;
  });

  return { positiveScore, negativeScore };
}

/* ===============================
   TYPEWRITER
================================ */
function typeText(element, text, speed = 40) {
  if (!element) return;

  element.innerText = '';
  let i = 0;

  const typing = setInterval(() => {
    element.innerText += text[i];
    i++;
    if (i >= text.length) clearInterval(typing);
  }, speed);
}

/* ===============================
   CHARARARAK (EMOTION SHUFFLE)
================================ */
function chararararakByGroup(group, duration = 800, interval = 120) {
  let elapsed = 0;
  clearInterval(shuffleTimer);

  shuffleTimer = setInterval(() => {
    emotionLayers.forEach(e => e.classList.remove('active'));

    const candidates = emotionLayers.filter(img =>
      group.includes(img.getAttribute('src'))
    );

    if (candidates.length === 0) return;

    const pick = Math.floor(Math.random() * candidates.length);
    candidates[pick].classList.add('active');

    elapsed += interval;
    if (elapsed >= duration) clearInterval(shuffleTimer);
  }, interval);
}

/* ===============================
   CORE RESPONSE LOGIC
================================ */
function respond(text, meta = {}) {
  const { positiveScore = 0, negativeScore = 0 } = meta;

  /* 반동형성 */
  if (positiveScore > negativeScore) {
    overflow = Math.min(100, overflow + 15);
    chararararakByGroup(negativeEmotions);
  } else {
    overflow = Math.max(0, overflow - 5);
    chararararakByGroup(positiveEmotions);
  }

  overflowFill.style.width = overflow + '%';

  /* 말풍선 출력 */
  if (overflow >= 95) {
    speech.classList.add('shaking');
    typeText(speechText, '…');
  } else {
    speech.classList.remove('shaking');
    typeText(speechText, text);
  }
}

/* ===============================
   API CALL
================================ */
async function apiRespond(text) {
  // 입력 즉시 분석 (표정/게이지용)
  const scores = analyzeInput(text);

  // 분석 중 표시
  typeText(speechText, '감정 분석 중…', 30);

  try {
    const res = await fetch('/api/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    respond(data.reply, scores);
  } catch (err) {
    console.error(err);
    typeText(speechText, '…', 60);
  }
}

/* ===============================
   INPUT EVENT
================================ */
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && input.value.trim()) {
    const text = input.value;
    input.value = '';
    apiRespond(text);
  }
});

/* ===============================
   INIT
================================ */
window.onload = () => {
  typeText(speechText, '…', 60);
};
