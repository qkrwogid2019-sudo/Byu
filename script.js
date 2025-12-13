const emotions = document.querySelectorAll('.emotion');
const speech = document.getElementById('speech');
const speechText = document.getElementById('speechText');
const overflowFill = document.getElementById('overflowFill');
const input = document.getElementById('chatInput');

let shuffleTimer = null;
let overflow = 70;

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

function chararararak(group, duration = 700, interval = 120) {
  let elapsed = 0;
  clearInterval(shuffleTimer);

  shuffleTimer = setInterval(() => {
    emotions.forEach(e => e.classList.remove('active'));
    const candidates = [...emotions].filter(e => group.includes(e.src));
    if (!candidates.length) return;
    candidates[Math.floor(Math.random() * candidates.length)].classList.add('active');
    elapsed += interval;
    if (elapsed >= duration) clearInterval(shuffleTimer);
  }, interval);
}

function typeText(text) {
  speechText.innerText = '';
  let i = 0;
  const t = setInterval(() => {
    speechText.innerText += text[i++];
    if (i >= text.length) clearInterval(t);
  }, 40);
}


  function respond(text) {
  const { positiveScore, negativeScore } = analyzeInput(text);

  if (positiveScore > negativeScore) {
    overflow = Math.min(100, overflow + 15);
    chararararakByGroup(negativeEmotions); // 반동형성
  } else {
    overflow = Math.max(0, overflow - 5);
    chararararakByGroup(positiveEmotions);
  }

  overflowFill.style.width = overflow + '%';

  if (overflow >= 95) {
    speech.classList.add('shaking');
    typeText(speechText, '…');
  } else {
    speech.classList.remove('shaking');
    typeText(speechText, text);
  }
}

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && input.value.trim()) {
    respond(input.value.trim());
    input.value = '';
  }
});
