/* =========================
   DOM
========================= */
const emotions = document.querySelectorAll('.emotion');
const speech = document.getElementById('speech');
const speechText = speech.querySelector('p');
const overflowFill = document.getElementById('overflowFill');
const input = document.getElementById('chatInput');
const REFUSAL_THRESHOLD = 100;
const effectLayer = document.getElementById('effectLayer');
/* =========================
   STATE
========================= */
let shuffleTimer = null;
let typingTimer = null;
let overflow = 40;        // 시작값
let isThinking = false;   // 🔥 입력 잠금용

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
const positiveWords = ['좋아','안아','뽀뽀','키스''행복','사랑','고마워','괜찮아'];
const negativeWords = ['싫어','불안','짜증','화나','우울','힘들어'];

/* =========================
   THINKING TEXTS (쀼)
========================= */
const thinkingTexts = [
  '하… 잠깐.',
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
   TYPE TEXT
========================= */
function typeText(text, speed = 40) {
  clearInterval(typingTimer);
  speechText.innerText = '';
  let i = 0;

  typingTimer = setInterval(() => {
    speechText.innerText += text[i++] ?? '';
    if (i >= text.length) clearInterval(typingTimer);
  }, speed);
}
function showHappyEffect() {
  const el = document.createElement('div');
  el.className = 'happy-effect';
  el.innerText = '+1 HAPPY';

  effectLayer.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 1200);
}

/* =========================
   RESPOND (연출 ONLY)
========================= */
function respond(userText) {
  const { p, n } = analyze(userText);

  // 🔥 이미 거부 상태
  if (overflow >= REFUSAL_THRESHOLD) {
    speech.classList.add('shaking');
    const refusal =
      refusalTexts[Math.floor(Math.random() * refusalTexts.length)];
    typeText(refusal, 30);
    return;
  }

 if (p > n) {
  overflow = Math.min(REFUSAL_THRESHOLD, overflow + 15);
  chararararak(negativeEmotions);
  showHappyEffect(); // ⭐ 여기
} else {
  overflow = Math.max(0, overflow - 5);
  chararararak(positiveEmotions);
}

  overflowFill.style.width = overflow + '%';

  speech.classList.add('shaking');
  const thinking =
    thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)];
  typeText(thinking, 35);
}

/* =========================
   API RESPOND (실제 발화)
========================= */
async function apiRespond(userText) {
  if (isThinking) return;
  isThinking = true;

  // 🔥 먼저 연출
  respond(userText);

  // ❌ 빨간 게이지 꽉 찼으면 AI 호출 금지
 if (overflow >= REFUSAL_THRESHOLD) {
  setTimeout(() => {
    speech.classList.remove('shaking');
    const refusal =
      refusalTexts[Math.floor(Math.random() * refusalTexts.length)];
    typeText(refusal, 30);
    isThinking = false;
  }, 600);
  return;
}

  try {
    const res = await fetch('/api/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });

    if (!res.ok) throw new Error('API error');

    const data = await res.json();

    const delay = 800 + Math.random() * 700;

    setTimeout(() => {
      speech.classList.remove('shaking');
      typeText(data.reply);
      isThinking = false;
    }, delay);

  } catch (err) {
    speech.classList.remove('shaking');
    typeText('…지금 말 안 할게.');
    isThinking = false;
  } finally {
    // 🔥 무조건 락 해제
    isThinking = false;
  }
}
const refusalTexts = [
  '…',
  '그만.',
  '여기까지.',
  '말 안 해.',
];
/* =========================
   INPUT (iOS SAFE)
========================= */
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault(); // 🔥 iOS 필수
    if (input.value.trim() && !isThinking) {
      apiRespond(input.value.trim());
      input.value = '';
    }
  }
});
