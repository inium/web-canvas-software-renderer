export default class Vector2 {
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
     * Creates an instance of Vector2.
     *
     * @constructor
     * @param {number} [x=0]  X 좌표
     * @param {number} [y=0]  Y 좌표
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Vector 덧셈
     *
     * @param {Vector2} v   더할 Vector2 객체
     * @returns {Vector2}   덧셈 결과 Vector2 객체
     */
    add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    /**
     * Vector 뺄셈
     *
     * @param {Vector2} v   뺄 Vector2 객체
     * @returns {Vector2}   뺄셈 결과 Vector2 객체
     */
    subtract(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    /**
     * Vector 스칼라 곱셈
     *
     * @param {number} scalar   곱할 스칼라 값
     * @returns {Vector2}       곱셈 결과 Vector2 객체
     */
    multiplyScalar(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    /**
     * Dot Product (내적)
     *
     * @param {Vector2} v   곱할 Vector2 객체
     * @returns {number}    내적 결과 값
     */
    dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Vector 길이 계산
     *
     * @returns {number}   Vector 길이
     */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Vector 정규화
     *
     * @returns {Vector2}   정규화된 Vector2 객체
     */
    normalize(): Vector2 {
        const len = this.length();
        if (len === 0) return new Vector2(0, 0);

        return new Vector2(this.x / len, this.y / len);
    }

    /**
     * 배열 to Vector
     *
     * @static
     * @param {number[]} arr  길이가 2인 배열 [x, y]
     * @returns {Vector2}     Vector2 객체
     */
    static fromArray(arr: number[]): Vector2 {
        if (arr.length !== 2) {
            throw new Error(
                "Array must have exactly 2 elements to convert to Vector2.",
            );
        }

        return new Vector2(arr[0], arr[1]);
    }

    /**
     * Vector2를 배열로 변환
     *
     * @returns {number[]} 길이가 2인 배열 [x, y]
     */
    toArray(): [number, number] {
        return [this.x, this.y];
    }

    /**
     * Vector2를 객체로 변환
     *
     * @returns {{ x: number; y: number }} x와 y 속성을 가진 객체
     */
    toObject(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }
}
