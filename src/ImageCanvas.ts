export default class ImageCanvas {
    /**
     * Canvas 객체
     *
     * @private
     * @type {HTMLCanvasElement}
     */
    private canvas: HTMLCanvasElement;

    /**
     * ImageData 객체
     *
     * @private
     * @type {ImageData}
     */
    private imageData: ImageData;

    /**
     * 캔버스 width
     *
     * @private
     * @type {number}
     */
    private width: number;

    /**
     * 캔버스 height
     *
     * @private
     * @type {number}
     */
    private height: number;

    /**
     * Constructor
     *
     * @constructor
     * @param {HTMLCanvasElement} canvas    HTML CanvasElement 객체
     * @param {number} width                캔버스 width
     * @param {number} height               캔버스 height
     */
    constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.imageData = this.canvas
            .getContext("2d")!
            .createImageData(this.width, this.height);
    }

    /**
     * 특정 좌표에 색상 설정
     *
     * @param {number} x       X 좌표
     * @param {number} y       Y 좌표
     * @param {number} r       Red 값 (0-255)
     * @param {number} g       Green 값 (0-255)
     * @param {number} b       Blue 값 (0-255)
     * @param {number} a       Alpha 값 (0-255)
     */
    setPixel(x: number, y: number, r: number, g: number, b: number, a: number) {
        if (x < 0 || x >= this.getWidth() || y < 0 || y >= this.getHeight()) {
            return;
        }
        const index = (y * this.getWidth() + x) * 4;

        this.imageData.data[index] = r; // R
        this.imageData.data[index + 1] = g; // G
        this.imageData.data[index + 2] = b; // B
        this.imageData.data[index + 3] = a; // A
    }

    /**
     * 이미지 데이터 캔버스에 렌더링
     *
     * @param {number} [startX=0]   시작 X 좌표
     * @param {number} [startY=0]   시작 Y 좌표
     * @return {void}
     */
    render(startX = 0, startY = 0) {
        const context = this.getContext();
        if (context) {
            context.putImageData(this.imageData, startX, startY);
        }
    }

    /**
     * Canvas 요소 반환
     *
     * @return {HTMLCanvasElement} Canvas 요소
     */
    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * CanvasRenderingContext2D 객체 반환
     *
     * @return {CanvasRenderingContext2D | null} CanvasRenderingContext2D 객체
     */
    getContext(): CanvasRenderingContext2D | null {
        return this.canvas.getContext("2d");
    }

    /**
     * 캔버스 width 반환
     *
     * @return {number} 캔버스 width
     */
    getWidth(): number {
        return this.width;
    }

    /**
     * 캔버스 height 반환
     *
     * @return {number} 캔버스 height
     */
    getHeight(): number {
        return this.height;
    }

    /**
     * ImageData 객체 반환
     *
     * @return {ImageData} ImageData 객체
     */
    getImageData(): ImageData {
        return this.imageData;
    }
}
