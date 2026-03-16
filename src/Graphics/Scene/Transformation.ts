import Matrix4x4 from "../Math/Matrix4x4";
import Vector3 from "../Math/Vector3";
import MathUtil from "../Math/Util";

export default class Transformation {
    /**
     * 객체의 위치, 회전, 크기 정보
     *
     * @type {Vector3}
     */
    translation: Vector3;

    /**
     * 객체의 회전 정보 (deg)
     *
     * @type {Vector3}
     */
    rotation: Vector3;

    /**
     * 객체의 크기 정보
     *
     * @type {Vector3}
     */
    scale: Vector3;

    /**
     * Constructor
     *
     * @constructor
     * @param {Vector3} translation 객체의 위치 정보
     * @param {Vector3} rotation 객체의 회전 정보 (deg)
     * @param {Vector3} scale 객체의 크기 정보
     */
    constructor(
        translation: Vector3 = new Vector3(0, 0, 0),
        rotation: Vector3 = new Vector3(0, 0, 0),
        scale: Vector3 = new Vector3(1, 1, 1),
    ) {
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
    }

    /**
     * 모델 행렬 계산
     *
     * @returns {Matrix4x4} 모델 행렬
     */
    modelMatrix(): Matrix4x4 {
        const t = Matrix4x4.translation(
            this.translation.x,
            this.translation.y,
            this.translation.z,
        );

        const rx = Matrix4x4.rotationX(
            MathUtil.validateDegree(this.rotation.x),
        );
        const ry = Matrix4x4.rotationY(
            MathUtil.validateDegree(this.rotation.y),
        );
        const rz = Matrix4x4.rotationZ(
            MathUtil.validateDegree(this.rotation.z),
        );
        const s = Matrix4x4.scale(this.scale.x, this.scale.y, this.scale.z);

        // 모델 기준 로컬 좌표에서 회전: yaw(Y) -> pitch(X) -> roll(Z) 순으로 회전 적용
        return t.multiply(ry).multiply(rx).multiply(rz).multiply(s);
    }
}
