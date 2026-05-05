import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

/**
 * INIT
 * Loads the MediaPipe FaceLandmarker model and starts the webcam.
 * Calls setReady(true) on success, setError(message) on failure.
 *
 * Why try/catch?
 *   - "NotAllowedError" = user blocked camera permission
 *   - Network errors = CDN/model load failed
 */
export const init = async (
  { landmarkerRef, videoRef, streamRef },
  setReady,
  setError
) => {
  try {
    // Step 1: Load MediaPipe WASM runtime from CDN
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    // Step 2: Create FaceLandmarker with blendshapes enabled
    landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
      },
      outputFaceBlendshapes: true, // Required to read facial muscle scores
      runningMode: "VIDEO",        // VIDEO mode for continuous frame analysis
      numFaces: 1,                 // Only track one face
    });

    console.log("✅ FaceLandmarker model loaded");

    // Step 3: Request webcam stream
    streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = streamRef.current;
    await videoRef.current.play();

    console.log("✅ Camera started");
    setReady(true);

  } catch (err) {
    console.error(" Init failed(utils.js):", err);

    const message =
      err.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access and refresh."
        : "Failed to load AI model. Check your internet connection.";

    setError(message);
  }
};

/**
 * DETECT
 * Runs face detection on the current video frame.
 * Returns an expression string or null if no face found.
 *
 * Why readyState >= 2?
 *   - 0 = no data, 1 = metadata only, 2 = current frame available
 *   - Calling detectForVideo on an unready video crashes MediaPipe
 *
 * Blendshape logic:
 *   - mouthSmileLeft/Right > 0.5  → happy
 *   - mouthFrownLeft/Right > 0.4  → sad
 *   - jawOpen > 0.4 + browInnerUp > 0.3 → surprised (both needed to avoid false positives)
 *   - else → neutral
 */
export const detect = ({ landmarkerRef, videoRef }) => {
  const video    = videoRef.current;
  const landmarker = landmarkerRef.current;

  // Guard: model and a readable video frame must both exist
  if (!landmarker || !video || video.readyState < 2) return null;

  const results = landmarker.detectForVideo(video, performance.now());

  // No face detected in this frame
  if (!results.faceBlendshapes?.length) {
    console.log("👤 No face in frame");
    return null;
  }

  const shapes = results.faceBlendshapes[0].categories;

  // Helper: get score by blendshape name, default 0
  const score = (name) =>
    shapes.find((b) => b.categoryName === name)?.score ?? 0;

  const smileLeft  = score("mouthSmileLeft");
  const smileRight = score("mouthSmileRight");
  const frownLeft  = score("mouthFrownLeft");
  const frownRight = score("mouthFrownRight");
  const jawOpen    = score("jawOpen");
  const browUp     = score("browInnerUp"); // Eyebrows raised = surprised

  console.log(
    `😊 smile:${smileLeft.toFixed(2)} 😢 frown:${frownLeft.toFixed(2)} 😮 jaw:${jawOpen.toFixed(2)} browUp:${browUp.toFixed(2)}`
  );

  // Classification: order matters — check most distinct expressions first
  if (smileLeft > 0.5 && smileRight > 0.5)  return "happy";
  if (frownLeft > 0.4 && frownRight > 0.4)  return "sad";
  if (jawOpen   > 0.4 && browUp     > 0.3)  return "surprised";

  return "neutral";
};