const input = document.getElementById("chatInput");
const log = document.getElementById("chatLog");
const face = document.getElementById("faceLayer");

let badLevel = 70;
let goodLevel = 20;

input.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const text = input.value.trim();
  if (!text) return;

  addLog("user", text);
  input.value = "";

  addLog("system", "Processing affect...");

  const isPositive = /좋아|사랑|행복|고마워|기뻐|love|happy|thanks/i.test(text);

  setTimeout(() => {
    if (isPositive) {
      badLevel = Math.min(100, badLevel + 10);
      face.src = "img/angry_01.png";
      addLog("system", "Affect overflow detected.");
    } else {
      goodLevel = Math.min(100, goodLevel + 3);
      addLog("system", "System remains stable.");
    }

    updateGauge();
  }, 600);
});

const speech = document.getElementById("speech");

function updateSpeech(text) {
  speech.innerText = text;
}

function addLog(type, text) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function updateGauge() {
  document.querySelector(".bar.good .fill").style.width = goodLevel + "%";
  document.querySelector(".bar.bad .fill").style.width = badLevel + "%";
}
