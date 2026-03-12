import type Vector3 from "./Vector3";

/**
 * 4x4 Matrix(행렬) 클래스
 *
 * @export
 * @class Matrix4x4
 * @typedef {Matrix4x4}
 */
export default class Matrix4x4 {
    /**
     * 행렬 요소 배열
     *
     * @type {number[]}
     */
    elements: number[];

    /**
     * Creates an instance of Matrix4x4.
     *
     * | 00 01 02 03 |
     * | 10 11 12 13 |
     * | 20 21 22 23 |
     * | 30 31 32 33 |
     *
     * @constructor
     * @param {number[]} elements   16개의 요소를 가진 배열 (열 우선 순서)
     */
    constructor(elements: number[] | null = null) {
        if (elements && elements.length === 16) {
            this.elements = elements;
        } else {
            // 단위 행렬 (identity) 로 초기화
            // prettier-ignore
            this.elements = [
                1, 0, 0, 0, // 00 01 02 03
                0, 1, 0, 0, // 10 11 12 13
                0, 0, 1, 0, // 20 21 22 23
                0, 0, 0, 1  // 30 31 32 33
            ];
        }
    }

    /**
     * 4x4 행렬 곱셈
     *
     * @param {Matrix4x4} m   곱할 Matrix4x4 객체
     * @returns {Matrix4x4}   곱셈 결과 Matrix4x4 객체
     */
    multiply(m44: Matrix4x4): Matrix4x4 {
        const a = this.elements;
        const b = m44.elements;
        const result = new Array<number>(16).fill(0);

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                for (let k = 0; k < 4; k++) {
                    result[row * 4 + col] += a[row * 4 + k] * b[k * 4 + col];
                }
            }
        }

        return new Matrix4x4(result);
    }

    /**
     * 4x1 벡터와의 곱셈
     *
     * | 00 01 02 03 | | x |
     * | 10 11 12 13 | | y |
     * | 20 21 22 23 | | z |
     * | 30 31 32 33 | | w |
     *
     * @param {Vector3} v   곱할 Vector3 객체
     * @return {number[]}   곱셈 결과 배열 [x, y, z, w]
     */
    multiplyVector(v: Vector3): [number, number, number, number] {
        const e = this.elements;
        const x = v.x,
            y = v.y,
            z = v.z,
            w = 1;

        return [
            e[0] * x + e[1] * y + e[2] * z + e[3] * w, // x
            e[4] * x + e[5] * y + e[6] * z + e[7] * w, // y
            e[8] * x + e[9] * y + e[10] * z + e[11] * w, // z
            e[12] * x + e[13] * y + e[14] * z + e[15] * w, // w
        ];
    }

    /**
     * 단위 행렬 생성
     *
     * | 1 0 0 0 |
     * | 0 1 0 0 |
     * | 0 0 1 0 |
     * | 0 0 0 1 |
     *
     * @static
     * @returns {Matrix4x4}   단위 행렬 Matrix4x4 객체
     */
    static identity(): Matrix4x4 {
        return new Matrix4x4();
    }

    /**
     * 이동 행렬 생성
     *
     * | 1 0 0 tx |
     * | 0 1 0 ty |
     * | 0 0 1 tz |
     * | 0 0 0 1  |
     *
     * @static
     * @param {number} tx   x축 이동 거리
     * @param {number} ty   y축 이동 거리
     * @param {number} tz   z축 이동 거리
     * @returns {Matrix4x4} 이동 행렬 Matrix4x4 객체
     */
    static translation(tx: number, ty: number, tz: number): Matrix4x4 {
        // prettier-ignore
        return new Matrix4x4([
            1, 0, 0, tx,
            0, 1, 0, ty,
            0, 0, 1, tz,
            0, 0, 0, 1
        ]);
    }

    /**
     * 스케일링 행렬 생성
     *
     * | sx 0  0  0 |
     * | 0  sy 0  0 |
     * | 0  0  sz 0 |
     * | 0  0  0  1 |
     *
     * @static
     * @param {number} sx   x축 스케일링 값
     * @param {number} sy   y축 스케일링 값
     * @param {number} sz   z축 스케일링 값
     * @returns {Matrix4x4} 스케일링 행렬 Matrix4x4 객체
     */
    static scale(sx: number, sy: number, sz: number): Matrix4x4 {
        // prettier-ignore
        return new Matrix4x4([
            sx, 0,  0,  0,
            0,  sy, 0,  0,
            0,  0,  sz, 0,
            0,  0,  0,  1,
        ]);
    }

    /**
     * X축 회전 행렬 생성 (Pitch)
     *
     * | 1    0       0      0 |
     * | 0   cosθ   -sinθ    0 |
     * | 0   sinθ    cosθ    0 |
     * | 0    0       0      1 |
     *
     * @static
     * @param {number} deg   도 단위의 회전 각도
     * @returns {Matrix4x4} X축 회전 행렬 Matrix4x4 객체
     */
    static rotationX(deg: number): Matrix4x4 {
        const rad = (deg * Math.PI) / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);

        // prettier-ignore
        return new Matrix4x4([
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1,
        ]);
    }

    /**
     * Y축 회전 행렬 생성 (Yaw)
     *
     * |  cosθ   0   sinθ   0 |
     * |   0     1    0     0 |
     * | -sinθ   0   cosθ   0 |
     * |   0     0    0     1 |
     *
     * @static
     * @param {number} deg    도 단위의 회전 각도
     * @returns {Matrix4x4}   Y축 회전 행렬 Matrix4x4 객체
     */
    static rotationY(deg: number): Matrix4x4 {
        const rad = (deg * Math.PI) / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);

        // prettier-ignore
        return new Matrix4x4([
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1,
        ]);
    }

    /**
     * Z축 회전 행렬 생성 (Roll)
     *
     * | cosθ  -sinθ   0   0 |
     * | sinθ   cosθ   0   0 |
     * |  0      0     1   0 |
     * |  0      0     0   1 |
     *
     * @static
     * @param {number} deg    도 단위의 회전 각도
     * @returns {Matrix4x4} Z축 회전 행렬 Matrix4x4 객체
     */
    static rotationZ(deg: number): Matrix4x4 {
        const rad = (deg * Math.PI) / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);

        // prettier-ignore
        return new Matrix4x4([
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]);
    }

    /**
     * 뷰 행렬 생성 (LookAt 행렬)
     *
     * @static
     * @param {Vector3} eye   카메라 위치 벡터
     * @param {Vector3} at    카메라가 바라보는 목표 지점 벡터
     * @param {Vector3} up    카메라의 업 벡터
     * @returns {Matrix4x4}   뷰 행렬 Matrix4x4 객체
     */
    static lookAt(eye: Vector3, at: Vector3, up: Vector3): Matrix4x4 {
        const zAxis = eye.subtract(at).normalize();
        const xAxis = up.cross(zAxis).normalize();
        const yAxis = zAxis.cross(xAxis);

        // prettier-ignore
        return new Matrix4x4([
            xAxis.x, yAxis.x, zAxis.x, -xAxis.dot(eye),
            xAxis.y, yAxis.y, zAxis.y, -yAxis.dot(eye),
            xAxis.z, yAxis.z, zAxis.z, -zAxis.dot(eye),
            0,       0,       0,       1,
        ]);
    }

    /**
     * 원근 투영 행렬 생성
     *
     * | f/aspect  0             0                        0           |
     * |   0       f             0                        0           |
     * |   0       0   (far+near)/(near-far)  (2*far*near)/(near-far) |
     * |   0       0            -1                        0           |
     *
     * 여기서 f = 1/tan(fov/2)
     *
     * @static
     * @param {number} fovDeg      시야각 (도 단위)
     * @param {number} aspect   종횡비 (화면 너비/높이)
     * @param {number} near     근평면 거리
     * @param {number} far      원평면 거리
     * @returns {Matrix4x4}     원근 투영 행렬 Matrix4x4 객체
     */
    static perspective(
        fovDeg: number,
        aspect: number,
        near: number,
        far: number,
    ): Matrix4x4 {
        const rad = (fovDeg * Math.PI) / 180;
        const fov = rad;
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);

        // prettier-ignore
        return new Matrix4x4([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, (2 * far * near) * nf,
            0, 0, -1, 0,
        ]);
    }
}
