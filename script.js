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
const emotionSound = document.getElementById('emotionSound');
const coinSound = document.getElementById('coinSound');
const coinRejectSound = document.getElementById('coinRejectSound');
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
const positiveWords = ['좋아','안아','뽀뽀','키스','행복','사랑','고마워','괜찮아'];
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

  playEmotionSound(); // ⭐ 시작할 때 한 번

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
function playEmotionSound() {
  if (!emotionSound) return;

  emotionSound.currentTime = 0;
  const playPromise = emotionSound.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // iOS 자동재생 차단 무시
    });
  }
}
function playCoinSound() {
  if (!coinSound) return;

  coinSound.currentTime = 0;
  const p = coinSound.play();
  if (p !== undefined) {
    p.catch(() => {});
  }
}
function playCoinRejectSound() {
  if (!coinRejectSound) return;

  coinRejectSound.currentTime = 0;
  const p = coinRejectSound.play();
  if (p !== undefined) {
    p.catch(() => {});
  }
}
/* =========================
   RESPOND (연출 ONLY)
========================= */
function respond(userText) {
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
  typeText(thinkingTexts[0], 35);
}

/* =========================
   API RESPOND (실제 발화)
========================= */
async function apiRespond(userText) {
  if (isThinking) return;
  isThinking = true;

  respond(userText);

  try {
    if (overflow >= REFUSAL_THRESHOLD) {
      await new Promise(r => setTimeout(r, 600));
      speech.classList.remove('shaking');
      typeText(
        refusalTexts[Math.floor(Math.random() * refusalTexts.length)],
        30
      );
      return;
    }

    const res = await fetch('/api/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });

    const data = await res.json();

    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

    speech.classList.remove('shaking');
    typeText(data.reply || '…');

  } catch (err) {
    speech.classList.remove('shaking');
    typeText('말 안 해');
  } finally {
    isThinking = false; // 🔒🔓 여기만!
  }
}
/* =========================
   INPUT (iOS SAFE)
========================= */
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();

    if (!input.value.trim() || isThinking) return;

    // 🔥 이미 거부 상태면
    if (overflow >= REFUSAL_THRESHOLD) {
      playCoinRejectSound();        // 🪙❌ 튕김
      speech.classList.remove('shaking');
      typeText(
        refusalTexts[Math.floor(Math.random() * refusalTexts.length)],
        30
      );
      input.value = '';
      return;
    }

    // 정상 투입
    playCoinSound();                // 🪙 챙
    apiRespond(input.value.trim());
    input.value = '';
  }
});
