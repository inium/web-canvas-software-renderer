/**
 * 3차원 Vector 클래스
 *
 * @export
 * @class Vector3
 * @typedef {Vector3}
 */
export default class Vector3 {
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
     * Creates an instance of Vector3.
     *
     * @constructor
     * @param {number} [x=0]  X 좌표
     * @param {number} [y=0]  Y 좌표
     * @param {number} [z=0]  Z 좌표
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Vector 덧셈
     *
     * @param {Vector3} v   더할 Vector3 객체
     * @returns {Vector3}   덧셈 결과 Vector3 객체
     */
    add(v: Vector3): Vector3 {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    /**
     * Vector 뺄셈
     *
     * @param {Vector3} v   뺄 Vector3 객체
     * @returns {Vector3}   뺄셈 결과 Vector3 객체
     */
    subtract(v: Vector3): Vector3 {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    /**
     * Vector 스칼라 곱셈
     *
     * @param {number} scalar   곱할 스칼라 값
     * @returns {Vector3}       곱셈 결과 Vector3 객체
     */
    multiplyScalar(scalar: number): Vector3 {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    /**
     * Dot Product (내적)
     *
     * @param {Vector3} v   곱할 Vector3 객체
     * @returns {number}    내적 결과 값
     */
    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Cross Product (벡터 외적)
     *
     * @param {Vector3} v   곱할 Vector3 객체
     * @returns {Vector3}   외적 결과 Vector3 객체
     */
    cross(v: Vector3): Vector3 {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x,
        );
    }

    /**
     * 벡터 길이 계산
     *
     * @returns {number}   벡터 길이
     */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * 벡터 정규화
     *
     * @returns {Vector3}   정규화된 벡터
     */
    normalize(): Vector3 {
        const len = this.length();
        if (len === 0) {
            return new Vector3(0, 0, 0);
        }

        return this.multiplyScalar(1 / len);
    }

    /**
     * 배열 to Vector
     *
     * @static
     * @param {number[]} arr  길이가 3인 배열 [x, y, z]
     * @returns {Vector3}     Vector3 객체
     */
    static fromArray(arr: number[]): Vector3 {
        if (arr.length !== 3) {
            throw new Error(
                "Array must have exactly 3 elements to convert to Vector3.",
            );
        }

        return new Vector3(arr[0], arr[1], arr[2]);
    }

    /**
     * Vector3를 배열로 변환
     *
     * @returns {number[]} 길이가 3인 배열 [x, y, z]
     */
    toArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    /**
     * Vector3를 객체로 변환
     *
     * @returns {{ x: number; y: number; z: number }} x, y, z 속성을 가진 객체
     */
    toObject(): { x: number; y: number; z: number } {
        return { x: this.x, y: this.y, z: this.z };
    }
}
