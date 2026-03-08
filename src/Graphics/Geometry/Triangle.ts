import Color from "../Common/Color";
import Point from "./Point";

export default class Triangle {
    /**
     * 삼각형의 세 꼭짓점 정보 중 첫 번째 꼭짓점 (2D 위치, 깊이, 색상)
     *
     * @type {Point}
     */
    p0: Point;

    /**
     * 삼각형의 세 꼭짓점 정보 중 두 번째 꼭짓점 (2D 위치, 깊이, 색상)
     *
     * @type {Point}
     */
    p1: Point;

    /**
     * 삼각형의 세 꼭짓점 정보 중 세 번째 꼭짓점 (2D 위치, 깊이, 색상)
     *
     * @type {Point}
     */
    p2: Point;

    /**
     * Constructor
     *
     * @constructor
     * @param {Point} p0   삼각형의 세 꼭짓점 정보 중 첫 번째 꼭짓점 (2D 위치, 깊이, 색상)
     * @param {Point} p1   삼각형의 세 꼭짓점 정보 중 두 번째 꼭짓점 (2D 위치, 깊이, 색상)
     * @param {Point} p2   삼각형의 세 꼭짓점 정보 중 세 번째 꼭짓점 (2D 위치, 깊이, 색상)
     */
    constructor(p0: Point, p1: Point, p2: Point) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
    }

    /**
     * 삼각형 면적 계산
     * - 삼각형의 세 꼭짓점 좌표를 이용하여 면적을 계산
     * - 면적 계산 공식: A = 0.5 * |(x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2))|
     * - 이 공식은 벡터의 외적을 이용하여 삼각형의 면적을 구하는 방법
     * - 면적이 0이면 세 점이 일직선상에 있다는 의미이며, 양수이면 시계 방향, 음수이면 반시계 방향으로 정렬된 삼각형임을 나타냄
     *
     * @returns {number} 삼각형의 면적
     */
    barycentricArea() {
        const p1 = this.p1.position;
        const p2 = this.p2.position;
        const p0 = this.p0.position;

        // return (
        //     Math.abs(
        //         (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y),
        //     ) * 0.5
        // );

        return (
            ((p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y)) *
            0.5
        );
    }

    /**
     * 바리센트릭 좌표를 이용하여 삼각형 내부의 특정 위치에서 색상 보간
     * - 바리센트릭 좌표 (u, v)는 삼각형의 세 꼭짓점에 대한 가중치로 사용되며, u + v <= 1을 만족해야 함
     * - 보간된 색상은 세 꼭짓점의 색상과 바리센트릭 좌표를 이용하여 계산됨
     * - 보간 공식: C = C0 * w + C1 * u + C2 * v, 여기서 w = 1 - u - v
     * - 이 방법을 사용하면 삼각형 내부의 어떤 점에서도 색상을 정확하게 계산할 수 있으며, 이를 통해 부드러운 그라데이션 효과를 얻을 수 있음
     * - 바리센트릭 좌표는 삼각형의 면적과 관련이 있으며, 삼각형의 세 꼭짓점에 대한 상대적인 위치를 나타냄
     * - 바리센트릭 좌표를 이용한 색상 보간은 소프트웨어 렌더링에서 매우 중요한 기술로, 픽셀 단위로 삼각형을 채울 때 사용됨
     *
     * @param {number} u    바리센트릭 좌표 u (0 <= u <= 1)
     * @param {number} v    바리센트릭 좌표 v (0 <= v <= 1)
     * @param {number} w    바리센트릭 좌표 w (w = 1 - u - v)
     * @return {Color}      보간된 색상 (RGBA)
     */
    getColorAtBarycentric(u: number, v: number, w: number): Color {
        // const w = 1 - u - v;
        const c0 = this.p0.color;
        const c1 = this.p1.color;
        const c2 = this.p2.color;

        const r = c0.r * w + c1.r * u + c2.r * v;
        const g = c0.g * w + c1.g * u + c2.g * v;
        const b = c0.b * w + c1.b * u + c2.b * v;
        const a = c0.a * w + c1.a * u + c2.a * v;

        return new Color(r, g, b, a);
    }
}
