const emotions = document.querySelectorAll('.emotion');
const speech = document.getElementById('speech');
const speechText = speech.querySelector('p');
const overflowFill = document.getElementById('overflowFill');
const input = document.getElementById('chatInput');

let shuffleTimer = null;
let typingTimer = null;
let overflow = 40; // 🔥 시작값 낮춤

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

const positiveWords = ['좋아','행복','사랑','고마워','괜찮아'];
const negativeWords = ['싫어','불안','짜증','화나','우울','힘들어'];

function analyze(text) {
  let p = 0, n = 0;
  positiveWords.forEach(w => text.includes(w) && p++);
  negativeWords.forEach(w => text.includes(w) && n++);
  return { p, n };
}

/* 🔥 차라라락 */
function chararararak(group, duration = 700, interval = 120) {
  let elapsed = 0;
  clearInterval(shuffleTimer);

  shuffleTimer = setInterval(() => {
    emotions.forEach(e => e.classList.remove('active'));
    const candidates = [...emotions].filter(e => group.includes(e.getAttribute('src')));
    if (!candidates.length) return;

    candidates[Math.floor(Math.random() * candidates.length)].classList.add('active');

    elapsed += interval;
    if (elapsed >= duration) clearInterval(shuffleTimer);
  }, interval);
}

/* ✍️ 타이핑 */
function typeText(text, speed = 40) {
  clearInterval(typingTimer);
  speechText.innerText = '';
  let i = 0;

  typingTimer = setInterval(() => {
    speechText.innerText += text[i++];
    if (i >= text.length) clearInterval(typingTimer);
  }, speed);
}
async function apiRespond(userText) {
  // 🔥 감정 분석 + 얼굴 연출
  respond(userText);

  const res = await fetch('/api/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userText })
  });

  const data = await res.json();

  speech.classList.remove('shaking');
  typeText(data.reply);
}
/* 🧠 반응 */
function respond(text) {
  const { p, n } = analyze(text);

  if (p > n) {
    overflow = Math.min(100, overflow + 15);
    chararararak(negativeEmotions); // 🔥 반동형성
  } else {
    overflow = Math.max(0, overflow - 5);
    chararararak(positiveEmotions);
  }

  overflowFill.style.width = overflow + '%';

  if (overflow >= 95) {
    speech.classList.add('shaking');
    typeText('…');
  } else {
    speech.classList.remove('shaking');
    typeText(text);
  }
}

/* ⌨️ 입력 */
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && input.value.trim()) {
    apiRespond(input.value.trim());
    input.value = '';
  }
});
