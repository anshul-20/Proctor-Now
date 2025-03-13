// DisableDevtool({});

window.onbeforeunload = () => "";
window.close = () => "";

const socket = io();
const myPeer = new Peer({ host: "localhost", port: 3000, path: "/peer/video" });

myPeer.on("open", (id) => {
  // When we first open the app, have us join a room
  socket.emit("join-room", "invigilate", id);
});

window.warnings = 0;

const videoElement = document.querySelector(".quiz__camera__input-video");
const canvasElement = document.querySelector(".quiz__camera__output-video");
const canvasCtx = canvasElement.getContext("2d");
let escapeWarnings = 0;
let facialDetectionWarnings = 0;

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  if (results.multiFaceLandmarks) {
    if (results.multiFaceLandmarks.length !== 1) {
      facialDetectionWarnings++;
      // swal({
      //   title: "Facial Detection Warning",
      //   text: "There should always be a single person on camera",
      //   button: "Continue",
      // });
    }

    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
        color: "#C0C0C070",
        lineWidth: 1,
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
        color: "#E0E0E0",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: "#E0E0E0" });
    }
  }
  canvasCtx.restore();
}

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});

faceMesh.setOptions({
  maxNumFaces: 5,
  minDetectionConfidence: 0.4,
  minTrackingConfidence: 0.4,
});
faceMesh.onResults(onResults);

document.body.requestFullscreen({
  navigationUI: "hide",
});

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  videoElement.srcObject = stream;
  sendToMediaPipe();
  socket.on("user-connected", (userId) => {
    // If a new user connect
    console.log("User Connected", userId);
    setTimeout(connectToNewUser, 1000, userId, stream);
  });
});

function connectToNewUser(userId, stream) {
  // This runs when someone joins our room
  const call = myPeer.call(userId, stream); // Call the user who just joined
  console.log(call);
}

const sendToMediaPipe = async () => {
  // if (!videoElement.videoWidth) {
  //   console.log(videoElement.videoWidth);
  //   requestAnimationFrame(sendToMediaPipe);
  // } else {
  await faceMesh.send({ image: videoElement });
  requestAnimationFrame(sendToMediaPipe);
  // }
};
