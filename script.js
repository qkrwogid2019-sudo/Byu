/* =========================
   DOM
========================= */
const emotions = document.querySelectorAll('.emotion');
const speech = document.getElementById('speech');
const speechText = document.getElementById('speechText');
const overflowFill = document.getElementById('overflowFill');
const input = document.getElementById('chatInput');
const effectLayer = document.getElementById('effectLayer');

const emotionSound = document.getElementById('emotionSound');
const coinSound = document.getElementById('coinSound');
const coinRejectSound = document.getElementById('coinRejectSound');

/* =========================
   CONSTANTS
========================= */
const REFUSAL_THRESHOLD = 100;

/* =========================
   STATE
========================= */
let overflow = 40;
let shuffleTimer = null;
let typingTimer = null;
let isThinking = false;
let audioUnlocked = false;

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
const positiveWords = ['좋아','사랑','행복','고마워','괜찮아','안아','뽀뽀','키스'];
const negativeWords = ['싫어','불안','짜증','화나','우울','힘들어'];

/* =========================
   THINKING / REFUSAL TEXT
========================= */
const thinkingTexts = [
  '하… 잠깐.',
];

const refusalTexts = [
  '그만.',
  '말 안 해.'
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
   AUDIO UNLOCK (iOS 핵심)
========================= */
function unlockAudio() {
  if (audioUnlocked) return;

  [emotionSound, coinSound, coinRejectSound].forEach(a => {
    if (!a) return;
    a.play().then(() => {
      a.pause();
      a.currentTime = 0;
    }).catch(()=>{});
  });

  audioUnlocked = true;
}

/* =========================
   SOUND HELPERS
========================= */
function playEmotionSound() {
  if (!emotionSound) return;
  emotionSound.currentTime = 0;
  emotionSound.play().catch(()=>{});
}

function playCoinSound() {
  if (!coinSound) return;
  coinSound.currentTime = 0;
  coinSound.play().catch(()=>{});
}

function playCoinRejectSound() {
  if (!coinRejectSound) return;
  coinRejectSound.currentTime = 0;
  coinRejectSound.play().catch(()=>{});
}

/* =========================
   HAPPY EFFECT
========================= */
function showHappyEffect() {
  if (!effectLayer) return;

  const el = document.createElement('div');
  el.className = 'happy-effect';
  el.innerText = '+1 HAPPY';
  effectLayer.appendChild(el);

  setTimeout(() => el.remove(), 1200);
}

/* =========================
   EMOTION SHUFFLE (2바퀴)
========================= */
function chararararak(group, interval = 120, loops = 2) {
  clearInterval(shuffleTimer);

  const candidates = [...emotions].filter(e =>
    group.includes(e.getAttribute('src'))
  );
  if (!candidates.length) return;

  let index = 0;
  let count = 0;
  const total = candidates.length * loops;

  shuffleTimer = setInterval(() => {
    emotions.forEach(e => e.classList.remove('active'));
    candidates[index].classList.add('active');

    playEmotionSound();

    index = (index + 1) % candidates.length;
    count++;

    if (count >= total) clearInterval(shuffleTimer);
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
    speechText.innerText += text[i] ?? '';
    i++;
    if (i >= text.length) clearInterval(typingTimer);
  }, speed);
}

/* =========================
   LOCAL RESPOND (연출)
========================= */
function localRespond(userText) {
  const { p, n } = analyze(userText);

  if (p > n) {
    overflow = Math.min(REFUSAL_THRESHOLD, overflow + 15);
    chararararak(negativeEmotions);
    showHappyEffect();
  } else {
    overflow = Math.max(0, overflow - 5);
    chararararak(positiveEmotions);
  }

  overflowFill.style.width = overflow + '%';

  speech.classList.add('shaking');
  typeText(thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)], 35);
}

/* =========================
   API RESPOND
========================= */
async function apiRespond(userText) {
  if (isThinking) return;
  isThinking = true;

  localRespond(userText);

  // ❌ 거부 상태
  if (overflow >= REFUSAL_THRESHOLD) {
    setTimeout(() => {
      speech.classList.remove('shaking');
      playCoinRejectSound();
      typeText(refusalTexts[Math.floor(Math.random() * refusalTexts.length)], 30);
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

    const data = await res.json();

    setTimeout(() => {
      speech.classList.remove('shaking');
      typeText(data.reply || '…');
      isThinking = false;
    }, 900 + Math.random() * 600);

  } catch (e) {
    speech.classList.remove('shaking');
    typeText('말 안 해.');
    isThinking = false;
  }
}

/* =========================
   INPUT (iOS SAFE)
========================= */
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();

    unlockAudio(); // 🔥🔥🔥 필수

    if (!input.value.trim() || isThinking) return;

    // 이미 거부 상태
    if (overflow >= REFUSAL_THRESHOLD) {
      playCoinRejectSound();
      typeText(refusalTexts[Math.floor(Math.random() * refusalTexts.length)], 30);
      input.value = '';
      return;
    }

    playCoinSound();
    apiRespond(input.value.trim());
    input.value = '';
  }
});
