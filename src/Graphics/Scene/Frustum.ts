import Matrix4x4 from "../Math/Matrix4x4";

export default class Frustum {
    /**
     * 시야각 (Field of View) (fovY)
     *
     * @type {number}
     */
    fov: number;

    /**
     * 종횡비 (Aspect Ratio) (aspect ratio = width / height)
     *
     * @type {number}
     */
    aspect: number;

    /**
     * 근평면 거리 (Near Plane Distance) (zNear)
     *
     * @type {number}
     */
    near: number;

    /**
     * 원평면 거리 (Far Plane Distance) (zFar)
     *
     * @type {number}
     */
    far: number;

    /**
     * Creates an instance of Frustum.
     *
     * @constructor
     * @param {number} fov    시야각 (Field of View)
     * @param {number} aspect 종횡비 (Aspect Ratio)
     * @param {number} near   근평면 거리 (Near Plane Distance)
     * @param {number} far    원평면 거리 (Far Plane Distance)
     */
    constructor(fov: number, aspect: number, near: number, far: number) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    /**
     * 원근 투영 행렬 계산
     *
     * @returns {Matrix4x4} 원근 투영 행렬
     */
    perspectiveMatrix(): Matrix4x4 {
        return Matrix4x4.perspective(
            this.fov,
            this.aspect,
            this.near,
            this.far,
        );
    }
}
