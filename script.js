const emotions = document.querySelectorAll('.emotion');
const speechText = document.getElementById('speechText');
const overflowFill = document.getElementById('overflowFill');

let overflow = 70;

/* 표정 랜덤 스위칭 */
function shuffleEmotion() {
  emotions.forEach(e => e.classList.remove('active'));
  const index = Math.floor(Math.random() * emotions.length);
  emotions[index].classList.add('active');
}

/* 말풍선 + 게이지 반응 */
function respond(text) {
  speechText.innerText = text;

  overflow = Math.min(100, overflow + 10);
  overflowFill.style.width = overflow + '%';

  shuffleEmotion();

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
