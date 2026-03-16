export default class DepthBuffer {
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
     * 샘플링 레벨 (예: 2, 4) - 기본값 2
     * - 1: 1x (1 샘플, 앨리어싱 없음)
     * - 2: 2x (4 샘플, 앨리어싱 2x)
     * - 4: 4x (16 샘플, 앨리어싱 4x)
     *
     * @private
     * @type {number}
     */
    private _sampleLevel: number = 2;

    /**
     * 깊이 버퍼
     *
     * @private
     * @type {Float32Array}
     */
    private _buffer: Float32Array;

    /**
     * Creates an instance of DepthBuffer.
     *
     * @constructor
     * @param {number} width           이미지 width
     * @param {number} height          이미지 height
     * @param {number} sampleLevel     샘플링 레벨 (예: 2, 4)
     */
    constructor(width: number, height: number, sampleLevel: number = 2) {
        this._width = width;
        this._height = height;
        this._sampleLevel = sampleLevel;

        this._buffer = new Float32Array(
            this.width * this.height * this.sampleLevel * this.sampleLevel,
        );

        this.clear();
    }

    /**
     * 특정 좌표에 깊이 값 설정
     *
     * @param {number} x       X 좌표
     * @param {number} y       Y 좌표
     * @param {number} sx      샘플링 X 좌표 (0 ~ sampleLevel-1)
     * @param {number} sy      샘플링 Y 좌표 (0 ~ sampleLevel-1)
     * @param {number} depth   깊이 값
     * @return {void}
     * @throws {Error} 좌표가 버퍼 범위를 벗어날 경우 에러 발생
     */
    setPixel(
        x: number,
        y: number,
        sx: number,
        sy: number,
        depth: number,
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
            // console.error(
            //     `setPixel: 좌표 (${x}, ${y}), 샘플링 좌표 (${sx}, ${sy})가 버퍼 범위를 벗어났습니다.`,
            // );
            return;
        }

        const index: number =
            (y * this.width + x) * this.sampleLevel * this.sampleLevel +
            sy * this.sampleLevel +
            sx;

        this._buffer[index] = depth;
    }

    /**
     * 특정 좌표의 깊이 값 가져오기
     *
     * @param {number} x       X 좌표
     * @param {number} y       Y 좌표
     * @param {number} sx      샘플링 X 좌표 (0 ~ sampleLevel-1)
     * @param {number} sy      샘플링 Y 좌표 (0 ~ sampleLevel-1)
     * @return {number | null} 깊이 값 (좌표가 버퍼 범위를 벗어날 경우 null 반환)
     */
    getPixel(x: number, y: number, sx: number, sy: number): number | null {
        if (
            x < 0 ||
            x >= this._width ||
            y < 0 ||
            y >= this._height ||
            sx < 0 ||
            sx >= this._sampleLevel ||
            sy < 0 ||
            sy >= this._sampleLevel
        ) {
            console.error(
                `getPixel: 좌표 (${x}, ${y}), 샘플링 좌표 (${sx}, ${sy})가 버퍼 범위를 벗어났습니다.`,
            );
            return null;
        }

        const index: number =
            (y * this._width + x) * this._sampleLevel * this._sampleLevel +
            sy * this._sampleLevel +
            sx;

        return this._buffer[Math.trunc(index)];
    }

    /**
     * 깊이 버퍼를 시각화하기 위한 ImageData 생성
     *
     * - 깊이 값을 0-255 범위로 정규화하여 흑백 이미지로 표현
     * - 가까운 픽셀은 밝게, 먼 픽셀은 어둡게 표시
     * - 깊이 값이 유효하지 않은 경우(예: 양의 무한대) 검정색으로 처리
     *
     * @return {ImageData} 깊이 버퍼를 시각화한 ImageData 객체
     */
    getImageData(): ImageData {
        const data = new Uint8ClampedArray(this.width * this.height * 4);

        // 1. 유효한 depth값의 min/max 수집
        let minDepth = Number.POSITIVE_INFINITY;
        let maxDepth = Number.NEGATIVE_INFINITY;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                for (let sy = 0; sy < this.sampleLevel; sy++) {
                    for (let sx = 0; sx < this.sampleLevel; sx++) {
                        const d = this.getPixel(x, y, sx, sy);
                        if (d === null || d === Number.POSITIVE_INFINITY) {
                            continue;
                        }

                        if (d < minDepth) {
                            minDepth = d;
                        }
                        if (d > maxDepth) {
                            maxDepth = d;
                        }
                    }
                }
            }
        }

        const depthRange = maxDepth - minDepth;

        // 2. 정규화 후 시각화
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let minSampleDepth = Number.POSITIVE_INFINITY;

                for (let sy = 0; sy < this.sampleLevel; sy++) {
                    for (let sx = 0; sx < this.sampleLevel; sx++) {
                        const d = this.getPixel(x, y, sx, sy);
                        if (d !== null && d < minSampleDepth) {
                            minSampleDepth = d;
                        }
                    }
                }

                let colorValue: number;

                if (
                    minSampleDepth === Number.POSITIVE_INFINITY ||
                    depthRange === 0
                ) {
                    // 배경 → 검정색
                    colorValue = 0;
                } else {
                    // 가까울수록 밝게(255), 멀수록 어둡게(0)
                    const normalized =
                        1 - (minSampleDepth - minDepth) / depthRange;

                    colorValue = Math.floor(normalized * 255);
                }

                const index = (y * this.width + x) * 4;
                data[index] = colorValue;
                data[index + 1] = colorValue;
                data[index + 2] = colorValue;
                data[index + 3] = 255;
            }
        }

        return new ImageData(data, this.width, this.height);
    }

    /**
     * 깊이 버퍼 초기화
     *
     * - 모든 깊이 값을 양의 무한대로 설정하여 초기화
     * - 이렇게 하면 어떤 픽셀도 초기 상태에서 깊이 테스트를 통과할 수 있도록 보장
     *
     * @return {void}
     */
    clear(): void {
        this._buffer.fill(Number.POSITIVE_INFINITY);
    }

    /**
     * 깊이 버퍼의 width 값 반환
     *
     * @returns {number} 깊이 버퍼의 width
     */
    get width(): number {
        return this._width;
    }

    /**
     * 깊이 버퍼의 height 값 반환
     *
     * @returns {number} 깊이 버퍼의 height
     */
    get height(): number {
        return this._height;
    }

    /**
     * 샘플링 레벨 반환
     *
     * @returns {number} 샘플링 레벨
     */
    get sampleLevel(): number {
        return this._sampleLevel;
    }

    /**
     * 깊이 버퍼값 반환
     *
     * @returns {Float32Array} 깊이 버퍼값
     */
    get buffer(): Float32Array {
        return this._buffer;
    }
}
