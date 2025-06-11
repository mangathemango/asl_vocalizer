const HAND_LANDMARKS = {
  0:  'WRIST',
  1:  'THUMB_CMC',
  2:  'THUMB_MCP',
  3:  'THUMB_IP',
  4:  'THUMB_TIP',
  5:  'INDEX_FINGER_MCP',
  6:  'INDEX_FINGER_PIP',
  7:  'INDEX_FINGER_DIP',
  8:  'INDEX_FINGER_TIP',
  9:  'MIDDLE_FINGER_MCP',
  10: 'MIDDLE_FINGER_PIP',
  11: 'MIDDLE_FINGER_DIP',
  12: 'MIDDLE_FINGER_TIP',
  13: 'RING_FINGER_MCP',
  14: 'RING_FINGER_PIP',
  15: 'RING_FINGER_DIP',
  16: 'RING_FINGER_TIP',
  17: 'PINKY_MCP',
  18: 'PINKY_PIP',
  19: 'PINKY_DIP',
  20: 'PINKY_TIP'
};


const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

videoElement.onloadeddata = () => {
    console.log("✅ Webcam feed loaded");
};

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the webcam image first
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height
    );
    document.getElementById("input-label").innerHTML = ""
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 3
            });
            drawLandmarks(canvasCtx, landmarks, {
                color: '#FF0000',
                lineWidth: 0
            });
            console.log(landmarks)
            let landmarkInfo = "";
            landmarks.forEach(element => {
                landmarkInfo += `[${element.x.toFixed(2)}, ${element.y.toFixed(2)}, ${element.z.toFixed(2)}]<br/>`
            });
            document.getElementById("input-label").innerHTML = landmarkInfo
        }
    }
    canvasCtx.restore();
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});
camera.start();