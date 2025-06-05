import logger from "@utils/logger.js";

export class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        if (x === undefined || y === undefined || width === undefined || height === undefined) {
            logger.warn("Rect constructed with undefined x | y | width | height");
        }
    }
}