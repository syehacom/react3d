import Vector from "../utils/vector.js";
import { clamp, remap } from "../utils/helpers.js";

/**
 * Calculates Hip rotation and world position
 * @param {Array} lm3d : array of 3D pose vectors from tfjs or mediapipe
 * @param {Array} lm2d : array of 2D pose vectors from tfjs or mediapipe
 */
export const calcHips = (lm3d, lm2d) => {
    //Find 2D normalized Hip and Shoulder Joint Positions/Distances
    let hipLeft2d = Vector.fromArray(lm2d[23]);
    let hipRight2d = Vector.fromArray(lm2d[24]);
    let shoulderLeft2d = Vector.fromArray(lm2d[11]);
    let shoulderRight2d = Vector.fromArray(lm2d[12]);
    let hipCenter2d = hipLeft2d.lerp(hipRight2d);
    let shoulderCenter2d = shoulderLeft2d.lerp(shoulderRight2d);
    let spineLength = hipCenter2d.distance(shoulderCenter2d);

    let hips = {
        position: {
            x: clamp(-1 * (hipCenter2d.x - 0.65), -1, 1), //subtract .65 to bring closer to 0,0 center
            y: 0,
            z: clamp(spineLength - 1, -2, 0),
        },
        rotation: null,
    };
    hips.rotation = Vector.rollPitchYaw(lm3d[23], lm3d[24]);
    //fix -PI, PI jumping
    if (hips.rotation.y > 0.5) {
        hips.rotation.y -= 2;
    }
    hips.rotation.y += 0.5;
    //Stop jumping between left and right shoulder tilt
    if (hips.rotation.z > 0) {
        hips.rotation.z = 1 - hips.rotation.z;
    }
    if (hips.rotation.z < 0) {
        hips.rotation.z = -1 - hips.rotation.z;
    }
    let turnAroundAmountHips = remap(Math.abs(hips.rotation.y), 0.2, 0.4);
    hips.rotation.z *= 1 - turnAroundAmountHips;
    hips.rotation.x = 0; //temp fix for inaccurate X axis

    let spine = Vector.rollPitchYaw(lm3d[11], lm3d[12]);
    //fix -PI, PI jumping
    if (spine.y > 0.5) {
        spine.y -= 2;
    }
    spine.y += 0.5;
    //Stop jumping between left and right shoulder tilt
    if (spine.z > 0) {
        spine.z = 1 - spine.z;
    }
    if (spine.z < 0) {
        spine.z = -1 - spine.z;
    }
    //fix weird large numbers when 2 shoulder points get too close
    let turnAroundAmount = remap(Math.abs(spine.y), 0.2, 0.4);
    spine.z *= 1 - turnAroundAmount;
    spine.x = 0; //temp fix for inaccurate X axis

    return rigHips(hips, spine);
};

/**
 * Converts normalized rotations to radians and estimates world position of hips
 * @param {Object} hips : hip position and rotation values
 * @param {Object} spine : spine position and rotation values
 */
export const rigHips = (hips, spine) => {
    //convert normalized values to radians
    hips.rotation.x *= Math.PI;
    hips.rotation.y *= Math.PI;
    hips.rotation.z *= Math.PI;

    hips.worldPosition = {
        x: hips.position.x * (0.5 + 1.8 * -hips.position.z),
        y: 0,
        z: hips.position.z * (0.1 + hips.position.z * -2),
    };

    spine.x *= Math.PI;
    spine.y *= Math.PI;
    spine.z *= Math.PI;

    return {
        Hips: hips,
        Spine: spine,
    };
};
