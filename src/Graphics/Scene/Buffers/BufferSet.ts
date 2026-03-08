import FrameBuffer from "./FrameBuffer";
import DepthBuffer from "./DepthBuffer";
import ColorBuffer from "./ColorBuffer";

export default class BufferSet {
    /**
     * 이미지 width
     *
     * @private
     * @type {number}
     */
    private _width: number = 0;

    /**
     * 이미지 height
     *
     * @private
     * @type {number}
     */
    private _height: number = 0;

    /**
     * 색상 채널 수 (3-4)
     * - 3: RGB
     * - 4: RGBA
     *
     * @private
     * @type {number}
     */
    private _colorChannels: number = 4; // RGBA

    /**
     * 샘플링 레벨 (예: 0, 2, 4)
     * - 0: 1x (1 샘플 - 앨리어싱 없음)
     * - 2: 2x (4 샘플 - 앨리어싱 2x)
     * - 4: 4x (16 샘플 - 앨리어싱 4x)
     *
     * @private
     * @type {number}
     */
    private _sampleLevel: number = 2;

    /**
     * 프레임 버퍼
     *
     * @type {FrameBuffer}
     */
    frameBuffer: FrameBuffer;

    /**
     * 깊이 버퍼
     *
     * @type {DepthBuffer}
     */
    depthBuffer: DepthBuffer;

    /**
     * 색상 버퍼
     *
     * @type {ColorBuffer}
     */
    colorBuffer: ColorBuffer;

    /**
     * Constructor
     *
     * @constructor
     * @param {number} width            이미지 width
     * @param {number} height           이미지 height
     * @param {number} [sampleLevel=2]  샘플링 레벨 (기본값: 2)
     */
    constructor(width: number, height: number, sampleLevel: number = 2) {
        this._width = width;
        this._height = height;
        this._sampleLevel = sampleLevel;

        const sl = parseInt(String(this.sampleLevel));

        this.frameBuffer = new FrameBuffer(width, height);
        this.depthBuffer = new DepthBuffer(width, height, sl);
        this.colorBuffer = new ColorBuffer(width, height, sl);
    }

    /**
     * 버퍼 초기화 (기본값: 흰색)
     *
     * @param {number} r    Red 값 (0-255, 기본값: 255)
     * @param {number} g    Green 값 (0-255, 기본값: 255)
     * @param {number} b    Blue 값 (0-255, 기본값: 255)
     * @param {number} a    Alpha 값 (0-255, 기본값: 255)
     * @return {void}
     */
    clear(r: number, g: number, b: number, a: number = 255): void {
        this.frameBuffer?.clear(r, g, b, a);
        this.colorBuffer?.clear();
        this.depthBuffer?.clear();
    }

    /**
     * buffer width 반환
     *
     * @readonly
     * @type {number}
     */
    get width(): number {
        return this._width;
    }

    /**
     * buffer height 반환
     *
     * @readonly
     * @type {number}
     */
    get height(): number {
        return this._height;
    }

    /**
     * 색상 채널 수 반환
     *
     * @readonly
     * @type {number}
     */
    get colorChannels(): number {
        return this._colorChannels;
    }

    /**
     * 샘플링 레벨 반환
     *
     * @readonly
     * @type {number}
     */
    get sampleLevel(): number {
        return this._sampleLevel;
    }
}
