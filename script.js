/* =========================
   DOM
========================= */
const emotions = document.querySelectorAll('.emotion');
const speech = document.getElementById('speech');
const speechText = document.getElementById('speechText');
const happyFill = document.getElementById('overflowFill');
const sadnessFill = document.getElementById('stabilityFill');
const input = document.getElementById('chatInput');
const effectLayer = document.getElementById('effectLayer');

const emotionSound = document.getElementById('emotionSound');
const coinSound = document.getElementById('coinSound');
const coinRejectSound = document.getElementById('coinRejectSound');

/* =========================
   CONSTANTS
========================= */
const MAX_GAUGE = 100;

/* =========================
   STATE
========================= */
let happy = 0;
let sadness = 0;
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
const positiveWords = [
  '좋아','사랑','고마워','행복','기뻐','설레',
  '안아','보고싶어','괜찮아','잘했어'
];

const negativeWords = [
  '힘들어','우울','불안','짜증','화나',
  '외로워','아파','지쳐','싫어'
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
   AUDIO (iOS)
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

const play = a => {
  if (!a) return;
  a.currentTime = 0;
  a.play().catch(()=>{});
};

/* =========================
   EFFECT
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
   EMOTION SHUFFLE
========================= */
function chararararak(finalGroup, loops = 2, interval = 110) {
  clearInterval(shuffleTimer);

  const all = [...emotions];
  const finals = all.filter(e =>
    finalGroup.includes(e.getAttribute('src'))
  );

  let step = 0;
  const total = all.length * loops;

  shuffleTimer = setInterval(() => {
    emotions.forEach(e => e.classList.remove('active'));
    all[step % all.length].classList.add('active');
    step++;

    if (step >= total) {
      clearInterval(shuffleTimer);
      emotions.forEach(e => e.classList.remove('active'));
      if (finals.length) {
        finals[Math.floor(Math.random() * finals.length)]
          .classList.add('active');
      }
      play(emotionSound);
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
   LOCAL RESPOND (게이지 + 연출)
========================= */
function localRespond(userText) {
  const { p, n } = analyze(userText);

  if (p > 0) {
    happy = Math.min(MAX_GAUGE, happy + p * 10);
    chararararak(negativeEmotions);
    showHappyEffect();
  }

  if (n > 0) {
    sadness = Math.min(MAX_GAUGE, sadness + n * 10);
    chararararak(positiveEmotions);
  }

  happyFill.style.width = happy + '%';
  sadnessFill.style.width = sadness + '%';

  speech.classList.add('shaking');
  typeText(thinkingTexts[0], 35);
}

/* =========================
   API RESPOND
========================= */
async function apiRespond(userText) {
  if (isThinking) return;
  isThinking = true;

  localRespond(userText);

  if (happy >= MAX_GAUGE) {
    setTimeout(() => {
      speech.classList.remove('shaking');
      play(coinRejectSound);
      typeText(refusalTexts[Math.floor(Math.random() * refusalTexts.length)]);
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
    }, 900);

  } catch (e) {
    speech.classList.remove('shaking');
    typeText('말 안 해.');
    isThinking = false;
  }
}

/* =========================
   INPUT
========================= */
input.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  e.preventDefault();

  unlockAudio();

  if (!input.value.trim() || isThinking) return;

  if (happy >= MAX_GAUGE) {
    play(coinRejectSound);
    typeText(refusalTexts[Math.floor(Math.random() * refusalTexts.length)]);
    input.value = '';
    return;
  }

  play(coinSound);
  apiRespond(input.value.trim());
  input.value = '';
});
