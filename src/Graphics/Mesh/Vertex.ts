import Vector3 from "../Math/Vector3";
import Vector2 from "../Math/Vector2";

export default class Vertex {
    position: Vector3;
    normal: Vector3;
    uv: Vector2;

    /**
     * Creates an instance of Vertex.
     *
     * @constructor
     * @param {Vector3}                                     정점의 위치 정보
     * @param {Vector3} [normal=new Vector3(0, 0, 0)]       정점의 법선 벡터 정보
     * @param {Vector2} [uv=new Vector2(0, 0)]              정점의 UV 좌표 정보 (u, v 형태)
     */
    constructor(
        position: Vector3,
        normal: Vector3 = new Vector3(0, 0, 0),
        uv: Vector2 = new Vector2(0, 0),
    ) {
        this.position = position;
        this.normal = normal;
        this.uv = uv;
    }
}
