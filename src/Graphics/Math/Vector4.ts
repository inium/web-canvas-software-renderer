export default class Vector4 {
    /**
     * X 좌표
     *
     * @type {number}
     */
    x: number;

    /**
     * Y 좌표
     *
     * @type {number}
     */
    y: number;

    /**
     * Z 좌표
     *
     * @type {number}
     */
    z: number;

    /**
     * W 좌표
     *
     * @type {number}
     */
    w: number;

    /**
     * Creates an instance of Vector4.
     *
     * @constructor
     * @param {number} x   x 좌표
     * @param {number} y   y 좌표
     * @param {number} z   z 좌표
     * @param {number} w   w 좌표 (동차 좌표에서 1로 설정)
     */
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * 배열 to Vector
     *
     * @static
     * @param {number[]} arr  길이가 4인 배열 [x, y, z, w]
     * @returns {Vector4}     Vector4 객체
     */
    static fromArray(arr: number[]): Vector4 {
        if (arr.length !== 4) {
            throw new Error(
                "Array must have exactly 4 elements to convert to Vector4.",
            );
        }

        return new Vector4(arr[0], arr[1], arr[2], arr[3]);
    }

    /**
     * Vector4를 배열로 변환
     *
     * @returns {number[]} 길이가 4인 배열 [x, y, z, w]
     */
    toArray(): [number, number, number, number] {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * Vector4를 객체로 변환
     *
     * @returns {{ x: number; y: number; z: number; w: number }} x, y, z, w 속성을 가진 객체
     */
    toObject(): { x: number; y: number; z: number; w: number } {
        return { x: this.x, y: this.y, z: this.z, w: this.w };
    }
}
