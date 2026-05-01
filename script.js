const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let stamp = new Image();
stamp.src = "stamp.png";

// カメラ起動
navigator.mediaDevices.getUserMedia({
  video: { facingMode: "user" },
  audio: false
}).then(stream => {
  video.srcObject = stream;
});

async function start() {
  await faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://cdn.jsdelivr.net/npm/face-api.js/weights"
  );

  setInterval(async () => {

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // フィルム風
    ctx.filter = `
      brightness(1.05)
      contrast(0.9)
      saturate(0.8)
      sepia(0.25)
    `;

   ctx.save();

// 横反転
ctx.scale(-1, 1);
ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

ctx.restore();

    // スタンプ
    detections.forEach(det => {
      const box = det.box;
      ctx.drawImage(
        stamp,
        box.x,
        box.y - 40,
        box.width,
        box.height
      );
    });

    // ノイズ
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        1
      );
    }

    // ビネット
    let grad = ctx.createRadialGradient(
      canvas.width/2,
      canvas.height/2,
      canvas.width/4,
      canvas.width/2,
      canvas.height/2,
      canvas.width/1.2
    );

    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.4)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  }, 100);
}

start();