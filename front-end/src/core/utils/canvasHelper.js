/**
 * Debug method to draw a point in the canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}} center
 * @param {{r: number, g: number, b: number, a: number}} color
 */
export function drawPtn(ctx, center, color = { r: 255, g: 0, b: 255, a: 0.8 }) {
    const size = 10;

    ctx.save();
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.fillRect(center.x - size / 2, center.y - size / 2, size, size);

    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center.x - size * 2, center.y);
    ctx.lineTo(center.x + size * 2, center.y);
    ctx.moveTo(center.x, center.y - size * 2);
    ctx.lineTo(center.x, center.y + size * 2);
    ctx.stroke();

    ctx.restore();
}