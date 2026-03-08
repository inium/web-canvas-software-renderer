export default class Util {
    /**
     * 선형 보간 함수
     * - a와 b 사이의 값을 t에 따라 보간하여 반환
     * - t가 0이면 a, t가 1이면 b, t가 0.5이면 a와 b의 중간 값을 반환
     *
     * @param {number} a 시작 값
     * @param {number} b 끝 값
     * @param {number} t 보간 계수 (0.0에서 1.0 사이)
     * @returns {number} 보간된 값
     */
    static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    /**
     * 2D 점들의 바운딩 박스 계산
     * - 주어진 점들 중 최소 x, 최대 x, 최소 y, 최대 y 값을 계산하여 반환
     *
     * @param {{ x: number; y: number }[]} points 2D 점들의 배열
     * @returns {{ minX: number; maxX: number; minY: number; maxY: number }} 바운딩 박스 정보
     */
    static boundingBox2D(points: { x: number; y: number }[]): {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    } {
        let minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity;

        for (const p of points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }

        return { minX, maxX, minY, maxY };
    }
}
