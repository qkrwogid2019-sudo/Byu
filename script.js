const loveFaces = [
  "img/love_01.png",
  "img/love_02.png",
  "img/love_03.png",
  "img/love_04.png"
];

const angryFaces = [
  "img/angry_01.png",
  "img/angry_02.png",
  "img/angry_03.png",
  "img/angry_04.png"
];

let liking = 0;
const face = document.getElementById("face");
const gauge = document.getElementById("likeGauge");

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function updateGauge() {
  gauge.style.width = `${liking * 100}%`;
}
function flashFaces(faceList, duration = 500, finalFace) {
  const interval = 80;
  let elapsed = 0;

  const flicker = setInterval(() => {
    face.src = randomFrom(faceList);
    elapsed += interval;

    if (elapsed >= duration) {
      clearInterval(flicker);
      face.src = finalFace;
    }
  }, interval);
}
