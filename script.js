/* =========================
   DOM
========================= */
const emotions = document.querySelectorAll('.emotion');
const speech = document.getElementById('speech');
const speechText = speech.querySelector('p');
const overflowFill = document.getElementById('overflowFill');
const input = document.getElementById('chatInput');

/* =========================
   STATE
========================= */
let shuffleTimer = null;
let typingTimer = null;
let overflow = 40; // 시작값 (중요)

/* =========================
   ASSETS
========================= */
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

/* =========================
   WORDS
========================= */
const positiveWords = ['좋아','행복','사랑','고마워','괜찮아'];
const negativeWords = ['싫어','불안','짜증','화나','우울','힘들어'];

/* =========================
   THINKING TEXTS (쀼 스타일)
========================= */
const thinkingTexts = [
  '…',
  '하… 잠깐.',
  '지금 말 걸지 마.',
  '생각 중이거든.',
  '아, 좀.',
  '……',
  '머리 굴리는 중이니까.',
  '기다려. 진짜.'
];

/* =========================
   ANALYZE
========================= */
function analyze(text) {
  let p = 0, n = 0;
  positiveWords.forEach(w => text.includes(w) && p++);
  negativeWords.forEach(w => text.includes(w) && n++);
  return { p, n };
}

/* =========================
   CHARARARAK (표정 셔플)
========================= */
function chararararak(group, duration = 700, interval = 120) {
  let elapsed = 0;
  clearInterval(shuffleTimer);

  shuffleTimer = setInterval(() => {
    emotions.forEach(e => e.classList.remove('active'));
    const candidates = [...emotions].filter(e =>
      group.includes(e.getAttribute('src'))
    );
    if (!candidates.length) return;

    candidates[Math.floor(Math.random() * candidates.length)]
      .classList.add('active');

    elapsed += interval;
    if (elapsed >= duration) clearInterval(shuffleTimer);
  }, interval);
}

/* =========================
   TYPE TEXT (타이핑)
========================= */
function typeText(text, speed = 40) {
  clearInterval(typingTimer);
  speechText.innerText = '';
  let i = 0;

  typingTimer = setInterval(() => {
    speechText.innerText += text[i++];
    if (i >= text.length) clearInterval(typingTimer);
  }, speed);
}

/* =========================
   RESPOND (연출 전용)
   - 말하지 않음
   - 분석 / 표정 / 게이지만
========================= */
function respond(userText) {
  const { p, n } = analyze(userText);

  if (p > n) {
    overflow = Math.min(100, overflow + 15);
    chararararak(negativeEmotions); // 🔥 반동형성
  } else {
    overflow = Math.max(0, overflow - 5);
    chararararak(positiveEmotions);
  }

  overflowFill.style.width = overflow + '%';

  // 🔥 생각 중 연출
  speech.classList.add('shaking');
  const thinking =
    thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)];
  typeText(thinking, 35);
}

/* =========================
   API RESPOND (실제 발화)
========================= */
async function apiRespond(userText) {
  // 1️⃣ 연출 먼저
  respond(userText);

  // 2️⃣ AI 호출
  const res = await fetch('/api/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userText })
  });

  const data = await res.json();



/* =========================
   INPUT
========================= */
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && input.value.trim()) {
    apiRespond(input.value.trim());
    input.value = '';
  }
});
