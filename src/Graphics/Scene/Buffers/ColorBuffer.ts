import type Color from "../../Common/Color";

export default class ColorBuffer {
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
    private _colorChannels = 4; // RGBA

    /**
     * 샘플링 레벨 (예: 2, 4) - 기본값 2
     * - 1: 1x (1 샘플, 앨리어싱 없음)
     * - 2: 2x (4 샘플, 앨리어싱 2x)
     * - 4: 4x (16 샘플, 앨리어싱 4x)
     *
     * @private
     * @type {number}
     */
    private _sampleLevel: number = 1;

    /**
     * 이미지 버퍼 (RGBA)
     *
     * @private
     * @type {Uint8ClampedArray}
     */
    private _buffer: Uint8ClampedArray;

    /**
     * Creates an instance of ColorBuffer.
     *
     * @constructor
     * @param {number} width    이미지 width
     * @param {number} height   이미지 height
     * @param {number} sampleLevel 샘플링 레벨 (예: 2, 4)
     */
    constructor(width: number, height: number, sampleLevel: number = 2) {
        this._width = width;
        this._height = height;
        this._sampleLevel = sampleLevel;

        this._buffer = new Uint8ClampedArray(
            this.width *
                this.height *
                this.colorChannels *
                this.sampleLevel *
                this.sampleLevel,
        );
    }

    /**
     * 버퍼 초기화 (기본값: 흰색)
     *
     * @param {number} r       Red 값 (0-255, 기본값: 255)
     * @param {number} g       Green 값 (0-255, 기본값: 255)
     * @param {number} b       Blue 값 (0-255, 기본값: 255)
     * @param {number} a       Alpha 값 (0-255, 기본값: 255)
     * @return {void}
     */
    clear(
        r: number = 255,
        g: number = 255,
        b: number = 255,
        a: number = 255,
    ): void {
        if (!this._buffer) {
            return;
        }

        for (let i = 0; i < this._buffer.length; i += this.colorChannels) {
            this._buffer[i] = r; // R
            this._buffer[i + 1] = g; // G
            this._buffer[i + 2] = b; // B
            this._buffer[i + 3] = a; // A
        }
    }

    /**
     * 특정 좌표에 색상 설정
     *
     * @param {number} x        X 좌표
     * @param {number} y        Y 좌표
     * @param {number} sx       샘플링 X 좌표 (0 ~ sampleLevel-1)
     * @param {number} sy       샘플링 Y 좌표 (0 ~ sampleLevel-1)
     * @param {number} r        Red 값 (0-255)
     * @param {number} g        Green 값 (0-255)
     * @param {number} b        Blue 값 (0-255)
     * @param {number} [a=255]  Alpha 값 (0-255, 기본값: 255)
     * @return {void}
     * @throws {Error} 좌표가 버퍼 범위를 벗어날 경우 에러 발생
     */
    setPixel(
        x: number,
        y: number,
        sx: number,
        sy: number,
        r: number,
        g: number,
        b: number,
        a: number = 255,
    ): void {
        if (
            x < 0 ||
            x >= this.width ||
            y < 0 ||
            y >= this.height ||
            sx < 0 ||
            sx >= this.sampleLevel ||
            sy < 0 ||
            sy >= this.sampleLevel
        ) {
            console.error(
                `setPixel: 좌표 (${x}, ${y}), 샘플링 좌표 (${sx}, ${sy})가 버퍼 범위를 벗어났습니다.`,
            );
            return;
        }

        const index =
            ((y * this.width + x) * this.sampleLevel * this.sampleLevel +
                sy * this.sampleLevel +
                sx) *
            this.colorChannels;

        if (this._buffer) {
            this._buffer[index] = r; // R
            this._buffer[index + 1] = g; // G
            this._buffer[index + 2] = b; // B
            this._buffer[index + 3] = a; // Alpha 채널
        }
    }

    /**
     * 특정 좌표의 색상 가져오기
     *
     * @param {number} x        X 좌표
     * @param {number} y        Y 좌표
     * @param {number} sx       샘플링 X 좌표 (0 ~ sampleLevel-1)
     * @param {number} sy       샘플링 Y 좌표 (0 ~ sampleLevel-1)
     * @return {Color | null}   색상 정보 (RGBA) 또는 null (좌표가 범위를 벗어날 경우)
     * @throws {Error} 좌표가 버퍼 범위를 벗어날 경우 에러 발생
     */
    getPixel(x: number, y: number, sx: number, sy: number): Color | null {
        if (
            x < 0 ||
            x >= this.width ||
            y < 0 ||
            y >= this.height ||
            sx < 0 ||
            sx >= this.sampleLevel ||
            sy < 0 ||
            sy >= this.sampleLevel
        ) {
            console.error(
                `getPixel: 좌표 (${x}, ${y}), 샘플링 좌표 (${sx}, ${sy})가 버퍼 범위를 벗어났습니다.`,
            );
            return null;
        }

        const index =
            ((y * this.width + x) * this.sampleLevel * this.sampleLevel +
                sy * this.sampleLevel +
                sx) *
            this.colorChannels;

        if (this._buffer) {
            return {
                r: this._buffer[index], // R
                g: this._buffer[index + 1], // G
                b: this._buffer[index + 2], // B
                a: this._buffer[index + 3], // Alpha 채널
            };
        }

        return null;
    }

    /**
     * Buffer width 반환
     *
     * @return {number} buffer width
     */
    get width(): number {
        return this._width;
    }

    /**
     * Buffer height 반환
     *
     * @return {number} buffer height
     */
    get height(): number {
        return this._height;
    }

    /**
     * Color 채널 수 반환
     *
     * @return {number} color 채널 수
     */
    get colorChannels(): number {
        return this._colorChannels;
    }

    /**
     * 샘플링 레벨 반환
     *
     * @return {number} 샘플링 레벨
     */
    get sampleLevel(): number {
        return this._sampleLevel;
    }

    /**
     * 버퍼 반환
     *
     * @return {Uint8ClampedArray | null} 버퍼
     */
    get buffer(): Uint8ClampedArray | null {
        return this._buffer;
    }
}
