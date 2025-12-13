const emotions = document.querySelectorAll('.emotion');
const overflowFill = document.getElementById('overflowFill');
const emotionLayers = Array.from(emotions);
const speech = document.getElementById('speech');

/* 🔥 중요: 타이머 선언 */
let shuffleTimer = null;
let overflow = 70;

/* 감정 그룹 */
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

/* 키워드 */
const positiveWords = [
  '좋아', '행복', '사랑', '기뻐', '편해',
  '괜찮아', '고마워', '안정', '즐거워'
];

const negativeWords = [
  '싫어', '불안', '짜증', '화나', '우울',
  '힘들어', '불편', '괴로워'
];

function typeText(element, text, speed = 40) {
  element.innerText = '';
  let i = 0;
  const typing = setInterval(() => {
    element.innerText += text[i];
    i++;
    if (i >= text.length) clearInterval(typing);
  }, speed);
}

/* 입력 분석 */
function analyzeInput(text) {
  const lower = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;

  positiveWords.forEach(word => {
    if (lower.includes(word)) positiveScore++;
  });

  negativeWords.forEach(word => {
    if (lower.includes(word)) negativeScore++;
  });

  return { positiveScore, negativeScore };
}

/* 차라라락 */
function chararararakByGroup(group, duration = 800, interval = 120) {
  let elapsed = 0;
  clearInterval(shuffleTimer);

  shuffleTimer = setInterval(() => {
    emotionLayers.forEach(e => e.classList.remove('active'));

    const candidates = emotionLayers.filter(img =>
      group.includes(img.getAttribute('src'))
    );

    if (candidates.length === 0) return;

    const index = Math.floor(Math.random() * candidates.length);
    candidates[index].classList.add('active');

    elapsed += interval;
    if (elapsed >= duration) clearInterval(shuffleTimer);
  }, interval);
}

function respond(text) {
  const { positiveScore, negativeScore } = analyzeInput(text);

  // 반동형성 로직
  if (positiveScore > negativeScore) {
    overflow = Math.min(100, overflow + 15);
    chararararakByGroup(negativeEmotions); // 🔥 긍정 → 분노
  } else {
    overflow = Math.max(0, overflow - 5);
    chararararakByGroup(positiveEmotions);
  }

  overflowFill.style.width = overflow + '%';

  // 말풍선 출력
  if (overflow >= 95) {
  speech.classList.add('shaking');
  typeText(speech.querySelector('p'), '…');
} else {
  speech.classList.remove('shaking');
  typeText(speech.querySelector('p'), text);
}
async function apiRespond(text) {
  const res = await fetch('/api/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();
  respond(data.reply);
}

/* 엔터 입력 */
document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.value.trim() !== '') {
    respond(e.target.value);
    e.target.value = '';
  }
});
