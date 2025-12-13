const emotions = document.querySelectorAll('.emotion');
const speechText = document.getElementById('speechText');
const overflowFill = document.getElementById('overflowFill');

let overflow = 70;

/* 표정 랜덤 스위칭 */

chararararak(
  600 + overflow * 5,     // duration
  Math.max(50, 150 - overflow) // interval
);

let shuffleTimer = null;

function chararararak(duration = 800, interval = 120) {
  let elapsed = 0;

  // 혹시 이전 애니메이션 남아있으면 제거
  clearInterval(shuffleTimer);

  shuffleTimer = setInterval(() => {
    emotions.forEach(e => e.classList.remove('active'));

    const index = Math.floor(Math.random() * emotions.length);
    emotions[index].classList.add('active');

    elapsed += interval;

    if (elapsed >= duration) {
      clearInterval(shuffleTimer);
    }
  }, interval);
}

/* 말풍선 + 게이지 반응 */

function respond(text) {
  speechText.innerText = text;

  overflow = Math.min(100, overflow + 10);
  overflowFill.style.width = overflow + '%';

  // 👇 여기!
  chararararak();

  if (overflow > 80) {
    speechText.innerText = '…';
  }
}

/* 입력 */
document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    respond(e.target.value);
    e.target.value = '';
  }
});
