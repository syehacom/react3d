import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

export const drawCanvas = (ctx, results) => {
	const width = ctx.canvas.width
	const height = ctx.canvas.height
	ctx.save()
	ctx.clearRect(0, 0, width, height)
	// canvas の左右反転
	ctx.scale(-1, 1)
	ctx.translate(-width, 0)
	// capture image の描画
	ctx.drawImage(results.image, 0, 0, width, height)
	// 手の描画
	if (results.multiHandLandmarks) {
		// 骨格の描画
		for (const landmarks of results.multiHandLandmarks) {
			drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 })
			drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 5 })
		}
    	// 円の描画
		drawCircle(ctx, results.multiHandLandmarks)
	}
	ctx.restore()
}

const drawCircle = (ctx, handLandmarks) => {
	if (handLandmarks.length === 2 && handLandmarks[0].length > 8 && handLandmarks[1].length > 8) {
		const width = ctx.canvas.width
		const height = ctx.canvas.height
		const [x1, y1] = [handLandmarks[0][8].x * width, handLandmarks[0][8].y * height]
		const [x2, y2] = [handLandmarks[1][8].x * width, handLandmarks[1][8].y * height]
		const x = (x1 + x2) / 2
		const y = (y1 + y2) / 2
		const r = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) / 2

		ctx.strokeStyle = '#0082cf'
		ctx.lineWidth = 5
		ctx.beginPath()
		ctx.arc(x, y, r, 0, Math.PI * 2, true)
		ctx.stroke()
	}
}
