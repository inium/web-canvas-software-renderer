import Mesh from "../Mesh/Mesh";
import Vector3 from "../Math/Vector3";
import Matrix4x4 from "../Math/Matrix4x4";

export default class RenderObject {
    /**
     * 메시 (Mesh)
     *
     * @type {Mesh}
     */
    mesh: Mesh;

    /**
     * 위치 (Translation)
     *
     * @type {Vector3}
     */
    position: Vector3 = new Vector3(0, 0, 0);

    /**
     * 회전 (Rotation, deg)
     *
     * @type {Vector3}
     */
    rotation: Vector3 = new Vector3(0, 0, 0); // deg: x,y,z

    /**
     * 크기 (Scale)
     *
     * @type {Vector3}
     */
    scale: Vector3 = new Vector3(1, 1, 1);

    /**
     * 텍스처 (Texture)
     *
     * @type {Texture | null}
     */
    // texture: Texture | null = null;

    constructor(
        mesh: Mesh,
        // public texture: Texture | null = null,
    ) {
        this.mesh = mesh;
    }

    /**
     * 모델 행렬 계산
     *
     * @returns {Matrix4x4} 모델 행렬
     */
    modelMatrix(): Matrix4x4 {
        const t = Matrix4x4.translation(
            this.position.x,
            this.position.y,
            this.position.z,
        );

        const rx = Matrix4x4.rotationX(this.validateDegree(this.rotation.x));
        const ry = Matrix4x4.rotationY(this.validateDegree(this.rotation.y));
        const rz = Matrix4x4.rotationZ(this.validateDegree(this.rotation.z));
        const s = Matrix4x4.scale(this.scale.x, this.scale.y, this.scale.z);

        return t.multiply(rz).multiply(ry).multiply(rx).multiply(s);
    }

    /**
     * 회전 각도를 0~360 범위로 조정하는 유틸리티 함수
     *
     * @param {number} deg 회전 각도 (deg)
     * @returns {number} 0~360 범위로 조정된 회전 각도
     */
    private validateDegree(deg: number): number {
        // 회전 값이 0~360 범위를 벗어나지 않도록 조정
        let normalizedDeg = deg % 360;
        if (normalizedDeg < 0) {
            normalizedDeg += 360;
        }
        return normalizedDeg;
    }
}
