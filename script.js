const loveFaces = [
  "img/love_01.png",
  "img/love_02.png",
  "img/love_03.png"
  "img/love_04.png"
];

const angryFaces = [
  "img/angry_01.png",
  "img/angry_02.png"
  "img/angry_03.png"
  "img/angry_04.png"

];

const face = document.getElementById("face");

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function updateFace() {
  // 좋아할수록 화남 (반동형성)
  const liking = Math.random();

  if (liking > 0.4) {
    face.src = randomFrom(angryFaces);
  } else {
    face.src = randomFrom(loveFaces);
  }
}
