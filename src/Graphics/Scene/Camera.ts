import Vector3 from "../Math/Vector3";
import Matrix4x4 from "../Math/Matrix4x4";
import Frustum from "./Frustum";

export default class Camera {
    /**
     * 카메라 위치 벡터
     *
     * @type {Vector3}
     */
    eye: Vector3 = new Vector3(0, 0, 5); // 기본값: (0, 0, 5)

    /**
     * 카메라가 바라보는 지점 벡터
     *
     * @type {Vector3}
     */
    at: Vector3 = new Vector3(0, 0, 0); // 기본값: (0, 0, 0)

    /**
     * 카메라의 상향 벡터
     *
     * @type {Vector3}
     */
    up: Vector3 = new Vector3(0, 1, 0); // 기본값: (0, 1, 0)

    /**
     * 카메라의 프러스텀 정보
     *
     * @type {Frustum}
     */
    frustum: Frustum;

    /**
     * Creates an instance of Camera.
     *
     * @constructor
     * @param {Vector3} eye   카메라 위치 벡터
     * @param {Vector3} at    카메라가 바라보는 지점 벡터
     * @param {Frustum} frustum 카메라의 프러스텀 정보
     */
    constructor(eye: Vector3, at: Vector3, frustum: Frustum) {
        this.setValues(eye, at);
        this.frustum = frustum;
    }

    /**
     * 카메라의 위치, 바라보는 지점, 상향 벡터 설정
     *
     * @param {Vector3} eye 카메라 위치 벡터
     * @param {Vector3} at  카메라가 바라보는 지점 벡터
     * @return {void}
     */
    setValues(eye: Vector3, at: Vector3): void {
        this.eye = eye;
        this.at = at;
        this.calculateUpVector(eye, at);
    }

    /**
     * 카메라의 상향 벡터 계산
     *
     * @param {Vector3} eye 카메라 위치 벡터
     * @param {Vector3} at  카메라가 바라보는 지점 벡터
     * @return {void}
     */
    private calculateUpVector(eye: Vector3, at: Vector3): void {
        const forward = at.subtract(eye).normalize();
        const right = forward.cross(new Vector3(0, 1, 0)).normalize();
        this.up = right.cross(forward).normalize();
    }

    /**
     * 카메라의 뷰 행렬 계산
     *
     * @returns {Matrix4x4} 카메라의 뷰 행렬
     */
    viewMatrix(): Matrix4x4 {
        return Matrix4x4.lookAt(this.eye, this.at, this.up);
    }

    /**
     * 카메라의 투영 행렬 계산
     *
     * @returns {Matrix4x4} 카메라의 투영 행렬
     */
    projectionMatrix(): Matrix4x4 {
        return this.frustum.perspectiveMatrix();
    }
}
