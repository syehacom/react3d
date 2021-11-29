import Vector from "../utils/vector.js";
import { clamp, remap } from "../utils/helpers.js";

/**
 * Landmark points labeled for eye, brow, and pupils
 */
const points = {
  eye: {
    left: [130, 133, 160, 159, 158, 144, 145, 153],
    right: [263, 362, 387, 386, 385, 373, 374, 380],
  },
  brow: {
    left: [35, 244, 63, 105, 66, 229, 230, 231],
    right: [265, 464, 293, 334, 296, 449, 450, 451],
  },
  pupil: {
    left: [468, 469, 470, 471, 472],
    right: [473, 474, 475, 476, 477],
  },
};

/**
 * Calculate eye open ratios and remap to 0-1
 * @param {Array} lm : array of results from tfjs or mediapipe
 * @param {String} side : designate "left" or "right"
 * @param {Number} high : ratio at which eye is considered open
 * @param {Number} low : ratio at which eye is comsidered closed
 */
export const getEyeOpen = (
  lm,
  side = "left",
  { high = 0.85, low = 0.55 } = {}
) => {
  let eyePoints = points.eye[side];
  let eyeDistance = eyeLidRatio(
    lm[eyePoints[0]],
    lm[eyePoints[1]],
    lm[eyePoints[2]],
    lm[eyePoints[3]],
    lm[eyePoints[4]],
    lm[eyePoints[5]],
    lm[eyePoints[6]],
    lm[eyePoints[7]]
  );
  // human eye width to height ratio is roughly .3
  let maxRatio = 0.285;
  // compare ratio against max ratio
  let ratio = clamp(eyeDistance / maxRatio, 0, 2);
  // remap eye open and close ratios to increase sensitivity
  let eyeOpenRatio = remap(ratio, low, high);
  return {
    // remapped ratio
    norm: eyeOpenRatio,
    // ummapped ratio
    raw: ratio,
  };
};

/**
 * Calculate eyelid distance ratios based on landmarks on the face
 */
export const eyeLidRatio = (
  eyeOuterCorner,
  eyeInnerCorner,
  eyeOuterUpperLid,
  eyeMidUpperLid,
  eyeInnerUpperLid,
  eyeOuterLowerLid,
  eyeMidLowerLid,
  eyeInnerLowerLid
) => {
  eyeOuterCorner = new Vector(eyeOuterCorner);
  eyeInnerCorner = new Vector(eyeInnerCorner);

  eyeOuterUpperLid = new Vector(eyeOuterUpperLid);
  eyeMidUpperLid = new Vector(eyeMidUpperLid);
  eyeInnerUpperLid = new Vector(eyeInnerUpperLid);

  eyeOuterLowerLid = new Vector(eyeOuterLowerLid);
  eyeMidLowerLid = new Vector(eyeMidLowerLid);
  eyeInnerLowerLid = new Vector(eyeInnerLowerLid);

  //use 2D Distances instead of 3D for less jitter
  const eyeWidth = eyeOuterCorner.distance(eyeInnerCorner, 2);
  const eyeOuterLidDistance = eyeOuterUpperLid.distance(eyeOuterLowerLid, 2);
  const eyeMidLidDistance = eyeMidUpperLid.distance(eyeMidLowerLid, 2);
  const eyeInnerLidDistance = eyeInnerUpperLid.distance(eyeInnerLowerLid, 2);
  const eyeLidAvg =
    (eyeOuterLidDistance + eyeMidLidDistance + eyeInnerLidDistance) / 3;
  const ratio = eyeLidAvg / eyeWidth;

  return ratio;
};

/**
 * Calculate pupil position [-1,1]
 * @param {Object} lm : array of results from tfjs or mediapipe
 * @param {String} side : "left" or "right"
 */
export const pupilPos = (lm, side = "left") => {
  const eyeOuterCorner = new Vector(lm[points.eye[side][0]]);
  const eyeInnerCorner = new Vector(lm[points.eye[side][1]]);
  const eyeWidth = eyeOuterCorner.distance(eyeInnerCorner, 2);
  const midPoint = eyeOuterCorner.lerp(eyeInnerCorner, 0.5);
  const pupil = new Vector(lm[points.pupil[side][0]]);
  const dx = midPoint.x - pupil.x;
  //eye center y is slightly above midpoint
  const dy = midPoint.y - eyeWidth * 0.075 - pupil.y;
  let ratioX = dx / (eyeWidth / 2);
  let ratioY = dy / (eyeWidth / 4);

  ratioX *= 4;
  ratioY *= 4;

  return { x: ratioX, y: ratioY };
};

/**
 * Method to stabilize blink speeds to fix inconsistent eye open/close timing
 * @param {Object} eye : object with left and right eye values
 * @param {Number} headY : head y axis rotation in radians
 * @param {Boolean} enableWink : option to disable wink detection
 * @param {Number} maxRot: maximum head y axis rotation in radians
 */
export const stabilizeBlink = (
  eye,
  headY,
  { enableWink = true, maxRot = 0.5 } = {}
) => {
  eye.r = clamp(eye.r, 0, 1);
  eye.l = clamp(eye.l, 0, 1);
  //difference between each eye
  const blinkDiff = Math.abs(eye.l - eye.r);
  //theshold to which difference is considered a wink
  const blinkThresh = enableWink ? 0.8 : 1.2;
  //detect when both eyes are closing
  const isClosing = eye.l < 0.3 && eye.r < 0.3;
  //detect when both eyes are opening
  const isOpen = eye.l > 0.6 && eye.r > 0.6;

  // sets obstructed eye to the opposite eye value
  if (headY > maxRot) {
    return { l: eye.r, r: eye.r };
  }
  if (headY < -maxRot) {
    return { l: eye.l, r: eye.l };
  }

  // returns either a wink or averaged blink values
  return {
    l:
      blinkDiff >= blinkThresh && !isClosing && !isOpen
        ? eye.l
        : eye.r > eye.l
        ? Vector.lerp(eye.r, eye.l, 0.95)
        : Vector.lerp(eye.r, eye.l, 0.05),
    r:
      blinkDiff >= blinkThresh && !isClosing && !isOpen
        ? eye.r
        : eye.r > eye.l
        ? Vector.lerp(eye.r, eye.l, 0.95)
        : Vector.lerp(eye.r, eye.l, 0.05),
  };
};

/**
 * Calculate Eyes
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export const calcEyes = (lm, { high = 0.85, low = 0.55 } = {}) => {
  //return early if no iris tracking
  if (Object.keys(lm).length !== 50) {
    //lm.length !== 478;
    return {
      l: 1,
      r: 1,
    };
  }
  //open [0,1]
  const leftEyeLid = getEyeOpen(lm, "left", { high: high, low: low });
  const rightEyeLid = getEyeOpen(lm, "right", { high: high, low: low });

  return {
    l: leftEyeLid.norm || 0,
    r: rightEyeLid.norm || 0,
  };
};

/**
 * Calculate pupil location normalized to eye bounds
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export const calcPupils = (lm) => {
  //pupil x:[-1,1],y:[-1,1]
  if (Object.keys(lm).length !== 50) {
    //lm.length !== 478;
    return { x: 0, y: 0 };
  } else {
    //track pupils using left eye
    const pupilL = pupilPos(lm, "left");
    const pupilR = pupilPos(lm, "right");

    return {
      x: (pupilL.x + pupilR.x) * 0.5 || 0,
      y: (pupilL.y + pupilR.y) * 0.5 || 0,
    };
  }
};

/**
 * Calculate brow raise
 * @param {Array} lm : array of results from tfjs or mediapipe
 * @param {String} side : designate "left" or "right"
 */
export const getBrowRaise = (lm, side = "left") => {
  let browPoints = points.brow[side];
  let browDistance = eyeLidRatio(
    lm[browPoints[0]],
    lm[browPoints[1]],
    lm[browPoints[2]],
    lm[browPoints[3]],
    lm[browPoints[4]],
    lm[browPoints[5]],
    lm[browPoints[6]],
    lm[browPoints[7]]
  );

  let maxBrowRatio = 1.15;
  let browHigh = 0.125;
  let browLow = 0.07;
  let browRatio = browDistance / maxBrowRatio - 1;
  let browRaiseRatio =
    (clamp(browRatio, browLow, browHigh) - browLow) / (browHigh - browLow);
  return browRaiseRatio;
};

/**
 * Take the average of left and right eyebrow raise values
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export const calcBrow = (lm) => {
  if (Object.keys(lm).length !== 50) {
    //lm.length !== 478;
    return 0;
  } else {
    const leftBrow = getBrowRaise(lm, "left");
    const rightBrow = getBrowRaise(lm, "right");
    return (leftBrow + rightBrow) / 2 || 0;
  }
};
