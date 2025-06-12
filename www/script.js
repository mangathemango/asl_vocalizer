const HAND_LANDMARKS = {
  0:  'Wrist',
  1:  'Thumb CMC',
  2:  'Thumb MCP',
  3:  'Thumb IP',
  4:  'Thumb tip',
  5:  'Index MCP',
  6:  'Index PIP',
  7:  'Index DIP',
  8:  'Index tip',
  9:  'Middle MCP',
  10: 'Middle PIP',
  11: 'Middle DIP',
  12: 'Middle tip',
  13: 'Ring MCP',
  14: 'Ring PIP',
  15: 'Ring DIP',
  16: 'Ring tip',
  17: 'Pinky MCP',
  18: 'Pinky PIP',
  19: 'Pinky DIP',
  20: 'Pinky tip'
};



const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

videoElement.onloadeddata = () => {
    console.log("✅ Webcam feed loaded");
};

let minz = 0
let maxz = 0

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
            let landmarkInfo = "";
            let i = 0;
            processLandmarks(landmarks).forEach(element => {
                i++
                if (i % 3 === 1) {
                    landmarkInfo += `<span class="landmark">${HAND_LANDMARKS[(i + -1) / 3]}: ${element}</span>`;
                } else {
                    landmarkInfo += `<span class="landmark">${element}</span>`;
                }
                if (i % 3 === 0) {
                    landmarkInfo += "<br/>";
                } else {
                    landmarkInfo += ", ";
                }
            });
            // landmarks.forEach(element => {
            //     landmarkInfo += `[${element.x.toFixed(2)}, ${element.y.toFixed(2)}, ${element.z.toFixed(2)}]<br/>`
            // });
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

const processLandmarks = (landmarks) => {
    return landmarks.map((landmark) => {
        let xyRange = [-0.3, 1.3]
        let zRange = [-0.69, 0.2]
        let finalX = (landmark.x - xyRange[0]) / (xyRange[1] - xyRange[0])
        let finalY = (landmark.y - xyRange[0]) / (xyRange[1] - xyRange[0])
        let finalZ = (landmark.z - zRange[0]) / (zRange[1] - zRange[0])
        return [
            finalX.toFixed(2),
            finalY.toFixed(2),
            finalZ.toFixed(2)
        ]
    }).flat();
}