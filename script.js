const emotions = document.querySelectorAll('.emotion');
const speechText = document.getElementById('speechText');
const overflowFill = document.getElementById('overflowFill');

const negativeEmotions = [
  'img/angry_01.png',
  'img/angry_02.png',
  'img/angry_03.png'
  'img/angry_04.png'
];

const positiveEmotions = [
  'img/love_01.png',
  'img/love_02.png'
  'img/love_03.png'
  'img/love_04.png'

];

const emotionLayers = Array.from(document.querySelectorAll('.emotion'));

const positiveWords = [
  '좋아', '행복', '사랑', '기뻐', '편해',
  '괜찮아', '고마워', '안정', '즐거워'
];

const negativeWords = [
  '싫어', '불안', '짜증', '화나', '우울',
  '힘들어', '불편', '괴로워'
];

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

let overflow = 70;


}

function chararararakByGroup(group, duration = 800, interval = 120) {
  let elapsed = 0;
  clearInterval(shuffleTimer);

  shuffleTimer = setInterval(() => {
    emotionLayers.forEach(e => e.classList.remove('active'));

    const candidates = emotionLayers.filter(img =>
      group.includes(img.getAttribute('src'))
    );

    const index = Math.floor(Math.random() * candidates.length);
    candidates[index].classList.add('active');

    elapsed += interval;
    if (elapsed >= duration) clearInterval(shuffleTimer);
  }, interval);
}
function respond(text) {
  speechText.innerText = text;

  const { positiveScore, negativeScore } = analyzeInput(text);

  // 게이지 변화
  if (positiveScore > negativeScore) {
    overflow = Math.min(100, overflow + 15);
    chararararakByGroup(negativeEmotions); // 🔥 반동형성
  } else {
    overflow = Math.max(0, overflow - 5);
    chararararakByGroup(positiveEmotions);
  }

  overflowFill.style.width = overflow + '%';

  if (overflow > 80) {
    speechText.innerText = '…';
  }
}
