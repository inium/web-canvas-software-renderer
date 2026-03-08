import type Vector4 from "./Vector4";

/**
 * 평면(Plane) 클래스
 * - 평면 방정식: ax + by + cz + dw = 0
 * - 평면의 일반 벡터(normal vector)는 (a, b, c)로 표현되고, d는 평면과 원점 사이의 거리를 나타냄
 * - x, y, z는 평면 상의 점의 좌표를 나타내며, w는 동차 좌표에서 사용되는 요소로 일반적으로 1로 설정됨
 * - d가 양수이면 평면이 원점에서 멀어지는 방향으로 위치하고, d가 음수이면 원점에서 가까워지는 방향으로 위치함
 * - 평면과 점 사이의 거리는 distanceToPoint 메서드를 통해 계산할 수 있음
 * - 이 클래스는 주로 클리핑 알고리즘에서 사용됨
 *
 * @export
 * @class Plane
 * @typedef {Plane}
 */
export default class Plane {
    /**
     * 평면의 일반 벡터 (a, b, c)와 d 값 중 a값
     *
     * @type {number}
     */
    a: number;

    /**
     * 평면의 일반 벡터 (a, b, c)와 d 값 중 b값
     *
     * @type {number}
     */
    b: number;

    /**
     * 평면의 일반 벡터 (a, b, c)와 d 값 중 c값
     *
     * @type {number}
     */
    c: number;

    /**
     * 평면의 일반 벡터 (a, b, c)와 d 값 중 d값
     *
     * @type {number}
     */
    d: number;

    /**
     * Constructor
     *
     * @constructor
     * @param {number} a 평면의 일반 벡터 (a, b, c)와 d 값 중 a값
     * @param {number} b 평면의 일반 벡터 (a, b, c)와 d 값 중 b값
     * @param {number} c 평면의 일반 벡터 (a, b, c)와 d 값 중 c값
     * @param {number} d 평면의 일반 벡터 (a, b, c)와 d 값 중 d값
     */
    constructor(a: number, b: number, c: number, d: number) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }

    /**
     * 평면과 점 사이의 거리 계산
     * - 점이 평면 위에 있으면 0, 평면의 앞쪽에 있으면 양수, 평면의 뒤쪽에 있으면 음수 값을 반환
     *
     * @param {Vector4} v 4D 벡터 (x, y, z, w) 형태의 점 정보
     * @returns {number} 평면과 점 사이의 거리
     */
    distanceToPoint(v: Vector4): number {
        return this.a * v.x + this.b * v.y + this.c * v.z + this.d * v.w;
    }
}
