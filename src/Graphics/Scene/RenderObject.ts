import Mesh from "../Mesh/Mesh";
import Material from "./Material";
import Transformation from "./Transformation";

export default class RenderObject {
    /**
     * 메시 (Mesh)
     *
     * @type {Mesh}
     */
    mesh: Mesh;

    /**
     * 재질 (Material)
     *
     * @type {Material}
     */
    material: Material = new Material();

    /**
     * 객체의 위치, 회전, 크기 정보
     *
     * @type {Transformation}
     */
    transformation: Transformation = new Transformation();

    /**
     * 텍스처 (Texture)
     *
     * @type {Texture | null}
     */
    // texture: Texture | null = null;

    /**
     * Constructor
     *
     * @constructor
     * @param {Mesh} mesh 메시 (Mesh)
     * @param {Material} [material=null] 재질 (Material, 기본값은 null)
     * @param {Texture} [texture=null] 텍스처 (Texture, 기본값은 null)
     */
    constructor(
        mesh: Mesh,
        material: Material | null = null,
        // public texture: Texture | null = null,
    ) {
        this.mesh = mesh;
        if (material) {
            this.material = material;
        }
    }
}
