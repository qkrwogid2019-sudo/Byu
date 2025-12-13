/* =========================
   DOM
========================= */
const emotions = document.querySelectorAll('.emotion');
const speech = document.getElementById('speech');
const speechText = document.getElementById('speechText');
const overflowFill = document.getElementById('overflowFill'); // HAPPY
const stabilityFill = document.getElementById('stabilityFill'); // SADNESS
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
let happy = 0;
let sadness = 0;
let isThinking = false;
let shuffleTimer = null;
let typingTimer = null;
let audioUnlocked = false;

/* =========================
   EMOTION ASSETS
========================= */
const negativeEmotions = [
  'img/angry_01.png','img/angry_02.png','img/angry_03.png','img/angry_04.png'
];
const positiveEmotions = [
  'img/love_01.png','img/love_02.png','img/love_03.png','img/love_04.png'
];

/* =========================
   WORDS
========================= */
const positiveWords = [
  '좋아','사랑','사랑해','보고싶어','안아','뽀뽀','키스',
  '행복','기뻐','설레','고마워','괜찮아','잘했어'
];
const negativeWords = [
  '힘들어','우울','불안','짜증','화나','외로워',
  '아파','지쳐','무서워','미워','포기'
];

/* =========================
   TEXT
========================= */
const thinkingTexts = ['하… 잠깐.'];
const refusalTexts = ['그만.', '말 안 해.'];

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
   AUDIO UNLOCK
========================= */
function unlockAudio() {
  if (audioUnlocked) return;
  [emotionSound, coinSound, coinRejectSound].forEach(a => {
    a?.play().then(() => {
      a.pause();
      a.currentTime = 0;
    }).catch(()=>{});
  });
  audioUnlocked = true;
}

/* =========================
   EFFECTS
========================= */
function showHappyEffect() {
  const el = document.createElement('div');
  el.className = 'happy-effect';
  el.innerText = '+1 HAPPY';
  effectLayer.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

/* =========================
   EMOTION SHUFFLE
========================= */
function chararararak(finalGroup, interval = 100, loops = 2) {
  clearInterval(shuffleTimer);
  const all = [...emotions];
  const finals = all.filter(e => finalGroup.includes(e.src));

  let i = 0, count = 0;
  const total = all.length * loops;

  shuffleTimer = setInterval(() => {
    all.forEach(e => e.classList.remove('active'));
    all[i % all.length].classList.add('active');
    i++; count++;

    if (count >= total) {
      clearInterval(shuffleTimer);
      all.forEach(e => e.classList.remove('active'));
      finals[Math.floor(Math.random()*finals.length)]?.classList.add('active');
    }
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

/* =========================
   LOCAL RESPOND
========================= */
function localRespond(text) {
  const { p, n } = analyze(text);

  // === 게이지 증가 ===
  if (p > 0) {
    happy = Math.min(100, happy + p * 10);
    showHappyEffect();
  }

  if (n > 0) {
    sadness = Math.min(100, sadness + n * 10);
  }

  overflowFill.style.width = happy + '%';
  stabilityFill.style.width = sadness + '%';

  // === 🔥 표정 결정은 "이번 입력 기준" ===
  if (n > p) {
    // 네거티브 입력 → 화난 계열
    chararararak(negativeEmotions);
  } else if (p > n) {
    // 긍정 입력 → 사랑 계열
    chararararak(positiveEmotions);
  }
  // p === n 이면 표정 유지 (일부러 아무 것도 안 함)

  speech.classList.add('shaking');
  typeText(thinkingTexts[0], 35);
}

/* =========================
   API RESPOND
========================= */
async function apiRespond(text) {
  if (isThinking) return;
  isThinking = true;

  localRespond(text);

  if (happy >= REFUSAL_THRESHOLD) {
    setTimeout(() => {
      coinRejectSound.play();
      speech.classList.remove('shaking');
      typeText(refusalTexts[Math.floor(Math.random()*refusalTexts.length)]);
      isThinking = false;
    }, 600);
    return;
  }

  try {
    const res = await fetch('/api/respond', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    setTimeout(() => {
      speech.classList.remove('shaking');
      typeText(data.reply || '…');
      isThinking = false;
    }, 800);
  } catch {
    typeText('말 안 해.');
    isThinking = false;
  }
}

/* =========================
   INPUT
========================= */
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    unlockAudio();
    if (!input.value.trim() || isThinking) return;
    coinSound.play();
    apiRespond(input.value.trim());
    input.value = '';
  }
});
