import Color from "../Common/Color";

export default class Texture {
    /**
     * 텍스처의 너비 (픽셀 단위)
     *
     * @type {number}
     */
    width: number;

    /**
     * 텍스처의 높이 (픽셀 단위)
     *
     * @type {number}
     */
    height: number;

    /**
     * 텍스처 데이터 (RGBA)
     *
     * @type {Uint8ClampedArray}
     */
    data: Uint8ClampedArray;

    /**
     * Creates an instance of Texture.
     *
     * @constructor
     * @param {number} width           텍스처의 너비 (픽셀 단위)
     * @param {number} height          텍스처의 높이 (픽셀 단위)
     * @param {Uint8ClampedArray} data 텍스처 데이터 (RGBA)
     */
    constructor(width: number, height: number, data: Uint8ClampedArray) {
        this.width = width;
        this.height = height;
        this.data = data;
    }

    /**
     * URL에서 텍스처를 로드하는 정적 메서드
     *
     * @static
     * @param {string} url 텍스처 이미지의 URL
     * @return {Promise<Texture>} 로드된 텍스처 객체를 반환하는 Promise
     */
    static async fromUrl(url: string): Promise<Texture> {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;

        await img.decode();

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("2D context not available");
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        return new Texture(img.width, img.height, imageData.data);
    }

    /**
     * 최근접 이웃 샘플링
     *
     * @param {number} u 텍스처 좌표 U (0-1)
     * @param {number} v 텍스처 좌표 V (0-1)
     * @return {Color} 샘플링된 색상
     */
    sampleNearest(u: number, v: number): Color {
        // clamp
        const uu = Math.min(1, Math.max(0, u));
        const vv = Math.min(1, Math.max(0, v));

        const x = Math.min(this.width - 1, Math.floor(uu * (this.width - 1)));
        const y = Math.min(
            this.height - 1,
            Math.floor((1 - vv) * (this.height - 1)),
        ); // v-flip
        const i = (y * this.width + x) * 4;

        return new Color(
            this.data[i],
            this.data[i + 1],
            this.data[i + 2],
            this.data[i + 3],
        );
    }
}
