import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const init = async (
  { landmarkerRef, videoRef, streamRef },
  setReady,
  setError
) => {
  try {
    if (landmarkerRef.current) return;

    //  CDN use karo — pinned version, not @latest
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
    );

    landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        // Ye URL sahi hai — ye change mat karo
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    });

    console.log("✅ FaceLandmarker loaded");

    if (!videoRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;

    if (!videoRef.current) {
      stream.getTracks().forEach(t => t.stop());
      return;
    }

    videoRef.current.srcObject = stream;

    try {
      await videoRef.current.play();
      console.log("✅ Camera started");
      setReady(true);
    } catch (playErr) {
      if (playErr.name === "AbortError") return;
      throw playErr;
    }

  } catch (err) {
    if (err.name === "AbortError") return;
    console.error("Init failed:", err);
    setError(
      err.name === "NotAllowedError"
        ? "Camera permission denied."
        : "Failed to load AI model. Check internet connection."
    );
  }
};
export const detect = ({ landmarkerRef, videoRef }) => {
  const video = videoRef.current;
  const landmarker = landmarkerRef.current;

  if (!landmarker || !video || video.readyState < 2) return null;

  const results = landmarker.detectForVideo(video, performance.now());
  if (!results.faceBlendshapes?.length) return null;

  const shapes = results.faceBlendshapes[0].categories;
  const score = (name) =>
    shapes.find((b) => b.categoryName === name)?.score ?? 0;

  // ── All scores ──────────────────────────────────────────
  const smileLeft = score("mouthSmileLeft");
  const smileRight = score("mouthSmileRight");
  const frownLeft = score("mouthFrownLeft");
  const frownRight = score("mouthFrownRight");
  const jawOpen = score("jawOpen");
  const browUp = score("browInnerUp");
  const cheekSquint = score("cheekSquintLeft"); // Extra: smile confirmation

  // ── Debug log (remove in production) ────────────────────
  console.log(
    `smile:${smileLeft.toFixed(2)} frown:${frownLeft.toFixed(2)} ` +
    `jaw:${jawOpen.toFixed(2)} brow:${browUp.toFixed(2)}`
  );

  // ── Classification (order matters — specific first) ─────

  // SURPRISED: mouth opens + eyebrows raise
  // Real values: jawOpen > 0.25, browUp > 0.15
  if (jawOpen > 0.25 && browUp > 0.15) return "surprised";

  // HAPPY: both corners smile
  // Real values: both sides > 0.4, cheek squint confirms
  if (smileLeft > 0.4 && smileRight > 0.4) return "happy";

  // SAD: frown muscles activate
  // Real values: frown > 0.15 (much lower than you had!)
  if (frownLeft > 0.15 && frownRight > 0.15) return "sad";

  // NEUTRAL: default
  return "neutral";
};